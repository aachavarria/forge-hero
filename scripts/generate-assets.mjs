#!/usr/bin/env node
// Genera retratos de CLASES (humanos genéricos, medio cuerpo) y RAZAS/ancestries
// (cuerpo entero) de Daggerheart con Gemini, en el estilo dark-fantasy del app.
//
// La API key NUNCA va por argumento. Se lee de .env.local (o .env), igual que el
// app, o de la variable de entorno GEMINI_API_KEY. Así no queda en tu historial.
//
// Uso:
//   node scripts/generate-assets.mjs --list                 # ver slugs disponibles
//   node scripts/generate-assets.mjs --only warrior         # solo una clase
//   node scripts/generate-assets.mjs --only faun            # solo una raza
//   node scripts/generate-assets.mjs --type class           # las 9 clases
//   node scripts/generate-assets.mjs --type ancestry        # las 18 razas
//   node scripts/generate-assets.mjs                        # todo (27 imágenes)
//   node scripts/generate-assets.mjs --force ...            # re-generar aunque exista
//
// Salida: public/classes/<slug>.png  y  public/ancestries/<slug>.png

import { writeFile, readFile, mkdir, access } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DEFAULT_MODEL = "gemini-2.5-flash-image";

// ── Presets de estilo (fondo atmosférico simple en todos) ───────────────────
// Elige con --style <preset>. El default es el que se use para el batch final.
const STYLES = {
  // World of Warcraft / Blizzard: pintura digital estilizada, heroica.
  wow:
    "Stylized hand-painted fantasy illustration in the style of World of Warcraft " +
    "cinematic key art and Blizzard concept art. Heroic, slightly exaggerated " +
    "proportions, bold chunky stylized silhouettes, painterly hand-painted textures, " +
    "warm saturated colors, strong stylized rim lighting and a moody atmosphere. " +
    "Clearly stylized, NOT photorealistic. Plain dark atmospheric background with soft " +
    "fog and a subtle warm ember-gold glow, no scenery. " +
    "No text, no watermark, no logo, no UI, no border, no frame.",

  // The Mighty Nein / Vox Machina: animación 2D cel-shaded, anime occidental.
  anime:
    "Stylized 2D animated illustration in the style of the Critical Role animated " +
    "series — The Legend of Vox Machina and The Mighty Nein — a Western fantasy anime " +
    "look. Clean confident ink lineart, cel-shaded flat coloring with soft gradient " +
    "accents, expressive stylized features, vibrant colors, cinematic moody lighting. " +
    "Hand-drawn 2D animation, NOT photorealistic and NOT a 3D render. Plain dark " +
    "atmospheric background with a subtle warm glow, no scenery. " +
    "No text, no watermark, no logo, no UI, no border, no frame.",

  // Punto medio: ilustración pintada estilizada tipo key art de película animada.
  blend:
    "Stylized painterly fantasy illustration like animated fantasy film key art — " +
    "semi-realistic but clearly stylized, with clean readable shapes, expressive " +
    "features and rich painterly rendering (not photographic). Warm cinematic " +
    "ember-gold lighting and a moody atmosphere. Plain dark atmospheric background " +
    "with soft fog, no scenery. No text, no watermark, no logo, no UI, no border, no frame.",
};
const DEFAULT_STYLE = "anime";

// ── Pistas visuales por CLASE (renderizadas como HUMANO, medio cuerpo) ──────
const CLASS_HINTS = {
  Bard:
    "A charismatic performer holding a stringed instrument such as a lute or a flute, " +
    "flamboyant colorful layered clothing with ornate trim, a confident charming expression.",
  Druid:
    "A nature mystic in earthy leather and woven-plant garments carrying a gnarled wooden staff, " +
    "leaves, moss and small vines in their hair, faint green nature magic glowing around them, a calm wild gaze.",
  Guardian:
    "A stalwart protector clad in heavy plate armor bearing a large sturdy shield and a heavy weapon, " +
    "a resolute immovable stance, battle-worn but unbroken.",
  Ranger:
    "A wilderness hunter in a practical hooded leather cloak with a longbow and a quiver of arrows, " +
    "weathered traveling gear, an alert watchful gaze.",
  Rogue:
    "A cunning scoundrel in a dark hooded cloak and supple leather armor wielding a pair of daggers, " +
    "half in shadow with faint wisps of shadow magic, a sly knowing smirk.",
  Seraph:
    "A divine warrior-healer in radiant ornate armor with a faint halo of holy light and feathered-wing motifs, " +
    "holding a blessed weapon, warm golden sacred light, a serene yet fierce expression.",
  Sorcerer:
    "An innate spellcaster with raw elemental magic crackling around their hands and arcane light in their eyes, " +
    "flowing dramatic robes, an aura of barely-contained power.",
  Warrior:
    "A battle-hardened fighter in functional well-worn armor gripping a favored sword or polearm, " +
    "old scars, a disciplined confident stance.",
  Wizard:
    "A scholarly mage in layered robes holding an open spellbook or an arcane staff, glowing magical runes " +
    "floating nearby, a wise focused expression, pouches of herbs and potions.",
};

