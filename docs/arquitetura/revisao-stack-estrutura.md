# Revisão de Estrutura e Stack — Assistente IA

> Gerado em: 2026-06-24  
> Autor: Revisão de Arquiteto de Software Sênior

---

## Diagnóstico da estrutura atual

### Backend

O Django organiza código por **tipo técnico** por padrão — `models.py`, `views.py`, `serializers.py`. Funciona para projetos pequenos. O problema começa quando o projeto cresce: hoje `views.py` tem autenticação, lógica de chat e CRUD de usuário numa fila. O arquivo `services.py` existe e está 100% comentado — a intenção de separar lógica estava lá, mas nunca saiu do papel.

O domínio do produto pede múltiplos módulos (`auth`, `chat`, `condomínios`, `imobiliárias`), mas tudo está dentro de um único app Django chamado `Api`. Quando uma segunda feature chegar, vai competir pelo mesmo `models.py`.

```
❌ Estado atual                    ✅ Proposto
Backend/
├── Api/                          ├── apps/
│   ├── models.py  (tudo)         │   ├── auth/     (registro, login, JWT)
│   ├── views.py   (tudo)         │   ├── chat/     (conversa, mensagem, langflow)
│   ├── serializers.py (tudo)     │   └── modelos/  (ModeloIA)
│   └── services.py (vazio)       ├── core/         (settings, urls raiz)
└── GenAI/                        └── shared/       (permissões, utils)
```

O mais urgente não é partir em múltiplos apps, mas respeitar a camada de serviço dentro do app atual:

```
Api/
├── services/
│   ├── chat_service.py      ← lógica de conversa + persistência
│   └── langflow_service.py  ← integração com a IA
├── views.py   ← só parse HTTP → chama service → retorna Response
├── models.py
└── serializers.py
```

### Frontend

A estrutura `pages/` + `components/` é o padrão iniciante do React. É adequada agora porque só existe uma feature real (chat). O problema aparece quando "Condomínios" e "Imobiliárias" saírem da sidebar e virarem telas reais — aí `pages/` vira uma gaveta sem organização.

```
❌ Estado atual                    ✅ Proposto
src/
├── pages/                        ├── features/
│   ├── Chatgeral.jsx             │   ├── chat/
│   ├── Login.jsx                 │   │   ├── ChatPage.jsx
│   └── Welcome.jsx               │   │   ├── MessageBubble.jsx
├── components/                   │   │   └── useChatHistory.js
│   ├── Button.jsx                │   └── auth/
│   └── Input.jsx                 │       ├── LoginPage.jsx
└── services/                     │       └── useAuth.js
    └── Api.js                    ├── shared/
                                  │   ├── components/ (Button, Input)
                                  │   └── services/Api.js
```

A lógica de `handleSendMessage` em `Chatgeral.jsx:35-95` tem ~60 linhas dentro do componente. Ela pertence a um hook `useChatHistory` — o componente fica responsável só por renderização.

---

## A stack é adequada para o objetivo?

**Sim, com ajustes.** O objetivo é um assistente interno que conecta LLM a bases de conhecimento de produtos. Nenhuma tecnologia escolhida é bloqueante. O problema é a forma como estão sendo usadas, não quais são.

| Camada | Escolha atual | Veredicto | Observação |
|---|---|---|---|
| Backend | Django + DRF | Adequado | Mas pesado para um proxy de IA; FastAPI seria mais leve e async nativo |
| Banco | SQLite → PostgreSQL | Adequado para dev, migrar antes de deploy | |
| AI Orchestration | Langflow | Adequado para MVP | Ponto único de falha; considerar fallback |
| Auth | JWT + django-allauth | Adequado | Limpar o campo `senha` duplicado no model |
| Frontend | React + Vite | Adequado | |
| State | useState local | Insuficiente | Precisa de server state management |
| HTTP Client | axios + fetch misturados | Problema | Unificar no axios com interceptors |

**A maior lacuna de stack não é uma tecnologia faltando — é a ausência de gerenciamento de estado do servidor no frontend.** Toda conversa some ao recarregar, loading/erro são reimplementados em cada componente, e não há cache.

