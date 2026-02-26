## HH Apply MVP — Web кабинет (UI Stage 1)

Next.js (App Router) UI для MVP: профили поиска → вакансии → письмо → отклик → sync статусов.

### Запуск

1) Установить зависимости:

```bash
cd apps/web
npm install
```

2) Создать `.env.local` из примера:

```bash
cp .env.example .env.local
```

3) Запустить backend API (FastAPI) и UI:

```bash
# backend (в отдельном терминале)
docker compose -f infra/docker-compose.yml up -d --build

# ui
cd apps/web
npm run dev
```

Открыть `http://localhost:3000`.

### Env vars

- **`API_BASE_URL`**: base URL backend API для server-side proxy в Next.js, напр. `http://localhost:8000`
- **`NEXT_PUBLIC_API_BASE_URL`**: legacy/совместимость (можно не трогать, предпочтительнее `API_BASE_URL`)
- **`ADMIN_SYNC_TOKEN`**: токен для admin sync (server-side only)
- **`NEXT_PUBLIC_APP_NAME`**: опциональное имя приложения в UI

### HH connect/disconnect

- Кнопки «Подключить HH / Подключить другой аккаунт» делают `window.location` на backend:
  - `GET /api/v1/auth/hh/start`
  - `GET /api/v1/auth/hh/start?force_login=true`
- Отключение: `POST /api/v1/auth/hh/disconnect`

В single-user режиме дополнительной авторизации в UI нет.

### Почему sync статусов идёт через server route

Backend endpoint `POST /api/v1/admin/sync/negotiations` требует `X-Admin-Token`.
Чтобы **не утекал `ADMIN_SYNC_TOKEN` в client bundle**, UI вызывает Next route handler:

- `POST /api/admin/sync-negotiations` (Next.js)

Route handler добавляет заголовок `X-Admin-Token` на сервере и проксирует запрос на backend.
