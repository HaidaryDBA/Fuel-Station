export const dashboardKeys = {
  root: ['dashboard'] as const,
  summary: () => [...dashboardKeys.root, 'summary'] as const,
};
