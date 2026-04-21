You are an expert React + Tailwind + Framer Motion UI/UX engineer.

I already have an advanced landing page in the project. Your task is to refactor ONLY the landing page and its landing-specific components/styles. Do not modify authentication, dashboards, Supabase logic, database functions, protected routes, admin pages, advisor pages, student pages, or global business logic unless absolutely necessary for visual integration.

Goal:
Rebuild the landing page with a premium dark/glassmorphism style inspired by Superpower.com, but adapted to my thesis platform. Do not copy their brand, text, images, or exact layout. Use it only as inspiration: floating glass navbar, cinematic hero, modular sections, smooth scrolling, narrative step-by-step interaction, premium cards, dark blue glow, elegant typography, and strong conversion CTAs.

Reference behavior:
The reference page has a floating navigation, a “How it works” section with 4 steps, membership/plan cards, expert/doctor credibility cards, testimonials/stories, and final CTA sections. It positions the product as a premium guided experience, not just a generic app.

My product:
This is a thesis assistant platform for students. It helps users:

- Create and organize their thesis project.
- Use AI guidance for thesis writing and structure.
- Follow thesis modules and progress.
- Upload/manage documents.
- Receive advisor observations and suggestions.
- Hire or schedule meetings with professional thesis advisors.
- Choose subscription plans.
- Book advisor sessions based on availability.
- Improve their thesis with expert support.

Important database/context available:
The app has data structures for plans, advisors, advisor profiles, availability, thesis documents, AI history, modules, observations, meetings, and subscriptions. Use this conceptually in the landing content, but the landing can use mock/static data unless existing public services are already available. Do not break existing Supabase code.

Main design direction:

- Premium dark UI.
- Deep navy/black background.
- Glassmorphism cards.
- Blue glow accents.
- Floating pill navbar.
- Modular sections, not a flat single-column page.
- High-end SaaS feel.
- Use gradients, radial glows, soft borders, blurred backgrounds, subtle animated particles or orbs.
- Avoid childish visuals.
- Avoid generic education templates.
- Make it feel like an elite AI thesis command center.

Technical requirements:

- Use React components.
- Use Tailwind CSS.
- Use Framer Motion for animations if available.
- Use Lenis for smooth scrolling. If Lenis is not installed, install/use `lenis` or `@studio-freight/lenis` depending on project compatibility.
- Keep the implementation responsive.
- Use reusable data arrays for steps, plans, advisor benefits, testimonials, stats, and features.
- Keep copy in Spanish, because the app is for Spanish-speaking thesis students.
- Do not limit yourself to the current CSS if the landing needs a more modular design. You may create new landing-specific components and CSS utilities.
- Preserve the app’s routes and CTA destinations. If routes are unknown, use existing routes from the project; otherwise use safe placeholders like `/register`, `/login`, `/asesores`, `/planes`.

Landing structure to build:

1. Floating Glass Navbar
   Create a fixed centered navbar similar in feeling to the reference:

- Left links: “Cómo funciona”, “Planes”, “Asesores”, “Resultados”
- Center or left brand: App Thesis / Thesis Assistant / current project logo if available
- Right buttons: “Ingresar” and “Empezar”
- Use backdrop blur, bg-black/50 or bg-slate-950/60, border-white/10, rounded-full.
- On mobile, collapse into a clean menu.

2. Hero Section
   IMPORTANT HERO REFERENCE:
   I want the hero layout to feel like the screenshot/reference: a cinematic full-screen hero with a dark premium background, one large central/right visual focus, and the text placed on the left side, vertically centered. Do not copy the Superpower branding, health text, orange color, or human image. Replicate only the layout feeling, spacing, hierarchy, and premium cinematic composition.

Hero layout requirements:

- Full viewport height: `min-h-screen`.
- Background must be dark, premium, and cinematic.
- Use a large abstract visual on the center/right side, like:
  - AI thesis document interface,
  - glowing thesis paper/editor,
  - advisor meeting preview,
  - abstract blue glass orb,
  - or a premium 3D document/AI assistant composition.
- The visual should occupy the center/right area and feel large, almost like a background hero image.
- Add dark overlay gradients so the text remains readable.
- The left side must contain the main content, similar to the reference:
  - small trust/status label on top,
  - large headline,
  - short subheadline,
  - two CTA buttons,
  - bottom mini value props.

Exact text placement:

