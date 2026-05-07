# Supabase Migration Map

## Goal

Replace Supabase frontend calls with NestJS API calls.

## Mapping

### Supabase Auth

Old:

supabase.auth.signInWithPassword(...)

New:

POST /auth/login

Frontend action:

- call authApi.login(email, contrasena)
- store token in localStorage
- store usuario in localStorage/context
- redirect by role

---

Old:

supabase.auth.signUp(...)

New:

POST /auth/register

Frontend action:

- call authApi.register(payload)
- show success/error
- redirect to login or dashboard depending response

---

Old:

supabase.auth.getUser()
supabase.auth.getSession()

New:

GET /auth/me or local JWT decode/session check

Frontend action:

- load token from localStorage
- call /auth/me if available
- set auth context

---

### Supabase RPC

Old:

supabase.rpc('function_name', params)

New:

Call documented NestJS endpoint.

Frontend action:

- find equivalent endpoint in api-contract.md
- create API function under src/api/
- replace rpc call inside hook/component

---

### Supabase table select

Old:

supabase.from('tesis').select(...)

New:

GET /tesis or documented backend endpoint.

Frontend action:

- use tesisApi.listar()
- update component state

---

### Supabase insert/update/delete

Old:

supabase.from('tabla').insert/update/delete(...)

New:

POST/PUT/PATCH/DELETE documented backend endpoint.

Frontend action:

- use module API function
- preserve loading and toast behavior

---

### Supabase Storage

Old:

supabase.storage.from(...).upload(...)

New:

Pending backend endpoint.

Frontend action:

- mark as pending until backend exposes upload/document endpoint