// ── Pistas visuales por RAZA/ancestry (cuerpo entero, vestimenta neutra) ────
const ANCESTRY_HINTS = {
  Clank:
    "A sentient mechanical being constructed of metal, wood and stone with visible joints, gears and bespoke parts, " +
    "glowing eyes, an artisan-crafted humanoid frame.",
  Drakona:
    "A wingless dragon-like humanoid covered in thick overlapping scales, long sharp teeth and draconic features, " +
    "a faint shimmer of elemental breath, large and imposing — no wings.",
  Dwarf:
    "A short stocky humanoid with a square frame and dense musculature, thick braided hair and an elaborately " +
    "styled beard, gemstones embedded in the skin, sturdy and resilient.",
  Elf:
    "A tall graceful humanoid with long pointed ears and keen attuned features, delicate celestial freckles, " +
    "a few leaves or tiny flowers in the hair.",
  Faerie:
    "A small winged humanoid with insectile features — translucent membranous wings, faint compound-eye and " +
    "chitin accents, plant-like coloration — delicate and otherworldly.",
  Faun:
    "A goat-like humanoid with curving horns, square pupils, a humanoid torso and a furred goat lower body ending " +
    "in cloven hooves, caprine ears.",
  Firbolg:
    "A large muscular bovine humanoid with a broad nose, long drooping ears and horns, soft fur in earth tones or " +
    "gentle pastels, a long tail.",
  Fungril:
    "A mushroom humanoid with a fungal cap for a head and mycelial textures across the body, coloration ranging " +
    "from earthy browns to vivid reds, purples and blues.",
  Galapa:
    "An anthropomorphic turtle with a large domed shell on the back, earth-tone green and brown skin, unique carved " +
    "patterns on the shell, slow and sturdy.",
  Giant:
    "A towering humanoid with broad shoulders, long arms and an elongated neck, one to three eyes, naturally " +
    "muscular and imposing.",
  Goblin:
    "A small humanoid with very large expressive eyes and massive membranous ears nearly the size of its head, " +
    "vibrantly colored skin, keen and alert.",
  Halfling:
    "A small cheerful humanoid with large hairy bare feet and prominent rounded ears, a youthful friendly face, " +
    "nose and feet large in proportion.",
  Human:
    "An adaptable humanoid with rounded ears and an endurance-built frame, ordinary features, practical and " +
    "resilient — a classic adventurer.",
  Infernis:
    "A humanoid of demonic descent with sharp canine teeth, pointed ears, two to four ornamented horns and a long " +
    "pointed tail, skin in vivid or stark hues, a faint menacing dread visage.",
  Katari:
    "A feline humanoid with soft fur, retractable claws, vertically slit pupils, high triangular swiveling ears, " +
    "whiskers and often a long tail.",
  Orc:
    "A muscular humanoid with square features and boar-like tusks protruding from the lower jaw (often decorated), " +
    "pointed ears, skin in green, blue, pink or gray tones.",
  Ribbet:
    "An anthropomorphic frog with large protruding eyes on the sides of the head, smooth moist skin, webbed hands " +
    "and feet, coloration from green-brown camouflage to bold vibrant patterns.",
  Simiah:
    "An anthropomorphic monkey or ape with long limbs, prehensile feet and sometimes a prehensile tail, an agile " +
    "athletic build, expressive simian features.",
};

function classPrompt(name, hint, style) {
  return (
    `${style} Half-body character portrait of a generic HUMAN ${name.toLowerCase()}, ` +
    `an adventurer of the ${name} class in a dark-fantasy world. ${hint} ` +
    "Ordinary human anatomy with rounded ears and no non-human creature features. " +
    "Single character, centered, facing the viewer, from the waist up."
  );
}

function ancestryPrompt(name, hint, style) {
  return (
    `${style} Full-body character illustration of a ${name}, a playable ancestry (species) in a ` +
    "dark-fantasy world, standing in a neutral confident pose wearing simple traveling adventurer's " +
    `clothing (no class-specific weapons or heavy armor). ${hint} ` +
    "The entire body is visible from head to feet within the frame. Single character, centered, facing the viewer."
  );
}

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

// ── env loader (.env.local primero, luego .env) ─────────────────────────────
async function loadEnv() {
  for (const file of [".env.local", ".env"]) {
    try {
      const txt = await readFile(join(ROOT, file), "utf8");
      for (const line of txt.split("\n")) {
        const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
        if (!m) continue;
        const key = m[1];
        let val = m[2].trim();
        if (
          (val.startsWith('"') && val.endsWith('"')) ||
          (val.startsWith("'") && val.endsWith("'"))
        ) {
          val = val.slice(1, -1);
        }
        if (val && process.env[key] === undefined) process.env[key] = val;
      }
    } catch {
      /* file may not exist — ignore */
    }
  }
}

