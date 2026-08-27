import { cn } from "@/lib/utils";

interface AnimatedStarsProps {
  className?: string;
  count?: number;
}

export function AnimatedStars({ className, count = 5 }: AnimatedStarsProps) {
  return (
    <div className={cn("relative", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <svg
          key={i}
          className="absolute animate-sparkle"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${i * 0.5}s`,
            animationDuration: `${2 + (i % 3)}s`,
          }}
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="hsl(var(--accent))"
        >
          <polygon points="12,2 14,9 21,9 15.5,13.5 17.5,21 12,16.5 6.5,21 8.5,13.5 3,9 10,9" />
        </svg>
      ))}
    </div>
  );
}
