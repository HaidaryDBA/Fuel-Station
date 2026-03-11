// MIS User Store
import { AxiosError } from "axios";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import apiClient, { setAccessToken } from "@/lib/api";
import type { Theme } from "@/services/theme";
import { extractAxiosError } from "@/utils/extractError";
import type { Permission } from "@/data/permissions";
import type { RoleName } from "@/data/roles";

export type Branch = {
  id: string;
  name: string;
  location: string;
};

export interface LoginResponse {
  access: string;
  user: UserProfile;
  message: string;
}

export type UserProfile = {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone: string;
  role: RoleName;
  avatarUrl: string;
  location: number;
  permissions: Permission[];
  preferences: {
    language: string;
    timezone: string;
    currency: string;
    theme: Theme;
  };
};

export type CreateUserData = {
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  password: string;
  role_name: RoleName;
  location_id: string;
  language_preference?: string;
  timezone?: string;
  theme?: Theme;
};

export type UpdateUserData = {
  first_name?: string;
  last_name?: string;
  username?: string;
  role_name?: string;
  phone?: string;
  location_id?: string;
  preferred_currency_id?: number;
  language_preference?: string;
  timezone?: string;
  theme?: Theme;
};

export type ChangePasswordData = {
  old_password: string;
  new_password: string;
  confirm_password: string;
};

export type LoginCredentials = {
  username: string;
  password: string;
};

interface UserState {
  userProfile: UserProfile | null;
  loading: boolean;
  error: string | null;

  // Login attempt tracking
  lastLogin: string | null;
  failedLoginAttempts: number;
  accountLocked: boolean;
  lockedUntil: string | null;

  // Auth actions
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;

  // Profile actions
  fetchUserProfile: () => Promise<void>;
  updateUserProfile: (data: UpdateUserData) => Promise<void>;
  changePassword: (data: ChangePasswordData) => Promise<void>;
  uploadPhoto: (file: File) => Promise<string>;
  deletePhoto: () => Promise<void>;

  // Login attempt tracking actions
  trackLoginAttempt: (success: boolean) => void;
  resetLoginAttempts: () => void;
  setAccountLocked: (lockedUntil: string) => void;

  // Utility actions
  hasPermission: (
    permission: Permission | Permission[],
    all?: boolean
  ) => boolean;
  setError: (error: string | null) => void;
  clearError: () => void;
  reset: () => void;
}

