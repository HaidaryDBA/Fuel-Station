import { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { RefreshCw } from 'lucide-react';

import { PageHeader } from '@/components';
import { Alert, Card, CardContent, CardHeader, Input, Select, Skeleton } from '@/components/ui';
import { useAccountsList } from '@/modules/financial';
import { extractAxiosError } from '@/utils/extractError';

import { useFinanceAccountBalancesReport, useFinanceMoneyFlowReport } from '../queries/useReportQueries';
import { reportKeys } from '../queries/reportKeys';
import type { FinanceAccountBalanceRow, FinanceReportFilters, MoneyFlowRow } from '../types/reports';

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

export default function FinanceReportsPage() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<FinanceReportFilters>({});

  const { data: accountsData } = useAccountsList({ page_size: 300 });

  const {
    data: balances,
    isLoading: isBalancesLoading,
    isError: isBalancesError,
    error: balancesError,
  } = useFinanceAccountBalancesReport(filters);
  const {
    data: moneyFlow,
    isLoading: isMoneyFlowLoading,
    isError: isMoneyFlowError,
    error: moneyFlowError,
  } = useFinanceMoneyFlowReport(filters);

  const accounts = accountsData?.results ?? [];

  const updateFilter = (key: keyof FinanceReportFilters, value: string) => {
    setFilters((current) => ({
      ...current,
      [key]: value ? (key === 'account_id' ? Number(value) : value) : undefined,
    }));
  };

  const balanceRows = (balances ?? []).map((row: FinanceAccountBalanceRow) => [
    row.account,
    row.currency,
    `${formatAmount(row.balance)} ${row.currency}`,
  ]);

  const flowRows = (moneyFlow ?? []).map((row: MoneyFlowRow) => [
    row.date ? new Date(row.date).toLocaleString() : '-',
    row.transaction_type,
    `${formatAmount(row.amount)} ${row.currency}`,
    row.account,
    row.description || '-',
  ]);

  const isLoading = isBalancesLoading || isMoneyFlowLoading;
  const errorMessage =
    (isBalancesError && extractAxiosError(balancesError, 'Failed to load account balances.')) ||
    (isMoneyFlowError && extractAxiosError(moneyFlowError, 'Failed to load money flow report.')) ||
    '';

  const accountOptions = useMemo(
    () =>
      accounts.map((account) => ({
        value: String(account.id),
        label: `${account.name} (${account.currency_code})`,
      })),
    [accounts]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Finance Reports"
        subtitle="Track balances and money flow across financial accounts."
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
              label="Account"
              value={filters.account_id ? String(filters.account_id) : ''}
              options={[{ value: '', label: 'All accounts' }, ...accountOptions]}
              onChange={(event) => updateFilter('account_id', event.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader
          title="Account Balance Report"
          subtitle="Current balances for each account."
        />
        <CardContent>
          {isLoading ? (
            <Skeleton variant="rounded" height={160} />
          ) : (
            <SummaryTable
              headers={['Account', 'Currency', 'Balance']}
              rows={balanceRows}
              emptyMessage="No account balance data found."
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader
          title="Money Flow Report"
          subtitle="Transactions in the selected date range."
        />
        <CardContent>
          {isLoading ? (
            <Skeleton variant="rounded" height={180} />
          ) : (
            <SummaryTable
              headers={['Date', 'Type', 'Amount', 'Account', 'Description']}
              rows={flowRows}
              emptyMessage="No money flow records found."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
