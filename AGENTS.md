## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)

# AGENTS — технические заметки для ИИ-агентов

## Стек
Astro 7.4.2, Vite 8.3.5, Node ≥ 22.23.4, TS strict. Без фреймворков.
В <script> внутри .astro — // @ts-nocheck первой строкой.
Frontmatter .astro: ровно две линии --- на собственных строках, ничего
до первой. Комментарий в frontmatter — одна строка (многострочный
протекает на страницу).

## Состояние калькулятора
- state.mode: 'packs' | 'custom'
- state.pack: 'popular' | 'optimal' | 'maximal' | null
- state.extSel: undefined (не трогал, действует дефолт пакета) |
  число (выбрал) | null (снял выбор)
- state.packModified: bool — тариф стал «Свой формат»
- snapshot: снимок, ушедший в форму. lastOrder: текущий черновик.
- dirty: snapshot ≠ lastOrder по полям tariffKey / tariff / tariffPrice
  / guests / dateISO / slot / extras.

## Ключевые функции
- calculate() — единственный источник цен. Формулы выверены.
- pick() — фиксирует lastOrder как snapshot, показывает тост.
- restoreCalcState() — восстановление из localStorage при загрузке.
- syncExt / syncVisibility / syncGuests / syncCart / showCart —
  перерисовка UI по состоянию.
- unsetPack() — снятие выбора карточки пакета. snapshot НЕ трогает.

## Регрессионно-опасные места
Любая правка в этих функциях = прогнать контрольные цены из SPEC.
- calculate() — формулы
- pick() / pushSnapshot() — перенос в форму
- restoreCalcState() — восстановление
- syncExt() — ярмарка
- recalcAll() — порядок синхронизации (syncProgramUI первой строкой)

## Правила
1. Один файл — одна цель. Без мега-ТЗ на 10 правок.
2. Не возвращать удалённое: правую колонку «Ваш тариф», бар,
   absolute-бейджи, toprow, опции «без ярмарки», фиксированное
   «Банкет под ключ 6 000 ₽».
3. Radio-deselect (клик по выбранному снимает выбор): признак
   повторного клика — String(curValue) === inp.value, НЕ inp.checked
   (браузер обновляет checked до click-обработчика). После снятия —
   обязательно перерисовать блок (syncExt / sync*) — иначе хинты и
   пометки не обновятся.
4. hidden и inline style.display не смешивать. Для элементов, которыми
   управляет JS через style.display — в разметке style="display:none",
   не hidden.
5. Кнопки: -webkit-tap-highlight-color: transparent;
   :focus:not(:focus-visible) { outline: none; }
   :focus-visible { outline: 2px solid #0AD9C6; }
6. Panels без width: 100% там, где они уже растянуты grid/flex — иначе
   с боковыми margin даёт overflow.
7. Перед выдачей кода — прогнать таблицу контрольных цен из SPEC.
   Если не сходится — не выдавать.

## Известные нюансы
- effFreeGuests в calculate(): для Максимального при включённом меню
  еда уже покрывает всех гостей — отдельная надбавка за еду не
  начисляется. Это правило SPEC, не костыль.
- progLimit = CONFIG.programLimit = 15 для всех тарифов. Не путать
  с t.freeGuests (лимит еды).
- data-remove="ym" в шторке — мёртвый ключ, не используется. Убрать
  при случае.

## Известные баги в бэклоге
- Счётчик пилла у Максимального показывает «1 позиция», хотя в шторке
  5 строк. UX-вопрос, не баг.
- Подпись под гостями при включённой еде Максимального молчит про
  лимит программы 15.
- alert() при отсутствии согласия в форме — заменить на inline
  (Спринт 4).