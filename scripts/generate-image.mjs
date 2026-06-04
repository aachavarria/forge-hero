#!/usr/bin/env node
// Standalone Gemini image generator — no app/server needed.
//
// Usage:
//   GEMINI_API_KEY=tu_key node scripts/generate-image.mjs "tu prompt aquí"
//   GEMINI_API_KEY=tu_key node scripts/generate-image.mjs --out hero.png --prompt "un guerrero élfico"
//
// Flags:
//   --prompt, -p   Texto del prompt (o pásalo como argumento suelto).
//   --out, -o      Ruta del archivo de salida (default: output.png).
//   --model, -m    Modelo (default: GEMINI_IMAGE_MODEL o gemini-2.5-flash-image).
//   --image, -i    (Opcional) imagen de entrada para edición/variación.
//
// La key NUNCA se pasa por argumento: solo por la variable de entorno
// GEMINI_API_KEY, así no queda en tu historial de shell ni en logs.

import { writeFile, readFile } from "node:fs/promises";
import { extname } from "node:path";

const DEFAULT_MODEL = "gemini-2.5-flash-image";

function parseArgs(argv) {
  const out = { prompt: "", outPath: "output.png", model: "", image: "" };
  const rest = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--prompt" || a === "-p") out.prompt = argv[++i] ?? "";
    else if (a === "--out" || a === "-o") out.outPath = argv[++i] ?? out.outPath;
    else if (a === "--model" || a === "-m") out.model = argv[++i] ?? "";
    else if (a === "--image" || a === "-i") out.image = argv[++i] ?? "";
    else rest.push(a);
  }
  if (!out.prompt) out.prompt = rest.join(" ").trim();
  return out;
}

function mimeFromPath(p) {
  const ext = extname(p).toLowerCase();
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".webp") return "image/webp";
  return "image/png";
}

async function main() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error(
      "Falta GEMINI_API_KEY. Corre así:\n" +
        '  GEMINI_API_KEY=tu_key node scripts/generate-image.mjs "tu prompt"'
    );
    process.exit(1);
  }

  const { prompt, outPath, model: modelArg, image } = parseArgs(
    process.argv.slice(2)
  );
  if (!prompt) {
    console.error('Falta el prompt. Ej: node scripts/generate-image.mjs "un dragón"');
    process.exit(1);
  }

  const model = modelArg || process.env.GEMINI_IMAGE_MODEL || DEFAULT_MODEL;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

  // Construye las parts: texto + (opcional) imagen de entrada.
  const parts = [{ text: prompt }];
  if (image) {
    const buf = await readFile(image);
    parts.push({
      inlineData: { mimeType: mimeFromPath(image), data: buf.toString("base64") },
    });
  }

  console.error(`→ Modelo: ${model}`);
  console.error(`→ Prompt: ${prompt}`);

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
    body: JSON.stringify({ contents: [{ parts }] }),
  });

  const data = await res.json();
  if (!res.ok) {
    console.error(
      `Error de Gemini (${res.status}): ${data?.error?.message ?? "desconocido"}`
    );
    process.exit(1);
  }

  const outParts = data?.candidates?.[0]?.content?.parts ?? [];
  for (const p of outParts) {
    const inline = p.inlineData ?? p.inline_data;
    const b64 = inline?.data;
    if (b64) {
      await writeFile(outPath, Buffer.from(b64, "base64"));
      console.error(`✓ Imagen guardada en: ${outPath}`);
      return;
    }
  }

  console.error(
    "El modelo no devolvió imagen. Revisa el prompt o que el modelo soporte salida de imagen."
  );
  if (outParts.some((p) => p.text)) {
    console.error("Texto devuelto:", outParts.map((p) => p.text).filter(Boolean).join(" "));
  }
  process.exit(1);
}

main().catch((err) => {
  console.error("Fallo inesperado:", err?.message ?? err);
  process.exit(1);
});
