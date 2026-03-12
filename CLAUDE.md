# CLAUDE.md

## Project Overview

VentureFlow KM is a knowledge management platform for venture capital and investment teams. It is a Next.js 16 app using Supabase for database/auth/storage and Anthropic Claude for AI-powered document extraction. Deployed on Vercel from GitHub.

## Commands

- `npm run dev` — Start development server (port 3000)
- `npm run build` — Production build
- `npm start` — Start production server

## Architecture

- **Next.js App Router** with route groups: `(auth)` for login/signup, `(app)` for protected team pages
- **Dynamic route**: `[teamSlug]` scopes all team content (documents, articles, contacts, ideas, tasks, search, settings)
- **API routes** under `app/api/` — serverless functions for CRUD operations and AI extraction
- **Auth middleware** in `proxy.ts` — redirects based on auth state
- **Server Components** for auth-gated pages, **Client Components** for interactive UI

## Key Files

- `lib/ai/claude.ts` — Anthropic client initialization
- `lib/ai/extraction.ts` — Document extraction pipeline (parse → Claude → create entities)
- `lib/ai/prompts.ts` — System prompts for Claude
- `lib/supabase/client.ts` — Browser-side Supabase client
- `lib/supabase/server.ts` — Server-side Supabase client (with admin client for RLS bypass)
- `lib/parsers/` — File parsers: pdf.ts, word.ts, excel.ts, markdown.ts
- `lib/types/database.ts` — Supabase-generated database types
- `lib/types/extraction.ts` — Zod schema for AI extraction results
- `lib/hooks/useTeam.ts` — Team context hook
- `lib/hooks/usePermissions.ts` — Role-based permission checks (canEdit, canAdmin, canView)
- `proxy.ts` — Auth middleware (handles redirects for logged-in/out users)

## Database (Supabase)

- PostgreSQL with Row Level Security (RLS) on all tables
- Core tables: profiles, teams, team_members, documents, articles, contacts, ideas, tasks, tags, content_tags, comments
- Helper functions: `get_team_role()`, `is_team_member()`, `can_edit()`, `is_admin()`
- Migrations in `supabase/migrations/` (001–004)
- Storage bucket: `documents` for file uploads (50MB max)
- Auth: email/password via Supabase Auth, auto-creates profile on signup

## Environment Variables

- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role key (server-side only, bypasses RLS)
- `ANTHROPIC_API_KEY` — Anthropic API key for Claude
- `NEXT_PUBLIC_APP_URL` — App URL (http://localhost:3000 in dev)

## Code Conventions

- TypeScript throughout, strict mode
- Tailwind CSS 4 for styling (no CSS modules)
- Radix UI for accessible primitives (dialog, dropdown, select, tabs, toast, tooltip)
- Zod for runtime validation (API inputs, AI extraction output)
- React Query for server state management
- Custom fonts: Instrument Serif (serif), Syne (sans), Geist Mono (monospace)
- File naming: PascalCase for components, camelCase for utilities/hooks
- API routes return JSON with appropriate HTTP status codes

## AI Extraction Flow

1. File uploaded to Supabase Storage → document record created (status: `pending`)
2. POST `/api/documents/[id]/extract` triggers extraction
3. File downloaded from storage → parsed by type-specific parser
4. Parsed text sent to Claude (claude-sonnet-4-6, max 4096 tokens)
5. Response validated with Zod schema (`ExtractionResult`)
6. Auto-creates: tags, contacts, ideas, tasks in database
7. Document updated with summary, metadata, and status `ready`

## Roles & Permissions

- **admin** — Full access, manage team settings and members
- **editor** — Create and edit content
- **viewer** — Read-only access
- RLS policies enforce these roles at the database level

## Important Notes

- Never commit `.env.local` or expose `SUPABASE_SERVICE_ROLE_KEY` / `ANTHROPIC_API_KEY`
- The admin Supabase client (in server.ts) bypasses RLS — use only in trusted server-side code
- Document status transitions: pending → processing → ready | error
- Comments are polymorphic — `content_type` field determines what they attach to (document, article, idea, task)
- Tags are also polymorphic via `content_tags` join table
