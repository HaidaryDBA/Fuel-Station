import { useTranslation } from 'react-i18next';

import { Badge, Card, CardContent, CardHeader } from '@/components/ui';

import type { Purchase } from '../types/purchasing';

interface PurchaseDetailCardProps {
  purchase: Purchase;
}

export default function PurchaseDetailCard({ purchase }: PurchaseDetailCardProps) {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader title={t('purchasing.purchaseDetails', 'Purchase Details')} />
      <CardContent>
        <dl className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-sm font-medium text-text-secondary">{t('purchasing.supplier', 'Supplier')}</dt>
            <dd className="mt-1 text-sm text-text-primary">{purchase.supplier_name}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-text-secondary">{t('purchasing.fuel', 'Fuel')}</dt>
            <dd className="mt-1 text-sm text-text-primary">{purchase.fuel_name}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-text-secondary">{t('purchasing.partner', 'Partner')}</dt>
            <dd className="mt-1 text-sm text-text-primary">{purchase.partner_name}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-text-secondary">{t('purchasing.purchaseDate', 'Purchase Date')}</dt>
            <dd className="mt-1 text-sm text-text-primary">{purchase.purchase_date}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-text-secondary">{t('purchasing.amountTon', 'Amount (Ton)')}</dt>
            <dd className="mt-1 text-sm text-text-primary">{purchase.amount_ton}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-text-secondary">{t('purchasing.density', 'Density')}</dt>
            <dd className="mt-1 text-sm text-text-primary">{purchase.density}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-text-secondary">{t('purchasing.weightKg', 'Weight (Kg)')}</dt>
            <dd className="mt-1 text-sm text-text-primary">{purchase.weight_kg}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-text-secondary">{t('purchasing.totalLiter', 'Total Liter')}</dt>
            <dd className="mt-1 text-sm text-text-primary">{purchase.total_liter}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-text-secondary">{t('purchasing.unitPrice', 'Unit Price')}</dt>
            <dd className="mt-1 text-sm text-text-primary">
              {purchase.unit_price} {purchase.currency_code}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-text-secondary">{t('purchasing.totalAmount', 'Total Amount')}</dt>
            <dd className="mt-1 text-sm text-text-primary">
              {purchase.total_amount} {purchase.currency_code}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-text-secondary">{t('purchasing.currencyRate', 'Currency Rate')}</dt>
            <dd className="mt-1 text-sm text-text-primary">{purchase.currency_rate}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-text-secondary">
              {t('purchasing.totalAmountInBase', 'Total in Base Currency')}
            </dt>
            <dd className="mt-1 text-sm text-text-primary">
              {purchase.total_amount_in_base_currency} {purchase.base_currency_code}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-text-secondary">{t('purchasing.paidAmount', 'Paid Amount')}</dt>
            <dd className="mt-1 text-sm text-text-primary">
              {purchase.paid_amount} {purchase.paid_currency_code}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-text-secondary">
              {t('purchasing.paidCurrencyRate', 'Paid Currency Rate')}
            </dt>
            <dd className="mt-1 text-sm text-text-primary">{purchase.paid_currency_rate}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-text-secondary">
              {t('purchasing.paidAmountInPurchaseCurrency', 'Paid in Purchase Currency')}
            </dt>
            <dd className="mt-1 text-sm text-text-primary">
              {purchase.paid_amount_in_purchase_currency} {purchase.currency_code}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-text-secondary">
              {t('purchasing.paidAmountInBase', 'Paid in Base Currency')}
            </dt>
            <dd className="mt-1 text-sm text-text-primary">
              {purchase.paid_amount_in_base_currency} {purchase.base_currency_code}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-text-secondary">{t('purchasing.remainingAmount', 'Remaining Amount')}</dt>
            <dd className="mt-1 text-sm text-text-primary">
              {purchase.remaining_amount} {purchase.currency_code}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-text-secondary">
              {t('purchasing.remainingAmountInBase', 'Remaining in Base Currency')}
            </dt>
            <dd className="mt-1 text-sm text-text-primary">
              {purchase.remaining_amount_in_base_currency} {purchase.base_currency_code}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-text-secondary">{t('purchasing.invoiceNumber', 'Invoice Number')}</dt>
            <dd className="mt-1 text-sm text-text-primary">{purchase.invoice_number || '-'}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-text-secondary">{t('purchasing.payDate', 'Pay Date')}</dt>
            <dd className="mt-1 text-sm text-text-primary">{purchase.pay_date || '-'}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-text-secondary">{t('purchasing.status', 'Status')}</dt>
            <dd className="mt-1">
              <Badge variant={purchase.payment_status === 'completed' ? 'success' : 'warning'} dot>
                {purchase.status_label}
              </Badge>
            </dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}
