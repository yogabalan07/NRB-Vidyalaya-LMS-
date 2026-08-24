import { Routes, Route } from "react-router-dom";
import { HomePage } from "@/pages/public/Home";
import { AboutPage } from "@/pages/public/About";
import { CoursesPage } from "@/pages/public/Courses";
import { CourseDetailsPage } from "@/pages/public/CourseDetails";
import { BlogPage } from "@/pages/public/Blog";
import { BlogDetailsPage } from "@/pages/public/BlogDetails";
import { ContactPage } from "@/pages/public/Contact";
import { AnnouncementsPage } from "@/pages/public/Announcements";
import { NotFoundPage } from "@/pages/public/NotFound";
import { LoginPage } from "@/pages/auth/Login";
import { RegisterPage } from "@/pages/auth/Register";
import { ForgotPasswordPage } from "@/pages/auth/ForgotPassword";
import { ResetPasswordPage } from "@/pages/auth/ResetPassword";

export function PublicRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/courses" element={<CoursesPage />} />
      <Route path="/courses/:slug" element={<CourseDetailsPage />} />
      <Route path="/blog" element={<BlogPage />} />
      <Route path="/blog/:slug" element={<BlogDetailsPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/announcements" element={<AnnouncementsPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
