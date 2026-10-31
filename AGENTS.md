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
- window.DR_CALC.sent: bool — форма успешно отправлена. Сохраняется
  в localStorage, восстанавливается в restoreCalcState.

## Ключевые функции
- calculate() — единственный источник цен. Формулы выверены.
- pick(silent) — фиксирует lastOrder как snapshot. При silent=true
  не показывает тост, не скроллит, не трогает кнопку шторки (тихий
  перенос из формы). При silent=false — тост + «Добавлено ✓» + скролл.
- restoreCalcState() — восстановление из localStorage (sent, три
  состояния extSel, snapshot).
- syncExt / syncVisibility / syncGuests / syncCart / showCart —
  перерисовка UI по состоянию.
- unsetPack() — снятие выбора карточки пакета. snapshot НЕ трогает.

## Шина событий калькулятор ↔ форма
- drcalc-update: отправка и подписка на document.
- drcalc-refresh: форма отправляет на document БЕЗ всплытия; слушатель
  должен быть на document, НЕ на window — CustomEvent по умолчанию не
  всплывает. Причина бага этапа А. Новые события шины держать на одном
  объекте (document).

## Тихий режим переноса
- pick() различает источник: перенос из формы (silent=true) — тост
  НЕ показывается, кнопка шторки и скролл не трогаются; перенос из
  шторки (silent=false) — тост и «Добавлено ✓» как раньше. Snapshot
  и dirty — общая логика в обоих случаях.
- Кнопка «Перенести расчёт в заявку →» в панели видна только при
  c.ready && !c.selected; после переноса исчезает.

## Регрессионно-опасные места
Любая правка в этих функциях = прогнать контрольные цены из SPEC.
- calculate() — формулы
- pick() / pushSnapshot() — перенос в форму
- restoreCalcState() — восстановление
- syncExt() — ярмарка
- recalcAll() — порядок синхронизации (syncProgramUI первой строкой)
- pick(true) из формы через drcalc-refresh — если сломается слушатель,
  кнопки статуса в форме перестанут работать.

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
8. События-шины: drcalc-update и drcalc-refresh — слушать на document,
   не на window. Новые события — туда же.

## Процесс (для агентов)
- Роли: Степан — бизнес-решения, лексика и цены (SPEC); Claude — код,
  реализация, прогон контрольных цен, чек-лист для Степана; Алиса —
  аналитика, формулировка ТЗ (цель + поведение + ограничения +
  контрольные значения, без кода).
- ТЗ не содержит готового JS/CSS — только цель и псевдокод ≤ 5 строк.
- Одна задача = одно ТЗ = один файл = один коммит.
- Спорная инструкция в ТЗ → помечать FIXME-REVIEW, не выдумывать
  компромисс. Противоречие SPEC vs ТЗ → решает Степан.

## Известные нюансы
- effFreeGuests в calculate(): для Максимального при включённом меню
  еда уже покрывает всех гостей — отдельная надбавка за еду не
  начисляется. Это правило SPEC, не костыль.
- progLimit = CONFIG.programLimit = 15 для всех тарифов. Не путать
  с t.freeGuests (лимит еды).
- Гвард 15 000 срабатывает только при lastTotal < 15000, не <=.
  Голая Мини = 15 000 — кнопка активна.

## Техдолг шины (мелочи, при случае)
- data-remove="ym" в шторке — мёртвый ключ, убрать.

## Известные баги в бэклоге
- Счётчик пилла у Максимального показывает «1 позиция», хотя в шторке
  5 строк. UX-вопрос, не баг.
- Подпись под гостями при включённой еде Максимального молчит про
  лимит программы 15.
- alert() при отсутствии согласия в форме — заменить на inline
  (Спринт 4).