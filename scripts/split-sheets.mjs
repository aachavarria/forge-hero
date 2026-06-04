// Splits the combined "Character Sheets and Guides" PDF into one fillable
// character sheet per class, dropping the prose "guide" pages. Some classes
// carry extra reference pages (Druid beastform tiers, Ranger companion) which
// are bundled into that class's sheet.
//
// Requires poppler (`brew install poppler`) for pdfseparate + pdfunite.
// Run:  node scripts/split-sheets.mjs
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync, copyFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

// Each entry: { src, outDir, sheets } where sheets maps class slug -> 1-indexed
// page ranges in that source PDF. Guide pages are intentionally omitted.
const JOBS = [
  {
    src: "Character-Sheets-and-Guides-Daggerheart-May212025.pdf",
    outDir: "public/sheets",
    sheets: {
      bard: [1],
      druid: [3, 4, 5], // sheet + beastform tier 1 + tier 3 reference
      guardian: [7],
      ranger: [9, 10], // sheet + companion
      rogue: [12],
      seraph: [14],
      sorcerer: [16],
      warrior: [18],
      wizard: [20],
      blank: [22], // generic blank sheet — fallback for any class
    },
  },
  {
    // Qedhup's A5 fan-made sheets. Each class is a front (illustration + stats)
    // + back (defence/weapons/inventory). Page 21 is the shared consumables &
    // level-up tracker, bundled with every class. The blank pages 1-2 are
    // skipped — we always use the class-stamped fronts. The front page has an
    // empty art frame we fill with the player's portrait at download time.
    src: "qedhup-daggerheart-a5-pc-sheets.pdf",
    outDir: "public/sheets-qedhup",
    sheets: {
      bard: [3, 4, 21],
      druid: [5, 6, 21],
      guardian: [7, 8, 21],
      ranger: [9, 10, 21],
      rogue: [11, 12, 21],
      seraph: [13, 14, 21],
      sorcerer: [15, 16, 21],
      warrior: [17, 18, 21],
      wizard: [19, 20, 21],
    },
  },
];

const bin = (name) => {
  for (const p of ["/opt/homebrew/bin", "/usr/local/bin", "/usr/bin"]) {
    const candidate = join(p, name);
    try {
      execFileSync(candidate, ["-h"], { stdio: "ignore" });
      return candidate;
    } catch {
      // -h may exit non-zero but still proves the binary exists
      try {
        execFileSync("test", ["-x", candidate]);
        return candidate;
      } catch {
        /* keep looking */
      }
    }
  }
  return name; // fall back to PATH lookup
};

const pdfseparate = bin("pdfseparate");
const pdfunite = bin("pdfunite");

const tmp = mkdtempSync(join(tmpdir(), "dh-sheets-"));

try {
  for (const { src, outDir, sheets } of JOBS) {
    mkdirSync(outDir, { recursive: true });
    console.log(`\n# ${src} -> ${outDir}`);
    for (const [klass, pages] of Object.entries(sheets)) {
      const partFiles = pages.map((p, i) => {
        const out = join(tmp, `${outDir.replace(/\W/g, "_")}-${klass}-${i}.pdf`);
        execFileSync(pdfseparate, ["-f", String(p), "-l", String(p), src, out]);
        return out;
      });

      const dest = join(outDir, `${klass}.pdf`);
      if (partFiles.length === 1) {
        copyFileSync(partFiles[0], dest);
      } else {
        execFileSync(pdfunite, [...partFiles, dest]);
      }
      console.log(`✓ ${dest}  (pages ${pages.join(", ")})`);
    }
  }
} finally {
  rmSync(tmp, { recursive: true, force: true });
}

console.log("\nDone.");
