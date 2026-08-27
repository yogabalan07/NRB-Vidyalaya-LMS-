import { cn } from "@/lib/utils";

interface AnimatedPencilProps {
  className?: string;
  size?: number;
}

export function AnimatedPencil({ className, size = 80 }: AnimatedPencilProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      className={cn("animate-float", className)}
      style={{ animationDelay: "0.5s" }}
    >
      {/* Pencil body */}
      <rect x="30" y="10" width="8" height="50" rx="1" fill="hsl(var(--accent))" opacity="0.9">
        <animate attributeName="y" values="10;8;10" dur="3s" repeatCount="indefinite" />
      </rect>
      {/* Pencil tip */}
      <polygon points="30,60 38,60 34,70" fill="hsl(var(--accent) / 0.7)">
        <animate attributeName="points" values="30,60 38,60 34,70;30,58 38,58 34,68;30,60 38,60 34,70" dur="3s" repeatCount="indefinite" />
      </polygon>
      {/* Pencil top */}
      <rect x="30" y="8" width="8" height="5" rx="1" fill="hsl(var(--accent) / 0.6)">
        <animate attributeName="y" values="8;6;8" dur="3s" repeatCount="indefinite" />
      </rect>
      {/* Underline being drawn */}
      <line x1="20" y1="72" x2="60" y2="72" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round" strokeDasharray="40" strokeDashoffset="40" opacity="0.5">
        <animate attributeName="stroke-dashoffset" from="40" to="0" dur="2s" begin="0.5s" fill="freeze" />
      </line>
    </svg>
  );
}
