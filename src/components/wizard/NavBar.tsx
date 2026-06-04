"use client";

import { useCreator } from "@/lib/store";
import { STEPS, STEP_COUNT } from "@/lib/steps";
import { isStepComplete, REQUIRED_STEPS } from "@/lib/validation";
import type { CharacterDraft } from "@/lib/types";
import { Button } from "@/components/ui";

export function NavBar() {
  const state = useCreator();
  const step = state.step;
  const next = state.next;
  const prev = state.prev;
  const draft = state as unknown as CharacterDraft;

  const current = STEPS[step];
  const isLast = step === STEP_COUNT - 1;
  const required = REQUIRED_STEPS.has(current.key);
  const complete = isStepComplete(current.key, draft);

  return (
    <div className="mt-8 flex items-center justify-between border-t border-[color:var(--color-line-soft)] pt-5">
      <Button variant="ghost" onClick={prev} disabled={step === 0}>
        ← Atrás
      </Button>

      <span className="text-xs text-parch-faint">
        {required && !complete ? (
          <span className="text-[color:var(--color-crimson)]">
            Este capítulo es obligatorio para terminar
          </span>
        ) : (
          <>
            Paso {step + 1} de {STEP_COUNT}
          </>
        )}
      </span>

      {isLast ? (
        <span className="w-[88px]" />
      ) : (
        <Button onClick={next}>Siguiente →</Button>
      )}
    </div>
  );
}
