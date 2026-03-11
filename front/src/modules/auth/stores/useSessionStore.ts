import { create } from "zustand";
import { devtools } from "zustand/middleware";

const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const WARNING_BEFORE_MS = 2 * 60 * 1000; // 2 minutes before timeout

interface SessionState {
  lastActivity: number;
  showTimeoutWarning: boolean;
  isSessionActive: boolean;

  // Actions
  updateActivity: () => void;
  resetSession: () => void;
  showWarning: () => void;
  hideWarning: () => void;
  endSession: () => void;
  getRemainingTime: () => number;
}

/**
 * Session Store
 * Manages user session timeout and activity tracking
 */
export const useSessionStore = create<SessionState>()(
  devtools(
    (set, get) => ({
      lastActivity: Date.now(),
      showTimeoutWarning: false,
      isSessionActive: true,

      /**
       * Update last activity timestamp
       * Called on any user interaction
       */
      updateActivity: () => {
        set({
          lastActivity: Date.now(),
          showTimeoutWarning: false,
        });
      },

      /**
       * Reset session to initial state
       * Called when user explicitly chooses to stay logged in
       */
      resetSession: () => {
        set({
          lastActivity: Date.now(),
          showTimeoutWarning: false,
          isSessionActive: true,
        });
      },

      /**
       * Show timeout warning modal
       * Called 2 minutes before session expires
       */
      showWarning: () => set({ showTimeoutWarning: true }),

      /**
       * Hide timeout warning modal
       */
      hideWarning: () => set({ showTimeoutWarning: false }),

      /**
       * End the current session
       * Called when session timeout is reached
       */
      endSession: () =>
        set({
          isSessionActive: false,
          showTimeoutWarning: false,
        }),

      /**
       * Get remaining time before session expires
       * @returns Remaining time in milliseconds
       */
      getRemainingTime: () => {
        const { lastActivity } = get();
        const elapsed = Date.now() - lastActivity;
        return Math.max(0, SESSION_TIMEOUT_MS - elapsed);
      },
    }),
    { name: "session-store" }
  )
);

// Export constants for use in other modules
export { SESSION_TIMEOUT_MS, WARNING_BEFORE_MS };
