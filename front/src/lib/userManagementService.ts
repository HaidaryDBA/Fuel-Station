import apiClient from "./api";
import type { Permission } from "@/data/permissions";
import type { RoleName } from "@/data/roles";

// User List Item
export interface UserListItem {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  role: RoleName;
  status: "active" | "inactive";
  lastLogin?: string;
  createdAt: string;
  avatarUrl?: string;
  permissions: Permission[];
}

// Paginated Response
export interface PaginatedUsers {
  count: number;
  next: string | null;
  previous: string | null;
  results: UserListItem[];
}

// Create User Data
export interface CreateUserData {
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  password: string;
  role_name: RoleName;
  location_id?: string;
}

// Update User Data
export interface UpdateUserData {
  first_name?: string;
  last_name?: string;
  username?: string;
  email?: string;
  role_name?: RoleName;
  location_id?: string;
}

// User Management Service
export const userManagementService = {
  // Get paginated users list
  getUsers: (params?: { page?: number; search?: string; role?: string; page_size?: number }) =>
    apiClient.get<PaginatedUsers>("/accounts/users/", { params }),

  // Get single user
  getUser: (id: number) => apiClient.get<UserListItem>(`/accounts/users/${id}/`),

  // Create new user
  createUser: (data: CreateUserData) =>
    apiClient.post<UserListItem>("/accounts/users/", data),

  // Update user
  updateUser: (id: number, data: UpdateUserData) =>
    apiClient.patch<UserListItem>(`/accounts/users/${id}/`, data),

  // Delete user
  deleteUser: (id: number) => apiClient.delete(`/accounts/users/${id}/`),

  // Update user permissions
  updatePermissions: (id: number, permissions: Permission[]) =>
    apiClient.put(`/accounts/users/${id}/permissions/`, { permissions }),

  // Change user password (admin)
  changeUserPassword: (id: number, password: string) =>
    apiClient.post(`/accounts/users/${id}/change-password/`, { new_password: password }),
};

export default userManagementService;
