import { Loader2 } from "lucide-react";

export interface SpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  label?: string;
}

export default function Spinner({
  size = "md",
  className = "",
  label,
}: SpinnerProps) {
  const sizes = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
    xl: "h-12 w-12",
  };

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <Loader2
        className={`animate-spin text-primary ${sizes[size]} ${className}`}
      />
      {label && (
        <span className="text-sm text-text-secondary">{label}</span>
      )}
    </div>
  );
}

export function PageSpinner({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Spinner size="lg" label={label} />
    </div>
  );
}

export function FullPageSpinner({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <Spinner size="xl" label={label} />
    </div>
  );
}
