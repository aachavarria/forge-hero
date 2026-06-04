"use client";

import type { CSSProperties } from "react";
import { getClass, startingDomainCards } from "@/lib/data";
import { domainTheme } from "@/lib/domains";
import { findCard } from "@/lib/cards";
import { useCreator } from "@/lib/store";
import { cn, Hint, StepHeader } from "@/components/ui";
import { DaggerheartCard } from "@/components/cards/DaggerheartCard";

export function StepDomainCards() {
  const className = useCreator((s) => s.className);
  const domainCards = useCreator((s) => s.domainCards);
  const toggleDomainCard = useCreator((s) => s.toggleDomainCard);

  const klass = getClass(className);
  const cards = startingDomainCards(klass);
  const full = domainCards.length >= 2;

  if (!klass) {
    return (
      <div>
        <StepHeader
          eyebrow="Capítulo VI · Las arcanas"
          title="Elige cartas de dominio"
        />
        <Hint>
          Elige una clase primero — tus dominios determinan qué cartas puedes
          tomar.
        </Hint>
      </div>
    );
  }

  return (
    <div>
      <StepHeader
        eyebrow="Capítulo VI · Las arcanas"
        title="Elige dos cartas de dominio"
        intro={
          <>
            Tu clase bebe de{" "}
            <span style={{ color: domainTheme(klass.domain_1).color }}>
              {klass.domain_1}
            </span>{" "}
            y{" "}
            <span style={{ color: domainTheme(klass.domain_2).color }}>
              {klass.domain_2}
            </span>
            . Toma dos cartas de nivel 1 — una de cada dominio, o ambas de uno.
          </>
        }
      />

      <div className="mb-5 flex items-center gap-2 rise">
        <span className="eyebrow">Elegidas</span>
        <span className="font-display text-lg text-ember">
          {domainCards.length}
        </span>
        <span className="text-parch-faint">/ 2</span>
      </div>

      <div className="flex flex-wrap justify-center gap-6 rise">
        {cards.map((c) => {
          const theme = domainTheme(c.domain);
          const selected = domainCards.includes(c.name);
          const disabled = !selected && full;
          const card = findCard("domain", c.name);
          if (!card) return null;
          return (
            <button
              key={c.name}
              type="button"
              onClick={() => toggleDomainCard(c.name)}
              disabled={disabled}
              aria-pressed={selected}
              style={{ "--accent": theme.color } as CSSProperties}
              className={cn(
                "group relative block rounded-[16px] transition-transform duration-200",
                !selected && !disabled && "hover:-translate-y-1.5",
                disabled && "cursor-not-allowed opacity-40"
              )}
            >
              <DaggerheartCard card={card} />

              {/* Selection ring */}
              <span
                aria-hidden
                className={cn(
                  "pointer-events-none absolute inset-0 rounded-[16px] ring-2 transition",
                  selected
                    ? "ring-[color:var(--accent)] shadow-[0_0_0_4px_color-mix(in_srgb,var(--accent)_22%,transparent)]"
                    : "ring-transparent group-hover:ring-[color:color-mix(in_srgb,var(--accent)_55%,transparent)]"
                )}
              />
              {/* Selected check */}
              {selected ? (
                <span
                  className="absolute -right-2 -top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full text-sm text-ink-900 shadow-lg"
                  style={{ background: "var(--accent)" }}
                >
                  ✓
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
