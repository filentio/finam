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

## HH OAuth (Stage 4)
Настройте переменные:
- `HH_CLIENT_ID`
- `HH_CLIENT_SECRET`
- `HH_REDIRECT_URI` (предпочтительно) или `PUBLIC_BASE_URL`
- (опционально) `HH_OAUTH_AUTHORIZE_URL`, `HH_OAUTH_TOKEN_URL`

### Как пройти флоу локально
1) Откройте в браузере:
- `GET /api/v1/auth/hh/start` — старт авторизации
- `GET /api/v1/auth/hh/start?force_login=true` — “войти под другим пользователем” (HH параметр `force_login=true`)

2) После успешного логина HH сделает redirect на `HH_REDIRECT_URI`, например:
- `GET /api/v1/auth/hh/callback?code=...&state=...`

3) Проверить состояние:
- `GET /api/v1/auth/hh/status`

4) Отключить HH аккаунт:
- `POST /api/v1/auth/hh/disconnect`

## Поиск вакансий HH (Stage 5)
MVP ingestion запускается на ручке профиля поиска:
- `POST /api/v1/search-profiles/{id}/run`

Поведение (Stage 5):
- делает запрос к HH API `/vacancies` по параметрам из `search_profiles.filters_json`;
- нормализует и делает upsert в таблицу `vacancies` (уникальность по `(source='hh', external_vacancy_id)`);
- создаёт/обновляет связи в `matches` для этого профиля поиска.

Пример:

```bash
curl -X POST "http://localhost:8000/api/v1/search-profiles/<PROFILE_UUID>/run"
curl "http://localhost:8000/api/v1/vacancies?search_profile_id=<PROFILE_UUID>"
```

## Matcher/Ranker (Stage 6)
После `run` профиля поиска сервис вычисляет **score (0..100)** и сохраняет объяснимые **reasons** в `matches`.

Короткие правила MVP:
- стоп-лист компаний/ключевых слов → `is_blocked=true`, `score=0` (в выдачу не попадают)
- ключевые слова/skills из `filters.keywords` (или из `filters.text`) повышают score при совпадениях в title/snippet
- `salary_min` даёт бонус/штраф
- `experience` и `area_name` дают небольшой бонус/штраф при совпадении/расхождении

### Пересчёт score вручную для вакансии
`POST /api/v1/vacancies/{vacancy_id}/match` с body:

```json
{ "search_profile_id": "<PROFILE_UUID>" }
```

### Выдача вакансий по профилю
По умолчанию сортируется по score:
- `GET /api/v1/vacancies?search_profile_id=<PROFILE_UUID>&sort=score`

Чтобы вернуть reasons:
- `GET /api/v1/vacancies?search_profile_id=<PROFILE_UUID>&include_reasons=true`

## Генерация сопроводительных писем через GPT (Stage 7)
Генерация выполняется **на сервере** через OpenAI **Responses API** и возвращает **строго структурированный JSON** (Structured Outputs).

### Настройка
Переменные окружения:
- `OPENAI_API_KEY`
- `OPENAI_MODEL` (например `gpt-5.2`)
- `OPENAI_TIMEOUT_SECONDS`
- `COVER_LETTER_MIN_CHARS`, `COVER_LETTER_MAX_CHARS`
- `COVER_LETTER_FORBIDDEN_PHRASES` (опционально, JSON list)

### Guardrails (обязательные)
- **facts-only**: модель не должна выдумывать факты о кандидате
- **numbers allowlist**: любые числа/проценты/суммы/«X лет» разрешены только если они есть в `resumes.numbers_allowlist_json` (импортированное резюме, Stage R1)
- проверка длины письма
- проверка запрещённых фраз

Ошибки валидации (минимум):
- `UNVERIFIED_NUMBER`
- `LENGTH_OUT_OF_RANGE`
- `FORBIDDEN_PHRASE`

### Генерация
Endpoint:
- `POST /api/v1/vacancies/{vacancy_id}/cover-letter/generate`

Важно: требует импортированное резюме (`/api/v1/resume`), иначе вернёт `409 RESUME_REQUIRED`.

