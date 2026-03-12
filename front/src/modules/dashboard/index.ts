export { default as Dashboard } from "./Dashboard";
export {
  useDashboardSummary,
  useDashboardTankStatus,
  useDashboardTodaySalesByFuel,
} from "./queries/useDashboardQueries";
export type {
  DashboardSummary,
  DashboardAccountBalance,
  DashboardTodaySales,
  DashboardSalesByCurrency,
  DashboardTankStatus,
  DashboardTodaySalesByFuel,
} from "./types/dashboard";
