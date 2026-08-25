import { supabase } from "./supabase";
import type { Course, Enrollment } from "@/types/course";
import type { Lesson } from "@/types/lesson";
import type { Assignment, Submission } from "@/types/assignment";
import type { Quiz, QuizAttempt } from "@/types/quiz";
import type { Question, QuestionBankItem } from "@/types/question";
import type { AttendanceRecord } from "@/types/attendance";
import type { Result } from "@/types/result";
import type { Certificate } from "@/types/certificate";
import type { Payment } from "@/types/payment";
import type { Notification } from "@/types/notification";
import type { BlogPost } from "@/types/blog";
import type { AIConversation, AIMessage } from "@/types/ai";

function mapRow<T>(row: Record<string, unknown>): T {
  return row as unknown as T;
}

// ─── Course Service ────────────────────────────────────────────
export const courseService = {
  async getCourses(): Promise<Course[]> {
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data || []).map(mapRow<Course>);
  },

  async getPublishedCourses(): Promise<Course[]> {
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .eq("is_published", true)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data || []).map(mapRow<Course>);
  },

  async getCourse(slug: string): Promise<Course | null> {
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .eq("slug", slug)
      .single();
    if (error) return null;
    return mapRow<Course>(data);
  },

  async getCourseById(id: string): Promise<Course | null> {
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .eq("id", id)
      .single();
    if (error) return null;
    return mapRow<Course>(data);
  },

  async createCourse(course: {
    title: string;
    slug: string;
    description?: string;
    short_description?: string;
    difficulty?: string;
    language?: string;
    teacher_id?: string;
  }): Promise<Course> {
    const { data, error } = await supabase
      .from("courses")
      .insert(course)
      .select()
      .single();
    if (error) throw error;
    return mapRow<Course>(data);
  },

  async updateCourse(
    id: string,
    updates: Partial<{
      title: string;
      description: string;
      short_description: string;
      difficulty: string;
      is_published: boolean;
      thumbnail_url: string;
    }>
  ): Promise<Course> {
    const { data, error } = await supabase
      .from("courses")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return mapRow<Course>(data);
  },

  async deleteCourse(id: string): Promise<void> {
    const { error } = await supabase.from("courses").delete().eq("id", id);
    if (error) throw error;
  },

  async getCoursesForTeacher(teacherId: string): Promise<Course[]> {
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .eq("teacher_id", teacherId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data || []).map(mapRow<Course>);
  },
};

// ─── Enrollment Service ────────────────────────────────────────
export const enrollmentService = {
  async getEnrollmentsForUser(userId: string): Promise<Enrollment[]> {
    const { data, error } = await supabase
      .from("enrollments")
      .select("*")
      .eq("user_id", userId)
      .order("enrolled_at", { ascending: false });
    if (error) throw error;
    return (data || []).map(mapRow<Enrollment>);
  },

  async getEnrollmentsForCourse(courseId: string): Promise<Enrollment[]> {
    const { data, error } = await supabase
      .from("enrollments")
      .select("*")
      .eq("course_id", courseId)
      .order("enrolled_at", { ascending: false });
    if (error) throw error;
    return (data || []).map(mapRow<Enrollment>);
  },

  async enroll(userId: string, courseId: string): Promise<Enrollment> {
    const { data, error } = await supabase
      .from("enrollments")
      .insert({ user_id: userId, course_id: courseId })
      .select()
      .single();
    if (error) throw error;
    return mapRow<Enrollment>(data);
  },

  async updateProgress(
    enrollmentId: string,
    progressPercent: number
  ): Promise<void> {
    const updates: Record<string, unknown> = {
      progress_percent: progressPercent,
    };
    if (progressPercent >= 100) {
      updates.completed_at = new Date().toISOString();
    }
    const { error } = await supabase
      .from("enrollments")
      .update(updates)
      .eq("id", enrollmentId);
    if (error) throw error;
  },

  async isEnrolled(userId: string, courseId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from("enrollments")
      .select("id")
      .eq("user_id", userId)
      .eq("course_id", courseId)
      .maybeSingle();
    if (error) return false;
    return !!data;
  },
};

