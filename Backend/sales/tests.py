from decimal import Decimal

from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import User
from employees.models import Customer, Employee
from financial.models import Currency
from inventory.models import Fuel, InventoryTransaction, TankStorage

from .models import Lending


class SalesApiTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='sales_admin',
            email='sales_admin@example.com',
            password='TestPass123!',
            role_name='admin',
            is_superuser=True,
            is_staff=True,
        )
        self.employee = Employee.objects.create(
            user=self.user,
            father_name='Father',
            address='Kabul',
            salary=Decimal('1000.00'),
            work_days='["monday","tuesday"]',
            join_date='2024-01-01',
            membership_type=Employee.MEMBERSHIP_PERMANENT,
            status=Employee.STATUS_ACTIVE,
        )
        self.client.force_authenticate(user=self.user)

        self.currency = Currency.objects.create(code='AFN', name='Afghani', symbol='AFN', is_base=True, is_active=True)
        self.fuel = Fuel.objects.create(fuel_name='Diesel', type='Regular')
        self.tank = TankStorage.objects.create(Fuel=self.fuel, tank_number=1, capacity='5000.00', min_level_alert=500)
        self.motor = self.tank.fuelmotor_set.create(motor_name='Motor-1', fuel_id=self.fuel)
        self.customer = Customer.objects.create(first_name='Ahmad', last_name='Zahir', phone='0700000000')

        self.sales_url = '/api/sales/sales/'
        self.lendings_url = '/api/sales/lendings/'

    def test_sale_syncs_inventory_transaction(self):
        response = self.client.post(
            self.sales_url,
            {
                'fuel': self.fuel.id,
                'motor': self.motor.id,
                'sale_date': '2026-03-09',
                'amount': '100.00',
                'unit_price': '2.00',
                'currency': self.currency.id,
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        transaction = InventoryTransaction.objects.get(
            reference_type='sale',
            reference_id=response.data['sale_id'],
            transaction_type='sale_out',
        )
        self.assertEqual(transaction.tank_id_id, self.tank.id)
        self.assertEqual(Decimal(transaction.quantity), Decimal('100.00'))

    def test_lending_requires_tank_and_syncs_inventory_transaction(self):
        invalid_response = self.client.post(
            self.lendings_url,
            {
                'customer': self.customer.id,
                'fuel': self.fuel.id,
                'amount': '20.00',
                'unit_price': '2.00',
                'discount': '0.00',
                'sale_date': '2026-03-09',
                'end_date': '2026-03-12',
                'paid_amount': '5.00',
            },
            format='json',
        )
        self.assertEqual(invalid_response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('tank_id', invalid_response.data)

        valid_response = self.client.post(
            self.lendings_url,
            {
                'customer': self.customer.id,
                'fuel': self.fuel.id,
                'tank_id': self.tank.id,
                'amount': '20.00',
                'unit_price': '2.00',
                'discount': '0.00',
                'sale_date': '2026-03-09',
                'end_date': '2026-03-12',
                'paid_amount': '5.00',
            },
            format='json',
        )

        self.assertEqual(valid_response.status_code, status.HTTP_201_CREATED)
        transaction = InventoryTransaction.objects.get(
            reference_type='lending',
            reference_id=valid_response.data['lending_id'],
            transaction_type='lending_out',
        )
        self.assertEqual(transaction.tank_id_id, self.tank.id)
        self.assertEqual(Decimal(transaction.quantity), Decimal('20.00'))

    def test_deleting_sale_and_lending_removes_synced_inventory_transactions(self):
        sale_response = self.client.post(
            self.sales_url,
            {
                'fuel': self.fuel.id,
                'motor': self.motor.id,
                'sale_date': '2026-03-09',
                'amount': '10.00',
                'unit_price': '2.00',
                'currency': self.currency.id,
            },
            format='json',
        )
        lending = Lending.objects.create(
            customer=self.customer,
            fuel=self.fuel,
            tank_id=self.tank,
            amount=Decimal('5.00'),
            unit_price=Decimal('2.00'),
            discount=Decimal('0.00'),
            sale_date='2026-03-09',
            end_date='2026-03-12',
            paid_amount=Decimal('0.00'),
            total_amount_value=Decimal('10.00'),
            remaining_amount_value=Decimal('10.00'),
            status=Lending.STATUS_UNPAID,
        )
        InventoryTransaction.objects.create(
            tank_id=self.tank,
            fuel_id=self.fuel,
            transaction_type='lending_out',
            quantity=Decimal('5.00'),
            reference_type='lending',
            reference_id=lending.lending_id,
            date_time='2026-03-09T00:00:00Z',
            created_at=self.employee,
            description='Auto-synced from lending',
        )

        sale_delete = self.client.delete(f"{self.sales_url}{sale_response.data['id']}/")
        lending_delete = self.client.delete(f"{self.lendings_url}{lending.lending_id}/")

        self.assertEqual(sale_delete.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(lending_delete.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(
            InventoryTransaction.objects.filter(
                reference_type='sale',
                reference_id=sale_response.data['sale_id'],
                transaction_type='sale_out',
            ).exists()
        )
        self.assertFalse(
            InventoryTransaction.objects.filter(
                reference_type='lending',
                reference_id=lending.lending_id,
                transaction_type='lending_out',
            ).exists()
        )
