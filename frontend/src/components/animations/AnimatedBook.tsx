import { cn } from "@/lib/utils";

interface AnimatedBookProps {
  className?: string;
  size?: number;
}

export function AnimatedBook({ className, size = 120 }: AnimatedBookProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      className={cn("animate-float", className)}
    >
      {/* Book body */}
      <rect x="20" y="25" width="80" height="70" rx="4" fill="hsl(var(--primary) / 0.15)" stroke="hsl(var(--primary))" strokeWidth="2" />
      {/* Spine */}
      <line x1="60" y1="25" x2="60" y2="95" stroke="hsl(var(--primary))" strokeWidth="2" opacity="0.5" />
      {/* Left page lines */}
      <line x1="30" y1="40" x2="52" y2="40" stroke="hsl(var(--primary))" strokeWidth="1.5" opacity="0.3" strokeLinecap="round">
        <animate attributeName="stroke-dashoffset" from="22" to="0" dur="1s" fill="freeze" />
        <animate attributeName="stroke-dasharray" from="0 22" to="22 0" dur="1s" fill="freeze" />
      </line>
      <line x1="30" y1="50" x2="48" y2="50" stroke="hsl(var(--primary))" strokeWidth="1.5" opacity="0.3" strokeLinecap="round">
        <animate attributeName="stroke-dashoffset" from="18" to="0" dur="1s" begin="0.2s" fill="freeze" />
        <animate attributeName="stroke-dasharray" from="0 18" to="18 0" dur="1s" begin="0.2s" fill="freeze" />
      </line>
      <line x1="30" y1="60" x2="50" y2="60" stroke="hsl(var(--primary))" strokeWidth="1.5" opacity="0.3" strokeLinecap="round">
        <animate attributeName="stroke-dashoffset" from="20" to="0" dur="1s" begin="0.4s" fill="freeze" />
        <animate attributeName="stroke-dasharray" from="0 20" to="20 0" dur="1s" begin="0.4s" fill="freeze" />
      </line>
      {/* Right page lines */}
      <line x1="68" y1="40" x2="90" y2="40" stroke="hsl(var(--primary))" strokeWidth="1.5" opacity="0.3" strokeLinecap="round">
        <animate attributeName="stroke-dashoffset" from="22" to="0" dur="1s" begin="0.3s" fill="freeze" />
        <animate attributeName="stroke-dasharray" from="0 22" to="22 0" dur="1s" begin="0.3s" fill="freeze" />
      </line>
      <line x1="68" y1="50" x2="86" y2="50" stroke="hsl(var(--primary))" strokeWidth="1.5" opacity="0.3" strokeLinecap="round">
        <animate attributeName="stroke-dashoffset" from="18" to="0" dur="1s" begin="0.5s" fill="freeze" />
        <animate attributeName="stroke-dasharray" from="0 18" to="18 0" dur="1s" begin="0.5s" fill="freeze" />
      </line>
      <line x1="68" y1="60" x2="88" y2="60" stroke="hsl(var(--primary))" strokeWidth="1.5" opacity="0.3" strokeLinecap="round">
        <animate attributeName="stroke-dashoffset" from="20" to="0" dur="1s" begin="0.7s" fill="freeze" />
        <animate attributeName="stroke-dasharray" from="0 20" to="20 0" dur="1s" begin="0.7s" fill="freeze" />
      </line>
      {/* Hindi character on page */}
      <text x="78" y="80" fill="hsl(var(--primary))" fontSize="14" fontFamily="Noto Sans Devanagari" opacity="0.6">
        हिं
        <animate attributeName="opacity" from="0" to="0.6" dur="1.5s" begin="0.8s" fill="freeze" />
      </text>
    </svg>
  );
}
