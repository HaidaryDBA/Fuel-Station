// components/ProtectedRoute.tsx
import { Navigate, Outlet } from "react-router-dom";
import { useUserProfileStore } from "../stores/useUserStore";
import type { Permission } from "../data/permissions";

interface ProtectedRouteProps {
  permission: Permission | Permission[];
  all?: boolean;
  redirectTo?: string;
}

export const ProtectedRoute = ({
  permission,
  all,
  redirectTo = "/unauthorized",
}: ProtectedRouteProps) => {
  const hasPermission = useUserProfileStore((s) =>
    s.hasPermission(permission, all)
  );
  return hasPermission ? <Outlet /> : <Navigate to={redirectTo} replace />;
};
