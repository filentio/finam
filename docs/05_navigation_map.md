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
| 03 | `CL01_PLACEHOLDER` | Общий урок 1 (заглушка) | 3 | common_lesson |
| 04 | `CL02_PLACEHOLDER` | Общий урок 2 (заглушка) | 3 | common_lesson |
| 05 | `CL03_PLACEHOLDER` | Общий урок 3 (заглушка) | 3 | common_lesson |
| 06 | `QZ2_INVEST_PROFILE` | Анкета №2 (3–4 вопроса) | 4 | quiz |
| 07 | `BR_BEGINNER_01` | Ветка Beginner экран 1 (заглушка) | 5 | branch_lesson |
| 08 | `BR_BEGINNER_02` | Ветка Beginner экран 2 (заглушка) | 5 | branch_lesson |
| 09 | `BR_INTERMEDIATE_01` | Ветка Intermediate экран 1 (заглушка) | 5 | branch_lesson |
| 10 | `BR_INTERMEDIATE_02` | Ветка Intermediate экран 2 (заглушка) | 5 | branch_lesson |
| 11 | `BR_ADVANCED_01` | Ветка Advanced экран 1 (заглушка) | 5 | branch_lesson |
| 12 | `BR_ADVANCED_02` | Ветка Advanced экран 2 (заглушка) | 5 | branch_lesson |
| 13 | `SCR_FINAL` | Финальный экран | 6 | final |

Все ScreenID уникальны.

---

## 2) Таблица переходов (from → to)

Таблица является источником истины. Переход, не описанный в таблице, запрещён.

| ID | From | To | Условие | Тип |
|---|---|---|---|---|
| T001 | `SCR_ENTRY` | `QZ1_EXPERIENCE_GOALS` | NEXT | linear |
| T002 | `QZ1_EXPERIENCE_GOALS` | `CL01_PLACEHOLDER` | SUBMIT_VALID | submit |
| T003 | `CL01_PLACEHOLDER` | `CL02_PLACEHOLDER` | NEXT | linear |
| T004 | `CL02_PLACEHOLDER` | `CL03_PLACEHOLDER` | NEXT | linear |
| T005 | `CL03_PLACEHOLDER` | `QZ2_INVEST_PROFILE` | NEXT | linear |
| T006 | `QZ2_INVEST_PROFILE` | `BR_*_01` | BRANCH_RESOLVED | branch |
| T007 | `BR_BEGINNER_01` | `BR_BEGINNER_02` | NEXT | linear |
| T008 | `BR_BEGINNER_02` | `SCR_FINAL` | NEXT | linear |
| T009 | `BR_INTERMEDIATE_01` | `BR_INTERMEDIATE_02` | NEXT | linear |
| T010 | `BR_INTERMEDIATE_02` | `SCR_FINAL` | NEXT | linear |
| T011 | `BR_ADVANCED_01` | `BR_ADVANCED_02` | NEXT | linear |
| T012 | `BR_ADVANCED_02` | `SCR_FINAL` | NEXT | linear |

Где `BR_*_01` определяется детерминированно на основе (segment + strategy) через `branchId`:
- `BR_BEGINNER` → `BR_BEGINNER_01`
- `BR_INTERMEDIATE` → `BR_INTERMEDIATE_01`
- `BR_ADVANCED` → `BR_ADVANCED_01`

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
`strategy` вычисляется детерминированно по score 0..8:
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

## 4) Back navigation (строго)

Back запрещён, если:
- processStatus = COMPLETED
- для текущего экрана backTarget = null

Back target:
- `SCR_ENTRY` → null
- `QZ1_EXPERIENCE_GOALS` → `SCR_ENTRY`
- `CL01_PLACEHOLDER` → `QZ1_EXPERIENCE_GOALS`
- `CL02_PLACEHOLDER` → `CL01_PLACEHOLDER`
- `CL03_PLACEHOLDER` → `CL02_PLACEHOLDER`
- `QZ2_INVEST_PROFILE` → `CL03_PLACEHOLDER`
- `BR_*_01` → `QZ2_INVEST_PROFILE`
- `BR_*_02` → `BR_*_01`
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

---

## 6.1) Аналитика (минимальная, без SDK)

Единая точка входа: `track(eventName, payload)` в `09_analytics.ts`. Интеграция с внешними SDK запрещена на этом этапе.

События Quiz1:
- `onboarding_quiz1_start` (payload: `screenId`)
- `onboarding_quiz1_answer` (payload: `questionId`, `answerId`)
- `onboarding_quiz1_complete` (payload: `segment`)
- `onboarding_quiz1_error` (payload: `errorType`, optional: `missingQuestionIds`)

---

## 7) Edge cases

- EC001: corrupted storage → старт с `SCR_ENTRY`, processStatus=NOT_STARTED
- EC002: hash screenId недоступен по guard → redirect на ближайший обязательный экран (QZ1 или QZ2)
- EC003: offline → экран в состоянии offline (действия блокируются)
- EC004: deep link error → фиксированное модальное окно ошибки
- EC005: quiz1 answers заполнены, но `segment` отсутствует или не совпадает с `computeSegment(answers)` → guard редиректит на `QZ1_EXPERIENCE_GOALS` (анкета считается НЕ пройденной)

---

## 8) BLOCKERS

Отсутствуют.

