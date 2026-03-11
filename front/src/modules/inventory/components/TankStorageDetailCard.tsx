import { useTranslation } from 'react-i18next';

import { Card, CardContent, CardHeader } from '@/components/ui';

import type { TankStorage } from '../types/inventory';

interface TankStorageDetailCardProps {
  tank: TankStorage;
}

export default function TankStorageDetailCard({ tank }: TankStorageDetailCardProps) {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader title={t('inventory.tankDetails')} />
      <CardContent>
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-text-secondary">{t('inventory.fuel')}</dt>
            <dd className="mt-1 text-sm text-text-primary">{tank.fuel_name || `Fuel #${tank.Fuel}`}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-text-secondary">{t('inventory.tankNumber')}</dt>
            <dd className="mt-1 text-sm text-text-primary">{tank.tank_number}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-text-secondary">{t('inventory.capacity')}</dt>
            <dd className="mt-1 text-sm text-text-primary">{tank.capacity}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-text-secondary">{t('inventory.minLevelAlert')}</dt>
            <dd className="mt-1 text-sm text-text-primary">{tank.min_level_alert}</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}
