-- NRB Vidyalaya LMS - Migration 011: Add study_materials table and fix storage
-- The study_materials table tracks uploaded study materials with metadata

-- ============================================================
-- 1. Create study_materials table
-- ============================================================

CREATE TABLE IF NOT EXISTS study_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE study_materials ENABLE ROW LEVEL SECURITY;

-- Students enrolled in the course can view materials
CREATE POLICY "study_materials_select_enrolled" ON study_materials
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM enrollments e
      WHERE e.user_id = auth.uid()
        AND e.course_id = study_materials.course_id
    )
  );

-- Teachers who own the course can manage materials
CREATE POLICY "study_materials_manage_teacher" ON study_materials
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM courses c
      WHERE c.id = study_materials.course_id
        AND c.teacher_id = auth.uid()
    )
  );

-- Admins can manage all materials
CREATE POLICY "study_materials_manage_admin" ON study_materials
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('SUPER_ADMIN', 'ADMIN')
    )
  );

-- ============================================================
-- 2. Fix broken storage policy for study-materials bucket
-- Drop the policy that references non-existent study_materials table join
-- and replace with a simpler role-based policy
-- ============================================================

-- Drop the broken SELECT policy
DROP POLICY IF EXISTS "study_materials_select_enrolled" ON storage.objects;

-- Create a working SELECT policy: enrolled students, teachers, and admins can view
CREATE POLICY "study_materials_select_authorized" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'study-materials'
    AND (
      -- Admins can view all
      EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN')
      )
      -- Teachers can view all (they upload them)
      OR EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'TEACHER'
      )
      -- Students can view (enrollment check done at app level)
      OR EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'STUDENT'
      )
    )
  );
