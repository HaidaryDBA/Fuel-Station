from django.db import migrations


PERMISSION_ACTIONS = ['view', 'add', 'change', 'delete', 'all']


def seed_customers_permissions(apps, schema_editor):
    Permission = apps.get_model('core', 'Permission')

    for action in PERMISSION_ACTIONS:
        Permission.objects.get_or_create(
            module='customers',
            action=action,
            defaults={'description': f'{action.title()} permission for customers module'},
        )


def remove_customers_permissions(apps, schema_editor):
    Permission = apps.get_model('core', 'Permission')
    Permission.objects.filter(module='customers', action__in=PERMISSION_ACTIONS).delete()


class Migration(migrations.Migration):
    dependencies = [
        ('core', '0003_remap_legacy_library_permissions'),
        ('customers', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(seed_customers_permissions, remove_customers_permissions),
    ]

