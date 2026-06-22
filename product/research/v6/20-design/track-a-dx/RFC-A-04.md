---
id: RFC-A-04
track: A
title: "Control-flow primitives: ForEachOr + Tag.whenElse"
resolves: [F-A-022, F-A-027]
api_surface: ["ForEachOr()", "Tag.prototype.whenElse()"]
breaking: additive
guardrails_checked: [zero-deps, ssr-only, escape-by-default, type-safety, backward-compat]
guideline_updates: ["web-development/CLAUDE.md", "web-development/fluent-html.md"]
impact: high
effort: S
depends_on: []
status: proposed
---

# RFC-A-04: Control-flow primitives — `ForEachOr` + `Tag.whenElse`

## Problem

Two two-branch idioms are missing, and apps reimplement each by pairing two single-branch calls with complementary conditions that must be kept in sync by hand.

**1. List-or-empty (`F-A-022`).** Every list view pairs two `IfThen` calls — one for the list, one for the empty state. 307 `IfThen(…length > 0)` + 70 `IfThen(…length === 0)` call-sites across 9 apps; the plurality are paired. Real, verbatim, on consecutive lines:

```ts
// ttl/src/admin/views/projects-list.view.ts:157-162
IfThen(projects.length > 0, () =>
  ProjectsTable({ projects }),
),
IfThen(projects.length === 0, () =>
  EmptyState(),
),
```

The two conditions are one decision (`projects.length > 0` vs `=== 0`) split across two statements. Drift is a silent bug: change one threshold and the list and empty state can both render, or neither.

**2. Two-branch fluent modifier (`F-A-027`).** `Tag.when(cond, fn)` is single-branch; to style the false case apps chain `.when(!cond, fn2)`. 91+ confirmed pairs across 9 apps — every active/inactive, selected/unselected, open/closed state. Real, verbatim:

```ts
// ttl/src/analytics/analytics.view.ts:59-60
.when(isActive, t => t.background("accent").textColor("slate-950"))
.when(!isActive, t => t.background("slate-800").textColor("slate-400").border().borderColor("slate-700").on("hover", h => h.background("slate-700")).transition("colors"))
```

`isActive` is evaluated twice; the active/inactive styles read as two statements but are one branch decision; nullable narrowing (`.when(value, (t, v) => …)`) cannot be reused in the false branch.

Both findings have a sibling two-branch primitive that already exists (`IfThenElse` for `IfThen`), proving the shape is idiomatic — it is simply absent for `ForEach` and for `Tag.when`.

## Proposed API

Two additive symbols. `View` and `Thunk<T>` are the existing types from `src/core/types.ts` (`View = Tag | string | RawString | View[]`, `Thunk<T> = () => T`).

### `ForEachOr` — `src/control/iteration.ts`

Mirrors `ForEach`'s three input shapes (iterable / count / range), each gaining a trailing `emptyView` thunk. The iterable overload is the one apps need; count/range are added for surface symmetry with `ForEach`.

```ts
// Iterable — renders the mapped items, or emptyView() when the iterable yields nothing
export function ForEachOr<T>(
  items: Iterable<T>,
  renderItem: (item: T, index: number) => View,
  emptyView: Thunk<View>
): View;
// Count — emptyView() when high <= 0
export function ForEachOr(
  high: number,
  renderItem: (index: number) => View,
  emptyView: Thunk<View>
): View;
// Range — emptyView() when low >= high
export function ForEachOr(
  low: number,
  high: number,
  renderItem: (index: number) => View,
  emptyView: Thunk<View>
): View;
```

Semantics: non-empty → identical to the matching `ForEach` call; empty → `emptyView()`. "Empty" = the iterable produces zero items (array `length === 0`, or a count/range with no iterations). Arrays are length-checked without iterating; non-array iterables are materialized once (same cost as `ForEach`, no double-drain).

### `Tag.whenElse` — `src/core/tag.ts`

The two-branch counterpart to `when`, mirroring `when`'s boolean and nullable-narrowing overloads (which mirror `IfThen`/`IfThenElse`).

