import { cn } from "@/lib/utils";

interface AnimatedVoiceWaveProps {
  className?: string;
  barCount?: number;
  isActive?: boolean;
}

export function AnimatedVoiceWave({
  className,
  barCount = 5,
  isActive = true,
}: AnimatedVoiceWaveProps) {
  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {Array.from({ length: barCount }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "w-1 rounded-full bg-current transition-all",
            isActive ? "animate-wave" : "h-1 opacity-30"
          )}
          style={{
            animationDelay: `${i * 0.15}s`,
            animationDuration: `${0.8 + (i % 3) * 0.2}s`,
            height: isActive ? undefined : "4px",
          }}
        />
      ))}
    </div>
  );
}
