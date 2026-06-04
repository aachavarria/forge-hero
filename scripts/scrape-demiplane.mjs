// Scrapes Daggerheart content cards from Demiplane's listing-search API
// (the Algolia proxy behind app.demiplane.com) and downloads the card art.
//
//   node scripts/scrape-demiplane.mjs                 # all collections, with images
//   node scripts/scrape-demiplane.mjs domains         # one collection
//   node scripts/scrape-demiplane.mjs --no-images     # JSON only
//
// No auth required. We drop the source filter so unreleased content (e.g. the
// Blood/Dread domains from The Void) is included too.
//
// Dedup: the index carries both the current released card (slug "foo", real art)
// AND its old playtest twin (slug "foo-playtest", generic art). We collapse them
// by base slug, preferring the released entry, so each ability/element appears
// once with the best art available.
//
// Output per collection <c>:
//   data/<c>-cards.json
//   data/<c>-cards/images/<group>/<slug>.<ext>   (only when real art exists)

import { writeFile, mkdir, rm } from "node:fs/promises";
import { createWriteStream } from "node:fs";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import path from "node:path";

const ENDPOINT =
  "https://app.demiplane.com/api/listing-search?nexusSlug=daggerheart";
const ROOT = path.resolve(import.meta.dirname, "..");
const DATA_DIR = path.join(ROOT, "data");

const HEADERS = {
  "Content-Type": "application/json",
  Accept: "application/json",
  Origin: "https://app.demiplane.com",
  Referer: "https://app.demiplane.com/",
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
};

// group(card) -> subfolder used to organize images. "" = flat.
const COLLECTIONS = {
  domains: {
    index: "daggerheart_domain_name_asc",
    extras: ["domain", "level", "type", "stressCost", "alwaysInLoadout"],
    group: (c) => c.domain,
  },
  subclasses: {
    index: "daggerheart_subclass_name_asc",
    extras: ["class", "domains", "type", "baseSubclass"],
    group: (c) => c.class,
  },
  communities: {
    index: "daggerheart_community_name_asc",
    extras: ["campaignFrame"],
    group: () => "",
  },
  ancestries: {
    index: "daggerheart_ancestry_name_asc",
    extras: ["campaignFrame"],
    group: () => "",
  },
};

const PLACEHOLDER = "playtest-card.jpg"; // generic "no art yet" image

