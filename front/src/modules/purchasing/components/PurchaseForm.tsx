import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { Button, Card, CardContent, CardHeader, Input, Select } from '@/components/ui';

import { purchaseFormSchema, type PurchaseFormSchema } from '../schemas/purchasingSchema';
import type {
  CurrencyOption,
  CurrencyRateOption,
  FuelOption,
  PartnerOption,
  Purchase,
  PurchaseFormValues,
  Supplier,
} from '../types/purchasing';

interface PurchaseFormProps {
  purchase?: Purchase;
  suppliers: Supplier[];
  fuels: FuelOption[];
  partners: PartnerOption[];
  currencies: CurrencyOption[];
  currencyRates: CurrencyRateOption[];
  onSubmit: (data: PurchaseFormValues) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const toNumber = (value: number | undefined) => (Number.isFinite(value) ? Number(value) : 0);

export default function PurchaseForm({
  purchase,
  suppliers,
  fuels,
  partners,
  currencies,
  currencyRates,
  onSubmit,
  onCancel,
  isLoading,
}: PurchaseFormProps) {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<PurchaseFormSchema>({
    resolver: zodResolver(purchaseFormSchema),
    defaultValues: {
      fuel: purchase?.fuel || 0,
      supplier: purchase?.supplier || 0,
      partner: purchase?.partner || 0,
      purchase_date: purchase?.purchase_date || '',
      amount_ton: Number(purchase?.amount_ton || 0),
      density: Number(purchase?.density || 0),
      unit_price: Number(purchase?.unit_price || 0),
      currency: purchase?.currency || 0,
      paid_currency: purchase?.paid_currency || purchase?.currency || 0,
      invoice_number: purchase?.invoice_number || '',
      paid_amount: Number(purchase?.paid_amount || 0),
      pay_date: purchase?.pay_date || '',
    },
  });

  const amountTon = toNumber(watch('amount_ton'));
  const density = toNumber(watch('density'));
  const unitPrice = toNumber(watch('unit_price'));
  const paidAmount = toNumber(watch('paid_amount'));
  const currencyId = toNumber(watch('currency'));
  const paidCurrencyId = toNumber(watch('paid_currency'));

  const preview = useMemo(() => {
    const totalLiter = density > 0 ? (amountTon * 1000) / density : 0;
    const totalAmount = amountTon * unitPrice;
    const baseCurrency = currencies.find((currency) => currency.is_base);
    const selectedPurchaseCurrency = currencies.find((currency) => currency.id === currencyId);
    const selectedPaidCurrency = currencies.find((currency) => currency.id === paidCurrencyId);

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

    const purchaseRateToBase =
      resolveRateToBase(currencyId) ?? (purchase ? Number(purchase.currency_rate) : null);
    const paidRateToBase =
      resolveRateToBase(paidCurrencyId) ??
      (purchase && Number(purchase.paid_amount) > 0
        ? Number(purchase.paid_amount_in_base_currency) / Number(purchase.paid_amount)
        : purchaseRateToBase);

    let paidCurrencyRate = purchase ? Number(purchase.paid_currency_rate) : null;
    if (
      purchaseRateToBase !== null &&
      paidRateToBase !== null &&
      Number.isFinite(purchaseRateToBase) &&
      purchaseRateToBase > 0
    ) {
      paidCurrencyRate = paidRateToBase / purchaseRateToBase;
    }

    const totalAmountInBase =
      purchaseRateToBase !== null && Number.isFinite(purchaseRateToBase) ? totalAmount * purchaseRateToBase : null;
    const paidAmountInBase =
      paidRateToBase !== null && Number.isFinite(paidRateToBase)
        ? paidAmount * paidRateToBase
        : null;
    const paidAmountInPurchaseCurrency =
      totalAmountInBase !== null &&
      paidAmountInBase !== null &&
      purchaseRateToBase !== null &&
      Number.isFinite(purchaseRateToBase) &&
      purchaseRateToBase > 0
        ? paidAmountInBase / purchaseRateToBase
        : null;
    const remainingAmountInBase =
      totalAmountInBase !== null && paidAmountInBase !== null ? Math.max(totalAmountInBase - paidAmountInBase, 0) : null;
    const remainingAmount =
      totalAmountInBase !== null &&
      remainingAmountInBase !== null &&
      purchaseRateToBase !== null &&
      Number.isFinite(purchaseRateToBase) &&
      purchaseRateToBase > 0
        ? remainingAmountInBase / purchaseRateToBase
        : Math.max(totalAmount - (paidAmountInPurchaseCurrency ?? 0), 0);

    return {
      totalLiter: totalLiter.toFixed(2),
      totalAmount: totalAmount.toFixed(2),
      remainingAmount: remainingAmount.toFixed(2),
      status: remainingAmount === 0 && totalAmount > 0 ? 'Completed' : 'Remaining',
      currencyRate:
        purchaseRateToBase !== null && Number.isFinite(purchaseRateToBase) ? purchaseRateToBase.toFixed(6) : '-',
      paidCurrencyRate:
        paidCurrencyRate !== null && Number.isFinite(paidCurrencyRate) ? paidCurrencyRate.toFixed(6) : '-',
      paidAmountInPurchaseCurrency:
        paidAmountInPurchaseCurrency !== null && Number.isFinite(paidAmountInPurchaseCurrency)
          ? paidAmountInPurchaseCurrency.toFixed(2)
          : '-',
      baseCurrencyCode: baseCurrency?.code ?? '',
      purchaseCurrencyCode: selectedPurchaseCurrency?.code ?? purchase?.currency_code ?? '',
      paidCurrencyCode: selectedPaidCurrency?.code ?? purchase?.paid_currency_code ?? '',
      totalAmountInBase:
        totalAmountInBase !== null && Number.isFinite(totalAmountInBase) ? totalAmountInBase.toFixed(2) : '-',
      remainingAmountInBase:
        remainingAmountInBase !== null && Number.isFinite(remainingAmountInBase)
          ? remainingAmountInBase.toFixed(2)
          : '-',
    };
  }, [amountTon, currencies, currencyId, currencyRates, density, paidAmount, paidCurrencyId, purchase, unitPrice]);

  const supplierOptions = suppliers.map((supplier) => ({
    label: supplier.supplier_name,
    value: String(supplier.id),
  }));
  const fuelOptions = fuels.map((fuel) => ({
    label: `${fuel.fuel_name} (${fuel.type})`,
    value: String(fuel.id),
  }));
  const partnerOptions = partners.map((partner) => ({
    label: partner.full_name,
    value: String(partner.id),
  }));
  const currencyOptions = currencies.map((currency) => ({
    label: `${currency.code} - ${currency.name}`,
    value: String(currency.id),
  }));

  return (
    <Card>
      <CardHeader title={purchase ? t('purchasing.editPurchase', 'Edit Purchase') : t('purchasing.addPurchase', 'Add Purchase')} />
      <CardContent>
        <form
          onSubmit={handleSubmit((data) =>
            onSubmit({
              fuel: data.fuel,
              supplier: data.supplier,
              partner: data.partner,
              purchase_date: data.purchase_date,
              amount_ton: data.amount_ton,
              density: data.density,
              unit_price: data.unit_price,
              currency: data.currency,
              paid_currency: data.paid_currency,
              invoice_number: data.invoice_number ?? '',
              paid_amount: data.paid_amount,
              pay_date: data.pay_date ?? '',
            })
          )}
          className="space-y-5"
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Select
              label={t('purchasing.supplier', 'Supplier')}
              error={errors.supplier?.message}
              options={supplierOptions}
              {...register('supplier', { valueAsNumber: true })}
            />
            <Select
              label={t('purchasing.fuel', 'Fuel')}
              error={errors.fuel?.message}
              options={fuelOptions}
              {...register('fuel', { valueAsNumber: true })}
            />
            <Select
              label={t('purchasing.partner', 'Partner')}
              error={errors.partner?.message}
              options={partnerOptions}
              {...register('partner', { valueAsNumber: true })}
            />
            <Select
              label={t('purchasing.currency', 'Currency')}
              error={errors.currency?.message}
              options={currencyOptions}
              {...register('currency', { valueAsNumber: true })}
            />
            <Select
              label={t('purchasing.paidCurrency', 'Paid Currency')}
              error={errors.paid_currency?.message}
              options={currencyOptions}
              {...register('paid_currency', { valueAsNumber: true })}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Input
              type="date"
              label={t('purchasing.purchaseDate', 'Purchase Date')}
              error={errors.purchase_date?.message}
              {...register('purchase_date')}
            />
            <Input
              type="number"
              step="0.001"
              label={t('purchasing.amountTon', 'Amount (Ton)')}
              error={errors.amount_ton?.message}
              {...register('amount_ton', { valueAsNumber: true })}
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
              label={t('purchasing.unitPrice', 'Unit Price')}
              error={errors.unit_price?.message}
              {...register('unit_price', { valueAsNumber: true })}
            />
            <Input
              label={t('purchasing.invoiceNumber', 'Invoice Number')}
              error={errors.invoice_number?.message}
              {...register('invoice_number')}
            />
            <Input
              type="number"
              step="0.01"
              label={t('purchasing.paidAmount', 'Paid Amount')}
              error={errors.paid_amount?.message}
              {...register('paid_amount', { valueAsNumber: true })}
            />
          </div>

          <Input
            type="date"
            label={t('purchasing.payDate', 'Pay Date')}
            error={errors.pay_date?.message}
            {...register('pay_date')}
          />

          <div className="grid grid-cols-1 gap-4 rounded-xl border border-border bg-surface/30 p-4 md:grid-cols-3 lg:grid-cols-8">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">
                {t('purchasing.totalLiter', 'Total Liter')}
              </p>
              <p className="mt-1 text-lg font-semibold text-text-primary">{preview.totalLiter}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">
                {t('purchasing.totalAmount', 'Total Amount')}
              </p>
              <p className="mt-1 text-lg font-semibold text-text-primary">
                {preview.totalAmount} {preview.purchaseCurrencyCode}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">
                {t('purchasing.remainingAmount', 'Remaining Amount')}
              </p>
              <p className="mt-1 text-lg font-semibold text-text-primary">
                {preview.remainingAmount} {preview.purchaseCurrencyCode}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">
                {t('purchasing.status', 'Status')}
              </p>
              <p className="mt-1 text-lg font-semibold text-text-primary">{preview.status}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">
                {t('purchasing.currencyRate', 'Currency Rate')}
              </p>
              <p className="mt-1 text-lg font-semibold text-text-primary">{preview.currencyRate}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">
                {t('purchasing.paidCurrencyRate', 'Paid Currency Rate')}
              </p>
              <p className="mt-1 text-lg font-semibold text-text-primary">{preview.paidCurrencyRate}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">
                {t('purchasing.paidAmountInPurchaseCurrency', 'Paid in Purchase Currency')}
              </p>
              <p className="mt-1 text-lg font-semibold text-text-primary">
                {preview.paidAmountInPurchaseCurrency} {preview.purchaseCurrencyCode}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">
                {t('purchasing.totalAmountInBase', 'Total in Base Currency')}
              </p>
              <p className="mt-1 text-lg font-semibold text-text-primary">
                {preview.totalAmountInBase} {preview.baseCurrencyCode}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">
                {t('purchasing.remainingAmountInBase', 'Remaining in Base Currency')}
              </p>
              <p className="mt-1 text-lg font-semibold text-text-primary">
                {preview.remainingAmountInBase} {preview.baseCurrencyCode}
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onCancel}>
              {t('purchasing.cancel', 'Cancel')}
            </Button>
            <Button type="submit" loading={isLoading}>
              {purchase ? t('purchasing.update', 'Update') : t('purchasing.create', 'Create')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
