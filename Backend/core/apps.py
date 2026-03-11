from django.apps import AppConfig


class CoreConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'core'
    verbose_name = 'Core System'
    
    def ready(self):
        """
        Import signal handlers when the app is ready
        """
        try:
            import core.signals
        except ImportError:
            pass