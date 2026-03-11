import { Plus, RefreshCw, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { PageHeader } from '@/components';
import { Button, Card, CardContent, Input, Pagination, PaginationInfo, Select } from '@/components/ui';

import OrderPurchaseTable from '../components/OrderPurchaseTable';
import { useOrderPurchaseFilters } from '../hooks/usePurchasingFilters';
import {
  useDeleteOrderPurchase,
  useOrderPurchasesList,
  useSupplierOptions,
  useTankOptions,
} from '../queries/usePurchasingQueries';
import type { OrderPurchase } from '../types/purchasing';

export default function OrderPurchasesListPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { filters, params, updateFilter, setPage, clearFilters } = useOrderPurchaseFilters();
  const { data, isLoading, isError, refetch } = useOrderPurchasesList(params);
  const { data: suppliersData } = useSupplierOptions();
  const { data: tanksData } = useTankOptions();
  const deleteOrderPurchaseMutation = useDeleteOrderPurchase();

  const orderPurchases = data?.results ?? [];
  const totalCount = data?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / filters.pageSize));
  const suppliers = suppliersData?.results ?? [];
  const tanks = tanksData?.results ?? [];

  const handleDelete = async (orderPurchase: OrderPurchase) => {
    const confirmed = window.confirm(
      t('purchasing.deleteOrderPurchaseConfirm', 'Delete order purchase "{{name}}"?', {
        name: `#${orderPurchase.order_id}`,
      })
    );
    if (!confirmed) {
      return;
    }

    await deleteOrderPurchaseMutation.mutateAsync(orderPurchase.id);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('purchasing.orderPurchasesTitle', 'Order Purchases')}
        subtitle={t('purchasing.orderPurchasesSubtitle', 'Manage purchase orders and tanker allocations')}
        actions={[
          {
            label: t('purchasing.addOrderPurchase', 'Add Order Purchase'),
            icon: <Plus className="h-4 w-4" />,
            onClick: () => navigate('/purchasing/orders/new'),
          },
        ]}
      />

      <Card>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Input
              placeholder={t('purchasing.searchOrderPurchases', 'Search order purchases')}
              value={filters.search}
              leftIcon={<Search className="h-4 w-4" />}
              onChange={(event) => updateFilter('search', event.target.value)}
            />
            <Select
              value={filters.supplier ? String(filters.supplier) : ''}
              options={[
                { label: t('purchasing.allSuppliers', 'All suppliers'), value: '' },
                ...suppliers.map((supplier) => ({ label: supplier.supplier_name, value: String(supplier.id) })),
              ]}
              onChange={(event) => updateFilter('supplier', event.target.value)}
            />
            <Select
              value={filters.tanker ? String(filters.tanker) : ''}
              options={[
                { label: t('purchasing.allTankers', 'All tankers'), value: '' },
                ...tanks.map((tank) => ({
                  label: `Tank #${tank.tank_number} (${tank.fuel_name || `Fuel #${tank.Fuel}`})`,
                  value: String(tank.id),
                })),
              ]}
              onChange={(event) => updateFilter('tanker', event.target.value)}
            />
            <Select
              value={filters.ordering}
              options={[
                { label: t('purchasing.newest', 'Newest'), value: '-date' },
                { label: t('purchasing.oldest', 'Oldest'), value: 'date' },
                { label: t('purchasing.highestAmount', 'Highest amount'), value: '-purchase_price' },
                { label: t('purchasing.lowestAmount', 'Lowest amount'), value: 'purchase_price' },
              ]}
              onChange={(event) => updateFilter('ordering', event.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={String(filters.pageSize)}
              options={[
                { label: t('purchasing.perPage10', '10 per page'), value: '10' },
                { label: t('purchasing.perPage25', '25 per page'), value: '25' },
                { label: t('purchasing.perPage50', '50 per page'), value: '50' },
              ]}
              onChange={(event) => updateFilter('page_size', Number(event.target.value))}
              fullWidth={false}
              className="min-w-[160px]"
            />
            <Button variant="outline" onClick={() => refetch()} leftIcon={<RefreshCw className="h-4 w-4" />}>
              {t('purchasing.refresh', 'Refresh')}
            </Button>
            <Button variant="ghost" onClick={clearFilters}>
              {t('purchasing.clear', 'Clear')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {isError ? (
        <Card>
          <CardContent>
            <p className="text-sm text-error">
              {t('purchasing.failedToLoadOrderPurchases', 'Failed to load order purchases')}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <OrderPurchaseTable
            orderPurchases={orderPurchases}
            loading={isLoading}
            onView={(orderPurchase) => navigate(`/purchasing/orders/${orderPurchase.id}`)}
            onEdit={(orderPurchase) => navigate(`/purchasing/orders/${orderPurchase.id}/edit`)}
            onDelete={handleDelete}
          />

          {!isLoading && totalCount > 0 && (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <PaginationInfo currentPage={filters.page} pageSize={filters.pageSize} totalItems={totalCount} />
              <Pagination currentPage={filters.page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          )}
        </>
      )}
    </div>
  );
}