```ts
class Tag {
  // Nullable: thenFn receives the narrowed non-null value; elseFn gets the bare tag
  whenElse<T>(
    condition: T | null | undefined,
    thenFn: (tag: this, value: NonNullable<T>) => this,
    elseFn: (tag: this) => this
  ): this;
  // Boolean
  whenElse(
    condition: boolean,
    thenFn: (tag: this) => this,
    elseFn: (tag: this) => this
  ): this;
}
```

Reference implementations (both one expression, matching the existing `when`/`IfThenElse` bodies):

```ts
// src/core/tag.ts
whenElse<T>(
  condition: T | null | undefined | boolean,
  thenFn: (tag: this, value: NonNullable<T>) => this,
  elseFn: (tag: this) => this
): this {
  return condition ? thenFn(this, condition as NonNullable<T>) : elseFn(this);
}

// src/control/iteration.ts
export function ForEachOr<T>(
  itemsOrLowOrHigh: Iterable<T> | number,
  renderItemOrHigh: ((item: T, index: number) => View) | ((index: number) => View) | number,
  emptyViewOrRenderItem: Thunk<View> | ((index: number) => View),
  emptyView?: Thunk<View>
): View {
  // Range: ForEachOr(low, high, renderItem, emptyView)
  if (typeof itemsOrLowOrHigh === "number" && typeof renderItemOrHigh === "number") {
    return renderItemOrHigh - itemsOrLowOrHigh > 0
      ? ForEach(itemsOrLowOrHigh, renderItemOrHigh, emptyViewOrRenderItem as (i: number) => View)
      : emptyView!();
  }
  // Count: ForEachOr(high, renderItem, emptyView)
  if (typeof itemsOrLowOrHigh === "number") {
    return itemsOrLowOrHigh > 0
      ? ForEach(itemsOrLowOrHigh, renderItemOrHigh as (i: number) => View)
      : (emptyViewOrRenderItem as Thunk<View>)();
  }
  // Iterable: ForEachOr(items, renderItem, emptyView)
  const fn = renderItemOrHigh as (item: T, index: number) => View;
  const empty = emptyViewOrRenderItem as Thunk<View>;
  const arr = Array.isArray(itemsOrLowOrHigh) ? itemsOrLowOrHigh : Array.from(itemsOrLowOrHigh);
  return arr.length > 0 ? ForEach(arr, fn) : empty();
}
```

## Worked examples (before → after)

### `ForEachOr` — `ttl/src/admin/views/projects-list.view.ts:157-162`

```ts
// before (today)
Div(
  IfThen(projects.length > 0, () =>
    ProjectsTable({ projects }),
  ),
  IfThen(projects.length === 0, () =>
    EmptyState(),
  ),
).setId(ids.projectsList)
```
```ts
// after (with this RFC) — one decision, no paired condition to drift
Div(
  ForEachOr(projects,
    () => ProjectsTable({ projects }),
    () => EmptyState(),
  ),
).setId(ids.projectsList)
```

(When the list is rendered by a per-item component instead of a whole-table component, the item callback is used directly: `ForEachOr(members, (m) => MemberRow(m), () => EmptyMembers())` — cf. `ttl/src/admin/views/project-detail.view.ts:169-170`.)

### `Tag.whenElse` — `ttl/src/analytics/analytics.view.ts:59-60`

```ts
// before (today) — isActive evaluated twice, two statements for one decision
.when(isActive, t => t.background("accent").textColor("slate-950"))
.when(!isActive, t => t.background("slate-800").textColor("slate-400")
  .border().borderColor("slate-700")
  .on("hover", h => h.background("slate-700")).transition("colors"))
```
```ts
// after (with this RFC) — single evaluation, single intent
.whenElse(isActive,
  t => t.background("accent").textColor("slate-950"),
  t => t.background("slate-800").textColor("slate-400")
    .border().borderColor("slate-700")
    .on("hover", h => h.background("slate-700")).transition("colors"),
)
```

