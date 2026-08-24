import { useParams } from "react-router-dom";

export function BlogDetailsPage() {
  const { slug } = useParams<{ slug: string }>();

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold">Blog Post: {slug}</h1>
      <p className="mt-4 text-muted-foreground">
        Blog content will be loaded from the database.
      </p>
    </div>
  );
}
