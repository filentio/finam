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
- **numbers allowlist**: любые числа/проценты/суммы/«X лет» разрешены только если они есть в `candidate_profile.facts_numbers_json`
- проверка длины письма
- проверка запрещённых фраз

Ошибки валидации (минимум):
- `UNVERIFIED_NUMBER`
- `LENGTH_OUT_OF_RANGE`
- `FORBIDDEN_PHRASE`

### Генерация
Endpoint:
- `POST /api/v1/vacancies/{vacancy_id}/cover-letter/generate`

Важно: требует `candidate_profile`, иначе вернёт `409 CANDIDATE_PROFILE_REQUIRED`.