- Top navbar fixed/absolute over the hero.
- Brand centered or cleanly aligned depending on current design.
- Main hero copy placed on the left, around `left: 5vw` / `max-w-xl`, vertically around the middle of the screen.
- Do NOT center the hero text.
- Do NOT put the hero text in a normal boring card.
- Text must float over the cinematic background.

Hero copy:
Small label:
“✓ Asesoría académica + IA”

Headline:
“Avanza tu tesis con dirección, claridad y expertos”

Subheadline:
“Valida tu tema, redacta mejor, revisa tu borrador y prepárate para sustentar con una ruta guiada por IA y asesores especializados.”

Primary CTA:
“Empezar mi tesis”

Secondary CTA:
“Ver cómo funciona”

Bottom value props, aligned at the lower-left of the hero:

1. “Tema viable”
   “Revisión inicial con enfoque académico”

2. “Ruta guiada”
   “Módulos, documentos y observaciones”

3. “Asesores expertos”
   “Reuniones y preparación para sustentar”

Visual style:

- Use dark navy/black background.
- Use blue/cyan glow instead of orange.
- Add one huge radial glow behind the main visual, similar to the large circle in the screenshot, but in deep blue.
- Add soft grain/noise if the project already supports it or with CSS pseudo-elements.
- Add subtle parallax or floating animation to the visual.
- Use `absolute inset-0` layers:
  1. dark base background,
  2. radial blue glow,
  3. large hero visual/mockup,
  4. dark left/right gradient overlays,
  5. content layer.

Suggested structure:

````tsx
<section className="relative min-h-screen overflow-hidden bg-[#030712] text-white">
  {/* Background glow */}
  <div className="absolute inset-0 bg-[radial-gradient(circle_at_58%_42%,rgba(37,99,235,0.45),transparent_38%)]" />

  {/* Large cinematic visual on center/right */}
  <div className="absolute right-0 top-0 h-full w-[70%]">
    {/* Build a large AI thesis/document/advisor mockup here */}
  </div>

  {/* Readability overlays */}
  <div className="absolute inset-0 bg-gradient-to-r from-black via-black/45 to-black/20" />
  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/40" />

  {/* Content */}
  <div className="relative z-10 flex min-h-screen items-center px-6 md:px-16">
    <div className="max-w-xl">
      {/* label, headline, subtitle, CTAs */}
    </div>
  </div>

  {/* Bottom value props */}
  <div className="absolute bottom-12 left-6 z-10 hidden gap-10 md:flex md:left-16">
    {/* 3 value props */}
  </div>
</section>

Create a cinematic hero:
Headline:
“Avanza tu tesis con IA, asesoría experta y una ruta clara”
Subheadline:
“Organiza tu proyecto, recibe guía inteligente, agenda asesores y convierte tus avances en entregables listos para revisión.”
Primary CTA:
“Empezar mi tesis”
Secondary CTA:
“Ver cómo funciona”

Hero visual:
Create a large premium mockup card showing:
- Thesis progress dashboard
- AI writing assistant
- Document/revision status
- Advisor meeting card
- Progress modules
Use animated cards layered in glass style. Do not rely on external images.

Add trust/stat chips:
- “IA para estructura académica”
- “Asesores especializados”
- “Seguimiento por módulos”
- “Revisión y observaciones”

3. Draggable / Scroll Narrative “Cómo funciona”
STORYTELLING SECTION REFERENCE:
I want the “Cómo funciona” section to feel compositionally like the attached reference screenshot: a full-screen editorial storytelling section with a huge central/right visual, left-aligned explanatory text, right-side step navigation, and bottom-left accordion questions/cards.

Do not copy the Superpower content, health context, images, or brand. Only replicate the text placement, hierarchy, and storytelling layout.

Section layout:
- Full viewport height per story slide: `min-h-screen`.
- Background can be dark or light depending on the landing style, but for this project prefer premium dark/navy with blue glow.
- Use one large visual mockup in the center/right area.
- The main title and description must be placed on the left side, vertically around the middle.
- A step navigation must be placed on the right side, vertically centered.
- Bottom-left must show supporting accordion-style cards or “common questions” related to the current step.
- The section should feel like an interactive editorial product story, not a simple list of cards.

Desktop placement:
- Left content:
  - position: left side, around `left: 4vw` to `6vw`
  - width: `max-w-md` or `max-w-lg`
  - vertically centered
  - contains eyebrow label, large title, short paragraph
