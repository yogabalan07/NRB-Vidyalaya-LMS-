import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name is too long"),
    email: z.string().email("Invalid email address"),
    phone: z
      .string()
      .optional()
      .refine(
        (val) => !val || /^\+?[\d\s-]{7,15}$/.test(val),
        "Invalid phone number format"
      ),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
        "Password must include uppercase, lowercase, and a number"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const courseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]).optional(),
});

export const quizSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  timeLimitMinutes: z.number().positive().optional(),
  passPercentage: z.number().min(0).max(100).default(40),
  maxAttempts: z.number().positive().default(1),
});

// ─── Quiz JSON Import Schema ────────────────────────────────────
const quizImportQuestionSchema = z.object({
  question: z.string().min(1, "Question text cannot be empty"),
  options: z
    .object({
      A: z.string().min(1, "Option A cannot be empty"),
      B: z.string().min(1, "Option B cannot be empty"),
      C: z.string().min(1, "Option C cannot be empty"),
      D: z.string().min(1, "Option D cannot be empty"),
    })
    .strict("Options must contain exactly A, B, C, and D"),
  correctAnswer: z.enum(["A", "B", "C", "D"], {
    message: "correctAnswer must be A, B, C, or D",
  }),
});

export const quizImportSchema = z
  .object({
    title: z.string().min(1, "Quiz title is required"),
    subject: z.string().min(1, "Subject is required"),
    topic: z.string().min(1, "Topic is required"),
    classLevel: z.string().min(1, "Class level is required"),
    difficulty: z.string().min(1, "Difficulty is required"),
    language: z.string().min(1, "Language is required"),
    marksPerQuestion: z.number().positive("Marks per question must be positive"),
    negativeMarks: z.number().min(0, "Negative marks cannot be negative"),
    questionType: z.string().min(1, "Question type is required"),
    questions: z
      .array(quizImportQuestionSchema, {
        message: "Questions must be an array",
      })
      .min(1, "At least one question is required"),
  })
  .refine(
    (data) => {
      const texts = data.questions.map((q) => q.question.trim().toLowerCase());
      return new Set(texts).size === texts.length;
    },
    { message: "Duplicate questions found", path: ["questions"] }
  );

export type QuizImportInput = z.infer<typeof quizImportSchema>;
export type QuizImportQuestion = z.infer<typeof quizImportQuestionSchema>;

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CourseInput = z.infer<typeof courseSchema>;
export type QuizInput = z.infer<typeof quizSchema>;
