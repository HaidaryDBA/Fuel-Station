import { useTranslation } from 'react-i18next';

import { Badge, Card, CardContent, CardHeader } from '@/components/ui';

import type { InventoryTransaction } from '../types/inventory';

interface TransactionDetailCardProps {
  transaction: InventoryTransaction;
}

const statusVariantByType: Record<string, 'success' | 'warning' | 'info' | 'default'> = {
  purchase_in: 'success',
  sale_out: 'info',
  lending_out: 'warning',
  return_in: 'success',
  adjustment: 'default',
};

export default function TransactionDetailCard({ transaction }: TransactionDetailCardProps) {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader title={t('inventory.transactionDetails', 'Transaction Details')} />
      <CardContent>
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-text-secondary">{t('inventory.dateTime')}</dt>
            <dd className="mt-1 text-sm text-text-primary">
              {new Date(transaction.date_time).toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-text-secondary">{t('inventory.transactionType')}</dt>
            <dd className="mt-1">
              <Badge variant={statusVariantByType[transaction.transaction_type] || 'default'} size="sm">
                {t(`inventory.${transaction.transaction_type.replace('_', '')}`)}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-text-secondary">{t('inventory.tank')}</dt>
            <dd className="mt-1 text-sm text-text-primary">{transaction.tank_name || `Tank #${transaction.tank_id}`}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-text-secondary">{t('inventory.fuel')}</dt>
            <dd className="mt-1 text-sm text-text-primary">{transaction.fuel_name || `Fuel #${transaction.fuel_id}`}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-text-secondary">{t('inventory.quantity')}</dt>
            <dd className="mt-1 text-sm text-text-primary">{transaction.quantity}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-text-secondary">
              {t('inventory.adjustmentDirection', 'Adjustment Direction')}
            </dt>
            <dd className="mt-1 text-sm text-text-primary">{transaction.adjustment_direction || '-'}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-text-secondary">{t('inventory.referenceType')}</dt>
            <dd className="mt-1 text-sm text-text-primary">{transaction.reference_type}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-text-secondary">{t('inventory.referenceId')}</dt>
            <dd className="mt-1 text-sm text-text-primary">{transaction.reference_id}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-text-secondary">{t('inventory.description')}</dt>
            <dd className="mt-1 text-sm text-text-primary">{transaction.description || '-'}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-text-secondary">{t('inventory.createdBy', 'Created By')}</dt>
            <dd className="mt-1 text-sm text-text-primary">{transaction.created_by || '-'}</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}
