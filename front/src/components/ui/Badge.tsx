import type { HTMLAttributes, ReactNode } from "react";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "primary" | "secondary" | "success" | "warning" | "error" | "danger" | "info" | "outline";
  size?: "sm" | "md" | "lg";
  dot?: boolean;
  icon?: ReactNode;
}

export default function Badge({
  variant = "default",
  size = "md",
  dot = false,
  icon,
  className = "",
  children,
  ...props
}: BadgeProps) {
  const baseStyles =
    "inline-flex items-center gap-1.5 font-medium rounded-full transition-colors";

  const variants = {
    default: "bg-surface text-text-secondary border border-border",
    primary: "bg-primary/10 text-primary border border-primary/20",
    secondary: "bg-secondary/10 text-secondary border border-secondary/20",
    success: "bg-success-soft text-success border border-success/20",
    warning: "bg-warning-soft text-warning border border-warning/20",
    error: "bg-error-soft text-error border border-error/20",
    danger: "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800",
    info: "bg-info-soft text-info border border-info/20",
    outline: "bg-transparent text-text-primary border border-border-strong hover:bg-surface",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-xs",
    lg: "px-3 py-1.5 text-sm",
  };

  const dotColors = {
    default: "bg-muted",
    primary: "bg-primary",
    secondary: "bg-secondary",
    success: "bg-success",
    warning: "bg-warning",
    error: "bg-error",
    danger: "bg-red-600 dark:bg-red-500",
    info: "bg-info",
    outline: "bg-text-secondary",
  };

  return (
    <span
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {dot && (
        <span
          className={`h-1.5 w-1.5 rounded-full ${dotColors[variant]}`}
        />
      )}
      {icon}
      {children}
    </span>
  );
}
