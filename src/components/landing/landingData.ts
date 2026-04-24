export const landingSections = [
  { id: 'hero', label: 'Inicio', shortLabel: 'Inicio' },
  { id: 'como-funciona', label: 'Cómo funciona', shortLabel: 'Flujo' },
  { id: 'planes', label: 'Planes', shortLabel: 'Planes' },
  { id: 'asesores', label: 'Asesores', shortLabel: 'Asesores' },
  { id: 'resultados', label: 'Resultados', shortLabel: 'Resultados' },
  { id: 'final-cta', label: 'Cierre', shortLabel: 'Final' },
];

export const navItems = [
  { label: 'Cómo funciona', id: 'como-funciona' },
  { label: 'Planes', id: 'planes' },
  { label: 'Asesores', id: 'asesores' },
  { label: 'Resultados', id: 'resultados' },
];

export const heroTrustChips = [
  'IA para estructura académica',
  'Asesores especializados',
  'Seguimiento por módulos',
  'Revisión y observaciones',
];

export const heroValueProps = [
  {
    title: 'Tema viable',
    description: 'Revisión inicial con enfoque académico',
  },
  {
    title: 'Ruta guiada',
    description: 'Módulos, documentos y observaciones',
  },
  {
    title: 'Asesores expertos',
    description: 'Reuniones y preparación para sustentar',
  },
];

export const heroStats = [
  { value: '4 etapas', label: 'desde la idea hasta la sustentación' },
  { value: '24/7', label: 'acompañamiento con IA académica' },
  { value: '1 panel', label: 'documentos, módulos y observaciones' },
];

export const heroVideoSrc =
  'https://dl.dropboxusercontent.com/scl/fi/hi1wfmjswag4lhvlpy4go/hero_video.mp4?rlkey=sgau15k7zh4o1smovxg0h8n9f&st=fkxsk9er&raw=1';