async function fetchAll(index) {
  const body = {
    requests: [
      {
        indexName: index,
        params: { hitsPerPage: 1000, maxValuesPerFacet: 1000, page: 0, query: "" },
      },
    ],
  };
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${index}: HTTP ${res.status}`);
  // Algolia sometimes embeds raw control chars in HTML, which is invalid JSON;
  // replace them with spaces before parsing.
  const text = await res.text();
  return JSON.parse(text.replace(/[\x00-\x1f]/g, " ")).results[0].hits;
}

// Strip HTML tags + the trailing artist/copyright credit lines, keep rules text.
function htmlToText(html) {
  if (!html) return "";
  return html
    .split(/<p[^>]*class="[^"]*Credit-Text[^"]*"[^>]*>.*?<\/p>/gis)
    .join("")
    .replace(/<\/p>\s*<p[^>]*>/gi, "\n\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&rsquo;/g, "’")
    .replace(/&lsquo;/g, "‘")
    .replace(/&rdquo;/g, "”")
    .replace(/&ldquo;/g, "“")
    .replace(/&mdash;/g, "—")
    .replace(/&ndash;/g, "–")
    .replace(/&hellip;/g, "…")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

const baseSlug = (slug) => String(slug || "").replace(/-playtest$/, "");
const isPlaytest = (hit) =>
  hit.slug.endsWith("-playtest") || (hit.sources || []).includes("Playtest");
const hasRealArt = (url) => !!url && !url.includes(PLACEHOLDER);

function mapCard(hit, extras) {
  const card = {
    objectID: hit.objectID,
    name: hit.name,
    slug: baseSlug(hit.slug),
    rawSlug: hit.slug,
  };
  for (const k of extras) if (hit[k] !== undefined) card[k] = hit[k];
  if (card.level !== undefined) card.level = Number(card.level);
  if (card.stressCost !== undefined && card.stressCost !== null)
    card.stressCost = Number(card.stressCost);
  card.text = htmlToText(hit.elementDisplay);
  card.shortDescription = hit.shortDescription || "";
  card.longDescription = hit.longDescription || "";
  card.displayHtml = hit.elementDisplay || "";
  card.sources = hit.sources || [];
  card.sourceSlugs = hit.sourceSlugs || [];
  card.imageUrl = hit.elementImage || null;
  card.thumbnailUrl = hit.elementThumbnail || null;
  card.playtestOnly = false; // set during dedup
  card.hasArt = hasRealArt(hit.elementImage);
  card.image = null; // local path, filled after download
  return card;
}

// Collapse "foo" + "foo-playtest" into one, preferring the released entry
// (and, among those, the one that actually has real art).
function dedupe(hits, extras) {
  const groups = new Map();
  for (const hit of hits) {
    const key = baseSlug(hit.slug);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(hit);
  }
  const out = [];
  for (const variants of groups.values()) {
    const score = (h) =>
      (hasRealArt(h.elementImage) ? 2 : 0) + (isPlaytest(h) ? 0 : 1);
    variants.sort((a, b) => score(b) - score(a));
    const card = mapCard(variants[0], extras);
    card.playtestOnly = variants.every(isPlaytest);
    out.push(card);
  }
  return out;
}

const slugify = (s) =>
  String(s || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

async function downloadImage(card, imagesDir, group) {
  const dir = group ? path.join(imagesDir, slugify(group)) : imagesDir;
  await mkdir(dir, { recursive: true });
  const ext = path.extname(new URL(card.imageUrl).pathname) || ".jpg";
  const file = path.join(dir, `${card.slug}${ext}`);
  const res = await fetch(card.imageUrl, {
    headers: { "User-Agent": HEADERS["User-Agent"], Referer: HEADERS.Referer },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  await pipeline(Readable.fromWeb(res.body), createWriteStream(file));
  return path.relative(DATA_DIR, file);
}

async function pMap(items, fn, concurrency = 8) {
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const idx = i++;
      await fn(items[idx]);
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, worker),
  );
}

async function scrapeCollection(name, cfg, withImages) {
  console.log(`\n=== ${name} (${cfg.index}) ===`);
  const hits = await fetchAll(cfg.index);
  const cards = dedupe(hits, cfg.extras).sort((a, b) => {
    const ga = cfg.group(a) || "",
      gb = cfg.group(b) || "";
    if (ga !== gb) return ga.localeCompare(gb);
    if ((a.level || 0) !== (b.level || 0)) return (a.level || 0) - (b.level || 0);
    return a.name.localeCompare(b.name);
  });
  console.log(`  ${hits.length} raw -> ${cards.length} after dedup`);

  const imagesDir = path.join(DATA_DIR, `${name}-cards`, "images");
  if (withImages) {
    await rm(imagesDir, { recursive: true, force: true }); // start clean
    let ok = 0,
      noArt = 0,
      failed = 0;
    await pMap(cards, async (card) => {
      if (!card.hasArt) {
        noArt++;
        return;
      }
      try {
        card.image = await downloadImage(card, imagesDir, cfg.group(card));
        ok++;
      } catch (err) {
        failed++;
        card.hasArt = false;
        console.warn(`  ! ${card.slug}: ${err.message}`);
      }
    });
    console.log(`  images: ${ok} downloaded, ${noArt} without art, ${failed} failed`);
  }

  const out = path.join(DATA_DIR, `${name}-cards.json`);
  await writeFile(out, JSON.stringify(cards, null, 2) + "\n");
  console.log(`  wrote data/${name}-cards.json`);
  return { name, total: cards.length, withArt: cards.filter((c) => c.hasArt).length };
}

async function main() {
  const args = process.argv.slice(2);
  const withImages = !args.includes("--no-images");
  const wanted = args.filter((a) => !a.startsWith("-"));
  const names = wanted.length ? wanted : Object.keys(COLLECTIONS);

  const summary = [];
  for (const name of names) {
    const cfg = COLLECTIONS[name];
    if (!cfg) {
      console.warn(`unknown collection: ${name} (have: ${Object.keys(COLLECTIONS).join(", ")})`);
      continue;
    }
    summary.push(await scrapeCollection(name, cfg, withImages));
  }
  console.log("\n=== summary ===");
  for (const s of summary)
    console.log(`  ${s.name.padEnd(12)} ${s.total} cards, ${s.withArt} with art`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
