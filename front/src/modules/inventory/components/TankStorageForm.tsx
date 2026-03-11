import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';

import { Button, Card, CardContent, CardHeader, Input, Select } from '@/components/ui';

import { tankStorageFormSchema, type TankStorageFormSchema } from '../schemas/inventorySchema';
import type { TankStorage, TankStorageFormValues, Fuel } from '../types/inventory';

interface TankStorageFormProps {
  tank?: TankStorage;
  fuels: Fuel[];
  onSubmit: (data: TankStorageFormValues) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function TankStorageForm({ tank, fuels, onSubmit, onCancel, isLoading }: TankStorageFormProps) {
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TankStorageFormSchema>({
    resolver: zodResolver(tankStorageFormSchema),
    defaultValues: {
      Fuel: tank?.Fuel || 0,
      tank_number: tank?.tank_number || 0,
      capacity: tank?.capacity || '',
      min_level_alert: tank?.min_level_alert || 0,
    },
  });

  const fuelOptions = fuels.map((f) => ({ label: `${f.fuel_name} (${f.type})`, value: String(f.id) }));

  return (
    <Card>
      <CardHeader title={tank ? t('inventory.editTank') : t('inventory.addTank')} />
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Select
            label={t('inventory.fuel')}
            {...register('Fuel', { valueAsNumber: true })}
            error={errors.Fuel?.message}
            options={fuelOptions}
            placeholder={t('inventory.selectFuel')}
          />

          <Input
            label={t('inventory.tankNumber')}
            type="number"
            {...register('tank_number', { valueAsNumber: true })}
            error={errors.tank_number?.message}
            placeholder={t('inventory.tankNumberPlaceholder')}
          />

          <Input
            label={t('inventory.capacity')}
            {...register('capacity')}
            error={errors.capacity?.message}
            placeholder={t('inventory.capacityPlaceholder')}
          />

          <Input
            label={t('inventory.minLevelAlert')}
            type="number"
            {...register('min_level_alert', { valueAsNumber: true })}
            error={errors.min_level_alert?.message}
            placeholder={t('inventory.minLevelAlertPlaceholder')}
          />

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onCancel}>
              {t('inventory.cancel')}
            </Button>
            <Button type="submit" loading={isLoading}>
              {tank ? t('inventory.update') : t('inventory.create')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
