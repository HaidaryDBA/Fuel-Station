import { ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { PageHeader } from '@/components';
import { Button, Card, CardContent } from '@/components/ui';
import { extractAxiosError } from '@/utils/extractError';

import LendingForm from '../components/LendingForm';
import {
  useCreateLending,
  useCustomerOptions,
  useFuelOptions,
  useLendingDetail,
  useTankOptions,
  useUpdateLending,
} from '../queries/useSalesQueries';
import type { LendingFormValues } from '../types/sale';

export default function LendingFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const parsedId = id ? Number(id) : NaN;
  const isEditMode = Number.isFinite(parsedId);

  const { data: lending, isLoading: isLoadingLending, isError } = useLendingDetail(parsedId, isEditMode);
  const { data: customersData } = useCustomerOptions();
  const { data: fuelsData } = useFuelOptions();
  const { data: tanksData } = useTankOptions();
  const createLendingMutation = useCreateLending();
  const updateLendingMutation = useUpdateLending();

  const handleSubmit = async (values: LendingFormValues) => {
    try {
      if (isEditMode) {
        await updateLendingMutation.mutateAsync({ id: parsedId, payload: values });
        toast.success('Lending updated');
      } else {
        await createLendingMutation.mutateAsync(values);
        toast.success('Lending created');
      }
      navigate('/sales/lendings');
    } catch (error) {
      toast.error(extractAxiosError(error, 'Failed to save lending'));
    }
  };

  if (isEditMode && isLoadingLending) {
    return (
      <Card>
        <CardContent>Loading lending...</CardContent>
      </Card>
    );
  }

  if (isEditMode && (isError || !lending)) {
    return (
      <Card>
        <CardContent className="space-y-4">
          <p className="text-sm text-error">Lending not found.</p>
          <Button variant="outline" onClick={() => navigate('/sales/lendings')}>
            Back to lending
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEditMode ? 'Edit Lending' : 'Add Lending'}
        subtitle="Track customer credit, guarantor details, and remaining balance."
        actions={[
          {
            label: 'Back',
            icon: <ArrowLeft className="h-4 w-4" />,
            variant: 'outline',
            onClick: () => navigate('/sales/lendings'),
          },
        ]}
      />

      <LendingForm
        lending={lending}
        customers={customersData?.results ?? []}
        fuels={fuelsData?.results ?? []}
        tanks={tanksData?.results ?? []}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/sales/lendings')}
        isSubmitting={createLendingMutation.isPending || updateLendingMutation.isPending}
      />
    </div>
  );
}
