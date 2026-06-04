import { getAncestry, getArmor, getClass, getWeapon } from "./data";
import type { CharacterDraft, Feat } from "./types";

const LEVEL = 1;
const PROFICIENCY = 1;
const START_STRESS = 6;
const START_HOPE = 2;

function parseMod(s?: string): number {
  if (!s) return 0;
  const m = s.match(/-?\d+/);
  return m ? parseInt(m[0], 10) : 0;
}

/** The ancestry feats that apply to a draft, including mixed-ancestry rules
    (top feature of one ancestry + bottom feature of another). */
function ancestryFeats(c: CharacterDraft): Feat[] {
  if (c.ancestryName) return getAncestry(c.ancestryName)?.feats ?? [];
  if (c.mixed) {
    const top = getAncestry(c.mixed.top)?.feats?.[0];
    const bottom = getAncestry(c.mixed.bottom)?.feats?.[1];
    return [top, bottom].filter((f): f is Feat => Boolean(f));
  }
  return [];
}

interface FeatBonuses {
  evasion: number;
  hp: number;
  stress: number;
  thresholds: number;
}

/** Sum the structured creation-time bonuses from a set of feats. A `thresholds`
    value of "proficiency" resolves to the character's Proficiency. */
function sumFeatBonuses(feats: Feat[]): FeatBonuses {
  const acc: FeatBonuses = { evasion: 0, hp: 0, stress: 0, thresholds: 0 };
  for (const f of feats) {
    const b = f.bonus;
    if (!b) continue;
    acc.evasion += parseMod(b.evasion);
    acc.hp += parseMod(b.hp);
    acc.stress += parseMod(b.stress);
    acc.thresholds +=
      b.thresholds === "proficiency" ? PROFICIENCY : parseMod(b.thresholds);
  }
  return acc;
}

export interface DerivedStats {
  level: number;
  proficiency: number;
  evasion: number;
  /** Class-printed Evasion before armor / weapon / ancestry modifiers. */
  baseEvasion: number;
  hp: number;
  stress: number;
  hope: number;
  armorScore: number | null;
  thresholds: { major: number; severe: number } | null;
  spellcastTrait: string | null;
  primaryDamage: string | null;
  secondaryDamage: string | null;
}

export function deriveStats(c: CharacterDraft): DerivedStats {
  const klass = getClass(c.className);
  const armor = getArmor(c.armor);
  const primary = getWeapon(c.primaryWeapon);
  const secondary = getWeapon(c.secondaryWeapon);

  const bonuses = sumFeatBonuses(ancestryFeats(c));

  const baseEvasion = klass ? parseMod(klass.evasion) : 0;
  const armorEvasion = armor ? parseMod(armor.evasion) : 0;
  const weaponEvasion = parseMod(primary?.evasion) + parseMod(secondary?.evasion);

  let thresholds: DerivedStats["thresholds"] = null;
  if (armor?.base_thresholds) {
    const nums = armor.base_thresholds.match(/\d+/g)?.map(Number) ?? [];
    if (nums.length >= 2) {
      const bump = LEVEL + bonuses.thresholds;
      thresholds = { major: nums[0] + bump, severe: nums[1] + bump };
    }
  }

  const damageOf = (raw?: string) => {
    if (!raw) return null;
    // raw like "d8 phy" -> "1d8 phys" using proficiency dice count
    const die = raw.match(/d\d+/i)?.[0] ?? raw;
    const kind = /mag/i.test(raw) ? "magic" : "phys";
    return `${PROFICIENCY}${die} ${kind}`;
  };

  return {
    level: LEVEL,
    proficiency: PROFICIENCY,
    evasion: baseEvasion + armorEvasion + weaponEvasion + bonuses.evasion,
    baseEvasion,
    hp: (klass ? parseMod(klass.hp) : 0) + bonuses.hp,
    stress: START_STRESS + bonuses.stress,
    hope: START_HOPE,
    armorScore: armor ? parseMod(armor.base_score) : null,
    thresholds,
    spellcastTrait: null, // filled by caller via subclass if desired
    primaryDamage: damageOf(primary?.damage),
    secondaryDamage: damageOf(secondary?.damage),
  };
}
