# Skill: React Auth JWT

## Purpose

Use this skill when replacing Supabase Auth with backend JWT authentication.

## Target flow

POST /auth/login
→ returns token and usuario
→ store token and usuario
→ set auth context
→ redirect based on usuario.rol

## Storage

Use:

- thesis_token
- thesis_user

Never store password.

## Recommended structure

src/context/AuthContext.tsx
or existing auth store if project already has one.

Auth context should expose:

- user
- token
- isAuthenticated
- loading
- login(email, contrasena)
- logout()
- refreshUser() if /auth/me exists

## Login behavior

1. Call authApi.login(email, contrasena).
2. Store token.
3. Store usuario.
4. Update context state.
5. Redirect.

## Logout behavior

1. Remove thesis_token.
2. Remove thesis_user.
3. Clear auth state.
4. Redirect to login.

## Protected routes

If app has routing:

- protect private routes
- if no token, redirect to login
- if role mismatch, redirect or show forbidden

## Do not

- Do not use supabase.auth.
- Do not store password.
- Do not use contrasena_hash.
