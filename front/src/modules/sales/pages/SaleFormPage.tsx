import { ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { PageHeader } from '@/components';
import { Button, Card, CardContent } from '@/components/ui';
import { extractAxiosError } from '@/utils/extractError';

import SaleForm from '../components/SaleForm';
import {
  useCreateSale,
  useCurrencyOptions,
  useFuelOptions,
  useMotorOptions,
  useSaleDetail,
  useUpdateSale,
} from '../queries/useSalesQueries';
import type { SaleFormValues } from '../types/sale';

export default function SaleFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const parsedId = id ? Number(id) : NaN;
  const isEditMode = Number.isFinite(parsedId);

  const { data: sale, isLoading: isLoadingSale, isError } = useSaleDetail(parsedId, isEditMode);
  const { data: fuelsData } = useFuelOptions();
  const { data: motorsData } = useMotorOptions();
  const { data: currenciesData } = useCurrencyOptions();
  const createSaleMutation = useCreateSale();
  const updateSaleMutation = useUpdateSale();

  const handleSubmit = async (values: SaleFormValues) => {
    try {
      if (isEditMode) {
        await updateSaleMutation.mutateAsync({ id: parsedId, payload: values });
        toast.success('Sale updated');
      } else {
        await createSaleMutation.mutateAsync(values);
        toast.success('Sale created');
      }
      navigate('/sales/sales');
    } catch (error) {
      toast.error(extractAxiosError(error, 'Failed to save sale'));
    }
  };

  if (isEditMode && isLoadingSale) {
    return (
      <Card>
        <CardContent>Loading sale...</CardContent>
      </Card>
    );
  }

  if (isEditMode && (isError || !sale)) {
    return (
      <Card>
        <CardContent className="space-y-4">
          <p className="text-sm text-error">Sale not found.</p>
          <Button variant="outline" onClick={() => navigate('/sales/sales')}>
            Back to sales
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEditMode ? 'Edit Sale' : 'Add Sale'}
        subtitle="Store fuel sale details with currency-aware totals."
        actions={[
          {
            label: 'Back',
            icon: <ArrowLeft className="h-4 w-4" />,
            variant: 'outline',
            onClick: () => navigate('/sales/sales'),
          },
        ]}
      />

      <SaleForm
        sale={sale}
        fuels={fuelsData?.results ?? []}
        motors={motorsData?.results ?? []}
        currencies={currenciesData?.results ?? []}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/sales/sales')}
        isSubmitting={createSaleMutation.isPending || updateSaleMutation.isPending}
      />
    </div>
  );
}
