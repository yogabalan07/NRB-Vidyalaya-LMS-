import { z } from "zod";

export const markLessonCompleteSchema = z.object({
  lessonId: z.string().uuid("Invalid lesson ID"),
});

export const getLessonProgressSchema = z.object({
  lessonId: z.string().uuid("Invalid lesson ID"),
});

export const getCourseProgressSchema = z.object({
  courseId: z.string().uuid("Invalid course ID"),
});
