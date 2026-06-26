---
rfc: RFC-A-04
lens: type-safety
verdict: survives-with-changes
confidence: 0.74
killer_objection: "`whenElse`'s nullable overload returns `NonNullable<T>` to `thenFn` but the runtime guard is a bare truthiness test (`condition ? thenFn(...) : elseFn(...)`), so falsy-but-present values (`0`, `\"\"`, `NaN`, `0n`) are typed as flowing into `thenFn` while at runtime they are diverted to `elseFn` — a type lie that the sibling `IfThenElse` already avoids with a `!= null` check, contradicting the RFC's central 'mirrors IfThenElse exactly' claim."
required_changes:
  - "Fix the `whenElse` nullable-overload TYPE to match its truthiness runtime: either (a) keep the truthiness runtime and change the value type from `NonNullable<T>` to `Exclude<NonNullable<T>, 0 | '' | false | 0n>` is NOT expressible — so instead split semantics like `IfThenElse`: add a `typeof === 'boolean'` discriminant and use an explicit `!= null` guard so falsy-present values flow to `thenFn` as the `NonNullable<T>` type already promises; OR (b) document and rename the value type honestly. Option (a) is required to keep the advertised parity with `IfThenElse`."
  - "Reorder the `whenElse` overloads to put the boolean overload FIRST (as `IfThenElse` does, conditionals.ts:23-24), not second. The RFC's claim that boolean-second is needed 'so a boolean literal resolves to it' is false: the test shows a `boolean` condition resolves to the nullable-first overload (U=boolean) and silently accepts a 2-arg `thenFn` with `value: boolean`. Boolean-first eliminates the spurious `value` param on the boolean branch."
  - "Implement `whenElse` with an explicit branch on `typeof condition === 'boolean'` plus `condition != null` (mirroring `IfThenElse`'s body at conditionals.ts:30-36), NOT the single-line `condition ? thenFn(this, condition as NonNullable<T>) : elseFn(this)`. The `as NonNullable<T>` cast in the proposed body launders the falsy-value bug past the type system."
  - "Correct the RFC's Type-safety story bullet 1 and Guardrail §11.6 wording: it currently claims `whenElse` 'mirrors IfThenElse↔IfThen exactly' and copies `when`'s ordering — but `IfThenElse` and `when` have DIFFERENT (incompatible) overload order and runtime null-handling. The RFC must pick `IfThenElse`'s semantics (the correct sibling) and say so, or explicitly own that it is propagating `when`'s looser truthiness behavior."
  - "Add an Open Question / note: the headline nullable example `Span().whenElse(user.avatar, (t, src) => ..., t => ...)` is unsafe when `user.avatar` is the common `\"\"` empty-string sentinel — with the current proposed body, `\"\"` routes to `elseFn` despite `src: string` being typed as available. After the runtime fix this is resolved; the example must not ship against the truthiness body."
file: /Users/tony/jt-digital/fluent-html/product/research/v6/30-verification/V-RFC-A-04-type-safety.md
---

# Verdict: RFC-A-04 — type-safety lens

> You are an ADVERSARY. Your job is to KILL this RFC through the type-safety lens.
> Default to `reject` under uncertainty — a good API cut is cheaper than a bad API shipped.

## Attack

I reproduced every signature in `--strict` and diffed the proposal against the two real
siblings it claims to mirror: `Tag.when` (`src/core/tag.ts:197-201`) and `IfThenElse`
(`src/control/conditionals.ts:23-37`).

