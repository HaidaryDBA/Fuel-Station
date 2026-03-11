import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { Button, Card, CardContent, CardHeader, Input, Select } from '@/components/ui';

import { saleFormSchema, type SaleFormSchema } from '../schemas/saleSchema';
import type { CurrencyOption, FuelOption, MotorOption, Sale, SaleFormValues } from '../types/sale';

interface SaleFormProps {
  sale?: Sale;
  fuels: FuelOption[];
  motors: MotorOption[];
  currencies: CurrencyOption[];
  onSubmit: (values: SaleFormValues) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export default function SaleForm({
  sale,
  fuels,
  motors,
  currencies,
  onSubmit,
  onCancel,
  isSubmitting,
}: SaleFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SaleFormSchema>({
    resolver: zodResolver(saleFormSchema),
    defaultValues: {
      fuel: sale?.fuel || 0,
      motor: sale?.motor || 0,
      sale_date: sale?.sale_date || '',
      amount: Number(sale?.amount || 0),
      unit_price: Number(sale?.unit_price || 0),
      currency: sale?.currency || 0,
    },
  });

  const selectedFuel = Number(watch('fuel') || 0);
  const amount = Number(watch('amount') || 0);
  const unitPrice = Number(watch('unit_price') || 0);
  const currencyId = Number(watch('currency') || 0);

  const totalAmount = amount * unitPrice;
  const selectedCurrency = currencies.find((currency) => currency.id === currencyId);
  const filteredMotors = motors.filter((motor) => !selectedFuel || motor.fuel_id === selectedFuel);

  return (
    <Card>
      <CardHeader title={sale ? 'Edit Sale' : 'Add Sale'} />
      <CardContent>
        <form
          className="space-y-5"
          onSubmit={handleSubmit((values) =>
            onSubmit({
              fuel: values.fuel,
              motor: values.motor,
              sale_date: values.sale_date,
              amount: values.amount,
              unit_price: values.unit_price,
              currency: values.currency,
            })
          )}
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Select
              label="Fuel"
              error={errors.fuel?.message}
              options={[
                { label: 'Select fuel', value: '' },
                ...fuels.map((fuel) => ({ label: `${fuel.fuel_name} (${fuel.type})`, value: String(fuel.id) })),
              ]}
              {...register('fuel', { valueAsNumber: true })}
            />
            <Select
              label="Motor"
              error={errors.motor?.message}
              options={[
                { label: 'Select motor', value: '' },
                ...filteredMotors.map((motor) => ({
                  label: `${motor.motor_name}${motor.tank_name ? ` - ${motor.tank_name}` : ''}`,
                  value: String(motor.id),
                })),
              ]}
              {...register('motor', { valueAsNumber: true })}
            />
            <Select
              label="Currency"
              error={errors.currency?.message}
              options={[
                { label: 'Select currency', value: '' },
                ...currencies.map((currency) => ({
                  label: `${currency.code} - ${currency.name}`,
                  value: String(currency.id),
                })),
              ]}
              {...register('currency', { valueAsNumber: true })}
            />
            <Input
              type="date"
              label="Sale Date"
              error={errors.sale_date?.message}
              {...register('sale_date')}
            />
            <Input
              type="number"
              step="0.01"
              label="Amount"
              error={errors.amount?.message}
              {...register('amount', { valueAsNumber: true })}
            />
            <Input
              type="number"
              step="0.01"
              label="Unit Price"
              error={errors.unit_price?.message}
              {...register('unit_price', { valueAsNumber: true })}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 rounded-xl border border-border bg-surface/30 p-4 md:grid-cols-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">Quantity</p>
              <p className="mt-1 text-lg font-semibold text-text-primary">{amount.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">Total Amount</p>
              <p className="mt-1 text-lg font-semibold text-text-primary">
                {totalAmount.toFixed(2)} {selectedCurrency?.code || ''}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">Motor Filter</p>
              <p className="mt-1 text-lg font-semibold text-text-primary">{filteredMotors.length} available</p>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting}>
              {sale ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
