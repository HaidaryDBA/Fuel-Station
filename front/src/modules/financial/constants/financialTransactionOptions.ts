type TranslationFunction = (key: string, defaultValue: string) => string;

export const financialTransactionTypeOptions = [
  {
    value: 'deposit',
    translationKey: 'financial.transactionType.deposit',
    fallback: 'Deposit',
  },
  {
    value: 'withdraw',
    translationKey: 'financial.transactionType.withdraw',
    fallback: 'Withdraw',
  },
  {
    value: 'transfer',
    translationKey: 'financial.transactionType.transfer',
    fallback: 'Transfer',
  },
] as const;

export const financialTransactionReferenceOptions = [
  {
    value: 'sales',
    translationKey: 'financial.referenceType.sales',
    fallback: 'Sales',
  },
  {
    value: 'purchase',
    translationKey: 'financial.referenceType.purchase',
    fallback: 'Purchase',
  },
  {
    value: 'Expense',
    translationKey: 'financial.referenceType.Expense',
    fallback: 'Expense',
  },
  {
    value: 'lending_payment',
    translationKey: 'financial.referenceType.lending_payment',
    fallback: 'Lending Payment',
  },
  {
    value: 'salary',
    translationKey: 'financial.referenceType.salary',
    fallback: 'Salary',
  },
  {
    value: 'Exchange',
    translationKey: 'financial.referenceType.Exchange',
    fallback: 'Exchange',
  },
] as const;

export type FinancialTransactionTypeOption = (typeof financialTransactionTypeOptions)[number]['value'];
export type FinancialTransactionReferenceType = (typeof financialTransactionReferenceOptions)[number]['value'];

export const getFinancialTransactionTypeLabel = (
  value: string,
  t: TranslationFunction
) => {
  const option = financialTransactionTypeOptions.find((item) => item.value === value);
  return option ? t(option.translationKey, option.fallback) : value;
};

export const getFinancialTransactionReferenceLabel = (
  value: string | null | undefined,
  t: TranslationFunction
) => {
  if (!value) {
    return '';
  }

  const option = financialTransactionReferenceOptions.find((item) => item.value === value);
  return option ? t(option.translationKey, option.fallback) : value;
};
