# Project Map: XKALMAR Party Website

> Правило поддержания: карта описывает код «как есть». При изменении
> структуры файлов или ключевых модулей — обновить соответствующий раздел
> в том же коммите. Спорные наблюдения фиксировать как открытые вопросы,
> не как утверждения (см. AGENTS.md, Правило №0: источник фактов — Степан).

## Overview
A modern Astro 7.4.2 static site with TypeScript strict mode, featuring a complex interactive calculator for party planning services. The project follows a component-based architecture with clear separation of concerns.

## Technology Stack
- **Framework**: Astro 7.4.2 (static site generator)
- **Build Tool**: Vite 8.3.5
- **Language**: TypeScript (strict mode)
- **Styling**: CSS (no external frameworks)
- **Dependencies**: @astrojs/check, astro, sharp, typescript
- **Dev Dependencies**: vite-plugin-imagemin

## Project Structure
```
/
├── src/
│   ├── pages/              # Astro pages
│   │   ├── index.astro     # Посадочная «День рождения» (станет /den-rozhdeniya)
│   │   └── privacy.astro   # Privacy policy
│   ├── components/         # Reusable components
│   │   ├── Calculator.astro  # Interactive calculator (логика не трогать)
│   │   ├── RequestForm.astro # Order form
│   │   ├── ContactFab.astro  # Плавающая кнопка связи (мобильные)
│   │   └── ImageGallery.astro # МЁРТВЫЙ КОД: не импортируется (разобрать)
│   ├── styles/
│   │   └── tokens.css      # Дизайн-токены v2 (2 темы: dark/light)
│   └── layouts/
│       └── Base.astro       # Layout: sticky header, футер, FAB, canonical-props
├── public/                 # Static assets
│   ├── photos/             # Event photos (55+ webp files)
│   ├── favicon.svg/ico
│   └── robots.txt, sitemap.xml
├── docs/                   # Documentation
│   ├── design-spec.md      # Спецификация дизайна (создаёт design-lead)
│   ├── research/ strategy/ concepts/ qa/ copy/  # артефакты ролей
│   ├── design-references/  # Референс дизайна
│   └── screenshots/        # Базовая линия «до» (скриншоты)
   (старые design-system*.md и аудиты перенесены в .agents/archive/)
├── scripts/                # Build scripts
│   └── compress-images.js
├── package.json
├── astro.config.mjs
└── tsconfig.json
```

### Структура index.astro (после перестройки Этапа 3, 2026-11-03)
Hero (2 колонки) → page-nav (якорное sticky-меню) → Формат+цифры
→ Calculator → Timeline → Ярмарка → Площадка (карта-карточка) →
Отзывы → Медиа-блок (вьювер+превью, скрытая полная галерея как
источник пагинации) → FAQ → RequestForm → лайтбокс/видеомодалка →
FAQPage JSON-LD.

## Key Modules and Interactions

### 1. **Calculator Component** (`src/components/Calculator.astro`)
**Purpose**: Interactive party calculator with 5-step process
**Lines**: 1430 (largest component)

**State Management**:
- `state` object: mode, pack, customBase, guests, date, extSel, packModified
- `window.DR_CALC`: public API for other components
- `TARIFFS`: 6 pricing packages (popular, optimal, maximal, base, mini)
- `CONFIG`: settings (wa, tg, max, tel, startHour, endHour, programLimit: 15)

**Data Flow**:
```
User Input → calculate() → lastOrder → syncCart() → window.DR_CALC
              ↓
          recalcAll() → syncProgramUI() → syncExt() → syncVisibility()
```

**Key Functions**:
- `calculate()`: Core pricing logic (regressions test critical)
- `pick()`: Transfer calculation to form (silent vs non-silent modes)
- `restoreCalcState()`: LocalStorage persistence
- `pushCalc()`: Update DR_CALC object and dispatch events

**Event System**:
- `drcalc-update`: Sent by calculator, listened by form
- `drcalc-refresh`: Sent by form, listened by calculator (silent mode)
- Events dispatched on `document` (not `window`) per spec

