import { Pencil, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button, Card, DataTable, type Column } from '@/components/ui';

import type { CurrencyRate } from '../types/financial';

interface CurrencyRateTableProps {
  rates: CurrencyRate[];
  loading?: boolean;
  onEdit: (rate: CurrencyRate) => void;
  onDelete: (rate: CurrencyRate) => void;
}

const formatRate = (value: string) => Number(value || 0).toFixed(6);

export default function CurrencyRateTable({ rates, loading, onEdit, onDelete }: CurrencyRateTableProps) {
  const { t } = useTranslation();

  const columns: Column<CurrencyRate>[] = [
    {
      key: 'from_currency_code',
      label: t('financial.fromCurrency', 'From Currency'),
      header: t('financial.fromCurrency', 'From Currency'),
      render: (rate) => rate.from_currency_code,
    },
    {
      key: 'to_currency_code',
      label: t('financial.toCurrency', 'To Currency'),
      header: t('financial.toCurrency', 'To Currency'),
      render: (rate) => rate.to_currency_code,
    },
    {
      key: 'rate_value',
      label: t('financial.rateValue', 'Rate'),
      header: t('financial.rateValue', 'Rate'),
      sortable: true,
      render: (rate) => formatRate(rate.rate_value),
    },
    {
      key: 'date',
      label: t('financial.date'),
      header: t('financial.date'),
      sortable: true,
      render: (rate) => new Date(rate.date).toLocaleDateString(),
    },
    {
      key: 'created_by_name',
      label: t('financial.createdBy', 'Created By'),
      header: t('financial.createdBy', 'Created By'),
      render: (rate) => rate.created_by_name,
    },
    {
      key: 'actions',
      label: t('financial.actions'),
      header: t('financial.actions'),
      render: (rate) => (
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={() => onEdit(rate)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => onDelete(rate)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Card padding="none">
      <DataTable
        columns={columns}
        data={rates}
        loading={loading}
        pagination={false}
        emptyMessage={t('financial.noCurrencyRatesFound', 'No currency rates found')}
        getRowKey={(rate) => rate.id}
      />
    </Card>
  );
}
