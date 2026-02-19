## Onboarding navigation map (каркас) — docs/05_navigation_map.md

### ЖЁСТКИЕ ТРЕБОВАНИЯ
- В этом документе отсутствует вариативность формулировок.
- Альтернативные пути запрещены.
- Порядок этапов фиксирован.
- Пропуск анкет запрещён.
- Любые UX‑решения “на усмотрение” запрещены.

---

## 1) Экранные идентификаторы (ScreenID) — полный список

| Порядок | ScreenID | Назначение | Этап | Тип |
|---:|---|---|---|---|
| 01 | `SCR_ENTRY` | Вход | 1 | entry |
| 02 | `QZ1_EXPERIENCE_GOALS` | Анкета №1 (5 вопросов) | 2 | quiz |
| 03 | `CL_COMMON_LESSONS` | Общие уроки (контейнер, 1 экран = 1 lesson внутри блока) | 3 | common_lesson |
| 04 | `QZ2_INVEST_PROFILE` | Анкета №2 (3–4 вопроса) | 4 | quiz |
| 05 | `BR_BRANCH_LESSONS` | Ветка обучения (контейнер, 1 урок = 1 экран внутри ветки) | 5 | branch_lesson |
| 06 | `SCR_FINAL` | Финальный экран | 6 | final |

Все ScreenID уникальны.

---

## 2) Таблица переходов (from → to)

Таблица является источником истины. Переход, не описанный в таблице, запрещён.

| ID | From | To | Условие | Тип |
|---|---|---|---|---|
| T001 | `SCR_ENTRY` | `QZ1_EXPERIENCE_GOALS` | NEXT | linear |
| T002 | `QZ1_EXPERIENCE_GOALS` | `CL_COMMON_LESSONS` | SUBMIT_VALID | submit |
| T003 | `CL_COMMON_LESSONS` | `QZ2_INVEST_PROFILE` | SUBMIT_VALID | submit |
| T004 | `QZ2_INVEST_PROFILE` | `BR_BRANCH_LESSONS` | BRANCH_RESOLVED | branch |
| T005 | `BR_BRANCH_LESSONS` | `SCR_FINAL` | SUBMIT_VALID | submit |

`BR_BRANCH_LESSONS` отображает контент ветки, выбранной детерминированно на основе (segment + strategy) через `branchId`.

---

## 3) Таблица ветвления (segment + strategy → branchId)

### 3.1 Segment (результат анкеты №1)
#### 3.1.1 Quiz1 data model (сохранение в state)
`quiz1.answers` хранится в `OnboardingState` и персистится в LocalStorage через общий прогресс.

Формат (все поля обязательны для completion, но могут быть `null` в процессе заполнения):
- `q1QualifiedStatus`: `QZ1_Q1_YES | QZ1_Q1_NO | null`
- `q2Experience`: `QZ1_Q2_NO_EXPERIENCE | QZ1_Q2_LT_1Y | QZ1_Q2_1_3Y | QZ1_Q2_3_5Y | QZ1_Q2_GT_5Y | null`
- `q3PlannedAmount`: `QZ1_Q3_LT_300K | QZ1_Q3_300K_2M | QZ1_Q3_2_5M | QZ1_Q3_GT_5M | null`
- `q4MainGoal`: `QZ1_Q4_PURCHASE | QZ1_Q4_PASSIVE_INCOME | QZ1_Q4_GROWTH | QZ1_Q4_PRESERVE | null`
- `q5PrimaryInterest`: `QZ1_Q5_FUNDS | QZ1_Q5_STOCKS | QZ1_Q5_TRUST | QZ1_Q5_BONDS | QZ1_Q5_IPO | QZ1_Q5_CURRENCY | QZ1_Q5_STRUCTURED | QZ1_Q5_DERIVATIVES | null`

#### 3.1.2 Segment enum
`Segment` (строгое перечисление): `NOVICE | LEARNER | EXPERIENCED | QUALIFIED`

#### 3.1.3 Правила сегментации (детерминированно)
Правила вынесены в `07_quiz1_rules.ts` (`QUIZ1_SEGMENT_RULES`) и применяются функцией `computeSegment(quiz1Answers) -> Segment`.

