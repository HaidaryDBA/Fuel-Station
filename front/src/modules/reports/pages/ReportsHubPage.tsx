import { type ReactNode, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Download, Printer, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

import { PageHeader } from '@/components';
import { Button, Card, CardContent, Input, Select } from '@/components/ui';
import { useCurrenciesList } from '@/modules/financial';
import { useFuelsList, useTankStoragesList } from '@/modules/inventory';
import { extractAxiosError } from '@/utils/extractError';

import reportsService from '../services/reportsService';
import type {
  AccountBalanceReportRow,
  DailySeriesPoint,
  OutstandingLendingRow,
  PurchaseSummaryRow,
  ReportFilters,
  TankStockReportRow,
} from '../types/reports';
import {
  useAccountBalancesReport,
  useDueSoonLendingsReport,
  useOutstandingLendingsReport,
  usePurchaseSummaryReport,
  useReportsOverview,
  useSalesDailyReport,
  useTankStockReport,
} from '../queries/useReportQueries';
import { reportKeys } from '../queries/reportKeys';


const formatAmount = (value?: string | number) => Number(value || 0).toFixed(2);

const todayString = () => new Date().toISOString().slice(0, 10);

function ReportsTable({
  headers,
  rows,
  emptyMessage,
}: {
  headers: string[];
  rows: ReactNode[][];
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

export default function ReportsHubPage() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<ReportFilters>({
    date_from: todayString(),
    date_to: todayString(),
  });

  const { data: overview, isLoading: isLoadingOverview } = useReportsOverview(filters);
  const { data: tankStock } = useTankStockReport(filters);
  const { data: accountBalances } = useAccountBalancesReport(filters);
  const { data: salesDaily } = useSalesDailyReport(filters);
  const { data: outstandingLendings } = useOutstandingLendingsReport(filters);
  const { data: dueSoonLendings } = useDueSoonLendingsReport(filters);
  const { data: purchaseSummary } = usePurchaseSummaryReport(filters);

  const { data: fuelsData } = useFuelsList({ page_size: 300 });
  const { data: tanksData } = useTankStoragesList({ page_size: 300 });
  const { data: currenciesData } = useCurrenciesList();

  const fuels = fuelsData?.results ?? [];
  const tanks = tanksData?.results ?? [];
  const currencies = currenciesData?.results ?? [];

  const inventoryChartData = useMemo(
    () =>
      (tankStock?.rows ?? []).map((row) => ({
        label: `Tank ${row.tank_number}`,
        current: Number(row.current_liters),
        threshold: row.min_level_alert,
      })),
    [tankStock?.rows]
  );

  const salesChartData = useMemo(
    () =>
      (salesDaily?.daily_series ?? []).map((row: DailySeriesPoint) => ({
        date: row.date,
        quantity: Number(row.quantity || 0),
        total: Number(row.total_amount_in_base_currency || 0),
      })),
    [salesDaily?.daily_series]
  );

  const purchaseChartData = useMemo(
    () =>
      (purchaseSummary?.daily_series ?? []).map((row: PurchaseSummaryRow) => ({
        date: row.date,
        total: Number(row.total_amount_in_base_currency || 0),
        paid: Number(row.total_paid_in_base_currency || 0),
      })),
    [purchaseSummary?.daily_series]
  );

  const updateFilter = (key: keyof ReportFilters, value: string) => {
    setFilters((current) => ({
      ...current,
      [key]: value ? (Number.isNaN(Number(value)) || key.includes('date') ? value : Number(value)) : undefined,
    }));
  };

  const handleExport = async (reportKey: string, filename: string) => {
    try {
      const response = await reportsService.exportCsv(reportKey, filters);
      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error(extractAxiosError(error, 'Failed to export report'));
    }
  };

  const inventoryRows = (tankStock?.rows ?? []).map((row: TankStockReportRow) => [
    `Tank #${row.tank_number}`,
    row.fuel_name,
    formatAmount(row.current_liters),
    formatAmount(row.capacity),
    formatAmount(row.remaining_capacity),
    row.low_stock ? 'Low' : 'OK',
  ]);

  const accountRows = (accountBalances?.rows ?? []).map((row: AccountBalanceReportRow) => [
    row.account_name,
    row.account_type,
    `${formatAmount(row.native_balance)} ${row.currency_code}`,
    formatAmount(row.base_balance),
  ]);

  const outstandingRows = (outstandingLendings?.rows ?? []).map((row: OutstandingLendingRow) => [
    `#${row.lending_id}`,
    row.customer_name,
    row.tank_name || '-',
    row.end_date,
    formatAmount(row.remaining_amount),
    row.status,
  ]);

  const dueSoonRows = (dueSoonLendings?.rows ?? []).map((row: OutstandingLendingRow) => [
    `#${row.lending_id}`,
    row.customer_name,
    row.tank_name || '-',
    row.end_date,
    formatAmount(row.remaining_amount),
    row.status,
  ]);

  const purchaseRows = (purchaseSummary?.daily_series ?? []).map((row: PurchaseSummaryRow) => [
    row.date,
    formatAmount(row.liters),
    formatAmount(row.total_amount_in_base_currency),
    formatAmount(row.total_paid_in_base_currency),
    formatAmount(row.total_remaining_in_base_currency),
    String(row.count),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        subtitle="Monitor tank stock, money balances, sales, lendings, purchases, and financial summaries from one hub."
        actions={[
          {
            label: 'Refresh',
            icon: <RefreshCw className="h-4 w-4" />,
            variant: 'outline',
            onClick: () => queryClient.invalidateQueries({ queryKey: reportKeys.root }),
          },
          {
            label: 'Print / PDF',
            icon: <Printer className="h-4 w-4" />,
            variant: 'outline',
            onClick: () => window.print(),
          },
        ]}
      />

      <Card className="print:hidden">
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
            <Input
              type="date"
              label="From"
              value={filters.date_from || ''}
              onChange={(event) => updateFilter('date_from', event.target.value)}
            />
            <Input
              type="date"
              label="To"
              value={filters.date_to || ''}
              onChange={(event) => updateFilter('date_to', event.target.value)}
            />
            <Select
              label="Fuel"
              value={filters.fuel_id ? String(filters.fuel_id) : ''}
              options={[
                { value: '', label: 'All fuels' },
                ...fuels.map((fuel) => ({ value: String(fuel.id), label: `${fuel.fuel_name} (${fuel.type})` })),
              ]}
              onChange={(event) => updateFilter('fuel_id', event.target.value)}
            />
            <Select
              label="Tank"
              value={filters.tank_id ? String(filters.tank_id) : ''}
              options={[
                { value: '', label: 'All tanks' },
                ...tanks.map((tank) => ({
                  value: String(tank.id),
                  label: `Tank #${tank.tank_number} (${tank.fuel_name || `Fuel #${tank.Fuel}`})`,
                })),
              ]}
              onChange={(event) => updateFilter('tank_id', event.target.value)}
            />
            <Select
              label="Currency"
              value={filters.currency_id ? String(filters.currency_id) : ''}
              options={[
                { value: '', label: 'All currencies' },
                ...currencies.map((currency) => ({
                  value: String(currency.id),
                  label: `${currency.code} - ${currency.name}`,
                })),
              ]}
              onChange={(event) => updateFilter('currency_id', event.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-text-secondary">Fuel In Tanks</p>
            <p className="mt-2 text-2xl font-semibold text-text-primary">
              {formatAmount(overview?.inventory.summary.total_current_liters)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-text-secondary">Low Stock Tanks</p>
            <p className="mt-2 text-2xl font-semibold text-text-primary">
              {overview?.inventory.summary.low_stock_count ?? 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-text-secondary">Cash Balance</p>
            <p className="mt-2 text-2xl font-semibold text-text-primary">
              {formatAmount(overview?.finance.summary.total_cash_base)} {overview?.finance.summary.base_currency_code}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-text-secondary">Exchange Balance</p>
            <p className="mt-2 text-2xl font-semibold text-text-primary">
              {formatAmount(overview?.finance.summary.total_exchange_base)} {overview?.finance.summary.base_currency_code}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-text-primary">Tank Stock</h2>
                <p className="text-sm text-text-secondary">Current liters by tanker storage.</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="print:hidden"
                leftIcon={<Download className="h-4 w-4" />}
                onClick={() => handleExport('inventory-stock', 'tank-stock.csv')}
              >
                CSV
              </Button>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={inventoryChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="current" fill="#0f766e" name="Current liters" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="threshold" fill="#f59e0b" name="Alert level" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-6">
              <ReportsTable
                headers={['Tank', 'Fuel', 'Current', 'Capacity', 'Remaining', 'Status']}
                rows={inventoryRows}
                emptyMessage="No tank stock rows found."
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-text-primary">Daily Sales</h2>
              <p className="text-sm text-text-secondary">Base-currency sales and sold liters by day.</p>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="total" stroke="#2563eb" strokeWidth={3} name="Base total" />
                  <Line type="monotone" dataKey="quantity" stroke="#16a34a" strokeWidth={3} name="Liters sold" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-text-primary">Purchasing Trend</h2>
            <p className="text-sm text-text-secondary">Daily purchasing totals and paid amounts in base currency.</p>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={purchaseChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="total" stroke="#b45309" fill="#fde68a" name="Purchase total" />
                <Area type="monotone" dataKey="paid" stroke="#15803d" fill="#bbf7d0" name="Paid total" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-text-primary">Account Balances</h2>
                <p className="text-sm text-text-secondary">Native balances and converted base totals.</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="print:hidden"
                leftIcon={<Download className="h-4 w-4" />}
                onClick={() => handleExport('account-balances', 'account-balances.csv')}
              >
                CSV
              </Button>
            </div>
            <ReportsTable
              headers={['Account', 'Type', 'Native Balance', 'Base Balance']}
              rows={accountRows}
              emptyMessage="No account balances found."
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-text-primary">Outstanding Lendings</h2>
                <p className="text-sm text-text-secondary">All lendings that still have unpaid amounts.</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="print:hidden"
                leftIcon={<Download className="h-4 w-4" />}
                onClick={() => handleExport('lendings-outstanding', 'outstanding-lendings.csv')}
              >
                CSV
              </Button>
            </div>
            <ReportsTable
              headers={['Lending', 'Customer', 'Tank', 'End Date', 'Remaining', 'Status']}
              rows={outstandingRows}
              emptyMessage="No outstanding lendings found."
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-text-primary">Due Soon Lendings</h2>
                <p className="text-sm text-text-secondary">
                  Upcoming lendings ending within 7 days. Overdue now: {overview?.lendings.due_soon.summary.overdue_count ?? 0}
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="print:hidden"
                leftIcon={<Download className="h-4 w-4" />}
                onClick={() => handleExport('lendings-due-soon', 'due-soon-lendings.csv')}
              >
                CSV
              </Button>
            </div>
            <ReportsTable
              headers={['Lending', 'Customer', 'Tank', 'End Date', 'Remaining', 'Status']}
              rows={dueSoonRows}
              emptyMessage="No due-soon lendings found."
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-text-primary">Purchase Summary</h2>
                <p className="text-sm text-text-secondary">Daily liters, total, paid, and remaining purchase amounts.</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="print:hidden"
                leftIcon={<Download className="h-4 w-4" />}
                onClick={() => handleExport('purchases-summary', 'purchase-summary.csv')}
              >
                CSV
              </Button>
            </div>
            <ReportsTable
              headers={['Date', 'Liters', 'Total', 'Paid', 'Remaining', 'Count']}
              rows={purchaseRows}
              emptyMessage="No purchases found."
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-text-secondary">Expenses</p>
            <p className="mt-2 text-2xl font-semibold text-text-primary">
              {formatAmount(overview?.expenses.total_amount_in_base_currency)} {overview?.finance.summary.base_currency_code}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-text-secondary">Partner Debt Outstanding</p>
            <p className="mt-2 text-2xl font-semibold text-text-primary">
              {formatAmount(overview?.partner_debts.total_outstanding)} {overview?.partner_debts.base_currency_code}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-text-secondary">Salary Payouts</p>
            <p className="mt-2 text-2xl font-semibold text-text-primary">{formatAmount(overview?.salaries.total_net_salary)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <h2 className="text-lg font-semibold text-text-primary">Latest Currency Rates</h2>
          <p className="mb-4 text-sm text-text-secondary">
            Reference rates used for converted management totals.
          </p>
          <ReportsTable
            headers={['Date', 'From', 'To', 'Rate']}
            rows={(overview?.currency_rates.latest ?? []).map((row) => [
              row.date,
              row.from_currency__code,
              row.to_currency__code,
              row.rate_value,
            ])}
            emptyMessage={isLoadingOverview ? 'Loading reports...' : 'No recent currency rates found.'}
          />
        </CardContent>
      </Card>
    </div>
  );
}
