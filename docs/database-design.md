# Database Design

## Overview

The database uses Supabase PostgreSQL with Row Level Security (RLS) policies.

## Entity Relationship Diagram

```
profiles ──┬── enrollments ── courses
           │                      │
           ├── submissions ── assignments
           │
           ├── quiz_attempts ── quizzes ── questions
           │
           ├── attendance
           ├── results
           ├── certificates
           ├── payments
           ├── notifications
           ├── ai_conversations ── ai_messages
           │
           └── blog_posts (as author)
```

## Tables

### profiles
Extends Supabase auth.users with application-specific data.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | References auth.users |
| email | TEXT | User email |
| full_name | TEXT | Full name |
| role | TEXT | SUPER_ADMIN, ADMIN, TEACHER, STUDENT |
| phone | TEXT | Phone number |
| avatar_url | TEXT | Profile image |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

### courses
| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Course ID |
| title | TEXT | Course title |
| slug | TEXT (UNIQUE) | URL-friendly slug |
| description | TEXT | Full description |
| teacher_id | UUID (FK) | Assigned teacher |
| is_published | BOOLEAN | Visibility |
| difficulty | TEXT | beginner, intermediate, advanced |

### lessons, assignments, quizzes, questions
Refer to migrations for full schema.

## RLS Policies

All tables have RLS enabled with policies for:
- Students: own data only
- Teachers: own courses and assigned students
- Admins: full access
- Public: published courses only

## Indexes

- profiles: email, role
- courses: slug, teacher_id, is_published
- lessons: course_id, sort_order
- quizzes: course_id, is_published
- attendance: user_id, course_id, date
