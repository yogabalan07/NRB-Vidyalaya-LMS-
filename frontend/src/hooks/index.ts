import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth as useAuthContext } from "@/context/AuthContext";
import {
  courseService,
  enrollmentService,
  lessonService,
  assignmentService,
  quizService,
  quizAttemptService,
  questionService,
  questionBankService,
  attendanceService,
  resultService,
  certificateService,
  paymentService,
  notificationService,
  blogService,
  aiService,
  submissionService,
  profileService,
  statsService,
  adminService,
} from "@/services";

export function useAuth() {
  return useAuthContext();
}

export function useUser() {
  const { user, profile, loading } = useAuthContext();
  return { user, profile, loading };
}

// ─── Course Hooks ──────────────────────────────────────────────
export function useCourses() {
  return useQuery({
    queryKey: ["courses"],
    queryFn: courseService.getCourses,
  });
}

export function usePublishedCourses() {
  return useQuery({
    queryKey: ["courses", "published"],
    queryFn: courseService.getPublishedCourses,
  });
}

export function useCourse(slug: string) {
  return useQuery({
    queryKey: ["course", slug],
    queryFn: () => courseService.getCourse(slug),
    enabled: !!slug,
  });
}

export function useCourseById(id: string) {
  return useQuery({
    queryKey: ["course", id],
    queryFn: () => courseService.getCourseById(id),
    enabled: !!id,
  });
}

export function useCoursesForTeacher(teacherId: string) {
  return useQuery({
    queryKey: ["courses", "teacher", teacherId],
    queryFn: () => courseService.getCoursesForTeacher(teacherId),
    enabled: !!teacherId,
  });
}

export function useCreateCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: courseService.createCourse,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["courses"] }),
  });
}

export function useUpdateCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Parameters<typeof courseService.updateCourse>[1] }) =>
      courseService.updateCourse(id, updates),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["courses"] }),
  });
}

export function useDeleteCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: courseService.deleteCourse,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["courses"] }),
  });
}

// ─── Enrollment Hooks ──────────────────────────────────────────
export function useEnrollments(userId: string) {
  return useQuery({
    queryKey: ["enrollments", userId],
    queryFn: () => enrollmentService.getEnrollmentsForUser(userId),
    enabled: !!userId,
  });
}

export function useEnrollCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, courseId }: { userId: string; courseId: string }) =>
      enrollmentService.enroll(userId, courseId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["enrollments", variables.userId] });
    },
  });
}

export function useUpdateProgress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ enrollmentId, progress }: { enrollmentId: string; progress: number }) =>
      enrollmentService.updateProgress(enrollmentId, progress),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["enrollments"] }),
  });
}

// ─── Lesson Hooks ──────────────────────────────────────────────
export function useLessons(courseId: string) {
  return useQuery({
    queryKey: ["lessons", courseId],
    queryFn: () => lessonService.getLessons(courseId),
    enabled: !!courseId,
  });
}

export function useLesson(id: string) {
  return useQuery({
    queryKey: ["lesson", id],
    queryFn: () => lessonService.getLesson(id),
    enabled: !!id,
  });
}

export function useCreateLesson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: lessonService.createLesson,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["lessons", variables.course_id] });
    },
  });
}

export function useUpdateLesson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Parameters<typeof lessonService.updateLesson>[1] }) =>
      lessonService.updateLesson(id, updates),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["lessons"] }),
  });
}

export function useDeleteLesson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: lessonService.deleteLesson,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["lessons"] }),
  });
}

// ─── Assignment Hooks ──────────────────────────────────────────
export function useAssignments(courseId: string) {
  return useQuery({
    queryKey: ["assignments", courseId],
    queryFn: () => assignmentService.getAssignments(courseId),
    enabled: !!courseId,
  });
}

export function useAssignment(id: string) {
  return useQuery({
    queryKey: ["assignment", id],
    queryFn: () => assignmentService.getAssignment(id),
    enabled: !!id,
  });
}

