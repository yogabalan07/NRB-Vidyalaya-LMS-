import { useState } from "react";
import {
  useCourses,
  useAssignments,
  useCreateAssignment,
} from "@/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/common/EmptyState";
import { Plus, X, ClipboardList, Calendar, Award } from "lucide-react";
import type { Assignment } from "@/types/assignment";

interface AssignmentFormData {
  course_id: string;
  title: string;
  description: string;
  deadline: string;
  max_marks: number;
}

const defaultForm: AssignmentFormData = {
  course_id: "",
  title: "",
  description: "",
  deadline: "",
  max_marks: 100,
};

export function AdminAssignmentsPage() {
  const { data: courses } = useCourses();
  const [selectedCourse, setSelectedCourse] = useState("");
  const { data: assignments, isLoading } = useAssignments(selectedCourse);
  const createAssignment = useCreateAssignment();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<AssignmentFormData>(defaultForm);

  const resetForm = () => {
    setForm({ ...defaultForm, course_id: selectedCourse });
    setShowForm(false);
  };

  const handleSubmit = () => {
    if (!form.title.trim() || !form.course_id) return;
    createAssignment.mutate(
      {
        course_id: form.course_id,
        title: form.title,
        description: form.description || undefined,
        deadline: form.deadline || undefined,
        max_marks: form.max_marks || undefined,
      },
      { onSuccess: resetForm }
    );
  };

  const isOverdue = (assignment: Assignment) => {
    if (!assignment.deadline) return false;
    return new Date(assignment.deadline) < new Date();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Assignments</h1>
          <p className="text-muted-foreground">Manage assignments per course</p>
        </div>
        {selectedCourse && (
          <Button
            onClick={() => {
              setForm({ ...defaultForm, course_id: selectedCourse });
              setShowForm(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Assignment
          </Button>
        )}
      </div>

      <div className="max-w-sm">
        <Label>Select Course</Label>
        <select
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
          value={selectedCourse}
          onChange={(e) => {
            setSelectedCourse(e.target.value);
            setShowForm(false);
          }}
        >
          <option value="">Choose a course...</option>
          {courses?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
      </div>

      {showForm && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>New Assignment</CardTitle>
            <Button variant="ghost" size="icon" onClick={resetForm}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label>Title *</Label>
                <Input
                  value={form.title}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, title: e.target.value }))
                  }
                  placeholder="Assignment title"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Description</Label>
                <textarea
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  placeholder="Assignment description and instructions"
                />
              </div>
              <div className="space-y-2">
                <Label>Deadline</Label>
                <Input
                  type="datetime-local"
                  value={form.deadline}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, deadline: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Max Marks</Label>
                <Input
                  type="number"
                  value={form.max_marks || ""}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      max_marks: Number(e.target.value),
                    }))
                  }
                  placeholder="100"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!form.title.trim() || createAssignment.isPending}
              >
                Create
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedCourse && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {assignments?.length ?? 0} assignment{(assignments?.length ?? 0) !== 1 ? "s" : ""}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-16 rounded bg-muted animate-pulse" />
                ))}
              </div>
            ) : !assignments?.length ? (
              <EmptyState
                title="No assignments yet"
                description="Create assignments for this course."
                icon={<ClipboardList className="h-12 w-12" />}
              />
            ) : (
              <div className="space-y-2">
                {assignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="flex items-center justify-between gap-4 rounded-lg border p-4"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{assignment.title}</p>
                      {assignment.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                          {assignment.description}
                        </p>
                      )}
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                        {assignment.deadline && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(assignment.deadline).toLocaleDateString()}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Award className="h-3 w-3" />
                          {assignment.maxMarks} marks
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {isOverdue(assignment) && (
                        <Badge variant="destructive">Overdue</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
