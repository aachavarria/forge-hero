# The Witherwild — Intro interactiva (plan)

> Experiencia web tipo "intro de videojuego" que presenta el *pitch* y la introducción
> de la campaña **The Witherwild** (Daggerheart CRB 254–261), en español, con texto +
> arte generado por IA. Pensada como un canvas / pase de escenas cinematográfico.

**Estado:** propuesta para revisar. Aún no se ha escrito código ni generado imágenes.

---

## 1. Decisiones tomadas

| Tema | Decisión |
|---|---|
| **Alcance** | Casi todo el capítulo: Pitch + Overview + Distinctions + Inciting Incident, condensado a beats cinematográficos. |
| **Imágenes** | Pre-generadas una vez con Gemini, curadas y guardadas en `public/witherwild/`. La web sirve estáticos (rápido, consistente, sin costo por visita). |
| **Navegación** | Manual estilo intro de juego: click / →  / Espacio avanza, ← retrocede, "Saltar" salta al final. Texto con fade/typewriter sobre imagen con leve zoom (Ken Burns). |
| **Dónde vive** | Nueva ruta `/witherwild` dentro de la app `pjcreator` (reutiliza Next 16, Tailwind v4, `motion` y el endpoint Gemini ya configurados). |

---

## 2. Concepto y tono

Un pase de ~18 escenas a pantalla completa. Cada escena = una imagen pintada + un beat de
texto breve (1–3 frases). El usuario avanza a su ritmo. Al final, un CTA enlaza al creador
de personajes (`/`): **"Forja tu héroe"**.

- **Tono/feel (del libro):** Aventurero · Dinámico · Épico · Heroico · Trepidante · Inquietante · Caprichoso.
- **Temas:** Choque cultural · El fin justifica los medios · Duelo · Gente vs. Naturaleza · Transformación · Supervivencia.
- **Touchstones (guía visual):** *La Princesa Mononoke*, *The Legend of Zelda*, *The Dark Crystal*, *Nausicaä del Valle del Viento*.
- **Principio rector del arte (GM Principle "Paint the World in Contrast"):** belleza que aterra y pesadilla que encanta. Dualidades fuertes: día/noche, Fanewick/Haven, vida/decadencia.

### Decisiones de traducción (revisables)
Mantengo los nombres propios en su forma original y añado glosa en español la 1ª vez:

| Original | En la experiencia |
|---|---|
| Fanewick / Haven | se mantienen |
| Witherwild | **el Witherwild** (glosa: "la Espesura Marchita") |
| Wicklings | **los Wicklings** (gente de Fanewick) |
| Faint Divinities | **las Divinidades Tenues** |
| Nikta, the Great Owl / Shepherd of the Seasons | **Nikta, la Gran Lechuza / la Pastora de las Estaciones** |
| Reaping Eye / Sowing Eye | **el Ojo de la Siega / el Ojo de la Siembra** |
| Shun'Aush the Granite Ophid | **Shun'Aush, el Ofidio de Granito** |
| Serpent's Sickness | **el Mal de la Serpiente** |
| crimson lady's veil | **el velo de dama carmesí** |
| Withered | **los Marchitos** |
| night bloom | **flor nocturna** |
| Fanewraith / Kreil Dirn / Archmage Phylax / Alula | se mantienen |

> Si prefieres traducir también Witherwild/Haven, o dejar todo en inglés, lo ajustamos.

---

## 3. Arquitectura técnica

Todo dentro de la app existente. Stack: Next 16.2.6 (App Router), React 19, Tailwind v4,
`motion` (animaciones, ya es dependencia), Zustand (no imprescindible aquí).

```
src/app/witherwild/
  page.tsx            ← server component: carga las escenas y monta el reproductor
  WitherwildIntro.tsx ← client component: estado de escena, teclado, transiciones
  scene-frame.tsx     ← una escena (imagen Ken Burns + texto animado)
  controls.tsx        ← barra de progreso, botones prev/next/saltar, hint de teclado
src/data/witherwild/
  scenes.ts           ← array declarativo de escenas (texto ES, imagen, movimiento)
public/witherwild/
  00-cover.png … 17-cta.png   ← imágenes pre-generadas (estáticas)
scripts/
  gen-witherwild-art.mjs      ← script de generación (corre 1 vez, llama a Gemini)
```