export function useSubmissionsForUser(userId: string) {
  return useQuery({
    queryKey: ["submissions", "user", userId],
    queryFn: () => submissionService.getSubmissionsForUser(userId),
    enabled: !!userId,
  });
}

export function useSubmissionsForAssignment(assignmentId: string) {
  return useQuery({
    queryKey: ["submissions", "assignment", assignmentId],
    queryFn: () => submissionService.getSubmissionsForAssignment(assignmentId),
    enabled: !!assignmentId,
  });
}

export function useSubmitAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: submissionService.submit,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["submissions"] });
      queryClient.invalidateQueries({ queryKey: ["assignments", variables.assignment_id] });
    },
  });
}

export function useGradeSubmission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, marks, feedback }: { id: string; marks: number; feedback?: string }) =>
      submissionService.grade(id, marks, feedback),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["submissions"] }),
  });
}

export function useCreateAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: assignmentService.createAssignment,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["assignments", variables.course_id] });
    },
  });
}

export function useUpdateAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Parameters<typeof assignmentService.updateAssignment>[1] }) =>
      assignmentService.updateAssignment(id, updates),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["assignments"] }),
  });
}

export function useDeleteAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: assignmentService.deleteAssignment,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["assignments"] }),
  });
}

// ─── Quiz Hooks ────────────────────────────────────────────────
export function useQuizzes(courseId: string) {
  return useQuery({
    queryKey: ["quizzes", courseId],
    queryFn: () => quizService.getPublishedQuizzes(courseId),
    enabled: !!courseId,
  });
}

export function useAllQuizzes(courseId: string) {
  return useQuery({
    queryKey: ["quizzes", "all", courseId],
    queryFn: () => quizService.getQuizzes(courseId),
    enabled: !!courseId,
  });
}

export function useQuiz(id: string) {
  return useQuery({
    queryKey: ["quiz", id],
    queryFn: () => quizService.getQuiz(id),
    enabled: !!id,
  });
}

export function useQuestions(quizId: string) {
  return useQuery({
    queryKey: ["questions", quizId],
    queryFn: () => questionService.getQuestions(quizId),
    enabled: !!quizId,
  });
}

export function useQuizAttempts(quizId: string, userId: string) {
  return useQuery({
    queryKey: ["quizAttempts", quizId, userId],
    queryFn: () => quizAttemptService.getAttemptCount(quizId, userId),
    enabled: !!quizId && !!userId,
  });
}

export function useStartQuizAttempt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ quizId, userId }: { quizId: string; userId: string }) =>
      quizAttemptService.startAttempt(quizId, userId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["quizAttempts", variables.quizId] });
    },
  });
}

export function useSubmitQuizAttempt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      answers,
      score,
      totalMarks,
      percentage,
    }: {
      id: string;
      answers: Array<{ questionId: string; selectedOption: string }>;
      score: number;
      totalMarks: number;
      percentage: number;
    }) => quizAttemptService.submitAttempt(id, answers, score, totalMarks, percentage),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quizAttempts"] });
      queryClient.invalidateQueries({ queryKey: ["results"] });
    },
  });
}

export function useCreateQuiz() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: quizService.createQuiz,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["quizzes", variables.course_id] });
    },
  });
}

export function useDeleteQuiz() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: quizService.deleteQuiz,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["quizzes"] }),
  });
}

// ─── Question Bank Hooks ───────────────────────────────────────
export function useQuestionBank(filters?: Parameters<typeof questionBankService.getQuestions>[0]) {
  return useQuery({
    queryKey: ["questionBank", filters],
    queryFn: () => questionBankService.getQuestions(filters),
  });
}

export function useCreateQuestionBankQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: questionBankService.createQuestion,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["questionBank"] }),
  });
}

export function useDeleteQuestionBankQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: questionBankService.deleteQuestion,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["questionBank"] }),
  });
}

