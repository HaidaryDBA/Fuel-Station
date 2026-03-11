from django.conf import settings
from django.test import override_settings
from rest_framework import status
from rest_framework.test import APITestCase

from .models import User


class AuthCookieTests(APITestCase):
    def setUp(self):
        self.password = 'TestPass123!'
        self.user = User.objects.create_user(
            username='auth_user',
            email='auth_user@example.com',
            password=self.password,
            role_name='admin',
            is_staff=True,
        )
        self.login_url = '/api/accounts/auth/login/'
        self.refresh_url = '/api/accounts/token/refresh/'
        self.logout_url = '/api/accounts/auth/logout/'

    @override_settings(AUTH_COOKIE_SECURE=False, AUTH_COOKIE_SAMESITE='Lax')
    def test_login_sets_refresh_cookie_with_development_flags(self):
        response = self.client.post(
            self.login_url,
            {'username': self.user.username, 'password': self.password},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn(settings.AUTH_COOKIE_NAME, response.cookies)

        refresh_cookie = response.cookies[settings.AUTH_COOKIE_NAME]
        self.assertEqual(refresh_cookie['httponly'], True)
        self.assertEqual(refresh_cookie['samesite'], settings.AUTH_COOKIE_SAMESITE)
        self.assertEqual(refresh_cookie['secure'], '')
        self.assertEqual(int(refresh_cookie['max-age']), settings.AUTH_COOKIE_MAX_AGE)

    def test_refresh_endpoint_returns_401_when_cookie_is_missing(self):
        response = self.client.post(self.refresh_url, {}, format='json')

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(response.data['detail'], 'Refresh token not found in cookie.')

    def test_refresh_endpoint_returns_401_for_invalid_refresh_cookie(self):
        self.client.cookies[settings.AUTH_COOKIE_NAME] = 'not-a-valid-token'

        response = self.client.post(self.refresh_url, {}, format='json')

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn('detail', response.data)

    def test_logout_clears_refresh_cookie(self):
        login_response = self.client.post(
            self.login_url,
            {'username': self.user.username, 'password': self.password},
            format='json',
        )
        refresh_cookie_value = login_response.cookies[settings.AUTH_COOKIE_NAME].value

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {login_response.data['access']}")
        self.client.cookies[settings.AUTH_COOKIE_NAME] = refresh_cookie_value

        response = self.client.post(self.logout_url, {}, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn(settings.AUTH_COOKIE_NAME, response.cookies)

        cleared_cookie = response.cookies[settings.AUTH_COOKIE_NAME]
        self.assertEqual(cleared_cookie.value, '')
        self.assertEqual(cleared_cookie['path'], settings.AUTH_COOKIE_PATH)
