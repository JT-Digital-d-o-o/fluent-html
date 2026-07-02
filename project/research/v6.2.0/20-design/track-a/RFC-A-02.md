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
  - "DisplayClass (type — closed Tailwind display-token union; 'table' intentionally excluded)"
  - "BEHAVIOR_DISPLAY_SAFELIST (forced-safelist export — DisplayClass tokens ∪ 'hidden')"
  - "formResetOnSwap renderer event fixed 'htmx:after-swap' → 'htmx:after:swap' (htmx-4 correct; behavioral fix within v6, see §Migration)"
breaking: additive-plus-one-behavior-fix
ships_to: "6.2.0"
guardrails_checked: [zero-deps, ssr-only, escape-by-default, type-safety, additive-only, instruction-set, class-vocab-sync, guideline-sync]
guideline_updates:
  - lib README/docs/JSDoc (control-flow combinators section, aria/forms reference, htmx behavior list 13→15, CHANGELOG 6.2.0)
  - fluent-html.md / CLAUDE.md (combinators table + behavior list + aria/forms idioms)
  - htmx.md (behavior list 13→15: show/hide/resetFormOnSuccess; note formResetOnSwap event-name fix)
  - "EXTRACTOR README + safelist: ../fluent-html-tailwind-extractor must emit BEHAVIOR_DISPLAY_SAFELIST (renderer-default 'flex' + always-added 'hidden' are runtime-applied via classList and never appear as fluent calls/source literals) — lockstep with src/class-vocab/vocab.ts"
  - "ESLINT README + rule: ../fluent-html-eslint-plugin gains/extends a convergence rule flagging `.toggle('readonly'|'disabled', x)` on a form control toward `.setEditable(!x)`"
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
   `this.reset()` on **every** swap — including a 422 validation re-render, wiping
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

**Convergence is enforced**, not merely claimed: a new ESLint rule (or an extension of
`prefer-toggle`) in `../fluent-html-eslint-plugin` flags `.toggle('readonly'|'disabled', x)`
on a form-control receiver toward `.setEditable(!x)` (see §11.6 / §11.7 lockstep). Without
that rule the double-negative idiom persists and "one convergent verb" is unenforced — so it
ships with this RFC, not as a follow-up.

### P4 — three behaviors (`src/core/behavior-methods.ts`, `BehaviorMap` at line 12)

```ts
// 'table' is INTENTIONALLY EXCLUDED — no cited overlay uses display:table, it has no
// vocab row today, and including it would widen the forced-safelist hole for zero benefit.
export type DisplayClass =
  | 'flex' | 'grid' | 'block' | 'inline-flex' | 'inline-block'
  | 'inline' | 'contents';

/** Default overlay display for `show`/`hide` — a NAMED constant, not a magic literal. Overridable via `display`. */
export const DEFAULT_OVERLAY_DISPLAY: DisplayClass = 'flex';

/**
 * Forced-safelist for the show/hide behaviors. These tokens are applied at RUNTIME via
 * `classList.add()` inside `hx-on` JS — they are invisible to the Tailwind extractor's
 * fluent-call + source-literal scan, so the extractor MUST emit them unconditionally.
 * Kept in lockstep with src/class-vocab/vocab.ts and ../fluent-html-tailwind-extractor.
 */
export const BEHAVIOR_DISPLAY_SAFELIST = [
  'flex', 'grid', 'block', 'inline-flex', 'inline-block', 'inline', 'contents', 'hidden',
] as const;

// Added to BehaviorMap:
resetFormOnSuccess: void;
show: { target: Id; display?: DisplayClass };   // display defaults DEFAULT_OVERLAY_DISPLAY ('flex')
hide: { target: Id; display?: DisplayClass };   // display defaults DEFAULT_OVERLAY_DISPLAY ('flex')
```

- **`resetFormOnSuccess`** — coexists with shipped `formResetOnSwap` (which fires
  unconditionally). Renders to `hx-on:htmx:after:request="if(event.detail.ctx.response?.status<300)this.reset()"`,
  gating reset on a <300 response so a 422 validation re-render keeps the user's typed values.
  Renderer returns `["htmx:after:request", "if(event.detail.ctx.response?.status<300)this.reset()"]`
  — a fixed library-owned literal, HTML-attribute-escaped at render like every other renderer.
  The colon event name and the `event.detail.ctx.response.status` shape are **htmx-4-correct**
  (verified against four.htmx.org/reference/events/htmx-after-request).
