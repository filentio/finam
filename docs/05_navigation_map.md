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
`segment` вычисляется детерминированно:
- Если Q1 (квал статус) = `Да` → `qualified`
- Иначе Q2 (опыт):
  - `Еще нет опыта` или `Менее 1 года` → `novice`
  - `От 1 до 3 лет` → `learner`
  - `От 3 до 5 лет` или `Более 5 лет` → `experienced`

### 3.2 Strategy (результат анкеты №2)
`strategy` вычисляется детерминированно по score 0..8:
- 0–2 → `conservative`
- 3–5 → `balanced`
- 6–8 → `aggressive`

### 3.3 Mapping (полное покрытие комбинаций)

| segment \\ strategy | conservative | balanced | aggressive |
|---|---|---|---|
| novice | BR_BEGINNER | BR_BEGINNER | BR_BEGINNER |
| learner | BR_INTERMEDIATE | BR_INTERMEDIATE | BR_INTERMEDIATE |
| experienced | BR_INTERMEDIATE | BR_INTERMEDIATE | BR_ADVANCED |
| qualified | BR_ADVANCED | BR_ADVANCED | BR_ADVANCED |

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

## 7) Edge cases

- EC001: corrupted storage → старт с `SCR_ENTRY`, processStatus=NOT_STARTED
- EC002: hash screenId недоступен по guard → redirect на ближайший обязательный экран (QZ1 или QZ2)
- EC003: offline → экран в состоянии offline (действия блокируются)
- EC004: deep link error → фиксированное модальное окно ошибки

---

## 8) BLOCKERS

Отсутствуют.

