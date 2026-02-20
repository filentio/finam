# HH MVP API (Stage 3 scaffold)

## Быстрый старт (Docker Compose)
Из корня репозитория:

```bash
make up
make migrate
```

API будет доступен на `http://localhost:8000`.

Полезные ручки:
- `GET /health`
- `GET /metrics`
- Swagger: `GET /docs`

Остановка:

```bash
make down
```

## Миграции
Применить миграции в docker окружении:

```bash
make migrate
```

## Тесты (smoke)
Запуск тестов в docker окружении:

```bash
make test
```

Локально (если установлен Python 3.12+):

```bash
pip install -r apps/api/requirements.txt -r apps/api/requirements-dev.txt
pytest -q apps/api/tests
```

## Переменные окружения
Пример: `infra/.env.example`.

Ключевые:
- `DATABASE_URL`
- `REDIS_URL`
- `APP_ENV`
- `LOG_LEVEL`

Плейсхолдеры HH OAuth (на этапе 3 не используются):
- `HH_CLIENT_ID`, `HH_CLIENT_SECRET`, `HH_REDIRECT_URI`

