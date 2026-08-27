import { cn } from "@/lib/utils";

interface AnimatedCertificateProps {
  className?: string;
  size?: number;
}

export function AnimatedCertificate({ className, size = 120 }: AnimatedCertificateProps) {
  return (
    <svg
      width={size}
      height={size * 0.75}
      viewBox="0 0 120 90"
      fill="none"
      className={cn("animate-scale-in", className)}
    >
      {/* Certificate body */}
      <rect x="10" y="10" width="100" height="65" rx="4" fill="hsl(var(--card))" stroke="hsl(var(--primary))" strokeWidth="1.5" />
      {/* Border decoration */}
      <rect x="16" y="16" width="88" height="53" rx="2" fill="none" stroke="hsl(var(--primary) / 0.2)" strokeWidth="1" strokeDasharray="4 2" />
      {/* Title */}
      <text x="60" y="34" textAnchor="middle" fill="hsl(var(--primary))" fontSize="8" fontWeight="bold" fontFamily="Inter">
        CERTIFICATE
      </text>
      {/* Decorative line */}
      <line x1="30" y1="40" x2="90" y2="40" stroke="hsl(var(--primary) / 0.3)" strokeWidth="0.5" />
      {/* Text lines */}
      <rect x="28" y="46" width="64" height="2" rx="1" fill="hsl(var(--muted-foreground) / 0.3)" />
      <rect x="38" y="52" width="44" height="2" rx="1" fill="hsl(var(--muted-foreground) / 0.2)" />
      <rect x="32" y="58" width="56" height="2" rx="1" fill="hsl(var(--muted-foreground) / 0.15)" />
      {/* Ribbon */}
      <polygon points="55,75 60,85 65,75" fill="hsl(var(--accent))" opacity="0.8">
        <animate attributeName="opacity" values="0.6;1;0.6" dur="3s" repeatCount="indefinite" />
      </polygon>
      {/* Star */}
      <polygon
        points="60,2 61.5,6 66,6.5 62.5,9.5 63.5,14 60,11.5 56.5,14 57.5,9.5 54,6.5 58.5,6"
        fill="hsl(var(--accent))"
      >
        <animate attributeName="opacity" values="0.7;1;0.7" dur="2s" repeatCount="indefinite" />
      </polygon>
      {/* Sparkles */}
      <circle cx="20" cy="20" r="1.5" fill="hsl(var(--accent))" opacity="0">
        <animate attributeName="opacity" values="0;1;0" dur="2s" begin="0.5s" repeatCount="indefinite" />
      </circle>
      <circle cx="100" cy="18" r="1" fill="hsl(var(--accent))" opacity="0">
        <animate attributeName="opacity" values="0;1;0" dur="2s" begin="1s" repeatCount="indefinite" />
      </circle>
      <circle cx="95" cy="65" r="1.5" fill="hsl(var(--accent))" opacity="0">
        <animate attributeName="opacity" values="0;1;0" dur="2s" begin="1.5s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}
