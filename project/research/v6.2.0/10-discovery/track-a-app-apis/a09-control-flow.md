# Track A — App APIs · Control-flow lens (v6.2.0 discovery)

Lens scope: Match / IfThen / IfThenElse / ForEach / ForEachKeyed / ForEachElse / Intersperse / MatchValue usage and gaps; switch/ternary/map that bypass the combinators; missing combinators across two real consumer apps (`pm-gui` v6 template, `planet-positive-sport` v5).

Method: grepped both apps for `.map(...)` spread into children, `switch` returning Tags, ternary view returns, `.when(x)/.when(!x)` forks, and hand-rolled group/index helpers; then verified each against `src/control/*.ts`, `src/elements/forms.ts`, `src/core/tag.ts`, and CHANGELOG 6.0.0→6.1.1.

---

## 1. Standalone `<option>` building from `{value,label}[]` (with selected state) — `Options()` / `Select.options()`

**Problem / evidence.** Building an `<option>` list from a `{ value, label }[]` array and marking the current value `selected` is hand-rolled in **both** apps, every time a `<select>` lives **outside** a typed `Form<T>` builder:

- `planet-positive-sport/src/shared/components/forms/form.ts:82` — `StyledSelect` does `...options.map(o => Option(o.label).setValue(o.value).toggle("selected", o.value === defaultValue))` plus a hand-rolled placeholder `Option`.
- `planet-positive-sport/src/admin/events/events.view.ts:314` — `...participantsOptions.map(o => Option(o.label).setValue(o.value))`.
- `planet-positive-sport/src/admin/projects/projects.edit.view.ts:238` — `...statusOptions.map(o => Option(t(o.label)).setValue(o.value)...)`.
- `pm-gui/src/shared/status-picker.view.ts:41` — `...OPTIONS.map(o => Option(o, opts.from, opts.post(o.to)))` (option-list-from-array shape; here a popover menu, same mapping ergonomics).

The exact "map options + toggle selected on value-match" logic **already exists inside the library** — `forms.ts:396` `f.select()` — but is **only reachable through a bound `Form<T>` builder**. A free-standing `<select>` (filter dropdowns, status pickers, non-schema selects) cannot use it and re-implements it.

**Proposed API.**
```ts
type SelectOptionInput = { value: string; label?: string; disabled?: boolean };

// View helper: emits a list of <option>, marking selected by value-match
function Options(
  items: readonly SelectOptionInput[],
  opts?: { selected?: string | null; placeholder?: string },
): View;

// and/or a method on SelectTag for the common case
class SelectTag {
  options(items: readonly SelectOptionInput[], selected?: string | null): this;
}
```
Emits: `<option value="v">label</option>` per item; `selected` (bare) on the value-match; optional leading disabled placeholder `<option value="" disabled selected>…</option>` when nothing matches. `label` defaults to `value`.

**Before / after** (`StyledSelect`, PPS form.ts):
```ts
// before
Select(
  IfThen(placeholder, ph => Option(ph).setValue("").toggle("disabled").toggle("selected", !hasSelection)),
  ...options.map(o => Option(o.label).setValue(o.value).toggle("selected", o.value === defaultValue)),
)
// after
Select().options(options, defaultValue)            // or Select(Options(options, { selected: defaultValue, placeholder }))
```

**Already in lib?** No standalone form. The mapping exists privately in `f.select` (forms.ts:396); not exposed. `Form<T>` 6.1.x shipped, but only for schema-bound forms — not this case.

**Value:** high (recurs across both apps; collapses the most copied form snippet). **Effort:** small.

---

## 2. `ForEachGroup` — group items then render per-group sections

**Problem / evidence.** The "group a flat list, then render a header + the group's rows" pattern is hand-rolled as a bespoke reducer followed by nested `ForEach`:

- `pm-gui/src/app/overview/overview.view.ts:205,229-238` — `groupByDay(activity)` (a hand-written consecutive-key reducer) → `ForEach(groups, g => DayGroup(g.label, g.items))` → inside, `ForEach(items, ActivityRow)`. The `groupByDay` helper (10 LOC) exists only to feed the render.
- `pm-gui/src/pm-core/board.ts:26` — `COLUMNS.map(c => ({ ...c, tasks: all.filter(t => t.status === c.status) }))` then rendered column-by-column (group-by-status before render).
- 66 `.reduce(...)` sites in PPS, several building per-key buckets for sectioned rendering.

There is no grouping combinator; `ForEach`/`ForEachKeyed`/`ForEachElse` all assume the list is already shaped.

