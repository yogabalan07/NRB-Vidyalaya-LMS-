import { Router, type Router as ExpressRouter } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import {
  markLessonComplete,
  getLessonProgress,
  getCourseProgress,
  getStudentProgressOverview,
} from "../controllers/progress.controller.js";

const router: ExpressRouter = Router();

// All progress routes require authentication + STUDENT role
router.use(authMiddleware);
router.use(authorize("STUDENT"));

// ─── Lesson Progress ────────────────────────────────────────
router.post("/lesson/:lessonId/complete", markLessonComplete);
router.get("/lesson/:lessonId", getLessonProgress);

// ─── Course Progress ────────────────────────────────────────
router.get("/course/:courseId", getCourseProgress);

// ─── Student Overview ───────────────────────────────────────
router.get("/overview", getStudentProgressOverview);

export default router;
