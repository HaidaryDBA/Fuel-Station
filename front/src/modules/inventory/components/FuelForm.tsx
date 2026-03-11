import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';

import { Button, Card, CardContent, CardHeader, Input } from '@/components/ui';

import { fuelFormSchema, type FuelFormSchema } from '../schemas/inventorySchema';
import type { Fuel, FuelFormValues } from '../types/inventory';

interface FuelFormProps {
  fuel?: Fuel;
  onSubmit: (data: FuelFormValues) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function FuelForm({ fuel, onSubmit, onCancel, isLoading }: FuelFormProps) {
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FuelFormSchema>({
    resolver: zodResolver(fuelFormSchema),
    defaultValues: {
      fuel_name: fuel?.fuel_name || '',
      type: fuel?.type || '',
    },
  });

  return (
    <Card>
      <CardHeader title={fuel ? t('inventory.editFuel') : t('inventory.addFuel')} />
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label={t('inventory.fuelName')}
            {...register('fuel_name')}
            error={errors.fuel_name?.message}
            placeholder={t('inventory.fuelNamePlaceholder')}
          />

          <Input
            label={t('inventory.type')}
            {...register('type')}
            error={errors.type?.message}
            placeholder={t('inventory.typePlaceholder')}
          />

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onCancel}>
              {t('inventory.cancel')}
            </Button>
            <Button type="submit" loading={isLoading}>
              {fuel ? t('inventory.update') : t('inventory.create')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
