// Normalizes the scraped Demiplane card datasets (data/*-cards.json, copied
// into src/data/json) into a single CardRecord shape the UI renders.
//
// Two visual kinds:
//   - flat image  : domain cards ship a fully pre-rendered art JPG (/compendium)
//   - composed    : everything else is rebuilt from `displayHtml` + a banner +
//                   a class divider, themed by class/domain accent color.

import { parseCardHtml } from "./cardHtml";

import domainCards from "@/data/json/domains-cards.json";
import subclassCards from "@/data/json/subclasses-cards.json";
import communityCards from "@/data/json/communities-cards.json";
import ancestryCards from "@/data/json/ancestries-cards.json";

interface RawCard {
  objectID: string;
  name: string;
  slug: string;
  rawSlug: string;
  domain?: string;
  level?: number;
  type?: string;
  stressCost?: number | null;
  class?: string;
  domains?: string[];
  baseSubclass?: string;
  displayHtml?: string;
  sources?: string[];
  image?: string | null;
  hasArt?: boolean;
  playtestOnly?: boolean;
}

export type Collection = "domain" | "subclass" | "community" | "ancestry";

export interface CardRecord {
  id: string;
  collection: Collection;
  name: string;
  slug: string;
  /** Foundation/Specialization/Mastery, or "Spell · Level 3", etc. */
  subtitle: string;
  /** Class (subclasses) or domain (domains); drives theme + filtering. */
  group: string;
  /** Ability | Spell | Grimoire | Foundation | Specialization | Mastery | "" */
  type: string;
  level: number | null;
  /** Recall (stress) cost shown on domain cards; null for other collections. */
  recall: number | null;
  /** lowercase key into the theme + divider maps */
  themeKey: string;
  /** collection tag shown on the card (COMMUNITY / ANCESTRY), or "" */
  badge: string;
  /** true → render `image` as the whole card; false → compose from html */
  flat: boolean;
  /** web URL for the art (flat card or top banner), or null */
  image: string | null;
  /** class divider webp under /cards/dividers, or null */
  divider: string | null;
  /** heraldic class pennant (two domain sigils) for subclass cards, or null */
  pennant: string | null;
  bodyHtml: string;
  credits: string[];
  sources: string[];
  hasArt: boolean;
  playtestOnly: boolean;
}

export interface ThemeColors {
  accent: string;
  accentSoft: string;
  ink: string;
}

// Approximate Daggerheart palette, keyed by lowercase class/domain name.
const THEME: Record<string, ThemeColors> = {
  // domains
  arcana: { accent: "#8a5cd0", accentSoft: "#efe9fa", ink: "#2a1d47" },
  blade: { accent: "#c0392b", accentSoft: "#f9e6e3", ink: "#451513" },
  bone: { accent: "#9c9584", accentSoft: "#f0eee8", ink: "#3a3528" },
  codex: { accent: "#3b7bbf", accentSoft: "#e6eef8", ink: "#16314f" },
  grace: { accent: "#d14b8f", accentSoft: "#fbe7f1", ink: "#4a1834" },
  midnight: { accent: "#5a5fa0", accentSoft: "#e9eaf4", ink: "#21244a" },
  sage: { accent: "#5ba45b", accentSoft: "#e8f2e8", ink: "#1f3d1f" },
  splendor: { accent: "#d9a93f", accentSoft: "#f8efd9", ink: "#473615" },
  valor: { accent: "#e08a3c", accentSoft: "#fbeede", ink: "#4a2c12" },
  blood: { accent: "#9b2a29", accentSoft: "#f4e2e2", ink: "#3a100f" },
  dread: { accent: "#6b4a9b", accentSoft: "#ece6f4", ink: "#251640" },
  // classes
  bard: { accent: "#d9a93f", accentSoft: "#f8efd9", ink: "#473615" },
  druid: { accent: "#5ba45b", accentSoft: "#e8f2e8", ink: "#1f3d1f" },
  guardian: { accent: "#e08a3c", accentSoft: "#fbeede", ink: "#4a2c12" },
  ranger: { accent: "#4e8c5a", accentSoft: "#e7f1ea", ink: "#1d3a26" },
  rogue: { accent: "#7d828c", accentSoft: "#ecedf0", ink: "#2c2f36" },
  seraph: { accent: "#c9a94e", accentSoft: "#f6efdb", ink: "#46380f" },
  sorcerer: { accent: "#c0392b", accentSoft: "#f9e6e3", ink: "#451513" },
  warrior: { accent: "#b23b3b", accentSoft: "#f6e4e4", ink: "#3f1414" },
  wizard: { accent: "#3b7bbf", accentSoft: "#e6eef8", ink: "#16314f" },
  // Void classes
  assassin: { accent: "#5a3e7a", accentSoft: "#ebe6f2", ink: "#241632" },
  witch: { accent: "#6b3fa0", accentSoft: "#ece4f5", ink: "#27143f" },
  brawler: { accent: "#b5612c", accentSoft: "#f6e9dd", ink: "#3f2110" },
  warlock: { accent: "#4c2889", accentSoft: "#e8e1f3", ink: "#1e0f3a" },
  "blood hunter": { accent: "#7a1f2b", accentSoft: "#f1e1e3", ink: "#2e0c11" },
};

const DEFAULT_THEME: ThemeColors = {
  accent: "#d8a94e",
  accentSoft: "#f6efdb",
  ink: "#3a2c12",
};

export function themeFor(key: string): ThemeColors {
  return THEME[key?.toLowerCase()] ?? DEFAULT_THEME;
}

// Classes that have a decorative divider/banner under /cards.
const DIVIDER_CLASSES = new Set([
  "guardian",
  "warrior",
  "ranger",
  "rogue",
  "bard",
  "druid",
  "seraph",
  "sorcerer",
  "wizard",
]);