// ─── Lesson Service ────────────────────────────────────────────
export const lessonService = {
  async getLessons(courseId: string): Promise<Lesson[]> {
    const { data, error } = await supabase
      .from("lessons")
      .select("*")
      .eq("course_id", courseId)
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return (data || []).map(mapRow<Lesson>);
  },

  async getLesson(id: string): Promise<Lesson | null> {
    const { data, error } = await supabase
      .from("lessons")
      .select("*")
      .eq("id", id)
      .single();
    if (error) return null;
    return mapRow<Lesson>(data);
  },

  async createLesson(lesson: {
    course_id: string;
    title: string;
    content?: string;
    video_url?: string;
    duration_minutes?: number;
    sort_order?: number;
  }): Promise<Lesson> {
    const { data, error } = await supabase
      .from("lessons")
      .insert(lesson)
      .select()
      .single();
    if (error) throw error;
    return mapRow<Lesson>(data);
  },

  async updateLesson(
    id: string,
    updates: Partial<{
      title: string;
      content: string;
      video_url: string;
      duration_minutes: number;
      sort_order: number;
      is_published: boolean;
    }>
  ): Promise<Lesson> {
    const { data, error } = await supabase
      .from("lessons")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return mapRow<Lesson>(data);
  },

  async deleteLesson(id: string): Promise<void> {
    const { error } = await supabase.from("lessons").delete().eq("id", id);
    if (error) throw error;
  },
};

// ─── Assignment Service ────────────────────────────────────────
export const assignmentService = {
  async getAssignments(courseId: string): Promise<Assignment[]> {
    const { data, error } = await supabase
      .from("assignments")
      .select("*")
      .eq("course_id", courseId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data || []).map(mapRow<Assignment>);
  },

  async getAssignment(id: string): Promise<Assignment | null> {
    const { data, error } = await supabase
      .from("assignments")
      .select("*")
      .eq("id", id)
      .single();
    if (error) return null;
    return mapRow<Assignment>(data);
  },

  async createAssignment(assignment: {
    course_id: string;
    title: string;
    description?: string;
    deadline?: string;
    max_marks?: number;
  }): Promise<Assignment> {
    const { data, error } = await supabase
      .from("assignments")
      .insert(assignment)
      .select()
      .single();
    if (error) throw error;
    return mapRow<Assignment>(data);
  },

  async updateAssignment(
    id: string,
    updates: Partial<{
      title: string;
      description: string;
      deadline: string;
      max_marks: number;
    }>
  ): Promise<Assignment> {
    const { data, error } = await supabase
      .from("assignments")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return mapRow<Assignment>(data);
  },

  async deleteAssignment(id: string): Promise<void> {
    const { error } = await supabase.from("assignments").delete().eq("id", id);
    if (error) throw error;
  },
};

