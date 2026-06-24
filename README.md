# Assistente IA NextGen

Chatbot interno para suporte aos produtos da Superlógica. Monorepo com duas apps independentes: uma API REST em Python/Django (`Backend/`) e um SPA em React + Vite (`Frontend/`). A lógica de IA é orquestrada via **Langflow** — o Django apenas faz proxy das mensagens para o flow configurado lá.

## Estrutura do repositório

```
assistente-ia-/
├── Backend/
│   ├── GenAI/          # Config do projeto Django (settings, urls, wsgi/asgi)
│   ├── Api/            # Único app Django — toda a lógica de negócio
│   │   ├── models.py
│   │   ├── views.py
│   │   ├── serializers.py
│   │   ├── filters.py
│   │   ├── adapters.py
│   │   └── services.py
│   ├── Fluxos/         # Exports de flows do Langflow (.json)
│   └── requirements.txt
├── Frontend/
│   └── src/
│       ├── App.jsx     # Router principal
│       ├── pages/      # Telas (chat, login, cadastro...)
│       ├── components/
│       └── services/   # Camada Axios (Api.js)
└── docs/arquitetura/   # ADRs e avaliações técnicas
```

## Pré-requisitos

- Python 3.10+
- Node.js 18+
- Uma instância do **Langflow** rodando (local ou remota)

## Setup local

### Backend

```bash
cd Backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt   # ~580 pacotes — demora na primeira vez
python manage.py migrate
python manage.py runserver        # http://127.0.0.1:8000
```

> `requirements.txt` é grande (inclui LangChain, Anthropic SDK, vector DBs, OCR, áudio). Use um virtualenv dedicado.

### Frontend

```bash
cd Frontend
npm install
npm run dev    # http://localhost:5173
npm run build
npm run lint
```

## Variáveis de ambiente

As variáveis abaixo precisam existir no ambiente antes de rodar o backend. **Não há `.env` commitado no repo.**

| Variável | Onde usar | Observação |
|---|---|---|
| `GOOGLE_CLIENT_ID` | `GenAI/settings.py` | OAuth Google |
| `GOOGLE_CLIENT_SECRET` | `GenAI/settings.py` | OAuth Google |
| `LANGFLOW_API_KEY` | `Api/views.py` | Atualmente hardcoded — mover para env antes do deploy |
| `LANGFLOW_FLOW_URL` | `Api/views.py` | URL do flow no Langflow — também hardcoded |

> Prioridade: mover `LANGFLOW_API_KEY` e `LANGFLOW_FLOW_URL` para variáveis de ambiente antes de qualquer deploy.

## API endpoints

Todos os endpoints ficam sob o prefixo `/Api/`.

| Endpoint | Método | Descrição |
|---|---|---|
| `/Api/token/` | POST | Obter par de tokens JWT |
| `/Api/token/refresh/` | POST | Renovar access token |
| `/Api/register/` | POST | Cadastro de usuário |
| `/Api/login/` | POST | Login |
| `/Api/chatbot/` | POST | Enviar mensagem para o Langflow |
| `/Api/usuario/` | GET / POST | CRUD de usuários |
| `/Api/conversa/` | GET / POST | CRUD de conversas |
| `/Api/mensagem/` | GET / POST | CRUD de mensagens (filtrável por `conversa_id`) |
| `/Api/modeloAI/` | GET / POST | CRUD de modelos de IA |

**Auth:** JWT com access token de 60 min e refresh de 1 dia. O Frontend anexa o token automaticamente via interceptor Axios.

## Rotas do Frontend

| Rota | Tela |
|---|---|
| `/` | Welcome |
| `/login` | Login |
| `/cadastro` | Cadastro |
| `/esqueci-senha` | Recuperação de senha |
| `/chat` | Chat principal (fallback) |

## Pontos críticos de integração

**Langflow é obrigatório.** O endpoint `/Api/chatbot/` apenas faz proxy HTTP para o Langflow — se o Langflow estiver fora, o chatbot falha inteiramente. O flow exportado fica em `Backend/Fluxos/`.

**Google OAuth** exige `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET` no ambiente. Sem eles, o login social não funciona mas o restante da API opera normalmente.

**Banco de dados:** SQLite em dev (`db.sqlite3`). Para produção, PostgreSQL é o caminho — não há migration scripts para isso ainda.

## Modelos de dados

| Model | Campos principais |
|---|---|
| `Usuario` | Usuário customizado Django |
| `Conversa` | Agrupamento de mensagens por sessão |
| `Mensagem` | Texto de cada turno do chat, vinculado a `Conversa` |
| `ModeloIA` | Registro dos modelos de IA disponíveis |

## Documentação técnica

ADRs e avaliações de arquitetura ficam em [docs/arquitetura/](docs/arquitetura/).