Алгоритм:
- Если `q1QualifiedStatus = QZ1_Q1_YES` → `QUALIFIED`
- Иначе (строго `q1QualifiedStatus = QZ1_Q1_NO`) по `q2Experience`:
  - `QZ1_Q2_NO_EXPERIENCE` или `QZ1_Q2_LT_1Y` → `NOVICE`
  - `QZ1_Q2_1_3Y` → `LEARNER`
  - `QZ1_Q2_3_5Y` или `QZ1_Q2_GT_5Y` → `EXPERIENCED`

### 3.2 Strategy (результат анкеты №2)
#### 3.2.1 Quiz2 data model (сохранение в state)
`quiz2.answers` хранится в `OnboardingState` и персистится в LocalStorage через общий прогресс.

Формат (все поля обязательны для completion, но могут быть `null` в процессе заполнения):
- `q1Horizon`: `QZ2_Q1_LT_1Y | QZ2_Q1_1_3Y | QZ2_Q1_3_5Y | QZ2_Q1_GT_5Y | null`
- `q2DrawdownReaction`: `QZ2_Q2_SELL | QZ2_Q2_WAIT | QZ2_Q2_BUY_MORE | null`
- `q3MonthlyShare`: `QZ2_Q3_LT_5 | QZ2_Q3_5_15 | QZ2_Q3_GT_15 | null`
- `q4Preference`: `QZ2_Q4_PRESERVE | QZ2_Q4_BALANCE | QZ2_Q4_GROWTH | null`

Доп. поля защиты от рассинхронизации:
- `quiz2.segmentSnapshot`: `Segment | null`
- `quiz2.quiz1Hash`: string | null (детерминированный hash от `quiz1Answers + segment`)
- `quiz2.prefillAppliedFromQuiz1Hash`: string | null (чтобы не применять prefill повторно)

#### 3.2.2 Prefill из Quiz1 (строго)
Источник истины: `14_quiz2_prefill.ts` (`prefillQuiz2AnswersFromQuiz1`).

Prefill применяется детерминированно и **не завершает** Quiz2 автоматически.

Предзаполняемые поля:
- `q1Horizon` (по `quiz1.q4MainGoal`):
  - `QZ1_Q4_PURCHASE` → `QZ2_Q1_1_3Y`
  - `QZ1_Q4_PASSIVE_INCOME` → `QZ2_Q1_GT_5Y`
  - `QZ1_Q4_GROWTH` → `QZ2_Q1_3_5Y`
  - `QZ1_Q4_PRESERVE` → `QZ2_Q1_GT_5Y`
- `q4Preference` (по `quiz1.q1QualifiedStatus` и `quiz1.q2Experience`):
  - если `QZ1_Q1_YES` → `QZ2_Q4_GROWTH`
  - если `QZ1_Q1_NO`:
    - `QZ1_Q2_NO_EXPERIENCE` или `QZ1_Q2_LT_1Y` → `QZ2_Q4_PRESERVE`
    - `QZ1_Q2_1_3Y` → `QZ2_Q4_BALANCE`
    - `QZ1_Q2_3_5Y` или `QZ1_Q2_GT_5Y` → `QZ2_Q4_GROWTH`

Правило редактирования предзаполненных значений:
- Предзаполненные значения **разрешено изменять** пользователю (не read-only). Это фиксировано в `14_quiz2_prefill.ts` (`QUIZ2_PREFILL_EDITABILITY`).

#### 3.2.3 Strategy enum
`Strategy` (строгое перечисление): `conservative | balanced | aggressive`

#### 3.2.4 Правила стратегии (детерминированно)
Источник истины: `15_quiz2_rules.ts` (`QUIZ2_STRATEGY_RULES`, `computeStrategy(...)`).

Счёт:
- Базовый score = сумма баллов по 4 ответам Quiz2 (каждый 0..2) → диапазон 0..8.
- Затем применяется корректировка:
  - `+ bySegment[segment]`, где:
    - `NOVICE: -1`, `LEARNER: 0`, `EXPERIENCED: 0`, `QUALIFIED: +1`
  - `+ byPlannedAmount[quiz1.q3PlannedAmount]`, где:
    - `QZ1_Q3_LT_300K: 0`, `QZ1_Q3_300K_2M: 0`, `QZ1_Q3_2_5M: +1`, `QZ1_Q3_GT_5M: +1`
- Итоговый score clamp в 0..8.

Пороговые значения:
- 0–2 → `conservative`
- 3–5 → `balanced`
- 6–8 → `aggressive`

### 3.3 Mapping (полное покрытие комбинаций)

