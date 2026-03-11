import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';

import { Button, Card, CardContent, CardHeader, Input, Select } from '@/components/ui';

import { priceHistoryFormSchema, type PriceHistoryFormSchema } from '../schemas/inventorySchema';
import type { Fuel, PriceHistory, PriceHistoryFormValues } from '../types/inventory';

interface PriceFormProps {
  priceHistory?: PriceHistory;
  fuels: Fuel[];
  onSubmit: (data: PriceHistoryFormValues) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function PriceForm({
  priceHistory,
  fuels,
  onSubmit,
  onCancel,
  isLoading,
}: PriceFormProps) {
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PriceHistoryFormSchema>({
    resolver: zodResolver(priceHistoryFormSchema),
    defaultValues: {
      fuel: priceHistory?.fuel || 0,
      price: priceHistory?.price || 0,
      start_date: priceHistory?.start_date || '',
      end_date: priceHistory?.end_date || '',
    },
  });

  const fuelOptions = fuels.map((fuel) => ({
    label: `${fuel.fuel_name} (${fuel.type})`,
    value: String(fuel.id),
  }));

  return (
    <Card>
      <CardHeader title={priceHistory ? t('inventory.editPrice', 'Edit Price') : t('inventory.addPrice')} />
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Select
            label={t('inventory.fuel')}
            {...register('fuel', { valueAsNumber: true })}
            error={errors.fuel?.message}
            options={fuelOptions}
            placeholder={t('inventory.selectFuel')}
          />

          <Input
            label={t('inventory.price')}
            type="number"
            {...register('price', { valueAsNumber: true })}
            error={errors.price?.message}
            placeholder={t('inventory.price')}
          />

          <Input
            label={t('inventory.startDate')}
            type="date"
            {...register('start_date')}
            error={errors.start_date?.message}
          />

          <Input
            label={t('inventory.endDate')}
            type="date"
            {...register('end_date')}
            error={errors.end_date?.message}
          />

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onCancel}>
              {t('inventory.cancel')}
            </Button>
            <Button type="submit" loading={isLoading}>
              {priceHistory ? t('inventory.update') : t('inventory.create')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