// ─── Attendance Hooks ──────────────────────────────────────────
export function useAttendance(userId: string, courseId?: string) {
  return useQuery({
    queryKey: ["attendance", userId, courseId],
    queryFn: () => attendanceService.getAttendance(userId, courseId),
    enabled: !!userId,
  });
}

export function useAttendanceForCourse(courseId: string) {
  return useQuery({
    queryKey: ["attendance", "course", courseId],
    queryFn: () => attendanceService.getAttendanceForCourse(courseId),
    enabled: !!courseId,
  });
}

export function useAttendanceSummary(userId: string, courseId: string) {
  return useQuery({
    queryKey: ["attendanceSummary", userId, courseId],
    queryFn: () => attendanceService.getAttendanceSummary(userId, courseId),
    enabled: !!userId && !!courseId,
  });
}

export function useMarkAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: attendanceService.markAttendance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      queryClient.invalidateQueries({ queryKey: ["attendanceSummary"] });
    },
  });
}

// ─── Result Hooks ──────────────────────────────────────────────
export function useResults(userId: string) {
  return useQuery({
    queryKey: ["results", userId],
    queryFn: () => resultService.getResults(userId),
    enabled: !!userId,
  });
}

export function useResultsForCourse(courseId: string) {
  return useQuery({
    queryKey: ["results", "course", courseId],
    queryFn: () => resultService.getResultsForCourse(courseId),
    enabled: !!courseId,
  });
}

// ─── Certificate Hooks ─────────────────────────────────────────
export function useCertificates(userId: string) {
  return useQuery({
    queryKey: ["certificates", userId],
    queryFn: () => certificateService.getCertificates(userId),
    enabled: !!userId,
  });
}

export function useCertificateVerify(certificateNumber: string) {
  return useQuery({
    queryKey: ["certificate", "verify", certificateNumber],
    queryFn: async () => {
      const response = await fetch(
        `/api/certificates/verify/${certificateNumber}`
      );
      if (!response.ok) {
        throw new Error("Verification failed");
      }
      const result = await response.json();
      return result.data as {
        valid: boolean;
        message?: string;
        certificate?: {
          institution: string;
          studentName: string;
          course: string;
          completionDate: string;
          certificateNumber: string;
          status: string;
        };
      };
    },
    enabled: !!certificateNumber,
  });
}

// ─── Payment Hooks ─────────────────────────────────────────────
export function usePayments(userId: string) {
  return useQuery({
    queryKey: ["payments", userId],
    queryFn: () => paymentService.getPayments(userId),
    enabled: !!userId,
  });
}

export function useAllPayments() {
  return useQuery({
    queryKey: ["payments", "all"],
    queryFn: async () => {
      const { data, error } = await (await import("@/services/supabase")).supabase
        .from("payments")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });
}

// ─── Notification Hooks ────────────────────────────────────────
export function useNotifications(userId: string) {
  return useQuery({
    queryKey: ["notifications", userId],
    queryFn: () => notificationService.getNotifications(userId),
    enabled: !!userId,
  });
}

export function useUnreadNotificationCount(userId: string) {
  return useQuery({
    queryKey: ["notifications", "unread", userId],
    queryFn: () => notificationService.getUnreadCount(userId),
    enabled: !!userId,
    refetchInterval: 30000,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notificationService.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notificationService.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

// ─── Blog Hooks ────────────────────────────────────────────────
export function usePublishedBlogPosts() {
  return useQuery({
    queryKey: ["blog", "published"],
    queryFn: blogService.getPublishedPosts,
  });
}

export function useAllBlogPosts() {
  return useQuery({
    queryKey: ["blog", "all"],
    queryFn: blogService.getPosts,
  });
}

export function useBlogPost(slug: string) {
  return useQuery({
    queryKey: ["blog", slug],
    queryFn: () => blogService.getPost(slug),
    enabled: !!slug,
  });
}

export function useCreateBlogPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: blogService.createPost,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["blog"] }),
  });
}

