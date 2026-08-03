# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NextGen AI assistant — a chatbot for internal support. Monorepo with two independent apps: a Python/Django REST API (`Backend/`) and a React + Vite SPA (`Frontend/`). No workspace manager ties them together.

## Development Commands

### Backend (Django)
```bash
cd Backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver          # http://127.0.0.1:8000
```

### Frontend (React + Vite)
```bash
cd Frontend
npm install
npm run dev                         # http://localhost:5173
npm run build
npm run lint
```

## Architecture

### Backend (`Backend/`)

**Project layout:**
- `GenAI/` — Django project config (settings, urls, wsgi/asgi)
- `Api/` — single Django app with all business logic

**Django app structure (`Api/`):**
- `models.py` — `Usuario`, `Conversa`, `Mensagem`, `ModeloIA`
- `views.py` — REST viewsets + custom endpoints; chatbot view calls Langflow HTTP API
- `serializers.py` — DRF serializers
- `filters.py` — `DjangoFilterBackend` on `Mensagem` (filter by `conversa_id`)
- `adapters.py` — custom `SocialAccountAdapter` for Google OAuth signup flow

**API routes (all under `/Api/`):**
| Endpoint | Method | Purpose |
|---|---|---|
| `/Api/token/` | POST | JWT obtain |
| `/Api/token/refresh/` | POST | JWT refresh |
| `/Api/register/` | POST | User registration |
| `/Api/login/` | POST | Login |
| `/Api/chatbot/` | POST | Send message to Langflow AI |
| `/Api/usuario/` | GET/POST | User CRUD |
| `/Api/conversa/` | GET/POST | Conversation CRUD |
| `/Api/mensagem/` | GET/POST | Message CRUD (filtered by conversa) |
| `/Api/modeloAI/` | GET/POST | AI model CRUD |

**Auth config** (`GenAI/settings.py`): JWT access token 60 min, refresh 1 day. Google OAuth via `django-allauth` + `dj-rest-auth`. CORS allowed from `localhost:5173`.

**AI integration:** The chatbot endpoint proxies messages to a **Langflow** instance via HTTP. The Langflow API key and flow URL are currently hardcoded in `Api/views.py` — move these to environment variables before any deployment.

### Frontend (`Frontend/`)

**Router** (`src/App.jsx`):
- `/` — Welcome
- `/login` — Login
- `/cadastro` — Registration
- `/esqueci-senha` — Password reset
- `/chat` — Main chat UI (fallback route)

**API layer** (`src/services/Api.js`): Axios instance with `baseURL: http://127.0.0.1:8000`. Interceptors attach JWT from `localStorage` on every request and redirect to `/login` on 401.

No global state manager — state lives in `useState` hooks per component.

## Key Integration Points

- **Langflow**: The chatbot backend is a Langflow flow, not pure Django logic. If Langflow is down, `/Api/chatbot/` fails entirely.
- **Google OAuth**: Requires `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in the environment (not in `.env` in the repo).
- **Database**: SQLite (`db.sqlite3`) for dev. Production would need PostgreSQL — no migration scripts for that yet.
- **requirements.txt** is very large (~580 packages, includes LangChain, Anthropic SDK, vector DBs, OCR, audio). Full install takes time; consider a virtualenv per session.
