export interface Certificate {
  id: string;
  userId: string;
  courseId: string;
  certificateNumber: string;
  issuedAt: string;
  qrCodeUrl?: string;
  verificationUrl?: string;
}
