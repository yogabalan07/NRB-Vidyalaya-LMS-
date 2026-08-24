# NRB Vidyalaya LMS

An AI-powered Hindi Language Learning Management System built for NRB Vidyalaya.

## Tech Stack

### Frontend
- React 19 + TypeScript
- Vite 6
- Tailwind CSS 3 + shadcn/ui
- React Router v7
- React Hook Form + Zod
- TanStack Query
- Supabase Client

### Backend
- Node.js + Express + TypeScript
- Supabase (PostgreSQL, Auth, Storage, RLS)
- Zod validation
- Rate limiting with express-rate-limit

### Database
- Supabase PostgreSQL
- Row Level Security (RLS) policies
- Edge Functions for AI features

## Getting Started

### Prerequisites
- Node.js >= 18
- pnpm >= 9
- Supabase project

### Installation

```bash
# Install dependencies
pnpm install

# Copy environment files
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env

# Start development servers
pnpm dev          # Frontend on port 3000
pnpm dev:backend  # Backend on port 4000
```

### Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start frontend dev server |
| `pnpm dev:backend` | Start backend dev server |
| `pnpm build` | Build frontend for production |
| `pnpm typecheck` | Type check all packages |
| `pnpm lint` | Lint all packages |
| `pnpm test` | Run all tests |

## Project Structure

```
NRB-Vidyalaya-LMS/
├── frontend/          # React + Vite frontend
├── backend/           # Express + TypeScript API
├── supabase/          # Migrations, edge functions, seed data
├── storage/           # Supabase Storage bucket configs
├── tests/             # Frontend, backend, and E2E tests
├── docs/              # Project documentation
├── scripts/           # Utility scripts
└── .github/workflows/ # CI/CD pipelines
```

## Features

- Public website with Hindi learning content
- Student portal with courses, quizzes, assignments
- Teacher portal for course management
- Admin portal with full platform control
- AI Hindi Tutor (conversation-based learning)
- AI Question Generator
- AI Writing Correction
- MCQ/Quiz system with automatic evaluation
- Attendance tracking
- Certificate generation
- Payment management
- Blog/CMS

## License

MIT
