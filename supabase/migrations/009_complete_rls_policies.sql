-- NRB Vidyalaya LMS - Migration 009: Complete RLS Policies
-- Adds missing policies for tables created in migration 007

-- ============================================================
-- 1. Attendance Policies
-- ============================================================

-- Students can view their own attendance
CREATE POLICY "attendance_select_own" ON attendance
  FOR SELECT USING (auth.uid() = user_id);

-- Teachers can view attendance for their courses
CREATE POLICY "attendance_select_teacher" ON attendance
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM courses WHERE id = attendance.course_id AND teacher_id = auth.uid()
    )
  );

-- Teachers can insert/update attendance for their courses
CREATE POLICY "attendance_insert_teacher" ON attendance
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM courses WHERE id = attendance.course_id AND teacher_id = auth.uid()
    )
  );

CREATE POLICY "attendance_update_teacher" ON attendance
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM courses WHERE id = attendance.course_id AND teacher_id = auth.uid()
    )
  );

-- Admins can manage all attendance
CREATE POLICY "attendance_manage_admin" ON attendance
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('SUPER_ADMIN', 'ADMIN')
    )
  );

-- ============================================================
-- 2. Results Policies
-- ============================================================

-- Students can view their own results
CREATE POLICY "results_select_own" ON results
  FOR SELECT USING (auth.uid() = user_id);

-- Teachers can view results for their courses
CREATE POLICY "results_select_teacher" ON results
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM courses WHERE id = results.course_id AND teacher_id = auth.uid()
    )
  );

-- Teachers can insert results for their courses
CREATE POLICY "results_insert_teacher" ON results
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM courses WHERE id = results.course_id AND teacher_id = auth.uid()
    )
  );

-- Admins can manage all results
CREATE POLICY "results_manage_admin" ON results
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('SUPER_ADMIN', 'ADMIN')
    )
  );

-- ============================================================
-- 3. Certificates Policies
-- ============================================================

-- Students can view their own certificates
CREATE POLICY "certificates_select_own" ON certificates
  FOR SELECT USING (auth.uid() = user_id);

-- Admins can manage all certificates
CREATE POLICY "certificates_manage_admin" ON certificates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('SUPER_ADMIN', 'ADMIN')
    )
  );

-- ============================================================
-- 4. Notifications Policies
-- ============================================================

-- Users can view their own notifications
CREATE POLICY "notifications_select_own" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "notifications_update_own" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Admins can create notifications for any user
CREATE POLICY "notifications_insert_admin" ON notifications
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('SUPER_ADMIN', 'ADMIN')
    )
  );

-- ============================================================
-- 5. Payments Policies
-- ============================================================

-- Students can view their own payments
CREATE POLICY "payments_select_own" ON payments
  FOR SELECT USING (auth.uid() = user_id);

-- Admins can manage all payments
CREATE POLICY "payments_manage_admin" ON payments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('SUPER_ADMIN', 'ADMIN')
    )
  );

-- ============================================================
-- 6. Blog Posts Policies
-- ============================================================

-- Anyone can view published blog posts
CREATE POLICY "blog_posts_select_published" ON blog_posts
  FOR SELECT USING (status = 'PUBLISHED');

-- Admins can manage all blog posts
CREATE POLICY "blog_posts_manage_admin" ON blog_posts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('SUPER_ADMIN', 'ADMIN')
    )
  );

-- ============================================================
-- 7. AI Conversations Policies
-- ============================================================

-- Users can view their own conversations
CREATE POLICY "ai_conversations_select_own" ON ai_conversations
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own conversations
CREATE POLICY "ai_conversations_insert_own" ON ai_conversations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 8. AI Messages Policies
-- ============================================================

-- Users can view messages in their own conversations
CREATE POLICY "ai_messages_select_own" ON ai_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM ai_conversations WHERE id = ai_messages.conversation_id AND user_id = auth.uid()
    )
  );

-- Users can insert messages in their own conversations
CREATE POLICY "ai_messages_insert_own" ON ai_messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM ai_conversations WHERE id = ai_messages.conversation_id AND user_id = auth.uid()
    )
  );

-- ============================================================
-- 9. Question Bank Policies
-- ============================================================

-- Teachers and Admins can view question bank
CREATE POLICY "question_bank_select_teacher" ON question_bank
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('TEACHER', 'ADMIN', 'SUPER_ADMIN')
    )
  );

-- Teachers and Admins can manage question bank
CREATE POLICY "question_bank_manage_teacher" ON question_bank
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('TEACHER', 'ADMIN', 'SUPER_ADMIN')
    )
  );

-- ============================================================
-- 10. Questions Policies (quiz questions)
-- ============================================================

-- Students can view questions for published quizzes they are attempting
CREATE POLICY "questions_select_enrolled" ON questions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM quizzes q
      JOIN enrollments e ON e.course_id = q.course_id
      WHERE q.id = questions.quiz_id
        AND q.is_published = TRUE
        AND e.user_id = auth.uid()
    )
  );

-- Teachers can manage questions for their own quizzes
CREATE POLICY "questions_manage_teacher" ON questions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM quizzes q
      JOIN courses c ON c.id = q.course_id
      WHERE q.id = questions.quiz_id
        AND c.teacher_id = auth.uid()
    )
  );

-- ============================================================
-- 11. Quiz Attempts - allow inserts for enrolled students
-- ============================================================

-- Students can insert their own quiz attempts
CREATE POLICY "quiz_attempts_insert_own" ON quiz_attempts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Students can update their own quiz attempts (to submit answers)
CREATE POLICY "quiz_attempts_update_own" ON quiz_attempts
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================
-- 12. Submissions - allow inserts for students
-- ============================================================

-- Students can insert their own submissions
CREATE POLICY "submissions_insert_own" ON submissions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Students can update their own submissions (before grading)
CREATE POLICY "submissions_update_own" ON submissions
  FOR UPDATE USING (auth.uid() = user_id);

-- Teachers can view submissions for their assignments
CREATE POLICY "submissions_select_teacher" ON submissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM assignments a
      JOIN courses c ON c.id = a.course_id
      WHERE a.id = submissions.assignment_id
        AND c.teacher_id = auth.uid()
    )
  );

-- Teachers can grade submissions for their assignments
CREATE POLICY "submissions_update_teacher" ON submissions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM assignments a
      JOIN courses c ON c.id = a.course_id
      WHERE a.id = submissions.assignment_id
        AND c.teacher_id = auth.uid()
    )
  );

-- ============================================================
-- 13. Enrollments - allow student self-enrollment
-- ============================================================

-- Students can enroll themselves
CREATE POLICY "enrollments_insert_own" ON enrollments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admins can manage all enrollments
CREATE POLICY "enrollments_manage_admin" ON enrollments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('SUPER_ADMIN', 'ADMIN')
    )
  );