| segment \\ strategy | conservative | balanced | aggressive |
|---|---|---|---|
| NOVICE | BR_BEGINNER | BR_BEGINNER | BR_BEGINNER |
| LEARNER | BR_INTERMEDIATE | BR_INTERMEDIATE | BR_INTERMEDIATE |
| EXPERIENCED | BR_INTERMEDIATE | BR_INTERMEDIATE | BR_ADVANCED |
| QUALIFIED | BR_ADVANCED | BR_ADVANCED | BR_ADVANCED |

Для каждой комбинации существует ровно один branchId.

---

## 3.4 Common Lessons (этап 3) — lessonIds по сегментам (строго)

Источник истины:
- Реестр уроков: `10_common_lessons_config.ts` (`LESSON_REGISTRY`)
- Mapping сегмент → порядок уроков: `10_common_lessons_config.ts` (`COMMON_LESSONS_BY_SEGMENT`)

### 3.4.1 LessonId — полный список
- `CL_INTRO_ACCOUNTS`
- `CL_ORDER_TYPES`
- `CL_RISK_RETURN`
- `CL_DIVERSIFICATION`
- `CL_FEES_TAXES`
- `CL_REBALANCING`
- `CL_DISCIPLINE_PLAN`
- `CL_ADVANCED_PRODUCTS`

### 3.4.2 Mapping: Segment → LessonId[] (порядок фиксирован)
- `NOVICE`:
  - `CL_INTRO_ACCOUNTS`
  - `CL_ORDER_TYPES`
  - `CL_RISK_RETURN`
  - `CL_DIVERSIFICATION`
  - `CL_FEES_TAXES`
  - `CL_DISCIPLINE_PLAN`
- `LEARNER`:
  - `CL_ORDER_TYPES`
  - `CL_RISK_RETURN`
  - `CL_DIVERSIFICATION`
  - `CL_FEES_TAXES`
  - `CL_REBALANCING`
- `EXPERIENCED`:
  - `CL_RISK_RETURN`
  - `CL_DIVERSIFICATION`
  - `CL_REBALANCING`
  - `CL_FEES_TAXES`
  - `CL_DISCIPLINE_PLAN`
- `QUALIFIED`:
  - `CL_ADVANCED_PRODUCTS`
  - `CL_REBALANCING`
  - `CL_FEES_TAXES`

### 3.4.3 Правила показа (строго)
- Экран `CL_COMMON_LESSONS` является контейнером.
- Внутри контейнера действует правило: **один урок = один экран** (переключение уроков по `commonLessons.currentIndex`).
- Переход вперёд/назад внутри блока возможен только на `index ± 1`.
- Прыжки на произвольный `lessonId/index` запрещены.

### 3.4.4 Completion (строго)
Common Lessons считаются завершёнными только если:
- пользователь находится на последнем уроке (index = last)
- и нажимает кнопку `Завершить`

После completion:
- `commonLessons.isCompleted=true`
- `commonLessons.segment=quiz1.segment`
- выполняется переход на `QZ2_INVEST_PROFILE`

---

## 3.5 Branch routing + Branch Lessons (этап 5) — строго

### 3.5.1 Branch routing (segment + strategy → branchId)
Источник истины: `17_branch_config.ts` (`BRANCH_BY_SEGMENT_STRATEGY`) и `18_branch_rules.ts` (`resolveBranchId`).

| segment \\ strategy | conservative | balanced | aggressive |
|---|---|---|---|
| NOVICE | BR_BEGINNER | BR_BEGINNER | BR_BEGINNER |
| LEARNER | BR_INTERMEDIATE | BR_INTERMEDIATE | BR_INTERMEDIATE |
| EXPERIENCED | BR_INTERMEDIATE | BR_INTERMEDIATE | BR_ADVANCED |
| QUALIFIED | BR_ADVANCED | BR_ADVANCED | BR_ADVANCED |

### 3.5.2 Branch lesson registry (без placeholder)
Источник истины: `17_branch_config.ts` (`LESSON_REGISTRY`).

`LessonId` (строгое перечисление): соответствует ScreenID слайдов `s02a_start_intro ... s31_cta`.

Каждый `Lesson` содержит:
- `lessonId`
- `title` (строго)
- `body` (строго)
- `assets[]` (из `assets/images/<screenId>.png`)

### 3.5.3 Branch lessons list (branchId → LessonId[]; порядок фиксирован)
Источник истины: `17_branch_config.ts` (`BRANCH_LESSONS`).