// ─── Submission Service ────────────────────────────────────────
export const submissionService = {
  async getSubmissionsForAssignment(assignmentId: string): Promise<Submission[]> {
    const { data, error } = await supabase
      .from("submissions")
      .select("*")
      .eq("assignment_id", assignmentId)
      .order("submitted_at", { ascending: false });
    if (error) throw error;
    return (data || []).map(mapRow<Submission>);
  },

  async getSubmissionsForUser(userId: string): Promise<Submission[]> {
    const { data, error } = await supabase
      .from("submissions")
      .select("*")
      .eq("user_id", userId)
      .order("submitted_at", { ascending: false });
    if (error) throw error;
    return (data || []).map(mapRow<Submission>);
  },

  async getSubmissionForUserAssignment(
    userId: string,
    assignmentId: string
  ): Promise<Submission | null> {
    const { data, error } = await supabase
      .from("submissions")
      .select("*")
      .eq("user_id", userId)
      .eq("assignment_id", assignmentId)
      .order("submitted_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) return null;
    return data ? mapRow<Submission>(data) : null;
  },

  async submit(submission: {
    assignment_id: string;
    user_id: string;
    file_url?: string;
    notes?: string;
  }): Promise<Submission> {
    const { data, error } = await supabase
      .from("submissions")
      .insert(submission)
      .select()
      .single();
    if (error) throw error;
    return mapRow<Submission>(data);
  },

  async grade(
    id: string,
    marksObtained: number,
    feedback?: string
  ): Promise<Submission> {
    const { data, error } = await supabase
      .from("submissions")
      .update({
        status: "GRADED",
        marks_obtained: marksObtained,
        feedback: feedback || null,
        graded_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return mapRow<Submission>(data);
  },
};

// ─── Quiz Service ──────────────────────────────────────────────
export const quizService = {
  async getQuizzes(courseId: string): Promise<Quiz[]> {
    const { data, error } = await supabase
      .from("quizzes")
      .select("*")
      .eq("course_id", courseId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data || []).map(mapRow<Quiz>);
  },

  async getPublishedQuizzes(courseId: string): Promise<Quiz[]> {
    const { data, error } = await supabase
      .from("quizzes")
      .select("*")
      .eq("course_id", courseId)
      .eq("is_published", true)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data || []).map(mapRow<Quiz>);
  },

  async getQuiz(id: string): Promise<Quiz | null> {
    const { data, error } = await supabase
      .from("quizzes")
      .select("*")
      .eq("id", id)
      .single();
    if (error) return null;
    return mapRow<Quiz>(data);
  },

  async createQuiz(quiz: {
    course_id: string;
    title: string;
    description?: string;
    time_limit_minutes?: number;
    total_marks?: number;
    pass_percentage?: number;
    max_attempts?: number;
  }): Promise<Quiz> {
    const { data, error } = await supabase
      .from("quizzes")
      .insert(quiz)
      .select()
      .single();
    if (error) throw error;
    return mapRow<Quiz>(data);
  },

  async updateQuiz(
    id: string,
    updates: Partial<{
      title: string;
      description: string;
      time_limit_minutes: number;
      total_marks: number;
      pass_percentage: number;
      max_attempts: number;
      is_published: boolean;
    }>
  ): Promise<Quiz> {
    const { data, error } = await supabase
      .from("quizzes")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return mapRow<Quiz>(data);
  },

  async deleteQuiz(id: string): Promise<void> {
    const { error } = await supabase.from("quizzes").delete().eq("id", id);
    if (error) throw error;
  },
};

// ─── Question Service ──────────────────────────────────────────
export const questionService = {
  async getQuestions(quizId: string): Promise<Question[]> {
    const { data, error } = await supabase
      .from("questions")
      .select("*")
      .eq("quiz_id", quizId)
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return (data || []).map(mapRow<Question>);
  },

  async getQuestion(id: string): Promise<Question | null> {
    const { data, error } = await supabase
      .from("questions")
      .select("*")
      .eq("id", id)
      .single();
    if (error) return null;
    return mapRow<Question>(data);
  },

  async createQuestion(question: {
    quiz_id: string;
    question: string;
    options: Array<{ id: string; text: string }>;
    correct_option: string;
    explanation?: string;
    marks?: number;
    difficulty?: string;
    sort_order?: number;
  }): Promise<Question> {
    const { data, error } = await supabase
      .from("questions")
      .insert(question)
      .select()
      .single();
    if (error) throw error;
    return mapRow<Question>(data);
  },

  async createQuestions(
    questions: Array<{
      quiz_id: string;
      question: string;
      options: Array<{ id: string; text: string }>;
      correct_option: string;
      explanation?: string;
      marks?: number;
      difficulty?: string;
      sort_order?: number;
    }>
  ): Promise<Question[]> {
    const { data, error } = await supabase
      .from("questions")
      .insert(questions)
      .select();
    if (error) throw error;
    return (data || []).map(mapRow<Question>);
  },

  async updateQuestion(
    id: string,
    updates: Partial<{
      question: string;
      options: Array<{ id: string; text: string }>;
      correct_option: string;
      explanation: string;
      marks: number;
      difficulty: string;
    }>
  ): Promise<Question> {
    const { data, error } = await supabase
      .from("questions")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return mapRow<Question>(data);
  },

  async deleteQuestion(id: string): Promise<void> {
    const { error } = await supabase.from("questions").delete().eq("id", id);
    if (error) throw error;
  },
};

// ─── Question Bank Service ─────────────────────────────────────
export const questionBankService = {
  async getQuestions(filters?: {
    subject?: string;
    topic?: string;
    difficulty?: string;
    language?: string;
  }): Promise<QuestionBankItem[]> {
    let query = supabase.from("question_bank").select("*");
    if (filters?.subject) query = query.eq("subject", filters.subject);
    if (filters?.topic) query = query.eq("topic", filters.topic);
    if (filters?.difficulty) query = query.eq("difficulty", filters.difficulty);
    if (filters?.language) query = query.eq("language", filters.language);
    query = query.order("created_at", { ascending: false });
    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(mapRow<QuestionBankItem>);
  },

  async createQuestion(question: {
    question: string;
    options: Array<{ id: string; text: string }>;
    correct_option: string;
    explanation?: string;
    subject?: string;
    topic?: string;
    difficulty?: string;
    language?: string;
    marks?: number;
    tags?: string[];
  }): Promise<QuestionBankItem> {
    const { data, error } = await supabase
      .from("question_bank")
      .insert(question)
      .select()
      .single();
    if (error) throw error;
    return mapRow<QuestionBankItem>(data);
  },

  async createQuestions(
    questions: Array<{
      question: string;
      options: Array<{ id: string; text: string }>;
      correct_option: string;
      explanation?: string;
      subject?: string;
      topic?: string;
      difficulty?: string;
      language?: string;
      marks?: number;
      tags?: string[];
    }>
  ): Promise<QuestionBankItem[]> {
    const { data, error } = await supabase
      .from("question_bank")
      .insert(questions)
      .select();
    if (error) throw error;
    return (data || []).map(mapRow<QuestionBankItem>);
  },

  async updateQuestion(
    id: string,
    updates: Partial<{
      question: string;
      options: Array<{ id: string; text: string }>;
      correct_option: string;
      explanation: string;
      subject: string;
      topic: string;
      difficulty: string;
      marks: number;
      tags: string[];
    }>
  ): Promise<QuestionBankItem> {
    const { data, error } = await supabase
      .from("question_bank")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return mapRow<QuestionBankItem>(data);
  },

  async deleteQuestion(id: string): Promise<void> {
    const { error } = await supabase.from("question_bank").delete().eq("id", id);
    if (error) throw error;
  },
};

// ─── Quiz Attempt Service ──────────────────────────────────────
export const quizAttemptService = {
  async getAttemptsForQuiz(quizId: string): Promise<QuizAttempt[]> {
    const { data, error } = await supabase
      .from("quiz_attempts")
      .select("*")
      .eq("quiz_id", quizId)
      .order("started_at", { ascending: false });
    if (error) throw error;
    return (data || []).map(mapRow<QuizAttempt>);
  },

  async getAttemptsForUser(userId: string): Promise<QuizAttempt[]> {
    const { data, error } = await supabase
      .from("quiz_attempts")
      .select("*")
      .eq("user_id", userId)
      .order("started_at", { ascending: false });
    if (error) throw error;
    return (data || []).map(mapRow<QuizAttempt>);
  },

  async getAttempt(id: string): Promise<QuizAttempt | null> {
    const { data, error } = await supabase
      .from("quiz_attempts")
      .select("*")
      .eq("id", id)
      .single();
    if (error) return null;
    return mapRow<QuizAttempt>(data);
  },

  async startAttempt(quizId: string, userId: string): Promise<QuizAttempt> {
    const { data, error } = await supabase
      .from("quiz_attempts")
      .insert({
        quiz_id: quizId,
        user_id: userId,
        answers: [],
        score: 0,
        total_marks: 0,
        percentage: 0,
      })
      .select()
      .single();
    if (error) throw error;
    return mapRow<QuizAttempt>(data);
  },

  async submitAttempt(
    id: string,
    answers: Array<{ questionId: string; selectedOption: string }>,
    score: number,
    totalMarks: number,
    percentage: number
  ): Promise<QuizAttempt> {
    const { data, error } = await supabase
      .from("quiz_attempts")
      .update({
        answers,
        score,
        total_marks: totalMarks,
        percentage,
        completed_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return mapRow<QuizAttempt>(data);
  },

  async getAttemptCount(quizId: string, userId: string): Promise<number> {
    const { count, error } = await supabase
      .from("quiz_attempts")
      .select("id", { count: "exact", head: true })
      .eq("quiz_id", quizId)
      .eq("user_id", userId);
    if (error) return 0;
    return count || 0;
  },
};

// ─── Attendance Service ────────────────────────────────────────
export const attendanceService = {
  async getAttendance(
    userId: string,
    courseId?: string
  ): Promise<AttendanceRecord[]> {
    let query = supabase
      .from("attendance")
      .select("*")
      .eq("user_id", userId);
    if (courseId) query = query.eq("course_id", courseId);
    query = query.order("date", { ascending: false });
    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(mapRow<AttendanceRecord>);
  },

  async getAttendanceForCourse(courseId: string): Promise<AttendanceRecord[]> {
    const { data, error } = await supabase
      .from("attendance")
      .select("*")
      .eq("course_id", courseId)
      .order("date", { ascending: false });
    if (error) throw error;
    return (data || []).map(mapRow<AttendanceRecord>);
  },

  async markAttendance(records: Array<{
    user_id: string;
    course_id: string;
    date: string;
    status: "PRESENT" | "ABSENT" | "LEAVE";
    marked_by?: string;
  }>): Promise<AttendanceRecord[]> {
    const { data, error } = await supabase
      .from("attendance")
      .upsert(records, {
        onConflict: "user_id,course_id,date",
      })
      .select();
    if (error) throw error;
    return (data || []).map(mapRow<AttendanceRecord>);
  },

  async getAttendanceSummary(
    userId: string,
    courseId: string
  ): Promise<{ present: number; absent: number; leave: number; total: number; percentage: number }> {
    const { data, error } = await supabase
      .from("attendance")
      .select("status")
      .eq("user_id", userId)
      .eq("course_id", courseId);
    if (error) throw error;
    const records = (data || []) as Array<{ status: string }>;
    const present = records.filter((r) => r.status === "PRESENT").length;
    const absent = records.filter((r) => r.status === "ABSENT").length;
    const leave = records.filter((r) => r.status === "LEAVE").length;
    const total = records.length;
    return {
      present,
      absent,
      leave,
      total,
      percentage: total > 0 ? Math.round((present / total) * 100) : 0,
    };
  },
};

// ─── Result Service ────────────────────────────────────────────
export const resultService = {
  async getResults(userId: string): Promise<Result[]> {
    const { data, error } = await supabase
      .from("results")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data || []).map(mapRow<Result>);
  },

  async getResultsForCourse(courseId: string): Promise<Result[]> {
    const { data, error } = await supabase
      .from("results")
      .select("*")
      .eq("course_id", courseId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data || []).map(mapRow<Result>);
  },

  async createResult(result: {
    user_id: string;
    course_id: string;
    total_marks: number;
    obtained_marks: number;
    percentage: number;
    grade?: string;
  }): Promise<Result> {
    const { data, error } = await supabase
      .from("results")
      .insert(result)
      .select()
      .single();
    if (error) throw error;
    return mapRow<Result>(data);
  },
};

// ─── Certificate Service ───────────────────────────────────────
export const certificateService = {
  async getCertificates(userId: string): Promise<Certificate[]> {
    const { data, error } = await supabase
      .from("certificates")
      .select("*")
      .eq("user_id", userId)
      .order("issued_at", { ascending: false });
    if (error) throw error;
    return (data || []).map(mapRow<Certificate>);
  },

  async getCertificateByNumber(
    certificateNumber: string
  ): Promise<Certificate | null> {
    const { data, error } = await supabase
      .from("certificates")
      .select("*")
      .eq("certificate_number", certificateNumber)
      .single();
    if (error) return null;
    return mapRow<Certificate>(data);
  },

  async issueCertificate(certificate: {
    user_id: string;
    course_id: string;
    certificate_number: string;
    verification_url?: string;
  }): Promise<Certificate> {
    const { data, error } = await supabase
      .from("certificates")
      .insert(certificate)
      .select()
      .single();
    if (error) throw error;
    return mapRow<Certificate>(data);
  },
};

// ─── Payment Service ───────────────────────────────────────────
export const paymentService = {
  async getPayments(userId: string): Promise<Payment[]> {
    const { data, error } = await supabase
      .from("payments")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data || []).map(mapRow<Payment>);
  },

  async getPaymentsForCourse(courseId: string): Promise<Payment[]> {
    const { data, error } = await supabase
      .from("payments")
      .select("*")
      .eq("course_id", courseId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data || []).map(mapRow<Payment>);
  },

  async createPayment(payment: {
    user_id: string;
    course_id: string;
    amount: number;
    currency?: string;
  }): Promise<Payment> {
    const { data, error } = await supabase
      .from("payments")
      .insert(payment)
      .select()
      .single();
    if (error) throw error;
    return mapRow<Payment>(data);
  },

  async updatePaymentStatus(
    id: string,
    status: "PAID" | "FAILED" | "REFUNDED",
    receiptUrl?: string
  ): Promise<Payment> {
    const updates: Record<string, unknown> = { status };
    if (status === "PAID") updates.paid_at = new Date().toISOString();
    if (receiptUrl) updates.receipt_url = receiptUrl;
    const { data, error } = await supabase
      .from("payments")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return mapRow<Payment>(data);
  },
};

// ─── Notification Service ──────────────────────────────────────
export const notificationService = {
  async getNotifications(userId: string): Promise<Notification[]> {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data || []).map(mapRow<Notification>);
  },

  async getUnreadCount(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("is_read", false);
    if (error) return 0;
    return count || 0;
  },

  async markAsRead(id: string): Promise<void> {
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id);
    if (error) throw error;
  },

  async markAllAsRead(userId: string): Promise<void> {
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", userId)
      .eq("is_read", false);
    if (error) throw error;
  },

  async createNotification(notification: {
    user_id: string;
    title: string;
    message: string;
    type: string;
  }): Promise<Notification> {
    const { data, error } = await supabase
      .from("notifications")
      .insert(notification)
      .select()
      .single();
    if (error) throw error;
    return mapRow<Notification>(data);
  },
};

