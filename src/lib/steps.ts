export interface StepMeta {
  key: string;
  /** Evocative chapter title. */
  title: string;
  /** Plain-language description of what happens here. */
  subtitle: string;
  /** Roman-ish chapter mark shown in the spine. */
  mark: string;
}

export const STEPS: StepMeta[] = [
  { key: "identity", title: "El recipiente", subtitle: "Nombre", mark: "I" },
  { key: "class", title: "La vocación", subtitle: "Clase y subclase", mark: "II" },
  { key: "heritage", title: "El linaje", subtitle: "Ascendencia y comunidad", mark: "III" },
  { key: "traits", title: "Las aptitudes", subtitle: "Asignar traits", mark: "IV" },
  { key: "equipment", title: "El arsenal", subtitle: "Armas y armadura", mark: "V" },
  { key: "domains", title: "Las arcanas", subtitle: "Cartas de dominio", mark: "VI" },
  { key: "background", title: "El pasado", subtitle: "Trasfondo", mark: "VII" },
  { key: "experiences", title: "Lo vivido", subtitle: "Experiencias", mark: "VIII" },
  { key: "connections", title: "Los lazos", subtitle: "Conexiones", mark: "IX" },
  { key: "portrait", title: "El retrato", subtitle: "Conjurar una imagen", mark: "X" },
  { key: "review", title: "El héroe", subtitle: "Resumen y exportar", mark: "XI" },
];

export const STEP_COUNT = STEPS.length;
