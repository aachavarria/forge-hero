"use client";

import { getClass, getWeapon, tier1Armor, tier1Weapons } from "@/lib/data";
import { useCreator } from "@/lib/store";
import type { WeaponData } from "@/lib/types";
import { Button, ChoiceCard, cn, StepHeader } from "@/components/ui";

/** Splits a damage string like "d10+3 phy" into color-coded parts:
    the "d" keeps the base gold; the die number is white; bonus + type share
    one color — crimson for physical, violet for magical. */
function DamageValue({ value }: { value: string }) {
  const m = value.match(/^\s*(\d*d\d+)\s*([+-]\s*\d+)?\s*([a-z]+)?\s*$/i);
  if (!m) {
    return <span className="font-display text-sm text-ember">{value}</span>;
  }
  const [, die, mod, type] = m;
  const typeColor = /^mag/i.test(type ?? "")
    ? "var(--color-fear)"
    : "var(--color-crimson)";
  return (
    <span className="font-display text-sm">
      {die
        .replace(/\s+/g, "")
        .split(/(d)/i)
        .map((part, i) =>
          part === "" ? null : /^d$/i.test(part) ? (
            <span key={i} className="text-ember">
              {part}
            </span>
          ) : (
            <span key={i} className="text-parch">
              {part}
            </span>
          )
        )}
      {mod ? (
        <span style={{ color: typeColor }}>{mod.replace(/\s+/g, "")}</span>
      ) : null}
      {type ? (
        <span
          className="ml-1 text-[0.7rem] uppercase tracking-wide"
          style={{ color: typeColor }}
        >
          {type}
        </span>
      ) : null}
    </span>
  );
}

function WeaponCard({
  w,
  selected,
  disabled,
  onClick,
}: {
  w: WeaponData;
  selected: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <ChoiceCard selected={selected} disabled={disabled} onClick={onClick}>
      <div className="flex items-baseline justify-between gap-2">
        <p className="font-display text-base text-parch">{w.name}</p>
        <DamageValue value={w.damage} />
      </div>
      <p className="mt-1 text-xs text-parch-faint">
        {w.trait} · {w.range} · {w.burden} · {w.physical_or_magical}
      </p>
      {w.feat_name ? (
        <p className="mt-2 text-xs leading-relaxed text-parch-dim">
          <span className="font-display text-parch">{w.feat_name}:</span>{" "}
          {w.feat_text}
        </p>
      ) : null}
    </ChoiceCard>
  );
}

export function StepEquipment() {
  const primaryWeapon = useCreator((s) => s.primaryWeapon);
  const secondaryWeapon = useCreator((s) => s.secondaryWeapon);
  const armor = useCreator((s) => s.armor);
  const potion = useCreator((s) => s.potion);
  const className = useCreator((s) => s.className);
  const update = useCreator((s) => s.update);

  const primaries = tier1Weapons("Primary");
  const secondaries = tier1Weapons("Secondary");
  const armors = tier1Armor();

  const primary = getWeapon(primaryWeapon);
  const twoHanded = primary?.burden === "Two-Handed";

  const applySuggested = () => {
    const k = getClass(className);
    if (!k) return;
    update({
      primaryWeapon: k.suggested_primary || null,
      secondaryWeapon: k.suggested_secondary || null,
      armor: k.suggested_armor || null,
    });
  };

  return (
    <div>
      <StepHeader
        eyebrow="Capítulo V · El arsenal"
        title="Elige tu equipo inicial"
        intro="Escoge de las tablas de Tier 1: un arma primaria a dos manos, o una primaria a una mano más una secundaria a una mano, y un juego de armadura. Además llevas una antorcha, 50 pies de cuerda, suministros básicos y un puñado de oro."
      />

      <div className="mb-5 flex items-center gap-3 rise">
        <span className="eyebrow">Tier 1</span>
        <div className="ml-auto">
          {className ? (
            <Button variant="ghost" onClick={applySuggested}>
              Usar sugerencia de la clase
            </Button>
          ) : null}
        </div>
      </div>

      <section className="rise">
        <p className="eyebrow mb-3">Arma primaria</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {primaries.map((w) => {
            const selected = w.name === primaryWeapon;
            return (
              <WeaponCard
                key={w.name}
                w={w}
                selected={selected}
                onClick={() =>
                  update({
                    primaryWeapon: selected ? null : w.name,
                    secondaryWeapon:
                      w.burden === "Two-Handed" ? null : secondaryWeapon,
                  })
                }
              />
            );
          })}
        </div>
      </section>

      <div className="rule my-8" />

      <section className="rise">
        <p className="eyebrow mb-3">
          Arma secundaria{" "}
          {twoHanded ? (
            <span className="ml-2 normal-case tracking-normal text-parch-faint">
              — no disponible con una primaria a dos manos
            </span>
          ) : (
            <span className="ml-2 normal-case tracking-normal text-parch-faint">
              — opcional
            </span>
          )}
        </p>
        <div
          className={cn(
            "grid gap-3 sm:grid-cols-2 lg:grid-cols-3",
            twoHanded && "pointer-events-none opacity-40"
          )}
        >
          {secondaries.map((w) => {
            const selected = w.name === secondaryWeapon;
            return (
              <WeaponCard
                key={w.name}
                w={w}
                selected={selected}
                disabled={twoHanded}
                onClick={() =>
                  update({ secondaryWeapon: selected ? null : w.name })
                }
              />
            );
          })}
        </div>
      </section>

      <div className="rule my-8" />

      <section className="rise">
        <p className="eyebrow mb-3">Armadura</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {armors.map((a) => {
            const selected = a.name === armor;
            return (
              <ChoiceCard
                key={a.name}
                selected={selected}
                onClick={() => update({ armor: selected ? null : a.name })}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <p className="font-display text-base text-parch">{a.name}</p>
                  <span className="font-display text-sm text-ember">
                    {a.base_thresholds}
                  </span>
                </div>
                <p className="mt-1 text-xs text-parch-faint">
                  Base Score {a.base_score}
                  {a.evasion ? ` · Evasion ${a.evasion}` : ""}
                </p>
                {a.feat_name ? (
                  <p className="mt-2 text-xs leading-relaxed text-parch-dim">
                    <span className="font-display text-parch">
                      {a.feat_name}:
                    </span>{" "}
                    {a.feat_text}
                  </p>
                ) : null}
              </ChoiceCard>
            );
          })}
        </div>
      </section>

      <div className="rule my-8" />

      <section className="rise">
        <p className="eyebrow mb-3">Poción inicial</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <ChoiceCard
            selected={potion === "health"}
            onClick={() =>
              update({ potion: potion === "health" ? null : "health" })
            }
          >
            <p className="font-display text-base text-parch">
              Minor Health Potion
            </p>
            <p className="mt-1 text-xs text-parch-dim">Recupera 1d4 Hit Points.</p>
          </ChoiceCard>
          <ChoiceCard
            selected={potion === "stamina"}
            onClick={() =>
              update({ potion: potion === "stamina" ? null : "stamina" })
            }
          >
            <p className="font-display text-base text-parch">
              Minor Stamina Potion
            </p>
            <p className="mt-1 text-xs text-parch-dim">Limpia 1d4 de Stress.</p>
          </ChoiceCard>
        </div>
      </section>
    </div>
  );
}
