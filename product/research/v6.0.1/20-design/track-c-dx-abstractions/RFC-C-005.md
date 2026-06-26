---
id: RFC-C-005
track: C
title: Value-returning + predicate control combinators (MatchValue/pick, Cond, Intersperse)
resolves: [F-C-100, F-C-900, F-C-901]
api_surface:
  - "MatchValue(value, cases)"
  - "MatchValue(value, cases, default)"
  - "Cond(branches, default)"
  - "Intersperse(items, renderItem, separator)"
breaking: additive
ships_to: "6.1.0"
guardrails_checked: [zero-deps, ssr-only, escape-by-default, type-safety, additive-only, instruction-set, class-vocab-sync, guideline-sync]
guideline_updates:
  - "web-development/CLAUDE.md"
  - "web-development/fluent-html.md"
impact: medium
effort: S
depends_on: []
status: proposed
---

# RFC-C-005: Value-returning + predicate control combinators

## Problem

The shipped control combinators (`src/control/conditionals.ts`, `src/control/iteration.ts`) all return `View` and take **view thunks** as cases. There is no analogue for the two adjacent shapes that appear constantly in real views: (1) mapping a value to *another value* (a token, a label, a glyph), and (2) selecting from a chain of *independent predicates*. Both fall back off the fluent API into raw ternaries and `switch`. A third gap — placing a separator *between* mapped Views — has no combinator at all.

**F-C-100 — `Match` has no value-mapping form.** `Match` (`conditionals.ts:118`) only returns `View` from `Thunk<View>` cases. Mapping a value to a string/token forces either a chained ternary or `Match(v, { up: () => "↑" }, …)` — abusing a view combinator to return a bare string. Real code:

```ts
// rideshare/src/analytics/views/dashboard.view.ts:67
const trendArrow = Match(omtm.trend, { up: () => "↑", down: () => "↓" }, () => "→");
// ttl/src/shared/components/ui.components.ts:333
const bgColor = color === "green" ? "green-500" : color === "red" ? "red-500" : "accent";
```

`trendArrow` is typed `View`, not `"↑" | "↓" | "→"` — the union is lost. `bgColor` never reaches the fluent API at all.

