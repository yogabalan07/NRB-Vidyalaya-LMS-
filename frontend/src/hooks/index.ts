import { useAuth as useAuthContext } from "@/context/AuthContext";

export function useAuth() {
  return useAuthContext();
}

export function useUser() {
  const { user, profile, loading } = useAuthContext();
  return { user, profile, loading };
}

export function useCourses() {
  return { courses: [], loading: false, error: null };
}

export function useLessons(_courseId: string) {
  return { lessons: [], loading: false, error: null };
}

export function useQuizzes(_courseId: string) {
  return { quizzes: [], loading: false, error: null };
}

export function useAttendance(_userId: string) {
  return { records: [], loading: false, error: null };
}

export function useNotifications() {
  return { notifications: [], unreadCount: 0, loading: false };
}

export function useAI() {
  return {
    sendMessage: async (_message: string) => "",
    correctWriting: async (_text: string) => null,
    loading: false,
  };
}
