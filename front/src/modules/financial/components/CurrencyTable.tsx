import { Pencil, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Badge, Button, Card, DataTable, type Column } from '@/components/ui';

import type { Currency } from '../types/financial';

interface CurrencyTableProps {
  currencies: Currency[];
  loading?: boolean;
  onEdit: (currency: Currency) => void;
  onDelete: (currency: Currency) => void;
}

export default function CurrencyTable({ currencies, loading, onEdit, onDelete }: CurrencyTableProps) {
  const { t } = useTranslation();

  const columns: Column<Currency>[] = [
    {
      key: 'code',
      label: t('financial.code', 'Code'),
      header: t('financial.code', 'Code'),
      sortable: true,
      render: (currency) => currency.code,
    },
    {
      key: 'name',
      label: t('financial.name', 'Name'),
      header: t('financial.name', 'Name'),
      sortable: true,
      render: (currency) => currency.name,
    },
    {
      key: 'symbol',
      label: t('financial.symbol', 'Symbol'),
      header: t('financial.symbol', 'Symbol'),
      render: (currency) => currency.symbol || '-',
    },
    {
      key: 'is_base',
      label: t('financial.base', 'Base'),
      header: t('financial.base', 'Base'),
      render: (currency) => (
        <Badge variant={currency.is_base ? 'primary' : 'outline'}>
          {currency.is_base ? t('financial.baseCurrency', 'Base') : t('financial.nonBase', 'No')}
        </Badge>
      ),
    },
    {
      key: 'is_active',
      label: t('financial.status', 'Status'),
      header: t('financial.status', 'Status'),
      render: (currency) => (
        <Badge variant={currency.is_active ? 'success' : 'warning'}>
          {currency.is_active ? t('financial.active', 'Active') : t('financial.inactive', 'Inactive')}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: t('financial.actions'),
      header: t('financial.actions'),
      render: (currency) => (
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={() => onEdit(currency)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => onDelete(currency)}>
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
        data={currencies}
        loading={loading}
        pagination={false}
        emptyMessage={t('financial.noCurrenciesFound', 'No currencies found')}
        getRowKey={(currency) => currency.id}
      />
    </Card>
  );
}
