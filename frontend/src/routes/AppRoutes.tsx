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

// Public Pages
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
// Legacy generic auth pages
import { LoginPage } from "@/pages/auth/Login";
import { RegisterPage } from "@/pages/auth/Register";
import { ForgotPasswordPage } from "@/pages/auth/ForgotPassword";
import { ResetPasswordPage } from "@/pages/auth/ResetPassword";

// Separate portal auth pages
import { StudentLoginPage } from "@/pages/auth/StudentLogin";
import { StudentRegisterPage } from "@/pages/auth/StudentRegister";
import { StudentForgotPasswordPage } from "@/pages/auth/StudentForgotPassword";
import { TeacherLoginPage } from "@/pages/auth/TeacherLogin";
import { TeacherForgotPasswordPage } from "@/pages/auth/TeacherForgotPassword";
import { AdminLoginPage } from "@/pages/auth/AdminLogin";
import { AdminForgotPasswordPage } from "@/pages/auth/AdminForgotPassword";

// Student Pages
import { StudentDashboardPage } from "@/pages/student/StudentDashboard";
import { StudentCoursesPage } from "@/pages/student/MyCourses";
import { StudentLessonsPage } from "@/pages/student/Lesson";
import { StudentMaterialsPage } from "@/pages/student/StudyMaterials";
import { StudentAssignmentsPage } from "@/pages/student/Assignments";
import { StudentQuizzesPage } from "@/pages/student/Quizzes";
import { StudentResultsPage } from "@/pages/student/Results";
import { StudentAttendancePage } from "@/pages/student/Attendance";
import { StudentCertificatesPage } from "@/pages/student/Certificates";
import { StudentAITutorPage } from "@/pages/student/AIHindiTutor";
import { StudentNotificationsPage } from "@/pages/student/Notifications";
import { StudentProfilePage } from "@/pages/student/Profile";

// Teacher Pages
import { TeacherDashboardPage } from "@/pages/teacher/TeacherDashboard";
import { TeacherStudentsPage } from "@/pages/teacher/MyStudents";
import { TeacherCoursesPage } from "@/pages/teacher/Courses";
import { TeacherLessonsPage } from "@/pages/teacher/Lessons";
import { TeacherAssignmentsPage } from "@/pages/teacher/Assignments";
import { TeacherSubmissionsPage } from "@/pages/teacher/Submissions";
import { TeacherQuizzesPage } from "@/pages/teacher/Quizzes";
import { TeacherQuestionBankPage } from "@/pages/teacher/QuestionBank";
import { TeacherAttendancePage } from "@/pages/teacher/Attendance";
import { TeacherPerformancePage } from "@/pages/teacher/StudentPerformance";
import { TeacherAnnouncementsPage } from "@/pages/teacher/Announcements";
import { TeacherProfilePage } from "@/pages/teacher/Profile";