- Center/right visual:
  - position: absolute or sticky
  - starts near center and extends to the right
  - width around `60%` to `70%`
  - large mockup, slightly rotated or layered if needed
- Right step index:
  - position: absolute right side, around `right: 4vw`
  - vertically centered
  - list the 4 steps with numbers 01, 02, 03, 04
  - active step is high contrast, inactive steps are muted
- Bottom-left accordions:
  - position: absolute bottom-left
  - width around `420px` to `520px`
  - show 2–3 compact glass rows with a plus icon
  - these can change depending on the active step

Story steps:
01. “Revisión de la viabilidad del tema”
Description:
“Analizamos si tu idea puede convertirse en una tesis viable según alcance, variables, carrera, fuentes disponibles y nivel académico.”

02. “Redacción del tema de investigación”
Description:
“Transformamos tu idea validada en un título, problema, objetivos y enfoque inicial más claro y defendible.”

03. “Revisión del borrador de tesis”
Description:
“Sube tus avances para recibir observaciones, correcciones y sugerencias organizadas por capítulos o módulos.”

04. “Preparación para la sustentación”
Description:
“Agenda sesiones, practica tu defensa y corrige puntos críticos antes de presentar tu investigación.”

Right-side step navigation text:
- Active:
  “Revisión de viabilidad    01”
- Inactive:
  “Redacción del tema       02”
  “Revisión del borrador    03”
  “Preparación sustentación 04”

Bottom-left accordion examples per section:
For step 01:
- “¿Mi tema tiene suficiente información disponible?”
- “¿El alcance es adecuado para mi carrera?”
- “¿Qué ajustes necesita antes de empezar?”

For step 02:
- “¿Cómo redactar un título académico?”
- “¿Cómo formular el problema de investigación?”
- “¿Cómo conectar objetivos y variables?”

For step 03:
- “¿Qué observaciones debo resolver primero?”
- “¿Cómo mejorar la coherencia del borrador?”
- “¿Qué capítulos necesitan revisión?”

For step 04:
- “¿Cómo preparar mi exposición?”
- “¿Qué preguntas puede hacer el jurado?”
- “¿Qué debo corregir antes de sustentar?”

Interaction behavior:
- Use Lenis for smooth scroll.
- Use Framer Motion `useScroll` and `useTransform` to control active step while scrolling.
- The section should be sticky: while the user scrolls, the visual, right-side index, left text, and bottom accordions update from step 01 to step 04.
- The transition should feel like the reference: the user scrolls through a narrative, but the composition remains fixed and the content changes.
- Add fade/slide transitions for text changes.
- Add visual transition for the mockup of each step.
- Add progress indicator or active state on the right-side step list.

