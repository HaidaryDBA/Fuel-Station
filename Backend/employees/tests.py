from datetime import date
from decimal import Decimal

from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import User
from financial.models import Salary

from .models import Employee, Partners


class EmployeeAPITestCase(APITestCase):
    def setUp(self):
        self.admin_user = User.objects.create_user(
            username='employee_admin',
            email='employee_admin@example.com',
            password='TestPass123!',
            role_name='admin',
            is_superuser=True,
            is_staff=True,
        )
        self.client.force_authenticate(user=self.admin_user)
        self.list_url = '/api/employees/'

    def _payload(self, **overrides):
        payload = {
            'first_name': 'John',
            'last_name': 'Doe',
            'father_name': 'Robert Doe',
            'address': 'Kabul, District 4',
            'phone': '+93700000001',
            'salary': '500.00',
            'work_days': ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
            'join_date': '2024-01-01',
            'membership_type': 'permanent',
            'role': 'staff',
            'status': 'active',
        }
        payload.update(overrides)
        return payload

    def test_create_employee_success(self):
        response = self.client.post(self.list_url, self._payload(), format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Employee.objects.count(), 1)
        employee = Employee.objects.first()
        self.assertTrue(bool(employee.user.username))
        self.assertEqual(employee.user.email, '')
        self.assertFalse(employee.user.has_usable_password())

    def test_update_syncs_role_and_status_with_user(self):
        create_response = self.client.post(self.list_url, self._payload(), format='json')
        employee_id = create_response.data['id']

        response = self.client.patch(
            f'{self.list_url}{employee_id}/',
            {'role': 'manager', 'status': 'inactive', 'salary': '750.00'},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        employee = Employee.objects.get(id=employee_id)
        self.assertEqual(employee.status, Employee.STATUS_INACTIVE)
        self.assertEqual(employee.salary, Decimal('750.00'))
        self.assertEqual(employee.user.role_name, 'manager')
        self.assertFalse(employee.user.is_active)

    def test_activate_and_deactivate_actions(self):
        create_response = self.client.post(self.list_url, self._payload(status='inactive'), format='json')
        employee_id = create_response.data['id']

        activate_response = self.client.post(f'{self.list_url}{employee_id}/activate/')
        self.assertEqual(activate_response.status_code, status.HTTP_200_OK)

        employee = Employee.objects.get(id=employee_id)
        self.assertEqual(employee.status, Employee.STATUS_ACTIVE)
        self.assertTrue(employee.user.is_active)

        deactivate_response = self.client.post(f'{self.list_url}{employee_id}/deactivate/')
        self.assertEqual(deactivate_response.status_code, status.HTTP_200_OK)

        employee.refresh_from_db()
        self.assertEqual(employee.status, Employee.STATUS_INACTIVE)
        self.assertFalse(employee.user.is_active)

    def test_list_supports_filtering_search_ordering_and_pagination_shape(self):
        self.client.post(self.list_url, self._payload(), format='json')
        self.client.post(
            self.list_url,
            self._payload(
                first_name='Jane',
                salary='900.00',
                membership_type='contract',
                work_days=['monday', 'wednesday'],
            ),
            format='json',
        )

        response = self.client.get(
            self.list_url,
            {
                'search': 'Jane',
                'membership_type': 'contract',
                'ordering': '-salary',
                'page': 1,
                'page_size': 10,
            },
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('count', response.data)
        self.assertIn('next', response.data)
        self.assertIn('previous', response.data)
        self.assertIn('results', response.data)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['first_name'], 'Jane')

    def test_employees_permission_required_for_non_superuser_without_permissions(self):
        limited_user = User.objects.create_user(
            username='employee_limited',
            email='employee_limited@example.com',
            password='TestPass123!',
            role_name='staff',
        )
        self.client.force_authenticate(user=limited_user)

        response = self.client.get(self.list_url)
        self.assertIn(response.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])

    def test_delete_employee_fails_when_salary_records_exist(self):
        create_response = self.client.post(self.list_url, self._payload(), format='json')
        employee_id = create_response.data['id']
        employee = Employee.objects.get(id=employee_id)

        Salary.objects.create(
            employee=employee,
            year=2025,
            month=1,
            base_salary=Decimal('500.00'),
            bonus=Decimal('50.00'),
            net_salary=Decimal('550.00'),
            pay_date=date(2025, 1, 31),
        )

        response = self.client.delete(f'{self.list_url}{employee_id}/')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('detail', response.data)
        self.assertTrue(Employee.objects.filter(id=employee_id).exists())


