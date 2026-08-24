# Requirements Document

## Functional Requirements

### 1. Authentication & Authorization
- User registration and login (email/password)
- Role-based access: SUPER_ADMIN, ADMIN, TEACHER, STUDENT
- Password reset flow
- Session management via Supabase Auth

### 2. Public Website
- Homepage with course showcase
- Course listing and details
- Blog with articles about Hindi learning
- Contact form
- FAQ section
- Mobile responsive design

### 3. Student Features
- Enroll in courses
- View lessons and study materials
- Submit assignments
- Take quizzes with automatic grading
- Track attendance
- View certificates
- AI Hindi Tutor conversation
- Grammar and vocabulary practice
- Notification system

### 4. Teacher Features
- Manage assigned courses
- Create and edit lessons
- Create assignments and grade submissions
- Create quizzes and manage question bank
- Mark student attendance
- View student performance
- Post announcements

### 5. Admin Features
- Manage all users (students, teachers)
- Course, module, and lesson management
- Quiz and question bank management
- AI question generation
- Attendance management
- Results and certificate management
- Blog/CMS management
- Payment tracking
- Analytics and reports
- Audit logging
- Platform settings

### 6. AI Features
- AI Hindi Tutor (conversation practice)
- AI Question Generator (structured quiz creation)
- AI Writing Correction (grammar feedback)
- Speaking Practice (architecture ready)

## Non-Functional Requirements

### Performance
- Page load < 3 seconds
- API response < 500ms for standard queries
- Support 100+ concurrent users

### Security
- Supabase RLS on all tables
- No secrets in frontend code
- Input validation with Zod
- Rate limiting on API endpoints
- File type and size validation

### Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigation
- Screen reader support
- Hindi (Devanagari) typography support

### Scalability
- Modular monorepo architecture
- Serverless-ready with Supabase Edge Functions
- CDN-ready static assets
