import { type ReactNode } from "react";
import { CheckCircle2, AlertTriangle, Info, X, XCircle } from "lucide-react";

export interface AlertProps {
  variant?: "success" | "warning" | "error" | "info";
  title?: string;
  children: ReactNode;
  onClose?: () => void;
  className?: string;
}

export default function Alert({
  variant = "info",
  title,
  children,
  onClose,
  className = "",
}: AlertProps) {
  const variants = {
    success: {
      container: "bg-success-soft border-success text-success",
      icon: CheckCircle2,
    },
    warning: {
      container: "bg-warning-soft border-warning text-warning",
      icon: AlertTriangle,
    },
    error: {
      container: "bg-error-soft border-error text-error",
      icon: XCircle,
    },
    info: {
      container: "bg-info-soft border-info text-info",
      icon: Info,
    },
  };

  const config = variants[variant];
  const Icon = config.icon;

  return (
    <div
      className={`flex gap-3 p-4 border-l-4 rounded-lg ${config.container} ${className}`}
      role="alert"
    >
      <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        {title && <div className="font-semibold mb-1">{title}</div>}
        <div className="text-sm opacity-90">{children}</div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
          aria-label="Close alert"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