export function useUpdateBlogPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Parameters<typeof blogService.updatePost>[1] }) =>
      blogService.updatePost(id, updates),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["blog"] }),
  });
}

export function useDeleteBlogPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: blogService.deletePost,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["blog"] }),
  });
}

// ─── AI Hooks ──────────────────────────────────────────────────
export function useAIConversations(userId: string) {
  return useQuery({
    queryKey: ["ai", "conversations", userId],
    queryFn: () => aiService.getConversations(userId),
    enabled: !!userId,
  });
}

export function useAIMessages(conversationId: string) {
  return useQuery({
    queryKey: ["ai", "messages", conversationId],
    queryFn: () => aiService.getMessages(conversationId),
    enabled: !!conversationId,
  });
}

export function useCreateConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: aiService.createConversation,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["ai", "conversations"] }),
  });
}

export function useSendMessage() {
  return useMutation({
    mutationFn: ({
      message,
      level,
      conversationId,
    }: {
      message: string;
      level: string;
      conversationId?: string;
    }) => aiService.chat(message, level, conversationId),
  });
}

export function useCorrectWriting() {
  return useMutation({
    mutationFn: aiService.correctWriting,
  });
}

export function useGenerateQuestions() {
  return useMutation({
    mutationFn: aiService.generateQuestions,
  });
}

// ─── Stats Hooks ───────────────────────────────────────────────
export function useDashboardStats() {
  return useQuery({
    queryKey: ["stats", "dashboard"],
    queryFn: statsService.getDashboardStats,
  });
}

export function useStudentStats(userId: string) {
  return useQuery({
    queryKey: ["stats", "student", userId],
    queryFn: () => statsService.getStudentStats(userId),
    enabled: !!userId,
  });
}

// ─── Profile Hooks ─────────────────────────────────────────────
export function useAllProfiles() {
  return useQuery({
    queryKey: ["profiles"],
    queryFn: profileService.getAllProfiles,
  });
}

export function useProfilesByRole(role: string) {
  return useQuery({
    queryKey: ["profiles", role],
    queryFn: () => profileService.getProfilesByRole(role),
    enabled: !!role,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, updates }: { userId: string; updates: Parameters<typeof profileService.updateProfile>[1] }) =>
      profileService.updateProfile(userId, updates),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["profiles"] }),
  });
}

// ─── Admin User Hooks ────────────────────────────────────────
export interface AdminUserListParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
}

export function useAdminUsers(params?: AdminUserListParams) {
  return useQuery({
    queryKey: ["admin", "users", params],
    queryFn: () => adminService.listUsers(params),
  });
}

export function useAdminUser(id: string) {
  return useQuery({
    queryKey: ["admin", "user", id],
    queryFn: () => adminService.getUser(id),
    enabled: !!id,
  });
}

export function useCreateAdminUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminService.createUser,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "users"] }),
  });
}

export function useUpdateAdminUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof adminService.updateUser>[1] }) =>
      adminService.updateUser(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "users"] }),
  });
}

export function useDeleteAdminUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminService.deleteUser,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "users"] }),
  });
}

// ─── Admin Material Hooks ─────────────────────────────────────
export interface AdminMaterialListParams {
  page?: number;
  limit?: number;
  search?: string;
  courseId?: string;
}

export function useAdminMaterials(params?: AdminMaterialListParams) {
  return useQuery({
    queryKey: ["admin", "materials", params],
    queryFn: () => adminService.listMaterials(params),
  });
}

export function useAdminMaterial(id: string) {
  return useQuery({
    queryKey: ["admin", "material", id],
    queryFn: () => adminService.getMaterial(id),
    enabled: !!id,
  });
}

export function useCreateAdminMaterial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminService.createMaterial,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "materials"] }),
  });
}

export function useUpdateAdminMaterial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof adminService.updateMaterial>[1] }) =>
      adminService.updateMaterial(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "materials"] }),
  });
}

export function useDeleteAdminMaterial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminService.deleteMaterial,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "materials"] }),
  });
}
