import { Menu, X } from "lucide-react";
import { useSidebarState } from "./useSidebarState";
import { useTranslation } from "react-i18next";

interface SidebarToggleProps {
  className?: string;
}

/**
 * Sidebar Toggle Button
 * Toggles sidebar collapsed/expanded state
 */
export default function SidebarToggle({ className = "" }: SidebarToggleProps) {
  const { isCollapsed, toggleCollapse } = useSidebarState();
  const { t } = useTranslation();

  return (
    <button
      onClick={toggleCollapse}
      className={`flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-slate-300 transition-all duration-200 hover:bg-white/10 hover:text-white active:scale-95 ${className}`}
      aria-label={isCollapsed ? t("sidebar.expand") : t("sidebar.collapse")}
      title={isCollapsed ? t("sidebar.expand") : t("sidebar.collapse")}
    >
      {isCollapsed ? (
        <Menu className="h-5 w-5" />
      ) : (
        <X className="h-5 w-5" />
      )}
    </button>
  );
}
