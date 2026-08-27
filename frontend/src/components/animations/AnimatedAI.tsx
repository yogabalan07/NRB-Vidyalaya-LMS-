import { cn } from "@/lib/utils";

interface AnimatedAIProps {
  className?: string;
  size?: number;
  state?: "idle" | "thinking" | "typing" | "speaking" | "success";
}

export function AnimatedAI({ className, size = 80, state = "idle" }: AnimatedAIProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      className={cn(className)}
    >
      {/* Head circle */}
      <circle cx="40" cy="35" r="20" fill="hsl(var(--primary) / 0.1)" stroke="hsl(var(--primary))" strokeWidth="2">
        {state === "thinking" && (
          <animate attributeName="r" values="20;21;20" dur="1s" repeatCount="indefinite" />
        )}
      </circle>
      {/* Eyes */}
      <circle cx="33" cy="32" r="2.5" fill="hsl(var(--primary))">
        {state === "thinking" && (
          <animate attributeName="cy" values="32;30;32" dur="2s" repeatCount="indefinite" />
        )}
      </circle>
      <circle cx="47" cy="32" r="2.5" fill="hsl(var(--primary))">
        {state === "thinking" && (
          <animate attributeName="cy" values="32;30;32" dur="2s" repeatCount="indefinite" />
        )}
      </circle>
      {/* Mouth */}
      {state === "speaking" ? (
        <ellipse cx="40" cy="42" rx="4" ry="2" fill="hsl(var(--primary))">
          <animate attributeName="ry" values="2;3;2" dur="0.5s" repeatCount="indefinite" />
        </ellipse>
      ) : state === "success" ? (
        <path d="M33 42 L38 47 L47 37" stroke="hsl(142, 71%, 45%)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
          <animate attributeName="stroke-dashoffset" from="24" to="0" dur="0.5s" fill="freeze" />
          <animate attributeName="stroke-dasharray" from="0 24" to="24 0" dur="0.5s" fill="freeze" />
        </path>
      ) : (
        <path d="M34 42 Q40 46 46 42" stroke="hsl(var(--primary))" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      )}
      {/* Antenna / Sparkle */}
      <line x1="40" y1="15" x2="40" y2="8" stroke="hsl(var(--primary))" strokeWidth="1.5" opacity="0.5" />
      <circle cx="40" cy="6" r="2" fill="hsl(var(--accent))">
        {state === "thinking" && (
          <animate attributeName="opacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite" />
        )}
      </circle>
      {/* Body */}
      <rect x="28" y="55" width="24" height="18" rx="4" fill="hsl(var(--primary) / 0.1)" stroke="hsl(var(--primary))" strokeWidth="1.5" />
      {/* Circuit lines on body */}
      <line x1="34" y1="62" x2="46" y2="62" stroke="hsl(var(--primary))" strokeWidth="1" opacity="0.3" />
      <line x1="34" y1="66" x2="42" y2="66" stroke="hsl(var(--primary))" strokeWidth="1" opacity="0.3" />
      {/* Thinking dots */}
      {state === "thinking" && (
        <>
          <circle cx="55" cy="28" r="2" fill="hsl(var(--primary))" opacity="0.6">
            <animate attributeName="opacity" values="0.2;0.8;0.2" dur="1.2s" begin="0s" repeatCount="indefinite" />
          </circle>
          <circle cx="60" cy="24" r="2.5" fill="hsl(var(--primary))" opacity="0.6">
            <animate attributeName="opacity" values="0.2;0.8;0.2" dur="1.2s" begin="0.2s" repeatCount="indefinite" />
          </circle>
          <circle cx="65" cy="20" r="3" fill="hsl(var(--primary))" opacity="0.6">
            <animate attributeName="opacity" values="0.2;0.8;0.2" dur="1.2s" begin="0.4s" repeatCount="indefinite" />
          </circle>
        </>
      )}
    </svg>
  );
}
