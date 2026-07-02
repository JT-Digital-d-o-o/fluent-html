---
id: RFC-A-G1
track: A
title: "Adoption: control-flow anti-patterns — teach the ✗ forms (IfThen-chain, paired-IfThen, ForEach(Array.from), DU-flag, !!x) the existing APIs already solve"
resolves: [F-A-021, F-A-025, F-A-026, F-A-103, F-A-105]
api_surface: []
breaking: false
guardrails_checked: [zero-deps, ssr-only, escape-by-default, type-safety, backward-compat]
guideline_updates: ["web-development/CLAUDE.md", "web-development/fluent-html.md"]
impact: high
effort: S
depends_on: []
status: proposed
---

# RFC-A-G1: Adoption — control-flow anti-patterns

## Problem

The control-flow APIs (`IfThen`, `IfThenElse`, `Match`, `ForEach`) are correct and complete — every misuse below has a one-call idiomatic form that already ships in `src/control/`. The gap is teaching: the guidelines show the ✓ form but never the ✗ form, so LLMs (the primary reader of `guidelines/web-development/**`, §11.8) and developers keep re-deriving the boilerplate. This is the documented `Match` 18:1 under-use (seed backlog, recon `02-app-patterns`) made concrete across five distinct anti-patterns.

All five findings are `kind: adoption-gap`. **No library code changes.** The fix is verbatim guideline edits. Evidence (real app code):

1. **`IfThen`-chain on a string discriminant** (F-A-021, 63 sites / 6 apps). `rideshare/src/reservations/reservations.view.ts:86,109` and again `:351,361,365` chain `IfThen(reservation.status === "PENDING", …)` / `IfThen(res.status === "DECLINED", …)`; `buzzin/src/views/admin/editor.view.ts:165,169,179,211` on `quiz.status`. Each chain is non-exhaustive (a new variant renders nothing) and blocks narrowing. The discriminant-key `Match(value, key, cases)` overload (`conditionals.ts:129`) was built for exactly this.

2. **Paired `IfThen(x)` + `IfThen(!x)`** (F-A-025, 12+ sites / 5 apps). `ttl/src/admin/views/projects-list.view.ts:157,160` writes `IfThen(projects.length > 0, …)` immediately followed by `IfThen(projects.length === 0, …)`; same at `project-detail.view.ts:169,170`; `rideshare/src/reservations/reservations.view.ts:210,224`. `IfThenElse` (`conditionals.ts:23`) is one expression, evaluates the condition once, and can't drift.

3. **`ForEach(Array.from({length:n}…), fn)`** (F-A-026, 3 apps). `glimm/src/auth/views/auth.onboarding.view.ts:87`, `gzs/inovacije/src/views/library/library.view.ts:886`, `rideshare/src/analytics/views/cohorts.view.ts:75` all allocate an intermediate index array. The count overload `ForEach(n, (i) => …)` (`iteration.ts:30`) does this directly.

4. **DU-prop rendered via boolean flag** (F-A-103, 8 sites / `test/aaa`, `glimm`, `ttl`). `test/aaa/src/auth/views/auth.verify-email.view.ts:58` derives `const isSuccess = props.state === "success"` then ternaries everywhere; `ttl/src/auth/auth.view.ts:218` re-checks `props.state === "success" ? …` *inside* an `IfThen` callback to recover a field the union already carries. `Match(props, "state", cases)` narrows each branch — `s.message` is typed without a re-check.

5. **`IfThen(!!x, () => C(x!))`** (F-A-105, 14 sites / 6 apps). `jtdigital-landing-page/src/shared/seo.ts:293,294`, `website-sales-funnel-automation-system/src/admin/jobs/views/jobs.view.ts:102,103`, `buzzin/src/views/quiz/sponsor-exposition.view.ts:203`, plus the `!= null` variant at `pregled-nepremicnin-dashboard/src/views/admin/pricing.view.ts:148`. The `!!` (or `!= null`) coerces `string | null` to `boolean` *before* `IfThen` sees it, destroying the narrowing the nullable overload (`conditionals.ts:58`) provides — forcing the `x!` assertion the API exists to eliminate. The current `CLAUDE.md` ✗ list (line 116) only covers the *missing-callback* variant, not `!!x`.

## Proposed API

**None — no public surface added or changed.** The five APIs already have the exact signatures the fix recommends. Restated as the contract the guideline teaches against (grounded in `src/control/`):

