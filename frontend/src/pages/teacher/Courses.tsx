import { useAuth, useCoursesForTeacher, useCreateCourse, useUpdateCourse, useDeleteCourse } from "@/hooks";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import {
  Plus,
  Pencil,
  Trash2,
  BookOpen,
  Eye,
  EyeOff,
} from "lucide-react";
import type { Course } from "@/types/course";

interface CourseFormData {
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  difficulty: string;
  language: string;
}

const emptyForm: CourseFormData = {
  title: "",
  slug: "",
  description: "",
  shortDescription: "",
  difficulty: "beginner",
  language: "Hindi",
};

export function TeacherCoursesPage() {
  const { user } = useAuth();
  const { data: courses, isLoading } = useCoursesForTeacher(user?.id || "");
  const createCourse = useCreateCourse();
  const updateCourse = useUpdateCourse();
  const deleteCourse = useDeleteCourse();

  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState<CourseFormData>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<Course | null>(null);

  const handleOpenCreate = () => {
    setEditingCourse(null);
    setFormData(emptyForm);
    setShowForm(true);
  };

  const handleOpenEdit = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      title: course.title,
      slug: course.slug,
      description: course.description || "",
      shortDescription: course.shortDescription || "",
      difficulty: course.difficulty || "beginner",
      language: course.language || "Hindi",
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCourse) {
        await updateCourse.mutateAsync({
          id: editingCourse.id,
          updates: {
            title: formData.title,
            description: formData.description,
            short_description: formData.shortDescription,
            difficulty: formData.difficulty,
          },
        });
      } else {
        await createCourse.mutateAsync({
          title: formData.title,
          slug: formData.slug || formData.title.toLowerCase().replace(/\s+/g, "-"),
          description: formData.description,
          short_description: formData.shortDescription,
          difficulty: formData.difficulty,
          language: formData.language,
          teacher_id: user?.id,
        });
      }
      setShowForm(false);
      setFormData(emptyForm);
      setEditingCourse(null);
    } catch (err) {
      console.error("Failed to save course:", err);
    }
  };

  const handleTogglePublish = async (course: Course) => {
    try {
      await updateCourse.mutateAsync({
        id: course.id,
        updates: { is_published: !course.isPublished },
      });
    } catch (err) {
      console.error("Failed to toggle publish:", err);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteCourse.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
    } catch (err) {
      console.error("Failed to delete course:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Courses</h1>
          <p className="text-muted-foreground">Manage your courses and curriculum</p>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Create Course
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingCourse ? "Edit Course" : "Create New Course"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="auto-generated-from-title"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="shortDesc">Short Description</Label>
                <Input
                  id="shortDesc"
                  value={formData.shortDescription}
                  onChange={(e) =>
                    setFormData({ ...formData, shortDescription: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <select
                    id="difficulty"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={formData.difficulty}
                    onChange={(e) =>
                      setFormData({ ...formData, difficulty: e.target.value })
                    }
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Input
                    id="language"
                    value={formData.language}
                    onChange={(e) =>
                      setFormData({ ...formData, language: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingCourse(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createCourse.isPending || updateCourse.isPending}>
                  {editingCourse ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {!courses || courses.length === 0 ? (
        <EmptyState
          title="No courses yet"
          description="Create your first course to get started."
          icon={<BookOpen className="h-12 w-12" />}
        >
          <Button onClick={handleOpenCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Create Course
          </Button>
        </EmptyState>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Card key={course.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">{course.title}</CardTitle>
                  <Badge variant={course.isPublished ? "default" : "secondary"}>
                    {course.isPublished ? "Published" : "Draft"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {course.shortDescription || course.description || "No description"}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{course.difficulty || "All levels"}</span>
                  <span>·</span>
                  <span>{course.language}</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleTogglePublish(course)}
                  >
                    {course.isPublished ? (
                      <EyeOff className="mr-1 h-3 w-3" />
                    ) : (
                      <Eye className="mr-1 h-3 w-3" />
                    )}
                    {course.isPublished ? "Unpublish" : "Publish"}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleOpenEdit(course)}>
                    <Pencil className="mr-1 h-3 w-3" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setDeleteTarget(course)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Course"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
