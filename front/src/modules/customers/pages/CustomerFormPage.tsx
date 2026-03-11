import { ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { PageHeader } from '@/components';
import { Button, Card, CardContent } from '@/components/ui';

import CustomerForm from '../components/CustomerForm';
import { useCreateCustomer, useCustomerDetail, useUpdateCustomer } from '../queries/useCustomerQueries';
import type { CustomerFormValues } from '../types/customer';

export default function CustomerFormPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { id } = useParams();

  const parsedId = id ? Number(id) : NaN;
  const isEditMode = Number.isFinite(parsedId);

  const { data: customer, isLoading: isLoadingCustomer, isError } = useCustomerDetail(parsedId, isEditMode);
  const createCustomerMutation = useCreateCustomer();
  const updateCustomerMutation = useUpdateCustomer(parsedId);

  const initialValues: Partial<CustomerFormValues> | undefined = customer
    ? {
        first_name: customer.first_name,
        last_name: customer.last_name,
        phone: customer.phone,
        email: customer.email,
        address: customer.address,
        is_active: customer.is_active,
      }
    : undefined;

  const handleSubmit = async (values: CustomerFormValues) => {
    try {
      if (isEditMode) {
        await updateCustomerMutation.mutateAsync(values);
        toast.success(t('customer.updated'));
        navigate(`/employees/customers/${parsedId}`);
        return;
      }

      const createdCustomer = await createCustomerMutation.mutateAsync(values);
      toast.success(t('customer.created'));
      navigate(`/employees/customers/${createdCustomer.id}`);
    } catch {
      toast.error(t('customer.saveFailed'));
    }
  };

  if (isEditMode && isLoadingCustomer) {
    return (
      <Card>
        <CardContent>{t('customer.loadingFormData')}</CardContent>
      </Card>
    );
  }

  if (isEditMode && (isError || !customer)) {
    return (
      <Card>
        <CardContent className="space-y-4">
          <p className="text-sm text-error">{t('customer.notFound')}</p>
          <Button variant="outline" onClick={() => navigate('/employees/customers')}>
            {t('customer.backToCustomers')}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEditMode ? t('customer.edit') : t('customer.add')}
        subtitle={isEditMode ? t('customer.editSubtitle') : t('customer.addSubtitle')}
        actions={[
          {
            label: t('customer.back'),
            icon: <ArrowLeft className="h-4 w-4" />,
            variant: 'outline',
            onClick: () => navigate('/employees/customers'),
          },
        ]}
      />

      <CustomerForm
        initialValues={initialValues}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/employees/customers')}
        isSubmitting={createCustomerMutation.isPending || updateCustomerMutation.isPending}
        submitLabel={isEditMode ? t('customer.update') : t('customer.create')}
      />
    </div>
  );
}
