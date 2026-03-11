import type { HTMLAttributes } from "react";

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circular" | "rectangular" | "rounded";
  width?: string | number;
  height?: string | number;
  animation?: "pulse" | "wave" | "none";
}

export default function Skeleton({
  variant = "text",
  width,
  height,
  animation = "pulse",
  className = "",
  ...props
}: SkeletonProps) {
  const baseStyles = "bg-border";

  const variants = {
    text: "rounded",
    circular: "rounded-full",
    rectangular: "rounded-none",
    rounded: "rounded-lg",
  };

  const animations = {
    pulse: "animate-pulse",
    wave: "animate-[shimmer_2s_infinite]",
    none: "",
  };

  const defaultDimensions = {
    text: { width: "100%", height: "1rem" },
    circular: { width: "2.5rem", height: "2.5rem" },
    rectangular: { width: "100%", height: "6rem" },
    rounded: { width: "100%", height: "6rem" },
  };

  const style = {
    width: width ?? defaultDimensions[variant].width,
    height: height ?? defaultDimensions[variant].height,
  };

  return (
    <div
      className={`${baseStyles} ${variants[variant]} ${animations[animation]} ${className}`}
      style={style}
      {...props}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center gap-4">
        <Skeleton variant="circular" width={48} height={48} />
        <div className="flex-1 space-y-2">
          <Skeleton width="60%" height={16} />
          <Skeleton width="40%" height={12} />
        </div>
      </div>
      <div className="mt-4 space-y-3">
        <Skeleton height={12} />
        <Skeleton height={12} />
        <Skeleton width="80%" height={12} />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      <div className="flex gap-4 border-b border-border pb-3">
        <Skeleton width={40} height={20} />
        <Skeleton width="30%" height={20} />
        <Skeleton width="20%" height={20} />
        <Skeleton width="20%" height={20} />
        <Skeleton width="15%" height={20} />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 py-2">
          <Skeleton variant="circular" width={32} height={32} />
          <Skeleton width="30%" height={16} />
          <Skeleton width="20%" height={16} />
          <Skeleton width="20%" height={16} />
          <Skeleton width="15%" height={16} />
        </div>
      ))}
    </div>
  );
}
