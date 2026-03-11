import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Shield,
  X,
  Eye,
  EyeOff,
  UserPlus,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@components/index";
import {
  Card,
  CardContent,
  Button,
  Badge,
  Avatar,
  Skeleton,
} from "@components/ui";
import Input from "@components/ui/Input";
import { useUsersList, useCreateUser, useDeleteUser } from "@/modules/auth/api/useUsers";
import { useUserStore } from "@/modules/auth/stores/useUserStore";
import { roles, getRoleNameDisplay, type RoleName } from "@/data/roles";
import type { UserListItem, CreateUserData } from "@/modules/auth/api/userManagementService";

// Create User Schema
const createUserSchema = z.object({
  first_name: z.string().min(2, "First name must be at least 2 characters"),
  last_name: z.string().min(2, "Last name must be at least 2 characters"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role_name: z.enum(["admin", "manager", "staff"] as const),
});

type CreateUserFormData = z.infer<typeof createUserSchema>;

// Mock data for fallback
const mockUsers: UserListItem[] = [
  {
    id: 1,
    firstName: "Ahmad",
    lastName: "Ahmadi",
    username: "ahmad.ahmadi",
    email: "ahmad@school.edu",
    role: "manager",
    isActive: true,
    lastLogin: "2024-02-15",
    createdAt: "2024-01-15",
    avatarUrl: null,
  },
  {
    id: 2,
    firstName: "Fatima",
    lastName: "Karimi",
    username: "fatima.karimi",
    email: "fatima@school.edu",
    role: "staff",
    isActive: true,
    lastLogin: "2024-02-10",
    createdAt: "2024-01-20",
    avatarUrl: null,
  },
  {
    id: 3,
    firstName: "Mohammad",
    lastName: "Rasooli",
    username: "mohammad.r",
    email: "mohammad@school.edu",
    role: "admin",
    isActive: false,
    lastLogin: null,
    createdAt: "2024-02-01",
    avatarUrl: null,
  },
];

export default function UserManagement() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState<number | null>(null);

  const { userProfile } = useUserStore();

  // Fetch users
  const {
    data: usersData,
    isLoading,
    error,
    refetch,
  } = useUsersList({
    page,
    search: searchQuery || undefined,
    role: roleFilter || undefined,
    page_size: 10,
  });

  // Mutations
  const createUserMutation = useCreateUser();
  const deleteUserMutation = useDeleteUser();

  // Form
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      username: "",
      email: "",
      password: "",
      role_name: "staff",
    },
  });

  // Use API data or fallback to mock
  const users = usersData?.results || mockUsers;
  const totalCount = usersData?.count || mockUsers.length;
  const totalPages = Math.ceil(totalCount / 10);

  // Filter users locally for search (if API doesn't support search)
  const filteredUsers = useMemo(() => {
    if (!searchQuery) return users;
    const query = searchQuery.toLowerCase();
    return users.filter(
      (user) =>
        user.firstName.toLowerCase().includes(query) ||
        user.lastName.toLowerCase().includes(query) ||
        user.username.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
    );
  }, [users, searchQuery]);

  // Handle create user
  const onSubmit = async (data: CreateUserFormData) => {
    try {
      await createUserMutation.mutateAsync(data as CreateUserData);
      setIsModalOpen(false);
      reset();
    } catch {
      // Error is handled by the mutation
    }
  };

  // Handle delete user
  const handleDeleteUser = async () => {
    if (!deleteUserId) return;

    // Prevent deleting own account
    if (userProfile && Number(userProfile.id) === deleteUserId) {
      toast.error(t("settings.cantDeleteSelf", "You cannot delete your own account"));
      setDeleteUserId(null);
      return;
    }

    try {
      await deleteUserMutation.mutateAsync(deleteUserId);
      setDeleteUserId(null);
    } catch {
      // Error is handled by the mutation
    }
  };

  // Get status badge
  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge variant="success" dot>
        Active
      </Badge>
    ) : (
      <Badge variant="default" dot>
        Inactive
      </Badge>
    );
  };

  // Get role badge
  const getRoleBadge = (role: RoleName) => {
    const colors: Record<RoleName, "primary" | "info" | "warning" | "success" | "default"> = {
      admin: "primary",
      manager: "primary",
      staff: "default",
    };
    return <Badge variant={colors[role] || "default"}>{getRoleNameDisplay(role)}</Badge>;
  };

  // Loading skeleton
  const TableSkeleton = () => (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-4 p-4 border border-border rounded-lg">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-3 w-1/3" />
          </div>
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-16" />
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("mis.settings.userManagement", "User Management")}
        subtitle={t("mis.settings.userSubtitle", "Manage system users and their access permissions")}
        actions={[
          {
            label: t("settings.addUser", "Add User"),
            icon: <Plus className="h-4 w-4" />,
            onClick: () => setIsModalOpen(true),
          },
        ]}
      />

      {/* Filters */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder={t("settings.searchUsers", "Search users...")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="h-4 w-4" />}
              />
            </div>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">{t("settings.allRoles", "All Roles")}</option>
              {roles.map((role) => (
                <option key={role.name} value={role.name}>
                  {role.value}
                </option>
              ))}
            </select>

            {/* Refresh */}
            <Button variant="outline" onClick={() => refetch()}>
              {t("common.refresh", "Refresh")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4">
              <TableSkeleton />
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <p className="text-sm text-error mb-2">
                {t("settings.usersLoadError", "Failed to load users")}
              </p>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                {t("common.retry", "Retry")}
              </Button>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-8 text-center">
              <UserPlus className="h-12 w-12 mx-auto text-muted mb-4" />
              <p className="text-sm text-text-secondary mb-4">
                {searchQuery
                  ? t("settings.noUsersFound", "No users match your search")
                  : t("settings.noUsers", "No users found")}
              </p>
              {!searchQuery && (
                <Button onClick={() => setIsModalOpen(true)} leftIcon={<Plus className="h-4 w-4" />}>
                  {t("settings.addFirstUser", "Add First User")}
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-surface">
                      <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                        {t("settings.user", "User")}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                        {t("settings.role", "Role")}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                        {t("settings.status", "Status")}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                        {t("settings.lastLogin", "Last Login")}
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">
                        {t("common.actions", "Actions")}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-surface-hover transition-colors">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar
                              name={`${user.firstName} ${user.lastName}`}
                              src={user.avatarUrl}
                            />
                            <div>
                              <p className="text-sm font-medium text-text-primary">
                                {user.firstName} {user.lastName}
                              </p>
                              <p className="text-xs text-text-secondary">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">{getRoleBadge(user.role)}</td>
                        <td className="px-4 py-4">{getStatusBadge(user.isActive)}</td>
                        <td className="px-4 py-4">
                          <span className="text-sm text-text-secondary">
                            {user.lastLogin || "-"}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              className="p-2 text-text-secondary hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                              title={t("settings.editUser", "Edit User")}
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              className="p-2 text-text-secondary hover:text-info hover:bg-info/10 rounded-lg transition-colors"
                              title={t("settings.managePermissions", "Manage Permissions")}
                            >
                              <Shield className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setDeleteUserId(user.id)}
                              className="p-2 text-text-secondary hover:text-error hover:bg-error/10 rounded-lg transition-colors"
                              title={t("settings.deleteUser", "Delete User")}
                              disabled={Number(userProfile?.id) === user.id}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                  <p className="text-sm text-text-secondary">
                    {t("settings.showingUsers", "Showing {{from}} to {{to}} of {{total}} users", {
                      from: (page - 1) * 10 + 1,
                      to: Math.min(page * 10, totalCount),
                      total: totalCount,
                    })}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      {t("common.previous", "Previous")}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      {t("common.next", "Next")}
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Create User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-2xl bg-card p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-text-primary">
                {t("settings.addUser", "Add User")}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  reset();
                }}
                className="p-2 text-text-secondary hover:text-text-primary rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label={t("settings.firstName", "First Name")}
                  placeholder={t("settings.firstNamePlaceholder", "Enter first name")}
                  error={errors.first_name?.message}
                  {...register("first_name")}
                />
                <Input
                  label={t("settings.lastName", "Last Name")}
                  placeholder={t("settings.lastNamePlaceholder", "Enter last name")}
                  error={errors.last_name?.message}
                  {...register("last_name")}
                />
              </div>

              <Input
                label={t("settings.username", "Username")}
                placeholder={t("settings.usernamePlaceholder", "Enter username")}
                error={errors.username?.message}
                {...register("username")}
              />

              <Input
                type="email"
                label={t("settings.email", "Email")}
                placeholder={t("settings.emailPlaceholder", "user@school.edu")}
                error={errors.email?.message}
                {...register("email")}
              />

              <Input
                type={showPassword ? "text" : "password"}
                label={t("settings.password", "Password")}
                placeholder={t("settings.passwordPlaceholder", "Enter password")}
                error={errors.password?.message}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-muted hover:text-text-primary transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
                {...register("password")}
              />

              <div>
                <label className="mb-1.5 block text-sm font-medium text-text-primary">
                  {t("settings.role", "Role")}
                </label>
                <select
                  {...register("role_name")}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {roles.map((role) => (
                    <option key={role.name} value={role.name}>
                      {role.value}
                    </option>
                  ))}
                </select>
                {errors.role_name && (
                  <p className="mt-1.5 text-sm text-error">{errors.role_name.message}</p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsModalOpen(false);
                    reset();
                  }}
                >
                  {t("common.cancel", "Cancel")}
                </Button>
                <Button type="submit" loading={createUserMutation.isPending}>
                  {t("settings.createUser", "Create User")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteUserId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-text-primary mb-2">
              {t("settings.deleteUserTitle", "Delete User")}
            </h2>
            <p className="text-sm text-text-secondary mb-6">
              {t(
                "settings.deleteUserConfirm",
                "Are you sure you want to delete this user? This action cannot be undone."
              )}
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDeleteUserId(null)}>
                {t("common.cancel", "Cancel")}
              </Button>
              <Button
                variant="danger"
                loading={deleteUserMutation.isPending}
                onClick={handleDeleteUser}
              >
                {t("common.delete", "Delete")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
