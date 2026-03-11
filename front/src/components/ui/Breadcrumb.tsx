import { ChevronRight, Home } from "lucide-react";
import { Link } from "react-router-dom";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  showHome?: boolean;
  className?: string;
}

export default function Breadcrumb({
  items,
  showHome = true,
  className = "",
}: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex items-center gap-2 text-sm">
        {showHome && (
          <>
            <li>
              <Link
                to="/mis"
                className="flex items-center gap-1 text-text-secondary hover:text-primary transition-colors"
              >
                <Home className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
            </li>
            <ChevronRight className="h-4 w-4 text-muted" />
          </>
        )}

        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={index} className="flex items-center gap-2">
              {item.href && !isLast ? (
                <Link
                  to={item.href}
                  className="flex items-center gap-1 text-text-secondary hover:text-primary transition-colors"
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ) : (
                <span className={`flex items-center gap-1 ${isLast ? "text-text-primary font-medium" : "text-text-secondary"}`}>
                  {item.icon}
                  <span>{item.label}</span>
                </span>
              )}
              {!isLast && <ChevronRight className="h-4 w-4 text-muted" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
