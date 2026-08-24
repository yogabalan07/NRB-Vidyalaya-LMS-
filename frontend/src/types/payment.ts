export interface Payment {
  id: string;
  userId: string;
  courseId: string;
  amount: number;
  currency: string;
  status: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  receiptUrl?: string;
  paidAt?: string;
  createdAt: string;
}
