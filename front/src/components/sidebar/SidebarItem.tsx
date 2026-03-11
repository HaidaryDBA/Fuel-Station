import { useState, useRef, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChevronDown, ChevronRight, type LucideIcon } from "lucide-react";
import { useSidebarState, type SubNavItem } from "./useSidebarState";

export interface SidebarItemProps {
  path: string;
  label: string;
  icon: LucideIcon;
  badge?: number | string;
  subItems?: SubNavItem[];
  divider?: boolean;
}

/**
 * Sidebar Navigation Item
 * Main navigation item with optional collapsible sub-items
 */
export default function SidebarItem({
  path,
  label,
  icon: Icon,
  badge,
  subItems,
  divider = false,
}: SidebarItemProps) {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const { isCollapsed, expandedItems, toggleItem } = useSidebarState();
  const [isExpanded, setIsExpanded] = useState(expandedItems.includes(path));
  const [showPopover, setShowPopover] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLAnchorElement>(null);

  const hasSubItems = subItems && subItems.length > 0;

  const getMostSpecificSubItemPath = (currentPath: string, items: SubNavItem[]) => {
    const matches = items
      .filter(
        (item) =>
          currentPath === item.path || currentPath.startsWith(`${item.path}/`)
      )
      .sort((a, b) => b.path.length - a.path.length);
    return matches[0]?.path ?? null;
  };

  const activeSubItemPath = hasSubItems
    ? getMostSpecificSubItemPath(pathname, subItems)
    : null;

  const isSubItemActive = (subItemPath: string) => activeSubItemPath === subItemPath;

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        buttonRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowPopover(false);
      }
    };

    if (showPopover) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showPopover]);

  const handleToggle = (e: React.MouseEvent) => {
    if (hasSubItems) {
      e.preventDefault();
      if (isCollapsed) {
        // Show popover when collapsed
        setShowPopover(!showPopover);
      } else {
        // Expand/collapse normally when not collapsed
        const newState = !isExpanded;
        setIsExpanded(newState);
        toggleItem(path);
      }
    }
  };

  const itemContent = () => (
    <>
      <div className="flex flex-1 items-center gap-3">
        <Icon className="h-5 w-5 flex-shrink-0" />
        {!isCollapsed && (
          <span className="text-sm font-medium">
            {t(`mis.nav.${label.toLowerCase()}`, label)}
          </span>
        )}
      </div>

      {/* Badge */}
      {!isCollapsed && badge !== undefined && (
        <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary/20 px-1.5 text-xs font-semibold text-primary">
          {badge}
        </span>
      )}

      {/* Chevron for sub-items */}
      {!isCollapsed && hasSubItems && (
        <div className="flex-shrink-0 transition-transform duration-200">
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </div>
      )}
    </>
  );

  return (
    <>
      <li className="relative">
        <NavLink
          ref={buttonRef}
          to={hasSubItems ? "#" : path}
          end={path === "/mis"}
          onClick={handleToggle}
          className={({ isActive }) =>
            `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 overflow-hidden ${
              isCollapsed ? "justify-center" : ""
            } ${
              isActive && !hasSubItems
                ? "bg-gradient-to-r from-primary to-primary-dark text-white shadow-lg shadow-primary/30"
                : "text-slate-300 hover:bg-white/10 hover:text-white active:scale-[0.98]"
            }`
          }
        >
          {/* Active indicator */}
          {({ isActive }) => (
            <>
              {isActive && !hasSubItems && (
                <div className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-white" />
              )}
              {itemContent()}
            </>
          )}
        </NavLink>

        {/* Popover for collapsed sidebar with subitems */}
        {isCollapsed && hasSubItems && showPopover && (
          <div
            ref={popoverRef}
            className="fixed left-20 z-50 min-w-[200px] rounded-xl border border-white/10 bg-slate-900 shadow-2xl"
            style={{
              top: buttonRef.current?.getBoundingClientRect().top || 0,
            }}
          >
            <div className="border-b border-white/10 px-4 py-2">
              <p className="text-sm font-semibold text-white">{label}</p>
            </div>
            <ul className="p-2 space-y-0.5">
              {subItems.map((subItem) => (
                <li key={subItem.id}>
                  <NavLink
                    to={subItem.path}
                    onClick={() => setShowPopover(false)}
                    className={
                      `flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-all duration-150 ${
                        isSubItemActive(subItem.path)
                          ? "bg-primary/20 text-primary"
                          : "text-slate-300 hover:bg-white/5 hover:text-white"
                      }`
                    }
                  >
                    {subItem.icon && <subItem.icon className="h-3.5 w-3.5 flex-shrink-0" />}
                    <span className="flex-1">{t(`mis.nav.${subItem.label.toLowerCase().replace(/\s+/g, '')}`, subItem.label)}</span>
                    {subItem.quickAction && (
                      <span className="flex h-4 items-center rounded-full bg-gradient-to-r from-success to-success/80 px-1.5 text-[9px] font-bold text-white shadow-sm">
                        Quick
                      </span>
                    )}
                  </NavLink>
                  {/* Tertiary items in popover */}
                  {subItem.children && subItem.children.length > 0 && (
                    <ul className="mt-1 ml-6 space-y-0.5">
                      {subItem.children.map((child) => (
                        <li key={child.id}>
                          <NavLink
                            to={child.path}
                            onClick={() => setShowPopover(false)}
                            className={({ isActive }) =>
                              `flex items-center gap-2 rounded-md px-3 py-1.5 text-xs transition-all duration-150 ${
                                isActive
                                  ? "text-primary font-semibold"
                                  : "text-slate-400 hover:text-white"
                              }`
                            }
                          >
                            <span className="h-1 w-1 rounded-full bg-current" />
                            <span>{t(`mis.nav.${child.label.toLowerCase()}`, child.label)}</span>
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Sub-items (collapsible) */}
        {!isCollapsed && hasSubItems && isExpanded && (
          <ul className="mt-1.5 space-y-0.5 border-l-2 border-white/10 pl-3 ml-6 py-1">
            {subItems.map((subItem) => (
              <li key={subItem.id}>
                <NavLink
                  to={subItem.path}
                  className={
                    `flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-all duration-150 ${
                      isSubItemActive(subItem.path)
                        ? "bg-primary/20 text-primary border-l-2 border-primary -ml-[2px] pl-[10px] shadow-sm"
                        : "text-slate-400 hover:bg-white/5 hover:text-white hover:pl-1"
                    }`
                  }
                >
                  {subItem.icon && <subItem.icon className="h-3.5 w-3.5 flex-shrink-0" />}
                  <span className="flex-1">{t(`mis.nav.${subItem.label.toLowerCase().replace(/\s+/g, '')}`, subItem.label)}</span>
                  {subItem.quickAction && (
                    <span className="flex h-4 items-center rounded-full bg-gradient-to-r from-success to-success/80 px-1.5 text-[9px] font-bold text-white shadow-sm">
                      Quick
                    </span>
                  )}
                </NavLink>

                {/* Tertiary items (children) */}
                {subItem.children && subItem.children.length > 0 && (
                  <ul className="mt-1 ml-4 space-y-0.5 border-l border-white/5 pl-3">
                    {subItem.children.map((child) => (
                      <li key={child.id}>
                        <NavLink
                          to={child.path}
                          className={({ isActive }) =>
                            `flex items-center gap-2 rounded-md px-3 py-1.5 text-xs transition-all duration-150 ${
                              isActive
                                ? "text-primary font-semibold"
                                : "text-slate-500 hover:text-white hover:bg-white/5"
                            }`
                          }
                        >
                          <span className="h-1 w-1 rounded-full bg-current" />
                          <span>{t(`mis.nav.${child.label.toLowerCase()}`, child.label)}</span>
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        )}
      </li>

      {/* Divider */}
      {divider && !isCollapsed && (
        <li className="my-2">
          <div className="h-px bg-sidebar-hover/50" />
        </li>
      )}
    </>
  );
}
