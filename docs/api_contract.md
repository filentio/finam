# API контракт (Backend ↔ UI) — MVP approve_and_send

## 1. Общие правила
- Base path: `/api/v1`
- Формат: JSON, кодировка UTF-8.
- Авторизация UI→Backend: сессия/токен сервиса (детали вне рамок этого документа).
- Авторизация Backend→HH: **HH OAuth**, логин/пароль HH не используется.
- Термины: **вакансия**, **профиль поиска**, **черновик письма**, **одобрение**, **отклик**.

### 1.1 Статусы отклика
В MVP конечный автомат **отклика**:
- `draft` → `approved` → `queued` → `sent` | `failed`

Примечание:
- Статус `queued` означает “в очереди/в процессе отправки” (UI показывает “отправляется”). Внешний “автосенд” без одобрения запрещён.

### 1.2 Единый формат ошибки
Ответы ошибок (пример):

```json
{
  "error": {
    "code": "DAILY_LIMIT_REACHED",
    "message": "Достигнут дневной лимит откликов.",
    "details": {
      "limit": 20,
      "reset_at": "2026-02-21T00:00:00Z"
    }
  }
}
```

### 1.3 `error_code` (минимум для MVP)
- `AUTH_REQUIRED` — нет сессии/авторизации в нашем сервисе
- `HH_NOT_CONNECTED` — HH OAuth не подключён
- `HH_REAUTH_REQUIRED` — нужна повторная авторизация HH
- `HH_RATE_LIMITED` — HH вернул 429
- `HH_UNAVAILABLE` — HH недоступен/5xx/таймаут (после ретраев)
- `HH_FORBIDDEN` — 403 от HH
- `VACANCY_NOT_APPLICABLE` — на вакансию нельзя отправить отклик через HH API (внешний отклик/ограничение)
- `DUPLICATE_APPLICATION` — отклик на эту вакансию тем же резюме уже существует
- `QUIET_HOURS` — “тихие часы” запрещают отправку
- `DAILY_LIMIT_REACHED` — достигнут лимит откликов
- `VALIDATION_ERROR` — некорректные входные данные
- `INTERNAL_ERROR` — внутренняя ошибка сервиса

## 2. Auth HH (OAuth)

### 2.1 Start OAuth
`GET /auth/hh/start`

Назначение: начать HH OAuth flow.

Ответ:
- `302` redirect на HH OAuth URL  
или
- `200` с URL (если UI сам делает redirect)

Пример (вариант 200):

```json
{
  "auth_url": "https://hh.ru/oauth/authorize?...",
  "state": "opaque"
}
```

### 2.2 Callback OAuth
`GET /auth/hh/callback?code=...&state=...`

Назначение: завершить OAuth, сохранить токены, связать HH аккаунт.

Ответ:
- `302` redirect в UI (например, `/settings/integrations/hh?connected=1`)  
или `200` с объектом статуса интеграции.

### 2.3 Status
`GET /auth/hh/status`

Ответ `200`:

```json
{
  "connected": true,
  "status": "connected",
  "hh_user_id": "12345",
  "scopes": ["..."],
  "token_expires_at": "2026-02-20T20:00:00Z"
}
```

### 2.4 Disconnect
`POST /auth/hh/disconnect`

Поведение:
- удаляет/анонимизирует сохранённые токены;
- помечает HH аккаунт как `disconnected`.

Ответ `200`:

```json
{ "connected": false, "status": "disconnected" }
```

## 3. Search profiles (профили поиска)

### 3.1 List
`GET /search-profiles`

Ответ `200`:

```json
{
  "items": [
    {
      "id": "2a0b7a4a-5c30-4b95-9e4a-1b0e1c2c3c4d",
      "name": "Python backend / Москва",
      "is_active": true,
      "filters": { "text": "Python", "area": "Москва" },
      "stoplist": { "companies": ["123"], "keywords": ["вахта"] },
      "updated_at": "2026-02-20T18:00:00Z"
    }
  ]
}
```

### 3.2 Create
`POST /search-profiles`

Body:

