import { ArrowLeft, Pencil } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { PageHeader } from '@/components';
import { Button, Card, CardContent } from '@/components/ui';

import PartnerDetailCard from '../components/PartnerDetailCard';
import { useDeletePartner, usePartnerDetail } from '../queries/usePartnerQueries';

export default function PartnerDetailPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { id } = useParams();

  const partnerId = Number(id);
  const { data: partner, isLoading, isError } = usePartnerDetail(
    partnerId,
    Number.isFinite(partnerId)
  );
  const deletePartnerMutation = useDeletePartner();

  const handleDelete = async () => {
    if (!partner) {
      return;
    }

    const confirmed = window.confirm(t('partner.deleteConfirm', { name: partner.full_name }));
    if (!confirmed) {
      return;
    }

    await deletePartnerMutation.mutateAsync(partner.id);
    navigate('/employees/partners');
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent>{t('partner.loadingDetails')}</CardContent>
      </Card>
    );
  }

  if (isError || !partner) {
    return (
      <Card>
        <CardContent className="space-y-4">
          <p className="text-sm text-error">{t('partner.failedToLoadDetails')}</p>
          <Button variant="outline" onClick={() => navigate('/employees/partners')}>
            {t('partner.backToPartners')}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('partner.details')}
        subtitle={t('partner.detailSubtitle')}
        actions={[
          {
            label: t('partner.back'),
            icon: <ArrowLeft className="h-4 w-4" />,
            variant: 'outline',
            onClick: () => navigate('/employees/partners'),
          },
          {
            label: t('partner.edit'),
            icon: <Pencil className="h-4 w-4" />,
            onClick: () => navigate(`/employees/partners/${partner.id}/edit`),
          },
        ]}
      />

      <PartnerDetailCard
        partner={partner}
        onBack={() => navigate('/employees/partners')}
        onEdit={() => navigate(`/employees/partners/${partner.id}/edit`)}
        onDelete={handleDelete}
        deleting={deletePartnerMutation.isPending}
      />
    </div>
  );
}
