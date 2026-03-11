import { TrendingUp, TrendingDown, type LucideIcon } from "lucide-react";

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color?: "primary" | "success" | "warning" | "error" | "info";
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  subtitle?: string;
}

const colorClasses = {
  primary: "bg-primary/10 text-primary",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  error: "bg-error-soft text-error",
  info: "bg-info-soft text-info",
};

export default function DashboardCard({
  title,
  value,
  icon: Icon,
  color = "primary",
  trend,
  subtitle,
}: DashboardCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 transition-all duration-200 hover:shadow-lg">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-text-secondary">
            {title}
          </p>
          <p className="mt-2 text-3xl font-bold text-text-primary">
            {value}
          </p>
          {trend && (
            <div className="mt-2 flex items-center gap-1.5">
              {trend.isPositive ? (
                <TrendingUp className="h-4 w-4 text-success" />
              ) : (
                <TrendingDown className="h-4 w-4 text-error" />
              )}
              <span
                className={`text-sm font-medium ${
                  trend.isPositive ? "text-success" : "text-error"
                }`}
              >
                {trend.value}%
              </span>
              {trend.label && (
                <span className="text-sm text-text-secondary">
                  {trend.label}
                </span>
              )}
            </div>
          )}
          {subtitle && !trend && (
            <p className="mt-2 text-sm text-text-secondary">{subtitle}</p>
          )}
        </div>
        <div className={`rounded-xl p-3 ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}