export const narrativeSteps = [
  {
    number: '01',
    navLabel: 'Revisión de viabilidad',
    title: 'Revisión de la viabilidad del tema',
    description:
      'Analizamos si tu idea puede convertirse en una tesis viable según alcance, variables, carrera, fuentes disponibles y nivel académico.',
    detail:
      'El estudiante presenta su idea inicial y el sistema valida si el tema es viable según carrera, nivel académico, alcance, disponibilidad de información y complejidad metodológica.',
    videoUrl:
      'https://dl.dropboxusercontent.com/scl/fi/hizlgor8x5lqz0xvo8cf4/meeting.mp4?rlkey=gw94gfbbqcaudaayq7dev9fo2&st=gyhavdm9&dl=1',
    status: 'Tema viable con ajustes',
    metrics: [
      { label: 'Viabilidad', value: '84%' },
      { label: 'Fuentes', value: '27 halladas' },
      { label: 'Riesgo', value: 'Bajo' },
    ],
    checklist: [
      'Variables delimitadas',
      'Alcance acorde a tu nivel',
      'Fuentes preliminares identificadas',
    ],
    questions: [
      '¿Mi tema tiene suficiente información disponible?',
      '¿El alcance es adecuado para mi carrera?',
      '¿Qué ajustes necesita antes de empezar?',
    ],
  },
  {
    number: '02',
    navLabel: 'Redacción del tema',
    title: 'Redacción del tema de investigación',
    description:
      'Transformamos tu idea validada en un título, problema, objetivos y enfoque inicial más claro y defendible.',
    detail:
      'Con la idea validada, el estudiante construye el título, problema, objetivos, justificación y enfoque inicial con apoyo de IA y orientación académica.',
    videoUrl:
      'https://dl.dropboxusercontent.com/scl/fi/bcugq0n2y5qbsz4jluzu9/taking_notes.mp4?rlkey=1nprf3r486oel9yfzv439u99z&st=ua1rdi8q&dl=1',
    status: 'Borrador estructural listo',
    metrics: [
      { label: 'Título', value: '3 opciones' },
      { label: 'Objetivos', value: '5 alineados' },
      { label: 'Enfoque', value: 'Definido' },
    ],
    checklist: [
      'Título con delimitación académica',
      'Problema de investigación conectado',
      'Objetivos y variables alineados',
    ],
    questions: [
      '¿Cómo redactar un título académico?',
      '¿Cómo formular el problema de investigación?',
      '¿Cómo conectar objetivos y variables?',
    ],
  },
  {
    number: '03',
    navLabel: 'Revisión del borrador',
    title: 'Revisión del borrador de tesis',
    description:
      'Sube tus avances para recibir observaciones, correcciones y sugerencias organizadas por capítulos o módulos.',
    detail:
      'El estudiante sube avances o documentos completos para recibir observaciones, correcciones y sugerencias organizadas por módulos o capítulos.',
    videoUrl:
      'https://dl.dropboxusercontent.com/scl/fi/z4a8y0wm89al6e6ypp4tm/meeting_online.mp4?rlkey=bgp62szlxs2pn29cmkhv7h7kc&st=howa602r&dl=1',
    status: 'Observaciones priorizadas',
    metrics: [
      { label: 'Capítulos', value: '4/6' },
      { label: 'Alertas', value: '7' },
      { label: 'Pendientes', value: '3 críticas' },
    ],
    checklist: [
      'Comentarios por capítulo',
      'Módulos con estado visible',
      'Correcciones con prioridad clara',
    ],
    questions: [
      '¿Qué observaciones debo resolver primero?',
      '¿Cómo mejorar la coherencia del borrador?',
      '¿Qué capítulos necesitan revisión?',
    ],
  },
  {
    number: '04',
    navLabel: 'Preparación sustentación',
    title: 'Preparación para la sustentación',
    description:
      'Agenda sesiones, practica tu defensa y corrige puntos críticos antes de presentar tu investigación.',
    detail:
      'El estudiante agenda asesorías, practica la defensa, corrige puntos críticos y prepara una presentación más clara y segura.',
    videoUrl:
      'https://dl.dropboxusercontent.com/scl/fi/mg7r4b7k3cnhsbuj0co2q/defense.mp4?rlkey=oyodffpcfk2jtublz9jdno11p&st=8ziunu81&dl=1',
    status: 'Ensayo final agendado',
    metrics: [
      { label: 'Sesiones', value: '2 listas' },
      { label: 'Disponibilidad', value: 'Esta semana' },
      { label: 'Checklist', value: '92%' },
    ],
    checklist: [
      'Preguntas críticas simuladas',
      'Presentación validada',
      'Puntos débiles corregidos',
    ],
    questions: [
      '¿Cómo preparar mi exposición?',
      '¿Qué preguntas puede hacer el jurado?',
      '¿Qué debo corregir antes de sustentar?',
    ],
  },
];

export const landingVideoUrls = [
  heroVideoSrc,
  ...narrativeSteps
    .map((step) => step.videoUrl)
    .filter((videoUrl): videoUrl is string => Boolean(videoUrl)),
];

export const plans = [
  {
    title: 'Esencial',
    price: 'Desde S/ ...',
    description:
      'Para estudiantes que quieren estructura, claridad y una ruta base con IA académica.',
    bullets: [
      'Ruta de tesis',
      'IA académica',
      'Módulos de avance',
      'Gestión de documentos',
    ],
    cta: 'Empezar con Esencial',
  },
  {
    title: 'Guiado',
    price: 'Ver precio',
    description:
      'Para quienes necesitan acompañamiento con asesorías incluidas y seguimiento constante.',
    bullets: [
      'Todo lo de Esencial',
      'Asesorías incluidas',
      'Observaciones organizadas',
      'Seguimiento metodológico',
    ],
    badge: 'Más elegido',
    featured: true,
    cta: 'Elegir Guiado',
  },
  {
    title: 'Integral',
    price: 'Desde S/ ...',
    description:
      'Para estudiantes que quieren cobertura amplia hasta la presustentación y cierre.',
    bullets: [
      'Todo lo de Guiado',
      'Presustentación',
      'Seguimiento intensivo',
      'Acompañamiento extendido',
    ],
    cta: 'Quiero Integral',
  },
];

