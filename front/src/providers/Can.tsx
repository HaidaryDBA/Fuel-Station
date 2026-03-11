import type { ReactNode } from "react";
import { useUserStore } from "@/modules/auth/stores/useUserStore";
import type { Permission } from "@/data/permissions";

interface CanProps {
  permission?: Permission | Permission[];
  all?: boolean;
  children: ReactNode;
  fallback?: ReactNode;
}

export const Can = ({ permission, children, all, fallback = null }: CanProps) => {
  const hasPermission = useUserStore((s) => s.hasPermission);

  if (!permission) return <>{children}</>;

  return hasPermission(permission, all) ? <>{children}</> : <>{fallback}</>;
};


