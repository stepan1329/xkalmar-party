# Дизайн-система XKALMAR — DRAFT

> **Статус:** DRAFT — не утверждена, не для продакшена.
> **Цель:** единые правила для всех будущих страниц и компонентов.
> **Не менять** текущие стили без явного утверждения Степаном.

## 1. Палитра

### Основные цвета

| Роль | Цвет | HEX | Использование |
|------|------|-----|---------------|
| Фон основной | `#032E2B` | Тёмно-зелёный | body, секции дк, футер |
| Фон калькулятора | `#032E2B` | Тёмно-зелёный | секция `drc` |
| Фон карточек | `#FFFFFF` | Белый | карточки пакетов, шаги калькулятора |
| Акцент основной | `#C30067` | Малиновый | CTA-кнопки, выделение цен, бордеры выбранных элементов |
| Акцент вторичный | `#0AD9C6` | Бирюзовый | теги, иконки, ссылки, focus-visible outline |
| Текст основной | `#FFFFFF` | Белый | на тёмном фоне |
| Текст вторичный | `rgba(255,255,255,0.75)` | Полупрозрачный белый | описания, подзаголовки на тёмном фоне |
| Текст на белом | `#032E2B` | Тёмно-зелёный | заголовки, основной текст на белом фоне |
| Текст на белом вторичный | `#3C5B57` | Серо-зелёный | описания, meta-текст на белом фоне |
| Текст подсказок | `#6B8B86` | Светло-серо-зелёный | hint-текст, неактивные элементы |
| Рамки | `#E4ECEA` | Светло-серый | бордеры инпутов, разделители |
| Фон инпутов | `#F5F7F6` | Почти белый | фон стипперов, радиокнопок, summary |
| Фон модалов | `rgba(1,16,15,0.7)` | Тёмный оверлей | фон шторки, модалов |

### Градиенты и оверлеи

- Hero overlay: `rgba(0,0,0,0.55)` — затемнение фона hero
- Hover-бордеры: `rgba(10,153,148,0.5)` — бирюзовый полупрозрачный
- Hover-фон кнопок: `rgba(195,0,103,0.12)` → `rgba(195,0,103,0.2)`

## 2. Шрифты

### Семейство

```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
             'Helvetica Neue', Arial, sans-serif;
```

Системный стек. Без внешних шрифтов.

### Размеры

| Элемент | Размер | Жирность | Line-height |
|---------|--------|----------|-------------|
| h1 (hero) | `clamp(32px, 6vw, 56px)` | 800 | 1.15 |
| h2 (секции) | `clamp(24px, 4vw, 34px)` | 700 | 1.3 |
| body | 15–17px | 400 | 1.5–1.6 |
| meta/desc | 13–14px | 500 | 1.5 |
| hint | 12px | 400 | 1.5 |
| tag | 11px | 600 | 1.3 |
| цены | 26px | 800 | 1.0 |
| карточка name | 18px | 700 | 1.3 |
| карточка price | 26px | 800 | 1.0 |
| pill total | 16px | 800 | 1.0 |
| sheet total | 24px | 800 | 1.0 |

## 3. Заголовки

### h1
- Только один на странице
- Hero-секция
- `clamp(32px, 6vw, 56px)`, weight 800
- `em`-элемент для акцента: `color: #C30067`

### h2
- Одна секция = один h2
- `clamp(24px, 4vw, 34px)`, weight 700
- `text-align: center`
- `margin: 0 0 12px` (или `margin: 0 0 28px` если есть подзаголовок)

### h3 и ниже
- Не используются на текущих страницах
- При добавлении: h3 = 22px/700, h4 = 18px/700

## 4. Отступы

### Вертикальные (секции)

| Секция | Padding top | Padding bottom |
|--------|-------------|----------------|
| Hero | 72px | 64px |
| Формат | 48px | 48px |
| FAQ | 48px | 48px |
| Калькулятор | 72px | 120px |
| Timeline | 48px | 48px |
| Ярмарка | 48px | 48px |
| Площадка | 48px | 48px |
| Features | 48px | 48px |
| Отзывы | 48px | 48px |
| Галерея | 48px | 48px |

