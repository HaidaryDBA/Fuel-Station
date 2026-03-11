import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';

import { Button, Card, CardContent, Input, Select, Textarea } from '@/components/ui';

import { partnerDebtFormSchema } from '../schemas/financialSchema';
import type { Currency, PartnerDebtFormValues, PartnerOption } from '../types/financial';

interface PartnerDebtFormProps {
  initialValues?: Partial<PartnerDebtFormValues>;
  existingPaidAmount?: number;
  requiredAmountInBase?: number;
  partners: PartnerOption[];
  currencies: Currency[];
  onSubmit: (values: PartnerDebtFormValues) => Promise<void> | void;
  onCancel: () => void;
  isSubmitting?: boolean;
  submitLabel?: string;
}

const defaultValues: PartnerDebtFormValues = {
  partner: 0,
  amount_money: 0,
  currency: 0,
  date: new Date().toISOString().slice(0, 10),
  payment_amount: 0,
  currency_paid: 0,
  payment_date: '',
  payment_description: '',
  description: '',
};

export default function PartnerDebtForm({
  initialValues,
  existingPaidAmount = 0,
  requiredAmountInBase,
  partners,
  currencies,
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitLabel: defaultSubmitLabel,
}: PartnerDebtFormProps) {
  const { t } = useTranslation();
  const submitLabel = defaultSubmitLabel || t('financial.save');

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<PartnerDebtFormValues>({
    resolver: zodResolver(partnerDebtFormSchema),
    defaultValues,
  });

  useEffect(() => {
    if (!initialValues) {
      reset(defaultValues);
      return;
    }

    reset({
      partner: initialValues.partner ?? 0,
      amount_money: initialValues.amount_money ?? 0,
      currency: initialValues.currency ?? 0,
      date: initialValues.date || new Date().toISOString().slice(0, 10),
      payment_amount: initialValues.payment_amount ?? 0,
      currency_paid: initialValues.currency_paid ?? 0,
      payment_date: initialValues.payment_date || '',
      payment_description: initialValues.payment_description || '',
      description: initialValues.description || '',
    });
  }, [initialValues, reset]);

  const partnerOptions = partners.map((partner) => ({
    label: partner.full_name,
    value: String(partner.id),
  }));

  const currencyOptions = currencies.map((currency) => ({
    label: `${currency.code} - ${currency.name}`,
    value: String(currency.id),
  }));

  const submit = async (values: PartnerDebtFormValues) => {
    await onSubmit(values);
  };

  const today = new Date().toISOString().slice(0, 10);
  const paymentAmount = watch('payment_amount');
  const amountMoney = watch('amount_money');
  const paymentCurrencyId = watch('currency_paid');
  const paymentCurrency = currencies.find((currency) => currency.id === paymentCurrencyId);
  const normalizedPaymentAmount = Number.isFinite(paymentAmount) ? paymentAmount : 0;
  const normalizedAmountMoney = Number.isFinite(amountMoney) ? amountMoney : 0;
  const requiredAmount = requiredAmountInBase ?? normalizedAmountMoney;
  const remainingBeforePayment = Math.max(requiredAmount - existingPaidAmount, 0);
  const isPaymentDateRequired = normalizedPaymentAmount > 0;

  return (
    <Card>
      <CardContent>
        <form className="space-y-6" onSubmit={handleSubmit(submit)}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Select
              label={t('financial.partner')}
              options={partnerOptions}
              {...register('partner', { valueAsNumber: true })}
              error={errors.partner?.message}
            />
            <Input
              type="number"
              step="0.01"
              min="0"
              label={t('financial.amount')}
              {...register('amount_money', { valueAsNumber: true })}
              error={errors.amount_money?.message}
            />
            <Select
              label={t('financial.currency')}
              options={currencyOptions}
              {...register('currency', { valueAsNumber: true })}
              error={errors.currency?.message}
            />
            <Input
              type="date"
              label={t('financial.date')}
              max={today}
              {...register('date')}
              error={errors.date?.message}
            />
            <Input
              type="number"
              step="0.01"
              min="0"
              label={t('financial.paymentAmount', 'Payment Amount')}
              hint={t(
                'financial.paidAmountHint',
                'Enter the original paid amount; it will be converted to base currency on save'
              )}
              {...register('payment_amount', {
                setValueAs: (value) => {
                  if (value === '' || value === null || value === undefined) {
                    return 0;
                  }
                  return Number(value);
                },
              })}
              error={errors.payment_amount?.message}
            />
            <Select
              label={t('financial.paymentCurrency', 'Payment Currency')}
              options={currencyOptions}
              {...register('currency_paid', { valueAsNumber: true })}
              error={errors.currency_paid?.message}
            />
            <Input
              type="date"
              max={today}
              label={t('financial.paymentDate', 'Payment Date')}
              required={isPaymentDateRequired}
              {...register('payment_date')}
              error={errors.payment_date?.message}
            />
          </div>

          <div className="rounded-md border border-border/60 bg-muted/30 p-3 text-sm">
            <p>
              {t('financial.requiredAmount', 'Required Amount')}: {requiredAmount.toFixed(2)}
            </p>
            <p>
              {t('financial.totalPaid', 'Total Paid')}: {existingPaidAmount.toFixed(2)}
            </p>
            <p>
              {t('financial.remainingAmount', 'Remaining Amount')}: {remainingBeforePayment.toFixed(2)}
            </p>
            <p>
              {t('financial.newPaymentEntry', 'New Payment Entry')}:{' '}
              {normalizedPaymentAmount > 0
                ? `${normalizedPaymentAmount.toFixed(2)} ${paymentCurrency?.code || ''}`.trim()
                : '-'}
            </p>
            <p>
              {t('financial.paymentConversionHint', 'Exact base-currency conversion is calculated on save.') }
            </p>
          </div>

          <Textarea
            label={t('financial.paymentDescription', 'Payment Description')}
            rows={2}
            {...register('payment_description')}
            error={errors.payment_description?.message}
          />

          <Textarea
            label={t('financial.description')}
            rows={3}
            {...register('description')}
            error={errors.description?.message}
          />

          <div className="flex items-center justify-end gap-3">
            <Button type="button" variant="outline" onClick={onCancel}>
              {t('financial.cancel')}
            </Button>
            <Button type="submit" loading={isSubmitting}>
              {submitLabel}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