// ─── Blog Service ──────────────────────────────────────────────
export const blogService = {
  async getPosts(): Promise<BlogPost[]> {
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data || []).map(mapRow<BlogPost>);
  },

  async getPublishedPosts(): Promise<BlogPost[]> {
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("status", "PUBLISHED")
      .order("published_at", { ascending: false });
    if (error) throw error;
    return (data || []).map(mapRow<BlogPost>);
  },

  async getPost(slug: string): Promise<BlogPost | null> {
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("slug", slug)
      .single();
    if (error) return null;
    return mapRow<BlogPost>(data);
  },

  async createPost(post: {
    title: string;
    slug: string;
    content: string;
    excerpt?: string;
    cover_image_url?: string;
    author_id?: string;
    category?: string;
    tags?: string[];
    seo_title?: string;
    seo_description?: string;
    status?: string;
  }): Promise<BlogPost> {
    const { data, error } = await supabase
      .from("blog_posts")
      .insert(post)
      .select()
      .single();
    if (error) throw error;
    return mapRow<BlogPost>(data);
  },

  async updatePost(
    id: string,
    updates: Partial<{
      title: string;
      content: string;
      excerpt: string;
      cover_image_url: string;
      category: string;
      tags: string[];
      seo_title: string;
      seo_description: string;
      status: string;
      published_at: string;
    }>
  ): Promise<BlogPost> {
    const { data, error } = await supabase
      .from("blog_posts")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return mapRow<BlogPost>(data);
  },

  async deletePost(id: string): Promise<void> {
    const { error } = await supabase.from("blog_posts").delete().eq("id", id);
    if (error) throw error;
  },
};

