# UI Style Guide

Preserve existing frontend style.

Rules:

- Do not redesign screens unless asked.
- Keep current Tailwind classes.
- Keep current layout and component hierarchy when possible.
- Keep existing toast patterns.
- Keep existing loading states.
- Keep existing animations.
- Keep existing route structure unless migration requires minor changes.

When replacing Supabase:

- change only data layer first
- avoid visual refactors
- preserve variable names when reasonable
- preserve UX messages unless outdated

Preferred implementation:

- API calls live in src/api/
- UI components call hooks/services, not raw fetch everywhere
- shared auth state lives in context/provider
