# NRB Vidyalaya LMS - Deployment Guide

## Prerequisites

- Node.js >= 18
- pnpm >= 9
- Supabase project (https://supabase.com)
- OpenAI API key (optional, for AI features)

## 1. Supabase Setup

### Create Project
1. Go to https://supabase.com/dashboard
2. Create a new project
3. Note the Project URL and Anon Key

### Run Migrations

**Option A: Supabase SQL Editor (Recommended)**

Open Supabase Dashboard > SQL Editor and run each migration in order:

1. Copy contents of `supabase/migrations/001_create_profiles.sql`
2. Paste into SQL Editor, click Run
3. Repeat for each file through `011_study_materials_and_fix.sql`

**Option B: psql (If direct database access available)**

```bash
cd C:\Users\HP\Desktop\NRB
psql "postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT.supabase.co:5432/postgres" -f supabase/run_all_migrations.sql
```

**Option C: Individual files**

```bash
psql "DATABASE_URL" -f supabase/migrations/009_complete_rls_policies.sql
psql "DATABASE_URL" -f supabase/migrations/010_storage_buckets.sql
psql "DATABASE_URL" -f supabase/migrations/011_study_materials_and_fix.sql
```

### Verify Migrations

Run in Supabase SQL Editor after applying:

```sql
-- Should return 19 tables
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' ORDER BY table_name;

-- Should return true for all tables (RLS enabled)
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';

-- Should return 5 storage buckets
SELECT id, name, public FROM storage.buckets;

-- Should return 25+ policies
SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public';
```

## 2. Environment Variables

### Frontend (`frontend/.env`)
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### Backend (root `.env`)
```env
PORT=4000
NODE_ENV=production
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
ALLOWED_ORIGINS=https://your-frontend-domain.com,https://www.your-frontend-domain.com
OPENAI_API_KEY=sk-your-openai-key
DATABASE_URL=postgresql://postgres:password@db.your-project.supabase.co:5432/postgres
```

**NEVER commit .env files to version control.**

### Variable Reference

| Variable | Location | Required | Purpose |
|----------|----------|----------|---------|
| `VITE_SUPABASE_URL` | Frontend | Yes | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Frontend | Yes | Supabase anonymous key |
| `SUPABASE_URL` | Backend | Yes | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Backend | Yes | Supabase service role key |
| `ALLOWED_ORIGINS` | Backend | **Production** | Comma-separated allowed origins |
| `OPENAI_API_KEY` | Backend | For AI | OpenAI API key |
| `DATABASE_URL` | Backend | Optional | Direct database connection |

### What is NOT Required

- **SUPABASE_JWT_SECRET** - Not used. Auth uses `supabase.auth.getUser()` server-side.
- Backend has its own `.env` or reads from root `.env` (monorepo setup).

## 3. Build & Deploy

### Build

```bash
# Install dependencies
pnpm install

# Build frontend (output: frontend/dist/)
pnpm build

# Build backend (output: backend/dist/)
pnpm build:backend
```

### Deploy Frontend

Deploy `frontend/dist/` to your hosting provider:
- **Vercel:** Connect Git repo, framework = Vite, root = `frontend`
- **Netlify:** Build command = `pnpm build`, publish dir = `frontend/dist`
- **Cloudflare Pages:** Build command = `cd frontend && pnpm build`

### Deploy Backend

Deploy `backend/dist/` to your hosting provider:
- **Railway:** Connect Git repo, start command = `node dist/server.js`
- **Render:** Build command = `pnpm build:backend`, start command = `cd backend && node dist/server.js`
- **Fly.io:** Use Dockerfile or `fly launch`

### Start Locally

```bash
# Production mode
cd backend && node dist/server.js

# Development mode (both frontend + backend)
pnpm dev:all
```

## 4. Storage Buckets

The following buckets are created by migration 010:

| Bucket | Public | Size Limit | Purpose |
|--------|--------|------------|---------|
| assignment-submissions | No | 50MB | Student assignment files |
| study-materials | No | 100MB | Teacher-uploaded materials |
| blog-images | Yes | 5MB | Blog post images |
| profile-images | Yes | 2MB | User avatars |
| certificates | No | 10MB | Generated certificates |

Verify buckets exist in Supabase Dashboard > Storage after applying migrations.

## 5. AI Features

AI features require a valid OpenAI API key. Without it, the following endpoints return 503:
- `POST /api/ai/chat` - Hindi tutor
- `POST /api/ai/correct-writing` - Grammar correction
- `POST /api/ai/generate-questions` - Question generation

Get your key at: https://platform.openai.com/api-keys

Set in root `.env`:
```env
OPENAI_API_KEY=sk-your-key-here
```

## 6. CORS Configuration

In production, set `ALLOWED_ORIGINS` to your frontend domain(s):

```env
ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com
```

Without this, all cross-origin requests from the frontend will be blocked.

**Do NOT use `*` in production.**

## 7. Security Notes

- RLS is enabled on all 19 database tables
- Service role key must NEVER be exposed to the frontend
- AI endpoints are rate-limited to 20 requests per 15 minutes
- General API is rate-limited to 100 requests per 15 minutes
- Auth middleware reads roles from the database (not JWT metadata)
- The `prevent_role_self_update` trigger prevents users from escalating their own role
- `.env` files are covered by `.gitignore`

## 8. Post-Deployment Verification

After deploying, verify:

1. Homepage loads at your frontend URL
2. Student login at `/student/login` works
3. Teacher login at `/teacher/login` works
4. Admin login at `/admin/login` works
5. Certificate verification at `/certificate/verify/:number` works
6. API health check at `/api/health` returns `{"status":"ok"}`
7. AI features work (if OPENAI_API_KEY is set)
