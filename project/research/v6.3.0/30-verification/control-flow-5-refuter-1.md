# control-flow-5 — Refuter 1 verdict

**Finding:** DU `Match` accepts numeric discriminant keys at the type level but crashes at runtime.
**Anchor:** `src/control/conditionals.ts:155` (DU overloads at :129–146).

## Verdict: NOT REFUTED — defect confirmed by executable repro

I attempted to refute by locating a guard, overload-resolution barrier, or semantic that would make
this a non-issue. None exists. Every claim in the finding reproduces exactly.

## What I checked

### 1. Type level — the numeric-key call compiles under `--strict`

The DU overloads constrain `K extends keyof T` with `T extends Record<K, string | number>`
(`src/control/conditionals.ts:129–136`). `keyof T` admits numeric (and symbol) keys, so for
`type Row = { 0: "a" | "b"; label: string }` the call

```ts
Match(row, 0, { a: () => "A", b: () => "B" })
```

selects the exhaustive DU overload and compiles with **zero errors** under
`tsc --strict --noEmit` (verified with the repo's own `node_modules/.bin/tsc`, repro at
`/private/tmp/claude-501/-Users-tony-jt-digital-fluent-html/f2f45330-dea1-49ee-a197-fd7d0ee2bfc5/scratchpad/repro-cf5.ts`).

### 2. Runtime — it crashes exactly as described

The implementation's DU-path detection is `typeof casesOrKey === "string" && …`
(`src/control/conditionals.ts:155`; identical in the built `dist/src/control/conditionals.js:23`).
A numeric key fails that check, so execution falls into the value-matching path: the number `0` is
treated as the cases record (lookup yields `undefined`) and the **cases object** is treated as the
default thunk. Observed on Node 26 running the compiled repro:

```
TypeError: (casesOrDefault ?? Empty) is not a function
    at Match (dist/src/control/conditionals.js:39:37)
```

This is the exact failure mode the finding predicts — a mid-render throw.

### 3. Secondary smell — handler params degrade to `never`

Confirmed: with `Row = { 0: "a" | "b"; label: string }`, `Extract<Row, Record<0, "a">>` is `never`
(the single object type's `0` property is the full union `"a" | "b"`, not `"a"`), so
`a: (v) => { const x: never = v; … }` type-checks. Contravariance then lets any handler signature
through, which is why the call compiles despite the degenerate param type. This means the type
system gives no usable narrowing for numeric keys — the API surface is pure trap.

### 4. Proposed fix — verified effective

Simulated the one-line change `K extends keyof T & string` on an equivalent signature: the numeric-key
call then fails to compile (`@ts-expect-error` satisfied under `--strict`), while string-discriminant
usage is unaffected. Symbol keys are excluded by the same intersection.

## Refutation angles considered and rejected

- **Overload resolution diverts the call elsewhere?** No — the value-matching overloads require
  `value: T extends string | number`, so an object value can only bind the DU overloads.
- **Some upstream guard?** No validation of `casesOrKey`'s type exists beyond the `typeof … === "string"`
  branch at :155; there is no `typeof casesOrKey === "number"` branch and no error path that would
  fail fast with a meaningful message.
- **Unrealistic input?** Numeric-keyed objects (tuple-likes, index-mapped records) are legal TS and
  the API's own constraint (`keyof T`) invites them. A compile-clean call that throws
  `TypeError … is not a function` from library internals mid-render is a genuine contract violation,
  not caller misuse.

## Classification

Real bug, low severity/likelihood in practice (string discriminants dominate), trivial fix with no
break to documented usage. The proposed `K extends keyof T & string` constraint on both DU overloads
(`src/control/conditionals.ts:131` and :140) is correct and sufficient.