### Modelo de datos (`scenes.ts`)
```ts
export type Scene = {
  id: string;          // "00-cover"  (también es el nombre del PNG)
  act?: string;        // "Acto II · Haven"  (kicker pequeño arriba)
  kind: "cover" | "lore" | "people" | "hook" | "cta";
  image: string;       // "/witherwild/00-cover.png"
  alt: string;         // texto alternativo (accesibilidad), en ES
  title?: string;      // título de la escena
  body?: string;       // prosa ES (1–3 frases)
  caption?: string;    // nota pequeña / crédito / atribución
  ken?: "in" | "out" | "left" | "right";  // dirección del zoom Ken Burns
  textPos?: "center" | "bottom" | "left";  // colocación del bloque de texto
};
```

### Reproductor (`WitherwildIntro.tsx`)
- Estado: `index` (escena actual).
- **Teclado:** `→`/`Espacio`/`Enter` → siguiente · `←` → anterior · `Esc` → saltar al CTA.
- **Ratón/táctil:** click en mitad derecha avanza, mitad izquierda retrocede; swipe en móvil.
- **Transición entre escenas:** crossfade (~600 ms) con `motion` (`AnimatePresence`).
- **Dentro de la escena:**
  - Imagen con **Ken Burns** (zoom/desplazamiento lento ~12 s) según `ken`.
  - **Texto** entra con fade-up; opción de efecto **máquina de escribir** para el `body`.
  - Degradado oscuro (scrim) sobre la imagen para legibilidad del texto.
- **Controles (`controls.tsx`):** barra/puntos de progreso, flechas, botón **Saltar**, y en la 1ª escena un hint "Pulsa para comenzar".
- **CTA final:** botón **"Forja tu héroe"** → `Link` a `/`.

### Accesibilidad y rendimiento
- `prefers-reduced-motion`: desactiva Ken Burns y typewriter (texto aparece directo).
- **Precarga** de la imagen de la escena siguiente (y `priority` en la portada).
- Imágenes optimizadas con `next/image`; alt en español por escena.
- Funciona con teclado y lector de pantalla; foco visible en controles.

### Despliegue
Sin cambios de infra: se despliega con el mismo flujo Cloudflare/OpenNext ya configurado.
Las imágenes son estáticos en `public/`, así que **no** dependen de R2 ni de la API en runtime.

---

## 4. Estructura de escenas (guion)

18 escenas (0–17) en 7 actos. El texto es **prosa cinematográfica condensada** del SRD, no
el volcado completo (el libro es la fuente; aquí buscamos ritmo de intro). Cada escena indica
la **imagen** que hay que generar (detalle del prompt en §5).

> Convención: el `id` de la escena = nombre del archivo PNG.

### Portada
- **`00-cover`** — *The Witherwild*
  - **Texto:** título grande "The Witherwild" · tagline: *"Cuando una nación invasora ataca a una antigua deidad del bosque, una virulenta sobrevegetación se extiende por la tierra."* · crédito: *Diseñada por Carlos Cisco, Rowan Hall y Spenser Starke* · "Pulsa para comenzar".
  - **Imagen:** key art — bosque de Fanewick desbordado por sobrevegetación corrupta, silueta colosal de una lechuza al fondo, luz dorada e inquietante.

### Acto I · Fanewick salvaje
- **`01-fanewick`** — Una tierra salvaje y abundante
  - **Texto:** Fanewick fue un lugar de gran abundancia y paz: peligroso para quien no la conocía, una cornucopia para quien respetaba sus reglas. Bosques oscuros y retorcidos, llenos de pequeños milagros… y de trampas.
  - **Imagen:** bosque exuberante, salvaje, luz dorada entre la niebla; sensación de asombro.
- **`02-wicklings`** — Los Wicklings
  - **Texto:** Esta tierra forja gente dura: los **Wicklings**, lo bastante audaces para criar familias donde otros no se atreven, y que siguen al pie de la letra las reglas que los mantienen con vida.
  - **Imagen:** gente de Fanewick — cazadores, historiadores y artesanos; familias curtidas en un poblado del bosque; ropas de cuero y planta.
- **`03-divinities`** — Las Divinidades Tenues
  - **Texto:** Los dioses de Fanewick caminan la tierra como seres encarnados. Hacen pequeños milagros a cambio de tributo… o desvían al viajero del sendero hacia su ruina. (Fulg apila piedras de río; Ikla pinta el cielo; Oove susurra en la noche.)
  - **Imagen:** pequeños dioses/espíritus tutelares caprichosos entre el follaje; encantadores e inquietantes a la vez.
- **`04-bogs`** — Las ciénagas
  - **Texto:** Campos en apariencia inofensivos ocultan ciénagas que se tragan ejércitos enteros, devorando artillería tan rápido como cruza la frontera.
  - **Imagen:** ciénaga brumosa engullendo armaduras y artillería pesada; quietud amenazante.

