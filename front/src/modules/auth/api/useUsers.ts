import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  userManagementService,
  type PaginatedUsers,
  type UserListItem,
  type CreateUserData,
  type UpdateUserData,
  type UpdatePermissionsData,
} from "./userManagementService";
import { extractAxiosError } from "@/utils/extractError";

// Query Keys
export const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: (params?: { page?: number; page_size?: number; search?: string; role?: string }) =>
    [...userKeys.lists(), params] as const,
  details: () => [...userKeys.all, "detail"] as const,
  detail: (id: number) => [...userKeys.details(), id] as const,
};

// Get all users with pagination
export const useUsersList = (params?: {
  page?: number;
  page_size?: number;
  search?: string;
  role?: string;
}) => {
  return useQuery<PaginatedUsers>({
    queryKey: userKeys.list(params),
    queryFn: () => userManagementService.getUsers(params).then((res) => res.data),
  });
};

// Get single user
export const useUser = (id: number, options?: { enabled?: boolean }) => {
  return useQuery<UserListItem>({
    queryKey: userKeys.detail(id),
    queryFn: () => userManagementService.getUser(id).then((res) => res.data),
    ...options,
  });
};

// Create user
export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateUserData) =>
      userManagementService.createUser(data).then((res) => res.data),
    onSuccess: () => {
      toast.success("User created successfully");
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
    onError: (error) => {
      toast.error(extractAxiosError(error, "Failed to create user"));
    },
  });
};

// Update user
export const useUpdateUser = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateUserData) =>
      userManagementService.updateUser(id, data).then((res) => res.data),
    onSuccess: () => {
      toast.success("User updated successfully");
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
    },
    onError: (error) => {
      toast.error(extractAxiosError(error, "Failed to update user"));
    },
  });
};

// Delete user
export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => userManagementService.deleteUser(id),
    onSuccess: () => {
      toast.success("User deleted successfully");
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
    onError: (error) => {
      toast.error(extractAxiosError(error, "Failed to delete user"));
    },
  });
};

// Update user permissions
export const useUpdateUserPermissions = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdatePermissionsData) =>
      userManagementService.updatePermissions(id, data).then((res) => res.data),
    onSuccess: () => {
      toast.success("Permissions updated successfully");
      queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
    },
    onError: (error) => {
      toast.error(extractAxiosError(error, "Failed to update permissions"));
    },
  });
};

// Change user password (admin)
export const useChangeUserPassword = (id: number) => {
  return useMutation({
    mutationFn: (data: { new_password: string }) =>
      userManagementService.changeUserPassword(id, data),
    onSuccess: () => {
      toast.success("Password changed successfully");
    },
    onError: (error) => {
      toast.error(extractAxiosError(error, "Failed to change password"));
    },
  });
};
