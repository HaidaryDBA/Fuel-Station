import { useUserStore } from "../modules/auth/stores/useUserStore";

// Hook for programmatic permission checking

const useCan = () => {
  const hasPermission = useUserStore((s) => s.hasPermission);
  return { can: hasPermission };
};

export default useCan;