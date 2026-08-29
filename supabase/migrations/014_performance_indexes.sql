-- NRB Vidyalaya LMS - Migration 014: Performance Indexes
-- Adds indexes on frequently queried columns for better query performance

-- ============================================================
-- Course-related indexes
-- ============================================================

-- courses.teacher_id: Used in teacher dashboard, RLS policies, course listing per teacher
CREATE INDEX IF NOT EXISTS idx_courses_teacher_id ON courses(teacher_id);

-- courses.is_published: Used in public course listing, RLS policies
CREATE INDEX IF NOT EXISTS idx_courses_is_published ON courses(is_published);

-- ============================================================
-- Enrollment-related indexes
-- ============================================================

-- enrollments.user_id: Used in student dashboard, my courses, enrollment lookups
CREATE INDEX IF NOT EXISTS idx_enrollments_user_id ON enrollments(user_id);

-- enrollments.course_id: Used in course student lists, attendance checks
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON enrollments(course_id);

-- ============================================================
-- Lesson-related indexes
-- ============================================================

-- lessons.course_id: Used in course lessons listing, RLS policies
CREATE INDEX IF NOT EXISTS idx_lessons_course_id ON lessons(course_id);

-- lessons.sort_order: Used in lesson ordering
CREATE INDEX IF NOT EXISTS idx_lessons_sort_order ON lessons(sort_order);

-- ============================================================
-- Assignment-related indexes
-- ============================================================

-- assignments.course_id: Used in course assignment listing
CREATE INDEX IF NOT EXISTS idx_assignments_course_id ON assignments(course_id);

-- ============================================================
-- Submission-related indexes
-- ============================================================

-- submissions.assignment_id: Used in grading, submission lookups
CREATE INDEX IF NOT EXISTS idx_submissions_assignment_id ON submissions(assignment_id);

-- submissions.user_id: Used in student submission history
CREATE INDEX IF NOT EXISTS idx_submissions_user_id ON submissions(user_id);

-- submissions.status: Used in pending submissions count
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);

-- ============================================================
-- Quiz-related indexes
-- ============================================================

-- quizzes.course_id: Used in course quiz listing
CREATE INDEX IF NOT EXISTS idx_quizzes_course_id ON quizzes(course_id);

-- quizzes.is_published: Used in published quiz filtering
CREATE INDEX IF NOT EXISTS idx_quizzes_is_published ON quizzes(is_published);

-- questions.quiz_id: Used in quiz question listing
CREATE INDEX IF NOT EXISTS idx_questions_quiz_id ON questions(quiz_id);

-- quiz_attempts.user_id: Used in student attempt history
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON quiz_attempts(user_id);

-- quiz_attempts.quiz_id: Used in quiz attempt listing
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz_id ON quiz_attempts(quiz_id);

-- ============================================================
-- Attendance-related indexes
-- ============================================================

-- attendance.user_id: Used in student attendance view
CREATE INDEX IF NOT EXISTS idx_attendance_user_id ON attendance(user_id);

-- attendance.course_id: Used in course attendance view
CREATE INDEX IF NOT EXISTS idx_attendance_course_id ON attendance(course_id);

-- ============================================================
-- Result-related indexes
-- ============================================================

-- results.user_id: Used in student results view
CREATE INDEX IF NOT EXISTS idx_results_user_id ON results(user_id);

-- results.course_id: Used in course results view
CREATE INDEX IF NOT EXISTS idx_results_course_id ON results(course_id);

-- ============================================================
-- Notification-related indexes
-- ============================================================

-- notifications.user_id: Used in user notification listing, unread count
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);

-- notifications.is_read: Used in unread notification filtering
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- ============================================================
-- Payment-related indexes
-- ============================================================

-- payments.user_id: Used in student payment history
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);

-- ============================================================
-- Certificate-related indexes
-- ============================================================

-- certificates.user_id: Used in student certificate listing
CREATE INDEX IF NOT EXISTS idx_certificates_user_id ON certificates(user_id);

-- ============================================================
-- Blog-related indexes
-- ============================================================

-- blog_posts.status: Used in published blog listing
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);

-- blog_posts.author_id: Used in author blog listing
CREATE INDEX IF NOT EXISTS idx_blog_posts_author_id ON blog_posts(author_id);

-- ============================================================
-- AI-related indexes
-- ============================================================

-- ai_conversations.user_id: Used in user conversation listing
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_id ON ai_conversations(user_id);

-- ai_messages.conversation_id: Used in conversation message listing
CREATE INDEX IF NOT EXISTS idx_ai_messages_conversation_id ON ai_messages(conversation_id);
