import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';

import { Button, Card, CardContent, CardHeader, Input, Select } from '@/components/ui';

import { fuelMotorFormSchema, type FuelMotorFormSchema } from '../schemas/inventorySchema';
import type { Fuel, FuelMotor, FuelMotorFormValues, TankStorage } from '../types/inventory';

interface MotorFormProps {
  motor?: FuelMotor;
  tanks: TankStorage[];
  fuels: Fuel[];
  onSubmit: (data: FuelMotorFormValues) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function MotorForm({
  motor,
  tanks,
  fuels,
  onSubmit,
  onCancel,
  isLoading,
}: MotorFormProps) {
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FuelMotorFormSchema>({
    resolver: zodResolver(fuelMotorFormSchema),
    defaultValues: {
      tank_id: motor?.tank_id || 0,
      motor_name: motor?.motor_name || '',
      fuel_id: motor?.fuel_id || 0,
    },
  });

  const tankOptions = tanks.map((tank) => ({
    label: `Tank #${tank.tank_number} (${tank.fuel_name || `Fuel #${tank.Fuel}`})`,
    value: String(tank.id),
  }));
  const fuelOptions = fuels.map((fuel) => ({
    label: `${fuel.fuel_name} (${fuel.type})`,
    value: String(fuel.id),
  }));

  return (
    <Card>
      <CardHeader title={motor ? t('inventory.editMotor', 'Edit Motor') : t('inventory.addMotor')} />
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Select
            label={t('inventory.tank')}
            {...register('tank_id', { valueAsNumber: true })}
            error={errors.tank_id?.message}
            options={tankOptions}
            placeholder={t('inventory.selectTank', 'Select Tank')}
          />

          <Input
            label={t('inventory.motorName')}
            {...register('motor_name')}
            error={errors.motor_name?.message}
            placeholder={t('inventory.motorName')}
          />

          <Select
            label={t('inventory.fuel')}
            {...register('fuel_id', { valueAsNumber: true })}
            error={errors.fuel_id?.message}
            options={fuelOptions}
            placeholder={t('inventory.selectFuel')}
          />

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onCancel}>
              {t('inventory.cancel')}
            </Button>
            <Button type="submit" loading={isLoading}>
              {motor ? t('inventory.update') : t('inventory.create')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
