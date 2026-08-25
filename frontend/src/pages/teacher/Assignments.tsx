import { useAuth, useCoursesForTeacher, useAssignments, useCreateAssignment, useUpdateAssignment } from "@/hooks";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { Plus, Pencil, ClipboardList } from "lucide-react";
import type { Assignment } from "@/types/assignment";

interface AssignmentFormData {
  title: string;
  description: string;
  deadline: string;
  maxMarks: string;
}

const emptyForm: AssignmentFormData = {
  title: "",
  description: "",
  deadline: "",
  maxMarks: "",
};

export function TeacherAssignmentsPage() {
  const { user } = useAuth();
  const { data: courses } = useCoursesForTeacher(user?.id || "");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const { data: assignments, isLoading } = useAssignments(selectedCourseId);
  const createAssignment = useCreateAssignment();
  const updateAssignment = useUpdateAssignment();

  const [showForm, setShowForm] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [formData, setFormData] = useState<AssignmentFormData>(emptyForm);

  const handleOpenCreate = () => {
    setEditingAssignment(null);
    setFormData(emptyForm);
    setShowForm(true);
  };

  const handleOpenEdit = (assignment: Assignment) => {
    setEditingAssignment(assignment);
    setFormData({
      title: assignment.title,
      description: assignment.description || "",
      deadline: assignment.deadline
        ? new Date(assignment.deadline).toISOString().slice(0, 16)
        : "",
      maxMarks: assignment.maxMarks?.toString() || "",
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId) return;

    try {
      const payload = {
        title: formData.title,
        description: formData.description || undefined,
        deadline: formData.deadline ? new Date(formData.deadline).toISOString() : undefined,
        max_marks: formData.maxMarks ? parseInt(formData.maxMarks) : undefined,
      };

      if (editingAssignment) {
        await updateAssignment.mutateAsync({
          id: editingAssignment.id,
          updates: payload,
        });
      } else {
        await createAssignment.mutateAsync({
          course_id: selectedCourseId,
          ...payload,
        });
      }
      setShowForm(false);
      setFormData(emptyForm);
      setEditingAssignment(null);
    } catch (err) {
      console.error("Failed to save assignment:", err);
    }
  };

  const isDeadlinePassed = (deadline?: string) => {
    if (!deadline) return false;
    return new Date(deadline) < new Date();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Assignments</h1>
          <p className="text-muted-foreground">Create and manage assignments for your students</p>
        </div>
        {selectedCourseId && (
          <Button onClick={handleOpenCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Create Assignment
          </Button>
        )}
      </div>

      <div className="space-y-2">
        <Label>Select Course</Label>
        <select
          className="flex h-10 w-full max-w-md rounded-md border border-input bg-background px-3 py-2 text-sm"
          value={selectedCourseId}
          onChange={(e) => setSelectedCourseId(e.target.value)}
        >
          <option value="">Choose a course...</option>
          {courses?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
      </div>

      {showForm && selectedCourseId && (
        <Card>
          <CardHeader>
            <CardTitle>{editingAssignment ? "Edit Assignment" : "Create New Assignment"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                  <Label htmlFor="deadline">Deadline</Label>
                  <Input
                    id="deadline"
                    type="datetime-local"
                    value={formData.deadline}
                    onChange={(e) =>
                      setFormData({ ...formData, deadline: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxMarks">Max Marks</Label>
                  <Input
                    id="maxMarks"
                    type="number"
                    min="0"
                    value={formData.maxMarks}
                    onChange={(e) =>
                      setFormData({ ...formData, maxMarks: e.target.value })
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
                    setEditingAssignment(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createAssignment.isPending || updateAssignment.isPending}
                >
                  {editingAssignment ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {!selectedCourseId ? (
        <EmptyState
          title="Select a course"
          description="Choose a course above to manage its assignments."
          icon={<ClipboardList className="h-12 w-12" />}
        />
      ) : isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : !assignments || assignments.length === 0 ? (
        <EmptyState
          title="No assignments yet"
          description="Create your first assignment for this course."
          icon={<ClipboardList className="h-12 w-12" />}
        >
          <Button onClick={handleOpenCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Create Assignment
          </Button>
        </EmptyState>
      ) : (
        <div className="space-y-3">
          {assignments.map((assignment) => (
            <Card key={assignment.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium">{assignment.title}</h3>
                    {assignment.description && (
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                        {assignment.description}
                      </p>
                    )}
                    <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                      <span>Max marks: {assignment.maxMarks}</span>
                      {assignment.deadline && (
                        <span>
                          Deadline:{" "}
                          {new Date(assignment.deadline).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {assignment.deadline && (
                      <Badge variant={isDeadlinePassed(assignment.deadline) ? "destructive" : "secondary"}>
                        {isDeadlinePassed(assignment.deadline) ? "Closed" : "Open"}
                      </Badge>
                    )}
                    <Button size="sm" variant="outline" onClick={() => handleOpenEdit(assignment)}>
                      <Pencil className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
