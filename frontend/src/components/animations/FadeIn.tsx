import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface FadeInProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
  duration?: "fast" | "normal" | "slow";
  as?: React.ElementType;
  once?: boolean;
  viewTriggerOffset?: number;
}

const directionClasses = {
  up: "animate-fade-in-up",
  down: "animate-fade-in-down",
  left: "animate-slide-in",
  right: "animate-slide-in-right",
};

const durationClasses = {
  fast: "duration-200",
  normal: "duration-400",
  slow: "duration-700",
};

export function FadeIn({
  children,
  className,
  delay = 0,
  direction = "up",
  duration = "normal",
  as: Component = "div",
  once = true,
  viewTriggerOffset = 0.1,
}: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      setIsVisible(true);
      return;
    }

    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsVisible(true);
          if (once) observer.unobserve(el);
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold: viewTriggerOffset }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [once, viewTriggerOffset]);

  return (
    <Component
      ref={ref}
      className={cn(
        isVisible && directionClasses[direction],
        isVisible && durationClasses[duration],
        isVisible && delay && `animation-delay-${delay}`,
        !isVisible && "opacity-0",
        className
      )}
    >
      {children}
    </Component>
  );
}
