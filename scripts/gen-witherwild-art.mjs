// ── Genera el arte de la intro The Witherwild ──────────────────────────────
// Llama a Gemini (gemini-2.5-flash-image) UNA vez por escena y guarda los PNG
// en public/witherwild/. Idempotente: salta los que ya existen. Reintenta ante
// errores de red/cuota.
//
//   node --env-file=.env scripts/gen-witherwild-art.mjs
//
// Regenerar una sola escena:
//   rm public/witherwild/10-nikta.png && node --env-file=.env scripts/gen-witherwild-art.mjs
//
// Sin --env-file, el script intenta leer GEMINI_API_KEY de .env / .env.local.

import { mkdir, readFile, writeFile, access } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const OUT_DIR = resolve(ROOT, "public/witherwild");

// ── Carga perezosa de .env / .env.local si la var no viene del entorno ─────
async function loadEnvFallback() {
  if (process.env.GEMINI_API_KEY) return;
  for (const f of [".env.local", ".env"]) {
    try {
      const txt = await readFile(resolve(ROOT, f), "utf8");
      for (const line of txt.split("\n")) {
        const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
        if (m && !process.env[m[1]]) {
          process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
        }
      }
    } catch {
      /* archivo ausente: seguimos */
    }
  }
}

// ── Estilo común a todas las imágenes ──────────────────────────────────────
const STYLE =
  "Painterly cinematic fantasy illustration in the spirit of Studio Ghibli's " +
  "Princess Mononoke and Nausicaa, Jim Henson's The Dark Crystal, and The Legend " +
  "of Zelda. Lush, hand-painted, atmospheric, dramatic volumetric lighting, rich " +
  "detail, a feeling of awe and unease. Widescreen cinematic composition. " +
  "No text, no words, no letters, no UI, no watermark, no signature, no border.";

const PAL = {
  fanewick:
    "Palette: earthy mossy greens, golden light, drifting mist, subtle bioluminescent accents.",
  haven:
    "Palette: cold grey stone, iron, ordered and grim, a serpent motif, hard light.",
  wither:
    "Palette: exaggerated sickly verdant greens, crimson flower-reds, forms that seem to devour.",
  mixed:
    "Palette: a balance of earthy Fanewick greens and cold Haven greys, warm torchlight, muted and atmospheric.",
};

// id -> { subject, palette, aspectRatio }
const PROMPTS = [
  {
    id: "00-cover",
    pal: PAL.wither,
    subject:
      "Key art: an ancient wild forest overrun by corrupted, faintly glowing overgrowth; a colossal owl silhouette looming in the dusk sky above; the sense of a doomed, beautiful paradise.",
  },
  {
    id: "01-fanewick",
    pal: PAL.fanewick,
    subject:
      "A lush untamed primeval forest, golden light through mist, twisting dark trees, a hidden cornucopia of life, beautiful but dangerous, no people.",
  },
  {
    id: "02-wicklings",
    pal: PAL.fanewick,
    subject:
      "The Wicklings: hardy folk of the wild forest, hunters and historians and artisans and families gathered in a small woodland settlement, leather-and-plant garb, weathered determined faces, warm firelight.",
  },
  {
    id: "03-divinities",
    pal: PAL.fanewick,
    subject:
      "Small whimsical incarnate gods and tutelary spirits among the foliage, charming yet uncanny, performing tiny miracles; capricious nature spirits of many odd shapes.",
  },
  {
    id: "04-bogs",
    pal: PAL.fanewick,
    subject:
      "A vast misty bog silently swallowing heavy armor and artillery, a deceptively calm field hiding a deadly mire, half-sunken war machines.",
  },
  {
    id: "05-haven",
    pal: PAL.haven,
    subject:
      "The walled city of Haven: colossal grey stone walls, grim ordered architecture, cold grandeur, distant banners, a fortress city behind a great gate.",
  },
  {
    id: "06-shunaush",
    pal: PAL.haven,
    subject:
      "Shun'Aush the Granite Ophid: a colossal stone serpent deity whose carved remains form the mighty city walls, scales like cut masonry, ominous and god-slain.",
  },
  {
    id: "07-sickness",
    pal: PAL.haven,
    subject:
      "The Serpent's Sickness: citizens slowly petrifying into agonized stone statues mid-motion, cracked snake-skin rash on their skin, fine bone-like dust in the air, a city becoming a graveyard of stone figures.",
  },
  {
    id: "08-ladys-veil",
    pal: PAL.fanewick,
    subject:
      "A sunlit meadow of countless white-petaled flowers with a single rare, vivid crimson bloom standing out among them; the lady's veil, delicate and precious.",
  },
  {
    id: "09-invasion",
    pal: PAL.haven,
    subject:
      "Haven's army marching in ordered ranks into a deep dark forest, banners and torchfire, cold steel against wild nature, an invasion crossing the treeline.",
  },
  {
    id: "10-nikta",
    pal: PAL.fanewick,
    subject:
      "Nikta the Great Owl, a giant cosmic owl-goddess, majestic and wounded, one eye-socket dark and empty, the seasons visibly turning in the sky around her.",
  },
  {
    id: "11-eternal-spring",
    pal: PAL.wither,
    subject:
      "An unnatural endless spring: rampant uncontrolled blossoming everywhere, excessive unsettling beauty with no decay, oppressive overwhelming verdancy under a static sky.",
  },
  {
    id: "12-witherwild",
    pal: PAL.wither,
    subject:
      "The Witherwild unleashed: monstrous overgrowth, trees twisting and reaching as if to hunt, immense beasts with exaggerated tusks and claws, thick vines strangling ruined homes.",
  },
  {
    id: "13-withered",
    pal: PAL.wither,
    subject:
      "A person being corrupted into a Withered hybrid of human and plant-and-beast, their body warping and intertwining with vines and bark, beautiful and horrifying, a fading human gaze.",
  },
  {
    id: "14-day-night",
    pal: PAL.fanewick,
    subject:
      "A split composition of the same forest in long bright day on one side and long deep night on the other, glowing bioluminescent night-bloom flowers lighting the dark half, dual seasons.",
  },
  {
    id: "15-fanewraith",
    pal: PAL.wither,
    subject:
      "A mysterious hooded rebel leader, the Fanewraith, standing in a village built among the treetops, wreathed in shadow and resolve, a secret insurgency at her back.",
  },
  {
    id: "16-kreil",
    pal: PAL.haven,
    subject:
      "Haven's spymaster in dim candlelight among maps and intelligence, shrewd and dangerous, half in shadow; through a window behind him, a distant treetop canopy village.",
  },
  {
    id: "18-communities",
    pal: PAL.mixed,
    subject:
      "An ensemble group portrait of the diverse peoples of this world standing together in a row: forest hunters and lorekeepers of Fanewick, grim Haven soldiers, weathered seafarers, hooded rebels, and wandering nomads; varied faces, garb and bearing, a wide lineup composition.",
  },
  {
    id: "19-ancestries",
    pal: PAL.mixed,
    subject:
      "An ensemble lineup of diverse fantasy ancestries: a wooden-and-stone automaton (clank), an oversized mushroom-folk (fungril), horned dragon-folk and a faun and a firbolg with long curling horns, a turtle-folk (galapa) and a frog-folk (ribbet), and a stiffening stone-skinned plague victim; a varied row of fantastical kin.",
  },
  {
    id: "20-classes",
    pal: PAL.mixed,
    subject:
      "A split montage of duality: on one side a druid, a ranger and a sorcerer drawing on wild nature in the deep forest with vines and beasts; on the other a Haven warrior in ordered armor and a war-wizard wielding disciplined magic; nature's power versus martial Haven might.",
  },
  {
    id: "21-questions",
    pal: PAL.fanewick,
    subject:
      "A quiet contemplative scene: a small group gathered around a campfire at night in the wild forest, sharing stories before a journey, glowing bioluminescent night-bloom flowers nearby, a reflective intimate mood.",
  },
  {
    id: "22-cta",
    pal: PAL.wither,
    subject:
      "Silhouettes of a small band of unlikely heroes rising and standing together against the towering corrupted overgrowth at dawn, tense hope, a last stand turned to a beginning.",
  },
];

