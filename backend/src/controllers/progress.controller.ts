import type { Request, Response } from "express";
import { getSupabaseClient } from "../config/database.js";
import { sendSuccess, sendError } from "../utils/response.js";
import { logger } from "../utils/logger.js";

type ProgressRequest = Request & { user?: { id: string; email: string; role: string } };

export async function markLessonComplete(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { lessonId } = req.params;
    const userId = (req as ProgressRequest).user?.id;

    if (!userId) {
      sendError(res, "Unauthorized", 401);
      return;
    }

    const supabase = getSupabaseClient();

    // Verify the lesson exists and user is enrolled in the course
    const { data: lesson, error: lessonError } = await supabase
      .from("lessons")
      .select("id, course_id")
      .eq("id", lessonId)
      .single();

    if (lessonError || !lesson) {
      sendError(res, "Lesson not found", 404);
      return;
    }

    // Check enrollment
    const { data: enrollment, error: enrollmentError } = await supabase
      .from("enrollments")
      .select("id")
      .eq("user_id", userId)
      .eq("course_id", lesson.course_id)
      .single();

    if (enrollmentError || !enrollment) {
      sendError(res, "Not enrolled in this course", 403);
      return;
    }

    // Upsert lesson progress
    const { error: upsertError } = await supabase
      .from("lesson_progress")
      .upsert(
        {
          user_id: userId,
          lesson_id: lessonId,
          course_id: lesson.course_id,
          completed: true,
          completed_at: new Date().toISOString(),
        },
        { onConflict: "user_id,lesson_id" }
      );

    if (upsertError) {
      logger.error("Failed to upsert lesson progress:", upsertError);
      sendError(res, "Failed to update progress", 500);
      return;
    }

    // Get updated course progress
    const { data: courseProgress, error: progressError } = await supabase
      .from("course_progress")
      .select("total_lessons, completed_lessons, progress_percent")
      .eq("user_id", userId)
      .eq("course_id", lesson.course_id)
      .single();

    if (progressError) {
      logger.error("Failed to fetch course progress:", progressError);
    }

    sendSuccess(res, {
      lessonId,
      completed: true,
      courseProgress: courseProgress || {
        total_lessons: 0,
        completed_lessons: 0,
        progress_percent: 0,
      },
    });
  } catch (err) {
    logger.error("[progress] markLessonComplete error:", err instanceof Error ? err.message : err);
    sendError(res, "Failed to mark lesson complete", 500);
  }
}

export async function getLessonProgress(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { lessonId } = req.params;
    const userId = (req as ProgressRequest).user?.id;

    if (!userId) {
      sendError(res, "Unauthorized", 401);
      return;
    }

    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from("lesson_progress")
      .select("id, lesson_id, completed, completed_at")
      .eq("user_id", userId)
      .eq("lesson_id", lessonId)
      .single();

    if (error && error.code !== "PGRST116") {
      logger.error("Failed to fetch lesson progress:", error);
      sendError(res, "Failed to fetch progress", 500);
      return;
    }

    sendSuccess(res, {
      lessonId,
      completed: data?.completed || false,
      completedAt: data?.completed_at || null,
    });
  } catch (err) {
    logger.error("[progress] getLessonProgress error:", err instanceof Error ? err.message : err);
    sendError(res, "Failed to fetch progress", 500);
  }
}

export async function getCourseProgress(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { courseId } = req.params;
    const userId = (req as ProgressRequest).user?.id;

    if (!userId) {
      sendError(res, "Unauthorized", 401);
      return;
    }

    const supabase = getSupabaseClient();

    const { data: courseProgress, error: progressError } = await supabase
      .from("course_progress")
      .select("total_lessons, completed_lessons, progress_percent")
      .eq("user_id", userId)
      .eq("course_id", courseId)
      .single();

    if (progressError && progressError.code !== "PGRST116") {
      logger.error("Failed to fetch course progress:", progressError);
      sendError(res, "Failed to fetch progress", 500);
      return;
    }

    // Get all lessons for this course with their completion status
    const { data: lessons, error: lessonsError } = await supabase
      .from("lessons")
      .select("id, title, sort_order")
      .eq("course_id", courseId)
      .eq("is_published", true)
      .order("sort_order", { ascending: true });

    if (lessonsError) {
      logger.error("Failed to fetch lessons:", lessonsError);
      sendError(res, "Failed to fetch lessons", 500);
      return;
    }

    // Get completion status for each lesson
    const { data: completedLessons, error: completedError } = await supabase
      .from("lesson_progress")
      .select("lesson_id, completed_at")
      .eq("user_id", userId)
      .eq("course_id", courseId)
      .eq("completed", true);

    if (completedError) {
      logger.error("Failed to fetch completed lessons:", completedError);
    }

    const completedMap = new Map(
      (completedLessons || []).map((cl) => [cl.lesson_id, cl.completed_at])
    );

    const lessonsWithProgress = (lessons || []).map((lesson) => ({
      ...lesson,
      completed: completedMap.has(lesson.id),
      completedAt: completedMap.get(lesson.id) || null,
    }));

    sendSuccess(res, {
      courseId,
      totalLessons: courseProgress?.total_lessons || 0,
      completedLessons: courseProgress?.completed_lessons || 0,
      progressPercent: courseProgress?.progress_percent || 0,
      lessons: lessonsWithProgress,
    });
  } catch (err) {
    logger.error("[progress] getCourseProgress error:", err instanceof Error ? err.message : err);
    sendError(res, "Failed to fetch progress", 500);
  }
}

export async function getStudentProgressOverview(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const userId = (req as ProgressRequest).user?.id;

    if (!userId) {
      sendError(res, "Unauthorized", 401);
      return;
    }

    const supabase = getSupabaseClient();

    // Get all enrolled courses with progress
    const { data: enrollments, error: enrollmentError } = await supabase
      .from("enrollments")
      .select(`
        id,
        course_id,
        enrolled_at,
        progress_percent,
        courses (
          id,
          title,
          slug,
          thumbnail_url
        )
      `)
      .eq("user_id", userId)
      .order("enrolled_at", { ascending: false });

    if (enrollmentError) {
      logger.error("Failed to fetch enrollments:", enrollmentError);
      sendError(res, "Failed to fetch progress", 500);
      return;
    }

    // Get detailed progress for each course
    const { data: courseProgressList, error: progressError } = await supabase
      .from("course_progress")
      .select("course_id, total_lessons, completed_lessons, progress_percent")
      .eq("user_id", userId);

    if (progressError) {
      logger.error("Failed to fetch course progress:", progressError);
    }

    const progressMap = new Map(
      (courseProgressList || []).map((cp) => [cp.course_id, cp])
    );

    const coursesWithProgress = (enrollments || []).map((enrollment) => {
      const courseData = enrollment.courses as unknown as {
        id: string;
        title: string;
        slug: string;
        thumbnail_url: string;
      };
      const progress = progressMap.get(enrollment.course_id);

      return {
        courseId: enrollment.course_id,
        title: courseData?.title || "Unknown Course",
        slug: courseData?.slug || "",
        thumbnailUrl: courseData?.thumbnail_url || "",
        enrolledAt: enrollment.enrolled_at,
        totalLessons: progress?.total_lessons || 0,
        completedLessons: progress?.completed_lessons || 0,
        progressPercent: progress?.progress_percent || enrollment.progress_percent || 0,
      };
    });

    sendSuccess(res, coursesWithProgress);
  } catch (err) {
    logger.error("[progress] getStudentProgressOverview error:", err instanceof Error ? err.message : err);
    sendError(res, "Failed to fetch progress overview", 500);
  }
}
