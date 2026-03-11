import { useEffect, useCallback } from "react";
import {
  useSessionStore,
  WARNING_BEFORE_MS,
} from "../stores/useSessionStore";
import { useUserStore } from "../stores/useUserStore";
import { useRefreshSession } from "../api/useAuthMutations";

/**
 * Session Timeout Hook
 * Manages user session timeout and activity tracking
 *
 * Features:
 * - Tracks user activity (mouse, keyboard, scroll, touch)
 * - Shows warning 2 minutes before timeout
 * - Auto-logout at 30 minutes of inactivity
 * - Provides keep-alive functionality
 */
export const useSessionTimeout = () => {
  const {
    updateActivity,
    showWarning,
    endSession,
    getRemainingTime,
  } = useSessionStore();

  const { logout, userProfile } = useUserStore();
  const refreshSessionMutation = useRefreshSession();

  /**
   * Handle user activity
   * Updates last activity timestamp on any interaction
   */
  const handleActivity = useCallback(() => {
    updateActivity();
  }, [updateActivity]);

  /**
   * Keep session alive
   * Refreshes session on server and resets timer
   */
  const keepAlive = useCallback(async () => {
    try {
      await refreshSessionMutation.mutateAsync();
      updateActivity();
    } catch (error) {
      console.error("Failed to refresh session:", error);
    }
  }, [refreshSessionMutation, updateActivity]);

  /**
   * Setup activity listeners and timeout checker
   */
  useEffect(() => {
    // Only run if user is logged in
    if (!userProfile) return;

    // Activity event listeners
    const events = ["mousedown", "keydown", "scroll", "touchstart"];

    events.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    // Check session timeout interval
    const interval = setInterval(() => {
      const remaining = getRemainingTime();

      // Show warning 2 minutes before timeout
      if (remaining <= WARNING_BEFORE_MS && remaining > 0) {
        showWarning();
      }

      // Logout on timeout
      if (remaining <= 0) {
        endSession();
        logout();
        window.location.href = "/auth/login?timeout=true";
      }
    }, 10000); // Check every 10 seconds

    // Cleanup
    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
      clearInterval(interval);
    };
  }, [
    userProfile,
    handleActivity,
    showWarning,
    endSession,
    logout,
    getRemainingTime,
  ]);

  return {
    keepAlive,
    remainingTime: getRemainingTime(),
  };
};
