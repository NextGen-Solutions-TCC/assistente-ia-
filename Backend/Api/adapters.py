# esse arquivo serve para olhar para o gmail do usuario que não pode ser repetido mas o user pode usar o mesmo nome com um gmail diferente

from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from .models import Usuario

class CustomSocialAccountAdapter(DefaultSocialAccountAdapter):
    def populate_user(self, request, sociallogin, data):
        user = super().populate_user(request, sociallogin, data)
        email = data.get('email', '')
        if email:
            user.username = email.replace('@', '_').replace('.', '_')
        return user

    def save_user(self, request, sociallogin, form=None):
        user = super().save_user(request, sociallogin, form)

        nome = f"{user.first_name} {user.last_name}".strip() or user.email

        Usuario.objects.get_or_create(
            user=user,
            defaults={'nome': nome, 'email': user.email, 'senha': ''}
        )

        return user