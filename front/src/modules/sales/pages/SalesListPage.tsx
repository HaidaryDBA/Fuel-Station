import { Plus, RefreshCw, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { PageHeader } from '@/components';
import { Button, Card, CardContent, Input, Pagination, PaginationInfo, Select } from '@/components/ui';
import { extractAxiosError } from '@/utils/extractError';

import SalesTable from '../components/SalesTable';
import { useSaleFilters } from '../hooks/useSaleFilters';
import {
  useCurrencyOptions,
  useDeleteSale,
  useFuelOptions,
  useMotorOptions,
  useSalesList,
  useSalesSummary,
} from '../queries/useSalesQueries';
import type { Sale } from '../types/sale';

export default function SalesListPage() {
  const navigate = useNavigate();
  const { filters, params, updateFilter, setPage, clearFilters } = useSaleFilters();
  const { data, isLoading, isError, refetch } = useSalesList(params);
  const { data: summary } = useSalesSummary(params);
  const { data: fuelsData } = useFuelOptions();
  const { data: motorsData } = useMotorOptions();
  const { data: currenciesData } = useCurrencyOptions();
  const deleteSale = useDeleteSale();

  const sales = data?.results || [];
  const totalCount = data?.count || 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / filters.pageSize));
  const fuels = fuelsData?.results || [];
  const motors = motorsData?.results || [];
  const currencies = currenciesData?.results || [];

  const handleDelete = async (sale: Sale) => {
    try {
      const confirmed = window.confirm(`Delete sale #${sale.sale_id}?`);
      if (!confirmed) {
        return;
      }
      await deleteSale.mutateAsync(sale.id);
      toast.success('Sale deleted');
    } catch (error) {
      toast.error(extractAxiosError(error, 'Failed to delete sale'));
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sales"
        subtitle="Record fuel sales by motor, fuel, currency, and value."
        actions={[
          {
            label: 'Add Sale',
            icon: <Plus className="h-4 w-4" />,
            onClick: () => navigate('/sales/sales/new'),
          },
        ]}
      />

      <Card>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Input
              placeholder="Search by fuel, motor, currency, or ID"
              value={filters.search}
              leftIcon={<Search className="h-4 w-4" />}
              onChange={(event) => updateFilter('search', event.target.value)}
            />
            <Select
              value={filters.fuel ? String(filters.fuel) : ''}
              options={[
                { value: '', label: 'All fuels' },
                ...fuels.map((fuel) => ({ value: String(fuel.id), label: `${fuel.fuel_name} (${fuel.type})` })),
              ]}
              onChange={(event) => updateFilter('fuel', event.target.value)}
            />
            <Select
              value={filters.motor ? String(filters.motor) : ''}
              options={[
                { value: '', label: 'All motors' },
                ...motors.map((motor) => ({ value: String(motor.id), label: motor.motor_name })),
              ]}
              onChange={(event) => updateFilter('motor', event.target.value)}
            />
            <Select
              value={filters.currency ? String(filters.currency) : ''}
              options={[
                { value: '', label: 'All currencies' },
                ...currencies.map((currency) => ({
                  value: String(currency.id),
                  label: `${currency.code} - ${currency.name}`,
                })),
              ]}
              onChange={(event) => updateFilter('currency', event.target.value)}
            />
            <Input
              type="date"
              label="From Date"
              value={filters.saleDateFrom}
              onChange={(event) => updateFilter('sale_date_from', event.target.value)}
            />
            <Input
              type="date"
              label="To Date"
              value={filters.saleDateTo}
              onChange={(event) => updateFilter('sale_date_to', event.target.value)}
            />
            <Select
              value={String(filters.pageSize)}
              options={[
                { value: '10', label: '10 per page' },
                { value: '25', label: '25 per page' },
                { value: '50', label: '50 per page' },
              ]}
              onChange={(event) => updateFilter('page_size', Number(event.target.value))}
            />
            <Select
              value={filters.ordering}
              options={[
                { value: '-sale_date', label: 'Newest' },
                { value: 'sale_date', label: 'Oldest' },
                { value: '-total_amount_value', label: 'Highest total' },
                { value: 'total_amount_value', label: 'Lowest total' },
              ]}
              onChange={(event) => updateFilter('ordering', event.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" leftIcon={<RefreshCw className="h-4 w-4" />} onClick={() => refetch()}>
              Refresh
            </Button>
            <Button variant="ghost" onClick={clearFilters}>
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-text-secondary">Sales Records</p>
            <p className="mt-2 text-2xl font-semibold text-text-primary">{summary?.count ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-text-secondary">Total Quantity</p>
            <p className="mt-2 text-2xl font-semibold text-text-primary">
              {Number(summary?.total_quantity || 0).toFixed(2)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-text-secondary">Total Amount</p>
            <p className="mt-2 text-2xl font-semibold text-text-primary">
              {Number(summary?.total_amount || 0).toFixed(2)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-text-secondary">Base Total</p>
            <p className="mt-2 text-2xl font-semibold text-text-primary">
              {Number(summary?.total_amount_in_base_currency || 0).toFixed(2)} {summary?.base_currency_code || ''}
            </p>
          </CardContent>
        </Card>
      </div>

      {isError ? (
        <Card>
          <CardContent>
            <p className="text-sm text-error">Failed to load sales.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <SalesTable
            sales={sales}
            loading={isLoading}
            onEdit={(sale) => navigate(`/sales/sales/${sale.id}/edit`)}
            onDelete={handleDelete}
          />

          {!isLoading && totalCount > 0 ? (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <PaginationInfo currentPage={filters.page} pageSize={filters.pageSize} totalItems={totalCount} />
              <Pagination currentPage={filters.page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
