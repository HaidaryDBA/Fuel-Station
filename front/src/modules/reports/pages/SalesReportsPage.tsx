import { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { RefreshCw } from 'lucide-react';

import { PageHeader } from '@/components';
import { Alert, Card, CardContent, CardHeader, Input, Select, Skeleton } from '@/components/ui';
import { useFuelsList } from '@/modules/inventory';
import { extractAxiosError } from '@/utils/extractError';

import {
  useDailySalesReport,
  useMonthlySalesSummary,
  useSalesByFuelTypeReport,
} from '../queries/useReportQueries';
import { reportKeys } from '../queries/reportKeys';
import type {
  DailySalesReportRow,
  MonthlySalesSummaryRow,
  SalesByFuelTypeRow,
  SalesReportFilters,
} from '../types/reports';

const formatAmount = (value?: string | number) => Number(value || 0).toFixed(2);

function SummaryTable({
  headers,
  rows,
  emptyMessage,
}: {
  headers: string[];
  rows: Array<(string | number)[]>;
  emptyMessage: string;
}) {
  if (!rows.length) {
    return <p className="text-sm text-text-secondary">{emptyMessage}</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-border text-sm">
        <thead>
          <tr className="bg-surface/40">
            {headers.map((header) => (
              <th key={header} className="px-4 py-3 text-left font-medium text-text-secondary">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border/70">
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-surface/20">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="px-4 py-3 text-text-primary">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function SalesReportsPage() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<SalesReportFilters>({});

  const { data: fuelsData } = useFuelsList({ page_size: 300 });

  const { data: dailyReport, isLoading: isDailyLoading, isError: isDailyError, error: dailyError } =
    useDailySalesReport(filters);
  const {
    data: monthlySummary,
    isLoading: isMonthlyLoading,
    isError: isMonthlyError,
    error: monthlyError,
  } = useMonthlySalesSummary(filters);
  const {
    data: byFuelReport,
    isLoading: isByFuelLoading,
    isError: isByFuelError,
    error: byFuelError,
  } = useSalesByFuelTypeReport(filters);

  const fuelTypes = useMemo(() => {
    const options = new Set<string>();
    (fuelsData?.results ?? []).forEach((fuel) => {
      if (fuel.type) {
        options.add(fuel.type);
      }
    });
    return Array.from(options).sort();
  }, [fuelsData?.results]);

  const updateFilter = (key: keyof SalesReportFilters, value: string) => {
    setFilters((current) => ({
      ...current,
      [key]: value || undefined,
    }));
  };

  const dailyRows = (dailyReport ?? []).map((row: DailySalesReportRow) => [
    row.date,
    row.fuel,
    `${formatAmount(row.liters_sold)} L`,
    formatAmount(row.price),
    formatAmount(row.total_amount),
  ]);

  const monthlyRows = (monthlySummary ?? []).map((row: MonthlySalesSummaryRow) => [
    row.fuel,
    `${formatAmount(row.liters_sold)} L`,
    formatAmount(row.total_revenue),
  ]);

  const byFuelRows = (byFuelReport ?? []).map((row: SalesByFuelTypeRow) => [
    row.fuel,
    `${formatAmount(row.liters_sold)} L`,
    formatAmount(row.total_revenue),
  ]);

  const isLoading = isDailyLoading || isMonthlyLoading || isByFuelLoading;
  const errorMessage =
    (isDailyError && extractAxiosError(dailyError, 'Failed to load daily sales report.')) ||
    (isMonthlyError && extractAxiosError(monthlyError, 'Failed to load monthly sales summary.')) ||
    (isByFuelError && extractAxiosError(byFuelError, 'Failed to load sales by fuel type.')) ||
    '';

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sales Reports"
        subtitle="Analyze daily, monthly, and fuel-type sales performance."
        actions={[
          {
            label: 'Refresh',
            icon: <RefreshCw className="h-4 w-4" />,
            variant: 'outline',
            onClick: () => queryClient.invalidateQueries({ queryKey: reportKeys.root }),
          },
        ]}
      />

      {errorMessage && (
        <Alert variant="error" title="Unable to load reports">
          {errorMessage}
        </Alert>
      )}

      <Card>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Input
              type="date"
              label="Start Date"
              value={filters.start_date || ''}
              onChange={(event) => updateFilter('start_date', event.target.value)}
            />
            <Input
              type="date"
              label="End Date"
              value={filters.end_date || ''}
              onChange={(event) => updateFilter('end_date', event.target.value)}
            />
            <Select
              label="Fuel Type"
              value={filters.fuel_type || ''}
              options={[
                { value: '', label: 'All types' },
                ...fuelTypes.map((type) => ({ value: type, label: type })),
              ]}
              onChange={(event) => updateFilter('fuel_type', event.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader
          title="Daily Sales Report"
          subtitle="Liters, price, and totals by date and fuel type."
        />
        <CardContent>
          {isLoading ? (
            <Skeleton variant="rounded" height={180} />
          ) : (
            <SummaryTable
              headers={['Date', 'Fuel', 'Liters Sold', 'Price', 'Total Amount']}
              rows={dailyRows}
              emptyMessage="No daily sales records found."
            />
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader
            title="Monthly Sales Summary"
            subtitle="Total liters and revenue grouped by fuel type."
          />
          <CardContent>
            {isLoading ? (
              <Skeleton variant="rounded" height={160} />
            ) : (
              <SummaryTable
                headers={['Fuel', 'Total Liters', 'Total Revenue']}
                rows={monthlyRows}
                emptyMessage="No monthly summary data found."
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader
            title="Sales by Fuel Type"
            subtitle="Overall sales performance by fuel category."
          />
          <CardContent>
            {isLoading ? (
              <Skeleton variant="rounded" height={160} />
            ) : (
              <SummaryTable
                headers={['Fuel', 'Total Liters', 'Total Revenue']}
                rows={byFuelRows}
                emptyMessage="No sales data found for the selected fuel type."
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