const MODEL = process.env.GEMINI_IMAGE_MODEL || "gemini-2.5-flash-image";
const ASPECT = "16:9";
const MAX_TRIES = 4;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fileExists(p) {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

async function generateOne(apiKey, { id, subject, pal }) {
  const prompt = `${STYLE}\n\n${pal}\n\nScene: ${subject}`;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

  for (let attempt = 1; attempt <= MAX_TRIES; attempt++) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { imageConfig: { aspectRatio: ASPECT } },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        const msg = data?.error?.message ?? `HTTP ${res.status}`;
        // 429/5xx: vale la pena reintentar.
        if (attempt < MAX_TRIES && (res.status === 429 || res.status >= 500)) {
          const wait = 2000 * attempt;
          console.warn(`  · ${id}: ${msg} — reintento en ${wait}ms`);
          await sleep(wait);
          continue;
        }
        throw new Error(msg);
      }

      const parts = data?.candidates?.[0]?.content?.parts ?? [];
      for (const p of parts) {
        const inline = p.inlineData ?? p.inline_data;
        const b64 = inline?.data;
        if (b64) {
          const buf = Buffer.from(b64, "base64");
          const out = resolve(OUT_DIR, `${id}.png`);
          await writeFile(out, buf);
          const mime =
            inline?.mimeType ?? inline?.mime_type ?? "image/png";
          return { ok: true, bytes: buf.length, mime };
        }
      }
      throw new Error("la respuesta no incluyó imagen");
    } catch (err) {
      if (attempt < MAX_TRIES) {
        const wait = 2000 * attempt;
        console.warn(`  · ${id}: ${err.message} — reintento en ${wait}ms`);
        await sleep(wait);
        continue;
      }
      return { ok: false, error: err.message };
    }
  }
  return { ok: false, error: "agotados los reintentos" };
}

async function main() {
  await loadEnvFallback();
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error(
      "Falta GEMINI_API_KEY. Corre con: node --env-file=.env scripts/gen-witherwild-art.mjs"
    );
    process.exit(1);
  }

  await mkdir(OUT_DIR, { recursive: true });
  console.log(`Modelo: ${MODEL} · ${ASPECT} · ${PROMPTS.length} escenas`);

  const only = process.argv.slice(2); // opcional: ids concretos a (re)generar
  const todo = only.length
    ? PROMPTS.filter((p) => only.includes(p.id))
    : PROMPTS;

  let made = 0,
    skipped = 0,
    failed = 0;

  for (const item of todo) {
    const out = resolve(OUT_DIR, `${item.id}.png`);
    if (await fileExists(out)) {
      console.log(`= ${item.id}  (ya existe, salto)`);
      skipped++;
      continue;
    }
    process.stdout.write(`→ ${item.id}  generando… `);
    const r = await generateOne(apiKey, item);
    if (r.ok) {
      console.log(`ok (${(r.bytes / 1024).toFixed(0)} KB, ${r.mime})`);
      made++;
    } else {
      console.log(`FALLÓ: ${r.error}`);
      failed++;
    }
  }

  console.log(
    `\nListo. Generadas ${made}, saltadas ${skipped}, fallidas ${failed}.`
  );
  if (failed) process.exit(2);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
