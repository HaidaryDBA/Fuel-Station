import { ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { PageHeader } from '@/components';
import { Button, Card, CardContent } from '@/components/ui';

import CurrencyRateForm from '../components/CurrencyRateForm';
import {
  useCreateCurrencyRate,
  useCurrencies,
  useCurrencyRateDetail,
  useUpdateCurrencyRate,
} from '../queries/useFinancialQueries';
import type { CurrencyRateFormValues } from '../types/financial';

export default function CurrencyRateFormPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { id } = useParams();

  const parsedId = id ? Number(id) : NaN;
  const isEditMode = Number.isFinite(parsedId);

  const { data: rate, isLoading: isLoadingRate, isError } = useCurrencyRateDetail(parsedId, isEditMode);
  const { data: currencyData } = useCurrencies({ page_size: 300, ordering: 'code' });
  const createCurrencyRateMutation = useCreateCurrencyRate();
  const updateCurrencyRateMutation = useUpdateCurrencyRate(parsedId);

  const initialValues: Partial<CurrencyRateFormValues> | undefined = rate
    ? {
        from_currency: rate.from_currency,
        to_currency: rate.to_currency,
        rate_value: Number(rate.rate_value),
        date: rate.date,
      }
    : undefined;

  const handleSubmit = async (values: CurrencyRateFormValues) => {
    if (isEditMode) {
      await updateCurrencyRateMutation.mutateAsync(values);
      navigate('/finance/currency-rates');
      return;
    }

    await createCurrencyRateMutation.mutateAsync(values);
    navigate('/finance/currency-rates');
  };

  if (isEditMode && isLoadingRate) {
    return (
      <Card>
        <CardContent>{t('financial.loadingCurrencyRateForm', 'Loading currency rate form data...')}</CardContent>
      </Card>
    );
  }

  if (isEditMode && (isError || !rate)) {
    return (
      <Card>
        <CardContent className="space-y-4">
          <p className="text-sm text-error">{t('financial.currencyRateNotFound', 'Currency rate not found.')}</p>
          <Button variant="outline" onClick={() => navigate('/finance/currency-rates')}>
            {t('financial.backToCurrencyRates', 'Back to currency rates')}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={
          isEditMode
            ? t('financial.editCurrencyRate', 'Edit Currency Rate')
            : t('financial.addCurrencyRate', 'Add Currency Rate')
        }
        subtitle={
          isEditMode
            ? t('financial.editCurrencyRateSubtitle', 'Update exchange rate details')
            : t('financial.addCurrencyRateSubtitle', 'Create a new exchange rate')
        }
        actions={[
          {
            label: t('financial.back'),
            icon: <ArrowLeft className="h-4 w-4" />,
            variant: 'outline',
            onClick: () => navigate('/finance/currency-rates'),
          },
        ]}
      />

      <CurrencyRateForm
        initialValues={initialValues}
        currencies={currencyData?.results ?? []}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/finance/currency-rates')}
        isSubmitting={createCurrencyRateMutation.isPending || updateCurrencyRateMutation.isPending}
        submitLabel={isEditMode ? t('financial.update') : t('financial.create')}
      />
    </div>
  );
}
