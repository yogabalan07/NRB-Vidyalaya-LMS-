import { cn } from "@/lib/utils";

interface StaggerChildrenProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
}

export function StaggerChildren({
  children,
  className,
  staggerDelay = 100,
}: StaggerChildrenProps) {
  return (
    <div className={cn(className)}>
      {Array.isArray(children)
        ? children.map((child, i) => (
            <div
              key={i}
              className="animate-stagger-in"
              style={{ animationDelay: `${i * staggerDelay}ms` }}
            >
              {child}
            </div>
          ))
        : <div className="animate-stagger-in">{children}</div>
      }
    </div>
  );
}
