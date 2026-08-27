import { cn } from "@/lib/utils";

interface AnimatedStudentProps {
  className?: string;
  size?: number;
}

export function AnimatedStudent({ className, size = 80 }: AnimatedStudentProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      className={cn("animate-float-slow", className)}
      style={{ animationDelay: "1s" }}
    >
      {/* Head */}
      <circle cx="40" cy="28" r="13" fill="hsl(var(--saffron) / 0.1)" stroke="hsl(var(--saffron))" strokeWidth="1.5" />
      {/* Happy eyes */}
      <path d="M34 26 Q35 24 36 26" stroke="hsl(var(--saffron))" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M44 26 Q45 24 46 26" stroke="hsl(var(--saffron))" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {/* Smile */}
      <path d="M36 32 Q40 36 44 32" stroke="hsl(var(--saffron))" strokeWidth="1" fill="none" strokeLinecap="round" />
      {/* Body */}
      <rect x="30" y="41" width="20" height="18" rx="4" fill="hsl(var(--saffron) / 0.08)" stroke="hsl(var(--saffron))" strokeWidth="1.5" />
      {/* Laptop */}
      <rect x="24" y="55" width="32" height="4" rx="1" fill="hsl(var(--saffron) / 0.2)" stroke="hsl(var(--saffron))" strokeWidth="1" />
      <rect x="28" y="48" width="24" height="8" rx="1" fill="hsl(var(--saffron) / 0.1)" stroke="hsl(var(--saffron))" strokeWidth="1" />
      {/* Screen glow */}
      <rect x="30" y="50" width="20" height="4" rx="0.5" fill="hsl(var(--primary) / 0.15)">
        <animate attributeName="opacity" values="0.3;0.6;0.3" dur="3s" repeatCount="indefinite" />
      </rect>
    </svg>
  );
}
