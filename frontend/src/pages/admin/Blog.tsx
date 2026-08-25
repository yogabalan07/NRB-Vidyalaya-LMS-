import { useState } from "react";
import {
  useAllBlogPosts,
  useCreateBlogPost,
  useUpdateBlogPost,
  useDeleteBlogPost,
  useAuth,
} from "@/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/common/EmptyState";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import {
  Plus,
  Pencil,
  Trash2,
  FileText,
  X,
  Eye,
  EyeOff,
} from "lucide-react";
import type { BlogPost } from "@/types/blog";

interface BlogFormData {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  category: string;
  tags: string;
  status: string;
}

const defaultForm: BlogFormData = {
  title: "",
  slug: "",
  content: "",
  excerpt: "",
  category: "",
  tags: "",
  status: "DRAFT",
};

function getStatusVariant(status: string) {
  if (status === "PUBLISHED") return "default" as const;
  if (status === "SCHEDULED") return "secondary" as const;
  return "outline" as const;
}

export function AdminBlogPage() {
  const { user } = useAuth();
  const { data: posts, isLoading, error } = useAllBlogPosts();
  const createPost = useCreateBlogPost();
  const updatePost = useUpdateBlogPost();
  const deletePost = useDeleteBlogPost();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<BlogFormData>(defaultForm);
  const [confirmDelete, setConfirmDelete] = useState<BlogPost | null>(null);

  const resetForm = () => {
    setForm(defaultForm);
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (post: BlogPost) => {
    setForm({
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt || "",
      category: post.category || "",
      tags: post.tags?.join(", ") || "",
      status: post.status,
    });
    setEditingId(post.id);
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!form.title.trim() || !form.slug.trim() || !form.content.trim()) return;

    const postData = {
      title: form.title,
      slug: form.slug,
      content: form.content,
      excerpt: form.excerpt || undefined,
      category: form.category || undefined,
      tags: form.tags
        ? form.tags.split(",").map((t) => t.trim()).filter(Boolean)
        : undefined,
      status: form.status,
      author_id: user?.id || undefined,
      published_at: form.status === "PUBLISHED" ? new Date().toISOString() : undefined,
    };

    if (editingId) {
      updatePost.mutate(
        { id: editingId, updates: postData },
        { onSuccess: resetForm }
      );
    } else {
      createPost.mutate(postData, { onSuccess: resetForm });
    }
  };

  const handleTogglePublish = (post: BlogPost) => {
    const newStatus = post.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    updatePost.mutate({
      id: post.id,
      updates: {
        status: newStatus,
        published_at: newStatus === "PUBLISHED" ? new Date().toISOString() : undefined,
      },
    });
  };

  const handleDelete = () => {
    if (!confirmDelete) return;
    deletePost.mutate(confirmDelete.id, {
      onSuccess: () => setConfirmDelete(null),
    });
  };

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-destructive">Failed to load blog posts.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Blog</h1>
          <p className="text-muted-foreground">Manage blog posts and content</p>
        </div>
        <Button onClick={() => { resetForm(); setShowForm(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          New Post
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{editingId ? "Edit Post" : "New Post"}</CardTitle>
            <Button variant="ghost" size="icon" onClick={resetForm}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input
                  value={form.title}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      title: e.target.value,
                      slug:
                        f.slug ||
                        e.target.value.toLowerCase().replace(/\s+/g, "-"),
                    }))
                  }
                  placeholder="Post title"
                />
              </div>
              <div className="space-y-2">
                <Label>Slug *</Label>
                <Input
                  value={form.slug}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, slug: e.target.value }))
                  }
                  placeholder="post-slug"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Excerpt</Label>
                <Input
                  value={form.excerpt}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, excerpt: e.target.value }))
                  }
                  placeholder="Short excerpt for previews"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Content *</Label>
                <textarea
                  className="flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono"
                  value={form.content}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, content: e.target.value }))
                  }
                  placeholder="Post content (supports markdown)"
                />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Input
                  value={form.category}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, category: e.target.value }))
                  }
                  placeholder="e.g. Hindi Learning"
                />
              </div>
              <div className="space-y-2">
                <Label>Tags (comma-separated)</Label>
                <Input
                  value={form.tags}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, tags: e.target.value }))
                  }
                  placeholder="hindi, grammar, tips"
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={form.status}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, status: e.target.value }))
                  }
                >
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="SCHEDULED">Scheduled</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={
                  !form.title.trim() ||
                  !form.slug.trim() ||
                  !form.content.trim() ||
                  createPost.isPending ||
                  updatePost.isPending
                }
              >
                {editingId ? "Update" : "Publish"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {posts?.length ?? 0} post{(posts?.length ?? 0) !== 1 ? "s" : ""}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-16 rounded bg-muted animate-pulse" />
              ))}
            </div>
          ) : !posts?.length ? (
            <EmptyState
              title="No blog posts yet"
              description="Create your first blog post."
              icon={<FileText className="h-12 w-12" />}
            >
              <Button onClick={() => { resetForm(); setShowForm(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                Create Post
              </Button>
            </EmptyState>
          ) : (
            <div className="space-y-2">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="flex items-center justify-between gap-4 rounded-lg border p-4"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">
                        {post.title}
                      </p>
                      <Badge variant={getStatusVariant(post.status)}>
                        {post.status}
                      </Badge>
                      {post.category && (
                        <Badge variant="outline">{post.category}</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {post.slug} &middot;{" "}
                      {new Date(post.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleTogglePublish(post)}
                      title={post.status === "PUBLISHED" ? "Unpublish" : "Publish"}
                    >
                      {post.status === "PUBLISHED" ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(post)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setConfirmDelete(post)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={!!confirmDelete}
        title="Delete Blog Post"
        message={`Are you sure you want to delete "${confirmDelete?.title}"?`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
