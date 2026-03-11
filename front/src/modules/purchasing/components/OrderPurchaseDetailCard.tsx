import { useTranslation } from 'react-i18next';

import { Card, CardContent, CardHeader } from '@/components/ui';

import type { OrderPurchase } from '../types/purchasing';

interface OrderPurchaseDetailCardProps {
  orderPurchase: OrderPurchase;
}

export default function OrderPurchaseDetailCard({ orderPurchase }: OrderPurchaseDetailCardProps) {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader title={t('purchasing.orderPurchaseDetails', 'Order Purchase Details')} />
      <CardContent>
        <dl className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-sm font-medium text-text-secondary">{t('purchasing.orderId', 'Order ID')}</dt>
            <dd className="mt-1 text-sm text-text-primary">#{orderPurchase.order_id}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-text-secondary">{t('purchasing.supplier', 'Supplier')}</dt>
            <dd className="mt-1 text-sm text-text-primary">{orderPurchase.supplier_name}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-text-secondary">{t('purchasing.tanker', 'Tanker')}</dt>
            <dd className="mt-1 text-sm text-text-primary">{orderPurchase.tanker_name}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-text-secondary">{t('purchasing.amountPerTon', 'Amount Per Ton')}</dt>
            <dd className="mt-1 text-sm text-text-primary">{orderPurchase.amount_per_ton}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-text-secondary">{t('purchasing.density', 'Density')}</dt>
            <dd className="mt-1 text-sm text-text-primary">{orderPurchase.density}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-text-secondary">
              {t('purchasing.densityPerTon', 'Density Per Ton')}
            </dt>
            <dd className="mt-1 text-sm text-text-primary">{orderPurchase.density_per_ton}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-text-secondary">{t('purchasing.totalLiter', 'Total Liter')}</dt>
            <dd className="mt-1 text-sm text-text-primary">{orderPurchase.total_liter}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-text-secondary">{t('purchasing.purchasePrice', 'Purchase Price')}</dt>
            <dd className="mt-1 text-sm text-text-primary">
              {orderPurchase.purchase_price} {orderPurchase.currency_code}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-text-secondary">{t('purchasing.transportCost', 'Transport Cost')}</dt>
            <dd className="mt-1 text-sm text-text-primary">
              {orderPurchase.transport_cost} {orderPurchase.currency_code}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-text-secondary">
              {t('purchasing.estimatedTotalCost', 'Estimated Total Cost')}
            </dt>
            <dd className="mt-1 text-sm text-text-primary">
              {orderPurchase.estimated_total_cost} {orderPurchase.currency_code}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-text-secondary">{t('purchasing.currencyRate', 'Currency Rate')}</dt>
            <dd className="mt-1 text-sm text-text-primary">{orderPurchase.currency_rate}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-text-secondary">{t('purchasing.currencyCost', 'Currency Cost')}</dt>
            <dd className="mt-1 text-sm text-text-primary">
              {orderPurchase.currency_cost} {orderPurchase.base_currency_code}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-text-secondary">{t('purchasing.date', 'Date')}</dt>
            <dd className="mt-1 text-sm text-text-primary">{orderPurchase.date}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-text-secondary">{t('purchasing.createdBy', 'Created By')}</dt>
            <dd className="mt-1 text-sm text-text-primary">{orderPurchase.created_by_name}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-text-secondary">{t('purchasing.description', 'Description')}</dt>
            <dd className="mt-1 text-sm text-text-primary">{orderPurchase.description || '-'}</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}
