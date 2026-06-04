"use client";

import { type ReactNode } from "react";

export function cn(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}

// ── Section header used at the top of every step ──────────────────────────
export function StepHeader({
  eyebrow,
  title,
  intro,
}: {
  eyebrow: string;
  title: string;
  intro?: ReactNode;
}) {
  return (
    <header className="mb-7 rise">
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="font-display text-3xl sm:text-4xl text-parch title-shadow mt-2">
        {title}
      </h2>
      {intro ? (
        <p className="mt-3 max-w-2xl text-[0.98rem] leading-relaxed text-parch-dim">
          {intro}
        </p>
      ) : null}
      <div className="rule mt-5" />
    </header>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="eyebrow">{children}</p>;
}

// ── Selectable card / tile ────────────────────────────────────────────────
export function ChoiceCard({
  selected,
  disabled,
  accent = "var(--color-ember)",
  onClick,
  children,
  className,
}: {
  selected?: boolean;
  disabled?: boolean;
  accent?: string;
  onClick?: () => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      style={
        {
          "--accent": accent,
        } as React.CSSProperties
      }
      className={cn(
        "group relative w-full text-left rounded-[var(--radius-tome)] p-4 transition-all duration-200",
        "border",
        selected
          ? "border-[color:var(--accent)] bg-[color:var(--color-ink-600)]"
          : "border-[color:var(--color-line-soft)] bg-[color:var(--color-ink-700)] hover:border-[color:var(--accent)]/60",
        !selected && !disabled && "hover:-translate-y-0.5",
        disabled && "opacity-40 cursor-not-allowed",
        selected &&
          "shadow-[0_0_0_1px_var(--accent),0_18px_40px_-26px_var(--accent)]",
        className
      )}
    >
      {/* selected glow wash */}
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 rounded-[var(--radius-tome)] opacity-0 transition-opacity duration-300",
          selected ? "opacity-100" : "group-hover:opacity-60"
        )}
        style={{
          background: `radial-gradient(120% 80% at 0% 0%, color-mix(in srgb, var(--accent) 12%, transparent), transparent 60%)`,
        }}
      />
      {selected ? (
        <span
          aria-hidden
          className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full text-[11px] text-ink-900"
          style={{ background: "var(--accent)" }}
        >
          ✓
        </span>
      ) : null}
      <div className="relative z-[1]">{children}</div>
    </button>
  );
}

// ── Domain / class medallion ──────────────────────────────────────────────
export function Medallion({
  glyph,
  color = "var(--color-ember)",
  size = 40,
  label,
}: {
  glyph: string;
  color?: string;
  size?: number;
  label?: string;
}) {
  return (
    <span
      aria-label={label}
      className="inline-flex shrink-0 items-center justify-center rounded-full"
      style={{
        width: size,
        height: size,
        color,
        border: `1px solid color-mix(in srgb, ${color} 55%, transparent)`,
        background: `radial-gradient(circle at 50% 30%, color-mix(in srgb, ${color} 22%, transparent), transparent 70%)`,
        fontSize: size * 0.5,
        lineHeight: 1,
      }}
    >
      {glyph}
    </span>
  );
}

// ── Small stat chip ───────────────────────────────────────────────────────
export function StatChip({
  label,
  value,
  accent = "var(--color-ember)",
  hint,
}: {
  label: string;
  value: ReactNode;
  accent?: string;
  /** Optional small note below the label (e.g. "empieza en 10"). */
  hint?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center rounded-[var(--radius-tome)] border border-[color:var(--color-line-soft)] bg-[color:var(--color-ink-800)] px-3 py-2">
      <span
        className="font-display text-xl leading-none"
        style={{ color: accent }}
      >
        {value}
      </span>
      <span className="mt-1 text-[0.62rem] uppercase tracking-[0.18em] text-parch-faint">
        {label}
      </span>
      {hint ? (
        <span className="mt-0.5 text-[0.58rem] normal-case tracking-normal text-parch-faint/70">
          {hint}
        </span>
      ) : null}
    </div>
  );
}

// ── Buttons ───────────────────────────────────────────────────────────────
export function Button({
  variant = "primary",
  children,
  className,
  ...props
}: {
  variant?: "primary" | "ghost" | "danger";
  children: ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-[var(--radius-tome)] px-5 py-2.5 font-display text-sm uppercase tracking-[0.18em] transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40",
        variant === "primary" &&
          "bg-[color:var(--color-ember)] text-ink-900 hover:bg-[color:var(--color-ember-bright)] hover:shadow-[0_10px_30px_-12px_var(--color-ember)]",
        variant === "ghost" &&
          "border border-[color:var(--color-line)] text-parch-dim hover:text-parch hover:border-[color:var(--color-ember)]",
        variant === "danger" &&
          "border border-[color:var(--color-crimson)]/40 text-[color:var(--color-crimson)] hover:bg-[color:var(--color-crimson)]/10",
        className
      )}
    >
      {children}
    </button>
  );
}

// ── Empty / hint state ────────────────────────────────────────────────────
export function Hint({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-[var(--radius-tome)] border border-dashed border-[color:var(--color-line-soft)] bg-[color:var(--color-ink-800)]/50 px-5 py-8 text-center text-sm text-parch-faint">
      {children}
    </div>
  );
}

// ── Field label wrapper ───────────────────────────────────────────────────
export function FieldLabel({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-baseline justify-between">
        <span className="font-display text-sm uppercase tracking-[0.16em] text-parch-dim">
          {label}
        </span>
        {hint ? (
          <span className="text-xs text-parch-faint">{hint}</span>
        ) : null}
      </span>
      {children}
    </label>
  );
}
