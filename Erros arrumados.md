# Erros arrumados

Registro dos erros/problemas encontrados no projeto e como foram corrigidos.

## 1. Não existia usuário admin

**Problema:** Não havia nenhum superusuário criado para acessar o Django Admin.

**Correção:** Criado um novo superusuário:
- Usuário: `Gajura`
- Senha: `123`

## 2. Login com Google não funcionava

**Problema:** O login social via Google (django-allauth / dj-rest-auth) não estava autenticando.

**Correção:**
- No Google Cloud Console, projeto **GenIA**, foram obtidas as credenciais OAuth (Client ID e Client Secret).
- Essas credenciais foram cadastradas em **Social Applications**, dentro da tela do Django Admin.
- Em **Sites**, foi adicionada a rota `http://127.0.0.1:8000/` e associada à Social Application do Google.
- Foi identificado que em `settings.py` a variável `SITE_ID` estava configurada como `1`, mas o Site criado/usado no admin correspondia ao `id 2`. Corrigido `SITE_ID` para `2` em `Backend/GenAI/settings.py`, o que resolveu o login com Google.
