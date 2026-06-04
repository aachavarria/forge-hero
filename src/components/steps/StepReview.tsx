"use client";

import { useState } from "react";
import {
  getAbility,
  getAncestry,
  getArmor,
  getClass,
  getCommunity,
  getSubclass,
  getWeapon,
} from "@/lib/data";
import { deriveStats } from "@/lib/derive";
import { domainTheme } from "@/lib/domains";
import {
  hasSheet,
  illustratedSheetPathFor,
  sheetExtrasFor,
  sheetPathFor,
} from "@/lib/sheets";
import { downloadIllustratedSheet } from "@/lib/sheetFill";
import { useCreator } from "@/lib/store";
import { TRAITS, type CharacterDraft } from "@/lib/types";
import { Button, StatChip, StepHeader } from "@/components/ui";
import { DomainIcon } from "@/components/icons/DomainIcon";
import { ClassIcon } from "@/components/icons/GameIcon";

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="panel p-5">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <p className="eyebrow">{title}</p>
        {hint ? (
          <span className="text-[0.7rem] text-parch-faint">{hint}</span>
        ) : null}
      </div>
      {children}
    </section>
  );
}

/** A named rules feature: bold title + its full text, so it can be copied to a
    physical sheet without going back to the book. */
function Feature({
  name,
  text,
  meta,
  accent = "var(--color-ember)",
}: {
  name: string;
  text?: string;
  meta?: React.ReactNode;
  accent?: string;
}) {
  return (
    <div className="rounded-[var(--radius-tome)] border border-[color:var(--color-line-soft)] bg-[color:var(--color-ink-800)] p-3">
      <div className="flex items-baseline justify-between gap-2">
        <p className="font-display text-sm" style={{ color: accent }}>
          {name}
        </p>
        {meta ? (
          <span className="text-[0.68rem] text-parch-faint">{meta}</span>
        ) : null}
      </div>
      {text ? (
        <p className="mt-1.5 whitespace-pre-line text-[0.82rem] leading-relaxed text-parch-dim">
          {text}
        </p>
      ) : null}
    </div>
  );
}

const fmt = (n: number | null) =>
  n === null ? "—" : n > 0 ? `+${n}` : `${n}`;

function WeaponLine({
  label,
  name,
  derivedDamage,
}: {
  label: string;
  name: string | null;
  derivedDamage: string | null;
}) {
  const w = getWeapon(name);
  if (!name) {
    return (
      <div className="rounded-[var(--radius-tome)] border border-[color:var(--color-line-soft)] bg-[color:var(--color-ink-800)] p-3">
        <p className="text-xs uppercase tracking-[0.14em] text-parch-faint">
          {label}
        </p>
        <p className="mt-1 text-sm text-parch-faint">— ninguna —</p>
      </div>
    );
  }
  return (
    <div className="rounded-[var(--radius-tome)] border border-[color:var(--color-line-soft)] bg-[color:var(--color-ink-800)] p-3">
      <div className="flex items-baseline justify-between gap-2">
        <div>
          <span className="text-[0.62rem] uppercase tracking-[0.14em] text-parch-faint">
            {label}
          </span>
          <p className="font-display text-base text-parch">{name}</p>
        </div>
        <span className="font-display text-sm text-ember">
          {derivedDamage ?? w?.damage ?? "—"}
        </span>
      </div>
      {w ? (
        <>
          <p className="mt-1 text-xs text-parch-faint">
            {w.trait} · {w.range} · {w.burden} · {w.physical_or_magical}
          </p>
          {w.feat_name ? (
            <p className="mt-2 text-[0.8rem] leading-relaxed text-parch-dim">
              <span className="font-display text-parch">{w.feat_name}:</span>{" "}
              {w.feat_text}
            </p>
          ) : null}
        </>
      ) : null}
    </div>
  );
}

