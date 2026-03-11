// stores/useStoreInitializer.ts - Hook to initialize all stores
import { useEffect } from "react";

export const useStoreInitializer = () => {
  useEffect(() => {
    // Initialize all stores on app startup
    const initializeStores = async () => {
      await Promise.all([]);
    };

    initializeStores();
  }, []);

  // Refetch on window focus for data freshness
  useEffect(() => {
    const handleFocus = () => {};

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);
};
