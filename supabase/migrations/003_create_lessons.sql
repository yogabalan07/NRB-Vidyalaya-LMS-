-- NRB Vidyalaya LMS - Migration 003: Create lessons table

CREATE TABLE IF NOT EXISTS lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  video_url TEXT,
  duration_minutes INTEGER,
  sort_order INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published lessons visible to enrolled students" ON lessons
  FOR SELECT USING (
    is_published = TRUE AND EXISTS (
      SELECT 1 FROM enrollments WHERE user_id = auth.uid() AND course_id = lessons.course_id
    )
  );

CREATE POLICY "Teachers can manage own lessons" ON lessons
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM courses WHERE id = lessons.course_id AND teacher_id = auth.uid()
    )
  );
