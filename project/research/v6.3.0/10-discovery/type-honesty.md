# Type-Honesty Audit — fluent-html v6.2.0

**Lens summary.** The library's type surface is unusually disciplined for its size — the `proto.ts` seam eliminated almost all `as any`, the themeable Tailwind unions really are closed, and `defineRoutes`/`defineIds` deliver the safety they advertise. The holes that remain cluster in three places: (1) the boolean/nullable **dual-overload pattern** on `IfThen`/`IfThenElse`/`when`/`whenElse`, where a boolean condition silently matches the *value* overload and the callback's "narrowed non-null value" is `undefined` at runtime; (2) **`Match`'s un-guarded prototype-chain lookup**, which its own sibling `MatchValue` already fixed, letting typed code render `[object Undefined]` or throw `TypeError`; and (3) documented-vs-actual union openness — `HxSwap` claims to be open but is closed, `HxTarget` claims compile-time validation but is `string`, and eight styling unions keep `(string & {})` tails that defeat the "typos become build errors" promise. All findings below were confirmed with `tsc` probes and `node` runs against `dist/` (probe files in scratchpad; key outputs quoted inline).

---

## type-honesty-1: `Match` looks up handlers on the prototype chain — typed calls render `[object Undefined]` or throw

**Kind:** bug · **Severity:** high
**Evidence:** `src/control/conditionals.ts:159`, `src/control/conditionals.ts:168-171` — contrast with the *correct* guard in `src/control/match-value.ts:32`

```typescript
// conditionals.ts — Match implementation
const handler = cases[discriminant];        // :159  (DU form)
if (handler) { return handler(value); }
...
const handler = cases[value as string | number];   // :168  (value form)
if (handler) { return handler(); }
```

```typescript
// match-value.ts:32 — the sibling already knows about this hazard:
return Object.prototype.hasOwnProperty.call(cases, value) ? cases[value as string] : defaultValue;
```

`cases` is an object literal, so `cases["toString"]`, `cases["constructor"]`, `cases["hasOwnProperty"]` etc. resolve to inherited `Object.prototype` members, which are truthy and get invoked as handlers. This is reachable through the **typed** partial-with-default overload whenever the matched value is a widened `string` (the exact use case the default exists for — e.g. a status string from a DB or request). Confirmed against `dist/`:

```
Match("toString",   { a: () => Div("A") }, () => Div("DEFAULT"))  → renders "[object Undefined]"
Match("constructor",{ a: () => Div("A") }, () => Div("DEFAULT"))  → renders "" (default never runs)
Match({status:"hasOwnProperty"}, "status", {...}, default)        → TypeError: Cannot convert undefined or null to object
```

The declared return type is `View`; the actual behavior is junk output or a crash. **Fix:** mirror `MatchValue` — guard both lookups with `Object.prototype.hasOwnProperty.call(cases, key)` (a `typeof handler === "function"` belt-and-suspenders check is free). Two-line change, no API impact.

---

## type-honesty-2: Boolean conditions match the nullable-*value* overloads of `IfThen`/`IfThenElse`/`when`/`whenElse` — callback's "narrowed" value is `undefined` at runtime

**Kind:** bug · **Severity:** high
**Evidence:** `src/core/tag.ts:245-254` (`when`), `src/core/tag.ts:265-276` (`whenElse`), `src/control/conditionals.ts:23-37` (`IfThenElse`), `src/control/conditionals.ts:57-70` (`IfThen`)

```typescript
// tag.ts:245-246 — note the generic value overload is listed FIRST here…
when<T>(condition: T | null | undefined, fn: (tag: this, value: NonNullable<T>) => unknown): this;
when(condition: boolean, fn: (tag: this) => unknown): this;
// tag.ts:248-249 — …but the runtime never passes a value for booleans:
if (typeof condition === "boolean") {
  if (condition) (fn as (tag: this) => unknown)(this);
```

A `boolean` is a perfectly good `T`, so any callback that declares the value parameter type-checks against the generic overload while the implementation's `typeof === "boolean"` branch calls the callback **without** the value. Confirmed by probe — all of these compile clean under `--strict`:

```typescript
IfThen(isAdmin, (v: boolean) => Div(String(v)));                          // compiles
Div().when(isAdmin, (t: Tag, value: boolean) => t.setTitle(String(value))); // compiles
Div().whenElse(isAdmin, (t: Tag, value: boolean) => t, (t: Tag) => t);      // compiles
```

and at runtime (`node` against `dist/`): `IfThen(true, (v) => …)` receives `v === undefined`; `when(true, (t, value) => …)` receives `value === undefined` — while the types claim `boolean` / `NonNullable<T>`. (Un-annotated callbacks degrade to *implicit `any`* params instead, so with `noImplicitAny` off the hole is fully silent.) Also note the overload orderings are inconsistent (`when` lists generic-first, `whenElse` boolean-first) yet both leak the same way.