- `BR_BEGINNER` (11 уроков):
  - s02a_start_intro, s02_reality, s03_goals, s04_concepts, s05_deposit, s06_first_buy, s06a_purchase_steps, s07_rules_updated, s08_instruments_updated, s09_choice_updated, s10_courses
- `BR_INTERMEDIATE` (12 уроков):
  - s11_portfolio_intro, s12_principles, s13_structure, s14_balance, s14a_portfolio_cta, s15_risks_intro, s16_risk_types, s17_protection, s18_reliable, s19_bonds, s20_capital_protection, s20a_risks_cta
- `BR_ADVANCED` (13 уроков):
  - s21_tariff_intro, s22_tariff_long, s23_tariff_strateg, s24_tariff_investor, s25_trust_management, s25a_tariff_cta, s26_diversification_intro, s27_what_is_div, s28_asset_allocation, s29_why_works, s30_example, s30a_diversification_cta, s31_cta

### 3.5.4 UI контейнера ветки (строго)
Экран `BR_BRANCH_LESSONS` — контейнер, внутри:
- показывается один `LessonId` по `branch.currentIndex`
- Next → `currentIndex + 1`
- Back → `currentIndex - 1`
- Finish (`Завершить`) доступен только на последнем уроке

Completion ветки:
- только при нажатии `Завершить` на последнем уроке
- после completion: переход на `SCR_FINAL`

---

## 4) Back navigation (строго)

Back запрещён, если:
- processStatus = COMPLETED
- для текущего экрана backTarget = null

Back target:
- `SCR_ENTRY` → null
- `QZ1_EXPERIENCE_GOALS` → `SCR_ENTRY`
- `CL_COMMON_LESSONS` → `QZ1_EXPERIENCE_GOALS`
- `QZ2_INVEST_PROFILE` → `CL_COMMON_LESSONS`
- `BR_BRANCH_LESSONS` → `QZ2_INVEST_PROFILE`
- `SCR_FINAL` → null

---

## 5) State machine

### 5.1 Process status
- NOT_STARTED
- IN_PROGRESS
- COMPLETED
- ABANDONED

### 5.2 Screen status
- loading
- active
- completed
- error

Поведение:
- При входе в экран: status=active.
- При переходе вперёд/submit: предыдущий экран получает completed.
- При ошибке ассета: error.

---

## 6) Сохранение прогресса (локально)

Хранилище: LocalStorage ключ `onboarding_shell_v1`.

Правила:
- На каждом изменении состояния прогресс сохраняется.
- При повторном входе:
  - если processStatus=COMPLETED → открывается `SCR_FINAL`
  - иначе открывается сохранённый `currentScreenId` (после проверки guard)

### 6.0.1 Common Lessons data model (сохранение в state)
`commonLessons` хранится в `OnboardingState` и персистится в LocalStorage через общий прогресс.

Формат:
- `segment`: `Segment | null` — сегмент, под который выбран список уроков (защита от рассинхронизации)
- `currentIndex`: number — индекс текущего lesson в массиве `COMMON_LESSONS_BY_SEGMENT[segment]`
- `isCompleted`: boolean — завершён ли блок общих уроков

Правило восстановления:
- если `isCompleted=true` и `segment == quiz1.segment` → открывается `QZ2_INVEST_PROFILE`
- если `segment != quiz1.segment` → прогресс Common Lessons сбрасывается и стартует с первого урока нового сегмента

### 6.0.2 Branch data model (сохранение в state)
`branch` хранится в `OnboardingState` и персистится в LocalStorage через общий прогресс.

Формат:
- `branchId`: `BranchId | null`
- `currentIndex`: number
- `isCompleted`: boolean
- `segmentSnapshot`: `Segment | null`
- `strategySnapshot`: `Strategy | null`
- `quiz2Hash`: string | null (детерминированный hash от `segment + strategy + quiz1Hash + quiz2Answers`)

Restore rules:
- если `branch.isCompleted=true` и snapshot/hash совпадают с текущим контекстом → открывается `SCR_FINAL`
- если snapshot/hash не совпадают → ветка сбрасывается и стартует заново с первого урока (корректный `branchId` вычисляется через `resolveBranchId(segment, strategy)`)

---

## 6.1) Аналитика (минимальная, без SDK)

Единая точка входа: `track(eventName, payload)` в `09_analytics.ts`. Интеграция с внешними SDK запрещена на этом этапе.

