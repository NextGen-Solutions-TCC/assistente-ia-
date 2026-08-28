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

## 3. Backend sem tratamento de erros

**Problema:** A API não tinha nenhum tratamento de erro centralizado. Exceções não previstas (falha de banco, `IntegrityError`, campo nulo, etc.) estouravam como página de erro crua do Django em vez de uma resposta JSON, e não havia nenhum log configurado para registrar o que aconteceu.

**Correção:**
- Criado `Backend/Api/exception_handler.py` com um `custom_exception_handler` que captura qualquer exceção não tratada pelas views/viewsets do DRF, registra no log e devolve uma resposta JSON padronizada (`{"detail": "..."}`) com status 500, em vez da página de erro do Django.
- Registrado esse handler em `REST_FRAMEWORK['EXCEPTION_HANDLER']` e adicionado um bloco `LOGGING` (console) em `Backend/GenAI/settings.py`, que não existia antes.
- Em `Backend/Api/serializers.py`, `RegisterSerializer.validate_password` agora captura `DjangoValidationError` e a converte em `serializers.ValidationError` (antes vazava como erro 500 em vez de 400).
- Em `Backend/Api/serializers.py`, `RegisterSerializer.create` foi envolvido em `transaction.atomic()` com captura de `IntegrityError`, evitando que ficasse um `User` órfão no banco caso a criação do `Usuario` vinculado falhasse.
- Em `Backend/Api/views.py`, `ConversaViewSet.perform_create` agora retorna um erro claro se o perfil do usuário autenticado não for encontrado, em vez de salvar a conversa com `usuario=None`.
- Em `Backend/Api/views.py`, `google_login_redirect` (view fora do DRF, não coberta pelo exception handler acima) ganhou um `try/except`: em caso de falha, registra no log e redireciona para `http://localhost:5173/login?erro=google_login_falhou` em vez de estourar um erro 500 no meio do fluxo OAuth.
