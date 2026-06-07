"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { idbStorage } from "./idbStorage";
import { STEP_COUNT } from "./steps";
import {
  emptyTraits,
  type CharacterDraft,
  type Experience,
  type TraitName,
} from "./types";

function initialDraft(): CharacterDraft {
  return {
    name: "",
    className: null,
    subclassName: null,
    ancestryName: null,
    mixed: null,
    communityName: null,
    traits: emptyTraits(),
    primaryWeapon: null,
    secondaryWeapon: null,
    armor: null,
    potion: null,
    classItemChoice: null,
    domainCards: [],
    backgroundAnswers: {},
    backgroundExtra: "",
    experiences: [
      { name: "", modifier: 2 },
      { name: "", modifier: 2 },
    ],
    connectionAnswers: {},
    connectionExtra: "",
    appearance: {},
    portraitPrompt: "",
    portrait: { kind: null, dataUrl: null },
    figure: { kind: null, dataUrl: null },
  };
}

interface CreatorState extends CharacterDraft {
  step: number;
  _hydrated: boolean;

  update: (patch: Partial<CharacterDraft>) => void;
  setTrait: (t: TraitName, v: number | null) => void;
  toggleDomainCard: (name: string, max?: number) => void;
  setBackgroundAnswer: (q: string, a: string) => void;
  setConnectionAnswer: (q: string, a: string) => void;
  setExperience: (i: number, patch: Partial<Experience>) => void;

  goTo: (step: number) => void;
  next: () => void;
  prev: () => void;
  reset: () => void;
}

const clampStep = (s: number) => Math.max(0, Math.min(STEP_COUNT - 1, s));

const noopStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

export const useCreator = create<CreatorState>()(
  persist(
    (set, get) => ({
      ...initialDraft(),
      step: 0,
      _hydrated: false,

      update: (patch) => set(patch),

      setTrait: (t, v) =>
        set((s) => ({ traits: { ...s.traits, [t]: v } })),

      toggleDomainCard: (name, max = 2) =>
        set((s) => {
          const has = s.domainCards.includes(name);
          if (has) {
            return { domainCards: s.domainCards.filter((n) => n !== name) };
          }
          if (s.domainCards.length >= max) return {};
          return { domainCards: [...s.domainCards, name] };
        }),

      setBackgroundAnswer: (q, a) =>
        set((s) => ({ backgroundAnswers: { ...s.backgroundAnswers, [q]: a } })),

      setConnectionAnswer: (q, a) =>
        set((s) => ({ connectionAnswers: { ...s.connectionAnswers, [q]: a } })),

      setExperience: (i, patch) =>
        set((s) => {
          const experiences = s.experiences.map((e, idx) =>
            idx === i ? { ...e, ...patch } : e
          );
          return { experiences };
        }),

      goTo: (step) => set({ step: clampStep(step) }),
      next: () => set({ step: clampStep(get().step + 1) }),
      prev: () => set({ step: clampStep(get().step - 1) }),

      reset: () => set({ ...initialDraft(), step: 0 }),
    }),
    {
      name: "dh-character-v1",
      // IndexedDB (not localStorage): its quota fits the whole draft including
      // the base64 portrait image, so nothing is stripped on save anymore.
      storage: createJSONStorage(() =>
        typeof indexedDB !== "undefined" ? idbStorage : noopStorage
      ),
      // Hydration from IndexedDB is async; flip the gate flag once it lands so
      // the UI can wait instead of flashing an empty form.
      onRehydrateStorage: () => () => {
        useCreator.setState({ _hydrated: true });
      },
    }
  )
);
