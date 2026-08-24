-- NRB Vidyalaya LMS - Seed Data (Development Only)
-- WARNING: This data is for development/demo purposes only.

-- Demo profiles
INSERT INTO profiles (id, email, full_name, role) VALUES
  ('00000000-0000-0000-0000-000000000001', 'admin@nrbvidyalaya.com', 'System Admin', 'SUPER_ADMIN'),
  ('00000000-0000-0000-0000-000000000002', 'teacher@nrbvidyalaya.com', 'Rajesh Kumar', 'TEACHER'),
  ('00000000-0000-0000-0000-000000000003', 'student@nrbvidyalaya.com', 'Priya Sharma', 'STUDENT')
ON CONFLICT (id) DO NOTHING;

-- Demo courses
INSERT INTO courses (id, title, slug, description, teacher_id, is_published, difficulty) VALUES
  ('10000000-0000-0000-0000-000000000001', 'Hindi for Beginners', 'hindi-beginners', 'Learn Hindi from scratch with interactive lessons and AI-powered practice.', '00000000-0000-0000-0000-000000000002', TRUE, 'beginner'),
  ('10000000-0000-0000-0000-000000000002', 'Intermediate Hindi Grammar', 'hindi-grammar-intermediate', 'Master Hindi grammar rules with comprehensive lessons and quizzes.', '00000000-0000-0000-0000-000000000002', TRUE, 'intermediate'),
  ('10000000-0000-0000-0000-000000000003', 'Advanced Hindi Literature', 'hindi-literature-advanced', 'Explore classic and modern Hindi literature with detailed analysis.', '00000000-0000-0000-0000-000000000002', FALSE, 'advanced')
ON CONFLICT (id) DO NOTHING;

-- Demo lessons
INSERT INTO lessons (id, course_id, title, sort_order, is_published) VALUES
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Hindi Alphabets - Vowels (स्वर)', 1, TRUE),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'Hindi Alphabets - Consonants (व्यंजन)', 2, TRUE),
  ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 'Basic Greetings and Introductions', 3, TRUE)
ON CONFLICT (id) DO NOTHING;

-- Demo quiz
INSERT INTO quizzes (id, course_id, title, time_limit_minutes, total_marks, pass_percentage, is_published) VALUES
  ('30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Hindi Vowels Quiz', 10, 5, 40, TRUE)
ON CONFLICT (id) DO NOTHING;

-- Demo questions
INSERT INTO questions (id, quiz_id, question, options, correct_option, explanation, marks, difficulty) VALUES
  ('40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001',
   'Which is the first vowel (स्वर) in Hindi?',
   '[{"id":"A","text":"आ"},{"id":"B","text":"अ"},{"id":"C","text":"इ"},{"id":"D","text":"ई"}]',
   'B', 'अ (A) is the first vowel in Hindi alphabet.', 1, 'easy')
ON CONFLICT (id) DO NOTHING;