```ts
// conditionals.ts:23 — single-expression two-branch; nullable overload narrows
export function IfThenElse(condition: boolean, then: Thunk<View>, else_: Thunk<View>): View;
export function IfThenElse<T>(value: T | null | undefined, then: (value: T) => View, else_: Thunk<View>): View;

// conditionals.ts:57 — nullable overload narrows `value` to NonNullable<T> in the callback
export function IfThen(condition: boolean, then: Thunk<View>): View;
export function IfThen<T>(value: T | null | undefined, then: (value: T) => View): View;

// conditionals.ts:129 — discriminant-key overload: per-branch narrowing via Extract<T, Record<K, V>>
export function Match<T extends Record<K, string | number>, K extends keyof T>(
  value: T, key: K,
  cases: { [V in T[K] & (string | number)]: (value: Extract<T, Record<K, V>>) => View },
): View;                                                                       // exhaustive
export function Match<T extends Record<K, string | number>, K extends keyof T>(
  value: T, key: K,
  cases: Partial<{ [V in T[K] & (string | number)]: (value: Extract<T, Record<K, V>>) => View }>,
  defaultView: Thunk<View>,
): View;                                                                       // partial + default

// iteration.ts:30 — count overload: 0..n-1, no intermediate array
export function ForEach(high: number, renderItem: (index: number) => View): View;
```

## Worked examples (before → after)

**1. `IfThen`-chain → `Match` (F-A-021)**
```ts
// before — rideshare/src/reservations/reservations.view.ts:351,361,365
IfThen(res.status === "PENDING" && !eventPast, () => Button("Cancel reservation")…),
IfThen(res.status === "DECLINED",  () => P("Driver couldn't accommodate…")),
IfThen(res.status === "CANCELLED", () => P("You cancelled this reservation…")),
```
```ts
// after — one intent; default covers the rest; ready for exhaustive form when complete
Match(res, "status", {
  PENDING:   () => IfThen(!eventPast, () => Button("Cancel reservation")…),
  DECLINED:  () => P("Driver couldn't accommodate…"),
  CANCELLED: () => P("You cancelled this reservation…"),
}, () => Empty())
```

**2. Paired `IfThen` → `IfThenElse` (F-A-025)**
```ts
// before — ttl/src/admin/views/projects-list.view.ts:157,160
IfThen(projects.length > 0, () => ProjectsTable({ projects })),
IfThen(projects.length === 0, () => EmptyState()),
```
```ts
// after — condition evaluated once; branches can't desync
IfThenElse(projects.length > 0, () => ProjectsTable({ projects }), () => EmptyState())
```

**3. `ForEach(Array.from…)` → count overload (F-A-026)**
```ts
// before — rideshare/src/analytics/views/cohorts.view.ts:75
ForEach(Array.from({ length: maxPeriods }, (_, i) => i), (i) => ThCell(`${periodLabel} ${i}`, "center"))
```
```ts
// after — no intermediate array
ForEach(maxPeriods, (i) => ThCell(`${periodLabel} ${i}`, "center"))
```

**4. DU-prop flag → `Match` (F-A-103)**
```ts
// before — ttl/src/auth/auth.view.ts:218
type ForgotPasswordPageProps =
  | { state: "idle" } | { state: "error"; message: string } | { state: "success"; message: string };
function ForgotPasswordForm(props: ForgotPasswordPageProps = { state: "idle" }) {
  return Div(
    IfThen(props.state !== "idle" ? props.message : null, (msg) =>
      Alert({ message: msg, type: props.state === "success" ? "success" : "danger" })),  // ← re-check props.state
    …);
}
```
```ts
// after — each branch narrowed; `s.message` typed without a re-check
function ForgotPasswordForm(props: ForgotPasswordPageProps = { state: "idle" }) {
  return Div(
    Match(props, "state", {
      idle:    () => Empty(),
      error:   (s) => Alert({ message: s.message, type: "danger" }),   // s: { state:"error"; message:string }
      success: (s) => Alert({ message: s.message, type: "success" }),  // s: { state:"success"; message:string }
    }),
    …);
}
```

**5. `IfThen(!!x, () => C(x!))` → narrowing callback (F-A-105)**
```ts
// before — jtdigital-landing-page/src/shared/seo.ts:293,294
IfThen(!!props.canonical, () => Canonical(props.canonical!)),
IfThen(!!props.structuredData, () => StructuredData(props.structuredData!)),
```
```ts
// after — the callback arg IS the narrowed value; no !! and no !
IfThen(props.canonical, (url) => Canonical(url)),
IfThen(props.structuredData, (data) => StructuredData(data)),
```

## Type-safety story

