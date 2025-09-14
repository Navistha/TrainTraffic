from django.apps import AppConfig


class DecisionEngineConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'decision_engine'
    verbose_name = 'AI Decision Engine'
    
    def ready(self):
        # Import signals if any
        pass