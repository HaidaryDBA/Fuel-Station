import { Plus, RefreshCw, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { PageHeader } from '@/components';
import { Button, Card, CardContent, Input, Pagination, PaginationInfo, Select } from '@/components/ui';

import PurchaseTable from '../components/PurchaseTable';
import { usePurchaseFilters } from '../hooks/usePurchasingFilters';
import {
  useCurrencyOptions,
  useDeletePurchase,
  usePurchasesList,
  useSupplierOptions,
} from '../queries/usePurchasingQueries';
import type { PaymentStatus, Purchase } from '../types/purchasing';

export default function PurchasesListPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { filters, params, updateFilter, setPage, clearFilters } = usePurchaseFilters();
  const { data, isLoading, isError, refetch } = usePurchasesList(params);
  const { data: suppliersData } = useSupplierOptions();
  const { data: currenciesData } = useCurrencyOptions();
  const deletePurchaseMutation = useDeletePurchase();

  const purchases = data?.results ?? [];
  const totalCount = data?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / filters.pageSize));
  const suppliers = suppliersData?.results ?? [];
  const currencies = currenciesData?.results ?? [];

  const handleDelete = async (purchase: Purchase) => {
    const confirmed = window.confirm(
      t('purchasing.deletePurchaseConfirm', 'Delete purchase "{{name}}"?', {
        name: purchase.invoice_number || `#${purchase.purchase_id}`,
      })
    );
    if (!confirmed) {
      return;
    }

    await deletePurchaseMutation.mutateAsync(purchase.id);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('purchasing.purchasesTitle', 'Purchases')}
        subtitle={t('purchasing.purchasesSubtitle', 'Track fuel purchasing transactions')}
        actions={[
          {
            label: t('purchasing.addPurchase', 'Add Purchase'),
            icon: <Plus className="h-4 w-4" />,
            onClick: () => navigate('/purchasing/purchases/new'),
          },
        ]}
      />

      <Card>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
            <Input
              placeholder={t('purchasing.searchPurchases', 'Search purchases')}
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
              value={filters.currency ? String(filters.currency) : ''}
              options={[
                { label: t('purchasing.allCurrencies', 'All currencies'), value: '' },
                ...currencies.map((currency) => ({
                  label: `${currency.code} - ${currency.name}`,
                  value: String(currency.id),
                })),
              ]}
              onChange={(event) => updateFilter('currency', event.target.value)}
            />
            <Select
              value={filters.paymentStatus || ''}
              options={[
                { label: t('purchasing.allStatuses', 'All statuses'), value: '' },
                { label: t('purchasing.completed', 'Completed'), value: 'completed' },
                { label: t('purchasing.remaining', 'Remaining'), value: 'remaining' },
              ]}
              onChange={(event) => updateFilter('payment_status', event.target.value as PaymentStatus | '')}
            />
            <Select
              value={filters.ordering}
              options={[
                { label: t('purchasing.newest', 'Newest'), value: '-purchase_date' },
                { label: t('purchasing.oldest', 'Oldest'), value: 'purchase_date' },
                { label: t('purchasing.highestAmount', 'Highest amount'), value: '-paid_amount' },
                { label: t('purchasing.lowestAmount', 'Lowest amount'), value: 'paid_amount' },
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
            <p className="text-sm text-error">{t('purchasing.failedToLoadPurchases', 'Failed to load purchases')}</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <PurchaseTable
            purchases={purchases}
            loading={isLoading}
            onView={(purchase) => navigate(`/purchasing/purchases/${purchase.id}`)}
            onEdit={(purchase) => navigate(`/purchasing/purchases/${purchase.id}/edit`)}
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

