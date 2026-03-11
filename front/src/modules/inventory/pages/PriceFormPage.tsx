import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

import { extractAxiosError } from '@/utils/extractError';

import PriceForm from '../components/PriceForm';
import {
  useCreatePriceHistory,
  useFuelsList,
  usePriceHistoryDetail,
  useUpdatePriceHistory,
} from '../queries/useInventoryQueries';
import type { PriceHistoryFormValues } from '../types/inventory';

export default function PriceFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const isEdit = !!id;

  const { data: priceHistory, isLoading: isLoadingPrice } = usePriceHistoryDetail(Number(id));
  const { data: fuelsData } = useFuelsList({ page_size: 100 });
  const createPrice = useCreatePriceHistory();
  const updatePrice = useUpdatePriceHistory();
  const isLoading = createPrice.isPending || updatePrice.isPending;

  const handleSubmit = async (data: PriceHistoryFormValues) => {
    try {
      if (isEdit && id) {
        await updatePrice.mutateAsync({ id: Number(id), payload: data });
        toast.success(t('inventory.priceUpdated'));
      } else {
        await createPrice.mutateAsync(data);
        toast.success(t('inventory.priceCreated'));
      }
      navigate('/fuel/prices');
    } catch (error) {
      toast.error(extractAxiosError(error, t('inventory.priceSaveFailed')));
    }
  };

  if (isEdit && isLoadingPrice) {
    return <div>Loading...</div>;
  }

  return (
    <PriceForm
      priceHistory={priceHistory}
      fuels={fuelsData?.results ?? []}
      onSubmit={handleSubmit}
      onCancel={() => navigate('/fuel/prices')}
      isLoading={isLoading}
    />
  );
}