// Admin Pages
import { AdminDashboardPage } from "@/pages/admin/AdminDashboard";
import { AdminUsersPage } from "@/pages/admin/Users";
import { AdminStudentsPage } from "@/pages/admin/Students";
import { AdminTeachersPage } from "@/pages/admin/Teachers";
import { AdminCoursesPage } from "@/pages/admin/Courses";
import { AdminLessonsPage } from "@/pages/admin/Lessons";
import { AdminMaterialsPage } from "@/pages/admin/StudyMaterials";
import { AdminAssignmentsPage } from "@/pages/admin/Assignments";
import { AdminQuizzesPage } from "@/pages/admin/Quizzes";
import { AdminQuestionBankPage } from "@/pages/admin/QuestionBank";
import { AdminAIGeneratorPage } from "@/pages/admin/AIQuestionGenerator";
import { AdminAttendancePage } from "@/pages/admin/Attendance";
import { AdminResultsPage } from "@/pages/admin/Results";
import { AdminCertificatesPage } from "@/pages/admin/Certificates";
import { AdminBlogPage } from "@/pages/admin/Blog";
import { AdminAnnouncementsPage } from "@/pages/admin/Announcements";
import { AdminNotificationsPage } from "@/pages/admin/Notifications";
import { AdminPaymentsPage } from "@/pages/admin/Payments";
import { AdminReportsPage } from "@/pages/admin/Reports";
import { AdminAnalyticsPage } from "@/pages/admin/Analytics";
import { AdminSettingsPage } from "@/pages/admin/Settings";

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
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Separate portal auth - public pages */}
        <Route path="/student/login" element={<StudentLoginPage />} />
        <Route path="/student/register" element={<StudentRegisterPage />} />
        <Route path="/student/forgot-password" element={<StudentForgotPasswordPage />} />
        <Route path="/teacher/login" element={<TeacherLoginPage />} />
        <Route path="/teacher/forgot-password" element={<TeacherForgotPasswordPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin/forgot-password" element={<AdminForgotPasswordPage />} />
      </Route>

      {/* Student portal - protected */}
      <Route element={<StudentRoute />}>
        <Route path="/student" element={<StudentLayout />}>
          <Route path="dashboard" element={<StudentDashboardPage />} />
          <Route path="courses" element={<StudentCoursesPage />} />
          <Route path="lessons" element={<StudentLessonsPage />} />
          <Route path="materials" element={<StudentMaterialsPage />} />
          <Route path="assignments" element={<StudentAssignmentsPage />} />
          <Route path="quizzes" element={<StudentQuizzesPage />} />
          <Route path="results" element={<StudentResultsPage />} />
          <Route path="attendance" element={<StudentAttendancePage />} />
          <Route path="certificates" element={<StudentCertificatesPage />} />
          <Route path="ai-tutor" element={<StudentAITutorPage />} />
          <Route path="notifications" element={<StudentNotificationsPage />} />
          <Route path="profile" element={<StudentProfilePage />} />
        </Route>
      </Route>

      {/* Teacher portal - protected */}
      <Route element={<TeacherRoute />}>
        <Route path="/teacher" element={<TeacherLayout />}>
          <Route path="dashboard" element={<TeacherDashboardPage />} />
          <Route path="students" element={<TeacherStudentsPage />} />
          <Route path="courses" element={<TeacherCoursesPage />} />
          <Route path="lessons" element={<TeacherLessonsPage />} />
          <Route path="assignments" element={<TeacherAssignmentsPage />} />
          <Route path="submissions" element={<TeacherSubmissionsPage />} />
          <Route path="quizzes" element={<TeacherQuizzesPage />} />
          <Route path="question-bank" element={<TeacherQuestionBankPage />} />
          <Route path="attendance" element={<TeacherAttendancePage />} />
          <Route path="performance" element={<TeacherPerformancePage />} />
          <Route path="announcements" element={<TeacherAnnouncementsPage />} />
          <Route path="profile" element={<TeacherProfilePage />} />
        </Route>
      </Route>

      {/* Admin portal - protected */}
      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="students" element={<AdminStudentsPage />} />
          <Route path="teachers" element={<AdminTeachersPage />} />
          <Route path="courses" element={<AdminCoursesPage />} />
          <Route path="lessons" element={<AdminLessonsPage />} />
          <Route path="materials" element={<AdminMaterialsPage />} />
          <Route path="assignments" element={<AdminAssignmentsPage />} />
          <Route path="quizzes" element={<AdminQuizzesPage />} />
          <Route path="question-bank" element={<AdminQuestionBankPage />} />
          <Route path="ai-generator" element={<AdminAIGeneratorPage />} />
          <Route path="attendance" element={<AdminAttendancePage />} />
          <Route path="results" element={<AdminResultsPage />} />
          <Route path="certificates" element={<AdminCertificatesPage />} />
          <Route path="blog" element={<AdminBlogPage />} />
          <Route path="announcements" element={<AdminAnnouncementsPage />} />
          <Route path="notifications" element={<AdminNotificationsPage />} />
          <Route path="payments" element={<AdminPaymentsPage />} />
          <Route path="reports" element={<AdminReportsPage />} />
          <Route path="analytics" element={<AdminAnalyticsPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
        </Route>
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