Suggested component structure:
```tsx
<section id="como-funciona" className="relative h-[400vh] bg-[#030712]">
  <div className="sticky top-0 h-screen overflow-hidden">
    {/* background layers */}
    {/* left text content */}
    {/* center/right visual mockup */}
    {/* right step navigation */}
    {/* bottom-left accordion cards */}
  </div>
</section>

Important:

Do not make this a basic carousel.
Do not make it four stacked cards.
Do not center all text.
Do not place the step menu at the top.
The main composition must be:
left text + large center/right visual + right step list + bottom-left support cards.
On mobile, stack it cleanly:
title first, visual second, step pills third, accordions below.

This is the most important section.

Create a section with 4 steps that works like a vertical narrative:
- It should feel like dragging/scrolling through slides from top to bottom.
- Use Lenis smooth scrolling and Framer Motion scroll progress.
- The left side has sticky text/step navigation.
- The right side has a sticky visual mockup that changes as the user scrolls.
- Each step should animate in/out vertically.
- Add a progress indicator with 4 dots or a vertical timeline.
- It must work with mouse wheel, trackpad, touch scroll, and drag-like feeling.
- Optional: add drag gestures if Framer Motion supports it cleanly, but do not make it buggy.

Steps for the draggable / scroll narrative section:

01. “Revisión de la viabilidad del tema”
Description:
“El estudiante presenta su idea inicial y el sistema/asesor valida si el tema es viable según carrera, nivel académico, alcance, variables, disponibilidad de información y complejidad metodológica.”
Visual:
A premium glass card showing a topic evaluation panel with viability score, academic level, research type, advisor notes, and status: “Tema viable con ajustes”.

02. “Redacción del tema de investigación”
Description:
“Con la idea validada, el estudiante construye el título, problema, objetivos, justificación y enfoque inicial con apoyo de IA y orientación académica.”
Visual:
An AI writing workspace showing title suggestions, research question, objectives checklist, and advisor comments.

03. “Revisión del borrador de tesis”
Description:
“El estudiante sube avances o documentos completos para recibir observaciones, correcciones y sugerencias organizadas por módulos o capítulos.”
Visual:
A document review interface with uploaded thesis draft, highlighted comments, pending observations, and progress by chapter.

04. “Preparación para la sustentación”
Description:
“El estudiante agenda asesorías, practica la defensa, corrige puntos críticos y prepara una presentación más clara y segura.”
Visual:
An advisor meeting card with calendar availability, presentation checklist, mock defense notes, and CTA: ‘Agendar preparación’.


Cards:
- Esencial
  For students who want AI guidance and structure.
  Include: ruta de tesis, IA académica, módulos, documentos.
- Guiado
  For students who need advisor support.
  Include: everything in Esencial + asesorías incluidas + observaciones.
- Integral
  For students who want full support.
  Include: everything in Guiado + presustentación + seguimiento intensivo.

Show pricing if existing data is available. If not, use “Desde S/ …” placeholders or “Ver precio”.
Add “Más elegido” badge to Guiado or Integral.
Use glass cards, blue highlight border for recommended plan, hover effects, and CTA buttons.

5. Hire Professional / Advisors Section
Create a section focused on hiring thesis professionals:
Title:
“Asesores especializados cuando más los necesitas”

Content:
- Advisor marketplace feel.
- Cards showing advisor profile mockups with:
  name, specialty, academic level, university/career, rating-like indicator, availability badge, session duration.
- Show benefits:
  “Revisión metodológica”
  “Corrección de observaciones”
  “Preparación para sustentación”
  “Asesorías por disponibilidad”
  “Acompañamiento por carrera”
- Add CTA:
  “Buscar asesores”
  “Solicitar reunión”

This section should visually connect with the existing advisor features of the app: public advisor profile, availability, rates, and meetings.

6. Benefits / Outcomes Section
USER EXPERIENCE / TESTIMONIAL CAROUSEL REFERENCE:
I want the “Resultados / Experiencias de usuarios” section to feel like the attached reference screenshot: a premium editorial carousel with large horizontal story cards, image/mockup area on top, testimonial text below, and a thin progress/navigation indicator at the bottom.

Do not copy the reference brand, health content, images, or exact text. Only replicate the layout feeling, spacing, carousel behavior, and testimonial hierarchy.

Section objective:
Show real-feeling student outcomes after using the thesis platform: more clarity, less thesis anxiety, better topic definition, better draft review, better preparation for sustentación, and better advisor guidance.

Section title placement:
- Place a small rating/trust line above the title.
- Then a large headline aligned left or slightly centered within a wide container.
- Use large typography and generous spacing.

Suggested copy:
Trust line:
“4.8/5 satisfacción estudiantil ★ Asesoría + IA”

Title:
“Historias de estudiantes que avanzaron su tesis con más claridad”

Subtitle:
“Desde validar el tema hasta preparar la sustentación, cada experiencia muestra cómo una ruta guiada reduce el caos y acelera el avance académico.”

Carousel layout:
- Full-width horizontal carousel.
- Cards should be wide, like editorial story cards.
- Each card should have:
  1. Top visual area: image placeholder, gradient mockup, advisor/student scene, or premium thesis dashboard mockup.
  2. Student name/role line.
  3. Main testimonial quote.
  4. Small outcome label.

Card sizing:
- Desktop: each card should be around `520px` to `680px` wide.
- Height should feel editorial, not small.
- Use rounded corners on the visual.
- Add subtle separators between cards.
- Show partial previous/next cards at screen edges to imply horizontal movement.

Carousel behavior:
- Horizontal drag with mouse/touch.
- Smooth inertial movement.
- Snap to cards.
- Bottom progress indicator similar to the reference:
  - thin segmented line or progress bar,
  - active segment darker/brighter,
  - show counter like `1 / 5`.
- Include arrow buttons only if they fit the design; otherwise drag + progress is enough.
- Use Framer Motion drag if available, or an accessible scroll-snap implementation.
- Should work on mobile with horizontal swipe.

Visual style:
- Since my landing is premium dark blue, adapt the carousel to dark/glassmorphism:
  - section background can be dark navy or slightly lighter contrast block,
  - cards use `bg-white/[0.04]`, `border-white/10`, `backdrop-blur`,
  - visuals use blue gradients, document previews, advisor cards, or abstract academic scenes.
- If the current design includes light editorial sections, it can be light, but keep it premium and aligned with the rest of the landing.

Example testimonial data:
1. Name: “María Fernanda, Pregrado”
   Quote: “Tenía una idea muy amplia y no sabía por dónde empezar. La revisión de viabilidad me ayudó a convertirla en un tema realista.”
   Outcome: “Tema validado y delimitado”

2. Name: “Luis Alberto, Ingeniería”
   Quote: “El sistema me ordenó por módulos y el asesor me indicó qué observaciones resolver primero. Dejé de avanzar a ciegas.”
   Outcome: “Ruta de avance clara”

3. Name: “Camila, Maestría”
   Quote: “Subí mi borrador y recibí comentarios más organizados. Pude corregir metodología, objetivos y coherencia antes de enviarlo.”
   Outcome: “Borrador mejorado”

4. Name: “Renato, Administración”
   Quote: “La preparación para sustentación me dio seguridad. Practiqué preguntas críticas y ajusté mi presentación antes del día final.”
   Outcome: “Sustentación más segura”

5. Name: “Andrea, Educación”
   Quote: “La combinación de IA y asesoría humana me ayudó a redactar mejor sin perder el enfoque académico de mi universidad.”
   Outcome: “Redacción más clara”

Suggested component structure:
```tsx
<section id="resultados" className="relative overflow-hidden py-28">
  <div className="mx-auto max-w-7xl px-6">
    {/* trust line */}
    {/* title + subtitle */}
  </div>

  <div className="mt-16 overflow-hidden">
    <motion.div
      drag="x"
      dragConstraints={...}
      className="flex gap-10 px-[6vw]"
    >
      {/* testimonial cards */}
    </motion.div>
  </div>

  {/* bottom segmented progress + counter */}