export const advisorBenefits = [
  'Revisión metodológica',
  'Corrección de observaciones',
  'Preparación para sustentación',
  'Asesorías por disponibilidad',
  'Acompañamiento por carrera',
];

export const advisorCards = [
  {
    name: 'Dra. Andrea Salazar',
    specialty: 'Metodología y diseño de investigación',
    level: 'Maestría y pregrado',
    context: 'Educación | Ciencias Sociales',
    availability: 'Disponible esta semana',
    duration: 'Sesiones de 45 min',
    imageUrl:
      'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=900&q=80',
    badge: 'Asesora metodológica',
    description:
      'Acompaña la definición del tema, variables, problema, objetivos y diseño de investigación.',
  },
  {
    name: 'Mg. Luis Ramos',
    specialty: 'Análisis estadístico y corrección de observaciones',
    level: 'Pregrado, maestría',
    context: 'Ingeniería | Administración',
    availability: '3 horarios abiertos',
    duration: 'Bloques de 60 min',
    imageUrl:
      'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=900&q=80',
    badge: 'Estadística aplicada',
    description:
      'Apoya en análisis de datos, validación de instrumentos y levantamiento de observaciones.',
  },
  {
    name: 'Esp. Camila Paredes',
    specialty: 'Sustentación, presentación y defensa oral',
    level: 'Cierre y presustentación',
    context: 'Salud | Humanidades',
    availability: 'Agenda flexible',
    duration: 'Sesiones de preparación',
    imageUrl:
      'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?auto=format&fit=crop&w=900&q=80',
    badge: 'Preparación final',
    description:
      'Entrena la exposición, preguntas del jurado y defensa clara del proyecto de tesis.',
  },
];

export const outcomeStats = [
  { value: 'Ruta clara', label: 'menos caos desde el primer módulo' },
  { value: 'Menos retrabajo', label: 'observaciones con prioridad visible' },
  {
    value: 'Mejor organización',
    label: 'documentos y avances en un solo panel',
  },
  {
    value: 'Acompañamiento experto',
    label: 'asesores cuando más lo necesitas',
  },
];

