from django.apps import AppConfig

class ApiConfig(AppConfig):
    name = 'Api'

    def ready(self):
        import Api.signals  # ativa o signal ao iniciar o Django