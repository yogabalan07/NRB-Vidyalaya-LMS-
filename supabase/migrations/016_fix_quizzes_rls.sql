-- NRB Vidyalaya LMS - Migration 016: Fix quizzes RLS policies

-- ─── Quizzes ────────────────────────────────────────────────
-- Drop the overly-restrictive policy
DROP POLICY IF EXISTS "Students can view published quizzes" ON quizzes;

-- Students can view published quizzes (enrolled)
CREATE POLICY "quizzes_select_student" ON quizzes
  FOR SELECT USING (
    is_published = TRUE AND EXISTS (
      SELECT 1 FROM enrollments WHERE user_id = auth.uid() AND course_id = quizzes.course_id
    )
  );

-- Teachers can manage quizzes for their own courses
CREATE POLICY "quizzes_manage_teacher" ON quizzes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM courses WHERE id = quizzes.course_id AND teacher_id = auth.uid()
    )
  );

-- Admins can manage all quizzes
CREATE POLICY "quizzes_manage_admin" ON quizzes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('SUPER_ADMIN', 'ADMIN')
    )
  );

-- ─── Questions ──────────────────────────────────────────────
-- Add admin policy for questions (teachers already have manage policy)
CREATE POLICY "questions_manage_admin" ON questions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('SUPER_ADMIN', 'ADMIN')
    )
  );
