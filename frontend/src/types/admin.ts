export interface StudyMaterial {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  fileUrl: string;
  fileType?: string;
  fileSize?: number;
  driveUrl?: string;
  fileName?: string;
  createdBy?: string;
  uploadedBy?: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  courseName?: string;
  creatorName?: string;
}

export interface CreateMaterialData {
  courseId: string;
  title: string;
  description?: string;
  driveUrl?: string;
  filePath?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
}

export interface UpdateMaterialData {
  courseId?: string;
  title?: string;
  description?: string;
  driveUrl?: string;
  filePath?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
}

export interface PaginatedResponse<T> {
  status: string;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: string;
  status?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateUserData {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  role: string;
  status?: string;
}

export interface UpdateUserData {
  fullName?: string;
  phone?: string;
  role?: string;
  status?: string;
}

export interface StorageBucketStats {
  bucketName: string;
  fileCount: number;
  usedBytes: number;
}

export interface StorageStats {
  totalBytes: number | null;
  usedBytes: number;
  remainingBytes: number | null;
  usedPercentage: number | null;
  quotaAvailable: boolean;
  buckets: StorageBucketStats[];
}
