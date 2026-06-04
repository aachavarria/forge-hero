"use client";

import { useMemo, useState, type ReactNode } from "react";
import type { CardRecord, Collection } from "@/lib/cards";
import { DaggerheartCard } from "./DaggerheartCard";

const COLLECTION_LABELS: Record<Collection, string> = {
  domain: "Domains",
  subclass: "Subclasses",
  community: "Communities",
  ancestry: "Ancestries",
};

const COLLECTION_ORDER: Collection[] = [
  "subclass",
  "domain",
  "community",
  "ancestry",
];

function uniqueSorted(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b));
}

export function CardGallery({ cards }: { cards: CardRecord[] }) {
  const [collection, setCollection] = useState<Collection>("subclass");
  const [group, setGroup] = useState<string>("all");
  const [type, setType] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [hidePlaytest, setHidePlaytest] = useState(false);

  const inCollection = useMemo(
    () => cards.filter((c) => c.collection === collection),
    [cards, collection],
  );

  const groups = useMemo(
    () => uniqueSorted(inCollection.map((c) => c.group)),
    [inCollection],
  );
  const types = useMemo(
    () => uniqueSorted(inCollection.map((c) => c.type)),
    [inCollection],
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return inCollection.filter((c) => {
      if (group !== "all" && c.group !== group) return false;
      if (type !== "all" && c.type !== type) return false;
      if (hidePlaytest && c.playtestOnly) return false;
      if (q && !c.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [inCollection, group, type, query, hidePlaytest]);

  function pickCollection(next: Collection) {
    setCollection(next);
    setGroup("all");
    setType("all");
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Collection tabs */}
      <div className="flex flex-wrap gap-2">
        {COLLECTION_ORDER.map((c) => {
          const count = cards.filter((x) => x.collection === c).length;
          const active = c === collection;
          return (
            <button
              key={c}
              onClick={() => pickCollection(c)}
              className={`rounded-full border px-4 py-1.5 text-sm transition ${
                active
                  ? "border-ember bg-ember/15 text-ember-bright"
                  : "border-line text-parch-dim hover:text-parch"
              }`}
            >
              {COLLECTION_LABELS[c]}
              <span className="ml-1.5 opacity-60">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Secondary filters */}
      <div className="flex flex-col gap-3">
        {groups.length > 1 && (
          <Chips
            label={collection === "domain" ? "Domain" : "Class"}
            value={group}
            options={groups}
            onChange={setGroup}
          />
        )}
        {types.length > 1 && (
          <Chips label="Type" value={type} options={types} onChange={setType} />
        )}
        <div className="flex flex-wrap items-center gap-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name…"
            className="w-56 rounded-md border border-line bg-ink-700/60 px-3 py-1.5 text-sm text-parch placeholder:text-parch-faint focus:border-ember focus:outline-none"
          />
          <label className="flex items-center gap-1.5 text-xs text-parch-dim">
            <input
              type="checkbox"
              checked={hidePlaytest}
              onChange={(e) => setHidePlaytest(e.target.checked)}
              className="accent-ember"
            />
            Hide playtest-only
          </label>
          <span className="ml-auto text-xs text-parch-faint">
            {visible.length} card{visible.length === 1 ? "" : "s"}
          </span>
        </div>
      </div>

      {/* Grid */}
      {visible.length === 0 ? (
        <p className="py-16 text-center text-parch-faint">No cards match.</p>
      ) : (
        <div className="flex flex-wrap justify-center gap-6">
          {visible.map((card) => (
            <DaggerheartCard key={card.id} card={card} />
          ))}
        </div>
      )}
    </div>
  );
}

function Chips({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="eyebrow mr-1">{label}</span>
      <Chip active={value === "all"} onClick={() => onChange("all")}>
        All
      </Chip>
      {options.map((o) => (
        <Chip key={o} active={value === o} onClick={() => onChange(o)}>
          {o}
        </Chip>
      ))}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-xs transition ${
        active
          ? "border-ember bg-ember/15 text-ember-bright"
          : "border-line text-parch-dim hover:text-parch"
      }`}
    >
      {children}
    </button>
  );
}
