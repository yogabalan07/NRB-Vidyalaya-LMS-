import { Routes, Route } from "react-router-dom";
import { TeacherLayout } from "@/components/layout/TeacherLayout";
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

export function TeacherRoutes() {
  return (
    <Routes>
      <Route element={<TeacherLayout />}>
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
    </Routes>
  );
}
