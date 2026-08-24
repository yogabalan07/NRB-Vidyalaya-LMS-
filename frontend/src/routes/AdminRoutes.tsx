import { Routes, Route } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";
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

export function AdminRoutes() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
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
    </Routes>
  );
}