События Quiz1:
- `onboarding_quiz1_start` (payload: `screenId`)
- `onboarding_quiz1_answer` (payload: `questionId`, `answerId`)
- `onboarding_quiz1_complete` (payload: `segment`)
- `onboarding_quiz1_error` (payload: `errorType`, optional: `missingQuestionIds`)

События Common Lessons:
- `onboarding_common_start` (payload: `segment`, `totalLessons`)
- `onboarding_common_view_lesson` (payload: `segment`, `lessonId`, `index`, `totalLessons`)
- `onboarding_common_next` (payload: `lessonId`, `toIndex`)
- `onboarding_common_back` (payload: `lessonId`, `toIndex`)
- `onboarding_common_complete` (payload: `segment`)

События Quiz2:
- `onboarding_quiz2_start` (payload: `segment`)
- `onboarding_quiz2_prefill` (payload: `prefilledFields[]`)
- `onboarding_quiz2_answer` (payload: `questionId`, `answerId`, `wasPrefilled`, `segment`)
- `onboarding_quiz2_complete` (payload: `strategy`, `segment`)
- `onboarding_quiz2_error` (payload: `errorType`, optional: `missingQuestionIds`)

События Branch:
- `onboarding_branch_start` (payload: `branchId`, `segment`, `strategy`, `totalLessons`)
- `onboarding_branch_view_lesson` (payload: `branchId`, `lessonId`, `index`, `totalLessons`)
- `onboarding_branch_next` (payload: `branchId`, `lessonId`, `toIndex`)
- `onboarding_branch_back` (payload: `branchId`, `lessonId`, `toIndex`)
- `onboarding_branch_complete` (payload: `branchId`, `segment`, `strategy`)

---

## 7) Edge cases

- EC001: corrupted storage → старт с `SCR_ENTRY`, processStatus=NOT_STARTED
- EC002: hash screenId недоступен по guard → redirect на ближайший обязательный экран (QZ1 или QZ2)
- EC003: offline → экран в состоянии offline (действия блокируются)
- EC004: deep link error → фиксированное модальное окно ошибки
- EC005: quiz1 answers заполнены, но `segment` отсутствует или не совпадает с `computeSegment(answers)` → guard редиректит на `QZ1_EXPERIENCE_GOALS` (анкета считается НЕ пройденной)
- EC006: `quiz1.segment` изменился (или отличается от `commonLessons.segment`) → прогресс Common Lessons сбрасывается и пользователь проходит блок заново для нового сегмента
- EC007: пользователь пытается перейти на `QZ2_INVEST_PROFILE` при `commonLessons.isCompleted != true` → guard редиректит на `CL_COMMON_LESSONS`
- EC008: quiz2 answers заполнены, но `strategy` отсутствует или не совпадает с `computeStrategy(quiz1Answers, quiz2Answers, segment)` → guard редиректит на `QZ2_INVEST_PROFILE` (анкета №2 считается НЕ пройденной)
- EC009: `quiz2.quiz1Hash` отсутствует/не совпадает с текущим hash от Quiz1 → Quiz2 считается НЕ пройденной, требуется повторный submit
- EC010: `branch.branchId` отсутствует/не совпадает с `resolveBranchId(segment, strategy)` → ветка считается НЕ инициализированной, guard редиректит на `QZ2_INVEST_PROFILE`
- EC011: `branch.quiz2Hash` отсутствует/не совпадает с текущим hash от Quiz2 → ветка сбрасывается и стартует заново с первого урока
- EC012: пользователь пытается открыть `SCR_FINAL` при `branch.isCompleted != true` → guard редиректит на `BR_BRANCH_LESSONS`

---

## 8) BLOCKERS

BL001: Финальные тексты Common Lessons не предоставлены продуктом. В `10_common_lessons_config.ts` используются временные, но содержательные тексты, которые требуют замены на финальные без изменения структуры/логики.
BL002: Финальные правила стратегии и финальная матрица prefill Quiz2 не предоставлены продуктом. В `14_quiz2_prefill.ts` и `15_quiz2_rules.ts` реализованы временные, но детерминированные правила, требующие замены на финальные без изменения архитектуры/guard/хранилища.
BL003: Если команда предоставит обновлённый финальный контент слайдов для веток (ScreenID `s02a_* ... s31_cta`), требуется синхронизация `17_branch_config.ts` (LESSON_REGISTRY и списки BRANCH_LESSONS) без изменения навигации/guard.

