// Maps a chosen class to its printable Daggerheart character-sheet PDF.
// Sheets live in /public/sheets and are produced by scripts/split-sheets.mjs
// from the official combined "Character Sheets and Guides" PDF. Each class
// gets its own fillable sheet; some bundle extra reference pages (Druid
// beastform tiers, Ranger companion). Unknown classes fall back to the blank.

const SHEET_CLASSES = new Set([
  "Bard",
  "Druid",
  "Guardian",
  "Ranger",
  "Rogue",
  "Seraph",
  "Sorcerer",
  "Warrior",
  "Wizard",
]);

/** True when a dedicated sheet exists for this class (vs. the blank fallback). */
export function hasSheet(className?: string | null): boolean {
  return Boolean(className && SHEET_CLASSES.has(className));
}

/** Public path to the PDF sheet for a class (blank sheet if none matches). */
export function sheetPathFor(className?: string | null): string {
  return hasSheet(className)
    ? `/sheets/${className!.toLowerCase()}.pdf`
    : "/sheets/blank.pdf";
}

/**
 * Path to Qedhup's illustrated A5 sheet for a class, or null when no class is
 * chosen (this fan-made set has no generic blank — it's always class-stamped).
 * The front page carries an art frame we fill with the portrait at download.
 */
export function illustratedSheetPathFor(className?: string | null): string | null {
  return hasSheet(className)
    ? `/sheets-qedhup/${className!.toLowerCase()}.pdf`
    : null;
}

/** Which extra reference pages a class's sheet bundles, for the UI to mention. */
export function sheetExtrasFor(className?: string | null): string | null {
  switch (className) {
    case "Druid":
      return "+ hojas de referencia de Beastform (Tier 1 y Tier 3)";
    case "Ranger":
      return "+ hoja de companion (para la subclase Beastbound)";
    default:
      return null;
  }
}
