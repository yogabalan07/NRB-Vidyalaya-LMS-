// Placeholder hooks - will be implemented with real data fetching

export function useAuth() {
  return {
    user: null,
    loading: false,
    login: async () => {},
    register: async () => {},
    logout: async () => {},
  };
}

export function useUser() {
  return { user: null, loading: false };
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
