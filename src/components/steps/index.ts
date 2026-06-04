import type { ComponentType } from "react";
import { StepIdentity } from "./StepIdentity";
import { StepClass } from "./StepClass";
import { StepHeritage } from "./StepHeritage";
import { StepTraits } from "./StepTraits";
import { StepEquipment } from "./StepEquipment";
import { StepDomainCards } from "./StepDomainCards";
import { StepBackground } from "./StepBackground";
import { StepExperiences } from "./StepExperiences";
import { StepConnections } from "./StepConnections";
import { StepPortrait } from "./StepPortrait";
import { StepReview } from "./StepReview";

export const STEP_COMPONENTS: Record<string, ComponentType> = {
  identity: StepIdentity,
  class: StepClass,
  heritage: StepHeritage,
  traits: StepTraits,
  equipment: StepEquipment,
  domains: StepDomainCards,
  background: StepBackground,
  experiences: StepExperiences,
  connections: StepConnections,
  portrait: StepPortrait,
  review: StepReview,
};
