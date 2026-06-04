"use client";

import { getClass } from "@/lib/data";
import { useCreator } from "@/lib/store";
import { TRAITS, TRAIT_POOL, type TraitName } from "@/lib/types";
import { Button, cn, StepHeader } from "@/components/ui";

const TRAIT_HINT: Record<TraitName, string> = {
  Agility: "Correr · Saltar · Maniobrar",
  Strength: "Levantar · Romper · Forcejear",
  Finesse: "Controlar · Esconderse · Trastear",
  Instinct: "Percibir · Intuir · Orientarse",
  Presence: "Encantar · Actuar · Engañar",
  Knowledge: "Recordar · Analizar · Comprender",
};

const VALUES = [2, 1, 0, -1] as const;
const fmt = (n: number) => (n > 0 ? `+${n}` : `${n}`);

function poolCounts() {
  const m = new Map<number, number>();
  for (const v of TRAIT_POOL) m.set(v, (m.get(v) ?? 0) + 1);
  return m;
}

export function StepTraits() {
  const traits = useCreator((s) => s.traits);
  const setTrait = useCreator((s) => s.setTrait);
  const update = useCreator((s) => s.update);
  const className = useCreator((s) => s.className);

  const total = poolCounts();
  const used = new Map<number, number>();
  for (const t of TRAITS) {
    const v = traits[t];
    if (v !== null) used.set(v, (used.get(v) ?? 0) + 1);
  }
  const remaining = (v: number) => (total.get(v) ?? 0) - (used.get(v) ?? 0);

  const applySuggested = () => {
    const klass = getClass(className);
    if (!klass) return;
    const vals = klass.suggested_traits
      .split(",")
      .map((s) => parseInt(s.trim(), 10));
    const next = { ...traits };
    TRAITS.forEach((t, i) => {
      next[t] = Number.isFinite(vals[i]) ? vals[i] : null;
    });
    update({ traits: next });
  };

  const clearAll = () => {
    const next = { ...traits };
    TRAITS.forEach((t) => (next[t] = null));
    update({ traits: next });
  };

  return (
    <div>
      <StepHeader
        eyebrow="Capítulo IV · Las aptitudes"
        title="Asigna tus traits"
        intro="Reparte los modificadores +2, +1, +1, 0, 0, −1 entre tus seis traits en el orden que quieras. Al tirar con un trait, su modificador se suma a la tirada."
      />

      <div className="mb-5 flex flex-wrap items-center gap-3 rise">
        <span className="eyebrow">Reserva</span>
        <div className="flex gap-2">
          {VALUES.map((v) => {
            const left = remaining(v);
            return (
              <span
                key={v}
                className={cn(
                  "flex h-9 min-w-9 items-center justify-center rounded-[var(--radius-tome)] border px-2 font-display",
                  left > 0
                    ? "border-[color:var(--color-ember)]/50 text-ember"
                    : "border-[color:var(--color-line-soft)] text-parch-faint line-through"
                )}
              >
                {fmt(v)}
                <sub className="ml-0.5 text-[0.6rem] no-underline">×{left}</sub>
              </span>
            );
          })}
        </div>
        <div className="ml-auto flex gap-2">
          {className ? (
            <Button variant="ghost" onClick={applySuggested}>
              Usar sugeridos
            </Button>
          ) : null}
          <Button variant="ghost" onClick={clearAll}>
            Limpiar
          </Button>
        </div>
      </div>

      <div className="grid gap-3 rise">
        {TRAITS.map((t) => {
          const current = traits[t];
          return (
            <div
              key={t}
              className="flex flex-col gap-3 rounded-[var(--radius-tome)] border border-[color:var(--color-line-soft)] bg-[color:var(--color-ink-700)] p-4 sm:flex-row sm:items-center"
            >
              <div className="sm:w-48">
                <p className="font-display text-lg text-parch">{t}</p>
                <p className="text-xs text-parch-faint">{TRAIT_HINT[t]}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {VALUES.map((v) => {
                  const isCurrent = current === v;
                  const disabled = !isCurrent && remaining(v) <= 0;
                  return (
                    <button
                      key={v}
                      type="button"
                      disabled={disabled}
                      onClick={() => setTrait(t, isCurrent ? null : v)}
                      className={cn(
                        "h-11 w-12 rounded-[var(--radius-tome)] border font-display text-lg transition-all",
                        isCurrent
                          ? "border-[color:var(--color-ember)] bg-[color:var(--color-ember)] text-ink-900 shadow-[0_8px_24px_-12px_var(--color-ember)]"
                          : disabled
                            ? "cursor-not-allowed border-[color:var(--color-line-soft)] text-parch-faint opacity-40"
                            : "border-[color:var(--color-line-soft)] text-parch-dim hover:border-[color:var(--color-ember)] hover:text-ember"
                      )}
                    >
                      {fmt(v)}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
