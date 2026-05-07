# Skill: React API Client

## Purpose

Use this skill when creating or modifying frontend API calls to the NestJS backend.

## Rules

Use centralized API client.

Do not call fetch directly inside many components unless there is no existing pattern.

Preferred files:

src/api/client.ts
src/api/auth.api.ts
src/api/tesis.api.ts
src/api/reuniones.api.ts
src/api/pagos.api.ts
src/api/documentos.api.ts

## Environment

Use:

import.meta.env.VITE_API_URL

Do not hardcode backend URL.

## Auth header

For private calls, send:

Authorization: Bearer <token>

Token source:
localStorage.getItem('thesis_token')

## Error handling

Normalize errors.

If response is not ok:

- parse JSON if possible
- throw Error(message)
- if status is 401, allow auth layer to clear session

## Example client

export const API_URL = import.meta.env.VITE_API_URL;

export async function apiRequest(path, options = {}) {
const token = localStorage.getItem('thesis_token');

const headers = {
'Content-Type': 'application/json',
...(token ? { Authorization: `Bearer ${token}` } : {}),
...options.headers,
};

const response = await fetch(`${API_URL}${path}`, {
...options,
headers,
});

const data = await response.json().catch(() => null);

if (!response.ok) {
throw new Error(data?.message || 'Error de servidor');
}

return data;
}

## Do not

- Do not use Supabase.
- Do not connect to PostgreSQL.
- Do not store passwords.
- Do not expose contrasena_hash.