// ─── AI Service ────────────────────────────────────────────────
export const aiService = {
  async chat(
    message: string,
    level: string,
    conversationId?: string
  ): Promise<{ reply: string; conversationId: string }> {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;
    const response = await fetch("/api/ai/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ message, level, conversationId }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || "AI service unavailable");
    }
    return response.json();
  },

  async correctWriting(text: string): Promise<{
    original: string;
    corrected: string;
    errors: Array<{
      original: string;
      corrected: string;
      explanation: string;
      category: string;
    }>;
    improvedVersion: string;
  }> {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;
    const response = await fetch("/api/ai/correct-writing", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ text }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || "AI service unavailable");
    }
    return response.json();
  },

  async generateQuestions(params: {
    subject: string;
    topic: string;
    classLevel: string;
    difficulty: string;
    language: string;
    numberOfQuestions: number;
    marks: number;
    negativeMarks: number;
    questionType: string;
  }): Promise<{ questions: Array<{
    question: string;
    options: Array<{ id: string; text: string }>;
    correctOption: string;
    explanation: string;
    marks: number;
  }> }> {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;
    const response = await fetch("/api/ai/generate-questions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(params),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || "AI service unavailable");
    }
    return response.json();
  },

  async getConversations(userId: string): Promise<AIConversation[]> {
    const { data, error } = await supabase
      .from("ai_conversations")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data || []).map(mapRow<AIConversation>);
  },

  async getMessages(conversationId: string): Promise<AIMessage[]> {
    const { data, error } = await supabase
      .from("ai_messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return (data || []).map(mapRow<AIMessage>);
  },

  async createConversation(conversation: {
    user_id: string;
    topic?: string;
    level?: string;
  }): Promise<AIConversation> {
    const { data, error } = await supabase
      .from("ai_conversations")
      .insert(conversation)
      .select()
      .single();
    if (error) throw error;
    return mapRow<AIConversation>(data);
  },

  async addMessage(message: {
    conversation_id: string;
    role: "user" | "assistant";
    content: string;
  }): Promise<AIMessage> {
    const { data, error } = await supabase
      .from("ai_messages")
      .insert(message)
      .select()
      .single();
    if (error) throw error;
    return mapRow<AIMessage>(data);
  },
};

