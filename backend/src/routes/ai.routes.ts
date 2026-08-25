import { Router, type Router as ExpressRouter } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import { validate } from "../middleware/validation.middleware.js";
import { aiRateLimiter } from "../middleware/aiRateLimit.middleware.js";
import {
  chatSchema,
  correctWritingSchema,
  generateQuestionsSchema,
} from "../validators/ai.validators.js";
import {
  chat,
  correctWriting,
  generateQuestions,
} from "../controllers/ai.controller.js";

const router: ExpressRouter = Router();

router.post(
  "/chat",
  aiRateLimiter,
  authMiddleware,
  validate(chatSchema),
  chat
);

router.post(
  "/correct-writing",
  aiRateLimiter,
  authMiddleware,
  validate(correctWritingSchema),
  correctWriting
);

router.post(
  "/generate-questions",
  aiRateLimiter,
  authMiddleware,
  authorize("ADMIN", "TEACHER", "SUPER_ADMIN"),
  validate(generateQuestionsSchema),
  generateQuestions
);

export default router;
