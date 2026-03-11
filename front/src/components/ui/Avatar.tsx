import type { HTMLAttributes } from "react";
import { User } from "lucide-react";

export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt?: string | null;
  name?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  status?: "online" | "offline" | "away" | "busy";
}

export default function Avatar({
  src,
  alt,
  name,
  size = "md",
  status,
  className = "",
  ...props
}: AvatarProps) {
  const sizes = {
    xs: "h-6 w-6 text-xs",
    sm: "h-8 w-8 text-sm",
    md: "h-10 w-10 text-base",
    lg: "h-12 w-12 text-lg",
    xl: "h-16 w-16 text-xl",
  };

  const iconSizes = {
    xs: "h-3 w-3",
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
    xl: "h-8 w-8",
  };

  const statusSizes = {
    xs: "h-1.5 w-1.5",
    sm: "h-2 w-2",
    md: "h-2.5 w-2.5",
    lg: "h-3 w-3",
    xl: "h-4 w-4",
  };

  const statusColors = {
    online: "bg-success",
    offline: "bg-muted",
    away: "bg-warning",
    busy: "bg-error",
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={`relative inline-block ${className}`} {...props}>
      <div
        className={`${sizes[size]} flex items-center justify-center overflow-hidden rounded-full bg-primary/10 text-primary ring-2 ring-background`}
      >
        {src ? (
          <img
            src={src}
            alt={alt || name || "Avatar"}
            className="h-full w-full object-cover"
          />
        ) : name ? (
          <span className="font-semibold">{getInitials(name)}</span>
        ) : (
          <User className={iconSizes[size]} />
        )}
      </div>
      {status && (
        <span
          className={`absolute bottom-0 right-0 block rounded-full ring-2 ring-background ${statusSizes[size]} ${statusColors[status]}`}
        />
      )}
    </div>
  );
}
