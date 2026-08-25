import { Link } from "react-router-dom";
import { useState } from "react";
import { BookOpen, Calendar, Tag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { usePublishedBlogPosts } from "@/hooks";

function PostCardSkeleton() {
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
        </div>
      </CardContent>
    </Card>
  );
}

export function BlogPage() {
  const { data: posts, isLoading, error } = usePublishedBlogPosts();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = posts
    ? Array.from(new Set(posts.map((p) => p.category).filter(Boolean)))
    : [];

  const filtered = posts?.filter(
    (p) => !selectedCategory || p.category === selectedCategory
  );

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="bg-gradient-to-br from-nrb-950 via-nrb-900 to-primary py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white lg:text-5xl">
            Blog
          </h1>
          <p className="mt-4 text-lg text-white/70">
            Insights, tips, and news from the world of Hindi language learning.
          </p>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="border-b bg-muted/30 py-4">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={selectedCategory === null ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setSelectedCategory(null)}
              >
                All
              </Badge>
              {categories.map((cat) => (
                <Badge
                  key={cat}
                  variant={selectedCategory === cat ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setSelectedCategory(cat || null)}
                >
                  {cat}
                </Badge>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Posts Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <PostCardSkeleton key={i} />
              ))}
            </div>
          ) : error ? (
            <EmptyState
              title="Failed to load posts"
              description="Something went wrong while fetching blog posts. Please try again later."
              icon={<BookOpen className="h-12 w-12" />}
            />
          ) : filtered && filtered.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((post) => (
                <Link key={post.id} to={`/blog/${post.slug}`}>
                  <Card className="h-full overflow-hidden transition-shadow hover:shadow-md">
                    {post.coverImageUrl && (
                      <img
                        src={post.coverImageUrl}
                        alt={post.title}
                        className="h-48 w-full object-cover"
                      />
                    )}
                    <CardHeader className="pb-2">
                      <CardTitle className="line-clamp-2 text-lg">{post.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="line-clamp-3 text-sm text-muted-foreground">
                        {post.excerpt || "No excerpt available."}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        {post.category && (
                          <span className="flex items-center gap-1">
                            <Tag className="h-3 w-3" />
                            {post.category}
                          </span>
                        )}
                        {post.publishedAt && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(post.publishedAt).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        )}
                      </div>
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {post.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No posts found"
              description={
                selectedCategory
                  ? `No posts in the "${selectedCategory}" category.`
                  : "No blog posts published yet. Check back soon!"
              }
              icon={<BookOpen className="h-12 w-12" />}
            >
              {selectedCategory && (
                <Badge
                  variant="outline"
                  className="cursor-pointer"
                  onClick={() => setSelectedCategory(null)}
                >
                  View All Posts
                </Badge>
              )}
            </EmptyState>
          )}
        </div>
      </section>
    </div>
  );
}
