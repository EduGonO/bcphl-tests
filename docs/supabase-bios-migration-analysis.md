# Supabase handling analysis (pre-bios migration)

This inventory documents how Supabase is currently wired before migrating bios.

## Server-side Supabase bootstrap

- `lib/supabase/serverClient.ts`
  - Centralized Supabase server client creation via `@supabase/supabase-js`.
  - Reads env vars (`SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_URL` and service-role style key envs).
  - Returns `null` when env is missing, and callers decide whether to fail or degrade.

## Supabase content data-access layer

- `lib/supabase/content.ts`
  - Defines read-side loaders and mappers for article/category/intro data.
  - Tables currently used:
    - `bicephale_categories`
    - `bicephale_article_categories`
    - `bicephale_articles`
    - `bicephale_article_relations`
    - `bicephale_article_media`
  - Includes `formatSupabaseError` utility used across API routes.

- `lib/supabase/workspace.ts`
  - Fetches category/article summary data for the editor workspace.
  - Handles missing env gracefully by returning `supabaseError` to the UI.

## Application service layer using Supabase

- `lib/articleService.ts`
  - Main article read/transform layer for website rendering.
  - Hydrates article summaries/details from Supabase and builds app-specific `Article` models.
  - Adds in-memory caching/version checking to reduce repeated DB calls.

- `lib/introService.ts`
  - Loads intro sections from Supabase (`author_name = 'Intro'` + title allowlist).

## API routes that write to Supabase

- `pages/api/supabase/articles/index.ts`
  - Article list retrieval + article creation endpoint.
- `pages/api/supabase/articles/[id].ts`
  - Article detail retrieval + update + delete endpoint.
- `pages/api/supabase/intros.ts`
  - Intro entries retrieval + update endpoint.

These routes all depend on `getSupabaseServerClient()` and `formatSupabaseError()`.

## Editor pages/components depending on Supabase data

- `pages/editeur.tsx`
  - SSR-loads Supabase workspace data and renders the writer workspace.
- `pages/admin.tsx` and `pages/master.tsx`
  - Same workspace shell pattern with different role/variant context.
- `app/components/indices/EditorShell.tsx`
  - Wrapper component around the Supabase workspace.
- `app/components/indices/SupabaseWorkspace.tsx`
  - Main editing UI.
  - Calls `/api/supabase/articles/*` and `/api/supabase/intros` for CRUD.

## Current bios source (not Supabase yet)

- `data/team.json`
  - Hardcoded bios data (slug/name/rank/portraitBase/bio paragraph array).
- `lib/team.ts`
  - Maps bios data and computes portrait paths.
- `pages/bios.tsx`
  - Renders bios UI directly from `getTeamMembers()`.

## Proposed first migration artifact

- New SQL script: `sql/bicephale_bios_seed.sql`
  - Creates a dedicated `public.bicephale_bios` table.
  - Enables RLS and creates public-read/editor-manage policies.
  - Seeds all current bios from `data/team.json` using idempotent upsert on `slug`.
