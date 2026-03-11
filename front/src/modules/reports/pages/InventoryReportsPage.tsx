import { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { RefreshCw } from 'lucide-react';

import { PageHeader } from '@/components';
import { Alert, Card, CardContent, CardHeader, Input, Select, Skeleton } from '@/components/ui';
import { useFuelsList } from '@/modules/inventory';
import { extractAxiosError } from '@/utils/extractError';

import {
  useInventoryFuelStockReport,
  useInventoryMovementsReport,
  useInventoryTankStatusReport,
} from '../queries/useReportQueries';
import { reportKeys } from '../queries/reportKeys';
import type {
  FuelMovementRow,
  FuelStockSummaryRow,
  InventoryReportFilters,
  TankStatusReportRow,
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

export default function InventoryReportsPage() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<InventoryReportFilters>({});

  const { data: fuelsData } = useFuelsList({ page_size: 300 });

  const {
    data: tankStatus,
    isLoading: isTankLoading,
    isError: isTankError,
    error: tankError,
  } = useInventoryTankStatusReport(filters);
  const {
    data: fuelStock,
    isLoading: isStockLoading,
    isError: isStockError,
    error: stockError,
  } = useInventoryFuelStockReport(filters);
  const {
    data: movements,
    isLoading: isMovementLoading,
    isError: isMovementError,
    error: movementError,
  } = useInventoryMovementsReport(filters);

  const fuelTypes = useMemo(() => {
    const options = new Set<string>();
    (fuelsData?.results ?? []).forEach((fuel) => {
      if (fuel.type) {
        options.add(fuel.type);
      }
    });
    return Array.from(options).sort();
  }, [fuelsData?.results]);

  const updateFilter = (key: keyof InventoryReportFilters, value: string) => {
    setFilters((current) => ({
      ...current,
      [key]: value || undefined,
    }));
  };

  const tankRows = (tankStatus ?? []).map((row: TankStatusReportRow) => [
    `Tank #${row.tank_number}`,
    row.fuel,
    `${formatAmount(row.capacity)} L`,
    `${formatAmount(row.current_quantity)} L`,
  ]);

  const stockRows = (fuelStock ?? []).map((row: FuelStockSummaryRow) => [
    row.fuel,
    `${formatAmount(row.total_liters)} L`,
  ]);

  const movementRows = (movements ?? []).map((row: FuelMovementRow) => [
    row.date ? new Date(row.date).toLocaleString() : '-',
    row.transaction_type,
    `${formatAmount(row.quantity)} L`,
    row.reference || '-',
  ]);

  const isLoading = isTankLoading || isStockLoading || isMovementLoading;
  const errorMessage =
    (isTankError && extractAxiosError(tankError, 'Failed to load tank status report.')) ||
    (isStockError && extractAxiosError(stockError, 'Failed to load fuel stock summary.')) ||
    (isMovementError && extractAxiosError(movementError, 'Failed to load movement report.')) ||
    '';

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory Reports"
        subtitle="Monitor tank capacity, fuel stock, and inventory movements."
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
          title="Tank Status Report"
          subtitle="Current quantity and capacity by tank."
        />
        <CardContent>
          {isLoading ? (
            <Skeleton variant="rounded" height={180} />
          ) : (
            <SummaryTable
              headers={['Tank', 'Fuel', 'Capacity', 'Current Quantity']}
              rows={tankRows}
              emptyMessage="No tank status data found."
            />
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader
            title="Fuel Stock Summary"
            subtitle="Total liters grouped by fuel type."
          />
          <CardContent>
            {isLoading ? (
              <Skeleton variant="rounded" height={160} />
            ) : (
              <SummaryTable
                headers={['Fuel', 'Total Liters']}
                rows={stockRows}
                emptyMessage="No fuel stock summary found."
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader
            title="Fuel Movement Report"
            subtitle="Inventory movement history and references."
          />
          <CardContent>
            {isLoading ? (
              <Skeleton variant="rounded" height={160} />
            ) : (
              <SummaryTable
                headers={['Date', 'Type', 'Quantity', 'Reference']}
                rows={movementRows}
                emptyMessage="No fuel movement records found."
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
