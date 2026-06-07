// ── Core domain vocabulary ────────────────────────────────────────────────

export const TRAITS = [
  "Agility",
  "Strength",
  "Finesse",
  "Instinct",
  "Presence",
  "Knowledge",
] as const;
export type TraitName = (typeof TRAITS)[number];

/** Daggerheart's trait-creation pool: distribute these among the six traits. */
export const TRAIT_POOL = [2, 1, 1, 0, 0, -1] as const;

export const DOMAINS = [
  "Arcana",
  "Blade",
  "Bone",
  "Codex",
  "Grace",
  "Midnight",
  "Sage",
  "Splendor",
  "Valor",
] as const;
export type DomainName = (typeof DOMAINS)[number];

// ── Raw data shapes (mirror the heartofdaggers JSON) ──────────────────────

export interface CharacterDescriptionOptions {
  clothes: string[];
  eyes: string[];
  body: string[];
  skin: string[];
  attitude: string[];
}

/** Structured, creation-time stat bonuses granted by a feat (e.g. ancestry). */
export interface FeatBonus {
  evasion?: string; // "+1"
  hp?: string; // "+1"
  stress?: string; // "+1"
  thresholds?: string; // "+1" | "proficiency"
}

export interface Feat {
  name: string;
  text: string;
  tracked?: boolean;
  use_amount?: string;
  condition?: string;
  icon?: string;
  bonus?: FeatBonus;
}

export interface ClassData {
  name: string;
  description: string;
  character_description: CharacterDescriptionOptions;
  domain_1: DomainName;
  domain_2: DomainName;
  evasion: string;
  hp: string;
  items: string;
  hope_feat_name: string;
  hope_feat_text: string;
  subclass_1: string;
  subclass_2: string;
  suggested_traits: string; // e.g. "0, -1, +1, 0, +2, +1"
  suggested_primary: string;
  suggested_secondary: string;
  suggested_armor: string;
  class_feats: Feat[];
  backgrounds: { question: string }[];
  connections: { question: string }[];
}

export interface SubFeature {
  name: string;
  text: string;
  icon?: string;
}

export interface SubclassData {
  name: string;
  description: string;
  spellcast_trait: TraitName;
  extras?: string;
  foundations: SubFeature[];
  specializations: SubFeature[];
  masteries: SubFeature[];
}

export interface DomainData {
  name: DomainName;
  description: string;
}

export interface AbilityCard {
  name: string;
  level: string;
  domain: DomainName;
  type: string; // Ability | Spell | Grimoire
  recall: string;
  text: string;
  icon?: string;
}

export interface AncestryData {
  name: string;
  description: string;
  feats: Feat[];
}

export interface CommunityData {
  name: string;
  description: string;
  note?: string;
  feats: Feat[];
}

export interface WeaponData {
  name: string;
  primary_or_secondary: "Primary" | "Secondary";
  tier: string;
  physical_or_magical: string;
  trait: TraitName;
  range: string;
  damage: string;
  burden: string; // One-Handed | Two-Handed
  feat_name?: string;
  feat_text?: string;
  evasion?: string; // "+1" | "-1" | ... (e.g. two-handed weapons)
  icon?: string;
}

export interface ArmorData {
  name: string;
  tier: string;
  base_thresholds: string; // "5 / 11"
  base_score: string;
  feat_name?: string;
  feat_text?: string;
  evasion?: string; // "+1" | "-1" | ...
  icon?: string;
}

export interface ItemData {
  roll: string;
  name: string;
  description: string;
  icon?: string;
}

export interface ConsumableData {
  roll: string;
  name: string;
  description: string;
  type?: string;
  icon?: string;
}

// ── In-progress character (persisted) ─────────────────────────────────────

export interface Experience {
  name: string;
  modifier: number;
}

export interface AppearanceChoices {
  clothes?: string;
  eyes?: string;
  body?: string;
  skin?: string;
  attitude?: string;
  extra?: string;
}

export interface PortraitState {
  kind: "upload" | "generated" | null;
  dataUrl: string | null;
  prompt?: string;
}

export interface CharacterDraft {
  name: string;

  className: string | null;
  subclassName: string | null;

  ancestryName: string | null;
  /** Optional mixed ancestry: top feature + bottom feature from two ancestries. */
  mixed: { top: string; bottom: string } | null;
  communityName: string | null;

  traits: Record<TraitName, number | null>;

  primaryWeapon: string | null;
  secondaryWeapon: string | null;
  armor: string | null;
  potion: "health" | "stamina" | null;
  classItemChoice: string | null;

  domainCards: string[]; // ability names, max 2 at creation

  backgroundAnswers: Record<string, string>;
  backgroundExtra: string;

  experiences: Experience[]; // exactly 2 at creation

  connectionAnswers: Record<string, string>;
  connectionExtra: string;

  appearance: AppearanceChoices;

  /** The editable portrait prompt as last shown in the textarea. Persisted on
      its own (not just inside portrait/figure) so a user's tweaks survive a
      refresh even before they generate an image. */
  portraitPrompt?: string;
  portrait: PortraitState;
  /** Clean, full-body "3D-ready" render derived from the portrait prompt, meant
      to be handed to image-to-3D tools (Meshy, Tripo). */
  figure: PortraitState;
}

export function emptyTraits(): Record<TraitName, number | null> {
  return {
    Agility: null,
    Strength: null,
    Finesse: null,
    Instinct: null,
    Presence: null,
    Knowledge: null,
  };
}