### Горизонтальные

- `.wrap`: `max-width: 1100px; margin: 0 auto; padding: 0 24px;`
- Десктоп: 24px боковые
- Мобильный: 14–16px боковые

### Внутренние (компоненты)

- Карточки: `padding: 22px 20px`
- Шаги калькулятора: `padding: 20px 28px`
- Шторка: `padding: 12px 20px`
- Модал: `padding: 30px 30px 24px`
- Карточки format/features/reviews: `gap: 14px`

## 5. Контейнеры

### `.wrap`
```css
max-width: 1100px;
margin: 0 auto;
padding: 0 24px;
width: 100%;
```

### `.drc` (калькулятор)
```css
.max-width: 1080px;
margin: 0 auto;
```

### `.drc__cards`
```css
display: grid;
grid-template-columns: repeat(3, 1fr);
gap: 14px;
max-width: 1080px;
```

### `.format__grid`, `.features__grid`, `.reviews__grid`
```css
display: grid;
gap: 14px;
```
(колонки определяются контентом, на мобильном — 1 колонка)

## 6. Карточки

### Карточка пакета (`.drc-card`)
- `border-radius: 20px`
- `padding: 22px 20px`
- `background: #FFFFFF`
- `border: 2px solid transparent`
- Hover: `border-color: rgba(10,153,148,0.5); transform: translateY(-2px)`
- Checked: `border-color: #C30067; box-shadow: 0 10px 30px rgba(195,0,103,0.25)`
- `transition: .2s`

### Карточка формата (`.format__card`)
- Без рамки, без фона
- Только текст + SVG-иконка

### Feature-card (`.feature-card`)
- Без рамки, без фона
- SVG-иконка + текст

### Review-card (`.review-card`)
- Без рамки, без фона
- Звёзды `★★★★★` (цвет по умолчанию — наследуется)

## 7. Кнопки

### CTA (`.site-header__cta`, `.hero a`)
- `background: #C30067`
- `color: #FFFFFF`
- `padding: 10px 22px` (header) / `16px 36px` (hero)
- `border-radius: 22px` (header) / `30px` (hero)
- `font-weight: 700`
- Hover: `background: #E00077`
- `transition: background .15s`

### DRC-кнопка (`.drc-btn`)
- `background: #C30067`
- `padding: 13px 28px`
- `border-radius: 30px`
- Hover: `background: #E00077`

### Кнопка-триггер (`.drc__custom-trigger`)
- `background: rgba(195,0,103,0.12)`
- `border: 1px solid rgba(195,0,103,0.4)`
- `border-radius: 16px`
- `padding: 16px`
- Hover: `background: rgba(195,0,103,0.2); border-color: #C30067`

### Кнопка-ссылка (`.drc-link`)
- `font-size: 13px`
- `color: #0A9994`
- `text-decoration: underline`
- Hover: `color: #C30067`

### Кнопка очистки (`.drc-sheet__clear`)
- `background: transparent`
- `border: 1px solid #E4ECEA`
- `border-radius: 20px`
- `padding: 12px 16px`
- `color: #6B8B86`

### Состояния
- Disabled: `opacity: .5; cursor: default`
- Focus: `outline: 2px solid #0AD9C6; outline-offset: 2px`
- Tap highlight: `-webkit-tap-highlight-color: transparent`

## 8. Формы

### Инпуты (`.drc-date`)
- `font: inherit`
- `font-size: 15px`
- `padding: 10px 14px`
- `border: 1px solid #E4ECEA`
- `border-radius: 12px`
- `background: #FFFFFF`

### Радиокнопки
- `accent-color: #C30067`
- `width: 18px; height: 18px`

### Чекбоксы
- `accent-color: #C30067`
- `width: 18px; height: 18px`

