// hooks/useUserProfile.ts
import { AxiosError } from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  useUserProfileStore,
  type ChangePasswordData,
  type UpdateUserData,
} from "../stores/useUserStore";
import { useTheme } from "./useTheme";
import {
  useDeleteUserPhotoMutation,
  useUpdateUser,
  useUploadUserPhotoMutation,
  useUser,
  useUpdateUserPermissions,
} from "../queries/useUsers";
import { extractAxiosError } from "../utils/extractError";
import { userService } from "../lib/userService";
import type { Theme } from "../services/theme";
import type { Permission } from "../data/permissions";

export const useUserProfile = (userId?: number) => {
  const {
    userProfile: selfProfile,
    loading,
    error: selfError,
    updateUserProfile,
    changePassword,
    uploadPhoto: selfUploadPhoto,
    deletePhoto: selfDeletePhoto,
    clearError,
  } = useUserProfileStore();

  const { updateTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isSavingPermissions, setSavingPermissions] = useState(false);
  const { mutate: updateUser } = useUpdateUser(userId ?? "me");
  const { mutate: uploadPhoto } = useUploadUserPhotoMutation(userId || 0);
  const { mutate: deletePhoto } = useDeleteUserPhotoMutation(userId || 0);
  const { update: updatePermissionData } = useUpdateUserPermissions(userId);
  const {
    data: fetchedUser,
    isLoading,
    error,
  } = useUser(userId ?? "me", {
    enabled: !!userId,
  });
  const currentUser = userId ? fetchedUser : selfProfile;

  // Clear errors when component unmounts or error changes
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        clearError();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  // Update personal information
  const updatePersonalInfo = useCallback(
    async (data: {
      firstName: string;
      lastName: string;
      username: string;
      phone?: string;
    }) => {
      const payload = {
        first_name: data.firstName,
        last_name: data.lastName,
        username: data.username,
        phone: data.phone,
      };
      if (userId) {
        updateUser(payload);
        return;
      }
      try {
        await updateUserProfile(payload);
        toast.success("Personal information updated successfully!");
      } catch (error) {
        const errorMessage = extractAxiosError(error);
        toast.error(errorMessage);
        throw error;
      }
    },
    [updateUser, updateUserProfile, userId]
  );

  // Handle password change
  const handleChangePassword = useCallback(
    async (data: ChangePasswordData) => {
      if (userId) {
        try {
          userService.changeUserPassword(userId, data);
          toast.success("Password Changed");
        } catch (error) {
          const errorMessage = extractAxiosError(error);
          toast.error(errorMessage);
        }
        return;
      }
      try {
        await changePassword(data);
        toast.success("Password changed successfully!");
      } catch (error) {
        if (error instanceof AxiosError) {
          const errorMessage =
            error.response?.data?.old_password?.[0] ||
            error.response?.data?.new_password?.[0] ||
            "Failed to change password";
          toast.error(errorMessage);
          throw error;
        }
      }
    },
    [changePassword, userId]
  );

  // Handle photo upload
  const handlePhotoUpload = useCallback(
    async (file: File) => {
      // Validate file
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      if (userId) {
        uploadPhoto(file);
      }
      try {
        await selfUploadPhoto(file);
        toast.success("Profile photo updated successfully!");
      } catch (error) {
        const errorMessage = extractAxiosError(error, "Failed to upload photo");
        toast.error(errorMessage);

        throw error;
      }
    },
    [selfUploadPhoto, uploadPhoto, userId]
  );

  // Handle photo delete
  const handlePhotoDelete = useCallback(async () => {
    if (userId) {
      deletePhoto();
    }
    try {
      await selfDeletePhoto();
      toast.success("Profile photo removed successfully!");
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error("Failed to remove photo");
        throw error;
      }
    }
  }, [deletePhoto, selfDeletePhoto, userId]);

  // Trigger file input
  const triggerPhotoUpload = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Handle file input change
  const handleFileInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        handlePhotoUpload(file);
      }
      // Reset input value to allow selecting the same file again
      event.target.value = "";
    },
    [handlePhotoUpload]
  );
  const handleUpdatePermissons = useCallback(
    async (permissions: Permission[]) => {
      if (!userId) return;
      setSavingPermissions(true);
      userService
        .updatePermissions(userId, permissions)
        .then((res) => {
          toast.success(res.data.message || "New Permissoins Set Successfully");
          updatePermissionData(permissions);
        })

        .catch((error) => {
          const errorMessage = extractAxiosError(error);
          toast.error(errorMessage);
        })
        .finally(() => {
          setSavingPermissions(false);
        });
    },

    [updatePermissionData, userId]
  );

  // Check if user has permission
  const hasPermission = useCallback(
    (permission: Permission) => {
      return currentUser?.permissions.includes(permission) || false;
    },
    [currentUser]
  );

  // Get full name
  const getFullName = useCallback(() => {
    if (!currentUser) return "";
    return `${currentUser.firstName} ${currentUser.lastName}`.trim();
  }, [currentUser]);

  // Update preferences
  const updatePreferences = useCallback(
    async (key: string, value: string) => {
      try {
        const updateData: UpdateUserData = {};
        switch (key) {
          case "language":
            updateData.language_preference = value;
            break;
          case "timezone":
            updateData.timezone = value;
            break;

          case "theme":
            updateData.theme = value as Theme;
            updateTheme(value as Theme);
            break;
        }
        await updateUserProfile(updateData);
        toast.success(
          `${key.charAt(0).toUpperCase() + key.slice(1)} preference updated.`
        );
      } catch (error) {
        if (error instanceof AxiosError) {
          toast.error(`Failed to update ${key} preference`);
          throw error;
        }
      }
    },
    [updateUserProfile, updateTheme]
  );
  return {
    // Data
    currentUser,
    loading: userId ? isLoading : loading,
    error: userId ? error : selfError,
    isSavingPermissions,
    // Actions
    updatePersonalInfo,
    updatePreferences,
    handleUpdatePermissons,
    handleChangePassword,
    handlePhotoUpload,
    handlePhotoDelete,
    triggerPhotoUpload,
    handleFileInputChange,

    // Utilities
    hasPermission,
    getFullName,
    fileInputRef,

    initials: currentUser
      ? `${currentUser.firstName?.[0] || ""}${currentUser.lastName?.[0] || ""}`
      : "U",
  };
};