export const useUserStore = create<UserState>()(
  devtools(
    (set, get) => ({
      // Initial state
      userProfile: null,
      loading: false,
      error: null,

      // Login attempt tracking state
      lastLogin: null,
      failedLoginAttempts: 0,
      accountLocked: false,
      lockedUntil: null,

      // Auth actions

      login: async (credentials: LoginCredentials) => {
        set({ loading: true, error: null });
        try {
          const response = await apiClient.post<LoginResponse>(
            "/accounts/auth/login/",
            credentials
          );
          // Set the access token from response
          setAccessToken(response.data.access);

          // Reset login attempts on successful login
          set({
            userProfile: response.data.user,
            loading: false,
            failedLoginAttempts: 0,
            accountLocked: false,
            lockedUntil: null,
            lastLogin: new Date().toISOString(),
          });
        } catch (error) {
          const axiosError = error as AxiosError<{
            detail?: string;
            attempts_remaining?: number;
            locked_until?: string;
          }>;

          // Handle account lockout
          if (axiosError.response?.status === 429) {
            const lockedUntil = axiosError.response.data?.locked_until;
            if (lockedUntil) {
              set({
                accountLocked: true,
                lockedUntil,
                loading: false,
                error: axiosError.response.data?.detail || "Account is locked",
              });
            }
          } else if (axiosError.response?.data?.attempts_remaining !== undefined) {
            // Track failed attempt
            const attemptsRemaining = axiosError.response.data.attempts_remaining;
            set({
              failedLoginAttempts: 5 - attemptsRemaining,
              loading: false,
              error: axiosError.response.data?.detail || "Invalid credentials",
            });
          } else {
            const errorMessage = extractAxiosError(error, "Login failed");
            set({ error: errorMessage, loading: false });
          }

          throw error;
        }
      },

      logout: () => {
        // Clear token from storage
        sessionStorage.removeItem("accessToken");
        // Reset store state
        set({
          userProfile: null,
          loading: false,
          error: null,
        });
      },

      // Profile actions
      fetchUserProfile: async () => {
        set({ loading: true, error: null });
        try {
          const response = await apiClient.get("/accounts/users/me");
          set({ userProfile: response.data, loading: false });
        } catch (error) {
          const errorMessage = extractAxiosError(
            error,
            "Failed to fetch user profile"
          );
          set({ error: errorMessage, loading: false });
          throw error;
        }
      },

      updateUserProfile: async (data: UpdateUserData) => {
        set({ loading: true, error: null });
        try {
          const response = await apiClient.patch("/accounts/users/me/", data);
          set({ userProfile: response.data, loading: false });
        } catch (error) {
          const errorMessage = extractAxiosError(
            error,
            "Failed to update profile"
          );
          set({ error: errorMessage, loading: false });
          throw error;
        }
      },

      changePassword: async (data: ChangePasswordData) => {
        set({ loading: true, error: null });
        try {
          await apiClient.post("/accounts/auth/change-password/", data);
          set({ loading: false });
        } catch (error) {
          if (error instanceof AxiosError) {
            const errorMessage =
              error.response?.data?.error ||
              error.response?.data?.old_password?.[0] ||
              error.response?.data?.new_password?.[0] ||
              "Failed to change password";
            set({ error: errorMessage, loading: false });
          }
          throw error;
        }
      },

      uploadPhoto: async (file: File): Promise<string> => {
        set({ loading: true, error: null });
        try {
          const formData = new FormData();
          formData.append("photo", file);

          const { userProfile } = get();
          if (!userProfile) throw new Error("No current user");

          const response = await apiClient.post(
            `/accounts/users/${userProfile.id}/upload-photo/`,
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );

          // Update current user with new avatar
          set({
            userProfile: {
              ...userProfile,
              avatarUrl: response.data.avatar_url,
            },
            loading: false,
          });

          return response.data.avatar_url;
        } catch (error) {
          if (error instanceof AxiosError) {
            const errorMessage =
              error.response?.data?.error || "Failed to upload photo";
            set({ error: errorMessage, loading: false });
          }
          throw error;
        }
      },

      deletePhoto: async () => {
        set({ loading: true, error: null });
        try {
          const { userProfile: currentUser } = get();
          if (!currentUser) throw new Error("No current user");

          const response = await apiClient.delete(
            `/accounts/users/${currentUser.id}/delete-photo/`
          );

          // Update current user with new avatar
          set({
            userProfile: {
              ...currentUser,
              avatarUrl: response.data.avatar_url,
            },
            loading: false,
          });
        } catch (error) {
          if (error instanceof AxiosError) {
            const errorMessage =
              error.response?.data?.error || "Failed to delete photo";
            set({ error: errorMessage, loading: false });
          }
          throw error;
        }
      },

      // Login attempt tracking actions
      trackLoginAttempt: (success: boolean) => {
        if (success) {
          // Reset on successful login
          set({
            failedLoginAttempts: 0,
            accountLocked: false,
            lockedUntil: null,
            lastLogin: new Date().toISOString(),
          });
        } else {
          // Increment failed attempts
          const current = get().failedLoginAttempts;
          const newCount = current + 1;

          if (newCount >= 5) {
            // Lock account for 30 minutes after 5 failed attempts
            const lockTime = new Date(Date.now() + 30 * 60 * 1000).toISOString();
            set({
              failedLoginAttempts: newCount,
              accountLocked: true,
              lockedUntil: lockTime,
            });
          } else {
            set({ failedLoginAttempts: newCount });
          }
        }
      },

      resetLoginAttempts: () => {
        set({
          failedLoginAttempts: 0,
          accountLocked: false,
          lockedUntil: null,
        });
      },

      setAccountLocked: (lockedUntil: string) => {
        set({
          accountLocked: true,
          lockedUntil,
          failedLoginAttempts: 5,
        });
      },

      // Utility actions
      hasPermission(permission, all: boolean = false) {
        const { userProfile } = get();
        if (!userProfile) return false;

        // Normalize permission to array if it's a single permission
        const permissionsArray = Array.isArray(permission)
          ? permission
          : [permission];

        // Check if user has any required permissions
        if (all) {
          return permissionsArray.every((perm) =>
            userProfile.permissions.includes(perm)
          );
        }
        return permissionsArray.some((perm) =>
          userProfile.permissions.includes(perm)
        );
      },
      setError: (error: string | null) => set({ error }),
      clearError: () => set({ error: null }),
      reset: () =>
        set({
          userProfile: null,
          loading: false,
          error: null,
          lastLogin: null,
          failedLoginAttempts: 0,
          accountLocked: false,
          lockedUntil: null,
        }),
    }),
    {
      name: "mis-user-store",
    }
  )
);
