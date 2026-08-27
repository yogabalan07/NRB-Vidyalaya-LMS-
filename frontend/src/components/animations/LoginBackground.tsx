import { cn } from "@/lib/utils";

interface LoginBackgroundProps {
  variant?: "student" | "teacher" | "admin";
  className?: string;
}

const variantColors = {
  student: {
    accent: "hsl(var(--saffron))",
    accentFade: "hsl(var(--saffron) / 0.06)",
    letters: "text-saffron/10",
  },
  teacher: {
    accent: "hsl(var(--primary))",
    accentFade: "hsl(var(--primary) / 0.06)",
    letters: "text-primary/10",
  },
  admin: {
    accent: "hsl(var(--nrb-600))",
    accentFade: "hsl(var(--nrb-600) / 0.06)",
    letters: "text-nrb-600/10",
  },
};

const floatingLetters = ["अ", "आ", "इ", "ई", "उ", "ऊ", "ए", "ऐ", "ओ", "औ", "क", "ख", "ग", "घ"];

export function LoginBackground({ variant = "student", className }: LoginBackgroundProps) {
  const colors = variantColors[variant];

  return (
    <div className={cn("pointer-events-none fixed inset-0 overflow-hidden", className)}>
      <svg
        className="absolute -top-20 -right-20 h-80 w-80 opacity-[0.03]"
        viewBox="0 0 200 200"
        fill="none"
      >
        <circle cx="100" cy="100" r="80" stroke={colors.accent} strokeWidth="1" />
        <circle cx="100" cy="100" r="60" stroke={colors.accent} strokeWidth="0.5" />
        <circle cx="100" cy="100" r="40" stroke={colors.accent} strokeWidth="0.5" />
      </svg>

      <svg
        className="absolute -bottom-32 -left-32 h-96 w-96 opacity-[0.03]"
        viewBox="0 0 200 200"
        fill="none"
      >
        <rect x="20" y="20" width="160" height="160" rx="8" stroke={colors.accent} strokeWidth="1" />
        <rect x="50" y="50" width="100" height="100" rx="4" stroke={colors.accent} strokeWidth="0.5" />
      </svg>

      {floatingLetters.slice(0, 7).map((letter, i) => (
        <span
          key={i}
          className={cn(
            "absolute animate-float-slow select-none font-hindi",
            colors.letters,
            i % 3 === 0 ? "text-5xl" : i % 2 === 0 ? "text-4xl" : "text-3xl"
          )}
          style={{
            left: `${8 + i * 13}%`,
            top: `${15 + ((i * 11) % 70)}%`,
            animationDelay: `${i * 0.6}s`,
            animationDuration: `${5 + (i % 3)}s`,
          }}
        >
          {letter}
        </span>
      ))}

      <svg
        className="absolute top-1/4 right-[10%] h-16 w-16 animate-float opacity-[0.04]"
        viewBox="0 0 24 24"
        fill="none"
        style={{ animationDelay: "1s" }}
      >
        <path
          d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"
          stroke={colors.accent}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"
          stroke={colors.accent}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      <svg
        className="absolute bottom-[20%] left-[8%] h-12 w-12 animate-float opacity-[0.04]"
        viewBox="0 0 24 24"
        fill="none"
        style={{ animationDelay: "2s" }}
      >
        <path
          d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"
          stroke={colors.accent}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      <svg
        className="absolute top-[60%] right-[15%] h-10 w-10 animate-float opacity-[0.04]"
        viewBox="0 0 24 24"
        fill="none"
        style={{ animationDelay: "3s" }}
      >
        <polygon
          points="12,2 15,9 22,9 17,14 18.5,21 12,17 5.5,21 7,14 2,9 9,9"
          stroke={colors.accent}
          strokeWidth="1.5"
          fill="none"
        />
      </svg>
    </div>
  );
}
