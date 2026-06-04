import type {
  AbilityCard,
  AncestryData,
  ArmorData,
  ClassData,
  CommunityData,
  ConsumableData,
  DomainData,
  ItemData,
  SubclassData,
  WeaponData,
} from "./types";

import classesJson from "@/data/json/classes.json";
import subclassesJson from "@/data/json/subclasses.json";
import domainsJson from "@/data/json/domains.json";
import abilitiesJson from "@/data/json/abilities.json";
import ancestriesJson from "@/data/json/ancestries.json";
import communitiesJson from "@/data/json/communities.json";
import weaponsJson from "@/data/json/weapons.json";
import armorJson from "@/data/json/armor.json";
import itemsJson from "@/data/json/items.json";
import consumablesJson from "@/data/json/consumables.json";

export const classes = classesJson as unknown as ClassData[];
export const subclasses = subclassesJson as unknown as SubclassData[];
export const domains = domainsJson as unknown as DomainData[];
export const abilities = abilitiesJson as unknown as AbilityCard[];
export const ancestries = ancestriesJson as unknown as AncestryData[];
export const communities = communitiesJson as unknown as CommunityData[];
export const weapons = weaponsJson as unknown as WeaponData[];
export const armors = armorJson as unknown as ArmorData[];
export const items = itemsJson as unknown as ItemData[];
export const consumables = consumablesJson as unknown as ConsumableData[];

// ── Lookups ───────────────────────────────────────────────────────────────

export const getClass = (name?: string | null) =>
  name ? classes.find((c) => c.name === name) : undefined;

export const getSubclass = (name?: string | null) =>
  name ? subclasses.find((s) => s.name === name) : undefined;

export const getAncestry = (name?: string | null) =>
  name ? ancestries.find((a) => a.name === name) : undefined;

export const getCommunity = (name?: string | null) =>
  name ? communities.find((c) => c.name === name) : undefined;

export const getDomain = (name?: string | null) =>
  name ? domains.find((d) => d.name === name) : undefined;

export const getWeapon = (name?: string | null) =>
  name ? weapons.find((w) => w.name === name) : undefined;

export const getArmor = (name?: string | null) =>
  name ? armors.find((a) => a.name === name) : undefined;

export const getAbility = (name?: string | null) =>
  name ? abilities.find((a) => a.name === name) : undefined;

/** Subclasses available to a class (its two named subclasses). */
export function subclassesFor(klass?: ClassData): SubclassData[] {
  if (!klass) return [];
  return [klass.subclass_1, klass.subclass_2]
    .map((n) => getSubclass(n))
    .filter((s): s is SubclassData => Boolean(s));
}

/** Level-1 domain cards a class can pick from (its two domains). */
export function startingDomainCards(klass?: ClassData): AbilityCard[] {
  if (!klass) return [];
  const allowed = new Set([klass.domain_1, klass.domain_2]);
  return abilities.filter((a) => allowed.has(a.domain) && a.level === "1");
}

export const tier1Weapons = (kind: "Primary" | "Secondary") =>
  weapons.filter((w) => w.tier === "1" && w.primary_or_secondary === kind);

export const tier1Armor = () => armors.filter((a) => a.tier === "1");
