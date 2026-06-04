"use client";

// Fills Qedhup's A5 character sheet (a flat, non-form PDF) at download time:
// stamps the player's portrait into the art frame and writes name, heritage and
// subclass onto the front page. The class is already printed on the base PDF
// (one file per class, produced by scripts/split-sheets.mjs).
//
// Coordinates are in PDF points, bottom-left origin (pdf-lib convention), for
// the 792×612 landscape page. They were measured from the rendered sheet:
//   • field baselines mirror the printed "CLASS" value placement
//   • the art frame box came from pixel analysis of the left illustration panel

const PAGE_W = 792;

// Value text anchors. `x` is the left edge of the value; `maxRight` bounds it so
// long strings shrink to fit instead of spilling into the next field.
const FIELDS = {
  name: { x: 453, y: 529, maxRight: 590 },
  heritage: { x: 466, y: 510, maxRight: 590 },
  subclass: { x: 639, y: 510, maxRight: PAGE_W - 30 },
} as const;

// Inner art frame (inset from the decorative border) the portrait fits into.
const ART = { x: 44, y: 55, w: 306, h: 503 } as const;

export interface IllustratedSheetInput {
  /** Public path to the per-class base PDF, e.g. "/sheets-qedhup/bard.pdf". */
  basePath: string;
  name: string;
  /** Combined ancestry / community, e.g. "Elf / Loreborne". */
  heritage: string | null;
  subclass: string | null;
  /** data: URL of the player's portrait (png/jpeg/webp/…), or null. */
  portraitDataUrl: string | null;
  /** Download file name (without extension). */
  fileName: string;
}

function base64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("image decode failed"));
    img.src = dataUrl;
  });
}

/**
 * Cover-crop the portrait to the art frame's aspect ratio and return PNG bytes,
 * so it fills the frame edge-to-edge with no empty bands and never overflows the
 * box. The crop is centered and done at the source's native resolution (no
 * upscaling). Cropping here (rather than relying on pdf-lib, which has no easy
 * clip) keeps the image strictly inside the frame. Handles any format (png/
 * jpeg/webp) since it goes through a canvas.
 */
async function coverCropPng(
  dataUrl: string,
  boxW: number,
  boxH: number
): Promise<Uint8Array> {
  const img = await loadImage(dataUrl);
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  const target = boxW / boxH;

  let cropW = iw;
  let cropH = ih;
  if (iw / ih > target) {
    cropW = Math.round(ih * target); // too wide → trim the sides
  } else {
    cropH = Math.round(iw / target); // too tall → trim top/bottom
  }
  const sx = Math.round((iw - cropW) / 2);
  const sy = Math.round((ih - cropH) / 2);

  const canvas = document.createElement("canvas");
  canvas.width = cropW;
  canvas.height = cropH;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no 2d context");
  ctx.drawImage(img, sx, sy, cropW, cropH, 0, 0, cropW, cropH);
  const b64 = canvas.toDataURL("image/png").split(",")[1] ?? "";
  return base64ToBytes(b64);
}

export async function downloadIllustratedSheet(
  input: IllustratedSheetInput
): Promise<void> {
  const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");

  const baseBytes = await fetch(input.basePath).then((r) => {
    if (!r.ok) throw new Error(`No se pudo cargar la hoja base (${r.status})`);
    return r.arrayBuffer();
  });

  const pdf = await PDFDocument.load(baseBytes);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const page = pdf.getPages()[0];
  const ink = rgb(0.12, 0.12, 0.12);

  // Portrait fills the art frame edge-to-edge (cover-cropped to the frame's
  // aspect ratio so there are no empty bands and nothing spills past the box).
  if (input.portraitDataUrl) {
    try {
      const png = await coverCropPng(input.portraitDataUrl, ART.w, ART.h);
      const img = await pdf.embedPng(png);
      page.drawImage(img, { x: ART.x, y: ART.y, width: ART.w, height: ART.h });
    } catch (err) {
      // Non-fatal: still produce the sheet without the portrait.
      console.warn("No se pudo incrustar el retrato:", err);
    }
  }

  const drawFitted = (
    text: string,
    field: { x: number; y: number; maxRight: number }
  ) => {
    const value = text.trim();
    if (!value) return;
    const maxW = field.maxRight - field.x;
    let size = 11;
    const safe = (s: string) => {
      try {
        font.widthOfTextAtSize(s, size);
        return s;
      } catch {
        // Strip characters Helvetica/WinAnsi can't encode.
        return s.normalize("NFKD").replace(/[^\x20-\x7E]/g, "");
      }
    };
    const str = safe(value);
    while (size > 6 && font.widthOfTextAtSize(str, size) > maxW) size -= 0.5;
    page.drawText(str, { x: field.x, y: field.y, size, font, color: ink });
  };

  drawFitted(input.name, FIELDS.name);
  if (input.heritage) drawFitted(input.heritage, FIELDS.heritage);
  if (input.subclass) drawFitted(input.subclass, FIELDS.subclass);

  const bytes = await pdf.save();
  // Copy into a fresh ArrayBuffer-backed array so the Blob type is unambiguous.
  const blob = new Blob([bytes.slice()], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${input.fileName}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}
