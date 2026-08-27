import { cn } from "@/lib/utils";

interface PathStep {
  label: string;
  status: "completed" | "current" | "locked";
}

interface AnimatedLearningPathProps {
  steps: PathStep[];
  className?: string;
}

export function AnimatedLearningPath({ steps, className }: AnimatedLearningPathProps) {
  return (
    <div className={cn("relative", className)}>
      {steps.map((step, i) => (
        <div key={i} className="flex items-start gap-4 pb-6 last:pb-0">
          {/* Vertical line + node */}
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold transition-all",
                step.status === "completed" && "border-green-500 bg-green-500 text-white",
                step.status === "current" && "border-primary bg-primary text-primary-foreground animate-pulse-soft",
                step.status === "locked" && "border-muted bg-muted text-muted-foreground"
              )}
            >
              {step.status === "completed" ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" className="animate-check-draw" strokeDasharray="24" strokeDashoffset="0" />
                </svg>
              ) : (
                i + 1
              )}
            </div>
            {i < steps.length - 1 && (
              <div
                className={cn(
                  "w-0.5 flex-1 min-h-[24px]",
                  step.status === "completed" ? "bg-green-500" : "bg-border"
                )}
              />
            )}
          </div>
          {/* Content */}
          <div className="pt-0.5 pb-2">
            <p
              className={cn(
                "text-sm font-medium",
                step.status === "locked" && "text-muted-foreground"
              )}
            >
              {step.label}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