### Acto II · Haven
- **`05-haven`** — La Puerta Sin Dioses
  - **Texto:** Haven fue la mayor potencia de la región. Sobre sus altos muros de piedra se lee *"La Puerta Sin Dioses"*: sus fundadores quisieron librarse de la influencia de las Divinidades Tenues.
  - **Imagen:** muros de piedra colosales, ciudad sombría y ordenada; grandeza fría tras las murallas.
- **`06-shunaush`** — Shun'Aush, el Ofidio de Granito
  - **Texto:** Para lograrlo mataron a una de las deidades más poderosas: **Shun'Aush, el Ofidio de Granito**. Construyeron su hogar tras sus restos: los muros mismos que dieron fama a Haven. Pero la serpiente tendría su venganza.
  - **Imagen:** deidad serpiente colosal de piedra/granito cuyos restos forman murallas; escamas como sillares.
- **`07-sickness`** — El Mal de la Serpiente
  - **Texto:** El polvo de sus escamas se posó en la tierra. Siglos después brotó el **Mal de la Serpiente**: primero tos de polvo, luego una erupción escamada, y al fin la carne se petrifica. Las víctimas se vuelven estatuas allí donde caen.
  - **Imagen:** ciudadanos petrificándose en estatuas de agonía; piel agrietada como escamas; polvo como hueso molido.

### Acto III · La invasión
- **`08-ladys-veil`** — El velo de dama carmesí
  - **Texto:** El Archimago Phylax halló la cura: una rara flor roja, el **velo de dama carmesí**. Florece por toda Fanewick… pero por cada diez mil flores blancas, solo una nace roja.
  - **Imagen:** campo de flores blancas con una única flor carmesí destacando; primavera luminosa.
- **`09-invasion`** — Haven invade Fanewick
  - **Texto:** Desesperada por salvar a su pueblo, Haven invadió Fanewick para cosechar los escasos capullos rojos, internándose en lo más profundo del bosque.
  - **Imagen:** ejército de Haven marchando hacia el bosque profundo; estandartes, fuego, orden militar contra naturaleza salvaje.
- **`10-nikta`** — El robo del Ojo de la Siega
  - **Texto:** Bajo la guía de Phylax, arrancaron el **Ojo de la Siega** a la divinidad más poderosa: **Nikta, la Gran Lechuza, la Pastora de las Estaciones**, que con su mirada hacía girar el ciclo de las estaciones.
  - **Imagen:** lechuza-diosa gigante y cósmica, majestuosa y herida, a la que le falta un ojo; estaciones girando a su alrededor.
- **`11-eternal-spring`** — La primavera eterna
  - **Texto:** Sin su Ojo de la Siega, Nikta solo puede mirar con el **Ojo de la Siembra**, forzando a la tierra a una **primavera eterna**. Lo que parecía un don pronto se volvió un azote.
  - **Imagen:** primavera antinatural y sin fin; crecimiento desbocado; belleza excesiva que incomoda.

### Acto IV · El Witherwild
- **`12-witherwild`** — El Witherwild se desata
  - **Texto:** Así nació el **Witherwild**. La flora y la fauna florecen sin freno: los animales crecen hasta tamaños inmensos, los árboles se retuercen y empiezan a cazar, y las enredaderas estrangulan cuanto tocan.
  - **Imagen:** sobrevegetación monstruosa; árboles que cazan; bestias colosales con colmillos exagerados; verdor que devora hogares.
- **`13-withered`** — Los Marchitos
  - **Texto:** Quien es corrompido por el Witherwild se transforma: un híbrido de persona y planta o bestia. Poco a poco el ansia de consumir reemplaza su personalidad, hasta perder por completo quién fue.
  - **Imagen:** persona transformándose en híbrido planta/bestia; bello y horrible a la vez; mirada que se pierde.

### Acto V · El mundo cambiado
- **`14-day-night`** — Semanas de día y de noche
  - **Texto:** En Fanewick el sol sale durante una semana entera antes de ponerse para una noche igual de larga. De noche florece la **flor nocturna**, bioluminiscente, con olor a azúcar quemado: bendición para quien debe viajar a oscuras.
  - **Imagen:** composición partida día/noche del mismo bosque; flores nocturnas bioluminiscentes iluminando la espesura.

