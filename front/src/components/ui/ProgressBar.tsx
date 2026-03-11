import type { HTMLAttributes } from "react";

export interface ProgressBarProps extends HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  variant?: "default" | "success" | "warning" | "error" | "info";
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  animated?: boolean;
}

export default function ProgressBar({
  value,
  max = 100,
  variant = "default",
  size = "md",
  showLabel = false,
  animated = true,
  className = "",
  ...props
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const variants = {
    default: "bg-primary",
    success: "bg-success",
    warning: "bg-warning",
    error: "bg-error",
    info: "bg-info",
  };

  const sizes = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-4",
  };

  return (
    <div className={`w-full ${className}`} {...props}>
      {showLabel && (
        <div className="mb-1 flex justify-between text-sm">
          <span className="text-text-secondary">Progress</span>
          <span className="font-medium text-text-primary">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
      <div
        className={`w-full overflow-hidden rounded-full bg-border ${sizes[size]}`}
      >
        <div
          className={`${sizes[size]} rounded-full transition-all duration-500 ease-out ${variants[variant]} ${
            animated ? "animate-[progress_1s_ease-out]" : ""
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
