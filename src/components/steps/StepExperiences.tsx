"use client";

import { useCreator } from "@/lib/store";
import { cn, FieldLabel, StepHeader } from "@/components/ui";

const EXAMPLES = [
  "Cazarrecompensas",
  "Monarca caído",
  "Médico de campaña",
  "Labia de plata",
  "Curtido en batalla",
  "Lobo solitario",
  "Maestro del disfraz",
  "Tirador certero",
  "Susurrador de animales",
  "Manos rápidas",
  "Memoria fotográfica",
  "Lobo con piel de cordero",
  "No te fallaré",
  "Atrápame si puedes",
];

export function StepExperiences() {
  const experiences = useCreator((s) => s.experiences);
  const setExperience = useCreator((s) => s.setExperience);

  const emptyIndex = experiences.findIndex((e) => !e.name.trim());

  return (
    <div>
      <StepHeader
        eyebrow="Capítulo VIII · Lo vivido"
        title="Define dos experiencias"
        intro="Una Experience es una palabra o frase que resume habilidades, rasgos o aptitudes que tu héroe ha ganado en la vida. Gasta un Hope para sumar el modificador de una Experience relevante a una tirada. Empiezas con dos, cada una a +2."
      />

      <div className="grid gap-4 sm:max-w-2xl rise">
        {experiences.map((exp, i) => (
          <div
            key={i}
            className="flex items-end gap-3 rounded-[var(--radius-tome)] border border-[color:var(--color-line-soft)] bg-[color:var(--color-ink-700)] p-4"
          >
            <div className="flex-1">
              <FieldLabel label={`Experience ${i + 1}`}>
                <input
                  className="field"
                  placeholder="p. ej. Médico de campaña"
                  value={exp.name}
                  onChange={(e) => setExperience(i, { name: e.target.value })}
                />
              </FieldLabel>
            </div>
            <div className="w-20 text-center">
              <span className="mb-1.5 block font-display text-sm uppercase tracking-[0.16em] text-parch-dim">
                Mod
              </span>
              <div className="flex h-[46px] items-center justify-center rounded-[var(--radius-tome)] border border-[color:var(--color-ember)]/40 font-display text-xl text-ember">
                +{exp.modifier}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-7 rise">
        <p className="eyebrow mb-3">¿Inspiración?</p>
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => {
            const taken = experiences.some((e) => e.name === ex);
            return (
              <button
                key={ex}
                type="button"
                disabled={taken || emptyIndex === -1}
                onClick={() => {
                  if (emptyIndex !== -1) setExperience(emptyIndex, { name: ex });
                }}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-sm transition-all",
                  taken
                    ? "border-[color:var(--color-ember)]/40 text-ember"
                    : emptyIndex === -1
                      ? "cursor-not-allowed border-[color:var(--color-line-soft)] text-parch-faint opacity-50"
                      : "border-[color:var(--color-line-soft)] text-parch-dim hover:border-[color:var(--color-ember)] hover:text-ember"
                )}
              >
                {ex}
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-parch-faint">
          Consejo: una Experience no debe ser demasiado amplia
          (&ldquo;Afortunado&rdquo;) ni conceder poderes explícitos
          (&ldquo;Invulnerable&rdquo;).
        </p>
      </div>
    </div>
  );
}