```json
{
  "name": "Python backend / Москва",
  "filters": { "text": "Python", "area": "Москва" },
  "stoplist": { "companies": ["123"], "keywords": ["вахта"] },
  "is_active": true
}
```

Ответ `201`:

```json
{ "id": "uuid", "name": "...", "is_active": true }
```

### 3.3 Update
`PATCH /search-profiles/{id}`

Body (частичный):

```json
{
  "filters": { "text": "Python", "area": "Санкт-Петербург" },
  "stoplist": { "companies": ["123"], "keywords": [] }
}
```

Ответ `200`.

### 3.4 Delete
`DELETE /search-profiles/{id}`

Ответ `204`.

### 3.5 Run (поиск по профилю)
`POST /search-profiles/{id}/run`

Назначение: запустить поиск вакансий (с асинхронной обработкой).

Ответ `202`:

```json
{
  "run_id": "9b2d2d2d-1111-2222-3333-444444444444",
  "status": "queued"
}
```

Примечание:
- В MVP допускается синхронный режим (возврат результатов сразу), но контракт фиксирует `run_id` для расширяемости.

## 4. Vacancies (вакансии)

### 4.1 List вакансий по профилю поиска
`GET /vacancies?search_profile_id={id}&limit=50&cursor=...`

Ответ `200`:

```json
{
  "items": [
    {
      "id": "b7a2...uuid",
      "source": "hh",
      "external_vacancy_id": "999999",
      "title": "Backend Developer (Python)",
      "employer_name": "ООО Рога и Копыта",
      "area_name": "Москва",
      "salary_from": 250000,
      "salary_to": null,
      "published_at": "2026-02-20T10:00:00Z",
      "apply_via_hh": true,
      "external_apply_url": null,
      "score": 0.812,
      "reasons": [
        { "factor": "keywords", "weight": 0.4, "value": 1.0 },
        { "factor": "area", "weight": 0.2, "value": 1.0 }
      ]
    }
  ],
  "next_cursor": null
}
```

### 4.2 Detail
`GET /vacancies/{id}`

Ответ `200`:

```json
{
  "id": "uuid",
  "source": "hh",
  "external_vacancy_id": "999999",
  "hh_url": "https://hh.ru/vacancy/999999",
  "title": "Backend Developer (Python)",
  "employer_id": "123",
  "employer_name": "ООО Рога и Копыта",
  "area_name": "Москва",
  "apply_via_hh": false,
  "external_apply_url": "https://external.example/apply",
  "normalized": {
    "experience": "between1And3",
    "employment": "full",
    "schedule": "remote"
  }
}
```

UI правило:
- если `apply_via_hh=false`, UI показывает ссылку `external_apply_url` и блокирует отправку отклика через сервис.

## 5. Matching (скоринг)

### 5.1 Recompute score для профиля поиска
`POST /search-profiles/{id}/recompute`

Назначение: пересчитать скоринг и причины (после изменения правил/весов).

Ответ `202`:

```json
{ "status": "queued" }
```

## 6. Cover letters (черновики письма)

### 6.1 Generate
`POST /cover-letters/generate`

Body:

```json
{
  "vacancy_id": "uuid",
  "resume_id": "hh_resume_id",
  "template_id": null
}
```

Ответ `201`:

```json
{
  "id": "uuid",
  "status": "draft",
  "text": "Здравствуйте! Меня заинтересовала вакансия ...",
  "version": 1,
  "vacancy_id": "uuid",
  "resume_id": "hh_resume_id"
}
```

Ошибки:
- `409 VACANCY_NOT_APPLICABLE` если вакансия не поддерживает отклик через HH API (в MVP можно всё равно генерировать письмо, но send будет заблокирован — политика должна быть одинаковой в UI; рекомендуется разрешить генерацию, но помечать, что отправка через сервис невозможна).

### 6.2 Get
`GET /cover-letters/{id}`

Ответ `200` (как в generate).

### 6.3 Edit
`PATCH /cover-letters/{id}`

Body:

```json
{ "text": "Обновлённый текст черновика письма..." }
```