- **`show`** — removes `'hidden'` and adds the `display` class (default `DEFAULT_OVERLAY_DISPLAY`);
  default event `'click'`, honoring the existing `ev()` helper. Renderer:
  `["click" via ev, \`${el(target)}.classList.remove('hidden');${el(target)}.classList.add('${display}')\`]`.
- **`hide`** — adds `'hidden'` and removes the `display` class; symmetric to `show`.

**`formResetOnSwap` event-name fix (lockstep correctness).** The SHIPPED `formResetOnSwap`
renderer emits `htmx:after-swap` (dash — htmx 2/3) at behavior-methods.ts:126. Under htmx 4
(this project's pinned target) the event is `htmx:after:swap` (colons), so the shipped behavior
**silently never fires**. This RFC fixes the renderer to `htmx:after:swap` in the same change
that adds `resetFormOnSuccess`, so the codebase does not ship two reset behaviors where the
older one is dead under htmx 4. This is a one-line behavioral fix (an attribute-name string),
not a signature change — flagged honestly in `breaking:` and §Migration as the single non-purely-
additive line in this RFC.

`display` MUST be the closed `DisplayClass` union (never a free string) so the token landing
in the `hx-on` JS is a known Tailwind display literal — satisfies §11.4. But unlike the other
four primitives, `show`/`hide` are **not** §11.7-N/A: the renderer-default `'flex'` and the
always-added `'hidden'` are applied at runtime via `classList` and never appear as a fluent
call or a source literal, so the extractor cannot see them — they are force-safelisted via
`BEHAVIOR_DISPLAY_SAFELIST` (see §11.7). `show`/`hide` cover the greenfield `<div>`-overlay
`hidden ↔ display` idiom that native `<dialog>`/`popover` do not; `.hxOn()` stays the escape
hatch for non-default hidden mechanisms.

### One convergent surface

- **Group a flat list into sections** → `ForEachGroup` (default = group-by-key; `consecutive` =
  run-length). Distinct from `ForEachKeyed`, which keys individual **rows** by id for HTMX morph
  matching and emits an `id` — `ForEachGroup` buckets into **sections** and emits nothing.
- **Active nav semantic** → `ariaCurrent(active)`; `setAria({ current })` stays only for the
  idref-free / boolean edge.
- **Lock a control** → `setEditable(false)`; the one verb across input/textarea/select,
  **eslint-enforced** against the `.toggle('readonly'|'disabled')` double-negative.
- **Reset only on success** → `behavior('resetFormOnSuccess')`; `formResetOnSwap` stays the
  unconditional variant (now also htmx-4-correct after the event-name fix).
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
Input().toggle('readonly', isLocked);                      // ⚠ eslint: prefer .setEditable(!isLocked)
Select().toggle('disabled', isLocked);                     // ⚠ eslint: prefer .setEditable(!isLocked)
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
.behavior('formResetOnSwap')              → hx-on:htmx:after:swap="this.reset()"   (was htmx:after-swap — fixed)
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
- **`DisplayClass`** — closed Tailwind display-token union (`'table'` excluded); `display`
  cannot be a free string, so the token reaching the emitted `hx-on` JS is always a known,
  safelisted literal (§11.4 + §11.7).
- **`resetFormOnSuccess`** is `void` (no options) and `show`/`hide` take `{ target: Id; display?:
  DisplayClass }` — `Id` is the existing branded id type, so a raw string target is rejected.

## Migration & compatibility

- **6.1.x (patch):** N/A — adds public surface; cannot ride a patch.
- **6.2.0 (minor): additive + one behavioral fix.** Every new symbol is additive (`ForEachGroup`,
  `AriaCurrentValue`, `DisplayClass`, `DEFAULT_OVERLAY_DISPLAY`, `BEHAVIOR_DISPLAY_SAFELIST`,
  `ariaCurrent`, three `setEditable`, `resetFormOnSuccess`/`show`/`hide`). The **one non-purely-
  additive change** is the `formResetOnSwap` renderer event-name fix `htmx:after-swap` →
  `htmx:after:swap`. Under the project's pinned htmx 4 the old dash name never fired, so this is a
  bug-fix that turns a dead behavior live — but it IS an output change for the `formResetOnSwap`
  attribute, so it is marked honestly (not hidden under "additive"). v6 is greenfield (no v5 back-
  compat owed), and any app still on htmx 2/3 with a dash-name reset behavior must repin; that is
  the expected htmx-4 migration, not a fluent-html regression. `toggle`, `setAria`, and `whenElse`
  are untouched.
- **Extractor/eslint lockstep is part of this change, not optional:** `BEHAVIOR_DISPLAY_SAFELIST`
  is added to `src/class-vocab/vocab.ts`'s forced-safelist surface and emitted by
  `../fluent-html-tailwind-extractor`; the `.setEditable` convergence rule lands in
  `../fluent-html-eslint-plugin`. Both ship in the same PR.
- **App migration is mechanical and opt-in:** delete `groupByDay`/per-column `.filter` and call
  `ForEachGroup`; add `.ariaCurrent(active)` to nav items; replace `.toggle('readonly'|'disabled',
  flag)` with `.setEditable(!flag)` (the eslint rule now nudges this); replace the inline
  success-gated reset and the `showModal()`/`hideModal()` `hx-on` strings with the new behaviors.
  No existing HTML output regresses except the intentional `formResetOnSwap` event-name fix.

## Docs impact (§11.8)

New public surface ⇒ lib README + control-flow/aria/forms docs + JSDoc + htmx behavior list,
**plus** extractor + eslint README/rule changes (see §11.7 — the earlier draft's "no
extractor/eslint README change" line was wrong and is removed).

- **README.md** — (a) control-flow section: add `ForEachGroup` with both modes, the
  `ForEachKeyed` vs `ForEachGroup` contrast callout (rows-keyed-for-morph vs buckets-into-sections),
  and the empty→`[]` note. (b) aria/accessibility note: `ariaCurrent(active?, value?)` as the
  nav-active idiom, `setAria({ current })` as the escape hatch. (c) forms section: `setEditable`
  with the input/textarea-`readonly`-submits vs select-`disabled`-omits divergence. (d) htmx
  behaviors: bump the built-in count 13→15, add `show`/`hide`/`resetFormOnSuccess`; note the
  `formResetOnSwap` event-name fix.
- **fluent-html.md / CLAUDE.md** — add `ForEachGroup` to the control-flow combinator list; add
  `.ariaCurrent(...)` to the aria idioms; add `.setEditable(...)` to the boolean-attribute /
  forms idioms (alongside `.toggle()`); add `show`/`hide`/`resetFormOnSuccess` to the behavior
  list (13→15).
- **htmx.md** — behavior list 13→15: document `resetFormOnSuccess` (vs `formResetOnSwap`),
  `show`/`hide` (`{ target, display? }`, the `hidden ↔ display` `<div>`-overlay idiom, native
  `<dialog>` for true modals), and the `formResetOnSwap` `htmx:after-swap → htmx:after:swap` fix.
- **fluent-html-tailwind-extractor/README.md** — document `BEHAVIOR_DISPLAY_SAFELIST`: the
  show/hide runtime tokens (`DisplayClass` ∪ `hidden`) the extractor force-emits because they are
  applied via `classList` in `hx-on` JS and are invisible to the fluent-call + source-literal scan.
- **fluent-html-eslint-plugin/README.md** — document the new convergence rule steering
  `.toggle('readonly'|'disabled', x)` on a form control toward `.setEditable(!x)`.
- **JSDoc** — on `ForEachGroup` (both overloads, an `@example` mirroring `ForEachKeyed`'s block +
  the explicit ForEachKeyed-contrast + consecutive-vs-default note + empty→`[]`), `AriaCurrentValue`,
  `Tag.ariaCurrent`, all three `setEditable` (each noting its attr + submission semantics),
  `DisplayClass` (the `'table'`-excluded rationale), `DEFAULT_OVERLAY_DISPLAY`,
  `BEHAVIOR_DISPLAY_SAFELIST`, and the three new `BehaviorMap` entries (drafted inline above).
- **CHANGELOG.md** — under `[6.2.0] ### ✨ New Features` + a `### 🐛 Fixes` line:
  ```md
  #### Control-flow & element ergonomics (RFC-A-02)
  - **`ForEachGroup(items, keyOf, [options], render)`** — group a flat list into sections;
    default group-by-key, `{ consecutive: true }` for run-length. Pure combinator (emits no
    HTML/classes). Distinct from `ForEachKeyed` (keys rows for morph).
  - **`.ariaCurrent(active?, value?)`** — boolean-gated `aria-current` (default `'page'`);
    nothing when inactive. The nav-active idiom; `setAria({ current })` stays the escape hatch.
  - **`.setEditable(editable)`** on Input/Textarea/Select — positive-polarity lock;
    `false` ⇒ `readonly` (input/textarea, value submits) / `disabled` (select, value omitted).
    New eslint rule steers `.toggle('readonly'|'disabled')` toward it.
  - **`behavior('resetFormOnSuccess')`** — reset only on a <300 response (vs unconditional
    `formResetOnSwap`).
  - **`behavior('show'|'hide', { target, display? })`** — two-class `hidden ↔ display`
    (`display` defaults `'flex'`) for `<div>` overlays. Runtime display tokens are force-safelisted
    (`BEHAVIOR_DISPLAY_SAFELIST`).

  ### 🐛 Fixes
  - **`behavior('formResetOnSwap')`** now emits the htmx-4 event `htmx:after:swap` (was
    `htmx:after-swap`, which never fired under htmx 4).
  ```

## Guardrail check (§11.1–11.8)

- **§11.1 zero-deps:** pass — `ForEachGroup` uses native `Map`; the rest reuse in-scope `Tag`/
  behavior primitives. No runtime dependency added.
- **§11.2 ssr-only:** pass — `ForEachGroup` is a synchronous single pass; aria/editable/behaviors
  are synchronous string building. No async on the render path.
- **§11.3 escape-by-default:** pass — `ForEachGroup` emits no attrs/URLs (children escaped
  downstream like any View); `aria-current` value is a closed token; `readonly`/`disabled` are
  bare attrs; behavior JS is a fixed library-owned literal HTML-attribute-escaped at render
  (the `<` in `status<300` becomes `&lt;`); `show`/`hide` route the `Id` target through `el()` →
  `escapeJs()` and `display` is a closed union, so no free string reaches the JS. No new XSS sink.
- **§11.4 type-safety:** pass — closed `K extends string | number`, closed `AriaCurrentValue`,
  closed `DisplayClass` (`'table'` excluded), branded `Id` targets, `setEditable(boolean)`. No
  `any` in any public signature, no bare `string` where literals are valid.
- **§11.5 additive-only:** **pass with one declared behavioral fix.** All new symbols are additive;
  the sole output change is the intentional `formResetOnSwap` `htmx:after-swap → htmx:after:swap`
  event-name fix (a dead-under-htmx-4 behavior turned live). Declared in `breaking:` and §Migration
  — not smuggled under "additive." Nothing else regresses.
- **§11.6 instruction-set / CONVERGE:** pass — all four are core primitives (a combinator that
  emits no HTML, an aria attr, a control attr, library-owned `hx-on` JS — no component, no
  framework glue). One `ForEachGroup` (one flag, not two exports) converges the bespoke
  reducer + `ForEach`; one `ariaCurrent` for nav-active (escape hatch retained for the edge);
  one `setEditable` across three controls **with an eslint rule that enforces the convergence**
  (steering the `.toggle('readonly'|'disabled')` double-negative toward it — so the claim is
  enforced, not aspirational); `resetFormOnSuccess`/`show`/`hide` each the single idiomatic path
  for their job, and the `formResetOnSwap` fix ensures the two reset behaviors are both live so
  the convergence is honest. No overlap with `ForEachKeyed` (rows vs sections — JSDoc states it).
- **§11.7 class-vocab / extractor-eslint lockstep:** pass — **handled, NOT N/A.** `ForEachGroup`,
  `ariaCurrent`, `setEditable`, `resetFormOnSuccess` emit **zero** Tailwind classes — those four
  are genuinely §11.7-clean. `show`/`hide` are different and the earlier draft's "N/A by
  construction" claim was **false**: they apply `'hidden'` + a `DisplayClass` token at RUNTIME via
  `classList.add()` inside `hx-on` JS, which the extractor (fluent-call + source-literal scan,
  never `hx-on` JS) cannot see. The renderer-default `'flex'` and always-added `'hidden'` never
  appear as a fluent call or source literal, so they are NOT incidentally safelisted. Resolution
  (in lockstep across all three packages):
  1. **Drop `'table'` from `DisplayClass`** — no cited overlay uses `display:table`, it has no
     vocab row today (vocab.ts has `opt("flex")`, `stat("grid")`, `stat("block")`,
     `stat("inlineFlex")`, `stat("inlineBlock")`, `stat("inline")`, `stat("contents")`,
     `stat("hidden")` — but nothing for `table`), and including it would widen the hole for zero
     benefit. The remaining seven display tokens all already have vocab rows.
  2. **Force-safelist `BEHAVIOR_DISPLAY_SAFELIST`** = the seven `DisplayClass` tokens ∪ `'hidden'`,
     so the renderer-default `'flex'` and the always-added `'hidden'` are emitted regardless of
     whether the app independently calls `.flex()`/`.hidden()`. This is registered in
     `src/class-vocab/vocab.ts`'s forced-safelist surface and **emitted by**
     `../fluent-html-tailwind-extractor` (a new code path that force-lists these eight literals),
     kept in lockstep. No `'table'` row is needed (it is dropped, not added).
  3. **Flip the docs lines** that said "no extractor/eslint README change" — both the extractor
     README (BEHAVIOR_DISPLAY_SAFELIST) and the eslint README (`.setEditable` convergence rule)
     change. `api_surface`/`guideline_updates` updated accordingly.
  The closed `DisplayClass` union still guarantees no interpolated/dynamic class string reaches the
  emitted JS; the only widening over the literal scan is the eight force-listed tokens, which are
  fixed library-owned literals. §11.7 holds because the runtime tokens are now guaranteed in the
  safelist.
- **§11.8 guideline/docs-sync:** pass — Docs impact covers every `api_surface` symbol (README,
  fluent-html.md/CLAUDE.md, htmx.md, **extractor README**, **eslint README**, JSDoc, CHANGELOG).

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
- **Keep `'table'` in `DisplayClass`.** Rejected — `display:table` is unused by any cited overlay,
  has no vocab row, and would force adding a `stat("table","table")` row solely to widen the
  forced-safelist. Converging on the seven tokens overlays actually use (`flex`/`grid`/`block` cover
  every cited site) is the minimal, lockstep-clean surface. `.hxOn()` remains the escape hatch if a
  table-display overlay ever appears.
- **`show`/`hide` rely on the extractor's literal source scan (no force-safelist).** Rejected — that
  rescues only an EXPLICIT `display: 'grid'` passed in source; the renderer-default `'flex'` and
  always-added `'hidden'` never appear in source, so overlays going exclusively through
  `behavior('show'/'hide')` would `classList.add('flex')`/`add('hidden')` with no CSS backing and
  silently fail to display. The force-safelist is mandatory, not optional.
- **`show`/`hide` migrate overlays to native `<dialog>`/`popover` instead.** Native APIs are the
  right answer for *true modals* — but `show`/`hide` scope to the greenfield `<div>`-overlay
  `hidden ↔ display` case the native top-layer APIs don't cover (inline panels, dropdowns). Low
  controversy; `.hxOn()` is the escape hatch for non-default hidden mechanisms.
- **Reuse `formResetOnSwap` with a `successOnly` option** instead of a new behavior. Rejected —
  the two fire on **different events** (`htmx:after:swap` vs `htmx:after:request`) with different
  JS; a flag would muddy one renderer. Two named behaviors are honest — and the `formResetOnSwap`
  event-name fix makes both live under htmx 4.
- **Leave `formResetOnSwap` as `htmx:after-swap` and only note it as pre-existing-broken.**
  Rejected — shipping a new correct reset behavior next to a silently-dead one is a CONVERGE trap;
  fixing the one-line event name in lockstep is cheaper than documenting the foot-gun forever.

## Open questions

*(All shipping-blocking open questions from the draft are now RESOLVED in the body — none remain
to gate the ship.)*

- **RESOLVED — htmx-4 event-name pinning.** `resetFormOnSuccess`'s `htmx:after:request` + the
  `event.detail.ctx.response.status` shape are verified correct against four.htmx.org. The shipped
  `formResetOnSwap` was wrong (`htmx:after-swap`) and is fixed to `htmx:after:swap` in this RFC.
- **RESOLVED — `show`/`hide` default display.** Pinned to the named constant
  `DEFAULT_OVERLAY_DISPLAY = 'flex'` (overridable via `display`), not an inline magic literal.
- **RESOLVED — `'table'` in `DisplayClass`.** Dropped; the union is the seven overlay-used tokens,
  all vocab-backed and force-safelisted.
- **Standing note (non-blocking) — `setEditable(false)` submission divergence.** input/textarea
  `readonly` **submits** the value; select `disabled` **omits** it. Inherent to HTML (no `readonly`
  on `<select>`). JSDoc warns explicitly; a `disabled`-select + paired hidden input to preserve
  submission was considered and rejected as scope creep / hidden magic.
- **Standing note (non-blocking) — `ForEachGroup` index semantics.** `index` is the **group**
  ordinal, documented in JSDoc to avoid confusion with the item ordinal.

## Adversary review & resolutions

Verdict: **survives-with-changes** (confidence 0.72). Killer objection: §11.7 was *false*-by-
construction, not *N/A*-by-construction — `show`/`hide` apply `'hidden'` + a `DisplayClass` token at
runtime via `classList.add()`, invisible to the extractor; the renderer-default `'flex'`, always-
added `'hidden'`, and the entirely-unregistered `'table'` token are extractor-unresolvable classes
§11.7 forbids. Each required change and its resolution:

1. **Rewrite §11.7 — drop "N/A by construction"; state the runtime tokens MUST be force-safelisted.**
   *Resolved.* §11.7 now reads **pass-handled-not-N/A**: it explicitly separates the four zero-class
   primitives (genuinely clean) from `show`/`hide`, states the extractor cannot see `classList`
   tokens in `hx-on` JS, and mandates the force-safelist. The false claim is removed and called out
   as removed.

2. **Register a forced-safelist covering the full DisplayClass union ∪ `'hidden'`; add the missing
   `table` vocab row; do it in lockstep across vocab + extractor + eslint; flip the "no
   extractor/eslint README change" line.**
   *Resolved with a deliberate substitution* (per required_change 3's "default to dropping"): rather
   than add a `table` vocab row, `'table'` is **dropped from `DisplayClass`** (change 3), so the
   safelist is the seven remaining tokens ∪ `'hidden'`, all of which already have vocab rows. The new
   `BEHAVIOR_DISPLAY_SAFELIST` export is registered in `src/class-vocab/vocab.ts` and **emitted by**
   `../fluent-html-tailwind-extractor` in lockstep. The "no extractor/eslint README change" line is
   removed from `api_surface`, `guideline_updates`, Docs impact, and §11.7; extractor + eslint README
   updates are now listed.

3. **Either drop `'table'` from `DisplayClass` or justify+register it. Default to dropping.**
   *Resolved — dropped.* `DisplayClass` is now `'flex' | 'grid' | 'block' | 'inline-flex' |
   'inline-block' | 'inline' | 'contents'`. Rationale (no overlay uses `display:table`, no vocab row,
   widens the hole) is in the type comment, §11.7, and Alternatives. This removes the need for a
   `stat("table","table")` row entirely.

4. **Resolve the form-reset convergence/correctness smell — fix `formResetOnSwap`'s event name to
   `htmx:after:swap` (lockstep) or note it pre-existing-broken; do not ship two reset behaviors where
   one never fires.**
   *Resolved — fixed.* The `formResetOnSwap` renderer is changed `htmx:after-swap → htmx:after:swap`
   in the same RFC, making both reset behaviors live under htmx 4. Flagged honestly in `breaking:`,
   §Migration, §11.5, the wire-format reference, CHANGELOG `### 🐛 Fixes`, and Alternatives (where the
   "just note it broken" option is explicitly rejected).

5. **Resolve the `show`/`hide` default in the body, not as an open question — pin to a named
   constant.**
   *Resolved.* `DEFAULT_OVERLAY_DISPLAY: DisplayClass = 'flex'` is exported and used by both
   renderers; the Open questions section marks it RESOLVED rather than leaving it dangling.

6. **Add/extend an ESLint rule flagging `.toggle('readonly'|'disabled', x)` toward `.setEditable(!x)`;
   else downgrade §11.6 to "pass with follow-up."**
   *Resolved — rule added, not deferred.* The convergence rule ships in `../fluent-html-eslint-plugin`
   with this RFC (P3 body, §11.6, Docs impact eslint README, `guideline_updates`, CHANGELOG). §11.6
   therefore stays **pass** (enforced, not aspirational) — the worked example shows the lint hint, and
   §11.7 lockstep covers the eslint package.