export function StepReview() {
  const draft = useCreator() as unknown as CharacterDraft;
  const reset = useCreator((s) => s.reset);

  const klass = getClass(draft.className);
  const sub = getSubclass(draft.subclassName);
  const ancestry = getAncestry(draft.ancestryName);
  const community = getCommunity(draft.communityName);
  const armor = getArmor(draft.armor);
  const stats = deriveStats(draft);

  const cards = draft.domainCards
    .map((n) => getAbility(n) ?? { name: n })
    .filter(Boolean);

  const experiences = draft.experiences.filter((e) => e.name.trim());
  const backgroundQA = Object.entries(draft.backgroundAnswers).filter(
    ([, a]) => a && a.trim()
  );
  const connectionQA = Object.entries(draft.connectionAnswers).filter(
    ([, a]) => a && a.trim()
  );

  const sheetPath = sheetPathFor(draft.className);
  const sheetExtras = sheetExtrasFor(draft.className);
  const illustratedPath = illustratedSheetPathFor(draft.className);
  const heritage = [ancestry?.name, community?.name].filter(Boolean).join(" / ");

  const [illustrating, setIllustrating] = useState(false);
  const [illustrateError, setIllustrateError] = useState<string | null>(null);

  const baseFileName = `${draft.name || draft.className || "daggerheart"}-hoja`;

  const downloadSheet = () => {
    const a = document.createElement("a");
    a.href = sheetPath;
    a.download = `${baseFileName}.pdf`;
    a.click();
  };

  const downloadIllustrated = async () => {
    if (!illustratedPath || illustrating) return;
    setIllustrateError(null);
    setIllustrating(true);
    try {
      await downloadIllustratedSheet({
        basePath: illustratedPath,
        name: draft.name,
        heritage: heritage || null,
        subclass: sub?.name ?? draft.subclassName ?? null,
        portraitDataUrl: draft.portrait.dataUrl,
        fileName: `${baseFileName}-ilustrada`,
      });
    } catch (err) {
      setIllustrateError(
        err instanceof Error ? err.message : "No se pudo generar la hoja."
      );
    } finally {
      setIllustrating(false);
    }
  };

  const exportJson = () => {
    const payload = {
      ...draft,
      derived: { ...stats, spellcastTrait: sub?.spellcast_trait ?? null },
      _exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${draft.name || "personaje"}.daggerheart.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <StepHeader
        eyebrow="Capítulo XI · El héroe"
        title={draft.name ? draft.name : "Tu héroe"}
        intro="Aquí está tu héroe, completo y con todo el texto de reglas a mano. Descarga la hoja de personaje en PDF de tu clase y pásala a mano, o expórtala como JSON."
      />

      <div className="grid gap-4 rise">
        {/* Banner */}
        <div className="panel flex flex-col gap-5 p-5 sm:flex-row">
          <div className="h-44 w-36 shrink-0 overflow-hidden rounded-[var(--radius-tome)] border border-[color:var(--color-line)] bg-[color:var(--color-ink-800)]">
            {draft.portrait.dataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={draft.portrait.dataUrl}
                alt={draft.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-ember/40">
                <ClassIcon name={klass?.name} size={48} color="var(--color-ember)" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-display text-3xl text-parch title-shadow">
              {draft.name || "Sin nombre"}
            </h3>
            <p className="mt-1 text-parch-dim">
              {ancestry?.name ?? "—"}
              {community ? ` · ${community.name}` : ""}
              {" — "}
              {klass?.name ?? "sin clase"}
              {sub ? ` (${sub.name})` : ""}
            </p>
            <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-6">
              <StatChip
                label="Evasion"
                value={stats.evasion}
                hint={`empieza en ${stats.baseEvasion}`}
              />
              <StatChip label="HP" value={stats.hp} />
              <StatChip label="Stress" value={stats.stress} />
              <StatChip label="Hope" value={stats.hope} accent="var(--color-hope)" />
              <StatChip label="Prof." value={stats.proficiency} />
              <StatChip label="Armor" value={stats.armorScore ?? "—"} />
            </div>
            {stats.thresholds ? (
              <p className="mt-3 text-sm text-parch-faint">
                Umbrales de daño — Major{" "}
                <b className="text-ember">{stats.thresholds.major}</b> · Severe{" "}
                <b className="text-ember">{stats.thresholds.severe}</b>
                {sub ? (
                  <>
                    {"  ·  Spellcast: "}
                    <b className="text-ember">{sub.spellcast_trait}</b>
                  </>
                ) : null}
              </p>
            ) : null}
          </div>
        </div>

        {/* Download / export actions, lifted to the top so they're obvious */}
        <div className="panel grid gap-4 p-5 sm:grid-cols-2">
          {/* Illustrated sheet (Qedhup) — filled with the player's art + fields */}
          <div className="flex flex-col">
            <p className="font-display text-base text-parch">
              Hoja ilustrada{klass ? ` · ${klass.name}` : ""}
            </p>
            <p className="mt-1 flex-1 text-sm text-parch-dim">
              {illustratedPath
                ? "Hoja A5 (por Qedhup) con tu retrato incrustado y nombre, linaje y subclase ya escritos. Incluye el tracker de consumibles y subida de nivel."
                : "Elige una clase para desbloquear la hoja ilustrada."}
            </p>
            <div className="mt-3">
              <Button
                onClick={downloadIllustrated}
                disabled={!illustratedPath || illustrating}
              >
                {illustrating
                  ? "Generando…"
                  : "⬇ Descargar hoja ilustrada (PDF)"}
              </Button>
              {!draft.portrait.dataUrl && illustratedPath ? (
                <p className="mt-2 text-[0.72rem] text-parch-faint">
                  Sin retrato: la hoja saldrá con el marco de arte vacío.
                </p>
              ) : null}
              {illustrateError ? (
                <p className="mt-2 text-[0.72rem] text-[color:var(--color-crimson)]">
                  {illustrateError}
                </p>
              ) : null}
            </div>
          </div>

          {/* Official sheet — blank, print-and-fill */}
          <div className="flex flex-col border-t border-[color:var(--color-line-soft)] pt-4 sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0">
            <p className="font-display text-base text-parch">
              Hoja oficial{klass ? ` · ${klass.name}` : ""}
            </p>
            <p className="mt-1 flex-1 text-sm text-parch-dim">
              {hasSheet(draft.className)
                ? "PDF oficial de tu clase, en blanco, para imprimir y rellenar a mano."
                : "Aún no eliges clase: te damos la hoja en blanco genérica."}
              {sheetExtras ? (
                <span className="text-parch-faint"> {sheetExtras}</span>
              ) : null}
            </p>
            <div className="mt-3">
              <Button variant="ghost" onClick={downloadSheet}>
                ⬇ Descargar hoja oficial (PDF)
              </Button>
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Section title="Traits">
            <div className="grid grid-cols-3 gap-2">
              {TRAITS.map((t) => (
                <div
                  key={t}
                  className="rounded-[var(--radius-tome)] border border-[color:var(--color-line-soft)] bg-[color:var(--color-ink-800)] p-2 text-center"
                >
                  <span className="block font-display text-xl text-ember">
                    {fmt(draft.traits[t])}
                  </span>
                  <span className="text-[0.62rem] uppercase tracking-[0.14em] text-parch-faint">
                    {t}
                  </span>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Experiencias">
            {experiences.length ? (
              <ul className="space-y-1.5 text-sm text-parch-dim">
                {experiences.map((e, i) => (
                  <li key={i} className="flex items-baseline justify-between gap-2">
                    <span>{e.name}</span>
                    <span className="font-display text-ember">+{e.modifier}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-parch-faint">Ninguna definida.</p>
            )}
          </Section>
        </div>

        {/* Equipment — now with full stats for every item */}
        <Section title="Equipo" hint="Tier 1 inicial">
          <div className="grid gap-3 sm:grid-cols-2">
            <WeaponLine
              label="Arma primaria"
              name={draft.primaryWeapon}
              derivedDamage={stats.primaryDamage}
            />
            <WeaponLine
              label="Arma secundaria"
              name={draft.secondaryWeapon}
              derivedDamage={stats.secondaryDamage}
            />
            <div className="rounded-[var(--radius-tome)] border border-[color:var(--color-line-soft)] bg-[color:var(--color-ink-800)] p-3">
              <span className="text-[0.62rem] uppercase tracking-[0.14em] text-parch-faint">
                Armadura
              </span>
              {armor ? (
                <>
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="font-display text-base text-parch">
                      {armor.name}
                    </p>
                    <span className="font-display text-sm text-ember">
                      {armor.base_thresholds}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-parch-faint">
                    Base Score {armor.base_score}
                    {armor.evasion ? ` · Evasion ${armor.evasion}` : ""}
                  </p>
                  {armor.feat_name ? (
                    <p className="mt-2 text-[0.8rem] leading-relaxed text-parch-dim">
                      <span className="font-display text-parch">
                        {armor.feat_name}:
                      </span>{" "}
                      {armor.feat_text}
                    </p>
                  ) : null}
                </>
              ) : (
                <p className="mt-1 text-sm text-parch-faint">— ninguna —</p>
              )}
            </div>
            <div className="rounded-[var(--radius-tome)] border border-[color:var(--color-line-soft)] bg-[color:var(--color-ink-800)] p-3">
              <span className="text-[0.62rem] uppercase tracking-[0.14em] text-parch-faint">
                Inventario
              </span>
              <ul className="mt-1 space-y-1 text-sm text-parch-dim">
                <li>
                  {draft.potion
                    ? draft.potion === "health"
                      ? "Minor Health Potion (recupera 1d4 HP)"
                      : "Minor Stamina Potion (limpia 1d4 Stress)"
                    : "Sin poción"}
                </li>
                {klass?.items ? (
                  <li className="text-parch-faint">{klass.items}</li>
                ) : null}
                <li className="text-parch-faint">
                  Antorcha, 50 ft de cuerda, suministros básicos, un puñado de oro
                </li>
              </ul>
            </div>
          </div>
        </Section>

        {/* Domain cards with full text */}
        <Section title="Cartas de dominio" hint={`${cards.length} elegidas`}>
          {cards.length ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {cards.map((c) => {
                const ab = "domain" in c ? c : undefined;
                const theme = domainTheme(ab?.domain);
                return (
                  <div
                    key={c.name}
                    className="rounded-[var(--radius-tome)] border p-3"
                    style={{
                      borderColor: "var(--color-line-soft)",
                      background: theme.soft,
                    }}
                  >
                    <div className="flex items-center gap-2">
                      {ab?.domain ? (
                        <DomainIcon
                          name={ab.domain}
                          size={20}
                          color={theme.color}
                        />
                      ) : null}
                      <p
                        className="font-display text-sm"
                        style={{ color: theme.color }}
                      >
                        {c.name}
                      </p>
                      {ab ? (
                        <span className="ml-auto text-[0.66rem] text-parch-faint">
                          {ab.domain} · Nv {ab.level} · {ab.type}
                          {ab.recall ? ` · Recall ${ab.recall}` : ""}
                        </span>
                      ) : null}
                    </div>
                    {ab?.text ? (
                      <p className="mt-2 whitespace-pre-line text-[0.8rem] leading-relaxed text-parch-dim">
                        {ab.text}
                      </p>
                    ) : null}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-parch-faint">Ninguna elegida.</p>
          )}
        </Section>

        {/* Class features */}
        {klass ? (
          <Section title={`Rasgos de clase · ${klass.name}`}>
            <div className="grid gap-3 sm:grid-cols-2">
              {klass.hope_feat_name ? (
                <Feature
                  name={klass.hope_feat_name}
                  text={klass.hope_feat_text}
                  meta="Hope feature"
                  accent="var(--color-hope)"
                />
              ) : null}
              {klass.class_feats.map((f) => (
                <Feature
                  key={f.name}
                  name={f.name}
                  text={f.text}
                  meta={f.use_amount ? `${f.use_amount}/${f.condition ?? ""}` : undefined}
                />
              ))}
            </div>
          </Section>
        ) : null}

        {/* Subclass features */}
        {sub ? (
          <Section
            title={`Subclase · ${sub.name}`}
            hint={`Spellcast: ${sub.spellcast_trait}`}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              {sub.foundations.map((f) => (
                <Feature key={f.name} name={f.name} text={f.text} meta="Foundation" />
              ))}
            </div>
            {sub.extras ? (
              <p className="mt-3 whitespace-pre-line text-[0.8rem] leading-relaxed text-parch-faint">
                {sub.extras}
              </p>
            ) : null}
          </Section>
        ) : null}

        {/* Heritage features: ancestry + community */}
        {ancestry || community ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {ancestry ? (
              <Section title={`Ascendencia · ${ancestry.name}`}>
                <div className="grid gap-3">
                  {ancestry.feats.map((f) => (
                    <Feature key={f.name} name={f.name} text={f.text} />
                  ))}
                </div>
                {draft.mixed ? (
                  <p className="mt-3 text-[0.8rem] text-parch-faint">
                    Mixed: rasgo superior de {draft.mixed.top}, inferior de{" "}
                    {draft.mixed.bottom}.
                  </p>
                ) : null}
              </Section>
            ) : null}
            {community ? (
              <Section title={`Comunidad · ${community.name}`}>
                <div className="grid gap-3">
                  {community.feats.map((f) => (
                    <Feature key={f.name} name={f.name} text={f.text} />
                  ))}
                </div>
              </Section>
            ) : null}
          </div>
        ) : null}

        {/* Background & connections answers */}
        {backgroundQA.length || draft.backgroundExtra.trim() ? (
          <Section title="Trasfondo">
            <ul className="space-y-3 text-sm">
              {backgroundQA.map(([q, a]) => (
                <li key={q}>
                  <p className="text-parch-faint">{q}</p>
                  <p className="mt-0.5 whitespace-pre-line text-parch-dim">{a}</p>
                </li>
              ))}
              {draft.backgroundExtra.trim() ? (
                <li>
                  <p className="text-parch-faint">Notas</p>
                  <p className="mt-0.5 whitespace-pre-line text-parch-dim">
                    {draft.backgroundExtra}
                  </p>
                </li>
              ) : null}
            </ul>
          </Section>
        ) : null}

        {connectionQA.length || draft.connectionExtra.trim() ? (
          <Section title="Conexiones">
            <ul className="space-y-3 text-sm">
              {connectionQA.map(([q, a]) => (
                <li key={q}>
                  <p className="text-parch-faint">{q}</p>
                  <p className="mt-0.5 whitespace-pre-line text-parch-dim">{a}</p>
                </li>
              ))}
              {draft.connectionExtra.trim() ? (
                <li>
                  <p className="text-parch-faint">Notas</p>
                  <p className="mt-0.5 whitespace-pre-line text-parch-dim">
                    {draft.connectionExtra}
                  </p>
                </li>
              ) : null}
            </ul>
          </Section>
        ) : null}

        <div className="flex flex-wrap gap-3 pt-2">
          <Button
            onClick={downloadIllustrated}
            disabled={!illustratedPath || illustrating}
          >
            {illustrating ? "Generando…" : "⬇ Hoja ilustrada (PDF)"}
          </Button>
          <Button variant="ghost" onClick={downloadSheet}>
            Hoja oficial (PDF)
          </Button>
          <Button variant="ghost" onClick={exportJson}>
            Exportar JSON
          </Button>
          <Button variant="ghost" onClick={() => window.print()}>
            Imprimir resumen
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              if (confirm("¿Empezar de nuevo? Esto borra el personaje actual.")) {
                reset();
              }
            }}
          >
            Empezar de nuevo
          </Button>
        </div>
      </div>
    </div>
  );
}
