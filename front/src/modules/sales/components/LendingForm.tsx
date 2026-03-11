import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { Button, Card, CardContent, CardHeader, Input, Select } from '@/components/ui';

import { lendingFormSchema, type LendingFormSchema } from '../schemas/saleSchema';
import type { CustomerOption, FuelOption, Lending, LendingFormValues, TankOption } from '../types/sale';

interface LendingFormProps {
  lending?: Lending;
  customers: CustomerOption[];
  fuels: FuelOption[];
  tanks: TankOption[];
  onSubmit: (values: LendingFormValues) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export default function LendingForm({
  lending,
  customers,
  fuels,
  tanks,
  onSubmit,
  onCancel,
  isSubmitting,
}: LendingFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<LendingFormSchema>({
    resolver: zodResolver(lendingFormSchema),
    defaultValues: {
      customer: lending?.customer || 0,
      fuel: lending?.fuel || 0,
      tank_id: lending?.tank_id || 0,
      guarantor: lending?.guarantor ?? null,
      amount: Number(lending?.amount || 0),
      unit_price: Number(lending?.unit_price || 0),
      discount: Number(lending?.discount || 0),
      sale_date: lending?.sale_date || '',
      end_date: lending?.end_date || '',
      paid_amount: Number(lending?.paid_amount || 0),
    },
  });

  const amount = Number(watch('amount') || 0);
  const unitPrice = Number(watch('unit_price') || 0);
  const discount = Number(watch('discount') || 0);
  const paidAmount = Number(watch('paid_amount') || 0);

  const grossAmount = amount * unitPrice;
  const totalAmount = Math.max(grossAmount - discount, 0);
  const remainingAmount = Math.max(totalAmount - paidAmount, 0);

  return (
    <Card>
      <CardHeader title={lending ? 'Edit Lending' : 'Add Lending'} />
      <CardContent>
        <form
          className="space-y-5"
          onSubmit={handleSubmit((values) =>
            onSubmit({
              customer: values.customer,
              fuel: values.fuel,
              tank_id: values.tank_id,
              guarantor: values.guarantor || null,
              amount: values.amount,
              unit_price: values.unit_price,
              discount: values.discount,
              sale_date: values.sale_date,
              end_date: values.end_date,
              paid_amount: values.paid_amount,
            })
          )}
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Select
              label="Customer"
              error={errors.customer?.message}
              options={[
                { label: 'Select customer', value: '' },
                ...customers.map((customer) => ({ label: customer.full_name, value: String(customer.id) })),
              ]}
              {...register('customer', { valueAsNumber: true })}
            />
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
              label="Tank"
              error={errors.tank_id?.message}
              options={[
                { label: 'Select tank', value: '' },
                ...tanks.map((tank) => ({
                  label: `Tank #${tank.tank_number} (${tank.fuel_name || `Fuel #${tank.Fuel}`})`,
                  value: String(tank.id),
                })),
              ]}
              {...register('tank_id', { valueAsNumber: true })}
            />
            <Select
              label="Guarantor"
              error={errors.guarantor?.message}
              options={[
                { label: 'No guarantor', value: '' },
                ...customers.map((customer) => ({ label: customer.full_name, value: String(customer.id) })),
              ]}
              {...register('guarantor', { setValueAs: (value) => (value ? Number(value) : null) })}
            />
            <Input
              type="date"
              label="Sale Date"
              error={errors.sale_date?.message}
              {...register('sale_date')}
            />
            <Input
              type="date"
              label="End Date"
              error={errors.end_date?.message}
              {...register('end_date')}
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
            <Input
              type="number"
              step="0.01"
              label="Discount"
              error={errors.discount?.message}
              {...register('discount', { valueAsNumber: true })}
            />
            <Input
              type="number"
              step="0.01"
              label="Paid Amount"
              error={errors.paid_amount?.message}
              {...register('paid_amount', { valueAsNumber: true })}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 rounded-xl border border-border bg-surface/30 p-4 md:grid-cols-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">Gross</p>
              <p className="mt-1 text-lg font-semibold text-text-primary">{grossAmount.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">Total Lending</p>
              <p className="mt-1 text-lg font-semibold text-text-primary">{totalAmount.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">Paid</p>
              <p className="mt-1 text-lg font-semibold text-text-primary">{paidAmount.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">Remaining</p>
              <p className="mt-1 text-lg font-semibold text-text-primary">{remainingAmount.toFixed(2)}</p>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting}>
              {lending ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
