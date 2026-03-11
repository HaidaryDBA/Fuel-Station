import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

import OrderPurchaseForm from '../components/OrderPurchaseForm';
import {
  useCreateOrderPurchase,
  useCurrencyOptions,
  useCurrencyRates,
  useOrderPurchaseDetail,
  useSupplierOptions,
  useTankOptions,
  useUpdateOrderPurchase,
} from '../queries/usePurchasingQueries';
import type { OrderPurchaseFormValues } from '../types/purchasing';

export default function OrderPurchaseFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const isEdit = !!id;

  const { data: orderPurchase, isLoading: isLoadingOrderPurchase } = useOrderPurchaseDetail(Number(id));
  const { data: suppliersData } = useSupplierOptions();
  const { data: currenciesData } = useCurrencyOptions();
  const { data: currencyRatesData } = useCurrencyRates();
  const { data: tanksData } = useTankOptions();
  const createOrderPurchase = useCreateOrderPurchase();
  const updateOrderPurchase = useUpdateOrderPurchase();

  const isLoading = createOrderPurchase.isPending || updateOrderPurchase.isPending;

  const handleSubmit = async (data: OrderPurchaseFormValues) => {
    try {
      if (isEdit && id) {
        await updateOrderPurchase.mutateAsync({ id: Number(id), payload: data });
        toast.success(t('purchasing.orderPurchaseUpdated', 'Order purchase updated successfully'));
      } else {
        await createOrderPurchase.mutateAsync(data);
        toast.success(t('purchasing.orderPurchaseCreated', 'Order purchase created successfully'));
      }
      navigate('/purchasing/orders');
    } catch {
      toast.error(t('purchasing.orderPurchaseSaveFailed', 'Unable to save order purchase'));
    }
  };

  if (isEdit && isLoadingOrderPurchase) {
    return <div>Loading...</div>;
  }

  return (
    <OrderPurchaseForm
      orderPurchase={orderPurchase}
      suppliers={suppliersData?.results ?? []}
      currencies={currenciesData?.results ?? []}
      currencyRates={currencyRatesData?.results ?? []}
      tanks={tanksData?.results ?? []}
      onSubmit={handleSubmit}
      onCancel={() => navigate('/purchasing/orders')}
      isLoading={isLoading}
    />
  );
}
