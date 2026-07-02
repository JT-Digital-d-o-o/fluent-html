---
id: RFC-A-02
track: A
title: "Control-flow & element ergonomics — ForEachGroup, ariaCurrent, setEditable, show/hide/resetFormOnSuccess behaviors"
resolves: [#57, #33, #40, #37, #52, #53]
api_surface:
  - "ForEachGroup<T, K extends string | number>(items, keyOf, render): View  (new)"
  - "ForEachGroup<T, K extends string | number>(items, keyOf, options, render): View  (new overload — { consecutive?: boolean })"
  - "Tag.ariaCurrent(active?: boolean, value?: AriaCurrentValue): this  (new)"
  - "AriaCurrentValue (type — 'page' | 'step' | 'location' | 'date' | 'time')"
  - "InputTag.setEditable(editable: boolean): this  (new — false ⇒ readonly)"
  - "TextareaTag.setEditable(editable: boolean): this  (new — false ⇒ readonly)"
  - "SelectTag.setEditable(editable: boolean): this  (new — false ⇒ disabled)"
  - "BehaviorMap.resetFormOnSuccess: void  (new behavior)"
  - "BehaviorMap.show: { target: Id; display?: DisplayClass }  (new behavior)"
  - "BehaviorMap.hide: { target: Id; display?: DisplayClass }  (new behavior)"
  - "DisplayClass (type — closed Tailwind display-token union)"
breaking: additive
ships_to: "6.2.0"
guardrails_checked: [zero-deps, ssr-only, escape-by-default, type-safety, additive-only, instruction-set, class-vocab-sync, guideline-sync]
guideline_updates:
  - lib README/docs/JSDoc (control-flow combinators section, aria/forms reference, htmx behavior list 13→15, CHANGELOG 6.2.0)
  - fluent-html.md / CLAUDE.md (combinators table + behavior list + aria/forms idioms)
  - htmx.md (behavior list 13→15: show/hide/resetFormOnSuccess)
  - no extractor/eslint README change (zero new Tailwind class surface — display tokens already registered, never emitted into a `class` attr)
impact: high
effort: M
depends_on: []
status: proposed
---

# RFC-A-02: Control-flow & element ergonomics

## Problem

Four genuine core-primitive gaps force apps into hand-rolled boilerplate that the
instruction-set already *almost* covers. Each is verified net-new against the full source
read of `src/control/iteration.ts`, `src/core/tag.ts`, `src/core/behavior-methods.ts`,
`src/elements/forms.ts`, and `CHANGELOG.md` 6.0.0→6.1.1.

1. **No grouping combinator.** `iteration.ts` ships `ForEach`/`ForEachElse`/`ForEachKeyed`/
   `Intersperse`/`Repeat` — every one assumes the list is *already shaped*. Grouping a flat
   list into sections (activity-by-day, tasks-by-status) is re-hand-rolled per app. pm-gui
   `overview/overview.view.ts:205` calls `groupByDay(activity)` — a ~10-LOC consecutive-key
   reducer — then `Div(ForEach(groups, g => DayGroup(g.label, g.items)))`. A kanban board
   (`board.ts:26`) builds `COLUMNS.map(c => ({ ...c, tasks: all.filter(t => t.status === c.status) }))`
   (one `.filter()` pass *per column* — O(n·k)) then renders per column. Two shapes of the
   same missing primitive: full group-by-key and consecutive run-length.

2. **No boolean-gated `aria-current`.** `setAria({ current })` (tag.ts:429) is the only path;
   its value union already exists (`aria-types.ts:70`). But the dominant case — a nav item
   that is `aria-current="page"` **only when active** — forces either a paired
   `.when(active, t => t.setAria({ current: 'page' }))` or an always-on attr. pm-gui `NavItem`
   (`layout.view.ts:198-199`) styles `.when(p.active, …)` but ships **no** `aria-current` at
   all (the semantic is simply dropped because wiring it is a second `.when`).

3. **No positive-polarity editability verb on form controls.** Apps write the double-negative
   `.toggle('readonly', flag)` / `.toggle('disabled', flag)` (~20 sites in ppsport). Worse,
   `<select>` has **no `readonly`** — `.toggle('readonly')` on a `SelectTag` silently does
   nothing, a live foot-gun. The control-correct attribute differs by element (`readonly` for
   input/textarea — value still submits; `disabled` for select), so no base-`Tag` method can
   express it; it must live per-control.

4. **Three missing behaviors.** (a) Shipped `formResetOnSwap` (behavior-methods.ts:125) fires
   `this.reset()` on **every** `htmx:after-swap` — including a 422 validation re-render, wiping
   the user's typed values. Apps hand-write the success-gated variant inline: assessment
   `components.ts:720`, `pre-approved-emails.list.view.ts:107,139`, `admin/events/events.view.ts:365`
   all carry `.addAttribute('hx-on:htmx:after:request','if (event.detail.ctx.response?.status < 300) this.reset()')`.
   (b)/(c) The shipped `toggle` behavior flips **only** `'hidden'` (behavior-methods.ts:87) —
   for a `<div>` overlay that toggles `hidden ↔ flex` it strands the `flex` class; native
   `dialog`/`popover` (6.0/6.1) only cover `<dialog>`, not `<div>` overlays. ~15 sites
   hand-write `.addAttribute('hx-on:click', showModal(id))` two-class show/hide strings.

All four are **core primitive gaps** (not components, not framework glue): a combinator that
emits no HTML, an aria attribute, a control attribute, and library-owned `hx-on` JS — the
exact surface fluent-html already owns. They ship as one convergent control-flow & element
ergonomics surface.

> **Dropped (already shipped — re-proposing would violate §11.6 CONVERGE):** the
> `whenElse(value, thenFn(v), elseFn)` nullable two-branch overload. `tag.ts:266` already
> declares `whenElse<T>(value: T | null | undefined, thenFn: (tag, value: NonNullable<T>) =>
> unknown, elseFn)` and passes the narrowed non-null value into `thenFn` (tag.ts:271); the
> standalone `IfThenElse<T>` value overload does the same. CHANGELOG records both (6.0.0
> whenElse two-branch + nullable IfThen/IfThenElse; 6.1.1 `.when()` `!= null` branching). The
> roadmap re-verify gate ("if it already passes `v`, drop the item") resolves to **drop**.

## Proposed API

### P1 — `ForEachGroup` grouping combinator (`src/control/iteration.ts`)

```ts
// Public overloads — render is ALWAYS the trailing arg (idiom: matches ForEach/ForEachKeyed/Intersperse)
export function ForEachGroup<T, K extends string | number>(
  items: Iterable<T>,
  keyOf: (item: T) => K,
  render: (key: K, group: T[], index: number) => View,
): View;
export function ForEachGroup<T, K extends string | number>(
  items: Iterable<T>,
  keyOf: (item: T) => K,
  options: { consecutive?: boolean },
  render: (key: K, group: T[], index: number) => View,
): View;
// Implementation
export function ForEachGroup<T, K extends string | number>(
  items: Iterable<T>,
  keyOf: (item: T) => K,
  optionsOrRender:
    | { consecutive?: boolean }
    | ((key: K, group: T[], index: number) => View),
  maybeRender?: (key: K, group: T[], index: number) => View,
): View;
```

A **pure View combinator** — emits **no** HTML element, attribute, or Tailwind class of its
own (exactly like `ForEach`/`Intersperse`/`Repeat`). It buckets a flat `Iterable<T>` by
`keyOf`, then calls `render(key, group, index)` **once per distinct key** and returns the
View array. Semantics:

- **Default mode** = full group-by-key: a single `Map<K, T[]>` pass, O(n). A key reappearing
  later in the iterable folds into its existing bucket.
- **`{ consecutive: true }`** = run-length grouping: a new group starts whenever `keyOf`
  differs from the previous item. The **only** mode that can express the `groupByDay` reducer
  pm-gui hand-rolls — a date appearing in two *non-adjacent* runs stays two groups (full
  group-by-key would wrongly merge them).
- **Groups yield in first-seen (insertion) order**; `index` is the **group** ordinal (0-based),
  not the item ordinal.
- `group: T[]` is a concrete array (not an `Iterable`) so callers read `.length` for headers /
  empty checks and feed it straight to an inner `ForEach`.
- **Empty `items` → `[]`** (renders nothing). There is no `ForEachGroupElse` in 6.2.0; for an
  empty state wrap with `IfThenElse(items.length, …)`.

`K extends string | number` keeps Map keys value-comparable and **matches `ForEachKeyed`'s
`keyOf` return type** (convergence). Overload resolution: render-form is listed first; the
impl branches at runtime on `typeof optionsOrRender === "function"`.

### P2 — `Tag.ariaCurrent` (`src/core/tag.ts`, beside `setAria` at tag.ts:429)

```ts
/** The token arm of `aria-current` (the bare-boolean arm is excluded — a shorthand always names a token). */
export type AriaCurrentValue = 'page' | 'step' | 'location' | 'date' | 'time';

// New method on base Tag
ariaCurrent(active?: boolean, value?: AriaCurrentValue): this;
```

Boolean-gated: `active !== false` emits `aria-current="<value>"` (`value` defaults
`'page'`); `active === false` emits **nothing**. That gate is the whole point — it composes
inside an existing `.when(active, …)` styling chain without a paired `.when(!active)`.
`AriaCurrentValue` **reuses the exact union** already in `AriaAttrs.current` (aria-types.ts:70),
minus the bare-boolean arm. `setAria({ current })` stays the general escape hatch for the
idref-free / boolean edge; `ariaCurrent` is THE idiomatic path for the dominant nav-active case.

### P3 — `setEditable` on form controls (`src/elements/forms.ts`)

```ts
// InputTag (forms.ts:15) — value still submits when readonly
setEditable(editable: boolean): this;   // false ⇒ toggle('readonly'); true ⇒ no-op
// TextareaTag (forms.ts:147) — value still submits when readonly
setEditable(editable: boolean): this;   // false ⇒ toggle('readonly'); true ⇒ no-op
// SelectTag (forms.ts:449) — <select> has no `readonly`, so use `disabled`
setEditable(editable: boolean): this;   // false ⇒ toggle('disabled'); true ⇒ no-op
```

**Positive polarity** (argument = the *permission*, not the disability): `editable === false`
adds the attribute, `editable === true` is a no-op (idempotent — builds on the existing
`toggle` machinery, so re-entrant and safe to call twice). It lives **per-control, NOT on base
Tag**, because the disabling attribute differs by element — and that divergence is *inherent
to HTML*: input/textarea `readonly` keeps the value in the submitted form data; `<select>`
`disabled` **omits** the value (no `readonly` exists for select). JSDoc must call out that
submission divergence. Kills the ~20-site double-negative and closes the
`.toggle('readonly')`-on-`<select>`-is-a-no-op foot-gun.

### P4 — three behaviors (`src/core/behavior-methods.ts`, `BehaviorMap` at line 12)

```ts
export type DisplayClass =
  | 'flex' | 'grid' | 'block' | 'inline-flex' | 'inline-block'
  | 'inline' | 'contents' | 'table';

// Added to BehaviorMap:
resetFormOnSuccess: void;
show: { target: Id; display?: DisplayClass };   // display defaults 'flex'
hide: { target: Id; display?: DisplayClass };   // display defaults 'flex'
```

- **`resetFormOnSuccess`** — coexists with shipped `formResetOnSwap` (which fires
  unconditionally). Renders to `hx-on:htmx:after:request="if(event.detail.ctx.response?.status<300)this.reset()"`,
  gating reset on a <300 response so a 422 validation re-render keeps the user's typed values.
  Renderer returns `["htmx:after:request", "if(event.detail.ctx.response?.status<300)this.reset()"]`
  — a fixed library-owned literal, HTML-attribute-escaped at render like every other renderer.
- **`show`** — removes `'hidden'` and adds the `display` class (default `'flex'`); default
  event `'click'`, honoring the existing `ev()` helper. Renderer:
  `["click" via ev, \`${el(target)}.classList.remove('hidden');${el(target)}.classList.add('${display}')\`]`.
- **`hide`** — adds `'hidden'` and removes the `display` class; symmetric to `show`.

`display` MUST be the closed `DisplayClass` union (never a free string) so the token landing
in the `hx-on` JS is a known Tailwind display literal — satisfies §11.4 and honors §11.7's
no-dynamic-class spirit. `show`/`hide` cover the greenfield `<div>`-overlay `hidden ↔ display`
idiom that native `<dialog>`/`popover` do not; `.hxOn()` stays the escape hatch for non-default
hidden mechanisms.

### One convergent surface

- **Group a flat list into sections** → `ForEachGroup` (default = group-by-key; `consecutive` =
  run-length). Distinct from `ForEachKeyed`, which keys individual **rows** by id for HTMX morph
  matching and emits an `id` — `ForEachGroup` buckets into **sections** and emits nothing.
- **Active nav semantic** → `ariaCurrent(active)`; `setAria({ current })` stays only for the
  idref-free / boolean edge.
- **Lock a control** → `setEditable(false)`; the one verb across input/textarea/select.
- **Reset only on success** → `behavior('resetFormOnSuccess')`; `formResetOnSwap` stays the
  unconditional variant.
- **Toggle a `<div>` overlay** → `behavior('show'|'hide', { target })`.

## Worked examples (before → after)

**Grouping — pm-gui `overview.view.ts:205` (consecutive) + `board.ts:26` (group-by-key):**

```ts
// BEFORE — ~10-LOC hand-rolled consecutive-key reducer, then ForEach
const groups = groupByDay(activity);                       // groupByDay deleted entirely
Div(ForEach(groups, g => DayGroup(g.label, g.items)));
// AFTER
Div(ForEachGroup(activity, e => dayLabel(e.date), { consecutive: true },
  (label, items) => DayGroup(label, items)));

// BEFORE — one .filter() pass per column (O(n·k))
COLUMNS.map(c => ({ ...c, tasks: all.filter(t => t.status === c.status) }))
       .forEach(c => render(Column(c.status, c.tasks)));
// AFTER — single O(n) group-by-key pass
ForEachGroup(all, t => t.status, (status, tasks) => Column(status, tasks));
```

**`aria-current` — pm-gui `NavItem` (`layout.view.ts:198-199`):**

```ts
// BEFORE — styling gated on active; NO aria-current (the semantic is simply dropped)
A(p.label).nav(p.cfg).when(p.active, t => t.background('primary-50').textColor('primary'));
// AFTER — one chained call adds the semantic; styling unchanged
A(p.label).nav(p.cfg)
  .ariaCurrent(p.active)                                   // active ⇒ aria-current="page"; inactive ⇒ nothing
  .when(p.active, t => t.background('primary-50').textColor('primary'));
```

**`setEditable` — ppsport (~20 sites):**

```ts
// BEFORE — double-negative; .toggle('readonly') on <select> is a silent no-op
Input().toggle('readonly', isLocked);
Select().toggle('disabled', isLocked);                     // had to remember the different attr
// AFTER — one positive-polarity verb, control-correct attr chosen automatically
Input().setEditable(!isLocked);                            // ⇒ readonly (value still submits)
Select().setEditable(!isLocked);                           // ⇒ disabled (value omitted — JSDoc-noted)
```

**Behaviors — assessment / pre-approved-emails / events + ~15 overlay sites:**

```ts
// BEFORE — inline success-gated reset, copy-pasted 4×
Form(...).addAttribute('hx-on:htmx:after:request',
  'if (event.detail.ctx.response?.status < 300) this.reset()');
// AFTER
Form(...).behavior('resetFormOnSuccess');

// BEFORE — hand-written two-class show/hide string, ~15 sites
Button('Open').addAttribute('hx-on:click', showModal(ids.modal));   // remove hidden + add flex
// AFTER
Button('Open').behavior('show', { target: ids.modal });
Button('Close').behavior('hide', { target: ids.modal });
Button('Open').behavior('show', { target: ids.panel, display: 'grid' });  // non-default display
```

Emitted-output reference (wire format):

```
ForEachGroup(items, keyOf, render)        → (no element; the View[] render returns)
.ariaCurrent(true)                        → aria-current="page"
.ariaCurrent(true, 'step')                → aria-current="step"
.ariaCurrent(false)                       → (nothing)
Input().setEditable(false)                → <input readonly>
Textarea().setEditable(false)             → <textarea readonly>
Select().setEditable(false)               → <select disabled>
.behavior('resetFormOnSuccess')           → hx-on:htmx:after:request="if(event.detail.ctx.response?.status&lt;300)this.reset()"
.behavior('show', { target: ids.modal })  → hx-on:click="document.getElementById('modal').classList.remove('hidden');document.getElementById('modal').classList.add('flex')"
.behavior('hide', { target: ids.modal })  → hx-on:click="document.getElementById('modal').classList.add('hidden');document.getElementById('modal').classList.remove('flex')"
```

## Type-safety story

- **`ForEachGroup`** — `K extends string | number` (closed bound, value-comparable Map keys,
  matches `ForEachKeyed`); `T` inferred; `render`/`keyOf` fully typed; no `any` in the public
  signature, no bare `string`. `group: T[]` is concrete, not `Iterable`, so `.length`/index
  access type-check.
- **`AriaCurrentValue`** — the exact closed union from `AriaAttrs.current` minus the boolean
  arm; a typo (`'pag'`) is a compile error. `active?` is `boolean`.
- **`setEditable(editable: boolean)`** — a single boolean; the per-control attr choice is
  internal, so callers can't misuse `.toggle('readonly')` on a `<select>` anymore.
- **`DisplayClass`** — closed Tailwind display-token union; `display` cannot be a free string,
  so the token reaching the emitted `hx-on` JS is always a known literal (§11.4 + §11.7 spirit).
- **`resetFormOnSuccess`** is `void` (no options) and `show`/`hide` take `{ target: Id; display?:
  DisplayClass }` — `Id` is the existing branded id type, so a raw string target is rejected.

## Migration & compatibility

- **6.1.x (patch):** N/A — adds public surface; cannot ride a patch.
- **6.2.0 (minor): additive.** Every change is a new export (`ForEachGroup`, `AriaCurrentValue`,
  `DisplayClass`), a new method (`ariaCurrent`, three `setEditable`), or a new `BehaviorMap`
  entry (`resetFormOnSuccess`/`show`/`hide`). No existing symbol's signature or output changes.
  `formResetOnSwap`, `toggle`, `setAria`, and `whenElse` are untouched.
- **App migration is mechanical and opt-in:** delete `groupByDay`/per-column `.filter` and call
  `ForEachGroup`; add `.ariaCurrent(active)` to nav items; replace `.toggle('readonly'|'disabled',
  flag)` with `.setEditable(!flag)`; replace the inline success-gated reset and the
  `showModal()`/`hideModal()` `hx-on` strings with the new behaviors. No existing HTML output
  regresses; value materializes only as an app migrates off its bespoke machinery.

## Docs impact (§11.8)

New public surface ⇒ lib README + control-flow/aria/forms docs + JSDoc + htmx behavior list.
**No extractor/eslint README change** — see §11.7 below (display tokens already registered and
never emitted into a `class` attribute).

- **README.md** — (a) control-flow section: add `ForEachGroup` with both modes, the
  `ForEachKeyed` vs `ForEachGroup` contrast callout (rows-keyed-for-morph vs buckets-into-sections),
  and the empty→`[]` note. (b) aria/accessibility note: `ariaCurrent(active?, value?)` as the
  nav-active idiom, `setAria({ current })` as the escape hatch. (c) forms section: `setEditable`
  with the input/textarea-`readonly`-submits vs select-`disabled`-omits divergence. (d) htmx
  behaviors: bump the built-in count 13→15, add `show`/`hide`/`resetFormOnSuccess`.
- **fluent-html.md / CLAUDE.md** — add `ForEachGroup` to the control-flow combinator list; add
  `.ariaCurrent(...)` to the aria idioms; add `.setEditable(...)` to the boolean-attribute /
  forms idioms (alongside `.toggle()`); add `show`/`hide`/`resetFormOnSuccess` to the behavior
  list (13→15).
- **htmx.md** — behavior list 13→15: document `resetFormOnSuccess` (vs `formResetOnSwap`),
  `show`/`hide` (`{ target, display? }`, the `hidden ↔ display` `<div>`-overlay idiom, native
  `<dialog>` for true modals).
- **JSDoc** — on `ForEachGroup` (both overloads, an `@example` mirroring `ForEachKeyed`'s block +
  the explicit ForEachKeyed-contrast + consecutive-vs-default note + empty→`[]`), `AriaCurrentValue`,
  `Tag.ariaCurrent`, all three `setEditable` (each noting its attr + submission semantics),
  `DisplayClass`, and the three new `BehaviorMap` entries (drafted inline above).
- **CHANGELOG.md** — under `[6.2.0] ### ✨ New Features`:
  ```md
  #### Control-flow & element ergonomics (RFC-A-02)
  - **`ForEachGroup(items, keyOf, [options], render)`** — group a flat list into sections;
    default group-by-key, `{ consecutive: true }` for run-length. Pure combinator (emits no
    HTML/classes). Distinct from `ForEachKeyed` (keys rows for morph).
  - **`.ariaCurrent(active?, value?)`** — boolean-gated `aria-current` (default `'page'`);
    nothing when inactive. The nav-active idiom; `setAria({ current })` stays the escape hatch.
  - **`.setEditable(editable)`** on Input/Textarea/Select — positive-polarity lock;
    `false` ⇒ `readonly` (input/textarea, value submits) / `disabled` (select, value omitted).
  - **`behavior('resetFormOnSuccess')`** — reset only on a <300 response (vs unconditional
    `formResetOnSwap`).
  - **`behavior('show'|'hide', { target, display? })`** — two-class `hidden ↔ display`
    (`display` defaults `'flex'`) for `<div>` overlays.
  ```

## Guardrail check (§11.1–11.8)

- **§11.1 zero-deps:** pass — `ForEachGroup` uses native `Map`; the rest reuse in-scope `Tag`/
  behavior primitives. No runtime dependency added.
- **§11.2 ssr-only:** pass — `ForEachGroup` is a synchronous single pass; aria/editable/behaviors
  are synchronous string building. No async on the render path.
- **§11.3 escape-by-default:** pass — `ForEachGroup` emits no attrs/URLs (children escaped
  downstream like any View); `aria-current` value is a closed token; `readonly`/`disabled` are
  bare attrs; behavior JS is a fixed library-owned literal HTML-attribute-escaped at render
  (the `<` in `status<300` becomes `&lt;`). No new XSS sink.
- **§11.4 type-safety:** pass — closed `K extends string | number`, closed `AriaCurrentValue`,
  closed `DisplayClass`, branded `Id` targets, `setEditable(boolean)`. No `any` in any public
  signature, no bare `string` where literals are valid.
- **§11.5 additive-only:** pass — all symbols new; no existing signature or output touched
  (`formResetOnSwap`/`toggle`/`setAria`/`whenElse` untouched). The dropped `whenElse` item is
  already shipped, so nothing regresses.
- **§11.6 instruction-set / CONVERGE:** pass — all four are core primitives (a combinator that
  emits no HTML, an aria attr, a control attr, library-owned `hx-on` JS — no component, no
  framework glue). One `ForEachGroup` (one flag, not two exports) converges the bespoke
  reducer + `ForEach`; one `ariaCurrent` for nav-active (escape hatch retained for the edge);
  one `setEditable` across three controls; `resetFormOnSuccess`/`show`/`hide` each the single
  idiomatic path for their job. No overlap with `ForEachKeyed` (rows vs sections — JSDoc states it).
- **§11.7 class-vocab / extractor-eslint lockstep:** **N/A by construction.** `ForEachGroup`,
  `ariaCurrent`, `setEditable`, `resetFormOnSuccess` emit zero Tailwind classes. `show`/`hide`
  emit `'hidden'`/`'flex'` (and the `DisplayClass` token) only as **arguments to `classList`
  inside an `hx-on` attribute value** — they never land in the element's own `class` attribute,
  so the extractor (which scans emitted `class` strings) needs no new entries. The display
  tokens are **already registered** (`vocab.ts:117 'flex'`, `:170 'hidden'`; `grid`/`block`/etc.
  are existing display `opt()` entries). The closed `DisplayClass` union guarantees no
  interpolated/dynamic class string reaches the emitted JS. No `src/class-vocab/vocab.ts` row,
  no `fluent-html-tailwind-extractor` change, no `fluent-html-eslint-plugin` change.
- **§11.8 guideline/docs-sync:** pass — Docs impact covers every `api_surface` symbol (README,
  fluent-html.md/CLAUDE.md, htmx.md, JSDoc, CHANGELOG).

## Alternatives considered

- **Two exports `ForEachGroupBy` + `ForEachRun`** instead of one `consecutive` flag. Rejected —
  §11.6 prefers one primitive with one option to two near-identical exports; the flag reads
  clearly and keeps the surface minimal.
- **`ForEachGroupElse` (empty-state overload).** Deferred — `IfThenElse(items.length, …)` already
  covers it; adding a 5th iteration export for a one-liner wrapper is scope creep. Documented so
  empty→`[]` isn't mistaken for a bug; a clean additive follow-up if demand appears.
- **`ariaCurrent` as a `setAria` sugar only (no method).** Rejected — the boolean gate (emit
  nothing when inactive) is the value; expressing it via `setAria` still needs the paired
  `.when(!active)`. The method is the convergence.
- **`setReadonly`/`setDisabled` per-control instead of `setEditable`.** Rejected — re-exposes the
  attr-differs-by-element foot-gun (which attr on `<select>`?) and keeps the double-negative.
  `setEditable` is the single positive-polarity verb; the control picks the correct attr.
- **`show`/`hide` migrate overlays to native `<dialog>`/`popover` instead.** Native APIs are the
  right answer for *true modals* — but `show`/`hide` scope to the greenfield `<div>`-overlay
  `hidden ↔ display` case the native top-layer APIs don't cover (inline panels, dropdowns). Low
  controversy; `.hxOn()` is the escape hatch for non-default hidden mechanisms.
- **Reuse `formResetOnSwap` with a `successOnly` option** instead of a new behavior. Rejected —
  the two fire on **different events** (`htmx:after-swap` vs `htmx:after:request`) with different
  JS; a flag would muddy one renderer. Two named behaviors are honest.

## Open questions

- **htmx-4 event-name pinning.** `resetFormOnSuccess` depends on the colon event name
  `htmx:after:request` and the `event.detail.ctx.response?.status` shape (htmx 4). The project
  targets htmx 4, but the literal must be verified against the **pinned** htmx version before
  shipping — wrong on htmx<3-style dash names. Flagged as the one external-contract dependency.
- **`setEditable(false)` submission divergence.** input/textarea `readonly` **submits** the
  value; select `disabled` **omits** it. Inherent to HTML (no `readonly` on `<select>`). Confirm
  the JSDoc warning is sufficient, or whether select should instead emit `disabled` + a paired
  hidden input to preserve submission (rejected here as scope creep / hidden magic).
- **`ForEachGroup` index semantics.** `index` is the **group** ordinal. Confirm no caller expects
  the first-item ordinal; documented to avoid ambiguity.
- **`show`/`hide` default `display: 'flex'`.** Most `<div>` overlays use `flex`; confirm `flex` is
  the right default vs `block`. Either way it's overridable via the `display` option.
