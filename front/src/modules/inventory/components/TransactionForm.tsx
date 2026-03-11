import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';

import { Button, Card, CardContent, CardHeader, Input, Select, Textarea } from '@/components/ui';

import {
  inventoryTransactionFormSchema,
  type InventoryTransactionFormSchema,
} from '../schemas/inventorySchema';
import type {
  Fuel,
  InventoryTransaction,
  InventoryTransactionFormValues,
  TankStorage,
} from '../types/inventory';

interface TransactionFormProps {
  transaction?: InventoryTransaction;
  tanks: TankStorage[];
  fuels: Fuel[];
  onSubmit: (data: InventoryTransactionFormValues) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const formatDateTimeLocal = (value?: string) => {
  if (!value) {
    return '';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  const pad = (num: number) => String(num).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
};

export default function TransactionForm({
  transaction,
  tanks,
  fuels,
  onSubmit,
  onCancel,
  isLoading,
}: TransactionFormProps) {
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InventoryTransactionFormSchema>({
    resolver: zodResolver(inventoryTransactionFormSchema),
    defaultValues: {
      tank_id: transaction?.tank_id || 0,
      fuel_id: transaction?.fuel_id || 0,
      transaction_type: transaction?.transaction_type || 'purchase_in',
      quantity: Number(transaction?.quantity || 1),
      reference_type: transaction?.reference_type || 'purchase',
      reference_id: transaction?.reference_id || 1,
      date_time: formatDateTimeLocal(transaction?.date_time),
      adjustment_direction: transaction?.adjustment_direction || null,
      description: transaction?.description || '',
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
      <CardHeader
        title={transaction ? t('inventory.editTransaction', 'Edit Transaction') : t('inventory.addTransaction', 'Add Transaction')}
      />
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Select
            label={t('inventory.tank')}
            {...register('tank_id', { valueAsNumber: true })}
            error={errors.tank_id?.message}
            options={tankOptions}
            placeholder={t('inventory.selectTank', 'Select Tank')}
          />

          <Select
            label={t('inventory.fuel')}
            {...register('fuel_id', { valueAsNumber: true })}
            error={errors.fuel_id?.message}
            options={fuelOptions}
            placeholder={t('inventory.selectFuel')}
          />

          <Select
            label={t('inventory.transactionType')}
            {...register('transaction_type')}
            error={errors.transaction_type?.message}
            options={[
              { label: t('inventory.purchaseIn'), value: 'purchase_in' },
              { label: t('inventory.saleOut'), value: 'sale_out' },
              { label: t('inventory.lendingOut'), value: 'lending_out' },
              { label: t('inventory.returnIn'), value: 'return_in' },
              { label: t('inventory.adjustment'), value: 'adjustment' },
            ]}
          />

          <Select
            label={t('inventory.adjustmentDirection', 'Adjustment Direction')}
            {...register('adjustment_direction', {
              setValueAs: (value) => (value ? value : null),
            })}
            error={errors.adjustment_direction?.message}
            options={[
              { label: t('inventory.noAdjustmentDirection', 'Not needed'), value: '' },
              { label: t('inventory.adjustmentIn', 'Add Stock'), value: 'in' },
              { label: t('inventory.adjustmentOut', 'Remove Stock'), value: 'out' },
            ]}
          />

          <Input
            label={t('inventory.quantity')}
            type="number"
            step="0.01"
            {...register('quantity', { valueAsNumber: true })}
            error={errors.quantity?.message}
          />

          <Select
            label={t('inventory.referenceType')}
            {...register('reference_type')}
            error={errors.reference_type?.message}
            options={[
              { label: 'Purchase', value: 'purchase' },
              { label: 'Sale', value: 'sale' },
              { label: 'Lending', value: 'lending' },
              { label: 'Adjustment', value: 'adjustment' },
            ]}
          />

          <Input
            label={t('inventory.referenceId')}
            type="number"
            {...register('reference_id', { valueAsNumber: true })}
            error={errors.reference_id?.message}
          />

          <Input
            label={t('inventory.dateTime')}
            type="datetime-local"
            {...register('date_time')}
            error={errors.date_time?.message}
          />

          <Textarea
            label={t('inventory.description')}
            {...register('description')}
            error={errors.description?.message}
            rows={3}
          />

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onCancel}>
              {t('inventory.cancel')}
            </Button>
            <Button type="submit" loading={isLoading}>
              {transaction ? t('inventory.update') : t('inventory.create')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
