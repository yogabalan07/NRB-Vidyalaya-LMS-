# AGENTS.md - NRB Vidyalaya LMS

## Project Overview

Professional AI-powered Learning Management System for NRB Vidyalaya - a Hindi tuition and language learning institution.

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite 6, Tailwind CSS 3, shadcn/ui pattern, Lucide React
- **Backend:** Node.js, Express, TypeScript
- **Database:** Supabase (PostgreSQL, Auth, Storage, RLS, Edge Functions)
- **AI:** OpenAI API via secure server-side functions only
- **Testing:** Vitest, React Testing Library
- **Package Manager:** pnpm (monorepo)

## Monorepo Structure

```
NRB-Vidyalaya-LMS/
├── frontend/          # React SPA
├── backend/           # Express API
├── supabase/          # Migrations, seed data, edge functions
├── tests/             # Test suites
├── docs/              # Documentation
├── scripts/           # Utility scripts
└── .github/workflows/ # CI/CD
```

## Roles & Authorization

- **SUPER_ADMIN** - Full system access
- **ADMIN** - Manage users, courses, content
- **TEACHER** - Manage own courses, grade, track students
- **STUDENT** - Learn, take quizzes, use AI tutor

**NEVER trust frontend role checks alone.** Enforce via Supabase RLS + backend middleware.

## Core Rules

1. TypeScript strict mode - no `any`
2. Validate all input with Zod
3. No secrets in frontend code
4. AI calls through server-side only
5. Reuse components before creating new ones
6. Path alias: `@/` → `src/`
7. Run typecheck + lint + test + build before every commit
8. Use conventional commits: `feat(scope): description`

## Build Order (Milestones)

1. **Foundation** - Structure, routing, layouts ✅
2. **Authentication** - Supabase Auth, login/register, role routing
3. **Public Website** - Homepage, about, courses, blog, contact
4. **Student Portal** - Dashboard, courses, lessons, progress
5. **Teacher Portal** - Students, courses, assignments, grading
6. **Admin Portal** - Full management dashboard
7. **Hindi Learning** - Alphabet, vocabulary, modules
8. **Quiz/MCQ System** - Question bank, quiz creation, evaluation
9. **AI Features** - Question generator, Hindi tutor, writing correction
10. **Blog/CMS** - Admin blog management, public blog
11. **Certificates** - Generation, verification, QR codes
12. **Notifications** - In-app and email-ready
13. **Payments** - Fee management, receipts
14. **Analytics** - Dashboard analytics, reports

## Security Requirements

- Supabase RLS on all tables
- Rate limiting on API endpoints
- File type and size validation
- Audit logging for admin actions
- JWT validation on all protected routes
- CORS configured for production domains only
