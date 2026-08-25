import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar, Tag, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/common/ErrorState";
import { useBlogPost } from "@/hooks";

function DetailSkeleton() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <Skeleton className="mb-6 h-6 w-32" />
      <Skeleton className="h-10 w-2/3" />
      <div className="mt-4 flex gap-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-20" />
      </div>
      <Skeleton className="mt-8 h-64 w-full rounded-lg" />
      <div className="mt-8 space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </div>
    </div>
  );
}

export function BlogDetailsPage() {
  const { slug } = useParams<{ slug: string }>();

  const { data: post, isLoading, error } = useBlogPost(slug || "");

  if (isLoading) return <DetailSkeleton />;

  if (error || !post) {
    return (
      <div className="container mx-auto px-4 py-12">
        <ErrorState
          title="Post not found"
          message="The blog post you are looking for does not exist or has been removed."
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Header */}
      <section className="bg-gradient-to-br from-nrb-950 via-nrb-900 to-primary py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <Link
            to="/blog"
            className="mb-6 inline-flex items-center gap-1 text-sm text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Blog
          </Link>

          {post.category && (
            <Badge variant="secondary" className="mb-4">
              {post.category}
            </Badge>
          )}

          <h1 className="text-3xl font-bold tracking-tight text-white lg:text-4xl">
            {post.title}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-white/60">
            {post.authorId && (
              <span className="flex items-center gap-1">
                <User className="h-4 w-4" />
                Author
              </span>
            )}
            {post.publishedAt && (
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(post.publishedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          {post.coverImageUrl && (
            <img
              src={post.coverImageUrl}
              alt={post.title}
              className="mb-8 w-full rounded-lg object-cover"
            />
          )}

          {post.excerpt && (
            <p className="mb-8 text-lg text-muted-foreground italic border-l-4 border-primary pl-4">
              {post.excerpt}
            </p>
          )}

          <article className="prose prose-lg max-w-none">
            {post.content.split("\n").map((paragraph, idx) =>
              paragraph.trim() ? (
                <p key={idx} className="text-muted-foreground leading-relaxed">
                  {paragraph}
                </p>
              ) : null
            )}
          </article>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-12 border-t pt-8">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Tags:</span>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Back link */}
          <div className="mt-12 border-t pt-8">
            <Link
              to="/blog"
              className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to all posts
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
