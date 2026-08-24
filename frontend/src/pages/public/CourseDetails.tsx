import { useParams } from "react-router-dom";
export function CourseDetailsPage() {
  const { slug } = useParams<{ slug: string }>();
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold">Course: {slug}</h1>
    </div>
  );
}
