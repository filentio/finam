## 4) Техническое описание (процесс целиком)

### 4.1. Термины
- **Screen** — экран приложения/обучения (анкета или слайд).
- **Slide Screen** — экран из колоды, идентификатор вида `sNN_...`.
- **Lesson / Branch** — ветка обучения, запускаемая из меню.
- **Action** — кликабельное действие, однозначно идентифицируемое `actionId`.

### 4.2. Обязательные сущности данных
Реализация должна быть data‑driven: **контент и навигация** берутся из конфигурации, а не “зашиты” в компоненты.

#### 4.2.1. `Screen`
- `id` (string): уникальный идентификатор (например, `s05_deposit`, `QZ01_SEGMENT_QUIZ`)
- `type` (enum): `quiz` | `quiz_result` | `slide`
- `title` (string|null): заголовок экрана (если есть)
- `screenshot` (string|null): путь к PNG в репозитории (для проверки/QA)
- `next` (string|null): id следующего экрана при линейном просмотре
- `actions` (array): список действий на экране

#### 4.2.2. `Action`
- `actionId` (string): фиксированный идентификатор (см. `02_navigation_and_logic.md`)
- `label` (string): точный текст на UI (если применимо)
- `destination` (string): фиксированная цель (см. `cursor_specs/02_common_lessons/02_cta_and_links.md`)
- `behavior` (enum): `navigate` | `deeplink` | `open_modal` | `external`
- `analyticsEvent` (string): фиксированное имя события

#### 4.2.3. `Lesson`
- `lessonId` (enum): `L1_START` | `L2_PORTFOLIO` | `L3_RISKS` | `L4_TARIFFS` | `L5_DIVERSIFICATION`
- `menuItemLabel` (string): точный label пункта меню
- `startScreenId` (string): старт ветки
- `endScreenId` (string): финал ветки
- `returnTo` (string): `s02_navigation_menu` или `s31_cta`

### 4.3. Хранилище состояния (строго)
Хранить только перечисленное ниже.

- `segmentQuiz.answers`:
  - Q1..Q5 (см. `05_questionnaire.md`)
- `segmentQuiz.segment`:
  - `novice` | `learner` | `experienced` | `qualified`
- `course.progress`:
  - `completedLessonIds`: массив `lessonId`
  - `lastVisitedScreenId`: string

### 4.4. Контент: источник истины
- **Точные строки слайдов** берутся из:
  - `cursor_specs/assets/source/slide_texts.json` (поле `text` по `slide_id`)
- **Референс изображения каждого слайда**:
  - `cursor_specs/assets/slides/*.png`
- **Логика структуры**:
  - `cursor_specs/01_foundation/01_screen_sequence.md`

Запрещено:
- менять тексты кнопок/заголовков на слайдах,
- менять порядок экранов,
- добавлять/удалять экраны без правки спецификаций.

### 4.5. Аналитика (минимальный набор)
События должны отправляться синхронно с пользовательским действием.

- `segment_quiz_open`
- `segment_quiz_answer` (с полями: `questionId`, `value`)
- `segment_quiz_submit` (с полем `segment`)
- `course_start`
- `menu_open`
- `menu_select` (с полем `lessonId`)
- `screen_view` (с полем `screenId`)
- `action_click` (с полем `actionId`)
- `lesson_complete` (с полем `lessonId`)
- `course_complete`

