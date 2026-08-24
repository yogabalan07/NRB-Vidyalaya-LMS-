export interface AttendanceRecord {
  id: string;
  userId: string;
  courseId: string;
  date: string;
  status: "PRESENT" | "ABSENT" | "LEAVE";
  markedBy?: string;
  createdAt: string;
}
