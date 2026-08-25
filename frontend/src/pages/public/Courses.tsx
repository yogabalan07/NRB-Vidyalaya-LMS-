import { Link } from "react-router-dom";
import { BookOpen, Search } from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { usePublishedCourses } from "@/hooks";

const difficultyColor: Record<string, string> = {
  beginner: "bg-green-100 text-green-800",
  intermediate: "bg-yellow-100 text-yellow-800",
  advanced: "bg-red-100 text-red-800",
};

function CourseCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="h-48 w-full rounded-none" />
      <CardHeader className="pb-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2 mt-2" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-5/6" />
        <div className="mt-4 flex gap-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
      </CardContent>
    </Card>
  );
}

export function CoursesPage() {
  const { data: courses, isLoading, error } = usePublishedCourses();
  const [search, setSearch] = useState("");

  const filtered = courses?.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="bg-gradient-to-br from-nrb-950 via-nrb-900 to-primary py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white lg:text-5xl">
            Our Courses
          </h1>
          <p className="mt-4 text-lg text-white/70">
            Explore our comprehensive Hindi language courses designed for every level.
          </p>
        </div>
      </section>

      {/* Search */}
      <section className="border-b bg-muted/30 py-6">
        <div className="container mx-auto px-4">
          <div className="mx-auto flex max-w-md items-center gap-2 rounded-lg border bg-background px-3 py-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>
      </section>

      {/* Course Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <CourseCardSkeleton key={i} />
              ))}
            </div>
          ) : error ? (
            <EmptyState
              title="Failed to load courses"
              description="Something went wrong while fetching courses. Please try again later."
              icon={<BookOpen className="h-12 w-12" />}
            />
          ) : filtered && filtered.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((course) => (
                <Link key={course.id} to={`/courses/${course.slug}`}>
                  <Card className="h-full overflow-hidden transition-shadow hover:shadow-md">
                    {course.thumbnailUrl && (
                      <img
                        src={course.thumbnailUrl}
                        alt={course.title}
                        className="h-48 w-full object-cover"
                      />
                    )}
                    <CardHeader className="pb-2">
                      <CardTitle className="line-clamp-1 text-lg">{course.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="line-clamp-2 text-sm text-muted-foreground">
                        {course.shortDescription || course.description || "No description available."}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {course.difficulty && (
                          <Badge
                            className={difficultyColor[course.difficulty] || ""}
                            variant="secondary"
                          >
                            {course.difficulty.charAt(0).toUpperCase() + course.difficulty.slice(1)}
                          </Badge>
                        )}
                        <Badge variant="outline">{course.language}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No courses found"
              description={
                search
                  ? `No courses match "${search}". Try a different search term.`
                  : "No published courses available yet. Check back soon!"
              }
              icon={<BookOpen className="h-12 w-12" />}
            >
              {search && (
                <Button variant="outline" onClick={() => setSearch("")}>
                  Clear Search
                </Button>
              )}
            </EmptyState>
          )}
        </div>
      </section>
    </div>
  );
}
