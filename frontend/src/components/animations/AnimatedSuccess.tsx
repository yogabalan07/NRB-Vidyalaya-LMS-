import { cn } from "@/lib/utils";

interface AnimatedSuccessProps {
  className?: string;
  size?: number;
}

export function AnimatedSuccess({ className, size = 80 }: AnimatedSuccessProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      className={cn("animate-scale-in", className)}
    >
      {/* Outer circle */}
      <circle cx="40" cy="40" r="35" fill="hsl(142, 71%, 45% / 0.1)" stroke="hsl(142, 71%, 45%)" strokeWidth="2">
        <animate attributeName="r" values="0;35" dur="0.4s" fill="freeze" />
        <animate attributeName="opacity" values="0;1" dur="0.3s" fill="freeze" />
      </circle>
      {/* Inner circle */}
      <circle cx="40" cy="40" r="28" fill="hsl(142, 71%, 45% / 0.15)">
        <animate attributeName="r" values="0;28" dur="0.4s" begin="0.1s" fill="freeze" />
      </circle>
      {/* Checkmark */}
      <polyline
        points="26,40 35,50 54,30"
        stroke="hsl(142, 71%, 45%)"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        strokeDasharray="40"
        strokeDashoffset="40"
      >
        <animate attributeName="stroke-dashoffset" from="40" to="0" dur="0.5s" begin="0.3s" fill="freeze" />
      </polyline>
      {/* Sparkles */}
      <circle cx="15" cy="20" r="2" fill="hsl(var(--accent))" opacity="0">
        <animate attributeName="opacity" values="0;1;0" dur="1s" begin="0.5s" repeatCount="indefinite" />
      </circle>
      <circle cx="65" cy="18" r="1.5" fill="hsl(var(--accent))" opacity="0">
        <animate attributeName="opacity" values="0;1;0" dur="1s" begin="0.8s" repeatCount="indefinite" />
      </circle>
      <circle cx="60" cy="62" r="2" fill="hsl(var(--accent))" opacity="0">
        <animate attributeName="opacity" values="0;1;0" dur="1s" begin="1.1s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}
