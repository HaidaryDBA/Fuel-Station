import { useTranslation } from 'react-i18next';

import { Card, CardContent, CardHeader } from '@/components/ui';

import type { FuelMotor } from '../types/inventory';

interface MotorDetailCardProps {
  motor: FuelMotor;
}

export default function MotorDetailCard({ motor }: MotorDetailCardProps) {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader title={t('inventory.motorDetails', 'Motor Details')} />
      <CardContent>
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-text-secondary">{t('inventory.motorName')}</dt>
            <dd className="mt-1 text-sm text-text-primary">{motor.motor_name}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-text-secondary">{t('inventory.tank')}</dt>
            <dd className="mt-1 text-sm text-text-primary">{motor.tank_name || `Tank #${motor.tank_id}`}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-text-secondary">{t('inventory.fuel')}</dt>
            <dd className="mt-1 text-sm text-text-primary">{motor.fuel_name || `Fuel #${motor.fuel_id}`}</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}
