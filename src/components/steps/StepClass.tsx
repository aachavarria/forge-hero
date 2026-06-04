"use client";

import type { CSSProperties } from "react";
import {
  classes,
  getClass,
  subclassesFor,
} from "@/lib/data";
import type { ClassData } from "@/lib/types";
import { domainTheme } from "@/lib/domains";
import { findCards } from "@/lib/cards";
import { useCreator } from "@/lib/store";
import { ChoiceCard, Hint, StepHeader } from "@/components/ui";
import { ClassIcon } from "@/components/icons/GameIcon";
import { DomainIcon } from "@/components/icons/DomainIcon";
import { DaggerheartCard } from "@/components/cards/DaggerheartCard";

export function StepClass() {
  const className = useCreator((s) => s.className);
  const subclassName = useCreator((s) => s.subclassName);
  const update = useCreator((s) => s.update);

  const klass = getClass(className);

  return (
    <div>
      <StepHeader
        eyebrow="Capítulo II · La vocación"
        title="Elige clase y subclase"
        intro="Tu clase es un arquetipo basado en un rol: define tu Evasion y Hit Points iniciales, tus rasgos distintivos y los dos dominios de magia de los que puedes tomar cartas."
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,440px)_minmax(0,1fr)]">
        {/* Master — class gallery */}
        <div className="lg:sticky lg:top-32 lg:self-start">
          <p className="eyebrow mb-3">Las clases</p>
          <div className="grid grid-cols-3 gap-2.5 rise">
            {classes.map((c) => {
              const t1 = domainTheme(c.domain_1);
              const selected = c.name === className;
              return (
                <ChoiceCard
                  key={c.name}
                  selected={selected}
                  accent={t1.color}
                  onClick={() =>
                    update({
                      className: selected ? null : c.name,
                      subclassName: null,
                    })
                  }
                  className="!p-0 overflow-hidden"
                >
                  <div
                    className="dh-classcard"
                    style={{ "--cc": t1.color } as CSSProperties}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/cards/classes/${c.name.toLowerCase()}.jpg`}
                      alt={c.name}
                      loading="lazy"
                      className="dh-classcard__art"
                    />
                    <div className="dh-classcard__bar">
                      <ClassIcon name={c.name} size={16} color={t1.color} />
                      <span className="dh-classcard__name">{c.name}</span>
                    </div>
                    <div className="dh-classcard__meta">
                      <DomainIcon name={c.domain_1} size={13} />
                      {c.domain_1}
                      <span className="opacity-40">·</span>
                      <DomainIcon name={c.domain_2} size={13} />
                      {c.domain_2}
                    </div>
                  </div>
                </ChoiceCard>
              );
            })}
          </div>
        </div>

        {/* Detail — selected class */}
        <div className="min-w-0">
          {klass ? (
            <ClassDetail
              key={klass.name}
              klass={klass}
              subclassName={subclassName}
              onPickSubclass={(name) => update({ subclassName: name })}
            />
          ) : (
            <div className="flex h-full min-h-[320px] items-center justify-center">
              <Hint>
                Elige una clase a la izquierda para ver sus rasgos, dominios y
                subclases.
              </Hint>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ClassDetail({
  klass,
  subclassName,
  onPickSubclass,
}: {
  klass: ClassData;
  subclassName: string | null;
  onPickSubclass: (name: string | null) => void;
}) {
  const subs = subclassesFor(klass);

  return (
    <div className="rise">
      <div className="panel p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-full border border-[color:var(--color-line)] bg-[color:var(--color-ink-800)] text-ember">
            <ClassIcon name={klass.name} size={26} color="var(--color-ember)" />
          </span>
          <h3 className="font-display text-2xl text-parch">{klass.name}</h3>
          <div className="flex gap-2 text-xs">
            <span className="rounded border border-[color:var(--color-line)] px-2 py-1 text-parch-dim">
              Evasion <b className="text-ember">{klass.evasion}</b>
            </span>
            <span className="rounded border border-[color:var(--color-line)] px-2 py-1 text-parch-dim">
              HP <b className="text-ember">{klass.hp}</b>
            </span>
          </div>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-parch-dim">
          {klass.description}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {[klass.domain_1, klass.domain_2].map((d) => {
            const t = domainTheme(d);
            return (
              <span
                key={d}
                className="flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs"
                style={{
                  borderColor: `color-mix(in srgb, ${t.color} 40%, transparent)`,
                  color: t.color,
                }}
              >
                <DomainIcon name={d} size={14} />
                {d}
              </span>
            );
          })}
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="rounded-[var(--radius-tome)] border border-[color:var(--color-line-soft)] bg-[color:var(--color-ink-800)] p-4">
            <p className="eyebrow mb-2">Hope feature</p>
            <p className="font-display text-base text-ember">
              {klass.hope_feat_name}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-parch-dim">
              {klass.hope_feat_text}
            </p>
          </div>
          <div className="rounded-[var(--radius-tome)] border border-[color:var(--color-line-soft)] bg-[color:var(--color-ink-800)] p-4">
            <p className="eyebrow mb-2">Rasgos de clase</p>
            <ul className="space-y-2">
              {klass.class_feats.map((f) => (
                <li key={f.name} className="text-sm text-parch-dim">
                  <span className="font-display text-parch">{f.name}.</span>{" "}
                  {f.text}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Subclass picker */}
      <div className="mt-6">
        <p className="eyebrow mb-3">Elige una subclase</p>
        <div className="grid gap-3 md:grid-cols-2">
          {subs.map((s) => {
            const selected = s.name === subclassName;
            return (
              <ChoiceCard
                key={s.name}
                selected={selected}
                onClick={() => onPickSubclass(selected ? null : s.name)}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-display text-lg text-parch">{s.name}</p>
                  <span className="text-xs text-parch-faint">
                    Spellcast · {s.spellcast_trait}
                  </span>
                </div>
                <p className="mt-1 text-sm text-parch-dim">{s.description}</p>
                {s.foundations?.[0] ? (
                  <p className="mt-3 border-t border-[color:var(--color-line-soft)] pt-3 text-xs leading-relaxed text-parch-faint">
                    <span className="font-display text-parch-dim">
                      {s.foundations[0].name}:
                    </span>{" "}
                    {s.foundations[0].text}
                  </p>
                ) : null}
              </ChoiceCard>
            );
          })}
        </div>
      </div>

      {/* Generated cards for the chosen subclass */}
      {subclassName ? <SubclassCards name={subclassName} /> : null}
    </div>
  );
}

function SubclassCards({ name }: { name: string }) {
  const cards = findCards("subclass", name);
  if (cards.length === 0) return null;
  return (
    <div className="mt-7 rise">
      <p className="eyebrow mb-3">Las cartas de {name}</p>
      <div className="flex flex-wrap justify-center gap-5">
        {cards.map((card) => (
          <DaggerheartCard key={card.id} card={card} />
        ))}
      </div>
    </div>
  );
}