### Acto VI · El detonante (Inciting Incident)
- **`15-fanewraith`** — La Fanewraith
  - **Texto:** Un grupo rebelde secreto, liderado por una figura misteriosa conocida solo como la **Fanewraith**, urde un plan para acabar con la maldición: hallar a Nikta y arrancarle el **Ojo de la Siembra**… sin medir las consecuencias.
  - **Imagen:** líder rebelde enigmática y encapuchada en una aldea entre las copas; sombras, determinación.
- **`16-kreil`** — Kreil Dirn os recluta
  - **Texto:** **Kreil Dirn**, el espía mayor de Haven, descubre el complot y os envía una invitación. No puede mandar soldados al bosque, así que os recluta a vosotros. Empezad la cacería en **Alula**, la aldea entre las copas. ¿Es de fiar? ¿Y qué haréis cuando halléis a la Fanewraith?
  - **Imagen:** maestro de espías de Haven en penumbra entre mapas y velas; al fondo, la aldea-dosel de Alula.

### Acto VII · Cierre
- **`17-cta`** — Da un paso al frente
  - **Texto:** Antes vivíais una vida tranquila en Fanewick o de conquista en Haven. Pero cuando el peligro lo exige, incluso los no preparados —y los que no quieren— deben dar un paso al frente. · **Botón: "Forja tu héroe" → /**
  - **Imagen:** siluetas de héroes improbables alzándose contra la espesura al amanecer; esperanza tensa.

> **Ampliaciones opcionales (si quieres más cuerpo):** una galería de Divinidades Tenues
> (Fulg, Hyacynis, Ikla, Oove, Qui'Gar, Rohkin), un interludio con los *Player/GM Principles*,
> o una escena de las preguntas de la Sesión Cero. Se añaden sin tocar la arquitectura.

---

## 5. Imágenes a generar (manifiesto)

**18 imágenes**, una por escena, en **16:9** (admitido por `gemini-2.5-flash-image`).
El script (§6) antepone un **preámbulo de estilo común** a cada prompt para coherencia visual.

**Preámbulo de estilo (común a todas):**
> *Painterly cinematic fantasy illustration in the spirit of Studio Ghibli's Princess Mononoke
> and Nausicaä, Jim Henson's The Dark Crystal, and The Legend of Zelda. Lush, hand-painted,
> atmospheric, dramatic volumetric lighting, rich detail, awe and unease. Widescreen cinematic
> composition. No text, no words, no letters, no UI, no watermark, no signature.*

**Paletas por región (se añaden al prompt según escena):**
- *Fanewick:* verdes terrosos y musgo, luz dorada, niebla, toques bioluminiscentes.
- *Haven:* piedra gris fría, hierro, orden, motivo de serpiente, luz dura.
- *Witherwild:* verdor exagerado y enfermizo, carmesí de las flores, formas que devoran.

| id | aspect | Sujeto del prompt (se concatena tras el preámbulo + paleta) |
|---|---|---|
| `00-cover` | 16:9 | Key art: an ancient wild forest overrun by corrupted, glowing overgrowth; a colossal owl silhouette looming in the sky; sense of a doomed paradise. |
| `01-fanewick` | 16:9 | A lush untamed primeval forest, golden light through mist, twisting dark trees, a hidden cornucopia, beautiful but dangerous. |
| `02-wicklings` | 16:9 | The Wicklings: hardy folk of the wild forest — hunters, historians, artisans and families in a small woodland settlement, leather-and-plant garb, weathered faces, warm firelight. |
| `03-divinities` | 16:9 | Small whimsical incarnate gods and tutelary spirits among the foliage, charming yet uncanny, offering tiny miracles; capricious nature spirits. |
| `04-bogs` | 16:9 | A vast misty bog silently swallowing heavy armor and artillery, deceptively calm field hiding deadly mire. |
| `05-haven` | 16:9 | The walled city of Haven: colossal grey stone walls, grim ordered architecture, cold grandeur, banners; "The Godless Gate". |
| `06-shunaush` | 16:9 | Shun'Aush the Granite Ophid: a colossal stone serpent deity whose carved remains form the mighty city walls, scales like masonry, ominous. |
| `07-sickness` | 16:9 | The Serpent's Sickness: citizens petrifying into agonized statues, cracked snake-skin rash, bone-like dust; a city becoming a graveyard of stone figures. |
| `08-ladys-veil` | 16:9 | A sunlit field of countless white-petaled flowers with a single rare vivid crimson bloom standing out; the lady's veil. |
| `09-invasion` | 16:9 | Haven's army marching into a deep dark forest, ordered ranks, banners and fire against wild nature, invasion. |
| `10-nikta` | 16:9 | Nikta the Great Owl, a giant cosmic owl-goddess, majestic and wounded, missing one eye, the seasons turning around her. |
| `11-eternal-spring` | 16:9 | An unnatural endless spring: rampant uncontrolled blossoming, excessive unsettling beauty, no decay, oppressive verdancy. |
| `12-witherwild` | 16:9 | The Witherwild: monstrous overgrowth, trees twisting and beginning to hunt, immense beasts with exaggerated tusks and claws, vines strangling homes. |
| `13-withered` | 16:9 | A person being corrupted into a Withered hybrid of human and plant/beast, body warping and intertwining with vines, beautiful and horrifying, fading gaze. |
| `14-day-night` | 16:9 | Split composition of the same forest in long day and long night, bioluminescent night-bloom flowers glowing in the dark half, dual seasons. |
| `15-fanewraith` | 16:9 | A mysterious hooded rebel leader (the Fanewraith) in a treetop village, shadows and resolve, secret insurgency. |
| `16-kreil` | 16:9 | Haven's spymaster in dim candlelight among maps and intelligence, shrewd and dangerous; a distant treetop canopy village (Alula). |
| `17-cta` | 16:9 | Silhouettes of unlikely heroes rising against the towering overgrowth at dawn, tense hope, a stand against the corruption. |

> El script reintenta y permite **regenerar** una imagen suelta borrando su PNG y
> volviendo a correr; así se curan/iteran las que no queden bien.

---

## 6. Script de generación (`scripts/gen-witherwild-art.mjs`)

Node puro, se corre una sola vez en local. Reutiliza la misma llamada a Gemini que
`src/app/api/generate-portrait/route.ts` (modelo `gemini-2.5-flash-image`, `generationConfig.imageConfig.aspectRatio`).

- Lee `GEMINI_API_KEY` del entorno (`.env`).
- Itera el manifiesto de §5; para cada `id`:
  - Si `public/witherwild/<id>.png` **ya existe**, lo salta (idempotente).
  - Construye `preámbulo + paleta + sujeto`, pide 16:9, decodifica el base64 y escribe el PNG.
  - Reintenta hasta N veces ante error de red/cuota; loguea qué generó y qué saltó.
- Uso: `node scripts/gen-witherwild-art.mjs` · regenerar una: `rm public/witherwild/10-nikta.png && node scripts/gen-witherwild-art.mjs`.

> Coste aproximado: 18 imágenes ≈ 18 llamadas (más reintentos puntuales). Solo en build,
> nunca en runtime.

---

## 7. Plan de implementación (fases)

1. **Datos + tipos:** `src/data/witherwild/scenes.ts` con las 18 escenas (texto ES final).
2. **Script de arte:** `scripts/gen-witherwild-art.mjs`; generar y **curar** las 18 imágenes en `public/witherwild/`.
3. **Reproductor:** `WitherwildIntro.tsx` (estado, teclado, ratón/táctil, crossfade) + `scene-frame.tsx` (Ken Burns + texto animado) + `controls.tsx` (progreso, prev/next, saltar).
4. **Ruta:** `src/app/witherwild/page.tsx` que monta el reproductor; portada y CTA a `/`.
5. **Pulido:** `prefers-reduced-motion`, precarga de la siguiente imagen, scrims, foco/teclado, responsive (móvil), revisión de copy.
6. **(Opcional)** enlace de entrada desde `/` ("Ver la introducción de la campaña").

---

## 8. Fuera de alcance (por ahora)

- **Audio/música ambiente** (posible v2: toggle de un loop suave; ojo con autoplay del navegador).
- **i18n** (se entrega solo en español; la estructura permite añadir inglés luego).
- **Editar el guion desde la web** (el texto vive en `scenes.ts`).
- **Generación en vivo** (descartada: usamos estáticos pre-generados).

## 9. Riesgos / preguntas abiertas

- **Coherencia del arte:** 18 imágenes de un modelo pueden variar de estilo. Mitigación: preámbulo común + curación + regenerar las que desentonen. ¿Quieres que algunas compartan personaje/paleta más estrictamente?
- **Longitud:** "casi todo el capítulo" = 18 escenas. ¿Te parece bien ese largo o prefieres más corto (solo Actos I–IV) / más largo (con galería de divinidades y principios)?
- **Tipografía/branding:** ¿reuso el look de "Forge a Hero" o le doy una identidad visual propia (más oscura/épica) a esta intro?
- **Typewriter vs fade** para el texto: ¿lo dejo configurable por escena o uno solo para todo?
