-- NRB Vidyalaya LMS - Migration 013: Admin User Management + Study Materials Enhancements
-- Adds drive_url, file_name, created_by to study_materials
-- Adds proper indexes and RLS policies

-- ============================================================
-- 1. Enhance study_materials table
-- ============================================================

-- Add drive_url column for Google Drive links
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'study_materials' AND column_name = 'drive_url'
  ) THEN
    ALTER TABLE study_materials ADD COLUMN drive_url TEXT;
  END IF;
END $$;

-- Add file_name column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'study_materials' AND column_name = 'file_name'
  ) THEN
    ALTER TABLE study_materials ADD COLUMN file_name TEXT;
  END IF;
END $$;

-- Add created_by column (who uploaded the material)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'study_materials' AND column_name = 'created_by'
  ) THEN
    ALTER TABLE study_materials ADD COLUMN created_by UUID REFERENCES profiles(id) ON DELETE SET NULL;
  END IF;
END $$;

-- ============================================================
-- 2. Add indexes for performance
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_study_materials_course_id ON study_materials(course_id);
CREATE INDEX IF NOT EXISTS idx_study_materials_created_by ON study_materials(created_by);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- ============================================================
-- 3. Ensure RLS is enabled on study_materials
-- ============================================================

ALTER TABLE study_materials ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate with proper access
DROP POLICY IF EXISTS "Students can view enrolled course materials" ON study_materials;
DROP POLICY IF EXISTS "Teachers can manage their course materials" ON study_materials;
DROP POLICY IF EXISTS "Admins can manage all study materials" ON study_materials;

-- Students can view materials for courses they are enrolled in
CREATE POLICY "study_materials_select_student" ON study_materials
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM enrollments
      WHERE enrollments.user_id = auth.uid()
        AND enrollments.course_id = study_materials.course_id
    )
  );

-- Teachers can manage materials for their own courses
CREATE POLICY "study_materials_manage_teacher" ON study_materials
  FOR ALL USING (
    public.get_user_role() = 'TEACHER'
    AND EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = study_materials.course_id
        AND courses.teacher_id = auth.uid()
    )
  );

-- Admins and Super Admins can manage all materials
CREATE POLICY "study_materials_manage_admin" ON study_materials
  FOR ALL USING (
    public.get_user_role() IN ('SUPER_ADMIN', 'ADMIN')
  );

-- ============================================================
-- 4. Update handle_new_user trigger to also handle role from metadata
-- ============================================================

-- Ensure the trigger function handles role properly
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
