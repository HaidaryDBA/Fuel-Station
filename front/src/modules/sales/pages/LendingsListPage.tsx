import { Plus, RefreshCw, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { PageHeader } from '@/components';
import { Button, Card, CardContent, Input, Pagination, PaginationInfo, Select } from '@/components/ui';
import { extractAxiosError } from '@/utils/extractError';

import LendingTable from '../components/LendingTable';
import { useLendingFilters } from '../hooks/useSaleFilters';
import {
  useCustomerOptions,
  useDeleteLending,
  useFuelOptions,
  useLendingsList,
  useLendingsSummary,
} from '../queries/useSalesQueries';
import type { Lending } from '../types/sale';

export default function LendingsListPage() {
  const navigate = useNavigate();
  const { filters, params, updateFilter, setPage, clearFilters } = useLendingFilters();
  const { data, isLoading, isError, refetch } = useLendingsList(params);
  const { data: summary } = useLendingsSummary(params);
  const { data: customersData } = useCustomerOptions();
  const { data: fuelsData } = useFuelOptions();
  const deleteLending = useDeleteLending();

  const lendings = data?.results || [];
  const totalCount = data?.count || 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / filters.pageSize));
  const customers = customersData?.results || [];
  const fuels = fuelsData?.results || [];

  const handleDelete = async (lending: Lending) => {
    try {
      const confirmed = window.confirm(`Delete lending #${lending.lending_id}?`);
      if (!confirmed) {
        return;
      }
      await deleteLending.mutateAsync(lending.id);
      toast.success('Lending deleted');
    } catch (error) {
      toast.error(extractAxiosError(error, 'Failed to delete lending'));
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lending"
        subtitle="Track credit sales, paid amounts, and remaining balances."
        actions={[
          {
            label: 'Add Lending',
            icon: <Plus className="h-4 w-4" />,
            onClick: () => navigate('/sales/lendings/new'),
          },
        ]}
      />

      <Card>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Input
              placeholder="Search by customer, guarantor, fuel, or ID"
              value={filters.search}
              leftIcon={<Search className="h-4 w-4" />}
              onChange={(event) => updateFilter('search', event.target.value)}
            />
            <Select
              value={filters.customer ? String(filters.customer) : ''}
              options={[
                { value: '', label: 'All customers' },
                ...customers.map((customer) => ({ value: String(customer.id), label: customer.full_name })),
              ]}
              onChange={(event) => updateFilter('customer', event.target.value)}
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
              value={filters.status || ''}
              options={[
                { value: '', label: 'All statuses' },
                { value: 'unpaid', label: 'Unpaid' },
                { value: 'partial', label: 'Partial' },
                { value: 'paid', label: 'Paid' },
                { value: 'overdue', label: 'Overdue' },
              ]}
              onChange={(event) => updateFilter('status', event.target.value)}
            />
            <Input
              type="date"
              label="Sale From"
              value={filters.saleDateFrom}
              onChange={(event) => updateFilter('sale_date_from', event.target.value)}
            />
            <Input
              type="date"
              label="Sale To"
              value={filters.saleDateTo}
              onChange={(event) => updateFilter('sale_date_to', event.target.value)}
            />
            <Input
              type="date"
              label="End From"
              value={filters.endDateFrom}
              onChange={(event) => updateFilter('end_date_from', event.target.value)}
            />
            <Input
              type="date"
              label="End To"
              value={filters.endDateTo}
              onChange={(event) => updateFilter('end_date_to', event.target.value)}
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
                { value: '-remaining_amount_value', label: 'Highest remaining' },
                { value: 'remaining_amount_value', label: 'Lowest remaining' },
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
            <p className="text-sm text-text-secondary">Lending Records</p>
            <p className="mt-2 text-2xl font-semibold text-text-primary">{summary?.count ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-text-secondary">Total Lending</p>
            <p className="mt-2 text-2xl font-semibold text-text-primary">{Number(summary?.total_amount || 0).toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-text-secondary">Total Paid</p>
            <p className="mt-2 text-2xl font-semibold text-text-primary">{Number(summary?.total_paid || 0).toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-text-secondary">Total Remaining</p>
            <p className="mt-2 text-2xl font-semibold text-text-primary">{Number(summary?.total_remaining || 0).toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-text-secondary">Total Discount</p>
            <p className="mt-2 text-2xl font-semibold text-text-primary">{Number(summary?.total_discount || 0).toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-text-secondary">Paid / Overdue</p>
            <p className="mt-2 text-2xl font-semibold text-text-primary">
              {summary?.paid_count ?? 0} / {summary?.overdue_count ?? 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {isError ? (
        <Card>
          <CardContent>
            <p className="text-sm text-error">Failed to load lendings.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <LendingTable
            lendings={lendings}
            loading={isLoading}
            onEdit={(lending) => navigate(`/sales/lendings/${lending.id}/edit`)}
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
