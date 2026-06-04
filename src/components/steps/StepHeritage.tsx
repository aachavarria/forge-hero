"use client";

import { type CSSProperties, type ReactNode, useState } from "react";
import { ancestries, communities, getAncestry, getCommunity } from "@/lib/data";
import { findCard } from "@/lib/cards";
import { useCreator } from "@/lib/store";
import { ChoiceCard, cn, Hint, StepHeader } from "@/components/ui";
import { AncestryIcon } from "@/components/icons/GameIcon";
import { DaggerheartCard } from "@/components/cards/DaggerheartCard";

function FeatList({ feats }: { feats: { name: string; text: string }[] }) {
  return (
    <ul className="mt-3 space-y-2 border-t border-[color:var(--color-line-soft)] pt-3">
      {feats.map((f) => (
        <li key={f.name} className="text-xs leading-relaxed text-parch-faint">
          <span className="font-display text-parch-dim">{f.name}:</span> {f.text}
        </li>
      ))}
    </ul>
  );
}

/** Art-led selector tile, mirroring the class picker's library cards. */
function HeritageTile({
  name,
  art,
  icon,
  selected,
  onClick,
}: {
  name: string;
  art: string | null;
  icon?: ReactNode;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <ChoiceCard
      selected={selected}
      onClick={onClick}
      className="!p-0 overflow-hidden"
    >
      <div
        className="dh-classcard"
        style={{ "--cc": "var(--color-ember)" } as CSSProperties}
      >
        {art ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={art}
            alt={name}
            loading="lazy"
            className="dh-classcard__art"
          />
        ) : (
          <div
            className="dh-classcard__art"
            style={{
              display: "grid",
              placeItems: "center",
              background: "var(--color-ink-800)",
            }}
          >
            {icon}
          </div>
        )}
        <div className="dh-classcard__bar">
          {icon}
          <span className="dh-classcard__name">{name}</span>
        </div>
      </div>
    </ChoiceCard>
  );
}

export function StepHeritage() {
  const ancestryName = useCreator((s) => s.ancestryName);
  const communityName = useCreator((s) => s.communityName);
  const update = useCreator((s) => s.update);
  const [expanded, setExpanded] = useState(false);

  const ancestry = getAncestry(ancestryName);
  const community = getCommunity(communityName);
  const ancestryCard = findCard("ancestry", ancestryName);
  const communityCard = findCard("community", communityName);

  return (
    <div>
      <StepHeader
        eyebrow="Capítulo III · El linaje"
        title="Forja tu herencia"
        intro="La herencia son dos hilos entrelazados: tu ascendencia (tu linaje, que otorga dos rasgos de ancestry) y tu comunidad (la cultura que te formó, que otorga un rasgo)."
      />

      {/* ── Ascendencia ─────────────────────────────────────────────── */}
      <section className="grid gap-6 lg:grid-cols-[minmax(0,440px)_minmax(0,1fr)]">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <div className="mb-3 flex items-baseline justify-between">
            <p className="eyebrow">Ascendencia</p>
            {ancestryName ? (
              <span className="text-sm text-parch-dim">{ancestryName}</span>
            ) : null}
          </div>
          <div className="grid grid-cols-3 gap-2.5 rise">
            {ancestries.map((a) => {
              const selected = a.name === ancestryName;
              return (
                <HeritageTile
                  key={a.name}
                  name={a.name}
                  art={findCard("ancestry", a.name)?.image ?? null}
                  icon={
                    <AncestryIcon
                      name={a.name}
                      size={16}
                      color="var(--color-ember)"
                    />
                  }
                  selected={selected}
                  onClick={() =>
                    update({ ancestryName: selected ? null : a.name })
                  }
                />
              );
            })}
          </div>
        </div>

        <div className="min-w-0">
          {ancestry ? (
            <div
              key={ancestry.name}
              className="flex flex-col gap-4 rise lg:flex-row lg:items-start"
            >
              <div className="panel flex-1 p-4">
                <p className="text-sm leading-relaxed text-parch-dim">
                  {ancestry.description}
                </p>
                <FeatList feats={ancestry.feats} />
              </div>
              {ancestryCard ? <DaggerheartCard card={ancestryCard} /> : null}
            </div>
          ) : (
            <div className="flex h-full min-h-[280px] items-center justify-center">
              <Hint>
                Elige una ascendencia a la izquierda para ver su linaje y sus dos
                rasgos.
              </Hint>
            </div>
          )}
        </div>
      </section>

      <div className="rule my-8" />

      {/* ── Comunidad ───────────────────────────────────────────────── */}
      <section className="grid gap-6 lg:grid-cols-[minmax(0,440px)_minmax(0,1fr)]">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <div className="mb-3 flex items-baseline justify-between">
            <p className="eyebrow">Comunidad</p>
            {communityName ? (
              <span className="text-sm text-parch-dim">{communityName}</span>
            ) : null}
          </div>
          <div className="grid grid-cols-3 gap-2.5 rise">
            {communities.map((c) => {
              const selected = c.name === communityName;
              return (
                <HeritageTile
                  key={c.name}
                  name={c.name}
                  art={findCard("community", c.name)?.image ?? null}
                  selected={selected}
                  onClick={() =>
                    update({ communityName: selected ? null : c.name })
                  }
                />
              );
            })}
          </div>
        </div>

        <div className="min-w-0">
          {community ? (
            <div
              key={community.name}
              className="flex flex-col gap-4 rise lg:flex-row lg:items-start"
            >
              <div className="panel flex-1 p-4">
                {community.note ? (
                  <p className="mb-2 text-sm italic text-parch-faint">
                    {community.note}
                  </p>
                ) : null}
                <p className="text-sm leading-relaxed text-parch-dim">
                  {community.description}
                </p>
                <FeatList feats={community.feats} />
              </div>
              {communityCard ? <DaggerheartCard card={communityCard} /> : null}
            </div>
          ) : (
            <div className="flex h-full min-h-[280px] items-center justify-center">
              <Hint>
                Elige una comunidad a la izquierda para ver la cultura que te
                formó y su rasgo.
              </Hint>
            </div>
          )}
        </div>
      </section>

      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className={cn(
          "mt-8 text-xs uppercase tracking-[0.2em] text-parch-faint transition-colors hover:text-ember"
        )}
      >
        {expanded ? "− Ocultar" : "+ Avanzado"} · mixed ancestry
      </button>
      {expanded ? (
        <div className="panel mt-3 p-4 text-sm text-parch-dim rise">
          <p>
            Para crear una <b className="text-parch">mixed ancestry</b>, toma el
            primer rasgo (el de arriba) de una ascendencia y el segundo (el de
            abajo) de otra. Por ahora elige tu ascendencia principal arriba y
            anota la segunda en tu trasfondo; el soporte completo de mixed
            ancestry se puede añadir más adelante.
          </p>
        </div>
      ) : null}
    </div>
  );
}
