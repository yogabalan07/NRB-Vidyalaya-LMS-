// Placeholder - Service stubs for future implementation
export const courseService = {
  getCourses: async () => [],
  getCourse: async (_slug: string) => null,
};

export const lessonService = {
  getLessons: async (_courseId: string) => [],
};

export const assignmentService = {
  getAssignments: async (_courseId: string) => [],
};

export const quizService = {
  getQuizzes: async (_courseId: string) => [],
};

export const questionService = {
  getQuestions: async (_quizId: string) => [],
};

export const attendanceService = {
  getAttendance: async (_userId: string) => [],
};

export const resultService = {
  getResults: async (_userId: string) => [],
};

export const certificateService = {
  getCertificates: async (_userId: string) => [],
};

export const paymentService = {
  getPayments: async (_userId: string) => [],
};

export const notificationService = {
  getNotifications: async (_userId: string) => [],
};

export const blogService = {
  getPosts: async () => [],
  getPost: async (_slug: string) => null,
};

export const aiService = {
  chat: async (_message: string, _level: string) => {
    throw new Error("AI service not configured");
  },
  correctWriting: async (_text: string) => {
    throw new Error("AI service not configured");
  },
  generateQuestions: async () => {
    throw new Error("AI service not configured");
  },
};

export const storageService = {
  upload: async (_bucket: string, _path: string, _file: File) => {
    throw new Error("Storage service not configured");
  },
};
