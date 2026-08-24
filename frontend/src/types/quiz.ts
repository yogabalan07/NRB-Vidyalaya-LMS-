export interface Quiz {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  timeLimitMinutes?: number;
  totalMarks: number;
  passPercentage: number;
  maxAttempts: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  userId: string;
  answers: QuizAnswer[];
  score: number;
  totalMarks: number;
  percentage: number;
  startedAt: string;
  completedAt?: string;
}

export interface QuizAnswer {
  questionId: string;
  selectedOption: string;
}
