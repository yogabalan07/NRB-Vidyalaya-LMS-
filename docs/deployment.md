# NRB Vidyalaya LMS - Deployment Guide

## Prerequisites

- Node.js >= 18
- pnpm >= 9
- Supabase project (https://supabase.com)
- OpenAI API key (for AI features)

## 1. Supabase Setup

### Create Project
1. Go to https://supabase.com/dashboard
2. Create a new project
3. Note the Project URL and Anon Key

### Run Migrations
Via the Supabase SQL Editor, run each migration in order:

```
supabase/migrations/001_create_profiles.sql
supabase/migrations/002_create_courses.sql
supabase/migrations/003_create_lessons.sql
supabase/migrations/004_create_enrollments.sql
supabase/migrations/005_create_assignments.sql
supabase/migrations/006_create_quizzes.sql
supabase/migrations/007_create_core_tables.sql
supabase/migrations/008_enhance_auth_rls.sql
supabase/migrations/009_complete_rls_policies.sql
supabase/migrations/010_storage_buckets.sql
supabase/migrations/011_study_materials_and_fix.sql
```

Or use the combined script:
```bash
psql -f supabase/run_all_migrations.sql
```

### Verify Migrations
After running, verify:
- 19 tables exist (profiles, courses, lessons, enrollments, assignments, submissions, quizzes, questions, question_bank, quiz_attempts, attendance, results, certificates, notifications, payments, blog_posts, ai_conversations, ai_messages, study_materials)
- RLS is enabled on all tables
- 5 storage buckets exist (assignment-submissions, study-materials, blog-images, profile-images, certificates)
- Triggers exist (prevent_role_self_update, on_auth_user_created)

## 2. Environment Variables

### Frontend (.env in frontend/)
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### Backend (.env in root or backend/)
```env
PORT=4000
NODE_ENV=production
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
ALLOWED_ORIGINS=https://your-domain.com
OPENAI_API_KEY=your_openai_key
DATABASE_URL=postgresql://postgres:password@db.your-project.supabase.co:5432/postgres
```

**NEVER commit .env files to version control.**

## 3. Build

```bash
# Install dependencies
pnpm install

# Build frontend
pnpm build

# Build backend
pnpm build:backend
```

## 4. Start

```bash
# Production
cd backend && node dist/server.js

# Development
pnpm dev:all
```

## 5. Required Environment Variables

| Variable | Location | Required | Purpose |
|----------|----------|----------|---------|
| `VITE_SUPABASE_URL` | Frontend | Yes | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Frontend | Yes | Supabase anonymous key |
| `SUPABASE_URL` | Backend | Yes | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Backend | Yes | Supabase service role key |
| `ALLOWED_ORIGINS` | Backend | Production | Comma-separated allowed origins |
| `OPENAI_API_KEY` | Backend | For AI | OpenAI API key |
| `DATABASE_URL` | Backend | Optional | Direct database connection |

## 6. AI Features

AI features require a valid OpenAI API key. Without it, the following endpoints return 503:
- `POST /api/ai/chat` - Hindi tutor
- `POST /api/ai/correct-writing` - Grammar correction
- `POST /api/ai/generate-questions` - Question generation

Get your key at: https://platform.openai.com/api-keys

## 7. Storage Buckets

The following buckets must exist in Supabase Storage:
- `assignment-submissions` (private, 50MB limit)
- `study-materials` (private, 100MB limit)
- `blog-images` (public, 5MB limit)
- `profile-images` (public, 2MB limit)
- `certificates` (private, 10MB limit)

These are created by migration 010.

## 8. Security Notes

- RLS is enabled on all database tables
- Service role key must NEVER be exposed to the frontend
- AI endpoints are rate-limited to 20 requests per 15 minutes
- General API is rate-limited to 100 requests per 15 minutes
- Auth middleware reads roles from the database (not JWT metadata)
- The `prevent_role_self_update` trigger prevents users from escalating their own role
