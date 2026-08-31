import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { StudentLayout } from "@/components/layout/StudentLayout";
import { TeacherLayout } from "@/components/layout/AdminLayout";
import { AdminLayout } from "@/components/layout/AdminLayout";
import {
  StudentRoute,
  TeacherRoute,
  AdminRoute,
} from "@/components/auth/ProtectedRoute";
import { PageLoader } from "@/components/common/Loader";

// Public Pages (loaded eagerly - needed on initial visit)
import { HomePage } from "@/pages/public/Home";
import { AboutPage } from "@/pages/public/About";
import { CoursesPage } from "@/pages/public/Courses";
import { CourseDetailsPage } from "@/pages/public/CourseDetails";
import { BlogPage } from "@/pages/public/Blog";
import { BlogDetailsPage } from "@/pages/public/BlogDetails";
import { ContactPage } from "@/pages/public/Contact";
import { AnnouncementsPage } from "@/pages/public/Announcements";
import { CertificateVerifyPage } from "@/pages/public/CertificateVerify";
import { NotFoundPage } from "@/pages/public/NotFound";

// Auth pages (lazy - only loaded when needed)
const LoginPage = lazy(() => import("@/pages/auth/Login").then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import("@/pages/auth/Register").then(m => ({ default: m.RegisterPage })));
const ForgotPasswordPage = lazy(() => import("@/pages/auth/ForgotPassword").then(m => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import("@/pages/auth/ResetPassword").then(m => ({ default: m.ResetPasswordPage })));
const StudentLoginPage = lazy(() => import("@/pages/auth/StudentLogin").then(m => ({ default: m.StudentLoginPage })));
const StudentRegisterPage = lazy(() => import("@/pages/auth/StudentRegister").then(m => ({ default: m.StudentRegisterPage })));
const StudentForgotPasswordPage = lazy(() => import("@/pages/auth/StudentForgotPassword").then(m => ({ default: m.StudentForgotPasswordPage })));
const TeacherLoginPage = lazy(() => import("@/pages/auth/TeacherLogin").then(m => ({ default: m.TeacherLoginPage })));
const TeacherForgotPasswordPage = lazy(() => import("@/pages/auth/TeacherForgotPassword").then(m => ({ default: m.TeacherForgotPasswordPage })));
const AdminLoginPage = lazy(() => import("@/pages/auth/AdminLogin").then(m => ({ default: m.AdminLoginPage })));
const AdminForgotPasswordPage = lazy(() => import("@/pages/auth/AdminForgotPassword").then(m => ({ default: m.AdminForgotPasswordPage })));

// Student Pages (lazy)
const StudentDashboardPage = lazy(() => import("@/pages/student/StudentDashboard").then(m => ({ default: m.StudentDashboardPage })));
const StudentCoursesPage = lazy(() => import("@/pages/student/MyCourses").then(m => ({ default: m.StudentCoursesPage })));
const StudentLessonsPage = lazy(() => import("@/pages/student/Lesson").then(m => ({ default: m.StudentLessonsPage })));
const StudentMaterialsPage = lazy(() => import("@/pages/student/StudyMaterials").then(m => ({ default: m.StudentMaterialsPage })));
const StudentAssignmentsPage = lazy(() => import("@/pages/student/Assignments").then(m => ({ default: m.StudentAssignmentsPage })));
const StudentQuizzesPage = lazy(() => import("@/pages/student/Quizzes").then(m => ({ default: m.StudentQuizzesPage })));
const StudentResultsPage = lazy(() => import("@/pages/student/Results").then(m => ({ default: m.StudentResultsPage })));
const StudentAttendancePage = lazy(() => import("@/pages/student/Attendance").then(m => ({ default: m.StudentAttendancePage })));
const StudentCertificatesPage = lazy(() => import("@/pages/student/Certificates").then(m => ({ default: m.StudentCertificatesPage })));
const StudentAITutorPage = lazy(() => import("@/pages/student/AIHindiTutor").then(m => ({ default: m.StudentAITutorPage })));
const StudentNotificationsPage = lazy(() => import("@/pages/student/Notifications").then(m => ({ default: m.StudentNotificationsPage })));
const StudentProfilePage = lazy(() => import("@/pages/student/Profile").then(m => ({ default: m.StudentProfilePage })));

// Teacher Pages (lazy)
const TeacherDashboardPage = lazy(() => import("@/pages/teacher/TeacherDashboard").then(m => ({ default: m.TeacherDashboardPage })));
const TeacherStudentsPage = lazy(() => import("@/pages/teacher/MyStudents").then(m => ({ default: m.TeacherStudentsPage })));
const TeacherCoursesPage = lazy(() => import("@/pages/teacher/Courses").then(m => ({ default: m.TeacherCoursesPage })));
const TeacherLessonsPage = lazy(() => import("@/pages/teacher/Lessons").then(m => ({ default: m.TeacherLessonsPage })));
const TeacherAssignmentsPage = lazy(() => import("@/pages/teacher/Assignments").then(m => ({ default: m.TeacherAssignmentsPage })));
const TeacherSubmissionsPage = lazy(() => import("@/pages/teacher/Submissions").then(m => ({ default: m.TeacherSubmissionsPage })));
const TeacherQuizzesPage = lazy(() => import("@/pages/teacher/Quizzes").then(m => ({ default: m.TeacherQuizzesPage })));
const TeacherQuestionBankPage = lazy(() => import("@/pages/teacher/QuestionBank").then(m => ({ default: m.TeacherQuestionBankPage })));
const TeacherQuizImporterPage = lazy(() => import("@/pages/teacher/QuizImporter").then(m => ({ default: m.TeacherQuizImporterPage })));
const TeacherAttendancePage = lazy(() => import("@/pages/teacher/Attendance").then(m => ({ default: m.TeacherAttendancePage })));
const TeacherPerformancePage = lazy(() => import("@/pages/teacher/StudentPerformance").then(m => ({ default: m.TeacherPerformancePage })));
const TeacherAnnouncementsPage = lazy(() => import("@/pages/teacher/Announcements").then(m => ({ default: m.TeacherAnnouncementsPage })));
const TeacherProfilePage = lazy(() => import("@/pages/teacher/Profile").then(m => ({ default: m.TeacherProfilePage })));

// Admin Pages (lazy)
const AdminDashboardPage = lazy(() => import("@/pages/admin/AdminDashboard").then(m => ({ default: m.AdminDashboardPage })));
const AdminUsersPage = lazy(() => import("@/pages/admin/Users").then(m => ({ default: m.AdminUsersPage })));
const AdminStudentsPage = lazy(() => import("@/pages/admin/Students").then(m => ({ default: m.AdminStudentsPage })));
const AdminTeachersPage = lazy(() => import("@/pages/admin/Teachers").then(m => ({ default: m.AdminTeachersPage })));
const AdminCoursesPage = lazy(() => import("@/pages/admin/Courses").then(m => ({ default: m.AdminCoursesPage })));
const AdminLessonsPage = lazy(() => import("@/pages/admin/Lessons").then(m => ({ default: m.AdminLessonsPage })));
const AdminMaterialsPage = lazy(() => import("@/pages/admin/StudyMaterials").then(m => ({ default: m.AdminMaterialsPage })));
const AdminAssignmentsPage = lazy(() => import("@/pages/admin/Assignments").then(m => ({ default: m.AdminAssignmentsPage })));
const AdminQuizzesPage = lazy(() => import("@/pages/admin/Quizzes").then(m => ({ default: m.AdminQuizzesPage })));
const AdminQuestionBankPage = lazy(() => import("@/pages/admin/QuestionBank").then(m => ({ default: m.AdminQuestionBankPage })));
const AdminAIGeneratorPage = lazy(() => import("@/pages/admin/AIQuestionGenerator").then(m => ({ default: m.AdminAIGeneratorPage })));
const AdminQuizImporterPage = lazy(() => import("@/pages/admin/QuizImporter").then(m => ({ default: m.AdminQuizImporterPage })));
const AdminAttendancePage = lazy(() => import("@/pages/admin/Attendance").then(m => ({ default: m.AdminAttendancePage })));
const AdminResultsPage = lazy(() => import("@/pages/admin/Results").then(m => ({ default: m.AdminResultsPage })));
const AdminCertificatesPage = lazy(() => import("@/pages/admin/Certificates").then(m => ({ default: m.AdminCertificatesPage })));
const AdminBlogPage = lazy(() => import("@/pages/admin/Blog").then(m => ({ default: m.AdminBlogPage })));
const AdminAnnouncementsPage = lazy(() => import("@/pages/admin/Announcements").then(m => ({ default: m.AdminAnnouncementsPage })));
const AdminNotificationsPage = lazy(() => import("@/pages/admin/Notifications").then(m => ({ default: m.AdminNotificationsPage })));
const AdminPaymentsPage = lazy(() => import("@/pages/admin/Payments").then(m => ({ default: m.AdminPaymentsPage })));
const AdminReportsPage = lazy(() => import("@/pages/admin/Reports").then(m => ({ default: m.AdminReportsPage })));
const AdminAnalyticsPage = lazy(() => import("@/pages/admin/Analytics").then(m => ({ default: m.AdminAnalyticsPage })));
const AdminSettingsPage = lazy(() => import("@/pages/admin/Settings").then(m => ({ default: m.AdminSettingsPage })));

function LazyFallback() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <PageLoader />
    </div>
  );
}

