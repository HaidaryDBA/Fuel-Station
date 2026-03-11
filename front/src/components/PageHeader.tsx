import type { ReactNode } from "react";
import { Button, type ButtonProps } from "./ui";

interface PageHeaderAction {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  variant?: ButtonProps["variant"];
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: PageHeaderAction[];
  breadcrumb?: ReactNode;
}

export default function PageHeader({
  title,
  subtitle,
  actions,
  breadcrumb,
}: PageHeaderProps) {
  return (
    <div className="mb-6">
      {breadcrumb && <div className="mb-2">{breadcrumb}</div>}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">{title}</h1>
          {subtitle && (
            <p className="mt-1 text-sm text-text-secondary">{subtitle}</p>
          )}
        </div>
        {actions && actions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {actions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || "primary"}
                leftIcon={action.icon}
                onClick={action.onClick}
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
