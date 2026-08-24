import { Routes, Route } from "react-router-dom";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { PublicRoutes } from "./PublicRoutes";
import { StudentRoutes } from "./StudentRoutes";
import { TeacherRoutes } from "./TeacherRoutes";
import { AdminRoutes } from "./AdminRoutes";

export function AppRoutes() {
  return (
    <Routes>
      {/* Public website with shared layout */}
      <Route element={<PublicLayout />}>
        <Route path="/*" element={<PublicRoutes />} />
      </Route>

      {/* Student portal */}
      <Route path="/student/*" element={<StudentRoutes />} />

      {/* Teacher portal */}
      <Route path="/teacher/*" element={<TeacherRoutes />} />

      {/* Admin portal */}
      <Route path="/admin/*" element={<AdminRoutes />} />
    </Routes>
  );
}