// ─── Storage Service ───────────────────────────────────────────
export const storageService = {
  async upload(
    bucket: string,
    path: string,
    file: File
  ): Promise<{ url: string; path: string }> {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        contentType: file.type,
        upsert: false,
      });
    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return { url: urlData.publicUrl, path: data.path };
  },

  async getSignedUrl(
    bucket: string,
    path: string
  ): Promise<string> {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, 3600);
    if (error) throw error;
    return data.signedUrl;
  },

  async deleteFile(bucket: string, path: string): Promise<void> {
    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (error) throw error;
  },

  async listFiles(
    bucket: string,
    folder?: string
  ): Promise<Array<{ name: string; id: string; created_at: string }>> {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(folder || "");
    if (error) throw error;
    return (data || []) as Array<{ name: string; id: string; created_at: string }>;
  },
};

// ─── Profile Service ───────────────────────────────────────────
export const profileService = {
  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    if (error) return null;
    return data;
  },

  async getAllProfiles(): Promise<Array<Record<string, unknown>>> {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data || []) as Array<Record<string, unknown>>;
  },

  async getProfilesByRole(role: string): Promise<Array<Record<string, unknown>>> {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", role)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data || []) as Array<Record<string, unknown>>;
  },

  async updateProfile(
    userId: string,
    updates: Partial<{
      full_name: string;
      phone: string;
      avatar_url: string;
      status: string;
    }>
  ) {
    const { data, error } = await supabase
      .from("profiles")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", userId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async countByRole(): Promise<Record<string, number>> {
    const counts: Record<string, number> = {};
    for (const role of ["STUDENT", "TEACHER", "ADMIN", "SUPER_ADMIN"]) {
      const { count } = await supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("role", role);
      counts[role] = count || 0;
    }
    return counts;
  },
};

