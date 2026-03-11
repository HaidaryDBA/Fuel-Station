// MIS Roles
export const roles = [
  { name: "admin", value: "Administrator" },
  { name: "manager", value: "Manager" },
  { name: "staff", value: "Staff" },
] as const;

export type RoleName = (typeof roles)[number]["name"];

export const getRoleNameDisplay = (role: RoleName) => {
  return roles.find((r) => r.name === role)?.value || role;
};
