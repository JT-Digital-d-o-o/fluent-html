# Plan: Control Flow Improvements

> Goal: Discriminated union Match, cleanup deprecated SwitchCase, add Pipe composition helper.

---

## Task 1 — Discriminated Union `Match` Overload

**Problem:** CLAUDE.md recommends discriminated unions for state, but `Match` only handles `string | number` values. Consumers must fall back to manual `switch`/`if` chains to get narrowing on discriminated unions.

**API Design:**

```typescript
// Current — value matching (unchanged)
Match(status, {
  active:  () => Span("Active"),
  error:   () => Span("Error"),
})

// New — discriminated union matching with narrowing
type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; data: User[] };

Match(state, "status", {
  loading: ()  => Spinner(),
  error:   (s) => Alert(s.message),   // s: { status: "error"; message: string }
  success: (s) => UserList(s.data),   // s: { status: "success"; data: User[] }
})

// Partial with default
Match(state, "status", {
  error: (s) => Alert(s.message),
}, () => Spinner())
```

**Type signature:**

```typescript
// Exhaustive — all discriminant values must be handled
export function Match<
  T extends Record<K, string | number>,
  K extends keyof T,
>(
  value: T,
  key: K,
  cases: { [V in T[K] & (string | number)]: (value: Extract<T, Record<K, V>>) => View },
): View;

// Partial — with default fallback
export function Match<
  T extends Record<K, string | number>,
  K extends keyof T,
>(
  value: T,
  key: K,
  cases: Partial<{ [V in T[K] & (string | number)]: (value: Extract<T, Record<K, V>>) => View }>,
  defaultView: Thunk<View>,
): View;
```

**Implementation:**

```typescript
// Inside the implementation overload, detect discriminant overload by typeof key === "string" && typeof cases === "object"
// Lookup: cases[value[key]], call with value, fall through to default
```

**Files:** `src/control/conditionals.ts`, `src/control/index.ts`

**Tests:**
- [x] Exhaustive match — all variants handled, correct narrowing
- [x] Partial match with default — subset of variants + fallback
- [x] Compile-time error when exhaustive match is missing a variant
- [x] Runtime fallback when no case matches (partial + default)

---

## Task 2 — Remove Deprecated `SwitchCase`

**Problem:** `SwitchCase` is deprecated (replaced by `Match`) but still exported from `src/control/index.ts` and appears in typedoc.

**Steps:**
- [ ] Remove `SwitchCase` export from `src/control/index.ts`
- [ ] Remove `SwitchCase` export from `src/index.ts` (if present)
- [ ] Keep the function in `conditionals.ts` with `@deprecated` + `@internal` for one more minor version, then delete
- [ ] Verify typedoc excludes it

**Files:** `src/control/index.ts`, `src/index.ts`

---

## Task 3 — `Pipe` View Composition Helper

**Problem:** Chaining multiple `.apply()` calls is verbose for multi-step transformations:

```typescript
// Current
Div("Content").apply(card).apply(withShadow).apply(withMargin)
```

**API Design:**

```typescript
// Pipe — applies a sequence of modifiers to a tag
Pipe(Div("Content"), card, withShadow, withMargin)

// Type signature
function Pipe<T extends Tag>(tag: T, ...fns: Array<(tag: T) => T>): T;
```

**Implementation:** Simple reduce — `fns.reduce((t, fn) => fn(t), tag)`.

**Trade-off:** This is sugar over `.apply()` chaining. Only add if it improves readability for 3+ modifiers. Consider whether this pulls its weight vs just using `.apply()`.

**Files:** `src/control/index.ts` or `src/core/utils.ts`

**Tests:**
- [ ] `Pipe(Div(), fn1, fn2)` equals `Div().apply(fn1).apply(fn2)`
- [ ] Empty fns list returns tag unchanged
- [ ] Type inference preserves tag subclass (e.g. `InputTag`)

---

## Priority

1. **Task 1** (discriminated union Match) — highest impact, fills a real gap
2. **Task 2** (remove SwitchCase) — cleanup, trivial
3. **Task 3** (Pipe) — nice-to-have, evaluate after 1 & 2

## Acceptance Criteria

- [x] Discriminated union `Match` with compile-time exhaustiveness
- [ ] `SwitchCase` removed from public exports
- [ ] `Pipe` helper available (if approved)
- [ ] `tsc --noEmit` clean, all tests pass
- [ ] JSDoc with `@example` on new functions
- [ ] README / examples updated