The fix *recovers* type safety the anti-patterns discard — it doesn't add new types:

- **Discriminant-key `Match`** narrows each branch via `Extract<T, Record<K, V>>` (`conditionals.ts:135`). The exhaustive overload makes a new union variant a **compile error** at every call site; the `IfThen`-chain and boolean-flag forms silently ignore it.
- **Nullable `IfThen`/`IfThenElse`** overload types the callback parameter as `NonNullable<T>` (`conditionals.ts:58,24`). `!!x` / `x != null` collapse `string | null` to `boolean`, so the overload that *would* have narrowed is never selected — forcing a `!` assertion, a runtime trust claim TS will not re-check after a refactor.
- **`ForEach` count overload** keeps `i: number` typed with zero allocation; the `Array.from` form is identical at the type level but allocates per render.

No const generics, branded IDs, or literal unions are *added* — the point of this RFC is that the library already has them and apps bypass them.

## Migration & compatibility

**Additive — nothing breaks.** Zero library code changes; no `api_surface`, no `breaking-changes.md` entry. The anti-pattern code keeps compiling and rendering identically; the guideline simply steers new code (and refactors) to the one-call form.

**Codemod (optional, mechanical for 3 of 5):**
- F-A-026 `ForEach(Array.from({ length: N }, (_, i) => i), FN)` → `ForEach(N, FN)` — pure AST rewrite, safe.
- F-A-105 `IfThen(!!X, () => C(X!))` / `IfThen(X != null, () => C(X!))` → `IfThen(X, (v) => C(v))` — safe when the `!` operand equals the guard operand.
- F-A-025 adjacent `IfThen(C, A)` + `IfThen(!C, B)` → `IfThenElse(C, A, B)` — safe only when conditions are provably complementary; flag for review otherwise.
- F-A-021 / F-A-103 (chain/flag → `Match`) need human judgement (branch grouping, default vs exhaustive) — leave to the guideline, not a codemod.

The `eslint-plugin-fluent-html` (out-of-repo) is the natural enforcement home for F-A-026 and F-A-105 (`no-foreach-array-from`, `no-bang-bang-ifthen`); noted for Track-C tooling, not required by this RFC.

## Guidelines impact

Five ✗/✓ pairs. House style: code-snippet-first, ✗/✓ markers, no prose, written for an LLM reader.

### Index — `web-development/CLAUDE.md`

**Edit 1** — extend the existing `IfThen narrows nullable values` block (currently lines 112–118) to add the `!!x` and `!= null` ✗ variants (F-A-105) and the paired-`IfThen` ✗ (F-A-025). Replace the block:

```md
**IfThen narrows nullable values** — callback receives the non-null type:
```typescript
IfThen(user.avatar, (avatar) => Img().setSrc(avatar))           // avatar: string
IfThenElse(user.name, (name) => Span(name), () => Span("Anon")) // name: string
IfThen(user.avatar, () => Img().setSrc(user.avatar!))           // ✗ don't re-check/cast
IfThen(!!user.avatar, () => Img().setSrc(user.avatar!))         // ✗ !! collapses to boolean → forces !
IfThen(user.avatar != null, () => Img().setSrc(user.avatar!))  // ✗ same problem via != null
user.name ? Span(user.name) : Span("Anon")                     // ✗ use IfThenElse
IfThen(items.length > 0, () => List(items))                    // ✗ paired with the next line…
IfThen(items.length === 0, () => Empty())                      // ✗ …use IfThenElse (one eval, can't drift)
```
```

**Edit 2** — extend the `Discriminated union Match` block (currently lines 103–110) with the two ✗ forms it replaces (chain F-A-021, DU-flag F-A-103). Append after line 110 (after the existing `Match(state, "status", {…})` example), before the `---`:

```md
Reach for `Match` on a discriminant whenever you dispatch on a string field or a DU prop — never chained `IfThen` or a derived boolean:
```typescript
IfThen(x.status === "PENDING", () => …)                        // ✗ chain: non-exhaustive, no narrowing
IfThen(x.status === "DONE",    () => …)                        // ✗
const isOk = props.state === "success"                          // ✗ flag: loses the union; needs re-checks
Match(x, "status", { PENDING: (s) => …, DONE: (s) => … })      // ✓ exhaustive, each branch narrowed
```
```

### Topic ref — `web-development/fluent-html.md` § Control Flow

Append the five ✗/✓ pairs to the Control Flow code block (currently lines 119–144). Insert before the closing ` ``` ` at line 144:

```md