class PartnerAPITestCase(APITestCase):
    def setUp(self):
        self.admin_user = User.objects.create_user(
            username='partner_admin',
            email='partner_admin@example.com',
            password='TestPass123!',
            role_name='admin',
            is_superuser=True,
            is_staff=True,
        )
        self.client.force_authenticate(user=self.admin_user)
        self.list_url = '/api/employees/partners/'

    def _payload(self, **overrides):
        payload = {
            'first_name': 'Ali',
            'father_name': 'Karim',
            'last_name': 'Ahmadi',
            'phone': '0701234567',
            'main_address': 'Kabul',
            'current_address': 'Herat',
            'date_of_birth': '1990-01-01',
            'share_percentage': '30.00',
            'join_date': '2024-01-01',
        }
        payload.update(overrides)
        return payload

    def test_create_partner_success_when_total_below_100(self):
        response = self.client.post(self.list_url, self._payload(), format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Partners.objects.count(), 1)
        self.assertIn('main_address', response.data)
        self.assertIn('date_of_birth', response.data)
        self.assertIn('join_date', response.data)
        self.assertNotIn('mean_address', response.data)
        self.assertNotIn('DOB', response.data)
        self.assertNotIn('Join_date', response.data)

    def test_create_partner_fails_when_total_exceeds_100(self):
        self.client.post(self.list_url, self._payload(share_percentage='90.00'), format='json')
        response = self.client.post(
            self.list_url,
            self._payload(
                first_name='Hassan',
                last_name='Noori',
                phone='0701234568',
                share_percentage='20.00',
            ),
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('share_percentage', response.data)

    def test_create_partner_fails_when_total_is_already_100(self):
        self.client.post(self.list_url, self._payload(share_percentage='60.00'), format='json')
        self.client.post(
            self.list_url,
            self._payload(
                first_name='Bahar',
                father_name='Sami',
                last_name='Rahimi',
                phone='0701234569',
                share_percentage='40.00',
            ),
            format='json',
        )

        response = self.client.post(
            self.list_url,
            self._payload(
                first_name='Farid',
                father_name='Nabi',
                last_name='Latifi',
                phone='0701234570',
                share_percentage='1.00',
            ),
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('share_percentage', response.data)

    def test_delete_partner_is_allowed_even_if_remaining_total_below_100(self):
        create_response = self.client.post(self.list_url, self._payload(), format='json')
        partner_id = create_response.data['id']

        response = self.client.delete(f'{self.list_url}{partner_id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Partners.objects.filter(id=partner_id).exists())

    def test_create_partner_accepts_persian_dates(self):
        response = self.client.post(
            self.list_url,
            self._payload(
                date_of_birth='1369-01-01',
                join_date='1403/01/15',
            ),
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        partner = Partners.objects.get(id=response.data['id'])
        # 1369-01-01 (Jalali) == 1990-03-21 (Gregorian)
        self.assertEqual(str(partner.DOB), '1990-03-21')
        # 1403-01-15 (Jalali) == 2024-04-03 (Gregorian)
        self.assertEqual(str(partner.Join_date), '2024-04-03')

    def test_list_supports_filtering_search_ordering_and_pagination_shape(self):
        self.client.post(self.list_url, self._payload(share_percentage='80.00'), format='json')
        self.client.post(
            self.list_url,
            self._payload(
                first_name='Bahar',
                father_name='Sami',
                last_name='Rahimi',
                phone='0701234569',
                main_address='Kandahar',
                current_address='Kabul',
                share_percentage='20.00',
                join_date='2024-05-01',
            ),
            format='json',
        )

        response = self.client.get(
            self.list_url,
            {
                'search': 'Bahar',
                'join_date_from': '2024-01-01',
                'max_share': '20',
                'ordering': '-share_percentage',
                'page': 1,
                'page_size': 10,
            },
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('count', response.data)
        self.assertIn('next', response.data)
        self.assertIn('previous', response.data)
        self.assertIn('results', response.data)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['first_name'], 'Bahar')

    def test_partners_permission_required_for_non_superuser_without_permissions(self):
        limited_user = User.objects.create_user(
            username='partner_limited',
            email='partner_limited@example.com',
            password='TestPass123!',
            role_name='staff',
        )
        self.client.force_authenticate(user=limited_user)

        response = self.client.get(self.list_url)
        self.assertIn(response.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])
