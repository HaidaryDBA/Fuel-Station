from datetime import datetime, timezone as dt_timezone
from decimal import Decimal
from unittest.mock import patch

from django.test import override_settings
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import User
from employees.models import Employee, Partners
from financial.models import Currency, CurrencyRate
from inventory.models import Fuel, InventoryTransaction, TankStorage

from .models import OrderPurchase, Purchase, Supplier


class PurchasingApiTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='purchase_admin',
            email='purchase_admin@example.com',
            password='TestPass123!',
            role_name='admin',
            is_superuser=True,
            is_staff=True,
        )
        self.employee = Employee.objects.create(
            user=self.user,
            father_name='Sample Father',
            address='Kabul',
            salary=Decimal('1200.00'),
            work_days='["monday","tuesday"]',
            join_date='2024-01-01',
            membership_type=Employee.MEMBERSHIP_PERMANENT,
            status=Employee.STATUS_ACTIVE,
        )
        self.client.force_authenticate(user=self.user)

        self.currency = Currency.objects.create(
            code='AFN',
            name='Afghani',
            symbol='AFN',
            is_base=True,
            is_active=True,
        )
        self.usd_currency = Currency.objects.create(
            code='USD',
            name='US Dollar',
            symbol='$',
            is_base=False,
            is_active=True,
        )
        self.fuel = Fuel.objects.create(fuel_name='Diesel', type='Fuel')
        self.partner = Partners.objects.create(
            first_name='Ali',
            father_name='Ahmad',
            last_name='Karimi',
            phone='0700000001',
            mean_address='Kabul',
            current_address='Kabul',
            DOB='2000-01-01',
            share_percentage=Decimal('25.00'),
            Join_date='2024-01-01',
        )
        self.supplier = Supplier.objects.create(
            supplier_name='North Fuel Supplier',
            phone='0799000000',
            address='Mazar',
        )
        self.tank = TankStorage.objects.create(
            Fuel=self.fuel,
            tank_number=1,
            capacity=Decimal('50000.00'),
            min_level_alert=1000,
        )

        self.purchases_url = '/api/purchasing/purchases/'
        self.order_purchases_url = '/api/purchasing/order-purchases/'

    def test_purchase_returns_calculated_liters_amounts_and_completed_status(self):
        payload = {
            'fuel': self.fuel.id,
            'supplier': self.supplier.supplier_id,
            'partner': self.partner.id,
            'purchase_date': '2026-03-01',
            'amount_ton': '10.000',
            'density': '0.8000',
            'unit_price': '500.00',
            'currency': self.currency.id,
            'paid_currency': self.currency.id,
            'invoice_number': 'INV-1001',
            'paid_amount': '5000.00',
            'pay_date': '2026-03-02',
        }

        response = self.client.post(self.purchases_url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Decimal(response.data['weight_kg']), Decimal('10000.00'))
        self.assertEqual(Decimal(response.data['total_liter']), Decimal('12500.00'))
        self.assertEqual(Decimal(response.data['total_amount']), Decimal('5000.00'))
        self.assertEqual(Decimal(response.data['currency_rate']), Decimal('1.000000'))
        self.assertEqual(Decimal(response.data['total_amount_in_base_currency']), Decimal('5000.00'))
        self.assertEqual(response.data['paid_currency_code'], 'AFN')
        self.assertEqual(Decimal(response.data['paid_currency_rate']), Decimal('1.000000'))
        self.assertEqual(Decimal(response.data['paid_amount_in_purchase_currency']), Decimal('5000.00'))
        self.assertEqual(Decimal(response.data['paid_amount_in_base_currency']), Decimal('5000.00'))
        self.assertEqual(Decimal(response.data['remaining_amount']), Decimal('0.00'))
        self.assertEqual(Decimal(response.data['remaining_amount_in_base_currency']), Decimal('0.00'))
        self.assertEqual(response.data['payment_status'], 'completed')
        self.assertEqual(response.data['status_label'], 'Completed')

        purchase = Purchase.objects.get(pk=response.data['purchase_id'])
        self.assertEqual(purchase.total_amount_value, Decimal('5000.00'))
        self.assertEqual(purchase.paid_amount_in_purchase_currency_value, Decimal('5000.00'))
        self.assertEqual(purchase.paid_amount_in_base_currency_value, Decimal('5000.00'))
        self.assertEqual(purchase.remaining_amount_value, Decimal('0.00'))
        self.assertEqual(purchase.remaining_amount_in_base_currency_value, Decimal('0.00'))

    @override_settings(TIME_ZONE='Asia/Kabul')
    def test_purchase_accepts_today_in_kabul_timezone(self):
        payload = {
            'fuel': self.fuel.id,
            'supplier': self.supplier.supplier_id,
            'partner': self.partner.id,
            'purchase_date': '2026-03-08',
            'amount_ton': '1.000',
            'density': '0.8000',
            'unit_price': '500.00',
            'currency': self.currency.id,
            'paid_currency': self.currency.id,
            'invoice_number': 'INV-TODAY-01',
            'paid_amount': '0.00',
            'pay_date': None,
        }

        current_time = datetime(2026, 3, 7, 20, 30, tzinfo=dt_timezone.utc)
        with patch('django.utils.timezone.now', return_value=current_time):
            timezone.activate(timezone.get_fixed_timezone(270))
            response = self.client.post(self.purchases_url, payload, format='json')
            timezone.deactivate()

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_purchase_rejects_paid_amount_above_total(self):
        payload = {
            'fuel': self.fuel.id,
            'supplier': self.supplier.supplier_id,
            'partner': self.partner.id,
            'purchase_date': '2026-03-01',
            'amount_ton': '5.000',
            'density': '0.8200',
            'unit_price': '400.00',
            'currency': self.currency.id,
            'paid_currency': self.currency.id,
            'invoice_number': 'INV-1002',
            'paid_amount': '5000.00',
            'pay_date': '2026-03-02',
        }

        response = self.client.post(self.purchases_url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('paid_amount', response.data)

    def test_purchase_uses_latest_currency_rate_for_base_currency_conversion(self):
        CurrencyRate.objects.create(
            from_currency=self.usd_currency,
            to_currency=self.currency,
            rate_value=Decimal('70.500000'),
            date='2026-03-04',
            created_by=self.user,
        )
        CurrencyRate.objects.create(
            from_currency=self.usd_currency,
            to_currency=self.currency,
            rate_value=Decimal('71.250000'),
            date='2026-03-05',
            created_by=self.user,
        )

        payload = {
            'fuel': self.fuel.id,
            'supplier': self.supplier.supplier_id,
            'partner': self.partner.id,
            'purchase_date': '2026-03-05',
            'amount_ton': '2.000',
            'density': '0.8200',
            'unit_price': '100.00',
            'currency': self.usd_currency.id,
            'paid_currency': self.usd_currency.id,
            'invoice_number': 'INV-USD-01',
            'paid_amount': '20.00',
            'pay_date': '2026-03-05',
        }

        response = self.client.post(self.purchases_url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Decimal(response.data['total_amount']), Decimal('200.00'))
        self.assertEqual(Decimal(response.data['currency_rate']), Decimal('71.250000'))
        self.assertEqual(Decimal(response.data['total_amount_in_base_currency']), Decimal('14250.00'))
        self.assertEqual(Decimal(response.data['paid_currency_rate']), Decimal('1.000000'))
        self.assertEqual(Decimal(response.data['paid_amount_in_purchase_currency']), Decimal('20.00'))
        self.assertEqual(Decimal(response.data['paid_amount_in_base_currency']), Decimal('1425.00'))
        self.assertEqual(Decimal(response.data['remaining_amount_in_base_currency']), Decimal('12825.00'))
        self.assertEqual(response.data['base_currency_code'], 'AFN')

    def test_purchase_rejects_non_base_currency_without_exchange_rate(self):
        payload = {
            'fuel': self.fuel.id,
            'supplier': self.supplier.supplier_id,
            'partner': self.partner.id,
            'purchase_date': '2026-03-05',
            'amount_ton': '2.000',
            'density': '0.8200',
            'unit_price': '100.00',
            'currency': self.usd_currency.id,
            'paid_currency': self.usd_currency.id,
            'invoice_number': 'INV-USD-02',
            'paid_amount': '0.00',
            'pay_date': None,
        }

        response = self.client.post(self.purchases_url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('currency_rate', response.data)

    def test_purchase_converts_paid_amount_from_paid_currency_to_purchase_currency(self):
        CurrencyRate.objects.create(
            from_currency=self.usd_currency,
            to_currency=self.currency,
            rate_value=Decimal('70.000000'),
            date='2026-03-05',
            created_by=self.user,
        )

        payload = {
            'fuel': self.fuel.id,
            'supplier': self.supplier.supplier_id,
            'partner': self.partner.id,
            'purchase_date': '2026-03-05',
            'amount_ton': '2.000',
            'density': '0.8200',
            'unit_price': '100.00',
            'currency': self.usd_currency.id,
            'paid_currency': self.currency.id,
            'invoice_number': 'INV-MIXED-01',
            'paid_amount': '3500.00',
            'pay_date': '2026-03-05',
        }

        response = self.client.post(self.purchases_url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['paid_currency_code'], 'AFN')
        self.assertEqual(Decimal(response.data['paid_currency_rate']), Decimal('0.014286'))
        self.assertEqual(Decimal(response.data['paid_amount_in_purchase_currency']), Decimal('50.00'))
        self.assertEqual(Decimal(response.data['paid_amount_in_base_currency']), Decimal('3500.00'))
        self.assertEqual(Decimal(response.data['remaining_amount']), Decimal('150.00'))
        self.assertEqual(Decimal(response.data['remaining_amount_in_base_currency']), Decimal('10500.00'))

        purchase = Purchase.objects.get(pk=response.data['purchase_id'])
        self.assertEqual(purchase.total_amount_value, Decimal('200.00'))
        self.assertEqual(purchase.total_amount_in_base_currency, Decimal('14000.00'))
        self.assertEqual(purchase.paid_amount_in_purchase_currency_value, Decimal('50.00'))
        self.assertEqual(purchase.paid_amount_in_base_currency_value, Decimal('3500.00'))
        self.assertEqual(purchase.remaining_amount_value, Decimal('150.00'))
        self.assertEqual(purchase.remaining_amount_in_base_currency_value, Decimal('10500.00'))

    def test_purchase_rejects_paid_amount_when_conversion_exceeds_total(self):
        CurrencyRate.objects.create(
            from_currency=self.usd_currency,
            to_currency=self.currency,
            rate_value=Decimal('70.000000'),
            date='2026-03-05',
            created_by=self.user,
        )

        payload = {
            'fuel': self.fuel.id,
            'supplier': self.supplier.supplier_id,
            'partner': self.partner.id,
            'purchase_date': '2026-03-05',
            'amount_ton': '2.000',
            'density': '0.8200',
            'unit_price': '100.00',
            'currency': self.usd_currency.id,
            'paid_currency': self.currency.id,
            'invoice_number': 'INV-MIXED-02',
            'paid_amount': '20000.00',
            'pay_date': '2026-03-05',
        }

        response = self.client.post(self.purchases_url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('paid_amount', response.data)

    def test_order_purchase_sets_created_by_and_computed_total_cost(self):
        payload = {
            'supplier': self.supplier.supplier_id,
            'amount_per_ton': '12.500',
            'density': '0.7900',
            'purchase_price': '450.00',
            'currency': self.currency.id,
            'transport_cost': '300.00',
            'tanker': self.tank.id,
            'date': '2026-03-03',
            'description': 'Urgent refill',
        }

        response = self.client.post(self.order_purchases_url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['created_by'], self.user.id)
        self.assertEqual(response.data['created_by_name'], self.user.username)
        self.assertEqual(response.data['order_id'], response.data['order_purchase_id'])
        self.assertEqual(Decimal(response.data['estimated_total_cost']), Decimal('5925.00'))
        self.assertEqual(Decimal(response.data['currency_rate']), Decimal('1.000000'))
        self.assertEqual(Decimal(response.data['currency_cost']), Decimal('5925.00'))
        self.assertEqual(response.data['base_currency_code'], 'AFN')
        self.assertEqual(Decimal(response.data['density_per_ton']), Decimal('1265.82'))
        self.assertEqual(Decimal(response.data['total_liter']), Decimal('15822.78'))

        order_purchase = OrderPurchase.objects.get(order_purchase_id=response.data['order_purchase_id'])
        self.assertEqual(order_purchase.created_by_id, self.user.id)
        self.assertEqual(order_purchase.order_id, order_purchase.order_purchase_id)
        self.assertEqual(order_purchase.currency_rate, Decimal('1.000000'))
        self.assertEqual(order_purchase.currency_cost, Decimal('5925.00'))

    def test_order_purchase_uses_latest_currency_rate_for_currency_cost(self):
        CurrencyRate.objects.create(
            from_currency=self.usd_currency,
            to_currency=self.currency,
            rate_value=Decimal('70.500000'),
            date='2026-03-04',
            created_by=self.user,
        )
        CurrencyRate.objects.create(
            from_currency=self.usd_currency,
            to_currency=self.currency,
            rate_value=Decimal('71.250000'),
            date='2026-03-05',
            created_by=self.user,
        )

        payload = {
            'supplier': self.supplier.supplier_id,
            'amount_per_ton': '2.000',
            'density': '0.8000',
            'purchase_price': '100.00',
            'currency': self.usd_currency.id,
            'transport_cost': '50.00',
            'tanker': self.tank.id,
            'date': '2026-03-05',
            'description': 'USD order',
        }

        response = self.client.post(self.order_purchases_url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Decimal(response.data['estimated_total_cost']), Decimal('250.00'))
        self.assertEqual(Decimal(response.data['currency_rate']), Decimal('71.250000'))
        self.assertEqual(Decimal(response.data['currency_cost']), Decimal('17812.50'))
        self.assertEqual(response.data['base_currency_code'], 'AFN')

    def test_order_purchase_rejects_non_base_currency_without_exchange_rate(self):
        payload = {
            'supplier': self.supplier.supplier_id,
            'amount_per_ton': '2.000',
            'density': '0.8000',
            'purchase_price': '100.00',
            'currency': self.usd_currency.id,
            'transport_cost': '50.00',
            'tanker': self.tank.id,
            'date': '2026-03-05',
            'description': 'USD order without rate',
        }

        response = self.client.post(self.order_purchases_url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('currency_rate', response.data)

    def test_order_purchase_syncs_inventory_transaction(self):
        payload = {
            'supplier': self.supplier.supplier_id,
            'amount_per_ton': '1.000',
            'density': '0.8000',
            'purchase_price': '100.00',
            'currency': self.currency.id,
            'transport_cost': '0.00',
            'tanker': self.tank.id,
            'date': '2026-03-03',
            'description': 'Sync inventory',
        }

        response = self.client.post(self.order_purchases_url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        transaction = InventoryTransaction.objects.get(
            reference_type='purchase',
            reference_id=response.data['order_purchase_id'],
            transaction_type='purchase_in',
        )
        self.assertEqual(transaction.tank_id_id, self.tank.id)
        self.assertEqual(transaction.fuel_id_id, self.fuel.id)
        self.assertEqual(Decimal(transaction.quantity), Decimal('1250.00'))

    def test_deleting_order_purchase_removes_synced_inventory_transaction(self):
        order_purchase = OrderPurchase.objects.create(
            supplier=self.supplier,
            amount_per_ton=Decimal('1.000'),
            density=Decimal('0.8000'),
            purchase_price=Decimal('100.00'),
            currency=self.currency,
            currency_rate=Decimal('1.000000'),
            currency_cost=Decimal('100.00'),
            transport_cost=Decimal('0.00'),
            tanker=self.tank,
            date='2026-03-03',
            created_by=self.user,
            description='Seed order purchase',
        )
        InventoryTransaction.objects.create(
            tank_id=self.tank,
            fuel_id=self.fuel,
            transaction_type='purchase_in',
            quantity=Decimal('1250.00'),
            reference_type='purchase',
            reference_id=order_purchase.order_purchase_id,
            date_time=timezone.now(),
            created_at=self.employee,
            description='Auto-synced from order purchase',
        )

        response = self.client.delete(f'{self.order_purchases_url}{order_purchase.order_purchase_id}/')

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(
            InventoryTransaction.objects.filter(
                reference_type='purchase',
                reference_id=order_purchase.order_purchase_id,
                transaction_type='purchase_in',
            ).exists()
        )
