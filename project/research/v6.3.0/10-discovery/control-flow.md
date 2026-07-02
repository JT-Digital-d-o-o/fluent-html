# Control-flow lens — v6.2.0 audit (fresh eyes)

**Lens summary.** The control-flow layer (`src/control/conditionals.ts`, `iteration.ts`, `match-value.ts`) is small, well-documented, and its falsy-value semantics are deliberately correct: `IfThen`/`IfThenElse` use `!= null`, and tests explicitly pin `0`, `""`, and `NaN` passing through to the callback (test/control-flow.test.ts:50-60). However, three runtime/type contradictions survive: boolean-typed values silently hijack the nullable overload (callback invoked with `undefined` or skipped for non-null `false`), `Match` does an unguarded prototype-chain lookup that `MatchValue` already guards against, and `ForEach`'s count/range overloads throw `RangeError` on negative/fractional counts. All findings below were confirmed by executing `dist/` and by `tsc --strict` compile checks.

---

## control-flow-1: `IfThen`/`IfThenElse` nullable overload breaks for boolean-typed values

- **Kind:** bug — **Severity:** high
- **Evidence:** src/control/conditionals.ts:30-31, 63-64 (runtime), :24, :58 (overloads)

```typescript
// overload (line 58): value: T | null | undefined, then: (value: T) => View
if (typeof conditionOrValue === 'boolean') {
  return conditionOrValue ? (then as Thunk<View>)() : Empty();
}
if (conditionOrValue != null) {
  return then(conditionOrValue);
}
```

For a value typed `boolean | null`, TypeScript resolves to the **nullable overload** (confirmed: `IfThen(flag as boolean | null, (val) => { const b: boolean = val; ... })` compiles clean under `--strict`), which promises: callback runs for every non-null value and receives it. The runtime `typeof === 'boolean'` check fires first and reinterprets the value as a *condition*:

- `IfThen(false /* boolean|null */, cb)` → renders `Empty()` — but `false` is non-null; the types say `cb(false)` runs. **Confirmed:** output `""`.
- `IfThen(true /* boolean|null */, cb)` → calls the callback **with zero arguments**: `(then as Thunk<View>)()`. **Confirmed:** `render(IfThen(true, (v) => Span("got:" + v)))` → `<span>got:undefined</span>` while `v` is typed `boolean`. This is `undefined` flowing through a variable typed as a definite `boolean` — exactly the class of type-lie the narrowing feature exists to prevent.

`IfThenElse` has the identical hole (conditionals.ts:30-31). This is not exotic: any Prisma nullable `Boolean?` column (`user.emailVerified: boolean | null`) hits it.

**Fix:** the two overloads cannot be disambiguated at runtime when `T` includes `boolean`, so reject it at the type level. Constrain the nullable overload's value so boolean-containing `T` fails to compile and directs the caller to an explicit comparison:

```typescript
export function IfThen<T>(
  value: boolean extends T ? never : T | null | undefined,
  then: (value: T) => View,
): View;
// caller writes IfThen(user.emailVerified === true, () => Badge()) — intent explicit
```

---

## control-flow-2: `Match` resolves handlers through the prototype chain — `MatchValue` already guards, `Match` does not

- **Kind:** bug — **Severity:** high
- **Evidence:** src/control/conditionals.ts:159, :168 vs src/control/match-value.ts:32

```typescript
// conditionals.ts:158-161 (DU path) — same pattern at :167-170 (value path)
const cases = casesOrDefault as Record<string | number, ((value: unknown) => View) | undefined>;
const handler = cases[discriminant];
if (handler) {
  return handler(value);
}
```

```typescript
// match-value.ts:32 — the sibling function does it correctly
return Object.prototype.hasOwnProperty.call(cases, value) ? cases[value as string] : defaultValue;
```

`cases[discriminant]` finds **inherited `Object.prototype` members** when the discriminant is `"toString"`, `"constructor"`, `"valueOf"`, etc. They are truthy, pass the `if (handler)` check, and get invoked as handlers. Confirmed against `dist/`:

- `Match("toString", { a: () => Span("A") }, () => Span("DEFAULT"))` → renders `[object Undefined]` (unbound `Object.prototype.toString()` return value emitted as page text) instead of `DEFAULT`.
- `Match("constructor", …, () => Span("DEFAULT"))` → renders `""` (the `Object` constructor invoked, result swallowed) instead of `DEFAULT`.
- DU form: `Match({ status: "constructor" }, "status", { … }, () => Span("DEFAULT"))` → `""` instead of `DEFAULT`.

The partial-with-default form exists precisely for values wider than the handled set — i.e. values that may originate from user input (a status string off a query param). An attacker-supplied `"toString"` produces garbage output; `"__proto__"`-shaped discriminants can throw mid-render. The library already knows the right idiom — `MatchValue` uses `hasOwnProperty` — so this is an internal inconsistency, not a design question.

**Fix:** mirror `match-value.ts:32` in both `Match` paths:

```typescript
const handler = Object.prototype.hasOwnProperty.call(cases, discriminant)
  ? cases[discriminant] : undefined;
if (typeof handler === "function") return handler(value);
```

---

## control-flow-3: `ForEach` count/range overloads throw `RangeError` on negative, fractional, or NaN lengths

- **Kind:** bug — **Severity:** medium
- **Evidence:** src/control/iteration.ts:50-51, :61

```typescript
const len = high - low;
const result: View[] = new Array(len);   // :51 — throws for len < 0 or non-integer
...
const len = viewsOrLowOrHigh;
const result: View[] = new Array(len);   // :61 — same
```

`new Array(n)` throws `RangeError: Invalid array length` for any negative, fractional, or NaN `n`. Confirmed against `dist/`:

- `ForEach(-2, fn)` → throws (e.g. `ForEach(capacity - items.length, renderEmptySlot)` on an over-full list).
- `ForEach(2.5, fn)` → throws (any count derived from division).
- `ForEach(5, 3, fn)` → inverted range throws instead of rendering nothing — the natural reading of an empty range, and what a `for` loop would do.
- `ForEach(NaN, fn)` → throws.

A render-time crash takes down the whole SSR response for what is naturally an "iterate zero times" situation. The iterable overload already handles empty gracefully (`ForEach([], …)` → `[]`, pinned in test/control-flow.test.ts:159).

**Fix:** clamp and floor in both numeric paths:

```typescript
const len = Math.max(0, Math.floor(high - low) || 0);  // || 0 catches NaN
```

---

## control-flow-4: `Match` exhaustiveness silently evaporates when `T` widens to `string`

- **Kind:** issue — **Severity:** medium
- **Evidence:** src/control/conditionals.ts:75 (doc claim), :118-121 (overload), :172 (silent `Empty` fallback)

```typescript
 * Without a default, TypeScript ensures every possible value has a handler (exhaustive).
...
export function Match<T extends string | number>(
  value: T,
  cases: { [K in T]: Thunk<View> }
): View;
...
return ((casesOrDefault as Thunk<View> | undefined) ?? Empty)();  // :172
```

When `T` is a literal union the mapped type enforces exhaustiveness. But when the value widens to plain `string` (a DB column typed `string`, an unvalidated route param), `{ [K in string]: Thunk<View> }` collapses to an index signature and **any subset of cases compiles in the no-default "exhaustive" form**. Confirmed: `const s: string = "whatever"; Match(s, { a: () => Span("A") })` compiles clean under `--strict` and renders `""` at runtime — the documented guarantee ("TypeScript ensures every possible value has a handler") is silently void, and the miss produces invisible blank output instead of a diagnostic.

**Fix:** reject non-literal `T` in the exhaustive (no-default) overloads so widened strings must use the partial-with-default form:

```typescript
export function Match<T extends string | number>(
  value: string extends T ? never : number extends T ? never : T,
  cases: { [K in T]: Thunk<View> },
): View;
```

