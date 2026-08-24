import { Routes, Route } from "react-router-dom";
import { StudentLayout } from "@/components/layout/StudentLayout";
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

export function StudentRoutes() {
  return (
    <Routes>
      <Route element={<StudentLayout />}>
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
    </Routes>
  );
}
