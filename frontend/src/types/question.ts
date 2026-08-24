export interface Question {
  id: string;
  quizId?: string;
  question: string;
  options: QuestionOption[];
  correctOption: string;
  explanation?: string;
  marks: number;
  difficulty?: "easy" | "medium" | "hard";
  sortOrder?: number;
  createdAt: string;
}

export interface QuestionOption {
  id: string;
  text: string;
}

export interface QuestionBankItem {
  id: string;
  question: string;
  options: QuestionOption[];
  correctOption: string;
  explanation?: string;
  subject?: string;
  topic?: string;
  difficulty?: "easy" | "medium" | "hard";
  language: string;
  marks: number;
  tags?: string[];
  createdAt: string;
}
