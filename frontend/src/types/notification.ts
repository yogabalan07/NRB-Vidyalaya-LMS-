export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "LESSON" | "ASSIGNMENT" | "DEADLINE" | "QUIZ" | "CERTIFICATE" | "ANNOUNCEMENT" | "SYSTEM";
  isRead: boolean;
  createdAt: string;
}
