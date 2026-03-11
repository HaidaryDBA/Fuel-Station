import { ArrowLeft, Pencil } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { PageHeader } from '@/components';
import { Button, Card, CardContent } from '@/components/ui';

import CustomerDetailCard from '../components/CustomerDetailCard';
import { useCustomerDetail, useDeleteCustomer } from '../queries/useCustomerQueries';

export default function CustomerDetailPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { id } = useParams();

  const customerId = Number(id);
  const { data: customer, isLoading, isError } = useCustomerDetail(
    customerId,
    Number.isFinite(customerId)
  );
  const deleteCustomerMutation = useDeleteCustomer();

  const handleDelete = async () => {
    if (!customer) {
      return;
    }

    const confirmed = window.confirm(t('customer.deleteConfirm', { name: customer.full_name }));
    if (!confirmed) {
      return;
    }

    await deleteCustomerMutation.mutateAsync(customer.id);
    navigate('/employees/customers');
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent>{t('customer.loadingDetails')}</CardContent>
      </Card>
    );
  }

  if (isError || !customer) {
    return (
      <Card>
        <CardContent className="space-y-4">
          <p className="text-sm text-error">{t('customer.failedToLoadDetails')}</p>
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
        title={t('customer.details')}
        subtitle={t('customer.detailSubtitle')}
        actions={[
          {
            label: t('customer.back'),
            icon: <ArrowLeft className="h-4 w-4" />,
            variant: 'outline',
            onClick: () => navigate('/employees/customers'),
          },
          {
            label: t('customer.edit'),
            icon: <Pencil className="h-4 w-4" />,
            onClick: () => navigate(`/employees/customers/${customer.id}/edit`),
          },
        ]}
      />

      <CustomerDetailCard
        customer={customer}
        onBack={() => navigate('/employees/customers')}
        onEdit={() => navigate(`/employees/customers/${customer.id}/edit`)}
        onDelete={handleDelete}
        deleting={deleteCustomerMutation.isPending}
      />
    </div>
  );
}