async function exists(p) {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

function parseArgs(argv) {
  const o = { type: "all", only: "", force: false, list: false, style: DEFAULT_STYLE, suffix: "" };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--type" || a === "-t") o.type = (argv[++i] || "all").toLowerCase();
    else if (a === "--only" || a === "-o") o.only = slugify(argv[++i] || "");
    else if (a === "--force" || a === "-f") o.force = true;
    else if (a === "--list" || a === "-l") o.list = true;
    else if (a === "--style" || a === "-s") o.style = (argv[++i] || DEFAULT_STYLE).toLowerCase();
    else if (a === "--suffix") o.suffix = argv[++i] || "";
  }
  return o;
}

function buildManifest(style, suffix) {
  const styleText = STYLES[style];
  const items = [];
  for (const [name, hint] of Object.entries(CLASS_HINTS)) {
    items.push({
      kind: "class",
      name,
      slug: slugify(name),
      prompt: classPrompt(name, hint, styleText),
      out: join(ROOT, "public", "classes", `${slugify(name)}${suffix}.png`),
    });
  }
  for (const [name, hint] of Object.entries(ANCESTRY_HINTS)) {
    items.push({
      kind: "ancestry",
      name,
      slug: slugify(name),
      prompt: ancestryPrompt(name, hint, styleText),
      out: join(ROOT, "public", "ancestries", `${slugify(name)}${suffix}.png`),
    });
  }
  return items;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function generateOne(item, apiKey, model) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  const maxAttempts = 3;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    let res;
    try {
      res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
        body: JSON.stringify({ contents: [{ parts: [{ text: item.prompt }] }] }),
      });
    } catch (e) {
      if (attempt === maxAttempts) throw new Error(`network: ${e?.message ?? e}`);
      await sleep(1500 * attempt);
      continue;
    }

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg = data?.error?.message ?? `HTTP ${res.status}`;
      // 429 / 5xx → reintentar con backoff
      if ((res.status === 429 || res.status >= 500) && attempt < maxAttempts) {
        await sleep(2000 * attempt);
        continue;
      }
      throw new Error(msg);
    }

    const parts = data?.candidates?.[0]?.content?.parts ?? [];
    for (const p of parts) {
      const inline = p.inlineData ?? p.inline_data;
      if (inline?.data) {
        await mkdir(dirname(item.out), { recursive: true });
        await writeFile(item.out, Buffer.from(inline.data, "base64"));
        return true;
      }
    }
    throw new Error("el modelo no devolvió imagen");
  }
  return false;
}

async function main() {
  await loadEnv();
  const opts = parseArgs(process.argv.slice(2));
  if (!STYLES[opts.style]) {
    console.error(
      `Estilo desconocido: "${opts.style}". Opciones: ${Object.keys(STYLES).join(", ")}.`
    );
    process.exit(1);
  }
  const manifest = buildManifest(opts.style, opts.suffix);

  if (opts.list) {
    for (const kind of ["class", "ancestry"]) {
      console.log(`\n${kind.toUpperCase()}S:`);
      console.log(
        manifest
          .filter((i) => i.kind === kind)
          .map((i) => "  " + i.slug)
          .join("\n")
      );
    }
    return;
  }

  let targets = manifest;
  if (opts.type !== "all") targets = targets.filter((i) => i.kind === opts.type);
  if (opts.only) targets = targets.filter((i) => i.slug === opts.only);

  if (targets.length === 0) {
    console.error("No hay objetivos que coincidan. Usa --list para ver slugs.");
    process.exit(1);
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error(
      "Falta GEMINI_API_KEY. Añádela a .env.local (GEMINI_API_KEY=tu_key) y reintenta."
    );
    process.exit(1);
  }
  const model = process.env.GEMINI_IMAGE_MODEL || DEFAULT_MODEL;
  console.error(`Modelo: ${model} · estilo: ${opts.style} · objetivos: ${targets.length}\n`);

  let ok = 0,
    skipped = 0,
    failed = 0;
  for (const item of targets) {
    const label = `${item.kind}/${item.slug}`;
    if (!opts.force && (await exists(item.out))) {
      console.error(`• ${label} — ya existe, omitido (usa --force para rehacer)`);
      skipped++;
      continue;
    }
    process.stderr.write(`• ${label} — generando… `);
    try {
      await generateOne(item, apiKey, model);
      console.error("✓");
      ok++;
    } catch (e) {
      console.error(`✗ ${e?.message ?? e}`);
      failed++;
    }
    await sleep(1200); // espaciado suave para no topar rate limits
  }

  console.error(`\nListo. Generadas: ${ok} · omitidas: ${skipped} · fallidas: ${failed}`);
  if (failed > 0) process.exitCode = 1;
}

main().catch((err) => {
  console.error("Fallo inesperado:", err?.message ?? err);
  process.exit(1);
});
