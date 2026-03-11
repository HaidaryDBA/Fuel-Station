import { useTranslation } from 'react-i18next';

import { Card, CardContent, CardHeader } from '@/components/ui';

import type { PriceHistory } from '../types/inventory';

interface PriceDetailCardProps {
  priceHistory: PriceHistory;
}

export default function PriceDetailCard({ priceHistory }: PriceDetailCardProps) {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader title={t('inventory.priceDetails', 'Price Details')} />
      <CardContent>
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-text-secondary">{t('inventory.fuel')}</dt>
            <dd className="mt-1 text-sm text-text-primary">{priceHistory.fuel_name || `Fuel #${priceHistory.fuel}`}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-text-secondary">{t('inventory.price')}</dt>
            <dd className="mt-1 text-sm text-text-primary">{priceHistory.price}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-text-secondary">{t('inventory.startDate')}</dt>
            <dd className="mt-1 text-sm text-text-primary">{priceHistory.start_date}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-text-secondary">{t('inventory.endDate')}</dt>
            <dd className="mt-1 text-sm text-text-primary">{priceHistory.end_date || '-'}</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}
