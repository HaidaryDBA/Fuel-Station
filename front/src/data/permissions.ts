// MIS Permissions
export const permissions = [
  // Core MIS Permissions
  { name: "dashboard", value: "Dashboard" },
  { name: "attendance", value: "Attendance" },
  { name: "grades", value: "Grades" },
  { name: "fees", value: "Fees" },
  { name: "employees", value: "Employees" },
  { name: "purchases", value: "Purchases" },
  { name: "reports", value: "Reports" },
  { name: "settings", value: "Settings" },
  { name: "users", value: "Users" },
  { name: "parents", value: "Parents" },
  { name: "academic_year", value: "Academic Year" },
] as const;

export type Permission = (typeof permissions)[number]["name"];

export const routePermissions: Record<string, Permission | Permission[]> = {
  "/mis": "dashboard",
  "/mis/attendance": "attendance",
  "/mis/attendance/mark": "attendance",
  "/mis/attendance/report": "attendance",
  "/mis/grades": "grades",
  "/mis/grades/entry": "grades",
  "/mis/grades/exams": "grades",
  "/mis/grades/report-cards": "grades",
  "/mis/fees": "fees",
  "/mis/fees/structure": "fees",
  "/mis/fees/collection": "fees",
  "/mis/fees/reports": "fees",
  "/employees": "employees",
  "/employees/new": "employees",
  "/employees/:id": "employees",
  "/employees/:id/edit": "employees",
  "/employees/customers": "employees",
  "/employees/customers/new": "employees",
  "/employees/customers/:id": "employees",
  "/employees/customers/:id/edit": "employees",
  "/employees/partners": "employees",
  "/employees/partners/new": "employees",
  "/employees/partners/:id": "employees",
  "/employees/partners/:id/edit": "employees",
  "/customers": "employees",
  "/customers/new": "employees",
  "/customers/:id": "employees",
  "/customers/:id/edit": "employees",
  "/partners": "employees",
  "/partners/new": "employees",
  "/partners/:id": "employees",
  "/partners/:id/edit": "employees",
  "/purchasing": "purchases",
  "/purchasing/suppliers": "purchases",
  "/purchasing/suppliers/new": "purchases",
  "/purchasing/suppliers/:id": "purchases",
  "/purchasing/suppliers/:id/edit": "purchases",
  "/purchasing/purchases": "purchases",
  "/purchasing/purchases/new": "purchases",
  "/purchasing/purchases/:id": "purchases",
  "/purchasing/purchases/:id/edit": "purchases",
  "/purchasing/orders": "purchases",
  "/purchasing/orders/new": "purchases",
  "/purchasing/orders/:id": "purchases",
  "/purchasing/orders/:id/edit": "purchases",
  "/mis/parents": "parents",
  "/mis/parents/:id": "parents",
  "/mis/settings": "settings",
  "/mis/settings/general": "settings",
  "/mis/settings/users": "users",
  "/mis/settings/academic-year": "academic_year",
};

export const hasRoutePermission = (
  route: string,
  userPermissions: Permission[]
) => {
  const rp = routePermissions[route];
  if (rp === undefined) return true;
  const perm = Array.isArray(rp) ? rp : [rp];
  return perm.some((p) => userPermissions.includes(p));
};
