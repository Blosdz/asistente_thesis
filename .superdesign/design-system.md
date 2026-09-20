# AppTesis design system

## Product context

AppTesis is a Spanish-language academic workspace for thesis students, advisors and administrators. The `/student/my-thesis` route is a document-focused workspace where students manage thesis files, AI assistance, advisor feedback and review access.

## Visual direction

Use a calm, precise academic-product aesthetic. Preserve the existing light AppTesis language: cool white/slate surfaces, blue primary actions, restrained glass effects, generous radii, soft shadows, clear hierarchy and compact professional controls. Avoid decorative gradients, loud color, excessive translucency and marketing-page styling inside the application.

## Color

- Primary blue: `#007AFF`; practical Tailwind actions may use blue 600/700.
- Ink: slate 950/900.
- Secondary text: slate 600/500.
- Muted metadata: slate 400.
- Canvas: `#f8fafc` / `#F2F2F7` with very subtle blue ambient light.
- Panels: white and slate 50.
- Border: slate 100/200.
- Success/available: emerald 50/100/600/700.
- Warning/capacity: amber 50/100/600/700.
- Destructive: rose/red 50/600.

## Typography

- Sans: Aptos, Avenir Next, Segoe UI Variable, Segoe UI, sans-serif.
- Display: Aptos Display with the same fallbacks.
- Modal title: 22–24px, bold, tight tracking.
- Section title: 14–16px, semibold.
- Body: 13–14px.
- Metadata/eyebrows: 10–12px, semibold/medium; avoid excessive letter spacing on long labels.

## Shape and spacing

- Modal panel radius: 28px.
- Internal cards: 16–20px.
- Inputs/buttons: 10–12px.
- Pills/avatar: full radius.
- Use an 8px spacing rhythm; modal padding 24–32px on desktop and 16–20px mobile.
- Prefer a max modal width around 1050–1120px rather than nearly the full viewport.

## Elevation

- Main modal: broad soft shadow around `0 28px 90px -16px rgba(15,23,42,.28)`.
- Cards: subtle `0 8px 24px -16px rgba(15,23,42,.20)`.
- Use borders to define structure; do not stack heavy shadows.

## Components and interaction

- Primary actions: blue fill, white text, visible hover/focus, 40–44px height.
- Secondary actions: neutral white/slate with border.
- Search: leading search icon, clear focus ring, optional keyboard hint.
- Advisor row: avatar/initials, name, supporting academic metadata, status badge, focused action.
- Existing access: show role and permission level; destructive removal must be explicit and confirmable.
- Modal footer: stable, separated by a subtle top border; primary action on the right.
- Always include accessible labels, keyboard Escape, focus visibility, loading and empty states.

## Access-management modal goals

- Make the thesis context visible without competing with the title.
- Distinguish existing access from candidates to invite.
- Make counts, availability and assignment status immediately scannable.
- Keep search and filtering close to the candidate list.
- Avoid controls that suggest unsupported backend behavior. Current implementation supports search and assigning advisors; removal, role editing, link sharing and policy toggles are visual reference ideas only unless implemented separately.
- Responsive behavior: two columns on wide screens; one column with independent logical sections on tablet/mobile; content scrolls while header/footer stay visible.

## Motion

- 150–220ms transitions.
- Modal: fade + 0.95→1 scale.
- Buttons: subtle background/translate/scale feedback only.
- Respect reduced-motion preferences.
