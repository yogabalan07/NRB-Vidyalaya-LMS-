export interface Result {
  id: string;
  userId: string;
  courseId: string;
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  grade?: string;
  createdAt: string;
}