</section>

Important:

Do not make testimonials a normal 3-column grid.
Do not make tiny review cards.
Do not center everything in a generic SaaS layout.
The section must feel like a horizontal editorial story carousel, with large cards and visible side overflow.
The user should feel they are browsing student stories/outcomes, not just reading reviews.

Create a section showing what people achieve after using the platform:
Title:
“Resultados que se sienten en cada avance”

Use testimonial/story cards:
- “De idea desordenada a proyecto estructurado”
- “Menos bloqueo al redactar capítulos”
- “Mejor preparación para observaciones”
- “Mayor claridad antes de sustentar”

Use realistic Spanish testimonials, not too exaggerated:
Example:
“Antes tenía documentos sueltos y comentarios perdidos. Ahora sé qué módulo avanzar y qué observación resolver primero.”

Add measurable benefit cards:
- “Ruta clara”
- “Menos retrabajo”
- “Mejor organización”
- “Acompañamiento experto”

7. Final CTA
Create a final premium dark CTA:
Headline:
“Tu tesis no necesita más caos. Necesita dirección.”
Subheadline:
“Empieza con una ruta clara, apoyo inteligente y asesores disponibles cuando los necesites.”
Buttons:
“Crear mi cuenta”
“Explorar asesores”

8. Footer
Clean footer with:
- Product links
- Plans
- Advisors
- Login/Register
- Privacy/Terms placeholders if existing

Animation requirements:
- Use Lenis globally or only inside landing initialization.
- Add scroll reveal animations.
- Add sticky narrative transitions.
- Add subtle glow movement in hero.
- Add hover lift to cards.
- Respect reduced motion if possible.

Code organization:
Create or refactor landing components like:
- LandingPage.tsx
- LandingNavbar.tsx
- HeroSection.tsx
- HowItWorksNarrative.tsx
- PlansSection.tsx
- AdvisorsSection.tsx
- OutcomesSection.tsx
- FinalCTA.tsx
- LandingFooter.tsx

Do not put everything in one huge component unless the project structure requires it.

Important:
- Do not copy Superpower text or medical content.
- Do not use the Superpower name anywhere in the UI.
- Do not remove existing routing.
- Do not break mobile layout.
- Do not modify non-landing pages.
- Keep the final result premium, dark, blue, modular, smooth, and conversion-focused.
````