**F-C-900 — no guard-chain combinator.** Chains of *independent* booleans (not keyed off one discriminant, so `Match` can't help) collapse to nested ternaries:

```ts
// rideshare/src/reservations/reservations.view.ts:243
const borderCol = isDeclinedOrCancelled ? "site-border"
  : isConfirmed ? "green-300"
  : showConfirmPrompt ? "amber-300"
  : "site-border";
// rideshare/src/rides/rides.components.ts:258 — inline in a fluent chain:
.borderColor(hasActiveReservation && userReservation?.status === "PENDING" ? "blue-300"
  : hasActiveReservation && userReservation?.status === "CONFIRMED" ? "green-300"
  : "site-border")
```

First-truthy-wins, unexhaustible, hard to read inline.

**F-C-901 — no Intersperse/Join.** Putting a separator *between* mapped Views (breadcrumbs, pill lists, pipe-nav) — but never after the last — needs index math or a flatMap dance. `ForEach` (`iteration.ts:26`) has no separator parameter. Today this is hand-rolled (`rides.components.ts:110` builds a `·`-joined city row by hand).

## Proposed API / fix

Three additive combinators in `src/control/`. All are pure, synchronous, zero-dep, and parallel the existing `Match`/`ForEach` overload shape.

```ts
// src/control/match-value.ts — value-returning sibling of Match (F-C-100)

// Exhaustive: every key of T must be present; result is the union of the case values.
export function MatchValue<T extends string | number, R>(
  value: T,
  cases: { [K in T]: R },
): R;
// Partial with default: result is the union of case values ∪ the default.
export function MatchValue<T extends string | number, R, D>(
  value: T,
  cases: Partial<{ [K in T]: R }>,
  defaultValue: D,
): R | D;

// src/control/cond.ts — first-truthy-wins guard chain (F-C-900)

// Tuple of [predicate, value]; first truthy predicate's value wins, else the default.
export function Cond<R, D>(
  branches: ReadonlyArray<readonly [boolean, R]>,
  defaultValue: D,
): R | D;

// src/control/iteration.ts — separator between mapped Views (F-C-901)

export function Intersperse<T>(
  items: Iterable<T>,
  renderItem: (item: T, index: number) => View,
  separator: View | (() => View),
): View;
```

Notes on the contract:
- `MatchValue` returns the **value's own union**, not `View`. Cases are plain values (`R`), not thunks — they are not lazily rendered, because the whole point is a cheap value lookup. (`Match` keeps thunks; it gates view *construction*.)
- `Cond` values are eager too (a guard chain over already-computed tokens). It returns `R | D`; pass `branches` as `as const` tuples for the tightest inference. It does **not** evaluate predicates lazily — they are already booleans at the call site, matching the ternary it replaces.
- `Intersperse` returns `View` (a `View[]`) and is `ForEach` + separator. `separator` accepts a `View` or a thunk; the thunk form is called once per gap so callers may return fresh Tag instances (Tags are mutable — a shared instance would be aliased).

## Worked examples (before → after)

```ts
// before (v6.0.0)

// F-C-100 — view combinator abused to return a string; trendArrow: View
const trendArrow = Match(omtm.trend, { up: () => "↑", down: () => "↓" }, () => "→");
const bgColor = color === "green" ? "green-500" : color === "red" ? "red-500" : "accent";

// F-C-900 — nested ternary, unexhaustible, double-evaluated guards
const borderCol = isDeclinedOrCancelled ? "site-border"
  : isConfirmed ? "green-300"
  : showConfirmPrompt ? "amber-300"
  : "site-border";

// F-C-901 — hand-rolled separator
const parts: View[] = [];
crumbs.forEach((c, i) => {
  if (i > 0) parts.push(Span("/").textColor("muted"));
  parts.push(A(c.label).setHtmx(c.route));
});
Nav(parts);
```

```ts
// after (this RFC)

// F-C-100 — bgColor: "green-500" | "red-500" | "accent"; trendArrow: "↑" | "↓" | "→"
const trendArrow = MatchValue(omtm.trend, { up: "↑", down: "↓" }, "→");
const bgColor = MatchValue(color, { green: "green-500", red: "red-500", accent: "accent" });
Div().background(bgColor);   // value flows straight into the fluent API

// F-C-900 — first-truthy-wins, on the fluent API, one expression
const borderCol = Cond([
  [isDeclinedOrCancelled, "site-border"],
  [isConfirmed,           "green-300"],
  [showConfirmPrompt,     "amber-300"],
] as const, "site-border");
Div().borderColor(borderCol);

// F-C-901 — separator between, never after the last
Nav(Intersperse(crumbs, (c) => A(c.label).setHtmx(c.route), () => Span("/").textColor("muted")));
```

## Type-safety story

- **`MatchValue` (exhaustive form)** uses `cases: { [K in T]: R }` — a missing key is a compile error, exactly like exhaustive `Match`. `R` is inferred from the case values, so the return type is their union (`"↑" | "↓"`, widened to include the default in the partial form). Misuse — handling a value outside `T` — is a compile error because the key isn't in `T`. This is what recovers the union that the ternary erases to `string`.
- **`Cond`** keeps `R` inferred from the branch values; `as const` on the branch array yields a literal-union result. It is deliberately *not* exhaustive — independent predicates have no closed value set to check against, which is precisely why `Match` can't model them. The mandatory `defaultValue` makes the total absence of a match impossible (no silent `undefined`).
- **`Intersperse`** mirrors `ForEach<T>` generics exactly; `renderItem` receives the narrowed `T` and index. No new type surface.
- No bare `string` is introduced anywhere; all three preserve or tighten the caller's literal types (guardrail 4).

## Compatibility & version

- **6.0.1 (patch):** N/A — this RFC adds public symbols, so it is not a patch. Routed to 6.1.0.
- **6.1.0 (minor):** **additive.** Three new exported functions in `src/control/` re-exported from `src/index.ts`. No existing signature changes — `Match`/`ForEach`/`Repeat` keep their exact overloads; `MatchValue`/`Cond`/`Intersperse` are new names, no collision with the export list in `src/index.ts:280`. Nothing existing breaks.
- **parked-major:** not needed.

## Guidelines impact

### Index (`web-development/CLAUDE.md`)

Add under the Control Flow bullet list (after the `Match`/`ForEach` rules):

```md
**Value/predicate combinators** — not ternaries or `switch` for value lookups:
```typescript
MatchValue(trend, { up: "↑", down: "↓" }, "→")     // ✓ value→value, keeps the union; cases are plain values
Cond([[isErr,"red-300"],[isOk,"green-300"]] as const, "site-border") // ✓ first-truthy guard chain
Intersperse(crumbs, c => A(c.label), () => Span("/")) // ✓ separator between, never after last
color === "green" ? "green-500" : "accent"          // ✗ value lookup as ternary — use MatchValue
a ? x : b ? y : z                                    // ✗ nested guard ternary — use Cond
```
```

### Topic ref (`web-development/fluent-html.md`)

Insert into the `## Control Flow` fenced block (after the `ForEach`/`Repeat` lines, before the `✗ chained IfThen` block, around line 243):

```md
// value→value mapping — MatchValue keeps the literal union (Match returns View; MatchValue returns the value)
MatchValue(trend, { up: "↑", down: "↓" }, "→")        // "↑" | "↓" | "→"
MatchValue(color, { green: "green-500", red: "red-500", accent: "accent" })  // exhaustive, no default
// first-truthy-wins over independent predicates (Match keys off one discriminant; Cond does not)
const border = Cond([
  [isDeclined,  "site-border"],
  [isConfirmed, "green-300"],
  [pending,     "amber-300"],
] as const, "site-border")
Div().borderColor(border)
// separator between mapped Views, never after the last (the View analogue of Array.join)
Nav(Intersperse(crumbs, c => A(c.label).setHtmx(c.route), () => Span("/").textColor("muted")))

// ✗ value lookup as a chained ternary — loses the literal union, off the fluent API (F-C-100)
const bg = color === "green" ? "green-500" : color === "red" ? "red-500" : "accent"
// ✓ MatchValue — bg: "green-500" | "red-500" | "accent", flows into .background(bg)

// ✗ nested guard ternary over independent booleans — unreadable inline, double-evaluated (F-C-900)
.borderColor(isDeclined ? "site-border" : isConfirmed ? "green-300" : "site-border")
// ✓ Cond — first-truthy-wins, one expression

// ✗ hand-rolled separator with index math (F-C-901)
items.forEach((x,i) => { if (i>0) parts.push(Sep()); parts.push(Row(x)) })
// ✓ Intersperse(items, Row, Sep)
```

### Lib-own docs

- **JSDoc:** full TSDoc on `MatchValue` (contrast with `Match`: "returns the value, not a View; cases are plain values, not thunks"), `Cond` ("first truthy predicate wins; mandatory default; predicates eager"), and `Intersperse` ("separator emitted between items, never after the last; thunk separator called per-gap so callers return fresh Tags"). Mirror the example-rich style of the existing `Match`/`ForEach` blocks.
- **README:** in the Control Flow section, add `MatchValue` / `Cond` / `Intersperse` to the combinator list with one line each.
- **CHANGELOG `[6.1.0]` Added:** `MatchValue`/`pick` (value-returning exhaustive match), `Cond` (first-truthy guard chain), `Intersperse` (separator between Views) — the value/predicate analogues of `Match`/`ForEach`.

## Guardrail check

- **zero-deps:** pass — pure TS, no imports beyond `View`/`Empty`.
- **ssr-only:** pass — synchronous, allocation-light (`MatchValue`/`Cond` are O(1) lookups; `Intersperse` is one pass like `ForEach`).
- **escape-by-default:** pass — `MatchValue`/`Cond` return caller-provided values (no new HTML emission); `Intersperse` emits through the same `View` pipeline as `ForEach`, no raw string injection.
- **type-safety:** pass — exhaustive mapped types on `MatchValue`, literal-union inference on `Cond`/`MatchValue`, no bare `string`.
- **additive-only:** pass — 6.1.0 additive, no existing signature touched.
- **instruction-set:** pass — these are combinators (the value/predicate analogues of shipped `Match`/`ForEach`), not opinionated components. They emit no markup of their own.
- **class-vocab-sync:** N/A — emits no classes; the tailwind-extractor + eslint-plugin vocab is untouched.
- **guideline-sync:** pass — every symbol in `api_surface` is covered in the Guidelines impact section (CLAUDE.md index + fluent-html.md topic ref + README/JSDoc/CHANGELOG).

## Alternatives considered

- **Overload `Match` to accept plain values instead of thunks.** Rejected: a record of strings is ambiguous against the discriminated-union overload (`Match(value, key, cases)`) and would muddy the "cases are thunks" mental model. A distinct name (`MatchValue`) keeps the converged one-way-per-thing rule.
- **`pick` as the only name.** The cluster lists `MatchValue`/`pick`. We ship `MatchValue` (parallels `Match`, discoverable next to it); a `pick` alias was rejected to avoid two names for one thing (converge guardrail).
- **Lazy `Cond` (thunk values, `[pred, () => val]`).** Rejected: the values it replaces (token strings) are already computed at the call site; thunks would add ceremony for no benefit. The View-returning use is covered by `IfThenElse`/`Match` chains or `Cond` returning Views (since `R` may be `View`).
- **A separate `Join(views: View[], sep)`.** Folded into `Intersperse` — `Join(vs, s)` is `Intersperse(vs, v => v, s)`. One combinator, not two.

## Open questions

- Ship a `pick` alias for `MatchValue`, or `MatchValue` only? (Leaning `MatchValue` only — converge.) Decision for a human.
- Should `Cond` accept a `View`-returning form prominently in docs, or keep the docs value-focused and let `R = View` fall out naturally? (Leaning: document value-focused; mention `R` may be a View.)
