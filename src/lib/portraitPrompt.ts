import { getAncestry, getClass, getCommunity, getSubclass, getWeapon } from "./data";
import type { CharacterDraft } from "./types";

/** Builds a rich text prompt for an image model from the character draft. */
export function buildPortraitPrompt(c: CharacterDraft): string {
  const klass = getClass(c.className);
  const sub = getSubclass(c.subclassName);
  const ancestry = getAncestry(c.ancestryName);
  const community = getCommunity(c.communityName);
  const weapon = getWeapon(c.primaryWeapon);

  const a = c.appearance;
  const looks: string[] = [];
  if (a.body) looks.push(`complexión ${a.body}`);
  if (a.skin) looks.push(`piel como ${a.skin}`);
  if (a.eyes) looks.push(`ojos como ${a.eyes}`);
  if (a.clothes) looks.push(`vestimenta ${a.clothes}`);

  const parts: string[] = [];
  parts.push(
    "Retrato de personaje para un juego de rol de fantasía oscura, ilustración digital pictórica, luz de contorno dramática, atmósfera sombría, gran detalle, composición de medio cuerpo."
  );

  const who: string[] = [];
  if (c.name) who.push(c.name);
  if (ancestry) who.push(`de ascendencia ${ancestry.name}`);
  if (klass) who.push(`${klass.name}${sub ? ` (${sub.name})` : ""}`);
  if (who.length) parts.push("Sujeto: " + who.join(", ") + ".");

  if (looks.length) parts.push("Apariencia: " + looks.join(", ") + ".");
  if (a.attitude) parts.push(`Se comporta como ${a.attitude}.`);
  if (community) parts.push(`Criado entre los ${community.name}.`);
  if (weapon) parts.push(`Armado con ${weapon.name}.`);
  if (a.extra) parts.push(a.extra);

  parts.push(
    "Arte conceptual de fantasía, texturas ricas, gradación de color cinematográfica en tonos oro brasa y tinta profunda. Sin texto, sin marca de agua, sin interfaz."
  );

  return parts.join(" ");
}

/** Rewrites a portrait prompt into a clean, neutral image brief suited for
    image-to-3D tools (Meshy, Tripo): full-body A-pose, flat even lighting, a
    plain background and a clear silhouette. Keeps the character description in
    the middle of the prompt and swaps the portrait's dramatic styling. */
export function to3DReadyPrompt(prompt: string): string {
  const sentences = prompt
    .split(/(?<=[.])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  // Drop the portrait's opening style line and closing art-direction line;
  // keep the subject sentences in between. Force full-body if it slipped in.
  const subject = (
    sentences.length >= 3 ? sentences.slice(1, -1).join(" ") : sentences.join(" ")
  ).replace(/medio cuerpo/gi, "cuerpo entero");

  return [
    "Figura de personaje de cuerpo entero en pose A neutral, de pie, vista frontal, centrada, con todo el cuerpo visible de la cabeza a los pies.",
    subject,
    "Fondo liso de color gris claro uniforme, iluminación de estudio suave y pareja, sin sombras duras ni luz de contorno, colores neutros y planos, silueta limpia y legible, un solo personaje aislado. Estilo de referencia de figura para escultura, apto para generación 3D (Meshy, Tripo). Sin texto, sin marca de agua, sin escenario ni objetos de fondo.",
  ].join(" ");
}

/** Instruction for an image-to-image edit: reuses the already-generated portrait
    as a reference so the SAME character is preserved, but reframed as a clean,
    full-body, 3D-ready figure. Pair this with the portrait image in the request. */
export function to3DReadyEditPrompt(prompt: string): string {
  const sentences = prompt
    .split(/(?<=[.])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const subject = (
    sentences.length >= 3 ? sentences.slice(1, -1).join(" ") : sentences.join(" ")
  ).replace(/medio cuerpo/gi, "cuerpo entero");

  return [
    "Usa la imagen proporcionada como referencia y mantén EXACTAMENTE el mismo personaje: mismo rostro, peinado, color de piel, vestimenta, armas y paleta de colores.",
    "Vuelve a representarlo como una figura de cuerpo entero en pose A neutral, de pie, de frente, centrada, con todo el cuerpo visible de la cabeza a los pies.",
    subject ? `Para contexto del personaje: ${subject}` : "",
    "Conserva el diseño y los colores propios del personaje, pero con iluminación de estudio plana y uniforme (sin luz dramática ni grading cinematográfico) y fondo liso gris claro uniforme. Silueta limpia y legible, un solo personaje aislado, sin escenario ni objetos de fondo. Imagen limpia de referencia para escultura, apta para generación 3D (Meshy, Tripo). Sin texto ni marca de agua.",
  ]
    .filter(Boolean)
    .join(" ");
}

/** Wraps a free-text tweak into an image-edit instruction applied to the current
    3D figure: change only what's asked, keep everything else (character, full
    body, plain background, flat lighting) so the figure stays 3D-ready. */
export function applyFigureEdit(instruction: string): string {
  return [
    `Edita la imagen proporcionada aplicando solo este cambio: ${instruction.trim()}.`,
    "Mantén exactamente el mismo personaje y el resto del diseño igual: figura de cuerpo entero, de frente, fondo liso gris claro uniforme, iluminación plana y pareja, silueta limpia, un solo personaje aislado, sin escenario. Sin texto ni marca de agua.",
  ].join(" ");
}
