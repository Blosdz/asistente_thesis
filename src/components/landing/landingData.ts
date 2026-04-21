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

export const narrativeSteps = [
  {
    number: '01',
    navLabel: 'Revisión de viabilidad',
    title: 'Revisión de la viabilidad del tema',
    description:
      'Analizamos si tu idea puede convertirse en una tesis viable según alcance, variables, carrera, fuentes disponibles y nivel académico.',
    detail:
      'El estudiante presenta su idea inicial y el sistema valida si el tema es viable según carrera, nivel académico, alcance, disponibilidad de información y complejidad metodológica.',
    videoUrl: 'https://www.dropbox.com/scl/fi/hizlgor8x5lqz0xvo8cf4/meeting.mp4?rlkey=gw94gfbbqcaudaayq7dev9fo2&st=gyhavdm9&dl=1',
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
    videoUrl: 'https://www.dropbox.com/scl/fi/bcugq0n2y5qbsz4jluzu9/taking_notes.mp4?rlkey=1nprf3r486oel9yfzv439u99z&st=ua1rdi8q&dl=1',
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
    videoUrl: 'https://www.dropbox.com/scl/fi/z4a8y0wm89al6e6ypp4tm/meeting_online.mp4?rlkey=bgp62szlxs2pn29cmkhv7h7kc&st=howa602r&dl=1',
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
    videoUrl: 'https://www.dropbox.com/scl/fi/mg7r4b7k3cnhsbuj0co2q/defense.mp4?rlkey=oyodffpcfk2jtublz9jdno11p&st=8ziunu81&dl=1',
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

export const plans = [
  {
    title: 'Esencial',
    price: 'Desde S/ ...',
    description: 'Para estudiantes que quieren estructura, claridad y una ruta base con IA académica.',
    bullets: ['Ruta de tesis', 'IA académica', 'Módulos de avance', 'Gestión de documentos'],
    cta: 'Empezar con Esencial',
  },
  {
    title: 'Guiado',
    price: 'Ver precio',
    description: 'Para quienes necesitan acompañamiento con asesorías incluidas y seguimiento constante.',
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
    description: 'Para estudiantes que quieren cobertura amplia hasta la presustentación y cierre.',
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
  { value: 'Mejor organización', label: 'documentos y avances en un solo panel' },
  { value: 'Acompañamiento experto', label: 'asesores cuando más lo necesitas' },
];

export const testimonials = [
  {
    name: 'Luis Alberto Ramos Ruiz',
    role: 'Magíster en Gestión Pública',
    quote:
      'Con la asesoría logré estructurar correctamente mi investigación, fortalecer el marco teórico y prepararme con más solidez para la defensa oral.',
    outcome: 'Tema estructurado y defensa más sólida',
    imageUrl:
      'https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=900&q=80',
    recommendation:
      'Me ayudaron con mi marco Teórico',
  },
  {
    name: 'Moira Pango Rondón',
    role: 'Licenciada en Docencia',
    quote:
      'Recibí claridad en cada etapa del proceso y apoyo preciso en aspectos metodológicos clave, lo que elevó la calidad final de mi tesis.',
    outcome: 'Mayor claridad metodológica',
    imageUrl:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=80',
    recommendation:
      'Elevo la calidad de mi documentación.',
  },
  {
    name: 'Varinia Rodríguez',
    role: 'Segunda Especialidad en Enfermería',
    quote:
      'Llegué con varias observaciones sin saber cómo corregirlas y terminé levantándolas paso a paso con una ruta mucho más ordenada.',
    outcome: 'Observaciones resueltas con orden',
    imageUrl:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=900&q=80',
    recommendation:
      'Mis observaciones fueron levantadas.',
  },
  {
    name: 'Harold Reyes',
    role: 'Odontólogo',
    quote:
      'La parte estadística y la preparación para la sustentación dejaron de ser un bloqueo; defendí mi trabajo con mucha más claridad y confianza.',
    outcome: 'Sustentación más segura',
    imageUrl:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=900&q=80',
    recommendation:
      'Solucionaron mis nervios con la presustenctación.',
  },
  {
    name: 'María Vadillo',
    role: 'Magíster en Psicología Clínica y Educativa',
    quote:
      'Definir una directriz clara cambió el proceso completo: entendí mejor mi investigación y llegué a la sustentación con seguridad.',
    outcome: 'Dirección clara antes del cierre',
    imageUrl:
      'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=900&q=80',
    recommendation:
      'Pude mejorar mis variables rapido.',
  },
];


