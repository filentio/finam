# Модель данных MVP (Postgres) — hh.ru

## 1. Соглашения
- Идентификаторы: `uuid` (генерируются сервисом), внешние идентификаторы HH — как `text`/`bigint` в `external_*`.
- Время: `timestamptz` в UTC.
- JSON: `jsonb`.
- Все чувствительные данные (OAuth токены) хранятся **только в зашифрованном виде**.
- Термины: **вакансия**, **профиль поиска**, **черновик письма**, **одобрение**, **отклик**.

## 2. ERD (текстовое представление)

```
users 1 ── 0..1 hh_accounts
users 1 ── * search_profiles
search_profiles 1 ── * matches * ── 1 vacancies
users 1 ── * cover_letters * ── 1 vacancies
users 1 ── * applications * ── 1 vacancies
applications 1 ── 0..1 cover_letters
users 1 ── * audit_log
applications 1 ── * audit_log (по entity_id)
idempotency_keys * ── 1 users
idempotency_keys * ── 1 applications (по entity_id)
```

Примечания:
- `matches` отражает результат матчинг/скоринга вакансии для конкретного профиля поиска (и пользователя-владельца профиля).
- `applications` — доменная сущность **отклик** (статусы, антидубли, внешние id).
- `cover_letters` — **черновик письма** (с возможностью редактирования и версиями/ревизиями).

## 3. Сущности и поля (минимум для MVP)

### 3.1 `users`
Назначение: пользователь сервиса (не HH).

Поля:
- `id uuid pk`
- `email text null` — опционально (если есть собственная регистрация)
- `display_name text null`
- `role text not null default 'user'` — `user` / `admin`
- `created_at timestamptz not null`
- `updated_at timestamptz not null`

Индексы:
- `users(role)` (опционально)

### 3.2 `hh_accounts`
Назначение: связь пользователя с HH OAuth и статусом интеграции.

Поля:
- `id uuid pk`
- `user_id uuid not null fk -> users(id) unique`
- `hh_user_id text null` — если доступен через HH API
- `status text not null` — `connected` / `disconnected` / `reauth_required`
- `access_token_ciphertext bytea not null` — зашифрованный access token
- `refresh_token_ciphertext bytea null` — зашифрованный refresh token (если применимо)
- `token_expires_at timestamptz null`
- `scopes text[] null`
- `connected_at timestamptz null`
- `disconnected_at timestamptz null`
- `last_token_refresh_at timestamptz null`
- `created_at timestamptz not null`
- `updated_at timestamptz not null`

Уникальности/индексы:
- `unique(user_id)`
- `index(hh_user_id)` (если используем для антидублей на уровне hh_user_id)

Политика хранения токенов:
- токены храним только в `*_ciphertext`;
- при логировании маскируем значения, не выводим даже частично;
- ключи шифрования — вне БД (secrets manager/env), с возможностью ротации.

### 3.3 `search_profiles`
Назначение: **профиль поиска** вакансий на hh.ru.

Поля:
- `id uuid pk`
- `user_id uuid not null fk -> users(id)`
- `name text not null`
- `filters_json jsonb not null` — параметры поиска (ключевые слова, локация, опыт, зарплата и т. п.)
- `stoplist_json jsonb not null` — компании/ключевые слова
- `quiet_hours_json jsonb null` — настройки quiet hours (если per-user/per-profile)
- `is_active boolean not null default true`
- `created_at timestamptz not null`
- `updated_at timestamptz not null`

Индексы:
- `index(user_id, is_active)`
- `index(user_id, updated_at desc)`

### 3.4 `vacancies`
Назначение: **вакансия** из источника (в MVP: hh.ru), нормализованная.

Поля:
- `id uuid pk`
- `source text not null` — например `hh`
- `external_vacancy_id text not null` — id вакансии в источнике
- `hh_url text null` — ссылка на вакансию на hh.ru
- `title text not null`
- `employer_id text null`
- `employer_name text null`
- `area_name text null` — город/регион
- `salary_from integer null`
- `salary_to integer null`
- `salary_currency text null`
- `experience text null`
- `employment text null`
- `schedule text null`
- `published_at timestamptz null`
- `apply_via_hh boolean not null default true` — можно ли отправить отклик через HH API
- `external_apply_url text null` — если отклик “внешний”/не через API
- `raw_json jsonb null` — ограниченный raw payload HH (см. политику ниже)
- `raw_fetched_at timestamptz null`
- `created_at timestamptz not null`
- `updated_at timestamptz not null`

Уникальности/индексы:
- `unique(source, external_vacancy_id)` — обязательная уникальность
- `index(source, published_at desc)`
- `index(employer_id)`
- `index(area_name)`
- `index(apply_via_hh)`

Политика `raw_json`:
- хранить только минимально необходимое для трассировки и отображения карточки (без лишних полей);
- не хранить PII и данные, которые не нужны для MVP и/или запрещены ToS;
- хранение ограничивать retention-политикой (например, 30–90 дней) и возможностью полного отключения `raw_json`.

### 3.5 `matches`
Назначение: результат матчинг/скоринга вакансии для профиля поиска.