Nullable case (parallels `when`'s `(t, value)` narrowing) — `rideshare/src/rides/views/browse.view.ts:131-132` active-tab pattern generalizes to:

```ts
// avatar narrowed to string in thenFn; elseFn gets the bare tag
Span().whenElse(user.avatar,
  (t, src) => t.background("white").apply(avatarBg(src)),
  t => t.background("slate-700"),
)
```

## Type-safety story

- **Nullable narrowing via const generic `T`.** `whenElse<T>(condition: T | null | undefined, thenFn: (tag, value: NonNullable<T>) => this, …)` — `thenFn`'s second arg is `NonNullable<T>`, identical to `when`. The boolean overload is listed *second* so a boolean literal resolves to it (matching the existing `when` ordering) and `thenFn` is correctly `(tag) => this` with no spurious value arg.
- **Overload resolution, not a discriminated union flag.** No `{ then; else }` options bag, no boolean discriminant param — the two overloads are resolved structurally, so misuse (wrong arity in a branch) is a compile error.
- **`ForEachOr` reuses `ForEach`'s exact overload set**, so `renderItem`'s item type is inferred from the iterable's `T` and the index is `number` — no `any`, no widening. The `emptyView: Thunk<View>` slot is mandatory in every overload, so "forgot the empty state" is impossible (unlike the paired-`IfThen` form, where omitting the second call type-checks fine and silently renders nothing).
- **No bare `string`/`any` introduced.** Both signatures are fully typed; `View`/`Thunk<View>` are reused verbatim.

## Migration & compatibility

**Additive — nothing breaks.** `ForEachOr` is a new export; `Tag.whenElse` is a new prototype method. No existing signature changes. The paired `IfThen`/`when` forms keep working unchanged; this RFC adds a shorter spelling, it does not remove the old one.

**Optional codemod (mechanical, not required for v6.0).** Two AST rewrites:
- `IfThen(X.length > 0, A)` immediately followed by `IfThen(X.length === 0, B)` (same `X`) → `ForEachOr(X, A_body, B)`. Safe only when `A` is `() => ForEach(X, …)` or a whole-collection component; flag mixed cases for review.
- `.when(C, A).when(!C, B)` where `C` is a simple identifier → `.whenElse(C, A, B)`. Skip when `C` is a non-trivial expression (semantics-preserving but the codemod can't prove purity).

No `breaking-changes.md` entry (additive). Adoption is driven by the guideline edits below, not migration pressure.

## Guidelines impact

Adds two public symbols → guideline edit is **mandatory** (§11.8). Both edits sit beside the existing `ForEach`/`when` rules so the LLM reader sees the two-branch form as the default whenever a fallback/else exists.

### Index — `web-development/CLAUDE.md`

Replace the **Control flow** block (currently lines 93-101) to add the `ForEachOr` line:

```md
**Control flow:**
```typescript
IfThen(user.isAdmin, () => Button("Admin Panel"))
ForEach(users, (user) => Li(user.name))
ForEachOr(projects, (p) => ProjectRow(p), () => EmptyState()) // ✓ list-or-empty in one call
Match(status, {
  active: () => Span("Active"),
  error:  () => Span("Error"),
}, () => Span("Unknown"))
```

**List with empty state** — `ForEachOr`, never paired `IfThen`:
```typescript
ForEachOr(items, (i) => Row(i), () => EmptyState())              // ✓ one decision
IfThen(items.length > 0, () => Table({ items }))                 // ✗ paired, drift-prone
IfThen(items.length === 0, () => EmptyState())                   // ✗ empty state easy to forget
```
```

Replace the **Conditional modifiers & composition** block (currently lines 137-143) to add `whenElse`:

```md
**Conditional modifiers & composition:**
```typescript
Button("Save").when(isLoading, t => t.toggle("disabled").opacity("50"))

// .whenElse() — two-branch; use instead of .when(x)+.when(!x)
Tab(label).whenElse(isActive,
  t => t.background("accent").textColor("slate-950"),                  // ✓ active
  t => t.background("slate-800").textColor("slate-400"),               // ✓ inactive
)
Tab(label).when(isActive, t => t.background("accent"))
          .when(!isActive, t => t.background("slate-800"))             // ✗ evaluates twice, two intents

const card = (t: Tag) => t.padding("6").background("white").rounded("lg").shadow("md");
Div("Content").apply(card)
```
```

### Topic ref — `web-development/fluent-html.md`

In **Modifiers & Composition** (after the `.when()` snippet, line 95), insert:

```md
// .whenElse() — two-branch; nullable thenFn narrows like .when()
Tab(label).whenElse(isActive,
  t => t.background("accent").textColor("slate-950"),
  t => t.background("slate-800").textColor("slate-400"),
)
Span().whenElse(user.avatar,                       // avatar narrowed to string in thenFn
  (t, src) => t.apply(avatarBg(src)),
  t => t.background("slate-700"),
)
// ✗ never .when(x, …).when(!x, …) — one decision, evaluated once
```

In **Control Flow** (after the `ForEach`/`Repeat` lines, line 143), insert:

```md
ForEachOr(items, (i) => Row(i), () => EmptyState())  // list, or empty-state fallback
// ✗ never pair IfThen(arr.length > 0, …) + IfThen(arr.length === 0, …) — use ForEachOr
```

**Adoption note:** `IfThenElse` and `when`+`!when` already exist, but no guideline ever named the two-branch *list* or *fluent* form, so apps defaulted to pairing single-branch calls (377 list-pair sites, 91 fluent-pair sites). The fix is to make the two-branch primitive the taught default wherever an else/fallback exists.

## Guardrail check

- **§11.1 zero-deps:** pass — no new dependencies; both are <10-line wrappers over existing code.
- **§11.2 ssr-only / sync hot path:** pass — pure synchronous functions; no async, no new per-render allocation beyond what `ForEach` already does (arrays length-checked in place, non-array iterables materialized once as `ForEach` already does).
- **§11.3 escape-by-default:** pass — emit no markup themselves; they dispatch to caller-supplied views/modifiers, which escape as usual. No `Raw` path introduced.
- **§11.4 type-safety:** pass — const generic `T` for nullable narrowing, overload-based resolution, `View`/`Thunk<View>` reused; no bare `string`/`any`. Mandatory `emptyView` slot makes the missing-empty-state bug unrepresentable.
- **§11.5 backward-compat:** pass — additive; `breaking: additive`; no existing signature touched; optional codemod offered.
- **§11.6 consistency / idioms:** pass — mirrors `IfThenElse`↔`IfThen` and `when`'s overload shape exactly; `ForEachOr` reuses `ForEach`'s three input modes; fluent voice preserved.
- **§11.7 class-string contract:** N/A — emits no Tailwind classes; no Track-C tooling impact.
- **§11.8 guideline-sync:** pass — Guidelines impact section above covers every symbol in `api_surface` (`ForEachOr()` and `Tag.prototype.whenElse()`), with the exact index ✓/✗ rule + the deeper topic-ref section; `guideline_updates` lists both patched files.

## Alternatives considered

- **`ForEach` with an `{ empty }` options object** (`ForEach(items, fn, { empty })`). Rejected: changes `ForEach`'s arity, risks colliding with the count/range overloads, and breaks the library's positional-args-with-trailing-thunk idiom. A distinct named export keeps `ForEach` untouched.
- **`IfThenElse(items.length > 0, () => ForEach(items, fn), empty)` as the taught pattern** (no new API). Rejected: still re-states the collection twice and doesn't read as "list-or-empty"; the finding shows apps don't reach for it (they pair `IfThen` instead). A named primitive is what gets adopted (cf. `Match` under-use when untaught).
- **`whenElse` taking an options bag `{ then, else }`.** Rejected: heavier, loses overload-based nullable narrowing, and diverges from `when`'s `(tag, value) => this` shape.
- **A standalone `EmptyState()` component (Track B) instead of `ForEachOr`.** Complementary, not a substitute — `ForEachOr` is the *control-flow* glue; the empty view it renders can be a Track-B `EmptyState()`. No conflict.

## Open questions

- **Should "empty" include whitespace-only / falsy single items?** Proposed: no — "empty" strictly means zero iterations, matching `arr.length === 0`. Truthiness checks belong in `IfThen`.
- **Count/range `ForEachOr` overloads** are added for symmetry but have no app evidence. Keep them, or ship iterable-only and add the others if demand appears? Proposed: keep (zero extra cost, completes the parallel with `ForEach`).