### Получить последнее письмо по вакансии (для UI)
- `GET /api/v1/vacancies/{vacancy_id}/cover-letter` (последнее по `created_at desc`)

## Отправка отклика в HH (Stage 8)
Отправка выполняется **только после одобрения** и **через HH OAuth**.

### Полный flow (MVP)
1) Подключить HH OAuth:
- `GET /api/v1/auth/hh/start` → пройти OAuth → callback
- проверить: `GET /api/v1/auth/hh/status`

2) Запустить поиск вакансий:
- создать профиль поиска: `POST /api/v1/search-profiles`
- запустить: `POST /api/v1/search-profiles/{id}/run`
- посмотреть выдачу: `GET /api/v1/vacancies?search_profile_id={id}`

3) Подготовить письмо:
- создать `candidate_profile` (на этапе 8 endpoint не добавлен; можно создавать напрямую в БД)
- сгенерировать письмо: `POST /api/v1/vacancies/{vacancy_id}/cover-letter/generate`

4) Создать отклик и отправить:
- `POST /api/v1/applications` (указать `cover_letter_id`)
- `POST /api/v1/applications/{id}/approve`
- `POST /api/v1/applications/{id}/send` (header `Idempotency-Key`)

Статусы:
- `approved` → `queued` → `sent` | `failed`

### Ошибки send (основные `error_code`)
- `HH_NOT_CONNECTED` — нет активного HH OAuth
- `COVER_LETTER_REQUIRED` — нет черновика письма
- `COVER_LETTER_INVALID` — письмо не прошло валидацию
- `HH_DIRECT_VACANCY` — нельзя отправить отклик через HH API
- `RATE_LIMIT_LOCAL` — превышен локальный лимит отправки
- `HH_UNAUTHORIZED` — 401 от HH, требуется re-auth
- `HH_FORBIDDEN` — 403 от HH
- `HH_RATE_LIMITED` — 429 от HH
- `HH_UNAVAILABLE` — временная недоступность HH

## Синхронизация статусов откликов из HH (Stage 9)
После отправки отклика `application.hh_negotiation_id` (в БД: `external_application_id`) используется для polling синхронизации статуса переговоров через `GET /negotiations/{id}`.

### Как запускать синк (cron-friendly)
1) Установить переменную окружения:
- `ADMIN_SYNC_TOKEN`

2) Дёргать endpoint (из cron/CI/любого scheduler):

```bash
curl -X POST "http://localhost:8000/api/v1/admin/sync/negotiations" \
  -H "X-Admin-Token: $ADMIN_SYNC_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "mode": "by_ids" }'
```

Опционально, для конкретного пользователя:

```bash
curl -X POST "http://localhost:8000/api/v1/admin/sync/negotiations" \
  -H "X-Admin-Token: $ADMIN_SYNC_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "user_id": "00000000-0000-0000-0000-000000000001", "mode": "by_ids" }'
```

### Какие поля обновляются в applications
- `response_status` — нормализованный статус (см. ниже)
- `response_updated_at` — время обновления переговоров по HH
- `response_payload_json` — минимальный sanitized payload (без PII)
- `last_synced_at` — время последнего синка
- `sync_error_code/sync_error_text` — ошибка синка (если была)

### Маппинг HH state.id → response_status (MVP)
- **invited**: `phone_interview`, `interview`, `assessment`, `offer`
- **rejected**: `discard`, `discard_by_employer`, `rejected`, `rejected_by_employer`
- **closed**: `hired`, `closed`
- **pending/viewed**: `response`, `consider`, `active` (если `viewed_by_opponent=true` → `viewed`, иначе `pending`)
- **unknown**: любое другое значение (сохраняем сырое значение в payload)

### Что делать при reauth_required
Если HH вернул 401 во время синка, аккаунт помечается как `hh_accounts.status=reauth_required`.
Действие: пользователь должен переподключить HH OAuth (Stage 4).

### Метрики (Prometheus)
Экспортируются в `/metrics`:
- `hh_sync_runs_total{status="success|failed"}`
- `hh_sync_updated_total`
- `hh_sync_errors_total{code="..."}`
- `hh_sync_duration_seconds`
- `hh_unauthorized_accounts_total`

