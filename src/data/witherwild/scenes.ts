// ── The Witherwild — intro escenas ────────────────────────────────────────
// Guion declarativo de la intro cinemática (ruta /witherwild). El texto es
// prosa condensada (ES) del capítulo The Witherwild (Daggerheart CRB 254–261).
// El `id` de cada escena = nombre del PNG en /public/witherwild/<id>.png, que
// genera scripts/gen-witherwild-art.mjs.

export type SceneKind =
  | "cover"
  | "lore"
  | "people"
  | "hook"
  | "cta"
  // Escenas-guía (puente al creador): briefing antes de forjar el personaje.
  | "communities" // panel interactivo: elige comunidad → rol + preguntas
  | "briefing" // rejilla de notas (clases, linajes)
  | "questions"; // lista de preguntas (Sesión Cero)

/** Dirección del lento zoom/paneo Ken Burns sobre la imagen. */
export type KenDir = "in" | "out" | "left" | "right";

/** Colocación del bloque de texto sobre la escena. */
export type TextPos = "center" | "bottom" | "left";

/** Una entrada de las escenas-guía (una comunidad, una clase, un linaje…). */
export type SceneGroup = {
  name: string;
  /** Descripción / rol en el conflicto. */
  blurb?: string;
  /** Sub-puntos (p. ej. las preguntas de trasfondo de una comunidad). */
  items?: string[];
};

export type Scene = {
  /** Slug estable; también es el nombre del archivo: /witherwild/<id>.png */
  id: string;
  /** Kicker pequeño arriba del título (acto). */
  act?: string;
  kind: SceneKind;
  /** Ruta del arte estático. */
  image: string;
  /** Texto alternativo (accesibilidad), en español. */
  alt: string;
  title?: string;
  /** Prosa principal (1–3 frases) o intro de una escena-guía. */
  body?: string;
  /** Nota pequeña: crédito, atribución o pie. */
  caption?: string;
  ken?: KenDir;
  textPos?: TextPos;
  /** Escenas-guía «communities»/«briefing»: entradas a mostrar. */
  groups?: SceneGroup[];
  /** Escena-guía «questions»: lista de preguntas. */
  questions?: string[];
};

const img = (id: string) => `/witherwild/${id}.png`;

