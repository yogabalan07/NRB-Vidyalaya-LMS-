export type { Role, User, Profile, LoginCredentials, RegisterData } from "./auth";

export { ALL_ROLES, STUDENT_ROLE } from "./auth";

export enum LessonStatus {
  DRAFT = "DRAFT",
  PUBLISHED = "PUBLISHED",
  ARCHIVED = "ARCHIVED",
}

export enum SubmissionStatus {
  PENDING = "PENDING",
  SUBMITTED = "SUBMITTED",
  GRADED = "GRADED",
  RETURNED = "RETURNED",
}

export enum AttendanceStatus {
  PRESENT = "PRESENT",
  ABSENT = "ABSENT",
  LEAVE = "LEAVE",
}

export enum QuestionType {
  MCQ = "MCQ",
  TRUE_FALSE = "TRUE_FALSE",
  FILL_BLANK = "FILL_BLANK",
  TRANSLATION = "TRANSLATION",
  MATCH = "MATCH",
  SHORT_ANSWER = "SHORT_ANSWER",
}

export enum Difficulty {
  EASY = "easy",
  MEDIUM = "medium",
  HARD = "hard",
}

export enum BlogStatus {
  DRAFT = "DRAFT",
  PUBLISHED = "PUBLISHED",
  SCHEDULED = "SCHEDULED",
}

export enum PaymentStatus {
  PENDING = "PENDING",
  PAID = "PAID",
  PARTIAL = "PARTIAL",
  OVERDUE = "OVERDUE",
}

export const HINDI_LEVELS = ["Beginner", "Intermediate", "Advanced"] as const;
export type HindiLevel = (typeof HINDI_LEVELS)[number];

export const CONVERSATION_TOPICS = [
  "Introduction",
  "School",
  "Home",
  "Shopping",
  "Restaurant",
  "Travel",
  "Hospital",
  "Workplace",
  "Daily Life",
] as const;
