"use client";

import { useCreator } from "@/lib/store";
import { FieldLabel, StepHeader } from "@/components/ui";

export function StepIdentity() {
  const name = useCreator((s) => s.name);
  const update = useCreator((s) => s.update);

  return (
    <div>
      <StepHeader
        eyebrow="Capítulo I · El recipiente"
        title="Nombra a tu héroe"
        intro="Toda leyenda empieza con un nombre dicho en voz alta. Puedes volver y ajustar cualquier cosa más tarde: nada queda escrito en tinta hasta que tú lo decidas."
      />

      <div className="grid gap-6 sm:max-w-lg rise">
        <FieldLabel label="Nombre del personaje" hint="obligatorio para terminar">
          <input
            className="field font-display text-lg"
            placeholder="p. ej. Vesper Quill"
            value={name}
            onChange={(e) => update({ name: e.target.value })}
            autoFocus
          />
        </FieldLabel>
      </div>

      {name.trim() ? (
        <p className="mt-8 font-display text-xl text-parch-dim rise">
          Así comienza la historia de{" "}
          <span className="text-ember title-shadow">{name.trim()}</span>
          .
        </p>
      ) : null}
    </div>
  );
}
