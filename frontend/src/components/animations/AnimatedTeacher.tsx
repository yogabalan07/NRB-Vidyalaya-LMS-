import { cn } from "@/lib/utils";

interface AnimatedTeacherProps {
  className?: string;
  size?: number;
}

export function AnimatedTeacher({ className, size = 80 }: AnimatedTeacherProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      className={cn("animate-float-slow", className)}
    >
      {/* Head */}
      <circle cx="40" cy="28" r="14" fill="hsl(var(--primary) / 0.1)" stroke="hsl(var(--primary))" strokeWidth="1.5" />
      {/* Glasses */}
      <circle cx="35" cy="26" r="4" stroke="hsl(var(--primary))" strokeWidth="1" fill="none" opacity="0.6" />
      <circle cx="45" cy="26" r="4" stroke="hsl(var(--primary))" strokeWidth="1" fill="none" opacity="0.6" />
      <line x1="39" y1="26" x2="41" y2="26" stroke="hsl(var(--primary))" strokeWidth="1" opacity="0.6" />
      {/* Smile */}
      <path d="M36 33 Q40 37 44 33" stroke="hsl(var(--primary))" strokeWidth="1" fill="none" strokeLinecap="round" />
      {/* Body */}
      <rect x="28" y="42" width="24" height="20" rx="4" fill="hsl(var(--primary) / 0.08)" stroke="hsl(var(--primary))" strokeWidth="1.5" />
      {/* Pointer */}
      <line x1="52" y1="50" x2="65" y2="38" stroke="hsl(var(--accent))" strokeWidth="1.5" strokeLinecap="round">
        <animate attributeName="x2" values="65;67;65" dur="2s" repeatCount="indefinite" />
        <animate attributeName="y2" values="38;36;38" dur="2s" repeatCount="indefinite" />
      </line>
      {/* Book in hand */}
      <rect x="18" y="48" width="10" height="8" rx="1" fill="hsl(var(--accent) / 0.3)" stroke="hsl(var(--accent))" strokeWidth="1" />
    </svg>
  );
}
