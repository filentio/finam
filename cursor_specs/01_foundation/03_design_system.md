## 3) Дизайн‑система (единая, сдержанная, без отклонений)

### 3.1. Формат и сетка
- **Формат экранов**: строго вертикальный \(9:16\).
- **Базовый артборд**: 1080×1920.
- **Safe area**:
  - верх: 96 px
  - низ: 80 px
  - слева/справа: 48 px
- **Базовая колонка контента**: ширина 1080 − 2×48 = 984 px.

### 3.2. Цветовые токены (фиксированные значения)
Использовать только эти значения.

- **Color.Primary.Blue**: `#1E5AA8`
- **Color.Primary.Orange**: `#F5A623`
- **Color.Text.Primary**: `#333333`
- **Color.Text.Secondary**: `#555555`
- **Color.Text.Tertiary**: `#666666`
- **Color.Text.Muted**: `#999999`
- **Color.Bg.Page**: `#F0F2F5`
- **Color.Bg.Surface**: `#FFFFFF`
- **Color.Border.Light**: `#E5E7EB`
- **Color.State.Success**: `#4CAF50`
- **Color.State.Danger**: `#D32F2F`
- **Color.Bg.Warm**: `#FFF8E1` (подложки/акценты)
- **Color.Bg.Warm2**: `#FFF3E0` (вторичная тёплая подложка)

### 3.3. Типографика
- **Шрифт**: `Inter`, fallback `sans-serif`.
- **Вес**:
  - Заголовки: 700
  - Подзаголовки/акценты: 600
  - Основной текст: 400–500
- **Размеры** \(строго\):
  - H1: 56
  - H2: 40
  - H3: 28
  - Body L: 20
  - Body M: 18
  - Body S: 16
  - Caption: 14

### 3.4. Скругления, тени, отступы
- **Radius.L**: 24 (карточки)
- **Radius.M**: 16 (кнопки/пилюли)
- **Radius.S**: 12 (малые элементы)
- **Shadow.Card**: `0 8px 24px rgba(0,0,0,0.08)` (только для “поднятых” карточек)
- **Spacing шаг**: кратно 8 px (любые отступы — только 8/16/24/32/40/48/56/64).

### 3.5. Компоненты (фиксированные паттерны)

#### 3.5.1. Topbar
- Логотип/маркер `Finam` вверху.
- Иконки/служебные элементы допускаются только в анкете (см. `05_questionnaire.md`).

#### 3.5.2. Primary Button
- Высота: 64 px
- Радиус: 16 px
- Фон: `Color.Primary.Orange`
- Текст: `Color.Bg.Surface` \(белый\)
- Текст‑стиль: Body M, 600

#### 3.5.3. Secondary Button
- Высота: 64 px
- Радиус: 16 px
- Фон: `Color.Bg.Surface`
- Обводка: 2 px `Color.Border.Light`
- Текст: `Color.Text.Primary`

#### 3.5.4. Choice Pill (для анкеты)
- Высота: 44 px
- Радиус: 12 px
- Состояния:
  - selected: фон `Color.Primary.Orange`, текст `Color.Text.Primary` (как в референсе)
  - unselected: фон `#F3F4F6`, текст `Color.Text.Tertiary`
  - disabled: фон `#F3F4F6`, текст `Color.Text.Muted`

#### 3.5.5. Card
- Фон: `Color.Bg.Surface`
- Обводка: 1 px `Color.Border.Light`
- Радиус: 24 px
- Внутренний padding: 24 px

### 3.6. Иконки
- В исходной колоде использован стиль Font Awesome. В реализации использовать **один** набор пиктограмм (любой), но:
  - иконка должна совпадать по смыслу,
  - размер 24 px,
  - цвет `Color.Primary.Blue` или `Color.Primary.Orange` (только эти два).