export function AppRoutes() {
  return (
    <Routes>
      {/* Public website with shared layout */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/courses/:slug" element={<CourseDetailsPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:slug" element={<BlogDetailsPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/announcements" element={<AnnouncementsPage />} />
        <Route path="/certificate/verify/:certificateNumber" element={<CertificateVerifyPage />} />

        {/* Legacy generic auth */}
        <Route path="/login" element={<Suspense fallback={<LazyFallback />}><LoginPage /></Suspense>} />
        <Route path="/register" element={<Suspense fallback={<LazyFallback />}><RegisterPage /></Suspense>} />
        <Route path="/forgot-password" element={<Suspense fallback={<LazyFallback />}><ForgotPasswordPage /></Suspense>} />
        <Route path="/reset-password" element={<Suspense fallback={<LazyFallback />}><ResetPasswordPage /></Suspense>} />

        {/* Separate portal auth - public pages */}
        <Route path="/student/login" element={<Suspense fallback={<LazyFallback />}><StudentLoginPage /></Suspense>} />
        <Route path="/student/register" element={<Suspense fallback={<LazyFallback />}><StudentRegisterPage /></Suspense>} />
        <Route path="/student/forgot-password" element={<Suspense fallback={<LazyFallback />}><StudentForgotPasswordPage /></Suspense>} />
        <Route path="/teacher/login" element={<Suspense fallback={<LazyFallback />}><TeacherLoginPage /></Suspense>} />
        <Route path="/teacher/forgot-password" element={<Suspense fallback={<LazyFallback />}><TeacherForgotPasswordPage /></Suspense>} />
        <Route path="/admin/login" element={<Suspense fallback={<LazyFallback />}><AdminLoginPage /></Suspense>} />
        <Route path="/admin/forgot-password" element={<Suspense fallback={<LazyFallback />}><AdminForgotPasswordPage /></Suspense>} />
      </Route>

      {/* Student portal - protected */}
      <Route element={<StudentRoute />}>
        <Route path="/student" element={<StudentLayout />}>
          <Route path="dashboard" element={<Suspense fallback={<LazyFallback />}><StudentDashboardPage /></Suspense>} />
          <Route path="courses" element={<Suspense fallback={<LazyFallback />}><StudentCoursesPage /></Suspense>} />
          <Route path="lessons" element={<Suspense fallback={<LazyFallback />}><StudentLessonsPage /></Suspense>} />
          <Route path="materials" element={<Suspense fallback={<LazyFallback />}><StudentMaterialsPage /></Suspense>} />
          <Route path="assignments" element={<Suspense fallback={<LazyFallback />}><StudentAssignmentsPage /></Suspense>} />
          <Route path="quizzes" element={<Suspense fallback={<LazyFallback />}><StudentQuizzesPage /></Suspense>} />
          <Route path="results" element={<Suspense fallback={<LazyFallback />}><StudentResultsPage /></Suspense>} />
          <Route path="attendance" element={<Suspense fallback={<LazyFallback />}><StudentAttendancePage /></Suspense>} />
          <Route path="certificates" element={<Suspense fallback={<LazyFallback />}><StudentCertificatesPage /></Suspense>} />
          <Route path="ai-tutor" element={<Suspense fallback={<LazyFallback />}><StudentAITutorPage /></Suspense>} />
          <Route path="notifications" element={<Suspense fallback={<LazyFallback />}><StudentNotificationsPage /></Suspense>} />
          <Route path="profile" element={<Suspense fallback={<LazyFallback />}><StudentProfilePage /></Suspense>} />
        </Route>
      </Route>

      {/* Teacher portal - protected */}
      <Route element={<TeacherRoute />}>
        <Route path="/teacher" element={<TeacherLayout />}>
          <Route path="dashboard" element={<Suspense fallback={<LazyFallback />}><TeacherDashboardPage /></Suspense>} />
          <Route path="students" element={<Suspense fallback={<LazyFallback />}><TeacherStudentsPage /></Suspense>} />
          <Route path="courses" element={<Suspense fallback={<LazyFallback />}><TeacherCoursesPage /></Suspense>} />
          <Route path="lessons" element={<Suspense fallback={<LazyFallback />}><TeacherLessonsPage /></Suspense>} />
          <Route path="assignments" element={<Suspense fallback={<LazyFallback />}><TeacherAssignmentsPage /></Suspense>} />
          <Route path="submissions" element={<Suspense fallback={<LazyFallback />}><TeacherSubmissionsPage /></Suspense>} />
          <Route path="quizzes" element={<Suspense fallback={<LazyFallback />}><TeacherQuizzesPage /></Suspense>} />
          <Route path="question-bank" element={<Suspense fallback={<LazyFallback />}><TeacherQuestionBankPage /></Suspense>} />
          <Route path="quiz-import" element={<Suspense fallback={<LazyFallback />}><TeacherQuizImporterPage /></Suspense>} />
          <Route path="attendance" element={<Suspense fallback={<LazyFallback />}><TeacherAttendancePage /></Suspense>} />
          <Route path="performance" element={<Suspense fallback={<LazyFallback />}><TeacherPerformancePage /></Suspense>} />
          <Route path="announcements" element={<Suspense fallback={<LazyFallback />}><TeacherAnnouncementsPage /></Suspense>} />
          <Route path="profile" element={<Suspense fallback={<LazyFallback />}><TeacherProfilePage /></Suspense>} />
        </Route>
      </Route>

      {/* Admin portal - protected */}
      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<Suspense fallback={<LazyFallback />}><AdminDashboardPage /></Suspense>} />
          <Route path="users" element={<Suspense fallback={<LazyFallback />}><AdminUsersPage /></Suspense>} />
          <Route path="students" element={<Suspense fallback={<LazyFallback />}><AdminStudentsPage /></Suspense>} />
          <Route path="teachers" element={<Suspense fallback={<LazyFallback />}><AdminTeachersPage /></Suspense>} />
          <Route path="courses" element={<Suspense fallback={<LazyFallback />}><AdminCoursesPage /></Suspense>} />
          <Route path="lessons" element={<Suspense fallback={<LazyFallback />}><AdminLessonsPage /></Suspense>} />
          <Route path="materials" element={<Suspense fallback={<LazyFallback />}><AdminMaterialsPage /></Suspense>} />
          <Route path="assignments" element={<Suspense fallback={<LazyFallback />}><AdminAssignmentsPage /></Suspense>} />
          <Route path="quizzes" element={<Suspense fallback={<LazyFallback />}><AdminQuizzesPage /></Suspense>} />
          <Route path="question-bank" element={<Suspense fallback={<LazyFallback />}><AdminQuestionBankPage /></Suspense>} />
          <Route path="ai-generator" element={<Suspense fallback={<LazyFallback />}><AdminAIGeneratorPage /></Suspense>} />
          <Route path="quiz-import" element={<Suspense fallback={<LazyFallback />}><AdminQuizImporterPage /></Suspense>} />
          <Route path="attendance" element={<Suspense fallback={<LazyFallback />}><AdminAttendancePage /></Suspense>} />
          <Route path="results" element={<Suspense fallback={<LazyFallback />}><AdminResultsPage /></Suspense>} />
          <Route path="certificates" element={<Suspense fallback={<LazyFallback />}><AdminCertificatesPage /></Suspense>} />
          <Route path="blog" element={<Suspense fallback={<LazyFallback />}><AdminBlogPage /></Suspense>} />
          <Route path="announcements" element={<Suspense fallback={<LazyFallback />}><AdminAnnouncementsPage /></Suspense>} />
          <Route path="notifications" element={<Suspense fallback={<LazyFallback />}><AdminNotificationsPage /></Suspense>} />
          <Route path="payments" element={<Suspense fallback={<LazyFallback />}><AdminPaymentsPage /></Suspense>} />
          <Route path="reports" element={<Suspense fallback={<LazyFallback />}><AdminReportsPage /></Suspense>} />
          <Route path="analytics" element={<Suspense fallback={<LazyFallback />}><AdminAnalyticsPage /></Suspense>} />
          <Route path="settings" element={<Suspense fallback={<LazyFallback />}><AdminSettingsPage /></Suspense>} />
        </Route>
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
