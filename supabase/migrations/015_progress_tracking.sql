-- NRB Vidyalaya LMS - Migration 015: Progress Tracking

-- ─── Lesson Progress ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- ─── Course Progress ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS course_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
  total_lessons INTEGER DEFAULT 0,
  completed_lessons INTEGER DEFAULT 0,
  progress_percent INTEGER DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

-- ─── Enable RLS ─────────────────────────────────────────────
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_progress ENABLE ROW LEVEL SECURITY;

-- ─── RLS Policies: lesson_progress ──────────────────────────
CREATE POLICY "Students can view own lesson progress" ON lesson_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Students can insert own lesson progress" ON lesson_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Students can update own lesson progress" ON lesson_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- ─── RLS Policies: course_progress ──────────────────────────
CREATE POLICY "Students can view own course progress" ON course_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Students can insert own course progress" ON course_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Students can update own course progress" ON course_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- ─── Recalculate Course Progress Function ───────────────────
CREATE OR REPLACE FUNCTION recalculate_course_progress(
  p_user_id UUID,
  p_course_id UUID
)
RETURNS VOID AS $$
DECLARE
  v_total_lessons INTEGER;
  v_completed_lessons INTEGER;
  v_progress_percent INTEGER;
BEGIN
  -- Count total published lessons in the course
  SELECT COUNT(*) INTO v_total_lessons
  FROM lessons
  WHERE course_id = p_course_id AND is_published = TRUE;

  -- Count completed lessons for this user
  SELECT COUNT(*) INTO v_completed_lessons
  FROM lesson_progress
  WHERE user_id = p_user_id AND course_id = p_course_id AND completed = TRUE;

  -- Calculate progress percentage
  IF v_total_lessons > 0 THEN
    v_progress_percent := ROUND((v_completed_lessons::DECIMAL / v_total_lessons) * 100);
  ELSE
    v_progress_percent := 0;
  END IF;

  -- Upsert course_progress
  INSERT INTO course_progress (user_id, course_id, total_lessons, completed_lessons, progress_percent, updated_at)
  VALUES (p_user_id, p_course_id, v_total_lessons, v_completed_lessons, v_progress_percent, NOW())
  ON CONFLICT (user_id, course_id)
  DO UPDATE SET
    total_lessons = v_total_lessons,
    completed_lessons = v_completed_lessons,
    progress_percent = v_progress_percent,
    updated_at = NOW();

  -- Also update the enrollments table for backward compatibility
  UPDATE enrollments
  SET progress_percent = v_progress_percent,
      completed_at = CASE WHEN v_progress_percent = 100 THEN COALESCE(completed_at, NOW()) ELSE NULL END
  WHERE user_id = p_user_id AND course_id = p_course_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── Trigger Function ───────────────────────────────────────
CREATE OR REPLACE FUNCTION trigger_recalculate_course_progress()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM recalculate_course_progress(
    COALESCE(NEW.user_id, OLD.user_id),
    COALESCE(NEW.course_id, OLD.course_id)
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── Trigger ────────────────────────────────────────────────
CREATE TRIGGER on_lesson_progress_change
  AFTER INSERT OR UPDATE OR DELETE ON lesson_progress
  FOR EACH ROW
  EXECUTE FUNCTION trigger_recalculate_course_progress();
