export interface Assignment {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  deadline?: string;
  maxMarks: number;
  createdAt: string;
  updatedAt: string;
}

export interface Submission {
  id: string;
  assignmentId: string;
  userId: string;
  fileUrl?: string;
  notes?: string;
  status: "SUBMITTED" | "GRADED" | "RETURNED";
  marksObtained?: number;
  feedback?: string;
  submittedAt: string;
  gradedAt?: string;
}
