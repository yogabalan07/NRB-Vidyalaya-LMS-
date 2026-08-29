-- NRB Vidyalaya LMS - Run All Migrations
-- Execute this against the Supabase PostgreSQL database
-- Using psql: psql -f supabase/run_all_migrations.sql

-- Migration 001: Profiles
\i supabase/migrations/001_create_profiles.sql
-- Migration 002: Courses
\i supabase/migrations/002_create_courses.sql
-- Migration 003: Lessons
\i supabase/migrations/003_create_lessons.sql
-- Migration 004: Enrollments
\i supabase/migrations/004_create_enrollments.sql
-- Migration 005: Assignments
\i supabase/migrations/005_create_assignments.sql
-- Migration 006: Quizzes
\i supabase/migrations/006_create_quizzes.sql
-- Migration 007: Core Tables
\i supabase/migrations/007_create_core_tables.sql
-- Migration 008: Enhanced Auth RLS
\i supabase/migrations/008_enhance_auth_rls.sql
-- Migration 009: Complete RLS Policies
\i supabase/migrations/009_complete_rls_policies.sql
-- Migration 010: Storage Buckets
\i supabase/migrations/010_storage_buckets.sql
-- Migration 011: Study Materials Table and Storage Fix
\i supabase/migrations/011_study_materials_and_fix.sql
-- Migration 012: Fix Profiles RLS Recursion (CRITICAL)
\i supabase/migrations/012_fix_profiles_rls_recursion.sql
-- Migration 013: Admin Users and Materials
\i supabase/migrations/013_admin_users_and_materials.sql
-- Migration 014: Performance Indexes
\i supabase/migrations/014_performance_indexes.sql