Compile error message aside, this converts a silent blank render into a compile-time push toward `Match(value, cases, fallback)` — which is what the caller actually needs when the input is unconstrained.

---

## control-flow-5: DU `Match` accepts numeric discriminant keys at the type level but crashes at runtime

- **Kind:** bug — **Severity:** low
- **Evidence:** src/control/conditionals.ts:129-136 (overload allows `K extends keyof T`), :155 (runtime requires string key)

```typescript
export function Match<
  T extends Record<K, string | number>,
  K extends keyof T,
>(value: T, key: K, cases: { ... }): View;
...
if (typeof casesOrKey === "string" && typeof casesOrDefault === "object" && ...) {
```

`K extends keyof T` admits numeric keys. `Match(row as { 0: "a" | "b"; label: string }, 0, { a: …, b: … })` **type-checks** (confirmed with `tsc --strict`; handler params degrade to `never` because `Extract<T, Record<0, "a">>` fails on the non-union — a second smell), but at runtime `typeof 0 === "number"` fails the `:155` guard, so the call falls into the value-matching path where the *cases object* is treated as the default thunk. Confirmed: `TypeError: (casesOrDefault ?? Empty) is not a function` thrown mid-render.

**Fix:** align types with the runtime — constrain the key to strings in both DU overloads:

```typescript
K extends keyof T & string
```

One-line change, removes the entire class (numeric and symbol keys) at compile time.

---

## control-flow-6: `ForEach` array fast path feeds `undefined` for sparse-array holes despite `T` typing

- **Kind:** issue — **Severity:** low
- **Evidence:** src/control/iteration.ts:69-75

```typescript
if (Array.isArray(viewsOrLowOrHigh)) {
  const arr = viewsOrLowOrHigh;
  const result: View[] = new Array(arr.length);
  for (let i = 0; i < arr.length; i++) {
    result[i] = fn(arr[i], i);
  }
```

Index-based iteration visits holes: for `const a = new Array(3); a[0]="a"; a[2]="c"`, the callback (typed `(item: T, …)`) receives `undefined` for index 1. Confirmed: renders `<span>1:undefined</span>`. Both reference behaviors disagree with this: `Array.prototype.map` *skips* holes, and the library's own iterator path at :79 (`Array.from(iterable, fn)`) yields `undefined` too but the array fast path is the one used for the dominant call shape. Sparse arrays are rare in app code but trivially produced by `new Array(n)` bookkeeping and `delete arr[i]`. Cheapest honest fix: keep the loop (perf fast path) and document that holes are visited with `undefined`, or skip holes with an `i in arr` check to match `map` semantics. Either way, pick one and pin it with a test — currently the behavior is accidental.

---

## control-flow-7: `ForEachElse` is array-only while every sibling accepts `Iterable`

- **Kind:** idea — **Severity:** low
- **Evidence:** src/control/iteration.ts:94-98 vs :27-29, :118-122, :145-149

```typescript
export function ForEachElse<T>(
  items: readonly T[],                     // arrays only
  ...
export function ForEach<T>(views: Iterable<T>, ...       // Iterable
export function ForEachKeyed<T>(items: Iterable<T>, ...  // Iterable
export function Intersperse<T>(items: Iterable<T>, ...   // Iterable
```

`ForEach`, `ForEachKeyed`, and `Intersperse` all take `Iterable<T>` (`Map.values()`, generators, paginators — the JSDoc at :77-78 even optimizes for them), but `ForEachElse` — the one you reach for on every list page with an empty state — requires a real array, forcing `ForEachElse([...map.values()], …)` and an extra allocation. It uses `.length === 0` (:99), which an iterable can't answer without consuming; the fix is to collect first:

```typescript
export function ForEachElse<T>(
  items: Iterable<T>,
  renderItem: (item: T, index: number) => View,
  emptyView: View | (() => View),
): View {
  const arr = Array.isArray(items) ? items : [...items];
  if (arr.length === 0) return typeof emptyView === "function" ? emptyView() : emptyView;
  ...
}
```

Non-breaking widening; makes the iteration quartet uniform.