export const testimonials = [
  {
    name: 'Luis Alberto Ramos Ruiz',
    role: 'Magíster en Gestión Pública',
    quote:
      'Con la asesoría de Diego Butrón logré estructurar correctamente mi investigación, fortalecer el marco teórico y prepararme con solidez para la defensa oral. Su acompañamiento técnico fue clave durante todo el proceso, y el resultado fue la aprobación de mi tesis con felicitación pública.',
    outcome: 'Tema estructurado y defensa con felicitación',
    imageUrl:
      'https://dl.dropboxusercontent.com/scl/fi/uhjrh1oweq91hq76jool5/LUIS.jpeg?rlkey=wwyr39v4r419k0e82umbyzq3r&st=01knd43i&dl=1',
    recommendation: 'Aprobación de mi tesis con felicitación pública',
    badge: 'Magíster en Gestión Pública',
  },
  {
    name: 'Moira Pango Rondón',
    role: 'Licenciada en Docencia',
    quote:
      'Durante mi investigación, la asesoría de Diego Butrón me brindó claridad en cada etapa del proceso y apoyo preciso en aspectos metodológicos clave. Su profesionalismo y conocimiento hicieron una diferencia real en la calidad final de mi tesis.',
    outcome: 'Mayor claridad metodológica y calidad en la tesis',
    imageUrl:
      'https://dl.dropboxusercontent.com/scl/fi/rf4j3jsxyyfb7582elzge/MOIRA.jpeg?rlkey=q9ic2zg082q1fxrmj6wmveld9&st=5acs2ud5&dl=1',
    recommendation: 'Claridad en cada etapa del proceso',
    badge: 'Licenciada en Docencia',
  },
  {
    name: 'Diego Yanqui',
    role: 'Médico Veterinario',
    quote:
      'Durante el desarrollo de mi investigación conté con el acompañamiento de Diego Butrón en cada etapa del proceso. Su asesoría fue constante, cercana y técnica, permitiéndome avanzar con mayor orden, seguridad y claridad en el trabajo.',
    outcome: 'Avance más ordenado y seguro',
    imageUrl:
      'https://dl.dropboxusercontent.com/scl/fi/2pmghmqjrqasfjd1hn01y/DIEGO.jpeg?rlkey=9dwth6bw282wcrslyo0ookxts&st=ojv9k0k4&dl=1',
    recommendation: 'Acompañamiento constante en cada etapa',
    badge: 'Médico Veterinario',
  },
  {
    name: 'Sadie Ordoño',
    role: 'Enfermera Instrumentista',
    quote:
      'Durante el desarrollo de mi tesis de maestría tuve dificultades en el marco teórico y las bases teóricas. Con la asesoría de Diego Butrón logré superar esas limitaciones, ordenar mejor mi investigación y avanzar con mayor seguridad en el proceso.',
    outcome: 'Superé limitaciones teóricas y ordené mi investigación',
    imageUrl:
      'https://dl.dropboxusercontent.com/scl/fi/4aszeeu2o2fmzkji07om0/SADIE.jpeg?rlkey=rploa6ytp4k1ow7epdnae46k2&st=5g6vaxis&dl=1',
    recommendation: 'Superé dificultades en el marco teórico',
    badge: 'Enfermera Instrumentista',
  },
  {
    name: 'David Ponce',
    role: 'Titulado en Operaciones Mineras',
    quote:
      'Con la asesoría de Diego Butrón logré desarrollar una tesis aplicada, resolver mis dudas durante todo el proceso y llegar a la sustentación con mayor seguridad. Su acompañamiento fue clave para estructurar correctamente el trabajo y defenderlo de manera óptima.',
    outcome: 'Tesis aplicada con defensa óptima',
    imageUrl:
      'https://dl.dropboxusercontent.com/scl/fi/v9yrbncvin2h4f4rts5ij/DAVID.jpeg?rlkey=wsy8dligdnjk2w8yveerpt0ej&st=cohpsn55&dl=1',
    recommendation: 'Estructura correcta y defensa óptima',
    badge: 'Titulado en Operaciones Mineras',
  },
  {
    name: 'Varinia Rodríguez',
    role: 'Enfermera de Operaciones | Segunda Especialidad',
    quote:
      'Cuando presenté mi proyecto de tesis para obtener el título de segunda especialidad, recibí varias observaciones que no sabía cómo corregir. Con la asesoría de Diego Butrón pude estructurar adecuadamente las correcciones, mejorar la metodología y levantar cada observación paso a paso hasta lograr la aprobación del proyecto.',
    outcome: 'Levantamiento de observaciones y aprobación',
    imageUrl:
      'https://dl.dropboxusercontent.com/scl/fi/iowcqcbxsix322rtrw8gu/VARINIA.jpeg?rlkey=qc6aedprn69srsqz2xsqe6r9b&st=ugkgn376&dl=1',
    recommendation: 'Observaciones levantadas paso a paso',
    badge: 'Segunda Especialidad en Enfermería',
  },
  {
    name: 'Alejandra Linares',
    role: 'Especialista en salud mental del niño, del adolescente y la familia',
    quote:
      'Recibí un acompañamiento integral en mi tesis de grado y en mi tesis de maestría. La asesoría de Diego Butrón incluyó levantamiento de observaciones, manejo estadístico, definición metodológica y preparación técnica para la defensa. Gracias a ese proceso, logré fortalecer mi seguridad académica y presentar una tesis sólida y profesional.',
    outcome: 'Acompañamiento integral en grado y maestría',
    imageUrl:
      'https://dl.dropboxusercontent.com/scl/fi/2v0et5ss9z7clttv05ihu/ALENJANDRA.jpeg?rlkey=p7s0x3mrxqew323rcjhvx8zar&st=299n4x85&dl=1',
    recommendation: 'Acompañamiento en grado y maestría',
    badge: 'Especialista en Salud Mental',
  },
  {
    name: 'Katherine Calatayud',
    role: 'Licenciada en Rehabilitación Física',
    quote:
      'Desde el inicio de la tesis, la asesoría de Diego Butrón fue clave para definir correctamente el tema, desarrollar la parte teórica y práctica, realizar el análisis estadístico y cerrar el trabajo con conclusiones sólidas. Ese acompañamiento integral fue decisivo para alcanzar nuestro objetivo y obtener el título.',
    outcome: 'Acompañamiento integral desde tema hasta conclusiones',
    imageUrl:
      'https://dl.dropboxusercontent.com/scl/fi/6g4d8urbeo91nxym5mit6/KATHERINE.jpeg?rlkey=jiw33lj3l6b24e2t6rewm66bq&st=6v8hbuq0&dl=1',
    recommendation: 'Acompañamiento integral y decisivo',
    badge: 'Licenciada en Rehabilitación Física',
  },
  {
    name: 'Harold Reyes',
    role: 'Odontólogo',
    quote:
      'Mi investigación fue una tesis comparativa con un componente técnico importante, y la asesoría de Diego Butrón fue clave en la parte estadística, el análisis de resultados y la preparación para la sustentación. Gracias a ese acompañamiento logré defender mi trabajo con mucha más claridad, seguridad y confianza ante el jurado.',
    outcome: 'Defensa clara, segura y confiable',
    imageUrl:
      'https://dl.dropboxusercontent.com/scl/fi/3hxjr5bysatxs4y0o022z/HAROL.jpeg?rlkey=r628it4gx4iouxc6tw2iwkarr&st=6o2mc3j0&dl=1',
    recommendation: 'Defensa con claridad y confianza',
    badge: 'Odontólogo',
  },
  {
    name: 'Claudia Dalguerre',
    role: 'Psicóloga | Magíster en Gerencia Estratégica de Recursos Humanos',
    quote:
      'Durante mi maestría conté con el asesoramiento de Diego Butrón en el desarrollo de una investigación sobre competitividad e innovación en la cultura organizacional. Su apoyo fue clave para fortalecer la parte estadística, el manejo de datos y la estructura del trabajo, permitiéndome culminar el proceso de titulación con éxito.',
    outcome: 'Maestría culminada con éxito',
    imageUrl:
      'https://dl.dropboxusercontent.com/scl/fi/x4ed6v783tz39n8v4oueo/CLAUDIA.jpeg?rlkey=xh469ulda98hr2c7liqiw5bw9&st=00n7fyrg&dl=1',
    recommendation: 'Culminación exitosa de la maestría',
    badge: 'Magíster en Gerencia Estratégica RR.HH.',
  },
  {
    name: 'María Vadillo',
    role: 'Magíster en Psicología Clínica y Educativa',
    quote:
      'La asesoría de Diego Butrón me permitió comprender mejor mi investigación, definir una directriz clara y llegar a la sustentación con mayor seguridad. Su acompañamiento fue puntual, directo y determinante para defender mi tesis con efectividad y éxito.',
    outcome: 'Sustentación con efectividad y éxito',
    imageUrl:
      'https://dl.dropboxusercontent.com/scl/fi/pncmvbcl069ba1v532bwt/MARIA.jpeg?rlkey=nd0qshmhg2eows873f5uikfe9&st=dy476t24&dl=1',
    recommendation: 'Acompañamiento puntual y determinante',
    badge: 'Magíster en Psicología Clínica y Educativa',
  },
];
