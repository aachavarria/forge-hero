import type { DomainName } from "./types";

export interface DomainTheme {
  /** Accent color, tuned for legibility on the dark ink background. */
  color: string;
  /** A softer wash used for fills/backgrounds. */
  soft: string;
  glyph: string;
}

export const DOMAIN_THEME: Record<DomainName, DomainTheme> = {
  Arcana: { color: "#b487e8", soft: "rgba(180,135,232,0.14)", glyph: "✶" },
  Blade: { color: "#e0594f", soft: "rgba(224,89,79,0.14)", glyph: "⚔" },
  Bone: { color: "#d9c8a4", soft: "rgba(217,200,164,0.14)", glyph: "☠" },
  Codex: { color: "#6695e0", soft: "rgba(102,149,224,0.14)", glyph: "❖" },
  Grace: { color: "#e479b6", soft: "rgba(228,121,182,0.14)", glyph: "❀" },
  Midnight: { color: "#8b7cf0", soft: "rgba(139,124,240,0.14)", glyph: "☾" },
  Sage: { color: "#74c17e", soft: "rgba(116,193,126,0.14)", glyph: "❧" },
  Splendor: { color: "#ecc45c", soft: "rgba(236,196,92,0.14)", glyph: "☀" },
  Valor: { color: "#e8954a", soft: "rgba(232,149,74,0.14)", glyph: "🛡" },
};

export function domainTheme(name?: string | null): DomainTheme {
  const fallback: DomainTheme = {
    color: "#c9a25a",
    soft: "rgba(201,162,90,0.14)",
    glyph: "◆",
  };
  if (!name) return fallback;
  return DOMAIN_THEME[name as DomainName] ?? fallback;
}
