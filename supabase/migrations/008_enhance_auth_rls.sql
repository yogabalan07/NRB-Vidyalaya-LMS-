-- NRB Vidyalaya LMS - Migration 008: Enhance Auth RLS and Security
-- Improves profile security, prevents self-role escalation, adds proper admin policies

-- ============================================================
-- 1. Drop existing policies to replace with improved versions
-- ============================================================

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- ============================================================
-- 2. Profiles - Enhanced RLS Policies
-- ============================================================

-- Users can read their own profile
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Admins and Super Admins can read all profiles
CREATE POLICY "profiles_select_admin" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND role IN ('SUPER_ADMIN', 'ADMIN')
    )
  );

-- Teachers can view profiles of their enrolled students (read-only via enrollment join)
CREATE POLICY "profiles_select_teacher_students" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles AS teacher
      WHERE teacher.id = auth.uid()
        AND teacher.role = 'TEACHER'
    )
    AND id IN (
      SELECT student_id FROM enrollments
      WHERE course_id IN (
        SELECT id FROM courses WHERE teacher_id = auth.uid()
      )
    )
  );

-- Users can update their own profile (but NOT role - enforced by trigger)
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Admins can update any profile (for role management)
CREATE POLICY "profiles_update_admin" ON profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND role IN ('SUPER_ADMIN', 'ADMIN')
    )
  );

-- Only admins can insert profiles (admin-created accounts)
-- Registration creates profiles via trigger, so this covers edge cases
CREATE POLICY "profiles_insert_admin" ON profiles
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND role IN ('SUPER_ADMIN', 'ADMIN')
    )
  );

-- ============================================================
-- 3. Prevent self-role escalation via trigger
-- ============================================================

CREATE OR REPLACE FUNCTION prevent_role_self_update()
RETURNS TRIGGER AS $$
BEGIN
  -- If the role field is being changed and the user is not an admin
  IF OLD.role IS DISTINCT FROM NEW.role THEN
    IF NOT EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND role IN ('SUPER_ADMIN', 'ADMIN')
    ) THEN
      RAISE EXCEPTION 'Users cannot modify their own role';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the trigger if it exists, then create it
DROP TRIGGER IF EXISTS enforce_role_security ON profiles;
CREATE TRIGGER enforce_role_security
  BEFORE UPDATE OF role ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION prevent_role_self_update();

-- ============================================================
-- 4. Auto-create profile on user registration via trigger
-- ============================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'STUDENT')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the trigger if it exists, then create it
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- 5. Admin policies for core tables
-- ============================================================

-- Courses: Admins can manage all courses
DROP POLICY IF EXISTS "Admins can manage all courses" ON courses;
CREATE POLICY "admins_manage_courses" ON courses
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND role IN ('SUPER_ADMIN', 'ADMIN')
    )
  );

-- Lessons: Admins can manage all lessons
DROP POLICY IF EXISTS "Admins can manage all lessons" ON lessons;
CREATE POLICY "admins_manage_lessons" ON lessons
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND role IN ('SUPER_ADMIN', 'ADMIN')
    )
  );

-- ============================================================
-- 6. Add status column to profiles if not exists
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'status'
  ) THEN
    ALTER TABLE profiles ADD COLUMN status TEXT NOT NULL DEFAULT 'active'
      CHECK (status IN ('active', 'inactive', 'suspended'));
  END IF;
END $$;

-- ============================================================
-- 7. Add phone column if not exists
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'phone'
  ) THEN
    ALTER TABLE profiles ADD COLUMN phone TEXT;
  END IF;
END $$;
