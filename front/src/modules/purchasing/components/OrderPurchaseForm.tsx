import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { Button, Card, CardContent, CardHeader, Input, Select, Textarea } from '@/components/ui';

import { orderPurchaseFormSchema, type OrderPurchaseFormSchema } from '../schemas/purchasingSchema';
import type {
  CurrencyOption,
  CurrencyRateOption,
  OrderPurchase,
  OrderPurchaseFormValues,
  Supplier,
  TankOption,
} from '../types/purchasing';

interface OrderPurchaseFormProps {
  orderPurchase?: OrderPurchase;
  suppliers: Supplier[];
  currencies: CurrencyOption[];
  currencyRates: CurrencyRateOption[];
  tanks: TankOption[];
  onSubmit: (data: OrderPurchaseFormValues) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const toNumber = (value: number | undefined) => (Number.isFinite(value) ? Number(value) : 0);

export default function OrderPurchaseForm({
  orderPurchase,
  suppliers,
  currencies,
  currencyRates,
  tanks,
  onSubmit,
  onCancel,
  isLoading,
}: OrderPurchaseFormProps) {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<OrderPurchaseFormSchema>({
    resolver: zodResolver(orderPurchaseFormSchema),
    defaultValues: {
      supplier: orderPurchase?.supplier || 0,
      amount_per_ton: Number(orderPurchase?.amount_per_ton || 0),
      density: Number(orderPurchase?.density || 0),
      purchase_price: Number(orderPurchase?.purchase_price || 0),
      currency: orderPurchase?.currency || 0,
      transport_cost: Number(orderPurchase?.transport_cost || 0),
      tanker: orderPurchase?.tanker || 0,
      date: orderPurchase?.date || '',
      description: orderPurchase?.description || '',
    },
  });

  const amountPerTon = toNumber(watch('amount_per_ton'));
  const density = toNumber(watch('density'));
  const purchasePrice = toNumber(watch('purchase_price'));
  const transportCost = toNumber(watch('transport_cost'));
  const currencyId = toNumber(watch('currency'));

  const preview = useMemo(() => {
    const densityPerTon = density > 0 ? 1000 / density : 0;
    const totalLiter = density > 0 ? (amountPerTon * 1000) / density : 0;
    const estimatedTotalCost = amountPerTon * purchasePrice + transportCost;
    const baseCurrency = currencies.find((currency) => currency.is_base);
    const selectedCurrency = currencies.find((currency) => currency.id === currencyId);

    const resolveRateToBase = (selectedCurrencyId: number) => {
      if (!baseCurrency || selectedCurrencyId <= 0) {
        return null;
      }

      if (selectedCurrencyId === baseCurrency.id) {
        return 1;
      }

      const directRate = currencyRates.find(
        (rate) => rate.from_currency === selectedCurrencyId && rate.to_currency === baseCurrency.id
      );
      if (directRate) {
        return Number(directRate.rate_value);
      }

      const inverseRate = currencyRates.find(
        (rate) => rate.from_currency === baseCurrency.id && rate.to_currency === selectedCurrencyId
      );
      if (inverseRate && Number(inverseRate.rate_value) > 0) {
        return 1 / Number(inverseRate.rate_value);
      }

      return null;
    };

    const currencyRate = resolveRateToBase(currencyId) ?? (orderPurchase ? Number(orderPurchase.currency_rate) : null);
    const currencyCost =
      currencyRate !== null && Number.isFinite(currencyRate) ? estimatedTotalCost * currencyRate : null;

    return {
      densityPerTon: densityPerTon.toFixed(2),
      totalLiter: totalLiter.toFixed(2),
      estimatedTotalCost: estimatedTotalCost.toFixed(2),
      currencyRate: currencyRate !== null && Number.isFinite(currencyRate) ? currencyRate.toFixed(6) : '-',
      currencyCost: currencyCost !== null && Number.isFinite(currencyCost) ? currencyCost.toFixed(2) : '-',
      currencyCode: selectedCurrency?.code ?? orderPurchase?.currency_code ?? '',
      baseCurrencyCode: baseCurrency?.code ?? orderPurchase?.base_currency_code ?? '',
    };
  }, [amountPerTon, currencies, currencyId, currencyRates, density, orderPurchase, purchasePrice, transportCost]);

  const supplierOptions = suppliers.map((supplier) => ({
    label: supplier.supplier_name,
    value: String(supplier.id),
  }));
  const currencyOptions = currencies.map((currency) => ({
    label: `${currency.code} - ${currency.name}`,
    value: String(currency.id),
  }));
  const tankOptions = tanks.map((tank) => ({
    label: `Tank #${tank.tank_number} (${tank.fuel_name || `Fuel #${tank.Fuel}`})`,
    value: String(tank.id),
  }));

  return (
    <Card>
      <CardHeader
        title={
          orderPurchase
            ? t('purchasing.editOrderPurchase', 'Edit Order Purchase')
            : t('purchasing.addOrderPurchase', 'Add Order Purchase')
        }
      />
      <CardContent>
        <form
          onSubmit={handleSubmit((data) =>
            onSubmit({
              supplier: data.supplier,
              amount_per_ton: data.amount_per_ton,
              density: data.density,
              purchase_price: data.purchase_price,
              currency: data.currency,
              transport_cost: data.transport_cost,
              tanker: data.tanker,
              date: data.date,
              description: data.description ?? '',
            })
          )}
          className="space-y-5"
        >
          <div className="rounded-xl border border-dashed border-border bg-surface/20 p-4 text-sm text-text-secondary">
            {t('purchasing.orderIdAutoGenerated', 'Order ID is generated automatically when the order is saved.')}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Select
              label={t('purchasing.supplier', 'Supplier')}
              error={errors.supplier?.message}
              options={supplierOptions}
              {...register('supplier', { valueAsNumber: true })}
            />
            <Select
              label={t('purchasing.currency', 'Currency')}
              error={errors.currency?.message}
              options={currencyOptions}
              {...register('currency', { valueAsNumber: true })}
            />
            <Select
              label={t('purchasing.tanker', 'Tanker')}
              error={errors.tanker?.message}
              options={tankOptions}
              {...register('tanker', { valueAsNumber: true })}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Input
              type="number"
              step="0.001"
              label={t('purchasing.amountPerTon', 'Amount Per Ton')}
              error={errors.amount_per_ton?.message}
              {...register('amount_per_ton', { valueAsNumber: true })}
            />
            <Input
              type="number"
              step="0.0001"
              label={t('purchasing.density', 'Density')}
              error={errors.density?.message}
              {...register('density', { valueAsNumber: true })}
            />
            <Input
              type="number"
              step="0.01"
              label={t('purchasing.purchasePrice', 'Purchase Price')}
              error={errors.purchase_price?.message}
              {...register('purchase_price', { valueAsNumber: true })}
            />
            <Input
              type="number"
              step="0.01"
              label={t('purchasing.transportCost', 'Transport Cost')}
              error={errors.transport_cost?.message}
              {...register('transport_cost', { valueAsNumber: true })}
            />
          </div>

          <Input
            type="date"
            label={t('purchasing.date', 'Date')}
            error={errors.date?.message}
            {...register('date')}
          />

          <Textarea
            label={t('purchasing.description', 'Description')}
            error={errors.description?.message}
            {...register('description')}
          />

          <div className="grid grid-cols-1 gap-4 rounded-xl border border-border bg-surface/30 p-4 md:grid-cols-2 lg:grid-cols-5">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">
                {t('purchasing.densityPerTon', 'Density Per Ton')}
              </p>
              <p className="mt-1 text-lg font-semibold text-text-primary">{preview.densityPerTon}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">
                {t('purchasing.totalLiter', 'Total Liter')}
              </p>
              <p className="mt-1 text-lg font-semibold text-text-primary">{preview.totalLiter}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">
                {t('purchasing.estimatedTotalCost', 'Estimated Total Cost')}
              </p>
              <p className="mt-1 text-lg font-semibold text-text-primary">
                {preview.estimatedTotalCost} {preview.currencyCode}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">
                {t('purchasing.currencyRate', 'Currency Rate')}
              </p>
              <p className="mt-1 text-lg font-semibold text-text-primary">{preview.currencyRate}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">
                {t('purchasing.currencyCost', 'Currency Cost')}
              </p>
              <p className="mt-1 text-lg font-semibold text-text-primary">
                {preview.currencyCost} {preview.baseCurrencyCode}
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onCancel}>
              {t('purchasing.cancel', 'Cancel')}
            </Button>
            <Button type="submit" loading={isLoading}>
              {orderPurchase ? t('purchasing.update', 'Update') : t('purchasing.create', 'Create')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
