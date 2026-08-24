# System Architecture

## Overview

NRB Vidyalaya LMS follows a monorepo architecture with separate frontend and backend packages.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                     Client (Browser)                     │
│  ┌──────────────────────────────────────────────────┐   │
│  │  React SPA (Vite + TypeScript + Tailwind CSS)    │   │
│  │  - Public Pages                                   │   │
│  │  - Student Portal                                 │   │
│  │  - Teacher Portal                                 │   │
│  │  - Admin Portal                                   │   │
│  └──────────────────────┬───────────────────────────┘   │
└─────────────────────────┼───────────────────────────────┘
                          │ HTTPS
┌─────────────────────────┼───────────────────────────────┐
│              Backend API (Express + TS)                  │
│  ┌──────────────────────┴───────────────────────────┐   │
│  │  - Auth Middleware (JWT verification)              │   │
│  │  - Role Middleware (RBAC enforcement)              │   │
│  │  - Validation Middleware (Zod schemas)             │   │
│  │  - Rate Limiting                                  │   │
│  │  - Route Handlers                                 │   │
│  └──────────────────────┬───────────────────────────┘   │
└─────────────────────────┼───────────────────────────────┘
                          │
┌─────────────────────────┼───────────────────────────────┐
│              Supabase                                    │
│  ┌──────────┐  ┌──────────┐  ┌───────────────────┐    │
│  │PostgreSQL │  │  Auth    │  │ Edge Functions    │    │
│  │  (RLS)    │  │ (JWT)    │  │  - AI Hindi Tutor │    │
│  │           │  │          │  │  - AI Generator   │    │
│  │           │  │          │  │  - Certificates   │    │
│  └──────────┘  └──────────┘  └───────────────────┘    │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Storage (Course materials, images, certificates) │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          │
                  ┌───────┴───────┐
                  │  External APIs │
                  │  - OpenAI      │
                  │  - Email SMTP  │
                  └───────────────┘
```

## Data Flow

### Authentication
1. User submits credentials to Supabase Auth
2. Supabase returns JWT
3. Frontend stores JWT in httpOnly cookie
4. Backend validates JWT on each request
5. RLS policies enforce data access

### AI Features
1. Frontend sends request to backend API
2. Backend validates request with Zod
3. Backend constructs AI prompt (never exposes prompt to frontend)
4. Backend calls OpenAI API
5. Backend validates AI response with Zod
6. Backend returns structured response to frontend

### File Uploads
1. Frontend requests signed upload URL from backend
2. Frontend uploads directly to Supabase Storage
3. Backend validates file type and size
4. File URL stored in database