**Fix (cheapest, fully honest):** pass the boolean through in the boolean branch — `fn(this, condition as never)` / `then(conditionOrValue)`. Only `true` ever reaches the callback, which is a legal inhabitant of the claimed type, and zero-arg thunks ignore the extra argument. Alternative: reject booleans in the generic overload with a `T extends boolean ? never : T` parameter conditional, at the cost of blocking `boolean | null` values.

---

## type-honesty-3: `MatchValue`'s "exhaustive" overload accepts widened `string`/`number` and then returns `undefined` typed as `R`

**Kind:** bug · **Severity:** medium
**Evidence:** `src/control/match-value.ts:18-21`, `src/control/match-value.ts:32`; same shape on `Match` at `src/control/conditionals.ts:118-121`

```typescript
export function MatchValue<T extends string | number, R>(
  value: T,
  cases: { [K in T]: R },
): R;
```

When `T` is a *widened* `string`, `{ [K in T]: R }` collapses to the index signature `Record<string, R>`, to which any partial case object is assignable — so the "every key of `T` must be present" contract (JSDoc line 7-8) silently evaporates. Probe (compiles under `--strict`, `tsc exit: 0`):

```typescript
declare const s: string;
const n: number = MatchValue(s, { a: 1 });  // compiles as the exhaustive overload
// runtime: MatchValue("b", { a: 1 }) → undefined   (typed number; n.toFixed(2) crashes)
```

`Match`'s exhaustive overload has the same acceptance (`Match(s, { anything: () => Div() })` compiles) but degrades to `Empty()` — still a `View`, so it's only a silent-wrong-render there; `MatchValue` is the genuinely unsound one, since `undefined` escapes typed as `R`.

**Fix:** gate the no-default overloads on literal types: `value: LiteralOnly<T>` with `type LiteralOnly<T> = string extends T ? never : number extends T ? never : T`. A widened value then fails to compile unless the caller supplies the default — exactly the semantic the JSDoc promises.

---

## type-honesty-4: `Tag.attributes` is a public *mutable* `Record<string, string>` that is actually a shared frozen object — direct writes compile and throw

**Kind:** bug · **Severity:** medium
**Evidence:** `src/core/tag.ts:71`, `src/core/tag.ts:11`, `src/core/tag.ts:550`

```typescript
declare attributes: Record<string, string>;                    // :71  — public, not readonly
export const EMPTY_ATTRS: Record<string, string> = Object.freeze(Object.create(null)) ...  // :11
Tag.prototype.attributes = EMPTY_ATTRS;                        // :550 — every fresh Tag shares it
```

The copy-on-write scheme (`addAttribute` at tag.ts:190-193 swaps in a fresh bag) is correct internally, but the *type* invites exactly the write the runtime forbids. Probe: `Div().attributes["data-x"] = "1"` compiles under `--strict` and throws at runtime — `TypeError: Cannot add property data-x, object is not extensible` — and `Div().attributes === Div().attributes` (distinct tags, one shared object). Worse, the failure is *state-dependent*: after one `addAttribute()` call the same direct write succeeds, so the crash only reproduces on pristine tags.

**Fix:** publish the field as `readonly attributes: Readonly<Record<string, string>>` (internal writers go through one internal cast or a private setter), or mark it `/** @internal */` and strip it from the public `.d.ts` surface. Either makes the type say what the runtime enforces.

---

## type-honesty-5: `HxSwap` documents itself as open but is closed (rejects valid htmx swaps); `HxTarget` documents compile-time validation but is plain `string`

**Kind:** issue · **Severity:** medium
**Evidence:** `src/htmx.ts:56-66` (`HxSwap`), `src/htmx.ts:69` + `src/htmx.ts:82` (`HxTarget`); claim at `README.md:18`

```typescript
/** …
 * Also accepts any valid swap string for patterns not covered.     // htmx.ts:64
 */
export type HxSwap = HxSwapStyle | SwapWithModifier | SwapWithTwoModifiers;   // :66 — no open tail
...
type StandardCSSSelector = string;                                  // :69
export type HxTarget = StandardCSSSelector | ExtendedCSSSelector;   // :82 — collapses to `string`
```

Two opposite dishonesties in one file:

- **`HxSwap` is closed while its JSDoc says open.** Probe confirms these *valid htmx 4* swap strings are compile errors: `"innerHTML swap:250ms"` (delay outside the 5-literal `DelayValue`), `"outerHTML swap:500ms settle:100ms"` (two timing modifiers — `SwapWithTwoModifiers` at htmx.ts:54 only pairs scroll/show with timing), `"innerHTML scroll:#log:bottom"` (selector-scoped scroll). Callers hit a wall the docs say doesn't exist and reach for `as HxSwap`.
- **`HxTarget` is `string`**, so the `'this' | 'closest ${string}' | …` union is purely decorative autocomplete and `README.md:18`'s "HTMX targets are compile-time validated" only holds for the `Id` path. Probe: `hx("/x", { target: "closest    ]][ not a selector" })` compiles.

