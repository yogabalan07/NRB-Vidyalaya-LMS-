export type Role = "SUPER_ADMIN" | "ADMIN" | "TEACHER" | "STUDENT";

export interface JWTPayload {
  sub: string;
  email: string;
  role: Role;
  iat: number;
  exp: number;
}

export interface AIQuestion {
  question: string;
  options: { id: string; text: string }[];
  correctOption: string;
  explanation: string;
  marks: number;
}

export interface AIQuestionResponse {
  title: string;
  subject: string;
  topic: string;
  difficulty: string;
  language: string;
  questions: AIQuestion[];
}
