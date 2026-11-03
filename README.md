# XKALMAR Party — сайт квест-шоу

Сайт квест-шоу для детей в Ростове-на-Дону: главная — день рождения,
сложный интерактивный калькулятор стоимости, форма заявки.
Статический сайт на Astro, деплой на Cloudflare Pages.

## Стек

- Astro 7.4.2 + Vite 8.3.5, TypeScript strict, без UI-фреймворков.
- Node ≥ 22.23.4.

## Команды

```bash
npm install              # зависимости
npm run dev              # dev-сервер (localhost:4321)
npm run build            # сборка в ./dist/
npm run preview          # предпросмотр сборки
npm run astro check      # проверка типов
```

## Структура

- `src/components/` — Calculator.astro (калькулятор), RequestForm.astro
  (форма заявки), ImageGallery.astro (галерея с лайтбоксом).
- `src/layouts/Base.astro` — базовый layout (SEO, шапка, футер).
- `src/pages/` — index.astro (главная), privacy.astro.
- `public/photos/` — фотографии мероприятий.
- `docs/` — дизайн-система (DRAFT), визуальный аудит, скриншоты QA.
- `.agents/` — инструкции для ИИ-агентов: точка входа AGENTS.md,
  документы .agents/docs/, навык визуального QA.

## Для ИИ-агентов

Начинайте с [AGENTS.md](AGENTS.md) — маршрутизатор задач, Правило №0
(источник фактов), гейты деплоя и визуальной приёмки.

## Деплой

git push → Cloudflare Pages автодеплой → https://xkalmar-party.pages.dev.
Пуш — только по явной команде владельца (см. .agents/docs/01-environment.md).
