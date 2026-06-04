"use client";

import type { IconType } from "react-icons";
import {
  GiAngelWings,
  GiBarefoot,
  GiBowman,
  GiCat,
  GiCheckedShield,
  GiDevilMask,
  GiDragonHead,
  GiDwarfFace,
  GiElfHelmet,
  GiFairy,
  GiFireSpellCast,
  GiFrog,
  GiGiant,
  GiGoat,
  GiGoblinHead,
  GiGorilla,
  GiHood,
  GiLyre,
  GiMushroomGills,
  GiOgre,
  GiOrcHead,
  GiPerson,
  GiRobotGolem,
  GiSwordman,
  GiTurtleShell,
  GiVineWhip,
  GiWizardFace,
} from "react-icons/gi";

const CLASS_ICON: Record<string, IconType> = {
  Bard: GiLyre,
  Druid: GiVineWhip,
  Guardian: GiCheckedShield,
  Ranger: GiBowman,
  Rogue: GiHood,
  Seraph: GiAngelWings,
  Sorcerer: GiFireSpellCast,
  Warrior: GiSwordman,
  Wizard: GiWizardFace,
};

const ANCESTRY_ICON: Record<string, IconType> = {
  Clank: GiRobotGolem,
  Drakona: GiDragonHead,
  Dwarf: GiDwarfFace,
  Elf: GiElfHelmet,
  Faerie: GiFairy,
  Faun: GiGoat,
  Firbolg: GiOgre,
  Fungril: GiMushroomGills,
  Galapa: GiTurtleShell,
  Giant: GiGiant,
  Goblin: GiGoblinHead,
  Halfling: GiBarefoot,
  Human: GiPerson,
  Infernis: GiDevilMask,
  Katari: GiCat,
  Orc: GiOrcHead,
  Ribbet: GiFrog,
  Simiah: GiGorilla,
};

export function ClassIcon({
  name,
  size = 24,
  color = "currentColor",
  className,
}: {
  name?: string | null;
  size?: number;
  color?: string;
  className?: string;
}) {
  const Icon = name ? CLASS_ICON[name] : undefined;
  if (!Icon) return null;
  return <Icon size={size} color={color} className={className} />;
}

export function AncestryIcon({
  name,
  size = 24,
  color = "currentColor",
  className,
}: {
  name?: string | null;
  size?: number;
  color?: string;
  className?: string;
}) {
  const Icon = name ? ANCESTRY_ICON[name] : undefined;
  if (!Icon) return null;
  return <Icon size={size} color={color} className={className} />;
}
