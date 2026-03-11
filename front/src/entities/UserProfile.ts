export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  role: UserRole;
  avatarUrl: string;
  branch: {
    id: string;
    name: string;
    location: string;
  };
  permissions: string[];
  preferences: {
    language: string;
    timezone: string;
    currency: string;
    theme: "light" | "dark" | "system";
  };
}

export type UserRole = "admin" | "cashier" | "manager" | "stock_clerk";
