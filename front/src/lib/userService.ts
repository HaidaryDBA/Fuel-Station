// api/userApi.ts
import type { Permission } from "../data/permissions";
import type {
  ChangePasswordData,
  UpdateUserData,
  UserProfile,
} from "../stores/useUserStore";
import apiClient from "./api";
import type { AxiosResponse } from "axios";

const USER_ENDPOINT = '/accounts/users'

export const userService = {
  getUser: (id: number | "me"): Promise<AxiosResponse<UserProfile>> => {
    return apiClient.get(`${USER_ENDPOINT}/${id}/`);
  },

  updateUser: (id: number | "me", data: UpdateUserData) => {
    return apiClient.patch<UserProfile>(`${USER_ENDPOINT}/${id}/`, data);
  },

  deleteUser: (id: number): Promise<void> => {
    return apiClient.delete(`${USER_ENDPOINT}/${id}/`);
  },

  uploadUserPhoto: async (id: number, file: File) => {
    const formData = new FormData();
    formData.append("photo", file);
    const response = await apiClient.post(
      `${USER_ENDPOINT}/${id}/upload-photo/`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return response.data.avatar_url;
  },
  updatePermissions: (id: number, permissions: Permission[]) =>
    apiClient.put(`${USER_ENDPOINT}/${id}/permissions/`, { permissions }),

  deleteUserPhoto: (id: number) =>
    apiClient.delete(`${USER_ENDPOINT}/${id}/delete-photo/`),

  changeUserPassword: (id: number, data: ChangePasswordData) =>
    apiClient.post(`${USER_ENDPOINT}/${id}/change-password/`, data),
};
