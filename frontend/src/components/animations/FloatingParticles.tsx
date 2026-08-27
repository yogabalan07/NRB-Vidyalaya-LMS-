import { cn } from "@/lib/utils";

interface FloatingParticlesProps {
  className?: string;
  count?: number;
}

const particles = [
  { char: "📚", size: "text-lg", delay: 0 },
  { char: "✏️", size: "text-base", delay: 1 },
  { char: "⭐", size: "text-sm", delay: 2 },
  { char: "🎓", size: "text-lg", delay: 0.5 },
  { char: "📝", size: "text-base", delay: 1.5 },
  { char: "🌟", size: "text-sm", delay: 2.5 },
];

export function FloatingParticles({ className, count = 6 }: FloatingParticlesProps) {
  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      {particles.slice(0, count).map((p, i) => (
        <span
          key={i}
          className={cn(
            "absolute animate-float-slow opacity-20",
            p.size
          )}
          style={{
            left: `${15 + i * 15}%`,
            top: `${20 + (i % 3) * 25}%`,
            animationDelay: `${p.delay}s`,
          }}
        >
          {p.char}
        </span>
      ))}
    </div>
  );
}