---

## Padrões e bibliotecas recomendadas

### 1. Service Layer no backend (prioridade máxima)

Padrão: **Functional Core / Imperative Shell**. Views lidam com HTTP; services lidam com lógica.

```python
# Api/services/langflow_service.py
def send_message(session_id: str, message: str) -> str:
    response = requests.post(LANGFLOW_URL, json={
        "input_value": message,
        "session_id": session_id,
    }, headers={"x-api-key": settings.LANGFLOW_API_KEY}, timeout=30)
    response.raise_for_status()
    return response.json()["outputs"][0]["outputs"][0]["results"]["message"]["text"]

# Api/services/chat_service.py
def process_message(conversa: Conversa, texto: str) -> Mensagem:
    Mensagem.objects.create(conversa=conversa, remetente="user", texto=texto)
    resposta = langflow_service.send_message(str(conversa.id), texto)
    return Mensagem.objects.create(conversa=conversa, remetente="ai", texto=resposta)

# Api/views.py — view vira 10 linhas
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def chatbot_ia(request):
    conversa = get_object_or_404(Conversa, pk=request.data['conversa_id'],
                                  usuario__user=request.user)
    mensagem = chat_service.process_message(conversa, request.data['message'])
    return Response({"message": mensagem.texto})
```

### 2. `python-decouple` para configuração (prioridade máxima)

Nenhuma secret deve estar no código. Resolve o `SECRET_KEY`, a API key do Langflow e a URL de produção com uma linha.

```bash
pip install python-decouple
```

```python
# settings.py
from decouple import config
SECRET_KEY = config('SECRET_KEY')
LANGFLOW_API_KEY = config('LANGFLOW_API_KEY')
DEBUG = config('DEBUG', default=False, cast=bool)
```

### 3. TanStack Query no frontend (alto impacto)

É a biblioteca padrão do ecossistema React para gerenciar estado de servidor: fetching, caching, loading, erro, refetch automático. Elimina o padrão `useState([]) + setIsLoading + try/catch` repetido em cada componente.

```bash
npm install @tanstack/react-query
```

```jsx
// Antes: 40 linhas de boilerplate por componente
// Depois:
const { data: conversas, isLoading } = useQuery({
  queryKey: ['conversas'],
  queryFn: () => api.get('/Api/conversa/').then(r => r.data),
})
```

### 4. Zustand para auth state (leve, sem boilerplate)

Hoje o token fica no `localStorage` e o nome do usuário é lido diretamente no componente com `localStorage.getItem("user_name")`. Isso espalha a lógica de auth por toda a aplicação.

```bash
npm install zustand
```

```js
// src/shared/stores/authStore.js
const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  login: (token, user) => { localStorage.setItem('token', token); set({ token, user }) },
  logout: () => { localStorage.removeItem('token'); set({ token: null, user: null }) },
}))
```

### 5. `httpx` no backend para chamadas assíncronas (quando migrar para async)

Se Django migrar para views async (o que resolveria o gargalo de threads bloqueadas por IA):

```python
# async views com httpx — não bloqueia o worker
import httpx

async def chatbot_ia(request):
    async with httpx.AsyncClient(timeout=60) as client:
        response = await client.post(LANGFLOW_URL, ...)
```

---

## Resumo de prioridades

```
Agora (sem essas coisas o produto não funciona):
  1. Service Layer — views.py está acumulando responsabilidades
  2. python-decouple — secrets fora do código
  3. Unificar fetch/axios no frontend — instância axios com auth

Próxima sprint (produto funciona, mas escala mal):
  4. TanStack Query — elimina boilerplate de estado servidor
  5. Zustand — centraliza auth state
  6. Feature folders no frontend

Quando validar com usuários reais:
  7. Migrar para PostgreSQL
  8. Async views + httpx para chamadas de IA
  9. Partir Api/ em apps/ por domínio
```

O padrão geral que une tudo isso tem um nome: **Separation of Concerns**. HTTP fica em views, negócio fica em services, dados ficam em models. É o coração do MVC bem aplicado — e é o que falta hoje.