Поля:
- `id uuid pk`
- `user_id uuid not null fk -> users(id)` — владелец профиля поиска
- `search_profile_id uuid not null fk -> search_profiles(id)`
- `vacancy_id uuid not null fk -> vacancies(id)`
- `score numeric(6,3) not null` — итоговый скор
- `reasons_json jsonb not null` — причины/факторы ранжирования
- `computed_at timestamptz not null`

Уникальности/индексы:
- `unique(search_profile_id, vacancy_id)` — один матч на пару профиля и вакансии
- `index(user_id, computed_at desc)`
- `index(search_profile_id, score desc)`
- `index(vacancy_id)`

### 3.6 `cover_templates`
Назначение: шаблоны генерации сопроводительного (опционально в MVP).

Поля:
- `id uuid pk`
- `name text not null`
- `template_text text not null` — текстовый шаблон/промпт без PII
- `is_default boolean not null default false`
- `created_at timestamptz not null`
- `updated_at timestamptz not null`

Уникальности/индексы:
- `index(is_default)`

### 3.7 `cover_letters`
Назначение: **черновик письма** (генерируемый + редактируемый).

Поля:
- `id uuid pk`
- `user_id uuid not null fk -> users(id)`
- `vacancy_id uuid not null fk -> vacancies(id)`
- `resume_id text not null` — идентификатор резюме в HH (не храним содержимое резюме)
- `template_id uuid null fk -> cover_templates(id)`
- `status text not null` — `draft` / `edited`
- `text text not null` — содержимое черновика письма
- `version integer not null default 1`
- `generated_at timestamptz not null`
- `updated_at timestamptz not null`

Уникальности/индексы:
- `index(user_id, updated_at desc)`
- `index(vacancy_id)`
- (опционально) `unique(user_id, vacancy_id, resume_id, version)`

### 3.8 `applications`
Назначение: **отклик** (approve_and_send) и его конечный автомат.

Поля:
- `id uuid pk`
- `user_id uuid not null fk -> users(id)`
- `vacancy_id uuid not null fk -> vacancies(id)`
- `resume_id text not null` — идентификатор резюме в HH
- `cover_letter_id uuid null fk -> cover_letters(id)` — какой текст отправляли
- `status text not null` — `draft` / `approved` / `queued` / `sent` / `failed`
- `approved_at timestamptz null`
- `sent_at timestamptz null`
- `failed_at timestamptz null`
- `external_application_id text null` — id отклика/negotiation в HH, если возвращается
- `error_code text null` — стабильный код (см. `docs/api_contract.md`)
- `error_message text null` — короткое безопасное описание (без PII)
- `last_attempt_at timestamptz null`
- `attempt_count integer not null default 0`
- `created_at timestamptz not null`
- `updated_at timestamptz not null`

Уникальности/индексы (антидубли и запросы UI):
- `unique(user_id, vacancy_id, resume_id)` — **антидубли** (обязательная)
- `index(user_id, created_at desc)` — история откликов
- `index(user_id, status, updated_at desc)`
- `index(vacancy_id)`
- `index(external_application_id)`

Примечание про “queued”:
- Статус `queued` означает “в очереди/в процессе отправки” и должен блокировать повторную отправку (антидубли) так же, как и `sent`.

### 3.9 `audit_log`
Назначение: неизменяемый аудит доменных действий (без PII и без текста письма).

Поля:
- `id uuid pk`
- `user_id uuid not null fk -> users(id)`
- `entity_type text not null` — `application` / `cover_letter` / `search_profile` / `hh_account`
- `entity_id uuid not null` — id сущности в нашей БД
- `action text not null` — например `created`, `approved`, `send_requested`, `sent`, `failed`, `disconnected`
- `metadata_json jsonb not null default '{}'::jsonb` — технические поля: vacancy_id, resume_id, error_code, request_id (без PII)
- `created_at timestamptz not null`

Индексы:
- `index(user_id, created_at desc)`
- `index(entity_type, entity_id, created_at desc)`
- `index(action, created_at desc)`

### 3.10 `idempotency_keys`
Назначение: идемпотентность критичных POST (в MVP — `applications.send`).

Поля:
- `id uuid pk`
- `user_id uuid not null fk -> users(id)`
- `scope text not null` — например `application.send`
- `key text not null` — значение `Idempotency-Key`
- `entity_id uuid not null` — application_id
- `request_hash text not null` — хэш тела/параметров для защиты от повторов “с другим содержимым”
- `response_json jsonb null` — кэшированный ответ
- `status_code integer null`
- `created_at timestamptz not null`
- `expires_at timestamptz not null`

Уникальности/индексы:
- `unique(user_id, scope, key)`
- `index(entity_id)`
- `index(expires_at)`

## 4. Политика данных (сводно)
- **Токены HH OAuth**: только шифротекст, никаких токенов в логах/аудите.
- **raw_json вакансий**: минимизация, TTL/retention, возможность отключения.
- **Резюме пользователя**: хранить только `resume_id` (идентификатор); содержимое резюме не сохранять в MVP.
- **Сопроводительные письма**: хранить текст черновика письма как доменные данные пользователя; не дублировать текст в `audit_log` и не логировать.

## 5. Открытые вопросы (минимально)
- Нужно ли вводить отдельную сущность `search_runs` для версионирования результатов конкретного запуска профиля поиска?
- Разрешено ли по ToS сохранять часть описания вакансии локально; если нет — хранить только ссылку и извлекать детали по запросу.
