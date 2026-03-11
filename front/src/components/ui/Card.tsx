import type { HTMLAttributes, ReactNode } from "react";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "outlined" | "elevated";
  padding?: "none" | "sm" | "md" | "lg";
  hover?: boolean;
}

export function Card({
  variant = "default",
  padding = "md",
  hover = false,
  className = "",
  children,
  ...props
}: CardProps) {
  const baseStyles = "rounded-xl transition-all duration-200";

  const variants = {
    default: "bg-card border border-border",
    outlined: "bg-transparent border-2 border-border",
    elevated: "bg-card shadow-lg",
  };

  const paddings = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  const hoverStyles = hover
    ? "hover:shadow-lg hover:border-primary/30 cursor-pointer"
    : "";

  return (
    <div
      className={`${baseStyles} ${variants[variant]} ${paddings[padding]} ${hoverStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export interface CardHeaderProps {
  title?: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  className?: string;
  children?: ReactNode;
}

export function CardHeader({
  title,
  subtitle,
  action,
  className = "",
  children,
  ...props
}: CardHeaderProps) {
  return (
    <div
      className={`flex items-start justify-between ${className}`}
      {...props}
    >
      <div>
        {title && (
          <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
        )}
        {subtitle && (
          <p className="mt-1 text-sm text-text-secondary">{subtitle}</p>
        )}
        {children}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export interface CardContentProps extends HTMLAttributes<HTMLDivElement> {}

export function CardContent({
  className = "",
  children,
  ...props
}: CardContentProps) {
  return (
    <div className={`mt-4 ${className}`} {...props}>
      {children}
    </div>
  );
}

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {}

export function CardFooter({
  className = "",
  children,
  ...props
}: CardFooterProps) {
  return (
    <div
      className={`mt-4 flex items-center justify-end gap-3 border-t border-border pt-4 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export default Card;