**Proposed API.**
```ts
// Groups by key (insertion-ordered groups), then maps each group to a View.
function ForEachGroup<T, K extends string | number>(
  items: Iterable<T>,
  keyOf: (item: T) => K,
  render: (key: K, group: T[], index: number) => View,
): View;
```
Pure composition (no HTML of its own) — returns `render()` per distinct key in first-seen order. Pairs naturally with `ForEach` for the inner rows. (A `consecutive: true` option could match `groupByDay`'s run-length behavior; default is full group-by-key.)

**Before / after** (`ActivityCard`):
```ts
// before
const groups = groupByDay(activity);                       // 10-LOC hand-rolled reducer
Div(ForEach(groups, g => DayGroup(g.label, g.items)))
// after
Div(ForEachGroup(activity, e => dayLabel(e.date), (label, items) => DayGroup(label, items)))
```

**Already in lib?** No. CHANGELOG 6.0.0→6.1.1 added `ForEachKeyed`/`ForEachElse`/`Intersperse`/`Repeat` but no grouping.

**Value:** medium (strong in pm-gui; grouping reducers are generic boilerplate, but more concentrated in one app). **Effort:** small.

---

## 3. `HiddenFields(record)` — emit hidden `<input>`s from a `Record<string,string>`

**Problem / evidence.** Spreading a record of name→value into hidden inputs recurs:

- `pm-gui/src/shared/attachments.view.ts:29` — `...Object.entries(ctx.hidden).map(([k, v]) => Input().setType("hidden").setName(k).setValue(v))`.
- `pm-gui/src/app/scope/scope.comments.view.ts:22` — identical `Object.entries(hidden).map(...)` helper.
- Plus ~8 individual `Input().setType("hidden").setName(...).setValue(...)` lines in `scope.comments.view.ts`, `decisions.view.ts:91-92`, `scope.authoring.view.ts:59-113`.

**Proposed API.**
```ts
function HiddenFields(fields: Record<string, string | number | boolean>): View; // one hidden <input> per entry
```
Emits `<input type="hidden" name="k" value="v">` per entry (skips `undefined`; stringifies). Naming mirrors `f.hidden(name, value)` from the form builder but works for an arbitrary record outside a typed form.

**Before / after** (`attachments.view.ts`):
```ts
// before
...Object.entries(ctx.hidden).map(([k, v]) => Input().setType("hidden").setName(k).setValue(v)),
// after
HiddenFields(ctx.hidden),
```

**Already in lib?** No standalone helper. `Form<T>` has `f.hidden(name, value)` for a single typed field (6.1.x), but not a record-spread for untyped/dynamic field bags (the attachments/comments host passes `Record<string,string>`).

**Value:** medium (clear duplication in pm-gui; smaller surface than #1). **Effort:** small.

---

## Non-findings (verified already covered / not worth it)

- **`.when(active, …).when(!active, …)` forks** (status-picker.view.ts:63; PPS language.view.ts:46, questionnaire.view.ts:128, assessment.components.ts:806, sdg.view.ts:124, +many). Looks like a missing two-branch tag modifier, but **`Tag.whenElse(cond, then, else)` already ships** (CHANGELOG 6.0.0; tag.ts:265). This is a usage/lint opportunity, not a new API — an ESLint rule "prefer `.whenElse` over `.when(x)/.when(!x)`" would be the right home, not core.
- **`switch (status) { return Span(...).background(token) }`** (pm-bits.ts PriorityPill/StatusGlyph; PPS assessment.components.ts:256 sectionStatusDot; loc.ids.ts:142). Expressible today: `Match(status, { … })` for distinct Tags, or `base.background(MatchValue(status, { complete: "green-500", … }))` for token-only variance (MatchValue ships, match-value.ts). The literal-per-branch form is partly deliberate (keeps the Tailwind extractor seeing each class). No new API warranted.
- **`ForEach((item, i) => f(item, i, arr.length))`** (PPS report-content.components.ts:552 passes `partners.length` explicitly). A 3rd `array` callback param would mirror `Array.map`, but the iterable overload can't supply a length generally and the workaround (`arr.length` in scope) is one token. Low value, skipped.

---

## Top picks
- **`Options()` / `Select.options(items, selected?)`** — exposes the option-mapping-with-selected logic that already lives privately in `f.select`; kills the single most-copied form snippet across both apps. High / small.
- **`ForEachGroup(items, keyOf, render)`** — removes hand-rolled group reducers feeding sectioned lists (overview activity, board columns). Medium / small.
- **`HiddenFields(record)`** — record-spread sibling of `f.hidden`; removes the repeated `Object.entries(...).map(Input hidden)`. Medium / small.
