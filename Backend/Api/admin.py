from django.contrib import admin
from .models import Usuario, ModeloIA, Conversa, Mensagem

admin.site.register(Usuario)
admin.site.register(ModeloIA)
admin.site.register(Conversa)
admin.site.register(Mensagem)

# Register your models here.
