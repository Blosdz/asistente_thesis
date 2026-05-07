# Skill: React Supabase to NestJS API Migration

## Purpose

Use this skill when replacing existing Supabase calls in React with NestJS API calls.

## Workflow

1. Search for Supabase usage:
   - supabase.auth
   - supabase.from
   - supabase.rpc
   - supabase.storage
   - createClient
   - @supabase/supabase-js

2. Classify each usage:
   - Auth
   - Data select
   - Insert/update/delete
   - RPC/function
   - Storage upload/download

3. Find equivalent endpoint in:
   .codex/resources/api-contract.md

4. If endpoint exists:
   - create or reuse function in src/api/
   - replace Supabase call
   - preserve UI state/loading/error
   - preserve toasts
   - remove unused Supabase import

5. If endpoint does not exist:
   - do not invent endpoint
   - mark as pending
   - report required backend endpoint

## Output format

When done, report:

- Supabase calls replaced
- API endpoints used
- files modified
- frontend behavior preserved
- pending backend endpoints

## Do not

- Do not redesign UI.
- Do not remove all Supabase package unless asked.
- Do not invent backend endpoints.
- Do not connect React to PostgreSQL.
