import { ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { PageHeader } from '@/components';
import { Button, Card, CardContent } from '@/components/ui';

import PartnerForm from '../components/PartnerForm';
import { useCreatePartner, usePartnerDetail, useUpdatePartner } from '../queries/usePartnerQueries';
import type { PartnerFormValues } from '../types/partner';

export default function PartnerFormPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { id } = useParams();

  const parsedId = id ? Number(id) : NaN;
  const isEditMode = Number.isFinite(parsedId);

  const { data: partner, isLoading: isLoadingPartner, isError } = usePartnerDetail(parsedId, isEditMode);
  const createPartnerMutation = useCreatePartner();
  const updatePartnerMutation = useUpdatePartner(parsedId);

  const initialValues: Partial<PartnerFormValues> | undefined = partner
    ? {
        first_name: partner.first_name,
        father_name: partner.father_name,
        last_name: partner.last_name,
        phone: partner.phone,
        main_address: partner.main_address,
        current_address: partner.current_address,
        date_of_birth: partner.date_of_birth,
        share_percentage: Number(partner.share_percentage),
        join_date: partner.join_date,
      }
    : undefined;

  const handleSubmit = async (values: PartnerFormValues) => {
    try {
      if (isEditMode) {
        await updatePartnerMutation.mutateAsync(values);
        toast.success(t('partner.updated'));
        navigate(`/employees/partners/${parsedId}`);
        return;
      }

      const createdPartner = await createPartnerMutation.mutateAsync(values);
      toast.success(t('partner.created'));
      navigate(`/employees/partners/${createdPartner.id}`);
    } catch {
      toast.error(t('partner.saveFailed'));
    }
  };

  if (isEditMode && isLoadingPartner) {
    return (
      <Card>
        <CardContent>{t('partner.loadingFormData')}</CardContent>
      </Card>
    );
  }

  if (isEditMode && (isError || !partner)) {
    return (
      <Card>
        <CardContent className="space-y-4">
          <p className="text-sm text-error">{t('partner.notFound')}</p>
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
        title={isEditMode ? t('partner.edit') : t('partner.add')}
        subtitle={isEditMode ? t('partner.editSubtitle') : t('partner.addSubtitle')}
        actions={[
          {
            label: t('partner.back'),
            icon: <ArrowLeft className="h-4 w-4" />,
            variant: 'outline',
            onClick: () => navigate('/employees/partners'),
          },
        ]}
      />

      <PartnerForm
        initialValues={initialValues}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/employees/partners')}
        isSubmitting={createPartnerMutation.isPending || updatePartnerMutation.isPending}
        submitLabel={isEditMode ? t('partner.update') : t('partner.create')}
      />
    </div>
  );
}
