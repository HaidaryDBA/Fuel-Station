export type EmployeeRole = 'admin' | 'manager' | 'staff';
export type EmployeeStatus = 'active' | 'inactive';
export type MembershipType = 'permanent' | 'contract' | 'intern';
export type Weekday =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export interface Employee {
  id: number;
  first_name: string;
  last_name: string;
  father_name: string;
  address: string;
  phone: string;
  salary: string;
  work_days: Weekday[];
  join_date: string;
  membership_type: MembershipType;
  role: EmployeeRole;
  status: EmployeeStatus;
  picture: string | null;
  created_at: string;
  updated_at: string;
}

export interface EmployeeFormValues {
  first_name: string;
  last_name: string;
  father_name: string;
  address: string;
  phone: string;
  salary: number;
  work_days: Weekday[];
  join_date: string;
  membership_type: MembershipType;
  role: EmployeeRole;
  status: EmployeeStatus;
  picture?: File;
}

export interface EmployeeListParams {
  page?: number;
  page_size?: number;
  search?: string;
  role_name?: EmployeeRole;
  status?: EmployeeStatus;
  membership_type?: MembershipType;
  join_date_from?: string;
  join_date_to?: string;
  min_salary?: number;
  max_salary?: number;
  ordering?: string;
}

export interface PaginatedEmployeesResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Employee[];
}

export const employeeRoleOptions: Array<{ label: string; value: EmployeeRole }> = [
  { label: 'Admin', value: 'admin' },
  { label: 'Manager', value: 'manager' },
  { label: 'Staff', value: 'staff' },
];

export const employeeStatusOptions: Array<{ label: string; value: EmployeeStatus }> = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
];

export const employeeMembershipOptions: Array<{ label: string; value: MembershipType }> = [
  { label: 'Permanent', value: 'permanent' },
  { label: 'Contract', value: 'contract' },
  { label: 'Intern', value: 'intern' },
];

export const weekdayOptions: Array<{ label: string; value: Weekday }> = [
  { label: 'Monday', value: 'monday' },
  { label: 'Tuesday', value: 'tuesday' },
  { label: 'Wednesday', value: 'wednesday' },
  { label: 'Thursday', value: 'thursday' },
  { label: 'Friday', value: 'friday' },
  { label: 'Saturday', value: 'saturday' },
  { label: 'Sunday', value: 'sunday' },
];
