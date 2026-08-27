-- NRB Vidyalaya LMS - Migration 012: Fix profiles RLS infinite recursion
-- All policies that run "SELECT 1 FROM profiles WHERE id = auth.uid()" inside
-- the profiles table's own RLS cause Postgres to re-evaluate the policy,
-- creating infinite recursion and returning 500 errors.
--
-- Fix: Use a SECURITY DEFINER function that bypasses RLS to read the role.

-- ============================================================
-- 1. Create helper function (runs as owner, bypasses RLS)
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- ============================================================
-- 2. Drop ALL existing profiles policies to start clean
-- ============================================================

DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
DROP POLICY IF EXISTS "profiles_select_admin" ON profiles;
DROP POLICY IF EXISTS "profiles_select_teacher_students" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_admin" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_admin" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- ============================================================
-- 3. Recreate profiles policies using get_user_role()
-- ============================================================

-- Users can read their own profile
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Admins and Super Admins can read all profiles
CREATE POLICY "profiles_select_admin" ON profiles
  FOR SELECT USING (public.get_user_role() IN ('SUPER_ADMIN', 'ADMIN'));

-- Teachers can view profiles of their enrolled students
CREATE POLICY "profiles_select_teacher_students" ON profiles
  FOR SELECT USING (
    public.get_user_role() = 'TEACHER'
    AND id IN (
      SELECT e.user_id FROM enrollments e
      JOIN courses c ON c.id = e.course_id
      WHERE c.teacher_id = auth.uid()
    )
  );

-- Users can update their own profile
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Admins can update any profile
CREATE POLICY "profiles_update_admin" ON profiles
  FOR UPDATE USING (public.get_user_role() IN ('SUPER_ADMIN', 'ADMIN'));

-- Admins can insert profiles
CREATE POLICY "profiles_insert_admin" ON profiles
  FOR INSERT WITH CHECK (public.get_user_role() IN ('SUPER_ADMIN', 'ADMIN'));

-- ============================================================
-- 4. Fix ALL other tables that also query profiles in their RLS
-- ============================================================

-- Courses: drop old admin policy, recreate with get_user_role()
DROP POLICY IF EXISTS "admins_manage_courses" ON courses;
DROP POLICY IF EXISTS "Admins can manage all courses" ON courses;
CREATE POLICY "admins_manage_courses" ON courses
  FOR ALL USING (public.get_user_role() IN ('SUPER_ADMIN', 'ADMIN'));

-- Lessons: drop old admin policy, recreate with get_user_role()
DROP POLICY IF EXISTS "admins_manage_lessons" ON lessons;
DROP POLICY IF EXISTS "Admins can manage all lessons" ON lessons;
CREATE POLICY "admins_manage_lessons" ON lessons
  FOR ALL USING (public.get_user_role() IN ('SUPER_ADMIN', 'ADMIN'));

-- Attendance: admin policy
DROP POLICY IF EXISTS "attendance_manage_admin" ON attendance;
CREATE POLICY "attendance_manage_admin" ON attendance
  FOR ALL USING (public.get_user_role() IN ('SUPER_ADMIN', 'ADMIN'));

-- Results: admin policy
DROP POLICY IF EXISTS "results_manage_admin" ON results;
CREATE POLICY "results_manage_admin" ON results
  FOR ALL USING (public.get_user_role() IN ('SUPER_ADMIN', 'ADMIN'));

-- Certificates: admin policy
DROP POLICY IF EXISTS "certificates_manage_admin" ON certificates;
CREATE POLICY "certificates_manage_admin" ON certificates
  FOR ALL USING (public.get_user_role() IN ('SUPER_ADMIN', 'ADMIN'));

-- Notifications: admin insert policy
DROP POLICY IF EXISTS "notifications_insert_admin" ON notifications;
CREATE POLICY "notifications_insert_admin" ON notifications
  FOR INSERT WITH CHECK (public.get_user_role() IN ('SUPER_ADMIN', 'ADMIN'));

-- Payments: admin policy
DROP POLICY IF EXISTS "payments_manage_admin" ON payments;
CREATE POLICY "payments_manage_admin" ON payments
  FOR ALL USING (public.get_user_role() IN ('SUPER_ADMIN', 'ADMIN'));

-- Blog posts: admin policy
DROP POLICY IF EXISTS "blog_posts_manage_admin" ON blog_posts;
CREATE POLICY "blog_posts_manage_admin" ON blog_posts
  FOR ALL USING (public.get_user_role() IN ('SUPER_ADMIN', 'ADMIN'));

-- Question bank: teacher/admin policies
DROP POLICY IF EXISTS "question_bank_select_teacher" ON question_bank;
CREATE POLICY "question_bank_select_teacher" ON question_bank
  FOR SELECT USING (public.get_user_role() IN ('TEACHER', 'ADMIN', 'SUPER_ADMIN'));

DROP POLICY IF EXISTS "question_bank_manage_teacher" ON question_bank;
CREATE POLICY "question_bank_manage_teacher" ON question_bank
  FOR ALL USING (public.get_user_role() IN ('TEACHER', 'ADMIN', 'SUPER_ADMIN'));

-- Enrollments: admin policy
DROP POLICY IF EXISTS "enrollments_manage_admin" ON enrollments;
CREATE POLICY "enrollments_manage_admin" ON enrollments
  FOR ALL USING (public.get_user_role() IN ('SUPER_ADMIN', 'ADMIN'));

-- ============================================================
-- 5. Fix storage policies that query profiles
-- ============================================================

-- Study materials: teacher/admin insert
DROP POLICY IF EXISTS "study_materials_insert_teacher" ON storage.objects;
CREATE POLICY "study_materials_insert_teacher" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'study-materials'
    AND public.get_user_role() IN ('TEACHER', 'ADMIN', 'SUPER_ADMIN')
  );

-- Study materials: admin manage
DROP POLICY IF EXISTS "study_materials_manage_admin" ON storage.objects;
CREATE POLICY "study_materials_manage_admin" ON storage.objects
  FOR ALL USING (
    bucket_id = 'study-materials'
    AND public.get_user_role() IN ('SUPER_ADMIN', 'ADMIN')
  );

-- Study materials: authorized select
DROP POLICY IF EXISTS "study_materials_select_authorized" ON storage.objects;
CREATE POLICY "study_materials_select_authorized" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'study-materials'
    AND public.get_user_role() IN ('ADMIN', 'SUPER_ADMIN', 'TEACHER', 'STUDENT')
  );

-- Blog images: admin insert
DROP POLICY IF EXISTS "blog_images_insert_admin" ON storage.objects;
CREATE POLICY "blog_images_insert_admin" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'blog-images'
    AND public.get_user_role() IN ('ADMIN', 'SUPER_ADMIN')
  );

-- Blog images: admin delete
DROP POLICY IF EXISTS "blog_images_delete_admin" ON storage.objects;
CREATE POLICY "blog_images_delete_admin" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'blog-images'
    AND public.get_user_role() IN ('ADMIN', 'SUPER_ADMIN')
  );

-- Certificates storage: admin insert
DROP POLICY IF EXISTS "certificates_insert_admin" ON storage.objects;
CREATE POLICY "certificates_insert_admin" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'certificates'
    AND public.get_user_role() IN ('ADMIN', 'SUPER_ADMIN')
  );

-- Certificates storage: admin manage
DROP POLICY IF EXISTS "certificates_manage_admin" ON storage.objects;
CREATE POLICY "certificates_manage_admin" ON storage.objects
  FOR ALL USING (
    bucket_id = 'certificates'
    AND public.get_user_role() IN ('SUPER_ADMIN', 'ADMIN')
  );
