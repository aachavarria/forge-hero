"use client";

import { getClass, getSubclass } from "@/lib/data";
import { deriveStats } from "@/lib/derive";
import { useCreator } from "@/lib/store";
import type { CharacterDraft } from "@/lib/types";
import { ClassIcon } from "@/components/icons/GameIcon";

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: React.ReactNode;
  accent?: string;
}) {
  return (
    <div className="flex flex-col items-center px-3">
      <span
        className="font-display text-lg leading-none"
        style={{ color: accent ?? "var(--color-ember)" }}
      >
        {value}
      </span>
      <span className="mt-0.5 text-[0.58rem] uppercase tracking-[0.16em] text-parch-faint">
        {label}
      </span>
    </div>
  );
}

export function StatBar() {
  const state = useCreator();
  const draft = state as unknown as CharacterDraft;
  const klass = getClass(draft.className);
  const sub = getSubclass(draft.subclassName);
  const stats = deriveStats(draft);

  return (
    <div className="panel flex flex-wrap items-center gap-y-3 px-3 py-3">
      <div className="flex min-w-0 flex-1 items-center gap-3 px-2">
        {klass ? (
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[color:var(--color-line)] bg-[color:var(--color-ink-800)] text-ember">
            <ClassIcon name={klass.name} size={22} color="var(--color-ember)" />
          </span>
        ) : null}
        <div className="min-w-0">
          <p className="truncate font-display text-base text-parch">
            {draft.name || "Héroe sin nombre"}
          </p>
          <p className="truncate text-xs text-parch-faint">
            {[draft.ancestryName, klass?.name, sub?.name]
              .filter(Boolean)
              .join(" · ") || "Comienza tu historia"}
          </p>
        </div>
      </div>
      <div className="flex items-stretch divide-x divide-[color:var(--color-line-soft)]">
        <Stat label="Eva" value={stats.evasion} />
        <Stat label="HP" value={stats.hp} />
        <Stat label="Stress" value={stats.stress} />
        <Stat label="Hope" value={stats.hope} accent="var(--color-hope)" />
        {stats.thresholds ? (
          <Stat
            label="Umbrales"
            value={`${stats.thresholds.major}/${stats.thresholds.severe}`}
          />
        ) : null}
      </div>
    </div>
  );
}
