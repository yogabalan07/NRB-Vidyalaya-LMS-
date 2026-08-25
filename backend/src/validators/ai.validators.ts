import { z } from "zod";

export const chatSchema = z.object({
  message: z.string().min(1, "Message is required").max(2000),
  level: z.enum(["beginner", "intermediate", "advanced"]).default("beginner"),
  conversationId: z.string().uuid().optional(),
});

export const correctWritingSchema = z.object({
  text: z.string().min(1, "Text is required").max(5000),
});

export const generateQuestionsSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  topic: z.string().min(1, "Topic is required"),
  classLevel: z.string().min(1, "Class level is required"),
  difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
  language: z.string().default("Hindi"),
  numberOfQuestions: z.number().int().min(1).max(50).default(5),
  marks: z.number().int().min(1).max(100).default(1),
  negativeMarks: z.number().min(0).max(10).default(0),
  questionType: z.enum(["MCQ", "true-false", "fill-blank"]).default("MCQ"),
});

export const verifyCertificateSchema = z.object({
  certificateNumber: z.string().min(1, "Certificate number is required"),
});
