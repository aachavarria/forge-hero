"use client";

import { Fragment, useEffect, useRef } from "react";
import { useCreator } from "@/lib/store";
import { STEPS } from "@/lib/steps";
import { isStepComplete, REQUIRED_STEPS } from "@/lib/validation";
import type { CharacterDraft } from "@/lib/types";
import { cn } from "@/components/ui";

/**
 * Horizontal "spine" rail shown under the header. Scrolls sideways on overflow
 * and keeps the active chapter scrolled into view.
 */
export function Stepper() {
  const state = useCreator();
  const step = state.step;
  const goTo = state.goTo;
  const draft = state as unknown as CharacterDraft;
  const activeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [step]);

  return (
    <nav
      aria-label="Capítulos"
      className="flex items-stretch overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {STEPS.map((s, i) => {
        const active = i === step;
        const done = isStepComplete(s.key, draft);
        const required = REQUIRED_STEPS.has(s.key);
        return (
          <Fragment key={s.key}>
            {i > 0 ? (
              <span
                aria-hidden
                className={cn(
                  "h-px w-3 shrink-0 self-center sm:w-5",
                  i <= step
                    ? "bg-[color:var(--color-ember)]/40"
                    : "bg-[color:var(--color-line-soft)]"
                )}
              />
            ) : null}
            <button
              ref={active ? activeRef : undefined}
              type="button"
              onClick={() => goTo(i)}
              aria-current={active ? "step" : undefined}
              className={cn(
                "group flex shrink-0 items-center gap-2 rounded-[var(--radius-tome)] px-2 py-1.5 transition-colors",
                active
                  ? "bg-[color:var(--color-ink-600)]"
                  : "hover:bg-[color:var(--color-ink-700)]"
              )}
            >
              <span
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border font-display text-[0.65rem] transition-colors",
                  done
                    ? "border-[color:var(--color-ember)] bg-[color:var(--color-ember)] text-ink-900"
                    : active
                      ? "border-[color:var(--color-ember)] text-ember"
                      : "border-[color:var(--color-line-soft)] text-parch-faint"
                )}
              >
                {done ? "✓" : s.mark}
              </span>
              <span className="flex flex-col items-start leading-tight">
                <span
                  className={cn(
                    "whitespace-nowrap font-display text-xs",
                    active
                      ? "text-ember"
                      : "text-parch-dim group-hover:text-parch"
                  )}
                >
                  {s.title}
                  {required && !done ? (
                    <span className="text-[color:var(--color-crimson)]"> ·</span>
                  ) : null}
                </span>
                {active ? (
                  <span className="whitespace-nowrap text-[0.6rem] text-parch-faint">
                    {s.subtitle}
                  </span>
                ) : null}
              </span>
            </button>
          </Fragment>
        );
      })}
    </nav>
  );
}
