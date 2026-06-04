"use client";

import { getClass } from "@/lib/data";
import { useCreator } from "@/lib/store";
import { FieldLabel, Hint, StepHeader } from "@/components/ui";

export function StepConnections() {
  const className = useCreator((s) => s.className);
  const connectionAnswers = useCreator((s) => s.connectionAnswers);
  const connectionExtra = useCreator((s) => s.connectionExtra);
  const setConnectionAnswer = useCreator((s) => s.setConnectionAnswer);
  const update = useCreator((s) => s.update);

  const klass = getClass(className);

  return (
    <div>
      <StepHeader
        eyebrow="Capítulo IX · Los lazos"
        title="Imagina tus conexiones"
        intro="Las conexiones son las relaciones entre los héroes del grupo. En la mesa harías estas preguntas a otros jugadores — aquí, anota ideas o las respuestas que te gustaría escuchar."
      />

      {!klass ? (
        <Hint>Elige una clase para ver sus preguntas de conexión.</Hint>
      ) : (
        <div className="grid gap-6 rise">
          {klass.connections.map((c) => (
            <FieldLabel key={c.question} label="Pregunta">
              <p className="mb-2 font-display text-base italic text-parch">
                {c.question}
              </p>
              <textarea
                className="field"
                rows={2}
                placeholder="Un nombre, un recuerdo, una deuda pendiente…"
                value={connectionAnswers[c.question] ?? ""}
                onChange={(e) =>
                  setConnectionAnswer(c.question, e.target.value)
                }
              />
            </FieldLabel>
          ))}

          <FieldLabel label="Conexión propia" hint="opcional">
            <textarea
              className="field"
              rows={3}
              placeholder="Inventa tu propia conexión con otro héroe del grupo…"
              value={connectionExtra}
              onChange={(e) => update({ connectionExtra: e.target.value })}
            />
          </FieldLabel>
        </div>
      )}
    </div>
  );
}