// ✗ chained IfThen on a discriminant — non-exhaustive, no narrowing (F-A-021)
IfThen(reservation.status === "PENDING",   () => Confirm())
IfThen(reservation.status === "CONFIRMED", () => Remove())
// ✓ Match on the discriminant key — exhaustive (drop the default), each branch narrowed
Match(reservation, "status", {
  PENDING:   (r) => Confirm(),
  CONFIRMED: (r) => Remove(),
}, () => Empty())

// ✗ DU prop via boolean flag — variant fields need re-checks, new variant silently ignored (F-A-103)
const isSuccess = props.state === "success"
IfThenElse(isSuccess, () => Ok(), () => Retry())
// ✓ Match the whole prop — `s.message` typed without re-narrowing
Match(props, "state", {
  success: ()  => Ok(),
  error:   (s) => Retry(s.message),                 // s: { state:"error"; message: string }
})

// ✗ paired IfThen — evaluates the condition twice, branches can drift (F-A-025)
IfThen(items.length > 0,  () => List(items))
IfThen(items.length === 0, () => EmptyState())
// ✓ IfThenElse — one expression, one eval, always synchronized
IfThenElse(items.length > 0, () => List(items), () => EmptyState())

// ✗ !! / != null collapse the value to boolean before IfThen narrows → forces ! (F-A-105)
IfThen(!!url, () => Img().setSrc(url!))
IfThen(quote != null, () => Card(quote!))
// ✓ pass the value; the callback arg is the narrowed non-null value
IfThen(url,   (u) => Img().setSrc(u))
IfThen(quote, (q) => Card(q))

// ✗ Array.from to make a range — allocates an intermediate array (F-A-026)
ForEach(Array.from({ length: count }, (_, i) => i), (i) => Item(i))
// ✓ count overload
ForEach(count, (i) => Item(i))
```

**Adoption note:** the existing guideline taught only the ✓ forms and showed `IfThen` first/most-prominently, with no negative examples — so the model never learned which JS-idiomatic shapes to *avoid* (`!!x`, `Array.from` ranges, `x.f === "A"` chains read as ordinary conditionals, not as a `Match` miss). Adding the ✗ forms is what closes the 18:1 `Match`/`IfThen` gap; the APIs themselves were never the problem.

## Guardrail check

- §11.1 zero-deps: **pass** — no code, no deps.
- §11.2 ssr-only / sync hot path: **pass** — no runtime change.
- §11.3 escape-by-default: **pass** — no markup-emitting surface touched.
- §11.4 type-safety: **pass** — the fix *restores* narrowing (`Extract`, `NonNullable<T>`) that the anti-patterns discard.
- §11.5 backward-compat: **pass** — additive, `breaking: false`; old code still compiles.
- §11.6 idiom-consistency: **pass** — steers toward the library's own control-flow idioms.
- §11.7 class-string contract: **N/A** — emits no classes; no Track-C tooling impact (optional ESLint rules noted, not required).
- §11.8 guideline-sync: **pass** — `api_surface` is empty (adoption-only), and the Guidelines impact section above patches both the index (`CLAUDE.md`) and the topic ref (`fluent-html.md`), with exact verbatim markdown for Wave-4; `guideline_updates` lists both.

## Alternatives considered

- **Ship an ESLint rule instead of guideline edits.** Rejected as the *primary* fix: the plugin is out-of-repo, opt-in, and not enforced by the library; the LLM reader of the guidelines is the dominant authoring path (§11.8). ESLint is complementary (see Migration), not a substitute.
- **Add new sugar (`ForEachOr(items, fn, emptyFn)`, `MatchStatus`).** Rejected here — that is a *new-API* proposal (cf. F-A-022 `ForEachOr` in Track B), out of scope for an adoption cluster. This RFC is deliberately zero-code: the existing surface already covers every case.
- **Make `IfThen(!!x, …)` a type error.** Not feasible without breaking the boolean overload (`!!x` is a legitimate `boolean`); the type system can't distinguish "intended boolean" from "accidentally-collapsed nullable." Teaching + optional lint is the correct lever.

## Open questions

- Should F-A-026 and F-A-105 ship as autofix ESLint rules in `eslint-plugin-fluent-html` in the same milestone? (Decision for Track-C / tooling owner — both are mechanical and safe.)
- The exhaustive vs `default => Empty()` choice in the F-A-021 rewrite: the guideline shows the default form (matches the real reservations code, which only handles a subset). Confirm we want to *encourage* the exhaustive form (compile-time safety on new variants) where the app genuinely handles every state.