// Card art is served from the public R2 bucket. NEXT_PUBLIC_R2_BASE overrides
// the base URL (e.g. to swap in a custom CDN domain) and is inlined at build
// time; it defaults to the bucket's r2.dev URL so a fresh clone works as-is.
const R2_BASE = (
  process.env.NEXT_PUBLIC_R2_BASE ??
  "https://pub-d742190c80344b5ba0ce91e48db93c02.r2.dev"
).replace(/\/+$/, "");

const artUrl = (image?: string | null) =>
  image
    ? `${R2_BASE}/${image.split("/").map(encodeURIComponent).join("/")}`
    : null;

function normalize(raw: RawCard, collection: Collection): CardRecord {
  const { html, credits } = parseCardHtml(raw.displayHtml);
  const group =
    collection === "domain"
      ? raw.domain ?? ""
      : collection === "subclass"
        ? raw.class ?? ""
        : collection === "community"
          ? "Community"
          : "Ancestry";

  // Every collection is composed now — the domain "art" JPGs are landscape
  // illustrations (the card's top image), not full pre-rendered cards.
  const flat = false;

  let subtitle = "";
  if (collection === "subclass") subtitle = raw.type ?? "";
  else if (collection === "domain")
    subtitle = [raw.type, raw.level ? `Level ${raw.level}` : null]
      .filter(Boolean)
      .join(" · ");

  const themeKey = (
    collection === "domain"
      ? raw.domain
      : collection === "subclass"
        ? raw.class
        : collection
  )?.toLowerCase() ?? "";

  const dividerKey = collection === "subclass" ? (raw.class ?? "").toLowerCase() : "";
  const domainKey = collection === "domain" ? (raw.domain ?? "").toLowerCase() : "";
  let divider: string | null = null;
  if (collection === "subclass" && DIVIDER_CLASSES.has(dividerKey))
    divider = `/cards/dividers/${dividerKey}.webp`;
  else if (collection === "domain" && domainKey)
    divider = `/cards/dividers/domain-${domainKey}.webp`;
  else if (collection === "community") divider = "/cards/dividers/communities.webp";
  else if (collection === "ancestry") divider = "/cards/dividers/ancestries.webp";

  // Heraldic pennant hanging from the card's top-left corner: subclasses use
  // their class banner; domain cards use their domain banner (carries the level).
  const pennant =
    collection === "subclass" && DIVIDER_CLASSES.has(dividerKey)
      ? `/cards/banners/${dividerKey}.webp`
      : collection === "domain" && domainKey
        ? `/cards/banners/domain-${domainKey}.webp`
        : null;

  const badge =
    collection === "community"
      ? "Community"
      : collection === "ancestry"
        ? "Ancestry"
        : "";

  return {
    id: raw.objectID,
    collection,
    name: raw.name,
    slug: raw.slug,
    subtitle,
    group,
    type: raw.type ?? "",
    level: raw.level ?? null,
    recall:
      collection === "domain" && typeof raw.stressCost === "number"
        ? raw.stressCost
        : null,
    themeKey,
    badge,
    flat,
    image: raw.hasArt ? artUrl(raw.image) : null,
    divider,
    pennant,
    bodyHtml: html,
    credits,
    sources: raw.sources ?? [],
    hasArt: !!raw.hasArt,
    playtestOnly: !!raw.playtestOnly,
  };
}

let cache: CardRecord[] | null = null;

export function getAllCards(): CardRecord[] {
  if (cache) return cache;
  cache = [
    ...(domainCards as unknown as RawCard[]).map((c) => normalize(c, "domain")),
    ...(subclassCards as unknown as RawCard[]).map((c) => normalize(c, "subclass")),
    ...(communityCards as unknown as RawCard[]).map((c) => normalize(c, "community")),
    ...(ancestryCards as unknown as RawCard[]).map((c) => normalize(c, "ancestry")),
  ];
  return cache;
}

export function getCards(collection: Collection): CardRecord[] {
  return getAllCards().filter((c) => c.collection === collection);
}

// ── Lookup by name (to wire cards into the creator steps) ──────────────────

const norm = (s?: string | null) =>
  (s ?? "").replace(/[’']/g, "'").replace(/\s+/g, " ").trim().toLowerCase();

const TIER_RANK: Record<string, number> = {
  Foundation: 0,
  Specialization: 1,
  Mastery: 2,
};

let nameIndex: Map<string, CardRecord[]> | null = null;
function getNameIndex(): Map<string, CardRecord[]> {
  if (nameIndex) return nameIndex;
  const map = new Map<string, CardRecord[]>();
  for (const c of getAllCards()) {
    const key = `${c.collection}|${norm(c.name)}`;
    const bucket = map.get(key);
    if (bucket) bucket.push(c);
    else map.set(key, [c]);
  }
  // Order each bucket: subclass tiers Foundation→Mastery; otherwise art first.
  for (const bucket of map.values()) {
    bucket.sort((a, b) => {
      const ra = TIER_RANK[a.type] ?? (a.hasArt ? 0 : 1);
      const rb = TIER_RANK[b.type] ?? (b.hasArt ? 0 : 1);
      return ra - rb;
    });
  }
  nameIndex = map;
  return map;
}

/** All cards in a collection matching a name (e.g. a subclass's 3 tiers). */
export function findCards(
  collection: Collection,
  name?: string | null,
): CardRecord[] {
  if (!name) return [];
  return getNameIndex().get(`${collection}|${norm(name)}`) ?? [];
}

/** First (best) card in a collection matching a name. */
export function findCard(
  collection: Collection,
  name?: string | null,
): CardRecord | undefined {
  return findCards(collection, name)[0];
}
