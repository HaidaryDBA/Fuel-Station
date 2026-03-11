import { useEffect, type ReactNode } from 'react';

import { usePartnerUiStore } from '../stores/usePartnerUiStore';

interface PartnersProviderProps {
  children: ReactNode;
}

export default function PartnersProvider({ children }: PartnersProviderProps) {
  const resetFilters = usePartnerUiStore((state) => state.resetFilters);

  useEffect(() => {
    return () => {
      resetFilters();
    };
  }, [resetFilters]);

  return <>{children}</>;
}
