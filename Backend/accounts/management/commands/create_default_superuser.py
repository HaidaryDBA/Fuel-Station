import os

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db import transaction


class Command(BaseCommand):
    help = "Create or update a default superuser from environment variables."

    def add_arguments(self, parser):
        parser.add_argument("--username", default=os.getenv("DJANGO_SUPERUSER_USERNAME"))
        parser.add_argument("--email", default=os.getenv("DJANGO_SUPERUSER_EMAIL"))
        parser.add_argument("--password", default=os.getenv("DJANGO_SUPERUSER_PASSWORD"))
        parser.add_argument("--role", default=os.getenv("DJANGO_SUPERUSER_ROLE", "admin"))

    @transaction.atomic
    def handle(self, *args, **options):
        username = (options.get("username") or "").strip()
        email = (options.get("email") or "").strip()
        password = options.get("password")
        role_name = (options.get("role") or "admin").strip()

        if not username:
            self.stdout.write(self.style.WARNING("DJANGO_SUPERUSER_USERNAME not set. Skipping."))
            return
        if not password:
            self.stdout.write(self.style.WARNING("DJANGO_SUPERUSER_PASSWORD not set. Skipping."))
            return

        User = get_user_model()
        user = User.objects.filter(username=username).first()

        if user:
            updated = False
            if not user.is_staff:
                user.is_staff = True
                updated = True
            if not user.is_superuser:
                user.is_superuser = True
                updated = True
            if getattr(user, "role_name", None) != role_name:
                user.role_name = role_name
                updated = True
            if email and user.email != email:
                user.email = email
                updated = True
            if updated:
                user.save(update_fields=[
                    "is_staff",
                    "is_superuser",
                    "role_name",
                    "email",
                ])
                self.stdout.write(self.style.SUCCESS("Default superuser updated."))
            else:
                self.stdout.write(self.style.SUCCESS("Default superuser already exists."))
            return

        user = User(
            username=username,
            email=email,
            role_name=role_name,
            is_staff=True,
            is_superuser=True,
            is_active=True,
        )
        user.set_password(password)
        user.save()

        self.stdout.write(self.style.SUCCESS("Default superuser created."))
