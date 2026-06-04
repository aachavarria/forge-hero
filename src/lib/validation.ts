import { TRAITS, type CharacterDraft } from "./types";

/** Steps whose completion is mechanically required for a valid level-1 PC. */
export const REQUIRED_STEPS = new Set([
  "identity",
  "class",
  "heritage",
  "traits",
  "equipment",
  "domains",
  "experiences",
]);

export function isStepComplete(key: string, d: CharacterDraft): boolean {
  switch (key) {
    case "identity":
      return d.name.trim().length > 0;
    case "class":
      return Boolean(d.className && d.subclassName);
    case "heritage":
      return Boolean(d.ancestryName && d.communityName);
    case "traits":
      return TRAITS.every((t) => d.traits[t] !== null);
    case "equipment":
      return Boolean(d.primaryWeapon && d.armor);
    case "domains":
      return d.domainCards.length === 2;
    case "experiences":
      return d.experiences.every((e) => e.name.trim().length > 0);
    case "background":
      return (
        d.backgroundExtra.trim().length > 0 ||
        Object.values(d.backgroundAnswers).some((v) => v.trim().length > 0)
      );
    case "connections":
      return (
        d.connectionExtra.trim().length > 0 ||
        Object.values(d.connectionAnswers).some((v) => v.trim().length > 0)
      );
    case "portrait":
      return Boolean(d.portrait.dataUrl);
    default:
      return false;
  }
}

/** List of required steps that aren't yet done. */
export function missingRequired(
  steps: { key: string }[],
  d: CharacterDraft
): string[] {
  return steps
    .filter((s) => REQUIRED_STEPS.has(s.key) && !isStepComplete(s.key, d))
    .map((s) => s.key);
}
