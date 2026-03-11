// stores/userStore.ts - Updated version
import { AxiosError } from "axios";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import apiClient, { setAccessToken } from "../lib/api";
import type { Theme } from "../services/theme";
import { extractAxiosError } from "../utils/extractError";
import type { Permission } from "../data/permissions";
import type { RoleName } from "../data/roles";

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

  // Auth actions
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;

  // Profile actions
  fetchUserProfile: () => Promise<void>;
  updateUserProfile: (data: UpdateUserData) => Promise<void>;
  changePassword: (data: ChangePasswordData) => Promise<void>;
  uploadPhoto: (file: File) => Promise<string>;
  deletePhoto: () => Promise<void>;

  // Utility actions
  hasPermission: (
    permission: Permission | Permission[],
    all?: boolean
  ) => boolean;
  setError: (error: string | null) => void;
  clearError: () => void;
  reset: () => void;
}

export const useUserProfileStore = create<UserState>()(
  devtools(
    (set, get) => ({
      // Initial state
      userProfile: null,
      loading: false,
      error: null,

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

          // Set the user profile from the 'me' field
          set({
            userProfile: response.data.user,
            loading: false,
          });
        } catch (error) {
          const errorMessage = extractAxiosError(error, "Login failed");
          set({ error: errorMessage, loading: false });
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

      // Utility actions
      hasPermission(permission, all: boolean = false) {
        const { userProfile } = get();
        if (!userProfile) return false;
        // if (userProfile.role === "admin") return true;

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
        }),
    }),
    {
      name: "user-store",
    }
  )
);
