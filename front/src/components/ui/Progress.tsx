import type { HTMLAttributes } from "react";

export interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  variant?: "default" | "primary" | "secondary" | "success" | "warning" | "error" | "info";
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export default function Progress({
  value = 0,
  max = 100,
  variant = "primary",
  size = "md",
  showLabel = false,
  className = "",
  ...props
}: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const baseStyles = "w-full rounded-full overflow-hidden bg-surface";

  const variants = {
    default: "bg-muted",
    primary: "bg-primary",
    secondary: "bg-secondary",
    success: "bg-success",
    warning: "bg-warning",
    error: "bg-error",
    info: "bg-info",
  };

  const sizes = {
    sm: "h-1",
    md: "h-2",
    lg: "h-3",
  };

  return (
    <div className="w-full">
      <div
        className={`${baseStyles} ${sizes[size]} ${className}`}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        {...props}
      >
        <div
          className={`h-full ${variants[variant]} transition-all duration-300 ease-in-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <div className="mt-1 text-xs text-text-secondary text-right">
          {Math.round(percentage)}%
        </div>
      )}
    </div>
  );
}
