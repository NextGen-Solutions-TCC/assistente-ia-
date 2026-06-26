# Avaliação de Arquitetura — Assistente IA

> Gerado em: 2026-06-24  
> Autor: Revisão de Arquiteto de Software Sênior

---

## Severidade crítica — quebra funcional hoje

### 1. A integração com IA está morta

`Backend/Api/views.py:47-64` — a função `chatbot_ia` é declarada duas vezes no mesmo arquivo. Python usa a segunda definição, que é um stub hardcoded retornando `"TESTE GABRIELA"`. O bloco de chamada ao Langflow (linha 66+) é código morto — nunca executa.

```python
@api_view(['POST'])         # ← definição 1 (começa aqui)
def chatbot_ia(request):
    pergunta = request.data.get("message")

    @api_view(['POST'])     # ← definição 2 está DENTRO da 1, sobrescreve
    def chatbot_ia(request):
        return Response({"message": "TESTE GABRIELA"})  # isso que roda
```

### 2. Histórico de chat não persiste

O frontend acumula mensagens em `useState` (`Frontend/src/pages/Chatgeral.jsx:18`). Nunca chama `/Api/conversa/` nem `/Api/mensagem/`. Os modelos `Conversa` e `Mensagem` existem no banco, mas nenhum código os escreve. O histórico some ao recarregar a página.

### 3. Cada mensagem quebra o contexto da conversa

Quando a chamada ao Langflow for reativada, `views.py:72` gera um `uuid4` novo para `session_id` a cada request. O Langflow usa esse ID para manter contexto de conversa — com ID novo toda vez, cada mensagem é tratada como início de conversa nova, sem memória do que foi dito antes.

---

## Severidade alta — risco real em produção

### 4. Dupla identidade de usuário no modelo

`Backend/Api/models.py:4-15` — `Usuario` tem `email`, `senha` (CharField!) e `OneToOneField(User)`. O `User` nativo do Django já tem email e senha hasheada. O campo `senha = models.CharField(max_length=123)` sugere armazenamento de senha em texto claro em paralelo ao sistema de auth.

### 5. Segurança: três bombas em settings.py

`Backend/GenAI/settings.py`:
- `CORS_ALLOW_ALL_ORIGINS = True` + `CORS_ALLOW_CREDENTIALS = True` simultaneamente — qualquer site pode fazer requests autenticados em nome do usuário (CSRF via CORS).
- `SECRET_KEY` hardcoded e commitado no repo.
- `DEBUG = True` em settings de produção expõe stack traces completas.

### 6. API key do Langflow exposta no git

`views.py:75`: `"x-api-key": "sk-vmwp8p77g12wMVMEXtJD37AUrVPoSHIyGEsRC-FfJl0"` está commitada no histórico. Mesmo que seja rotacionada, o hash está permanente no git log.

### 7. Frontend bypassa a camada de autenticação

`Chatgeral.jsx:56` chama `fetch()` hardcoded direto — não usa o `api` axios do `src/services/Api.js` que tem o interceptor de JWT. Resultado: a chamada ao chatbot não envia token de autenticação, e é por isso que o backend precisa de `@permission_classes([AllowAny])`.

---

## Escalabilidade — limite claro

### 8. SQLite é single-writer

Qualquer dois usuários enviando mensagem ao mesmo tempo geram lock contention. SQLite não é viável para multi-usuário concorrente. Sem path de migração para PostgreSQL definido.

### 9. Chamadas síncronas de IA bloqueiam workers Django

Django WSGI tem pool fixo de threads. Um request ao Langflow pode levar 10-30s. Com poucos usuários simultâneos, todos os workers ficam presos esperando resposta da IA. A solução correta é processar via fila (Celery + Redis) e retornar status assíncrono, ou usar Django ASGI com `async` views.

O `timeout: 10000` no axios (`Api.js:5`) vai matar a conexão antes de respostas de IA mais longas chegarem.

### 10. Sem paginação em nenhum endpoint

`Mensagem.objects.all()` sem `.order_by()` + sem `PageNumberPagination` = a primeira query com histórico longo retorna tudo de uma vez.

---

## Dívida técnica acumulada

| Item | Risco |
|---|---|
| ~580 dependências no requirements.txt | Superfície de ataque enorme, build lento, conflitos latentes |
| `print()` e `console.log()` no fluxo principal | Vaza dados de usuário nos logs |
| `key={index}` nas mensagens do chat | Rerenders incorretos ao editar lista |
| Endpoint `teste` exposto sem auth | Surface de debug em produção |
| `ACCOUNT_EMAIL_VERIFICATION = 'none'` | Qualquer email é aceito sem confirmação |

---

## Prioridade de ataque

```
1. Corrigir o bug do chatbot_ia (dupla definição) — funcionalidade core está quebrada
2. Conectar o frontend ao serviço de mensagens — persistir conversa no banco
3. Fixar session_id do Langflow — manter contexto por conversa
4. Mover secrets para variáveis de ambiente + revogar a API key exposta
5. Trocar CORS_ALLOW_ALL_ORIGINS por allowlist + remover CORS_ALLOW_CREDENTIALS
6. Adicionar async/fila para chamadas de IA
7. Migrar para PostgreSQL antes de qualquer deploy real
```

O núcleo funcional do produto (chat persistente com contexto) não existe ainda — está bloqueado pelos itens 1, 2 e 3 simultaneamente.
