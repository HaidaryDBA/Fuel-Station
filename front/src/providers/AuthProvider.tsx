
// components/AuthProvider.tsx
import React, { createContext } from 'react';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import type { UserProfile } from '@/modules/auth/stores/useUserStore';

interface AuthContextType {
  isLoading: boolean;
  isAuthenticated: boolean;
  userProfile: UserProfile | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);


interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const auth = useAuth();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};