- **type-safety failure mode 1 — the `NonNullable<T>` lie (KILLER).** The proposed
  `whenElse` body is `condition ? thenFn(this, condition as NonNullable<T>) : elseFn(this)`.
  That is a **truthiness** dispatch, but the nullable overload types `thenFn`'s value as
  `NonNullable<T>` — which for `T = number` still includes `0`, for `T = string` still
  includes `""`, for `T = bigint` includes `0n`. So the type asserts `thenFn` may receive
  `0`/`""`, while at runtime those falsy-present values are diverted to `elseFn`. The
  `as NonNullable<T>` cast in the proposed body is exactly the mechanism that launders this
  past the checker. I confirmed the narrowing claim compiles:
  `whenElse(cond: 0|1, (t,v)=>..., ...)` types `v` as `0|1`, yet `0` never reaches `thenFn`.
  The RFC's own headline example `Span().whenElse(user.avatar, (t, src) => ..., t => ...)`
  is the live trap: `user.avatar: string | null` with the ubiquitous `""` sentinel renders
  the *else* branch while `src: string` is advertised as in-scope. The sibling the RFC says
  it mirrors — `IfThenElse` — does **not** have this bug: it uses `conditionOrValue != null`
  (conditionals.ts:33), so falsy-present values correctly reach `thenBranch`. The RFC mirrors
  `when`'s loose body, not `IfThenElse`'s correct one, while *claiming* the latter.

- **type-safety failure mode 2 — inverted overload order + a spurious value param on the
  boolean branch.** `IfThenElse` lists the **boolean** overload first (conditionals.ts:23),
  nullable second. The RFC deliberately lists nullable first / boolean second, justified as
  "so a boolean literal resolves to [the boolean overload]." That justification is false. I
  tested it: a `boolean` condition resolves to the **nullable-first** overload with
  `U = boolean`, and TypeScript then *silently accepts* a 2-arg `thenFn` whose `value` is
  typed `boolean` (`whenElse(isActive, (tag, v) => ..., ...)` compiles, `v: boolean`). So the
  boolean case leaks a meaningless `value` argument — a wrong call compiles. (This is
  inherited from `when`, but `whenElse`'s nullable branch makes the value param load-bearing,
  so the leak is now actively confusing rather than dormant.)

- **type-safety surface that survived the attack (for the record).** I could NOT break:
  the **mandatory `emptyView`** — omitting it is a 3-vs-2 arity error, so "forgot the empty
  state" is genuinely unrepresentable; `ForEachOr`'s **count/range/iterable overload
  resolution** — `number` first-arg never collides with `Iterable<T>`, item type and index
  infer correctly, and the only ambiguous misuse (`ForEachOr(0, 5, () => "e")`) is correctly
  a "No overload matches" error; the **`elseFn` value-leak** — adding a 2nd param to `elseFn`
  is a "too few arguments" error. `ForEachOr` is type-clean. `ForEachOr("hello", …)`
  compiling (strings are `Iterable<string>`) is pre-existing `ForEach` behavior, not a new
  hole. The `emptyView!()` non-null assertion in the count/range runtime branch is sound
  because the overloads force the 4th arg present.

## Does it survive?

**survives-with-changes.** `ForEachOr` is type-safe as specified and needs nothing.
`whenElse` ships a genuine type-safety defect: it advertises nullable narrowing as a
headline feature (Type-safety story, bullet 1) and claims exact parity with `IfThenElse`
(§11.6), but its proposed body has neither — it inherits `when`'s truthiness/`NonNullable`
mismatch and inverts `IfThenElse`'s overload order. This is not a fatal design flaw because
the fix is local and well-precedented: adopt `IfThenElse`'s body shape verbatim
(`typeof === 'boolean'` discriminant + `!= null` guard, boolean overload first). With the
five required changes folded in, `whenElse` becomes a true mirror of `IfThenElse` and the
falsy-sentinel trap closes. Without them, the RFC ships a method whose types lie about which
branch runs — and the lens default under that uncertainty would be reject; the only reason
it is not reject is that the corrective precedent already exists in the same package.

## Guardrail check (§11.4 type-safety)

FAILS as written. The RFC's §11.4 self-check asserts "const generic `T` for nullable
narrowing … no bare `string`/`any`." Bare `string`/`any` is indeed absent (true). But
"nullable narrowing" is materially wrong: the narrowed type `NonNullable<T>` does not match
the truthiness runtime, so the type does not soundly describe the value `thenFn` receives.
The guardrail passes only after required change #1 + #3 align the runtime null-check with the
type. `ForEachOr` passes §11.4 unconditionally.