**Fix:** pick a side per type and align code+doc. For `HxSwap`, either append the missing grammar arms (`swap:${string}`/`settle:${string}` combos, `scroll:${string}`) or add a *bracketless* documented tail and delete the false JSDoc line. For `HxTarget`, either drop the `string` arm in favor of `Id | ExtendedCSSSelector | `#${string}` | `.${string}`` (honest validation) or reword the README claim to "targets referenced via `defineIds` are compile-time validated".

---

## type-honesty-6: Residual `(string & {})` tails and unbracketed `not-${string}`/`nth-${string}` variant hatches silently reopen "typo-rejecting" unions

**Kind:** issue · **Severity:** medium
**Evidence:** `src/core/tailwind-types.ts:137-138` (gridCols/Rows), `:165` (colSpan), `:172` (duration), `:176` (ring), `:179` (scale), `:255` (fontFamily), `:268` (lineClamp), `:377-380` (delay); variant hatches at `:230` (`not-${string}`) and `:435-437` (`nth-${string}` family). Claims: `FLUENT-STYLING.md:346`, `README.md:18`.

```typescript
export type TailwindDuration = 0 | 75 | … | 1000 | Stringified<…> | (string & {});   // :172
export type TailwindRingWidth = 0 | 1 | 2 | 3 | 4 | 8 | Stringified<…> | (string & {}); // :176
...
| `not-${string}` | `supports-[${string}]`                                            // :230
```

The library's own convention is that arbitrary values must be **bracketed** (`.textSize("[13px]")` — the `[${string}]` arm), and grid's tail at least carries a rationale comment ("JIT bare numbers beyond 12"). But `duration`/`delay`/`ring`/`scale`/`lineClamp`/`fontFamily` keep naked `(string & {})` tails with no comment, and the `.on()` variant union — advertised as typed — accepts any `not-*`/`nth-*` string. Probe (all compile under `--strict`): `.duration("fast")`, `.gridCols("brnad")` (the exact typo `FLUENT-STYLING.md:338` says is caught), `.delay("soon")`, `.ring("thick")`, `.scale("huge")`, `.lineClamp("many")`, `.fontFamily("garbogus")`, `.on("not-hovr", …)`, `.on("nth-banana", …)`, and `.background("blue-500/999")` (the `${number}` opacity arm has no 0-100 bound) — while the control `.background("brnad")` correctly errors. Every one of these renders a class Tailwind ignores: precisely the "unstyled element, not a compile error" failure the closed-union program was built to kill.

**Fix:** convert the numeric tails to honest arms — `${number}` for grid/colSpan/duration/delay (bare numbers are what the tail exists for), `[${string}]` for the rest; replace `not-${string}` with `not-` prefixed over the known variant unions (`not-${TailwindStateCore}` + `not-[${string}]`) and `nth-${string}` with `nth-${number}` | `nth-[${string}]`. Where a tail must stay open, document it at the method like README.md:707 already does for Permissions-Policy names.

---

## type-honesty-7: `Id`'s brand comment promises "no structural spoofing", but `isId` launders any `{id, selector}` object into a branded `Id`

**Kind:** issue · **Severity:** low
**Evidence:** `src/ids.ts:24-25` (brand claim), `src/ids.ts:127-136` (structural guard), `src/core/behavior-methods.ts:66-68` (`resolveId(value: unknown)` path)

```typescript
/** @internal Prevents structural spoofing — only `createId`/`defineIds` produce valid Ids */
readonly [__idBrand]: true;                                   // ids.ts:24-25
...
export function isId(value: unknown): value is Id {          // ids.ts:127
  return typeof value === 'object' && value !== null &&
    'id' in value && 'selector' in value && …                 // purely structural
```

The compile-time brand does prevent *assigning* a plain object where `Id` is expected — but `isId` is the runtime front door (`extractId`, `resolveSelector`, `Partial`, behavior `resolveId` all route through it), and it upgrades any two-string-field object to `Id`, brand included, at both the type level (`value is Id`) and behaviorally. Any `unknown`-typed value that happens to carry `id` + `selector` string fields (e.g. a DB row) flowing into `resolveId`/`extractSelector` is treated as an `Id` — its `.selector` is emitted verbatim. The unique-symbol brand and the doc comment overstate the guarantee the runtime actually checks.

**Fix:** attach a real runtime marker in `createId` (e.g. a module-private `Symbol` property, which `Object.freeze` already accommodates) and test it in `isId`; or soften the ids.ts:24 comment to "compile-time brand only — the runtime guard is structural" so the contract reads true.

---

*Probes: `/private/tmp/claude-501/-Users-tony-jt-digital-fluent-html/f2f45330-dea1-49ee-a197-fd7d0ee2bfc5/scratchpad/probe/probe{1,2,4,5,6}.ts`, `probe{2,3,4,6}run.mjs` — compiled with TS `--strict` against the package's published `.d.ts`, executed against `dist/`.*
