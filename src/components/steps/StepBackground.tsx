"use client";

import { getClass } from "@/lib/data";
import { useCreator } from "@/lib/store";
import { FieldLabel, Hint, StepHeader } from "@/components/ui";

export function StepBackground() {
  const className = useCreator((s) => s.className);
  const backgroundAnswers = useCreator((s) => s.backgroundAnswers);
  const backgroundExtra = useCreator((s) => s.backgroundExtra);
  const setBackgroundAnswer = useCreator((s) => s.setBackgroundAnswer);
  const update = useCreator((s) => s.update);

  const klass = getClass(className);

  return (
    <div>
      <StepHeader
        eyebrow="Capítulo VII · El pasado"
        title="Escribe tu trasfondo"
        intro="Responde las preguntas que te inspiren, o ignóralas y escribe tu propia historia. El trasfondo no tiene efecto mecánico, pero define quién es tu héroe y qué preparará la GM para ti."
      />

      {!klass ? (
        <Hint>Elige una clase para ver sus preguntas de trasfondo.</Hint>
      ) : (
        <div className="grid gap-6 rise">
          {klass.backgrounds.map((b) => (
            <FieldLabel key={b.question} label="Pregunta">
              <p className="mb-2 font-display text-base italic text-parch">
                {b.question}
              </p>
              <textarea
                className="field"
                rows={2}
                placeholder="Escribe tan poco o tanto como quieras…"
                value={backgroundAnswers[b.question] ?? ""}
                onChange={(e) =>
                  setBackgroundAnswer(b.question, e.target.value)
                }
              />
            </FieldLabel>
          ))}

          <FieldLabel label="Algo más" hint="opcional">
            <textarea
              className="field"
              rows={3}
              placeholder="Orígenes, secretos, cicatrices, ambiciones…"
              value={backgroundExtra}
              onChange={(e) => update({ backgroundExtra: e.target.value })}
            />
          </FieldLabel>
        </div>
      )}
    </div>
  );
}