// ─── Stats Service ─────────────────────────────────────────────
export const statsService = {
  async getDashboardStats(): Promise<{
    totalStudents: number;
    activeStudents: number;
    totalTeachers: number;
    totalCourses: number;
    publishedCourses: number;
    totalLessons: number;
    totalQuizzes: number;
    totalEnrollments: number;
  }> {
    const roleCounts = await profileService.countByRole();

    const { count: totalCourses } = await supabase
      .from("courses")
      .select("id", { count: "exact", head: true });

    const { count: publishedCourses } = await supabase
      .from("courses")
      .select("id", { count: "exact", head: true })
      .eq("is_published", true);

    const { count: totalLessons } = await supabase
      .from("lessons")
      .select("id", { count: "exact", head: true });

    const { count: totalQuizzes } = await supabase
      .from("quizzes")
      .select("id", { count: "exact", head: true });

    const { count: totalEnrollments } = await supabase
      .from("enrollments")
      .select("id", { count: "exact", head: true });

    const { count: activeStudents } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "STUDENT")
      .eq("status", "active");

    return {
      totalStudents: roleCounts.STUDENT || 0,
      activeStudents: activeStudents || 0,
      totalTeachers: roleCounts.TEACHER || 0,
      totalCourses: totalCourses || 0,
      publishedCourses: publishedCourses || 0,
      totalLessons: totalLessons || 0,
      totalQuizzes: totalQuizzes || 0,
      totalEnrollments: totalEnrollments || 0,
    };
  },

  async getStudentStats(userId: string): Promise<{
    enrolledCourses: number;
    completedCourses: number;
    averageProgress: number;
    pendingAssignments: number;
    completedQuizzes: number;
    averageQuizScore: number;
    attendancePercentage: number;
    certificates: number;
  }> {
    const enrollments = await enrollmentService.getEnrollmentsForUser(userId);
    const submissions = await submissionService.getSubmissionsForUser(userId);
    const attempts = await quizAttemptService.getAttemptsForUser(userId);
    const certificates = await certificateService.getCertificates(userId);

    const enrolledCourses = enrollments.length;
    const completedCourses = enrollments.filter(
      (e) => e.progressPercent >= 100
    ).length;
    const averageProgress =
      enrolledCourses > 0
        ? Math.round(
            enrollments.reduce((sum, e) => sum + e.progressPercent, 0) /
              enrolledCourses
          )
        : 0;

    const completedQuizAttempts = attempts.filter(
      (a) => a.completedAt
    );
    const averageQuizScore =
      completedQuizAttempts.length > 0
        ? Math.round(
            completedQuizAttempts.reduce((sum, a) => sum + a.percentage, 0) /
              completedQuizAttempts.length
          )
        : 0;

    return {
      enrolledCourses,
      completedCourses,
      averageProgress,
      pendingAssignments: submissions.filter(
        (s) => s.status === "SUBMITTED"
      ).length,
      completedQuizzes: completedQuizAttempts.length,
      averageQuizScore,
      attendancePercentage: 0,
      certificates: certificates.length,
    };
  },
};
