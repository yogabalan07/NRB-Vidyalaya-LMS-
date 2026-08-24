export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  coverImageUrl?: string;
  authorId: string;
  category?: string;
  tags?: string[];
  seoTitle?: string;
  seoDescription?: string;
  status: "DRAFT" | "PUBLISHED" | "SCHEDULED";
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}
