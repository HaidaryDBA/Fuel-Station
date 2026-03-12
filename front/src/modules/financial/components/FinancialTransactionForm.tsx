import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';

import { Button, Card, CardContent, Input, Select, Textarea } from '@/components/ui';

import {
  financialTransactionReferenceOptions,
  financialTransactionTypeOptions,
  getFinancialTransactionReferenceLabel,
  getFinancialTransactionTypeLabel,
} from '../constants/financialTransactionOptions';
import { financialTransactionFormSchema } from '../schemas/financialSchema';
import type {
  Account,
  Currency,
  FinancialTransaction,
  FinancialTransactionFormValues,
} from '../types/financial';
import type { FinanceAccountBalanceRow } from '@/modules/reports/types/reports';

interface FinancialTransactionFormProps {
  initialValues?: Partial<FinancialTransactionFormValues>;
  transaction?: FinancialTransaction;
  accounts: Account[];
  currencies: Currency[];
  accountBalances?: FinanceAccountBalanceRow[];
  isBalanceLoading?: boolean;
  onSubmit: (values: FinancialTransactionFormValues) => Promise<void> | void;
  onCancel: () => void;
  isSubmitting?: boolean;
  submitLabel?: string;
}

const formatDateTimeLocalInput = (value?: string) => {
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

const getDefaultDateTime = () => formatDateTimeLocalInput(new Date().toISOString());
const formatAmount = (value?: string | number) => Number(value || 0).toFixed(2);

const defaultValues: FinancialTransactionFormValues = {
  from_account: 0,
  to_account: 0,
  transaction_type: 'deposit',
  amount: 0,
  currency: 0,
  date_time: getDefaultDateTime(),
  reference_type: '',
  reference_id: null,
  description: '',
};

export default function FinancialTransactionForm({
  initialValues,
  transaction,
  accounts,
  currencies,
  accountBalances = [],
  isBalanceLoading = false,
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitLabel: defaultSubmitLabel,
}: FinancialTransactionFormProps) {
  const { t } = useTranslation();
  const submitLabel = defaultSubmitLabel || t('financial.save', 'Save');

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FinancialTransactionFormValues>({
    resolver: zodResolver(financialTransactionFormSchema),
    defaultValues,
  });

  useEffect(() => {
    if (!initialValues) {
      reset(defaultValues);
      return;
    }

    reset({
      from_account: initialValues.from_account ?? 0,
      to_account: initialValues.to_account ?? 0,
      transaction_type: initialValues.transaction_type || 'deposit',
      amount: initialValues.amount ?? 0,
      currency: initialValues.currency ?? 0,
      date_time: initialValues.date_time || getDefaultDateTime(),
      reference_type: initialValues.reference_type ?? '',
      reference_id: initialValues.reference_id ?? null,
      description: initialValues.description || '',
    });
  }, [initialValues, reset]);

  const transactionType = watch('transaction_type');
  const selectedCurrency = watch('currency');
  const selectedFromAccount = watch('from_account');
  const amount = watch('amount');

  const balancesMap = useMemo(() => {
    const map = new Map<number, FinanceAccountBalanceRow>();
    accountBalances.forEach((row) => map.set(row.account_id, row));
    return map;
  }, [accountBalances]);

  const selectedFromAccountInfo = useMemo(
    () => accounts.find((account) => account.id === selectedFromAccount),
    [accounts, selectedFromAccount]
  );

  const selectedBalance = selectedFromAccount ? balancesMap.get(selectedFromAccount) : undefined;
  const availableBalance = selectedBalance ? Number(selectedBalance.balance || 0) : null;
  const balanceCurrency =
    selectedBalance?.currency || selectedFromAccountInfo?.currency_code || '';
  const isOutgoing =
    transactionType === 'withdraw' || transactionType === 'transfer';
  const isInsufficient =
    isOutgoing &&
    selectedFromAccount &&
    availableBalance !== null &&
    Number(amount || 0) > availableBalance;
  const insufficientMessage = isInsufficient
    ? t('financial.insufficientFunds', 'Insufficient funds in the source account.')
    : undefined;
  const amountHelperText =
    isOutgoing && selectedFromAccount
      ? isBalanceLoading
        ? t('financial.balanceLoading', 'Checking available balance...')
        : availableBalance !== null
        ? `${t('financial.availableBalance', 'Available balance')}: ${formatAmount(
            availableBalance
          )} ${balanceCurrency}`.trim()
        : undefined
      : undefined;

  const availableAccounts = selectedCurrency
    ? accounts.filter((account) => account.currency === selectedCurrency)
    : accounts;

  const fromAccountOptions = [
    { label: t('financial.none', 'None'), value: '0' },
    ...availableAccounts.map((account) => ({
      label: `${account.name} (${account.currency_code})`,
      value: String(account.id),
    })),
  ];

  const toAccountOptions = [
    { label: t('financial.none', 'None'), value: '0' },
    ...availableAccounts
      .filter((account) => transactionType !== 'transfer' || account.id !== selectedFromAccount)
      .map((account) => ({
        label: `${account.name} (${account.currency_code})`,
        value: String(account.id),
      })),
  ];

  const currencyOptions = currencies.map((currency) => ({
    label: `${currency.code} - ${currency.name}`,
    value: String(currency.id),
  }));

  const transactionTypeOptions = financialTransactionTypeOptions.map((option) => ({
    label: getFinancialTransactionTypeLabel(option.value, t),
    value: option.value,
  }));

  const referenceTypeOptions = [
    { label: t('financial.none', 'None'), value: '' },
    ...financialTransactionReferenceOptions.map((option) => ({
      label: getFinancialTransactionReferenceLabel(option.value, t),
      value: option.value,
    })),
  ];

  const submit = async (values: FinancialTransactionFormValues) => {
    if (isInsufficient) {
      return;
    }
    await onSubmit(values);
  };

  return (
    <Card>
      <CardContent>
        <form className="space-y-6" onSubmit={handleSubmit(submit)}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Select
              label={t('financial.transactionType', 'Transaction Type')}
              options={transactionTypeOptions}
              {...register('transaction_type')}
              error={errors.transaction_type?.message}
            />
            <Select
              label={t('financial.currency', 'Currency')}
              options={currencyOptions}
              {...register('currency', { valueAsNumber: true })}
              error={errors.currency?.message}
            />
            <Select
              label={t('financial.sourceAccount', 'Source Account')}
              options={fromAccountOptions}
              {...register('from_account', { valueAsNumber: true })}
              disabled={transactionType === 'deposit'}
              error={errors.from_account?.message}
              hint={
                transactionType === 'deposit'
                  ? t('financial.sourceAccountDepositHint', 'Not used for deposit transactions.')
                  : undefined
              }
            />
            <Select
              label={t('financial.destinationAccount', 'Destination Account')}
              options={toAccountOptions}
              {...register('to_account', { valueAsNumber: true })}
              disabled={transactionType === 'withdraw'}
              error={errors.to_account?.message}
              hint={
                transactionType === 'withdraw'
                  ? t(
                      'financial.destinationAccountWithdrawHint',
                      'Not used for withdraw transactions.'
                    )
                  : undefined
              }
            />
            <Input
              type="number"
              step="0.01"
              min="0.01"
              label={t('financial.amount', 'Amount')}
              {...register('amount', { valueAsNumber: true })}
              error={errors.amount?.message || insufficientMessage}
              helperText={amountHelperText}
            />
            <Input
              type="datetime-local"
              max={getDefaultDateTime()}
              label={t('financial.dateTime', 'Date & Time')}
              {...register('date_time')}
              error={errors.date_time?.message}
            />
            <Select
              label={t('financial.referenceType', 'Reference Type')}
              options={referenceTypeOptions}
              {...register('reference_type')}
              error={errors.reference_type?.message}
            />
            <Input
              type="number"
              min="1"
              label={t('financial.referenceId', 'Reference ID')}
              {...register('reference_id', {
                setValueAs: (value) => (value === '' ? null : Number(value)),
              })}
              error={errors.reference_id?.message}
            />
          </div>

          <Textarea
            label={t('financial.description', 'Description')}
            rows={4}
            {...register('description')}
            error={errors.description?.message}
          />

          {transaction && (
            <div className="rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text-secondary">
              {t('financial.lastUpdatedBy', 'Last updated by')}: {transaction.updated_by_name || '-'}
            </div>
          )}

          <div className="flex items-center justify-end gap-3">
            <Button type="button" variant="outline" onClick={onCancel}>
              {t('financial.cancel', 'Cancel')}
            </Button>
            <Button type="submit" loading={isSubmitting} disabled={isInsufficient}>
              {submitLabel}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
