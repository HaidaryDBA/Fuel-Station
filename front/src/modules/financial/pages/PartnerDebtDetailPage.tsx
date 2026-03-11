import { ArrowLeft, Pencil } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { PageHeader } from '@/components';
import { Button, Card, CardContent } from '@/components/ui';

import PartnerDebtDetailCard from '../components/PartnerDebtDetailCard';
import { useDeletePartnerDebt, usePartnerDebtDetail } from '../queries/useFinancialQueries';

export default function PartnerDebtDetailPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { id } = useParams();

  const partnerDebtId = Number(id);
  const { data: partnerDebt, isLoading, isError } = usePartnerDebtDetail(
    partnerDebtId,
    Number.isFinite(partnerDebtId)
  );
  const deletePartnerDebtMutation = useDeletePartnerDebt();

  const handleDelete = async () => {
    if (!partnerDebt) {
      return;
    }

    const confirmed = window.confirm(
      t('financial.deletePartnerDebtConfirm', { name: partnerDebt.partner_full_name })
    );
    if (!confirmed) {
      return;
    }

    await deletePartnerDebtMutation.mutateAsync(partnerDebt.id);
    navigate('/finance/partner-debts');
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent>{t('financial.loadingPartnerDebtDetails')}</CardContent>
      </Card>
    );
  }

  if (isError || !partnerDebt) {
    return (
      <Card>
        <CardContent className="space-y-4">
          <p className="text-sm text-error">{t('financial.failedToLoadPartnerDebtDetails')}</p>
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
        title={t('financial.partnerDebtDetails')}
        subtitle={t('financial.partnerDebtDetailSubtitle')}
        actions={[
          {
            label: t('financial.back'),
            icon: <ArrowLeft className="h-4 w-4" />,
            variant: 'outline',
            onClick: () => navigate('/finance/partner-debts'),
          },
          {
            label: t('financial.edit'),
            icon: <Pencil className="h-4 w-4" />,
            onClick: () => navigate(`/finance/partner-debts/${partnerDebt.id}/edit`),
          },
        ]}
      />

      <PartnerDebtDetailCard
        partnerDebt={partnerDebt}
        onBack={() => navigate('/finance/partner-debts')}
        onEdit={() => navigate(`/finance/partner-debts/${partnerDebt.id}/edit`)}
        onDelete={handleDelete}
        deleting={deletePartnerDebtMutation.isPending}
      />
    </div>
  );
}