Ответ `200`:

```json
{ "id": "uuid", "status": "edited", "text": "...", "version": 2 }
```

## 7. Applications (отклики)

### 7.1 Create draft
`POST /applications`

Body:

```json
{
  "vacancy_id": "uuid",
  "resume_id": "hh_resume_id",
  "cover_letter_id": "uuid"
}
```

Ответ `201`:

```json
{
  "id": "uuid",
  "status": "draft",
  "vacancy_id": "uuid",
  "resume_id": "hh_resume_id",
  "cover_letter_id": "uuid",
  "created_at": "2026-02-20T18:10:00Z"
}
```

Ошибки:
- `409 DUPLICATE_APPLICATION` если уже существует отклик на ту же вакансию тем же резюме.

### 7.2 Approve (одобрение)
`POST /applications/{id}/approve`

Правило:
- переводит `draft` → `approved`;
- фиксирует событие в `audit_log`.

Ответ `200`:

```json
{ "id": "uuid", "status": "approved", "approved_at": "2026-02-20T18:12:00Z" }
```

Ошибки:
- `409` если отклик не в статусе `draft`.

### 7.3 Send (отправка отклика)
`POST /applications/{id}/send`

Headers:
- `Idempotency-Key: <uuid-or-random-string>` (обязательно)

Назначение:
- запускает отправку отклика через HH API;
- доступно **только** для `approved` в режиме **approve_and_send**.

Поведение идемпотентности:
- Ключ идемпотентности уникален в рамках `(user_id, scope='application.send', key)`.
- Если запрос с тем же ключом уже был обработан:
  - возвращаем **тот же** `status_code` и `response` как ранее (response replay).
- Если ключ новый, но попытка отправки приводит к нарушению антидублей (уникальность `(user_id, vacancy_id, resume_id)`), возвращаем `409 DUPLICATE_APPLICATION`.
- Если тот же ключ используется с “другими параметрами” (например, другой application_id) — `409 VALIDATION_ERROR` (конфликт идемпотентности).

Ответы:
- `202` если отправка поставлена в очередь/начата:

```json
{
  "id": "uuid",
  "status": "queued",
  "last_attempt_at": "2026-02-20T18:13:00Z"
}
```

- `200` если отправка завершилась синхронно (допускается, но не обязательна):

```json
{ "id": "uuid", "status": "sent", "sent_at": "2026-02-20T18:13:05Z" }
```

Ошибки:
- `409 QUIET_HOURS` — отправка запрещена тихими часами, статус остаётся `approved`
- `409 DAILY_LIMIT_REACHED` — лимит отправок, статус остаётся `approved`
- `409 VACANCY_NOT_APPLICABLE` — отклик через HH API невозможен
- `409 DUPLICATE_APPLICATION` — дубликат
- `401 HH_REAUTH_REQUIRED` — нужно переподключить HH OAuth

### 7.4 List (история откликов)
`GET /applications?status=sent&limit=50&cursor=...`

Ответ `200`:

```json
{
  "items": [
    {
      "id": "uuid",
      "status": "sent",
      "vacancy_id": "uuid",
      "resume_id": "hh_resume_id",
      "external_application_id": "hh_negotiation_id",
      "approved_at": "2026-02-20T18:12:00Z",
      "sent_at": "2026-02-20T18:13:05Z"
    }
  ],
  "next_cursor": null
}
```

### 7.5 Get
`GET /applications/{id}`

Ответ `200`:

```json
{
  "id": "uuid",
  "status": "failed",
  "vacancy_id": "uuid",
  "resume_id": "hh_resume_id",
  "cover_letter_id": "uuid",
  "error_code": "HH_FORBIDDEN",
  "error_message": "HH отклонил запрос на отправку отклика.",
  "attempt_count": 3
}
```

## 8. Открытые вопросы (минимально)
- Нужен ли публичный API для списка резюме пользователя (`GET /hh/resumes`) или UI получает резюме иными средствами? Для MVP рекомендуется endpoint через backend, т.к. HH OAuth токены не должны попадать в UI.
