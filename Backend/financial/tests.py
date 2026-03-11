from decimal import Decimal

from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import User
from employees.models import Employee, Partners

from .models import Account, Currency, CurrencyRate, FinancialTransaction, PartnerDebt, PartnerDebtPayment


class FinancialAPITestCase(APITestCase):
    def setUp(self):
        self.admin_user = User.objects.create_user(
            username='finance_admin',
            email='finance_admin@example.com',
            password='TestPass123!',
            role_name='admin',
            is_superuser=True,
            is_staff=True,
        )
        self.client.force_authenticate(user=self.admin_user)

        self.base_currency = Currency.objects.create(
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

        employee_user = User.objects.create_user(
            username='finance_employee',
            email='finance_employee@example.com',
            password='TestPass123!',
            first_name='Finance',
            last_name='Employee',
            role_name='staff',
            is_active=True,
        )
        self.employee = Employee.objects.create(
            user=employee_user,
            father_name='Father',
            address='Kabul',
            salary=Decimal('1500.00'),
            work_days='["monday", "tuesday"]',
            join_date='2024-01-01',
            membership_type=Employee.MEMBERSHIP_PERMANENT,
            status=Employee.STATUS_ACTIVE,
        )

        self.salaries_url = '/api/financial/salaries/'
        self.expenses_url = '/api/financial/expenses/'
        self.partner_debts_url = '/api/financial/partner-debts/'
        self.currency_rates_url = '/api/financial/currency-rates/'
        self.transactions_url = '/api/financial/transactions/'
        self.accounts_url = '/api/financial/accounts/'

        self.cash_account = Account.objects.create(
            name='Main Cash Desk',
            account_type=Account.TYPE_CASH,
            currency=self.base_currency,
            is_active=True,
        )
        self.exchange_account = Account.objects.create(
            name='USD Exchange Box',
            account_type=Account.TYPE_EXCHANGE,
            currency=self.usd_currency,
            is_active=True,
        )

        self.partner = Partners.objects.create(
            first_name='Ewaz Ali',
            father_name='Sher Hassan',
            last_name='Haidary',
            phone='0765668409',
            mean_address='Bamyan',
            current_address='Bamyan',
            DOB='2003-01-01',
            share_percentage=Decimal('10.00'),
            Join_date='2020-01-01',
        )

    def test_create_salary_auto_fills_base_salary_from_employee(self):
        payload = {
            'employee': self.employee.id,
            'year': 2025,
            'month': 2,
            'bonus': '250.00',
            'pay_date': '2025-02-28',
            'description': 'Monthly salary',
        }

        response = self.client.post(self.salaries_url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Decimal(response.data['base_salary']), Decimal('1500.00'))
        self.assertEqual(Decimal(response.data['net_salary']), Decimal('1750.00'))

    def test_create_expense_uses_latest_currency_rate_and_saves_converted_amount(self):
        CurrencyRate.objects.create(
            from_currency=self.usd_currency,
            to_currency=self.base_currency,
            rate_value=Decimal('70.000000'),
            date='2025-01-01',
            created_by=self.admin_user,
        )
        CurrencyRate.objects.create(
            from_currency=self.usd_currency,
            to_currency=self.base_currency,
            rate_value=Decimal('72.500000'),
            date='2025-01-15',
            created_by=self.admin_user,
        )

        payload = {
            'title': 'Generator maintenance',
            'amount': '10.00',
            'currency': self.usd_currency.id,
            'pay_date': '2025-01-20',
            'description': 'Monthly maintenance',
        }

        response = self.client.post(self.expenses_url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Decimal(response.data['currency_rate']), Decimal('72.500000'))
        self.assertEqual(Decimal(response.data['amount_in_base_currency']), Decimal('725.00'))

    def test_create_partner_debt_requires_paid_date_when_payment_amount_is_set(self):
        CurrencyRate.objects.create(
            from_currency=self.usd_currency,
            to_currency=self.base_currency,
            rate_value=Decimal('70.000000'),
            date='2025-01-15',
            created_by=self.admin_user,
        )

        payload = {
            'partner': self.partner.id,
            'amount_money': '100.00',
            'currency': self.usd_currency.id,
            'date': '2025-01-20',
            'payment_amount': '50.00',
            'currency_paid': self.usd_currency.id,
            'description': 'Initial partner debt',
        }

        response = self.client.post(self.partner_debts_url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('payment_date', response.data)

    def test_create_partner_debt_without_payment_keeps_it_unpaid(self):
        CurrencyRate.objects.create(
            from_currency=self.usd_currency,
            to_currency=self.base_currency,
            rate_value=Decimal('70.000000'),
            date='2025-01-15',
            created_by=self.admin_user,
        )

        payload = {
            'partner': self.partner.id,
            'amount_money': '100.00',
            'currency': self.usd_currency.id,
            'date': '2025-01-20',
            'description': 'Initial partner debt',
        }

        response = self.client.post(self.partner_debts_url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Decimal(response.data['currency_rate']), Decimal('70.000000'))
        self.assertEqual(Decimal(response.data['total_in']), Decimal('7000.00'))
        self.assertEqual(Decimal(response.data['paid_amount']), Decimal('0.00'))
        self.assertEqual(response.data['status'], 'Remaining: 7000.00')
        self.assertEqual(response.data['remaining_amount'], '7000.00')
        self.assertEqual(response.data['payments'], [])

    def test_create_partner_debt_with_initial_payment_creates_payment_history(self):
        CurrencyRate.objects.create(
            from_currency=self.usd_currency,
            to_currency=self.base_currency,
            rate_value=Decimal('70.000000'),
            date='2025-01-15',
            created_by=self.admin_user,
        )

        payload = {
            'partner': self.partner.id,
            'amount_money': '100.00',
            'currency': self.usd_currency.id,
            'date': '2025-01-20',
            'payment_amount': '20.00',
            'currency_paid': self.usd_currency.id,
            'payment_date': '2025-01-21',
            'payment_description': 'First payment',
            'description': 'Initial partner debt',
        }

        response = self.client.post(self.partner_debts_url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Decimal(response.data['paid_amount']), Decimal('1400.00'))
        self.assertEqual(response.data['paid_date'], '2025-01-21')
        self.assertEqual(response.data['status'], 'Remaining: 5600.00')
        self.assertEqual(len(response.data['payments']), 1)
        self.assertEqual(Decimal(response.data['payments'][0]['amount_paid_in_base']), Decimal('1400.00'))
        self.assertEqual(response.data['payments'][0]['currency_paid'], self.usd_currency.id)

    def test_update_partner_debt_accumulates_payments_and_marks_completed(self):
        CurrencyRate.objects.create(
            from_currency=self.usd_currency,
            to_currency=self.base_currency,
            rate_value=Decimal('70.000000'),
            date='2025-01-15',
            created_by=self.admin_user,
        )

        debt = PartnerDebt.objects.create(
            partner=self.partner,
            amount_money=Decimal('100.00'),
            currency=self.usd_currency,
            date='2025-01-20',
            currency_rate=Decimal('70.000000'),
            total_in=Decimal('7000.00'),
            paid_amount=Decimal('0.00'),
            status='Remaining: 7000.00',
            created_by=self.admin_user,
            updated_by=self.admin_user,
        )

        patch_payload = {
            'payment_amount': '100.00',
            'currency_paid': self.usd_currency.id,
            'payment_date': '2025-01-25',
        }

        response = self.client.patch(f'{self.partner_debts_url}{debt.id}/', patch_payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Decimal(response.data['paid_amount']), Decimal('7000.00'))
        self.assertEqual(response.data['status'], 'Completed')
        self.assertEqual(Decimal(response.data['remaining_amount']), Decimal('0.00'))
        self.assertEqual(response.data['updated_by'], self.admin_user.id)
        self.assertEqual(PartnerDebtPayment.objects.filter(partner_debt=debt).count(), 1)

    def test_partner_debt_rejects_overpayment_in_payment_currency(self):
        CurrencyRate.objects.create(
            from_currency=self.usd_currency,
            to_currency=self.base_currency,
            rate_value=Decimal('70.000000'),
            date='2025-01-15',
            created_by=self.admin_user,
        )

        debt = PartnerDebt.objects.create(
            partner=self.partner,
            amount_money=Decimal('100.00'),
            currency=self.usd_currency,
            date='2025-01-20',
            currency_rate=Decimal('70.000000'),
            total_in=Decimal('7000.00'),
            paid_amount=Decimal('0.00'),
            status='Remaining: 7000.00',
            created_by=self.admin_user,
            updated_by=self.admin_user,
        )

        response = self.client.patch(
            f'{self.partner_debts_url}{debt.id}/',
            {
                'payment_amount': '101.00',
                'currency_paid': self.usd_currency.id,
                'payment_date': '2025-01-25',
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('payment_amount', response.data)

    def test_currency_rate_allows_multiple_same_day_records_and_latest_saved_wins(self):
        first_response = self.client.post(
            self.currency_rates_url,
            {
                'from_currency': self.usd_currency.id,
                'to_currency': self.base_currency.id,
                'rate_value': '70.000000',
                'date': '2025-01-15',
            },
            format='json',
        )
        second_response = self.client.post(
            self.currency_rates_url,
            {
                'from_currency': self.usd_currency.id,
                'to_currency': self.base_currency.id,
                'rate_value': '72.500000',
                'date': '2025-01-15',
            },
            format='json',
        )

        self.assertEqual(first_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(second_response.status_code, status.HTTP_201_CREATED)

        expense_response = self.client.post(
            self.expenses_url,
            {
                'title': 'Fuel delivery',
                'amount': '10.00',
                'currency': self.usd_currency.id,
                'pay_date': '2025-01-15',
                'description': 'Uses the latest same-day rate',
            },
            format='json',
        )

        self.assertEqual(expense_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Decimal(expense_response.data['currency_rate']), Decimal('72.500000'))

    def test_create_financial_deposit_sets_audit_fields(self):
        payload = {
            'transaction_type': 'deposit',
            'to_account': self.cash_account.id,
            'amount': '5000.00',
            'currency': self.base_currency.id,
            'date_time': '2025-01-20T10:30:00Z',
            'reference_type': 'purchase',
            'reference_id': 101,
            'description': 'Initial cash funding',
        }

        response = self.client.post(self.transactions_url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['created_by'], self.admin_user.id)
        self.assertEqual(response.data['updated_by'], self.admin_user.id)
        self.assertEqual(response.data['to_account'], self.cash_account.id)
        self.assertIsNone(response.data['from_account'])

    def test_transfer_requires_different_accounts(self):
        payload = {
            'transaction_type': 'transfer',
            'from_account': self.cash_account.id,
            'to_account': self.cash_account.id,
            'amount': '100.00',
            'currency': self.base_currency.id,
            'date_time': '2025-01-20T10:30:00Z',
        }

        response = self.client.post(self.transactions_url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('to_account', response.data)

    def test_transaction_currency_must_match_selected_accounts(self):
        payload = {
            'transaction_type': 'withdraw',
            'from_account': self.exchange_account.id,
            'amount': '100.00',
            'currency': self.base_currency.id,
            'date_time': '2025-01-20T10:30:00Z',
        }

        response = self.client.post(self.transactions_url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('from_account', response.data)

    def test_invalid_reference_type_is_rejected(self):
        payload = {
            'transaction_type': 'deposit',
            'to_account': self.cash_account.id,
            'amount': '5000.00',
            'currency': self.base_currency.id,
            'date_time': '2025-01-20T10:30:00Z',
            'reference_type': 'manual',
            'reference_id': 101,
        }

        response = self.client.post(self.transactions_url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('reference_type', response.data)

    def test_reference_id_requires_reference_type(self):
        payload = {
            'transaction_type': 'deposit',
            'to_account': self.cash_account.id,
            'amount': '5000.00',
            'currency': self.base_currency.id,
            'date_time': '2025-01-20T10:30:00Z',
            'reference_id': 101,
        }

        response = self.client.post(self.transactions_url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('reference_type', response.data)

    def test_account_description_is_returned_and_writable(self):
        payload = {
            'name': 'Secondary Cash Desk',
            'account_type': 'cash',
            'currency': self.base_currency.id,
            'is_active': True,
            'description': 'Used for the second shift.',
        }

        create_response = self.client.post(self.accounts_url, payload, format='json')

        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(create_response.data['description'], payload['description'])

        patch_response = self.client.patch(
            f"{self.accounts_url}{create_response.data['id']}/",
            {'description': 'Updated account note.'},
            format='json',
        )

        self.assertEqual(patch_response.status_code, status.HTTP_200_OK)
        self.assertEqual(patch_response.data['description'], 'Updated account note.')

    def test_account_type_bank_is_rejected(self):
        payload = {
            'name': 'Rejected Bank Account',
            'account_type': 'bank',
            'currency': self.base_currency.id,
            'is_active': True,
            'description': 'Invalid account type.',
        }

        response = self.client.post(self.accounts_url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('account_type', response.data)
