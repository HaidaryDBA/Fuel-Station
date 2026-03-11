import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

import { extractAxiosError } from '@/utils/extractError';

import PurchaseForm from '../components/PurchaseForm';
import {
  useCreatePurchase,
  useCurrencyOptions,
  useCurrencyRates,
  useFuelOptions,
  usePartnerOptions,
  usePurchaseDetail,
  useSupplierOptions,
  useUpdatePurchase,
} from '../queries/usePurchasingQueries';
import type { PurchaseFormValues } from '../types/purchasing';

export default function PurchaseFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const isEdit = !!id;

  const { data: purchase, isLoading: isLoadingPurchase } = usePurchaseDetail(Number(id));
  const { data: suppliersData } = useSupplierOptions();
  const { data: fuelsData } = useFuelOptions();
  const { data: partnersData } = usePartnerOptions();
  const { data: currenciesData } = useCurrencyOptions();
  const { data: currencyRatesData } = useCurrencyRates();
  const createPurchase = useCreatePurchase();
  const updatePurchase = useUpdatePurchase();

  const isLoading = createPurchase.isPending || updatePurchase.isPending;

  const handleSubmit = async (data: PurchaseFormValues) => {
    try {
      if (isEdit && id) {
        await updatePurchase.mutateAsync({ id: Number(id), payload: data });
        toast.success(t('purchasing.purchaseUpdated', 'Purchase updated successfully'));
      } else {
        await createPurchase.mutateAsync(data);
        toast.success(t('purchasing.purchaseCreated', 'Purchase created successfully'));
      }
      navigate('/purchasing/purchases');
    } catch (error) {
      toast.error(extractAxiosError(error, t('purchasing.purchaseSaveFailed', 'Unable to save purchase')));
    }
  };

  if (isEdit && isLoadingPurchase) {
    return <div>Loading...</div>;
  }

  return (
    <PurchaseForm
      purchase={purchase}
      suppliers={suppliersData?.results ?? []}
      fuels={fuelsData?.results ?? []}
      partners={partnersData?.results ?? []}
      currencies={currenciesData?.results ?? []}
      currencyRates={currencyRatesData?.results ?? []}
      onSubmit={handleSubmit}
      onCancel={() => navigate('/purchasing/purchases')}
      isLoading={isLoading}
    />
  );
}
