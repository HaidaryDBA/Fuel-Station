from datetime import timedelta
from decimal import Decimal

from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import User
from employees.models import Customer, Employee, Partners
from financial.models import Account, Currency, CurrencyRate, Expense, FinancialTransaction, PartnerDebt, Salary
from inventory.models import Fuel, InventoryTransaction, TankStorage
from purchasing.models import Purchase, Supplier


class ReportsApiTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='reports_admin',
            email='reports_admin@example.com',
            password='TestPass123!',
            role_name='admin',
            is_superuser=True,
            is_staff=True,
            first_name='Reports',
            last_name='Admin',
        )
        self.employee = Employee.objects.create(
            user=self.user,
            father_name='Father',
            address='Kabul',
            salary=Decimal('1500.00'),
            work_days='["monday","tuesday"]',
            join_date='2024-01-01',
            membership_type=Employee.MEMBERSHIP_PERMANENT,
            status=Employee.STATUS_ACTIVE,
        )
        self.client.force_authenticate(user=self.user)

        self.afn = Currency.objects.create(code='AFN', name='Afghani', symbol='AFN', is_base=True, is_active=True)
        self.usd = Currency.objects.create(code='USD', name='US Dollar', symbol='$', is_base=False, is_active=True)
        CurrencyRate.objects.create(
            from_currency=self.usd,
            to_currency=self.afn,
            rate_value=Decimal('70.000000'),
            date=timezone.localdate(),
            created_by=self.user,
        )

        self.fuel = Fuel.objects.create(fuel_name='Diesel', type='Regular')
        self.tank = TankStorage.objects.create(
            Fuel=self.fuel,
            tank_number=1,
            capacity=Decimal('5000.00'),
            min_level_alert=500,
        )
        self.motor = self.tank.fuelmotor_set.create(motor_name='Motor-1', fuel_id=self.fuel)
        self.customer = Customer.objects.create(first_name='Ahmad', last_name='Zahir', phone='0700000000')
        self.partner = Partners.objects.create(
            first_name='Partner',
            father_name='A',
            last_name='One',
            phone='0799999999',
            mean_address='Kabul',
            current_address='Kabul',
            DOB='2000-01-01',
            share_percentage=Decimal('20.00'),
            Join_date='2024-01-01',
        )
        self.supplier = Supplier.objects.create(supplier_name='Fuel Supplier')

        self.cash_account = Account.objects.create(
            name='Main Cash',
            account_type=Account.TYPE_CASH,
            currency=self.afn,
            is_active=True,
        )
        self.exchange_account = Account.objects.create(
            name='USD Box',
            account_type=Account.TYPE_EXCHANGE,
            currency=self.usd,
            is_active=True,
        )

        FinancialTransaction.objects.create(
            transaction_type=FinancialTransaction.TYPE_DEPOSIT,
            to_account=self.cash_account,
            amount=Decimal('10000.00'),
            currency=self.afn,
            date_time=timezone.now(),
            created_by=self.user,
        )
        FinancialTransaction.objects.create(
            transaction_type=FinancialTransaction.TYPE_DEPOSIT,
            to_account=self.exchange_account,
            amount=Decimal('100.00'),
            currency=self.usd,
            date_time=timezone.now(),
            created_by=self.user,
        )

        Expense.objects.create(
            title='Fuel station repair',
            amount=Decimal('100.00'),
            currency=self.afn,
            currency_rate=Decimal('1.00'),
            amount_in_base_currency=Decimal('100.00'),
            pay_date=timezone.localdate(),
        )
        PartnerDebt.objects.create(
            partner=self.partner,
            amount_money=Decimal('100.00'),
            currency=self.usd,
            currency_rate=Decimal('70.00'),
            total_in=Decimal('7000.00'),
            paid_amount=Decimal('2000.00'),
            status='Remaining: 5000.00',
            created_by=self.user,
            updated_by=self.user,
            date=timezone.localdate(),
        )
        Salary.objects.create(
            employee=self.employee,
            year=timezone.localdate().year,
            month=timezone.localdate().month,
            base_salary=Decimal('1500.00'),
            bonus=Decimal('100.00'),
            net_salary=Decimal('1600.00'),
            pay_date=timezone.localdate(),
        )
        Purchase.objects.create(
            fuel=self.fuel,
            supplier=self.supplier,
            partner=self.partner,
            purchase_date=timezone.localdate(),
            amount_ton=Decimal('1.000'),
            density=Decimal('0.8000'),
            unit_price=Decimal('100.00'),
            currency=self.afn,
            currency_rate=Decimal('1.000000'),
            total_amount_value=Decimal('100.00'),
            total_amount_in_base_currency=Decimal('100.00'),
            paid_currency=self.afn,
            paid_currency_rate=Decimal('1.000000'),
            paid_amount=Decimal('50.00'),
            paid_amount_in_purchase_currency_value=Decimal('50.00'),
            paid_amount_in_base_currency_value=Decimal('50.00'),
            remaining_amount_value=Decimal('50.00'),
            remaining_amount_in_base_currency_value=Decimal('50.00'),
        )

        order_purchase_response = self.client.post(
            '/api/purchasing/order-purchases/',
            {
                'supplier': self.supplier.supplier_id,
                'amount_per_ton': '1.000',
                'density': '0.8000',
                'purchase_price': '100.00',
                'currency': self.afn.id,
                'transport_cost': '0.00',
                'tanker': self.tank.id,
                'date': timezone.localdate().isoformat(),
                'description': 'Restock',
            },
            format='json',
        )
        self.assertEqual(order_purchase_response.status_code, status.HTTP_201_CREATED)

        sale_response = self.client.post(
            '/api/sales/sales/',
            {
                'fuel': self.fuel.id,
                'motor': self.motor.id,
                'sale_date': timezone.localdate().isoformat(),
                'amount': '100.00',
                'unit_price': '2.00',
                'currency': self.afn.id,
            },
            format='json',
        )
        self.assertEqual(sale_response.status_code, status.HTTP_201_CREATED)

        lending_response = self.client.post(
            '/api/sales/lendings/',
            {
                'customer': self.customer.id,
                'fuel': self.fuel.id,
                'tank_id': self.tank.id,
                'amount': '20.00',
                'unit_price': '2.00',
                'discount': '0.00',
                'sale_date': timezone.localdate().isoformat(),
                'end_date': (timezone.localdate() + timedelta(days=3)).isoformat(),
                'paid_amount': '10.00',
            },
            format='json',
        )
        self.assertEqual(lending_response.status_code, status.HTTP_201_CREATED)

        InventoryTransaction.objects.create(
            tank_id=self.tank,
            fuel_id=self.fuel,
            transaction_type='adjustment',
            quantity=Decimal('10.00'),
            reference_type='adjustment',
            reference_id=999,
            date_time=timezone.now(),
            created_at=self.employee,
            description='Manual correction',
            adjustment_direction='in',
        )

    def test_reports_overview_returns_core_sections(self):
        response = self.client.get('/api/reports/overview/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('inventory', response.data)
        self.assertIn('finance', response.data)
        self.assertIn('sales', response.data)
        self.assertIn('lendings', response.data)
        self.assertIn('purchases', response.data)

    def test_account_balances_report_returns_native_and_base_totals(self):
        response = self.client.get('/api/reports/finance/account-balances/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['rows']), 2)
        cash_row = next(row for row in response.data['rows'] if row['account_name'] == 'Main Cash')
        exchange_row = next(row for row in response.data['rows'] if row['account_name'] == 'USD Box')
        self.assertEqual(Decimal(cash_row['native_balance']), Decimal('10000.00'))
        self.assertEqual(Decimal(exchange_row['base_balance']), Decimal('7000.00'))

    def test_inventory_stock_report_uses_signed_movements(self):
        response = self.client.get('/api/reports/inventory/stock/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        row = response.data['rows'][0]
        self.assertEqual(Decimal(row['current_liters']), Decimal('1140.00'))

    def test_due_soon_lendings_report_includes_next_seven_days(self):
        response = self.client.get('/api/reports/lendings/due-soon/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['summary']['count'], 1)
        self.assertEqual(response.data['rows'][0]['customer_name'], self.customer.full_name)

    def test_purchase_summary_report_returns_daily_rows(self):
        response = self.client.get('/api/reports/purchases/summary/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['daily_series']), 1)
        self.assertEqual(Decimal(response.data['daily_series'][0]['liters']), Decimal('1250.00'))

    def test_csv_export_returns_attachment(self):
        response = self.client.get('/api/reports/exports/account-balances/csv/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response['Content-Type'], 'text/csv')
        self.assertIn('attachment;', response['Content-Disposition'])
