import { Pencil, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Badge, Button, Card, DataTable, type Column } from '@/components/ui';
import { truncateText } from '@/utils/truncateText';

import type { Account } from '../types/financial';

interface AccountTableProps {
  accounts: Account[];
  loading?: boolean;
  onEdit: (account: Account) => void;
  onDelete: (account: Account) => void;
}

const accountTypeLabelMap: Record<Account['account_type'], { key: string; fallback: string }> = {
  cash: { key: 'financial.accountTypeCash', fallback: 'Cash' },
  exchange: { key: 'financial.accountTypeExchange', fallback: 'Exchange' },
};

export default function AccountTable({ accounts, loading, onEdit, onDelete }: AccountTableProps) {
  const { t } = useTranslation();

  const columns: Column<Account>[] = [
    {
      key: 'name',
      label: t('financial.name', 'Name'),
      header: t('financial.name', 'Name'),
      sortable: true,
      render: (account) => account.name,
    },
    {
      key: 'account_type',
      label: t('financial.accountType', 'Account Type'),
      header: t('financial.accountType', 'Account Type'),
      sortable: true,
      render: (account) =>
        t(
          accountTypeLabelMap[account.account_type].key,
          accountTypeLabelMap[account.account_type].fallback
        ),
    },
    {
      key: 'currency_code',
      label: t('financial.currency', 'Currency'),
      header: t('financial.currency', 'Currency'),
      render: (account) => account.currency_code,
    },
    {
      key: 'description',
      label: t('financial.description', 'Description'),
      header: t('financial.description', 'Description'),
      render: (account) => {
        const description = account.description.trim();
        if (!description) {
          return '-';
        }

        return <span title={description}>{truncateText(description, 50)}</span>;
      },
    },
    {
      key: 'is_active',
      label: t('financial.status', 'Status'),
      header: t('financial.status', 'Status'),
      render: (account) => (
        <Badge variant={account.is_active ? 'success' : 'warning'}>
          {account.is_active ? t('financial.active', 'Active') : t('financial.inactive', 'Inactive')}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: t('financial.actions'),
      header: t('financial.actions'),
      render: (account) => (
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={() => onEdit(account)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => onDelete(account)}>
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
        data={accounts}
        loading={loading}
        pagination={false}
        emptyMessage={t('financial.noAccountsFound', 'No accounts found')}
        getRowKey={(account) => account.id}
      />
    </Card>
  );
}