export const SCENES: Scene[] = [
  {
    id: "00-cover",
    kind: "cover",
    image: img("00-cover"),
    alt: "Un bosque antiguo desbordado por una sobrevegetación luminosa y corrupta; al fondo, la silueta colosal de una lechuza.",
    title: "The Witherwild",
    body: "Cuando una nación invasora ataca a una antigua deidad del bosque, una virulenta sobrevegetación se extiende por la tierra.",
    caption: "Una campaña para Daggerheart · Diseñada por Carlos Cisco, Rowan Hall y Spenser Starke",
    ken: "in",
    textPos: "center",
  },

  // ── Acto I · Fanewick salvaje ──────────────────────────────────────────
  {
    id: "01-fanewick",
    act: "Acto I · Fanewick",
    kind: "lore",
    image: img("01-fanewick"),
    alt: "Un bosque primigenio y exuberante, con luz dorada filtrándose entre la niebla y árboles oscuros y retorcidos.",
    title: "Una tierra salvaje y abundante",
    body: "Fanewick fue un lugar de gran abundancia y paz: peligroso para quien no la conocía, una cornucopia para quien respetaba sus reglas. Bosques oscuros y retorcidos, llenos de pequeños milagros… y de trampas.",
    ken: "out",
    textPos: "bottom",
  },
  {
    id: "02-wicklings",
    act: "Acto I · Fanewick",
    kind: "people",
    image: img("02-wicklings"),
    alt: "Gente curtida del bosque —cazadores, artesanos y familias— reunida en un pequeño poblado iluminado por el fuego.",
    title: "Los Wicklings",
    body: "Esta tierra forja gente dura: los Wicklings, lo bastante audaces para criar familias donde otros no se atreven, y que siguen al pie de la letra las reglas que los mantienen con vida.",
    ken: "left",
    textPos: "left",
  },
  {
    id: "03-divinities",
    act: "Acto I · Fanewick",
    kind: "lore",
    image: img("03-divinities"),
    alt: "Pequeños dioses y espíritus encarnados, encantadores e inquietantes, entre el follaje del bosque.",
    title: "Las Divinidades Tenues",
    body: "Los dioses de Fanewick caminan la tierra como seres encarnados. Hacen pequeños milagros a cambio de tributo… o desvían al viajero del sendero hacia su ruina.",
    caption: "Fulg apila piedras de río · Ikla pinta el cielo · Oove susurra en la noche.",
    ken: "right",
    textPos: "bottom",
  },
  {
    id: "04-bogs",
    act: "Acto I · Fanewick",
    kind: "lore",
    image: img("04-bogs"),
    alt: "Una vasta ciénaga brumosa que engulle en silencio armaduras y artillería pesada.",
    title: "Las ciénagas",
    body: "Campos en apariencia inofensivos ocultan ciénagas que se tragan ejércitos enteros, devorando la artillería tan rápido como cruza la frontera.",
    ken: "in",
    textPos: "bottom",
  },

  // ── Acto II · Haven ────────────────────────────────────────────────────
  {
    id: "05-haven",
    act: "Acto II · Haven",
    kind: "lore",
    image: img("05-haven"),
    alt: "Los colosales muros de piedra gris de la ciudad de Haven; arquitectura sombría y ordenada.",
    title: "La Puerta Sin Dioses",
    body: "Haven fue la mayor potencia de la región. Sobre sus altos muros de piedra se lee «La Puerta Sin Dioses»: sus fundadores quisieron librarse de la influencia de las Divinidades Tenues.",
    ken: "out",
    textPos: "left",
  },
  {
    id: "06-shunaush",
    act: "Acto II · Haven",
    kind: "lore",
    image: img("06-shunaush"),
    alt: "Una deidad serpiente colosal de granito cuyos restos tallados forman las murallas de la ciudad.",
    title: "Shun'Aush, el Ofidio de Granito",
    body: "Para lograrlo mataron a una de las deidades más poderosas y construyeron su hogar tras los restos: los muros mismos que dieron fama a Haven. Pero la serpiente tendría su venganza.",
    ken: "in",
    textPos: "bottom",
  },
  {
    id: "07-sickness",
    act: "Acto II · Haven",
    kind: "lore",
    image: img("07-sickness"),
    alt: "Ciudadanos petrificándose en estatuas de agonía, con la piel agrietada como escamas de serpiente.",
    title: "El Mal de la Serpiente",
    body: "El polvo de sus escamas se posó en la tierra. Siglos después brotó el Mal de la Serpiente: primero la tos de polvo, luego la erupción escamada, y al fin la carne se petrifica. Las víctimas se vuelven estatuas allí donde caen.",
    ken: "in",
    textPos: "bottom",
  },

  // ── Acto III · La invasión ─────────────────────────────────────────────
  {
    id: "08-ladys-veil",
    act: "Acto III · La invasión",
    kind: "lore",
    image: img("08-ladys-veil"),
    alt: "Un campo soleado de incontables flores blancas con una única y vibrante flor carmesí destacando entre ellas.",
    title: "El velo de dama carmesí",
    body: "El Archimago Phylax halló la cura: una rara flor roja, el velo de dama carmesí. Florece por toda Fanewick… pero por cada diez mil flores blancas, solo una nace roja.",
    ken: "out",
    textPos: "bottom",
  },
  {
    id: "09-invasion",
    act: "Acto III · La invasión",
    kind: "lore",
    image: img("09-invasion"),
    alt: "El ejército de Haven marchando en filas ordenadas hacia el bosque profundo, con estandartes y fuego.",
    title: "Haven invade Fanewick",
    body: "Desesperada por salvar a su pueblo, Haven invadió Fanewick para cosechar los escasos capullos rojos, internándose en lo más profundo del bosque.",
    ken: "right",
    textPos: "left",
  },
  {
    id: "10-nikta",
    act: "Acto III · La invasión",
    kind: "lore",
    image: img("10-nikta"),
    alt: "Nikta, una lechuza-diosa cósmica gigante, majestuosa y herida, a la que le falta un ojo, con las estaciones girando a su alrededor.",
    title: "El robo del Ojo de la Siega",
    body: "Bajo la guía de Phylax, arrancaron el Ojo de la Siega a la divinidad más poderosa: Nikta, la Gran Lechuza, la Pastora de las Estaciones, que con su mirada hacía girar el ciclo del año.",
    ken: "in",
    textPos: "bottom",
  },
  {
    id: "11-eternal-spring",
    act: "Acto III · La invasión",
    kind: "lore",
    image: img("11-eternal-spring"),
    alt: "Una primavera antinatural y sin fin: un florecimiento desbocado de belleza excesiva e inquietante.",
    title: "La primavera eterna",
    body: "Sin su Ojo de la Siega, Nikta solo puede mirar con el Ojo de la Siembra, forzando a la tierra a una primavera eterna. Lo que parecía un don pronto se volvió un azote.",
    ken: "out",
    textPos: "bottom",
  },

  // ── Acto IV · El Witherwild ────────────────────────────────────────────
  {
    id: "12-witherwild",
    act: "Acto IV · El Witherwild",
    kind: "lore",
    image: img("12-witherwild"),
    alt: "Sobrevegetación monstruosa: árboles que se retuercen para cazar, bestias colosales y enredaderas que estrangulan los hogares.",
    title: "El Witherwild se desata",
    body: "Así nació el Witherwild. La flora y la fauna florecen sin freno: los animales crecen hasta tamaños inmensos, los árboles se retuercen y empiezan a cazar, y las enredaderas estrangulan cuanto tocan.",
    ken: "in",
    textPos: "bottom",
  },
  {
    id: "13-withered",
    act: "Acto IV · El Witherwild",
    kind: "lore",
    image: img("13-withered"),
    alt: "Una persona transformándose en un híbrido de humano y planta o bestia; bello y horrible a la vez, con la mirada perdida.",
    title: "Los Marchitos",
    body: "Quien es corrompido por el Witherwild se transforma: un híbrido de persona y planta o bestia. Poco a poco el ansia de consumir reemplaza su personalidad, hasta perder por completo quién fue.",
    ken: "left",
    textPos: "left",
  },

  // ── Acto V · El mundo cambiado ─────────────────────────────────────────
  {
    id: "14-day-night",
    act: "Acto V · El mundo cambiado",
    kind: "lore",
    image: img("14-day-night"),
    alt: "El mismo bosque partido en día y noche; flores nocturnas bioluminiscentes iluminando la mitad oscura.",
    title: "Semanas de día y de noche",
    body: "En Fanewick el sol sale durante una semana entera antes de ponerse para una noche igual de larga. De noche florece la flor nocturna, bioluminiscente y con olor a azúcar quemado: bendición para quien debe viajar a oscuras.",
    ken: "right",
    textPos: "bottom",
  },

  // ── Acto VI · El detonante ─────────────────────────────────────────────
  {
    id: "15-fanewraith",
    act: "Acto VI · El detonante",
    kind: "hook",
    image: img("15-fanewraith"),
    alt: "Una líder rebelde enigmática y encapuchada en una aldea entre las copas de los árboles, entre sombras.",
    title: "La Fanewraith",
    body: "Un grupo rebelde secreto, liderado por una figura misteriosa conocida solo como la Fanewraith, urde un plan para acabar con la maldición: hallar a Nikta y arrancarle el Ojo de la Siembra… sin medir las consecuencias.",
    ken: "in",
    textPos: "left",
  },
  {
    id: "16-kreil",
    act: "Acto VI · El detonante",
    kind: "hook",
    image: img("16-kreil"),
    alt: "El maestro de espías de Haven a la luz de las velas, entre mapas; al fondo, la aldea-dosel de Alula.",
    title: "Kreil Dirn os recluta",
    body: "Kreil Dirn, el espía mayor de Haven, descubre el complot y os envía una invitación. No puede mandar soldados al bosque, así que os recluta a vosotros. Empezad la cacería en Alula, la aldea entre las copas.",
    caption: "¿Es de fiar? ¿Y qué haréis cuando halléis a la Fanewraith: justicia, alianza… o recuperar el Ojo de la Siega?",
    ken: "out",
    textPos: "bottom",
  },

  // ── Antes de forjar · Tu lugar en el conflicto ─────────────────────────
  {
    id: "18-communities",
    act: "Antes de forjar · Comunidades",
    kind: "communities",
    image: img("18-communities"),
    alt: "Un retrato de conjunto de los diversos pueblos de Fanewick y Haven: cazadores, soldados, marineros, rebeldes y nómadas.",
    title: "Las comunidades",
    body: "Todas las comunidades están disponibles, pero cada una ocupa un lugar distinto en la guerra entre Fanewick y Haven. Elige una para ver su papel y sus preguntas de trasfondo.",
    groups: [
      {
        name: "Loreborne",
        blurb:
          "En Fanewick el saber es la mercancía más valiosa, y quien tiene experiencia tiene poder. Los loreborne son los más ricos: pequeños grupos de cazadores, historiadores o artesanos dentro de aldeas mayores.",
        items: [
          "¿Qué conocimiento te enseñó tu comunidad que ahora debes proteger o compartir?",
          "¿Qué logras gracias a tu crianza que otros, fuera de tu comunidad, no entienden?",
          "Una vez cambiaste un conocimiento importante por algo terrible. ¿Qué entregaste y qué obtuviste a cambio?",
        ],
      },
      {
        name: "Highborne",
        blurb:
          "En Haven los más ricos son los highborne, con fortunas heredadas tras los muros durante generaciones. Estuvieron más aislados del Mal de la Serpiente, pero nadie fue inmune.",
        items: [
          "¿A quién perdiste por el Mal de la Serpiente? ¿Cómo te afectó?",
          "¿Cómo hizo su fortuna tu familia? ¿Rechazaste o abrazaste su ética?",
          "Creciste en la abundancia, pero te mantuvieron alejado de cierto saber del mundo. ¿Qué era y cuándo lo descubriste?",
        ],
      },
      {
        name: "Ridge · Under · Wildborne",
        blurb:
          "Criados en los entornos mortales de Fanewick, hoy más peligrosos por el Witherwild. Sus costumbres dan paso seguro por terrenos letales y los dominios de las Divinidades Tenues. Algunos, a cambio de protección, trabajan como granjeros en los campos de flores de Haven.",
        items: [
          "¿A qué Divinidades Tenues rindes tributo, y cómo te han recompensado?",
          "Disgustaste a un dios de Fanewick. ¿Qué hiciste, y qué desgracia cayó sobre ti o un ser querido?",
          "Huiste del lugar donde naciste. ¿Qué circunstancias te obligaron a partir?",
        ],
      },
      {
        name: "Orderborne",
        blurb:
          "Miembros actuales o antiguos del Ejército de Haven que invadió Fanewick. Aunque traen violencia a esta tierra, cargan también un enorme duelo por una patria que sucumbe a la peste.",
        items: [
          "¿Qué arrepentimientos cargas de tu conquista de suelo extranjero?",
          "¿Qué bondad te brindó un enemigo en tu hora de necesidad? ¿Cómo cambió tu visión de la gente de Fanewick?",
          "Te encargaron sembrar un rumor en una comunidad de Fanewick. ¿Cuál es, y piensas cumplir la misión?",
        ],
      },
      {
        name: "Slyborne",
        blurb:
          "Como el Ejército de Haven es el poder militar en Fanewick, los slyborne suelen venir de grupos rebeldes que buscan expulsar a los invasores. Según sus tácticas, pueden honrar o traicionar su crianza.",
        items: [
          "¿De quién del Ejército de Haven quieres vengarte, y por qué?",
          "Te uniste a un grupo insurgente para liberar esta tierra. ¿Qué te ha hecho dudar de los métodos de sus líderes?",
          "Alguien a quien amas pertenece al Ejército de Haven. ¿Cómo has usado tu posición en la rebelión para protegerle?",
        ],
      },
      {
        name: "Seaborne",
        blurb:
          "Tanto Fanewick como Haven tienen costa. En Fanewick, pequeñas comunidades costeras de cabotaje; en Haven, grandes puertos que comercian con tierras lejanas.",
        items: [
          "Hace poco viajaste por mar una gran distancia. ¿Qué salió terriblemente mal, y cómo te cambió?",
          "Crecer en el mar te enseñó una destreza rara. ¿Cuál, y cómo te salvó la vida?",
          "Solías navegar con un compañero. ¿Quién era, y cómo seguís conectados?",
        ],
      },
      {
        name: "Wanderborne",
        blurb:
          "Hay wanderborne en Fanewick y en Haven, aunque el viaje seguro está muy restringido por la ocupación militar y la expansión del Witherwild. Decide la postura de tu personaje ante la invasión.",
        items: [
          "¿Qué haces para mantener a tu pequeña comunidad a salvo, independiente y oculta de Haven?",
          "Por la vida itinerante, tienes seres queridos en Fanewick y en Haven. ¿Cómo afecta eso tu relación con la invasión?",
          "Tu comunidad viaja para proteger algo. ¿Qué es, y por qué os impide asentaros?",
        ],
      },
    ],
    ken: "out",
    textPos: "center",
  },
  {
    id: "19-ancestries",
    act: "Antes de forjar · Linajes",
    kind: "briefing",
    image: img("19-ancestries"),
    alt: "Una hilera de linajes diversos: un clank de madera y piedra, un fungril enorme, gente con cuernos, galapa y ribbets, y una víctima petrificándose.",
    title: "Los linajes",
    body: "Todos los linajes están disponibles. Algunos, sin embargo, llevan la marca del Witherwild y de la guerra.",
    groups: [
      {
        name: "Clanks",
        blurb:
          "Los de Haven suelen forjarse en hierro y acero; los de Fanewick, construirse de madera y piedra.",
      },
      {
        name: "Fungril",
        blurb:
          "Desde que el Witherwild se extendió, algunos fungril de los bosques de Fanewick han crecido notablemente más que los de otras regiones.",
      },
      {
        name: "Drakona · Fauns · Firbolgs · Infernis",
        blurb:
          "Tras la corrupción, algunos notan que sus cuernos crecen más rápido y más largos.",
      },
      {
        name: "Galapa & Ribbets",
        blurb:
          "Muchas familias que vivían en las ciénagas de Fanewick fueron desplazadas cuando el ejército de Haven invadió.",
      },
      {
        name: "Havenites y el Mal de la Serpiente",
        blurb:
          "Cualquiera, pero en especial los de Haven, puede portar el Mal de la Serpiente: agarrota sus movimientos y le da un tiempo limitado sin cura.",
      },
    ],
    ken: "in",
    textPos: "center",
  },
  {
    id: "20-classes",
    act: "Antes de forjar · Clases",
    kind: "briefing",
    image: img("20-classes"),
    alt: "Un montaje de dualidad: druida, ranger y hechicero invocando la naturaleza salvaje frente a un guerrero y un mago de guerra de Haven.",
    title: "Las clases",
    body: "Todas las clases están disponibles. Piensa cómo el conflicto y el Witherwild tocan la tuya.",
    groups: [
      {
        name: "Druids · Rangers · Sorcerers",
        blurb:
          "Comunes por todo Fanewick. Considera cómo el Witherwild afecta la conexión de tu personaje con el mundo natural.",
      },
      {
        name: "Warriors · Wizards",
        blurb:
          "Predominan en Haven: una gran escuela de magia forma luchadores y sanadores, y el Ejército de Haven se nutre sobre todo de Warriors y de Wizards de la School of War. Considera tu relación con ese ejército.",
      },
      {
        name: "Vengeance Guardian",
        blurb:
          "Muchos Wicklings que ansían vengarse de Haven o expulsarlos eligen esta subclase. Piensa qué ideales o instituciones protege tu personaje.",
      },
      {
        name: "Syndicate Rogue",
        blurb:
          "Haven envía espías a las comunidades de Fanewick para robar información y manipular la opinión pública. Piensa cómo se relaciona tu personaje con esas redes encubiertas.",
      },
    ],
    ken: "out",
    textPos: "center",
  },
  {
    id: "21-questions",
    act: "Antes de forjar · Sesión Cero",
    kind: "questions",
    image: img("21-questions"),
    alt: "Un grupo reunido alrededor de una fogata de noche en el bosque, compartiendo historias antes del viaje.",
    title: "Preguntas de Sesión Cero",
    body: "Antes de empezar, contestad juntos algunas de estas preguntas para dar vida a vuestro Fanewick.",
    questions: [
      "¿Qué animal peligroso sale durante la semana de noche que no aparece en la de día?",
      "¿Qué rasgo único (aspecto, olor, sabor…) tiene todo lo corrompido por el Witherwild?",
      "¿Qué supersticiones tiene tu personaje o su comunidad sobre cruzar Fanewick en las largas noches?",
      "Tu personaje ha presenciado algo bello surgido del Witherwild. ¿Qué es y cómo transformó su visión de la corrupción?",
    ],
    ken: "in",
    textPos: "center",
  },

  // ── Acto VII · Cierre ──────────────────────────────────────────────────
  {
    id: "22-cta",
    act: "Acto VII",
    kind: "cta",
    image: img("22-cta"),
    alt: "Siluetas de héroes improbables alzándose contra la espesura al amanecer.",
    title: "Da un paso al frente",
    body: "Vivíais una vida tranquila en Fanewick o de conquista en Haven. Pero cuando el peligro lo exige, incluso los no preparados —y los que no quieren— deben dar un paso al frente.",
    ken: "in",
    textPos: "center",
  },
];
