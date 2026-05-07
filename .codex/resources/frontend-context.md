# Frontend Context

This is a React frontend using Vite.

The app previously used Supabase in several places.

Migration target:

- remove Supabase Auth usage
- remove Supabase RPC usage
- replace Supabase calls with NestJS backend API calls
- preserve UI and styles

Important environment variable:

VITE_API_URL=http://localhost:3000

Recommended API folder:

src/api/
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

Recommended auth storage:

localStorage:

- thesis_token
- thesis_user

Frontend should use:

- centralized API client
- auth context/provider
- protected routes
- feature-specific API modules
