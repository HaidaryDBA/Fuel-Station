import { ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { PageHeader } from '@/components';
import { Button, Card, CardContent } from '@/components/ui';

import CurrencyForm from '../components/CurrencyForm';
import { useCreateCurrency, useCurrencyDetail, useUpdateCurrency } from '../queries/useFinancialQueries';
import type { CurrencyFormValues } from '../types/financial';

export default function CurrencyFormPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { id } = useParams();

  const parsedId = id ? Number(id) : NaN;
  const isEditMode = Number.isFinite(parsedId);

  const { data: currency, isLoading: isLoadingCurrency, isError } = useCurrencyDetail(parsedId, isEditMode);
  const createCurrencyMutation = useCreateCurrency();
  const updateCurrencyMutation = useUpdateCurrency(parsedId);

  const initialValues: Partial<CurrencyFormValues> | undefined = currency
    ? {
        name: currency.name,
        code: currency.code,
        symbol: currency.symbol,
        is_base: currency.is_base,
        is_active: currency.is_active,
      }
    : undefined;

  const handleSubmit = async (values: CurrencyFormValues) => {
    if (isEditMode) {
      await updateCurrencyMutation.mutateAsync(values);
      navigate('/finance/currencies');
      return;
    }

    await createCurrencyMutation.mutateAsync(values);
    navigate('/finance/currencies');
  };

  if (isEditMode && isLoadingCurrency) {
    return (
      <Card>
        <CardContent>{t('financial.loadingCurrencyForm', 'Loading currency form data...')}</CardContent>
      </Card>
    );
  }

  if (isEditMode && (isError || !currency)) {
    return (
      <Card>
        <CardContent className="space-y-4">
          <p className="text-sm text-error">{t('financial.currencyNotFound', 'Currency not found.')}</p>
          <Button variant="outline" onClick={() => navigate('/finance/currencies')}>
            {t('financial.backToCurrencies', 'Back to currencies')}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEditMode ? t('financial.editCurrency', 'Edit Currency') : t('financial.addCurrency', 'Add Currency')}
        subtitle={
          isEditMode
            ? t('financial.editCurrencySubtitle', 'Update currency information')
            : t('financial.addCurrencySubtitle', 'Create a new currency')
        }
        actions={[
          {
            label: t('financial.back'),
            icon: <ArrowLeft className="h-4 w-4" />,
            variant: 'outline',
            onClick: () => navigate('/finance/currencies'),
          },
        ]}
      />

      <CurrencyForm
        initialValues={initialValues}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/finance/currencies')}
        isSubmitting={createCurrencyMutation.isPending || updateCurrencyMutation.isPending}
        submitLabel={isEditMode ? t('financial.update') : t('financial.create')}
      />
    </div>
  );
}
