from decimal import Decimal

from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import User
from employees.models import Employee

from .models import Fuel, FuelMotor, InventoryTransaction, PriceHistory, TankStorage


class InventoryApiTestCase(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='inventory_admin',
            email='inventory_admin@example.com',
            password='TestPass123!',
            role_name='admin',
            is_superuser=True,
            is_staff=True,
            first_name='Inventory',
            last_name='Admin',
        )
        self.employee = Employee.objects.create(
            user=self.user,
            father_name='Sample Father',
            address='Kabul',
            salary=Decimal('1200.00'),
            work_days='["monday","tuesday","wednesday"]',
            join_date='2024-01-01',
            membership_type=Employee.MEMBERSHIP_PERMANENT,
            status=Employee.STATUS_ACTIVE,
        )
        self.client.force_authenticate(user=self.user)

        self.fuel_url = '/api/inventory/fuel/'
        self.tank_url = '/api/inventory/tank-storage/'
        self.motor_url = '/api/inventory/fuel-motor/'
        self.price_url = '/api/inventory/price-history/'
        self.transaction_url = '/api/inventory/transaction/'

    def _create_seed(self):
        fuel = Fuel.objects.create(fuel_name='Diesel', type='Regular')
        tank = TankStorage.objects.create(
            Fuel=fuel,
            tank_number=1,
            capacity='1000.00',
            min_level_alert=100,
        )
        return fuel, tank

    def test_fuel_crud_and_list_shape(self):
        create_response = self.client.post(
            self.fuel_url,
            {'fuel_name': 'Petrol', 'type': 'Super'},
            format='json',
        )
        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)
        fuel_id = create_response.data['id']

        list_response = self.client.get(self.fuel_url, {'search': 'Petrol', 'page': 1, 'page_size': 10})
        self.assertEqual(list_response.status_code, status.HTTP_200_OK)
        self.assertIn('count', list_response.data)
        self.assertIn('results', list_response.data)
        self.assertEqual(list_response.data['count'], 1)

        update_response = self.client.patch(
            f'{self.fuel_url}{fuel_id}/',
            {'type': 'Premium'},
            format='json',
        )
        self.assertEqual(update_response.status_code, status.HTTP_200_OK)
        self.assertEqual(update_response.data['type'], 'Premium')

        delete_response = self.client.delete(f'{self.fuel_url}{fuel_id}/')
        self.assertEqual(delete_response.status_code, status.HTTP_204_NO_CONTENT)

    def test_transaction_create_sets_created_at_from_logged_in_employee(self):
        fuel, tank = self._create_seed()
        payload = {
            'tank_id': tank.id,
            'fuel_id': fuel.id,
            'transaction_type': 'purchase_in',
            'quantity': 500,
            'reference_type': 'purchase',
            'reference_id': 123,
            'date_time': '2026-03-03T08:30:00Z',
            'description': 'New supply received',
        }

        response = self.client.post(self.transaction_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['created_at'], self.employee.id)
        self.assertTrue(response.data['created_by'])

    def test_transaction_create_succeeds_without_employee_profile(self):
        user_without_employee = User.objects.create_user(
            username='inventory_staff_no_employee',
            email='inventory_staff_no_employee@example.com',
            password='TestPass123!',
            role_name='staff',
            first_name='No',
            last_name='Employee',
        )
        self.client.force_authenticate(user=user_without_employee)
        fuel, tank = self._create_seed()

        payload = {
            'tank_id': tank.id,
            'fuel_id': fuel.id,
            'transaction_type': 'purchase_in',
            'quantity': 200,
            'reference_type': 'purchase',
            'reference_id': 124,
            'date_time': '2026-03-03T10:30:00Z',
            'description': 'Supply received without employee profile',
        }

        response = self.client.post(self.transaction_url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIsNone(response.data['created_at'])
        self.assertEqual(response.data['created_by'], 'No Employee')

    def test_inventory_transaction_filtering_by_type(self):
        fuel, tank = self._create_seed()
        InventoryTransaction.objects.create(
            tank_id=tank,
            fuel_id=fuel,
            transaction_type='purchase_in',
            quantity=400,
            reference_type='purchase',
            reference_id=111,
            date_time='2026-03-01T08:30:00Z',
            created_at=self.employee,
            description='Purchase',
        )
        InventoryTransaction.objects.create(
            tank_id=tank,
            fuel_id=fuel,
            transaction_type='sale_out',
            quantity=150,
            reference_type='sale',
            reference_id=222,
            date_time='2026-03-02T09:30:00Z',
            created_at=self.employee,
            description='Sale',
        )

        response = self.client.get(self.transaction_url, {'transaction_type': 'sale_out'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['transaction_type'], 'sale_out')

    def test_other_inventory_models_can_be_created(self):
        fuel, tank = self._create_seed()

        motor_response = self.client.post(
            self.motor_url,
            {'tank_id': tank.id, 'motor_name': 'Motor-1', 'fuel_id': fuel.id},
            format='json',
        )
        self.assertEqual(motor_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(FuelMotor.objects.count(), 1)

        price_response = self.client.post(
            self.price_url,
            {
                'fuel': fuel.id,
                'price': 95,
                'start_date': '2026-03-01',
                'end_date': '2026-03-31',
            },
            format='json',
        )
        self.assertEqual(price_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(PriceHistory.objects.count(), 1)

    def test_price_history_end_date_is_optional(self):
        fuel, _ = self._create_seed()

        response = self.client.post(
            self.price_url,
            {
                'fuel': fuel.id,
                'price': 100,
                'start_date': '2026-03-01',
                'end_date': '',
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIsNone(response.data['end_date'])

    def test_same_tank_can_have_multiple_motors_for_the_same_fuel(self):
        fuel, tank = self._create_seed()

        first_response = self.client.post(
            self.motor_url,
            {'tank_id': tank.id, 'motor_name': 'Motor-1', 'fuel_id': fuel.id},
            format='json',
        )
        second_response = self.client.post(
            self.motor_url,
            {'tank_id': tank.id, 'motor_name': 'Motor-2', 'fuel_id': fuel.id},
            format='json',
        )

        self.assertEqual(first_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(second_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(FuelMotor.objects.filter(tank_id=tank).count(), 2)

    def test_motor_rejects_fuel_that_does_not_match_the_selected_tank(self):
        fuel, tank = self._create_seed()
        other_fuel = Fuel.objects.create(fuel_name='Petrol', type='Super')

        response = self.client.post(
            self.motor_url,
            {'tank_id': tank.id, 'motor_name': 'Motor-1', 'fuel_id': other_fuel.id},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.data['fuel_id'][0],
            'Selected fuel must match the tank fuel.',
        )
        self.assertFalse(FuelMotor.objects.filter(tank_id=tank, fuel_id=other_fuel).exists())

    def test_adjustment_transaction_requires_direction(self):
        fuel, tank = self._create_seed()

        response = self.client.post(
            self.transaction_url,
            {
                'tank_id': tank.id,
                'fuel_id': fuel.id,
                'transaction_type': 'adjustment',
                'quantity': '10.00',
                'reference_type': 'adjustment',
                'reference_id': 900,
                'date_time': '2026-03-03T08:30:00Z',
                'description': 'Manual correction',
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('adjustment_direction', response.data)
