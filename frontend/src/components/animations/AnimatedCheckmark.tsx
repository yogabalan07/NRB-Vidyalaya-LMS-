import { cn } from "@/lib/utils";

interface AnimatedCheckmarkProps {
  className?: string;
  size?: number;
  color?: string;
}

export function AnimatedCheckmark({
  className,
  size = 24,
  color = "hsl(142, 71%, 45%)",
}: AnimatedCheckmarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn(className)}
    >
      <polyline
        points="5 13 9 17 19 7"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="24"
        strokeDashoffset="24"
      >
        <animate attributeName="stroke-dashoffset" from="24" to="0" dur="0.4s" fill="freeze" />
      </polyline>
    </svg>
  );
}
