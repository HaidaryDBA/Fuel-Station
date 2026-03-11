import type { HTMLAttributes, ReactNode } from "react";

export interface CardTitleProps extends HTMLAttributes<HTMLDivElement> {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  children: ReactNode;
  description?: string;
  action?: ReactNode;
}

export default function CardTitle({
  as: Component = "h3",
  children,
  description,
  action,
  className = "",
  ...props
}: CardTitleProps) {
  const baseStyles = "text-text-primary font-semibold";

  const sizes = {
    h1: "text-2xl",
    h2: "text-xl",
    h3: "text-lg",
    h4: "text-base",
    h5: "text-sm",
    h6: "text-xs",
  };

  return (
    <div className={`flex flex-col gap-1 ${className}`} {...props}>
      <div className="flex items-center justify-between gap-4">
        <Component className={`${baseStyles} ${sizes[Component]}`}>
          {children}
        </Component>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
      {description && (
        <p className="text-sm text-text-secondary leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}
