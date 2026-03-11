import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface SubNavItem {
  id: string;
  path: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  description?: string;
  quickAction?: boolean;
  children?: TertiaryNavItem[];
}

export interface TertiaryNavItem {
  id: string;
  path: string;
  label: string;
}

interface SidebarState {
  // Sidebar collapse state
  isCollapsed: boolean;

  // Mobile sidebar state
  isMobileOpen: boolean;

  // Expanded items (for collapsible sub-menus)
  expandedItems: string[];

  // Actions
  toggleCollapse: () => void;
  setCollapsed: (collapsed: boolean) => void;
  toggleMobile: () => void;
  openMobile: () => void;
  closeMobile: () => void;
  toggleItem: (path: string) => void;
  expandItem: (path: string) => void;
  collapseItem: (path: string) => void;
}

/**
 * Sidebar State Management
 * Handles sidebar collapse state and expanded menu items
 */
export const useSidebarState = create<SidebarState>()(
  persist(
    (set) => ({
      // Initial state
      isCollapsed: false,
      isMobileOpen: false,
      expandedItems: [],

      // Toggle sidebar collapsed state
      toggleCollapse: () =>
        set((state) => ({ isCollapsed: !state.isCollapsed })),

      // Set collapsed state directly
      setCollapsed: (collapsed: boolean) => set({ isCollapsed: collapsed }),

      // Mobile sidebar actions
      toggleMobile: () =>
        set((state) => ({ isMobileOpen: !state.isMobileOpen })),

      openMobile: () => set({ isMobileOpen: true }),

      closeMobile: () => set({ isMobileOpen: false }),

      // Toggle item expanded state
      toggleItem: (path: string) =>
        set((state) => ({
          expandedItems: state.expandedItems.includes(path)
            ? state.expandedItems.filter((item) => item !== path)
            : [...state.expandedItems, path],
        })),

      // Expand item
      expandItem: (path: string) =>
        set((state) => ({
          expandedItems: state.expandedItems.includes(path)
            ? state.expandedItems
            : [...state.expandedItems, path],
        })),

      // Collapse item
      collapseItem: (path: string) =>
        set((state) => ({
          expandedItems: state.expandedItems.filter((item) => item !== path),
        })),
    }),
    {
      name: "sidebar-state",
      // Persist collapse and expanded state
      partialize: (state) => ({
        isCollapsed: state.isCollapsed,
        expandedItems: state.expandedItems,
      }),
    }
  )
);
