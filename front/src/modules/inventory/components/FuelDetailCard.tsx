import { useTranslation } from 'react-i18next';

import { Card, CardContent, CardHeader } from '@/components/ui';

import type { Fuel } from '../types/inventory';

interface FuelDetailCardProps {
  fuel: Fuel;
}

export default function FuelDetailCard({ fuel }: FuelDetailCardProps) {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader title={t('inventory.fuelDetails')} />
      <CardContent>
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-text-secondary">{t('inventory.fuelName')}</dt>
            <dd className="mt-1 text-sm text-text-primary">{fuel.fuel_name}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-text-secondary">{t('inventory.type')}</dt>
            <dd className="mt-1 text-sm text-text-primary">{fuel.type}</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}
