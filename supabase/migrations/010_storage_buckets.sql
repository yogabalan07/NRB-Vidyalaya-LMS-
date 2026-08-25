-- NRB Vidyalaya LMS - Migration 010: Supabase Storage Buckets
-- Creates storage buckets for file uploads

-- ============================================================
-- 1. Create Storage Buckets
-- ============================================================

-- Assignment submissions bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'assignment-submissions',
  'assignment-submissions',
  FALSE,
  52428800, -- 50MB
  ARRAY['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
) ON CONFLICT (id) DO NOTHING;

-- Study materials bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'study-materials',
  'study-materials',
  FALSE,
  104857600, -- 100MB
  ARRAY['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'video/mp4', 'video/webm', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
) ON CONFLICT (id) DO NOTHING;

-- Blog images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'blog-images',
  'blog-images',
  TRUE,
  5242880, -- 5MB
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Profile images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-images',
  'profile-images',
  TRUE,
  2097152, -- 2MB
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Certificates bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'certificates',
  'certificates',
  FALSE,
  10485760, -- 10MB
  ARRAY['application/pdf', 'image/png', 'image/jpeg', 'image/jpg']
) ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 2. Assignment Submissions Policies
-- ============================================================

-- Students can upload to their own folder
CREATE POLICY "assignment_submissions_insert_own" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'assignment-submissions'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Students can view their own submissions
CREATE POLICY "assignment_submissions_select_own" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'assignment-submissions'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Teachers can view submissions for their courses
CREATE POLICY "assignment_submissions_select_teacher" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'assignment-submissions'
    AND EXISTS (
      SELECT 1 FROM submissions s
      JOIN assignments a ON a.id = s.assignment_id
      JOIN courses c ON c.id = a.course_id
      WHERE s.user_id::text = (storage.foldername(name))[1]
        AND c.teacher_id = auth.uid()
    )
  );

-- Students can delete their own submissions
CREATE POLICY "assignment_submissions_delete_own" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'assignment-submissions'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================================
-- 3. Study Materials Policies
-- ============================================================

-- Teachers can upload study materials
CREATE POLICY "study_materials_insert_teacher" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'study-materials'
    AND EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('TEACHER', 'ADMIN', 'SUPER_ADMIN')
    )
  );

-- Enrolled students can view study materials
CREATE POLICY "study_materials_select_enrolled" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'study-materials'
    AND (
      EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN')
      )
      OR EXISTS (
        SELECT 1 FROM study_materials sm
        JOIN enrollments e ON e.course_id = sm.course_id
        WHERE sm.file_url LIKE '%' || name || '%'
          AND e.user_id = auth.uid()
      )
    )
  );

-- Admins can manage all study materials
CREATE POLICY "study_materials_manage_admin" ON storage.objects
  FOR ALL USING (
    bucket_id = 'study-materials'
    AND EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('SUPER_ADMIN', 'ADMIN')
    )
  );

-- ============================================================
-- 4. Blog Images Policies
-- ============================================================

-- Admins can upload blog images
CREATE POLICY "blog_images_insert_admin" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'blog-images'
    AND EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

-- Anyone can view blog images (public bucket)
CREATE POLICY "blog_images_select_public" ON storage.objects
  FOR SELECT USING (bucket_id = 'blog-images');

-- Admins can delete blog images
CREATE POLICY "blog_images_delete_admin" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'blog-images'
    AND EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

-- ============================================================
-- 5. Profile Images Policies
-- ============================================================

-- Users can upload their own profile image
CREATE POLICY "profile_images_insert_own" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'profile-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Anyone can view profile images (public bucket)
CREATE POLICY "profile_images_select_public" ON storage.objects
  FOR SELECT USING (bucket_id = 'profile-images');

-- Users can update their own profile image
CREATE POLICY "profile_images_update_own" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'profile-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can delete their own profile image
CREATE POLICY "profile_images_delete_own" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'profile-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================================
-- 6. Certificates Storage Policies
-- ============================================================

-- Admins can upload certificates
CREATE POLICY "certificates_insert_admin" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'certificates'
    AND EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

-- Users can view their own certificates
CREATE POLICY "certificates_select_own" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'certificates'
    AND EXISTS (
      SELECT 1 FROM certificates c
      WHERE c.user_id::text = (storage.foldername(name))[1]
        AND c.user_id = auth.uid()
    )
  );

-- Admins can manage all certificates
CREATE POLICY "certificates_manage_admin" ON storage.objects
  FOR ALL USING (
    bucket_id = 'certificates'
    AND EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('SUPER_ADMIN', 'ADMIN')
    )
  );
