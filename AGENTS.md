# AGENTS.md — Thesis Assistant Frontend React

## Project context

This is the React frontend for the thesis assistant project.

The project previously used Supabase in many places. Supabase is now relegated.

Do not add new Supabase usage unless explicitly requested.

Target architecture:

React frontend
→ NestJS Backend API
→ PostgreSQL functions

React must never connect directly to PostgreSQL.

React must not call Supabase Auth, Supabase RPC, Supabase Storage, or Supabase client for new features unless explicitly requested.

## Main migration goal

Replace Supabase-based frontend logic with calls to the NestJS backend API.

Frontend should consume endpoints documented in:

.codex/resources/api-contract.md

If endpoint documentation is missing, ask to update the backend API contract or mark the frontend integration as pending.

## Responsibilities

React owns:

- screens
- UI components
- forms
- frontend validation
- fetch/axios API calls
- auth state
- token storage
- route protection
- user experience
- visual styles

React does not own:

- PostgreSQL credentials
- password hashing
- SQL functions
- database access
- business logic already handled by backend/PostgreSQL

## API rules

Use a centralized API client.

Preferred structure:

src/
api/
client.ts
auth.api.ts
usuarios.api.ts
tesis.api.ts
asesores.api.ts
reuniones.api.ts
documentos.api.ts
pagos.api.ts
modulos.api.ts
mensajes.api.ts
ia.api.ts

API base URL must come from:

VITE_API_URL

Example:

VITE_API_URL=http://localhost:3000

Do not hardcode localhost directly inside components.

## Auth rules

Do not use Supabase Auth.

Use backend JWT auth.

Login flow:

1. React sends email and contrasena to POST /auth/login.
2. Backend returns token and usuario.
3. Frontend stores token and usuario.
4. Private API calls send Authorization: Bearer <token>.
5. Protected routes check token/user state.

Never store or show contrasena_hash.

## Local storage rules

If using localStorage, use keys:

thesis_token
thesis_user

Do not store password.

## UI rules

Preserve existing UI, styles, Tailwind classes, layouts, animations, and component structure unless explicitly asked to redesign.

Do not rewrite screens unnecessarily.

Prefer minimal changes:

- replace data fetching
- replace Supabase calls
- keep visual components intact

## Supabase migration rules

When replacing Supabase:

- identify existing Supabase call
- identify equivalent backend endpoint from api-contract.md
- create or use API function under src/api/
- update component/hook to call API function
- preserve state/loading/error behavior
- remove unused Supabase imports only when no longer used

Do not remove Supabase globally until all usages are migrated or explicitly requested.

## Error handling

API functions should normalize errors.

Components should show user-friendly messages.

For auth errors:

- 401 should redirect to login or clear session
- 403 should show insufficient permissions
- 500 should show generic server error

## Expected answer format when modifying frontend

When asked to implement:

1. List files to modify.
2. Explain endpoint being used.
3. Show full code or focused patch.
4. Preserve UI.
5. Mention what changed for React state.
6. Mention how to test manually.

## Do not

- Do not connect React directly to PostgreSQL.
- Do not add Supabase usage.
- Do not expose DB credentials.
- Do not store passwords.
- Do not return or handle contrasena_hash.
- Do not rewrite UI unnecessarily.
- Do not invent endpoints.
