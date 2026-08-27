import { cn } from "@/lib/utils";

interface AnimatedHindiLettersProps {
  className?: string;
  letters?: string[];
}

const defaultLetters = ["अ", "आ", "इ", "ई", "उ", "ऊ", "ए", "ऐ", "ओ", "औ"];

export function AnimatedHindiLetters({
  className,
  letters = defaultLetters,
}: AnimatedHindiLettersProps) {
  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      {letters.map((letter, i) => (
        <span
          key={i}
          className={cn(
            "absolute font-hindi text-white/10 select-none animate-float",
            i % 3 === 0 ? "text-4xl" : i % 2 === 0 ? "text-3xl" : "text-2xl"
          )}
          style={{
            left: `${5 + (i * 9)}%`,
            top: `${10 + ((i * 7) % 60)}%`,
            animationDelay: `${i * 0.4}s`,
            animationDuration: `${4 + (i % 3)}s`,
          }}
        >
          {letter}
        </span>
      ))}
    </div>
  );
}
