import { useEffect, useState } from 'react';
import { useUserStore } from '@/modules/auth/stores/useUserStore';
import { getAccessToken } from '@/lib/api';

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { userProfile, fetchUserProfile, reset } = useUserStore();

  useEffect(() => {
    const initializeAuth = async () => {
      const token = getAccessToken();
      if (!token) {
        setIsAuthenticated(false);
        setIsLoading(false);
        reset();
        return;
      }

      try {
        // If we have a token, try to fetch user profile
        await fetchUserProfile();
        setIsAuthenticated(true);
      } catch {
        // Token might be invalid, clear it
        sessionStorage.removeItem('accessToken');
        setIsAuthenticated(false);
        reset();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [fetchUserProfile, reset]);

  // Update authentication status when userProfile changes
  useEffect(() => {
    setIsAuthenticated(!!userProfile);
  }, [userProfile]);

  return {
    isLoading,
    isAuthenticated,
    userProfile,
  };
};