### 2. **Request Form Component** (`src/components/RequestForm.astro`)
**Purpose**: Order submission form with calculator integration
**Lines**: 573

**Integration**:
- Listens to `drcalc-update` events from calculator
- Reads `window.DR_CALC` for current calculation
- Sends data to Google Apps Script endpoint
- Validates form inputs (name, phone, consent)

**Data Flow**:
```
Calculator → window.DR_CALC → RequestForm.renderOrder()
              ↓
          Form submission → Google Apps Script → Telegram/Chat
```

### 3. **Base Layout** (`src/layouts/Base.astro`)
**Purpose**: Site wrapper with header, main, footer
**Lines**: 201

**Features**:
- SEO meta tags (OG, Twitter, Structured Data)
- Navigation with anchor links (#calc, #zayavka, etc.)
- Responsive design with mobile-first approach
- Global styles and accessibility

### 4. **Page Components**
- **index.astro**: Main page with hero, format explanation, FAQ, calculator
- **privacy.astro**: Privacy policy page (standalone HTML)

### 5. **ImageGallery Component**
**Purpose**: Photo gallery with lightbox functionality
**Lines**: 111

**Features**:
- Maps through images array
- Lightbox navigation (prev/next/escape)
- Responsive grid layout

## Entry Points

### 1. **Development**
```bash
npm run dev  # Starts Astro dev server on localhost:4321
```

### 2. **Production Build**
```bash
npm run build  # Creates ./dist/ directory
npm run preview  # Preview built site
```

### 3. **Type Checking**
```bash
npm run astro -- --help  # Astro CLI commands
npm run astro check     # Type checking
```

## Calculator Architecture Details

### State Machine
```
Initial State: mode='packs', pack=null, guests=6, date='', extSel=undefined

States:
- mode: 'packs' | 'custom'
- pack: 'popular' | 'optimal' | 'maximal' | null
- customBase: 'base' | 'mini'
- extSel: undefined | number | null
- packModified: boolean
```

### Tariff Structure
| Package | Price | Free Guests | Program (hrs) | Food Included |
|---------|-------|-------------|----------------|---------------|
| Popular | 24 000₽ | 15 | 2.5 | No |
| Optimal | 33 500₽ | 6 | 3 | Yes |
| Maximal | 50 000₽ | 6 | 3.5 | Yes |
| Base | 20 000₽ | 15 | 2 | No |
| Mini | 15 000₽ | 8 | 1.5 | No |

### Calculation Rules (from AGENTS.md)
1. **Program Limit**: 15 children maximum per tariff
2. **Food Pricing**: 1 000₽/child beyond freeGuests
3. **Extension Logic**: 30/60 min options for various services
4. **Maximal Special**: Includes banquet, balls, photo, tort by default
5. **Guard 15 000**: Button disabled if total < 15 000₽

## Known Issues (подтверждено кодом, 2026-11-03)

- Дубль заголовков «Фотогалерея»: index.astro, две секции
  (`.gallery` и `#gallery-full`, обе с `<h2>`).
- Файл squid-game-quest-39.webp отсутствует в public/photos/ (номера
  1–38, затем 40+). Осознанность пропуска не подтверждена — открытый вопрос.
- В public/photos/ сосуществуют оригиналы .jpg/.JPG и оптимизированные .webp.
- Журнал решений — .agents/docs/06-registry.md. Старые аудиты — .agents/archive/.

## Data Flow

```
User Input → Calculator.calculate() → lastOrder → window.DR_CALC
          → (drcalc-update на document) → RequestForm.renderOrder()
Обратно: RequestForm → (drcalc-refresh на document) → Calculator.pick(true)
Персистентность: localStorage (sent, snapshot, три состояния extSel)
Отправка: RequestForm → Google Apps Script → уведомления
```

> Устаревшие ИИ-разделы (Potential Architectural Improvements, Zustand,
> Phase 2/3 рефакторинг, Conclusion) удалены 2026-11-03 по вердикту
> Степана: не согласованная спекуляция. Архитектурные решения принимает
> Степан, см. AGENTS.md.