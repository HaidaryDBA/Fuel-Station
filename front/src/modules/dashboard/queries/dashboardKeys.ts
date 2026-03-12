export const dashboardKeys = {
  root: ['dashboard'] as const,
  summary: () => [...dashboardKeys.root, 'summary'] as const,
  tankStatus: () => [...dashboardKeys.root, 'tank-status'] as const,
  todaySales: () => [...dashboardKeys.root, 'today-sales'] as const,
};
