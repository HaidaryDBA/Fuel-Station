import { ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { PageHeader } from '@/components';
import { Button, Card, CardContent } from '@/components/ui';
import { extractAxiosError } from '@/utils/extractError';

import PartnerDebtForm from '../components/PartnerDebtForm';
import {
  useCreatePartnerDebt,
  useCurrenciesList,
  usePartnerDebtDetail,
  usePartnerOptions,
  useUpdatePartnerDebt,
} from '../queries/useFinancialQueries';
import type { PartnerDebtFormValues } from '../types/financial';

export default function PartnerDebtFormPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { id } = useParams();

  const parsedId = id ? Number(id) : NaN;
  const isEditMode = Number.isFinite(parsedId);

  const { data: partnerDebt, isLoading: isLoadingPartnerDebt, isError } = usePartnerDebtDetail(
    parsedId,
    isEditMode
  );
  const { data: partnerData } = usePartnerOptions();
  const { data: currencyData } = useCurrenciesList();
  const createPartnerDebtMutation = useCreatePartnerDebt();
  const updatePartnerDebtMutation = useUpdatePartnerDebt(parsedId);

  const initialValues: Partial<PartnerDebtFormValues> | undefined = partnerDebt
      ? {
        partner: partnerDebt.partner,
        amount_money: Number(partnerDebt.amount_money),
        currency: partnerDebt.currency,
        date: partnerDebt.date,
        payment_amount: 0,
        currency_paid: 0,
        payment_date: '',
        payment_description: '',
        description: partnerDebt.description,
      }
    : undefined;

  const handleSubmit = async (values: PartnerDebtFormValues) => {
    try {
      if (isEditMode) {
        await updatePartnerDebtMutation.mutateAsync(values);
        toast.success(t('financial.partnerDebtUpdated'));
        navigate(`/finance/partner-debts/${parsedId}`);
        return;
      }

      const createdPartnerDebt = await createPartnerDebtMutation.mutateAsync(values);
      toast.success(t('financial.partnerDebtCreated'));
      navigate(`/finance/partner-debts/${createdPartnerDebt.id}`);
    } catch (error) {
      toast.error(extractAxiosError(error, t('financial.partnerDebtSaveFailed')));
    }
  };

  if (isEditMode && isLoadingPartnerDebt) {
    return (
      <Card>
        <CardContent>{t('financial.loadingPartnerDebtForm')}</CardContent>
      </Card>
    );
  }

  if (isEditMode && (isError || !partnerDebt)) {
    return (
      <Card>
        <CardContent className="space-y-4">
          <p className="text-sm text-error">{t('financial.partnerDebtNotFound')}</p>
          <Button variant="outline" onClick={() => navigate('/finance/partner-debts')}>
            {t('financial.backToPartnerDebts')}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEditMode ? t('financial.editPartnerDebt') : t('financial.addPartnerDebt')}
        subtitle={
          isEditMode
            ? t('financial.editPartnerDebtSubtitle')
            : t('financial.addPartnerDebtSubtitle')
        }
        actions={[
          {
            label: t('financial.back'),
            icon: <ArrowLeft className="h-4 w-4" />,
            variant: 'outline',
            onClick: () => navigate('/finance/partner-debts'),
          },
        ]}
      />

      <PartnerDebtForm
        initialValues={initialValues}
        existingPaidAmount={partnerDebt ? Number(partnerDebt.paid_amount) : 0}
        requiredAmountInBase={partnerDebt ? Number(partnerDebt.total_in) : undefined}
        partners={partnerData?.results ?? []}
        currencies={currencyData?.results ?? []}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/finance/partner-debts')}
        isSubmitting={createPartnerDebtMutation.isPending || updatePartnerDebtMutation.isPending}
        submitLabel={isEditMode ? t('financial.update') : t('financial.create')}
      />
    </div>
  );
}