### Стейппер (`.drc-stepper`)
- `background: #F5F7F6`
- `border-radius: 12px`
- `padding: 8px 12px`
- Кнопки: `width: 32px; height: 32px; background: #05544F; border-radius: 10px`

## 9. Изображения и галерея

### Hero
- `object-fit: cover`
- `position: absolute; inset: 0`
- Desktop: `hero__img--desktop`
- Mobile: `hero__img--mobile` (`display: none` на десктопе)

### Галерея (`.gallery__grid`)
- Сетка на CSS Grid
- `loading="lazy"` на всех не-hero изображениях
- `<button class="gallery__item">` с `data-src` для лайтбокса
- `data-alt` = канонический alt для лайтбокса

### Лайтбокс (`.lightbox`)
- `position: fixed; inset: 0; z-index: 100`
- Навигация: `‹` / `›` кнопки
- Закрытие: крестик, клик на фон, Escape
- `document.body.style.overflow = 'hidden'` при открытии

## 10. Видео

### Видео-модальное окно (`.video-modal`)
- `position: fixed; inset: 0; z-index: 100`
- `<iframe>` с Kinescope embed URL
- Закрытие: крестик, клик на фон, Escape
- `iframe.src = ''` при закрытии (остановка видео)

### Кнопки видео
- `.yamarka__video-btn` — секция Ярмарка
- `.hallway__video-btn` — секция Площадка
- `data-video` = URL embed

## 11. Мобильная версия

### Брейкпоинты

| Точка | Применение |
|-------|------------|
| ≤ 900px | Калькулятор: 1 колонка пакетов |
| ≤ 760px | Калькулятор: padding 48px/14px/140px |
| ≤ 640px | Header: скрыть навигацию, уменьшить логотип |

### Мобильные особенности
- Header: `padding: 12px 0`, `gap: 8px`
- Logo: `font-size: 18px`
- CTA: `padding: 9px 16px; font-size: 13px`
- Калькулятор: `padding: 48px 14px 140px`
- Шаги калькулятора: `padding: 18px 16px`
- Пилл корзины: `right: 16px; bottom: calc(16px + env(safe-area-inset-bottom))`

## 12. Анимации и интерактивные состояния

### Hover-эффекты
- Карточки пакетов: `translateY(-2px)` + бордер
- Кнопки CTA: смена `background`
- Ссылки навигации: смена `color`
- Кнопки: `transition: .15s` или `.2s`

### Анимации
- Шторка: `@keyframes sheetUp` (slide from bottom) + `@keyframes sheetFade` (opacity)
- Точка на пилле: `@keyframes pillPulse` (scale 1 → 1.6 → 1, 3 раза)
- Scroll behavior: `smooth` (если не `prefers-reduced-motion: reduce`)

### Состояния
- Hover: visible бордеры, лёгкий сдвиг
- Active/Checked: малиновый бордер `#C30067`
- Focus-visible: бирюзовый outline `#0AD9C6`
- Disabled: `opacity: .5`

## 13. Замечания и рекомендации

### Что улучшить в будущем
1. **Вынести CSS-переменные** — текущие HEX-значения дублируются в нескольких файлах
2. **Единый radius** — сейчас 12px, 14px, 16px, 20px, 22px, 30px. Предложить 2-3 значения.
3. **Единый spacing scale** — сейчас 6px, 8px, 10px, 12px, 14px, 16px, 20px, 22px, 24px, 28px, 36px, 48px, 72px. Предложить систему 4px/8px.
4. **Шрифт** — системный стек хорош, но для бренда можно подключить один акцидентный шрифт для h1/h2.
5. **Тени** — сейчас только одна тень на пилл и карточку пакета. Предложить систему elevation.
6. **SVG-иконки** — все inline, stroke-width: 1.5. Это хороший стандарт.

### Что НЕ менять без утверждения
- Палитру (особенно `#C30067` и `#032E2B`)
- Лексический канон из SPEC-business.md
- Контрольные цены
- Структуру калькулятора
