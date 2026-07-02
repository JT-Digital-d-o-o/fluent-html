# control-flow-4 — Refuter verdict: CONFIRMED (refutation failed)

**Finding:** Match exhaustiveness silently evaporates when `T` widens to plain `string`; a missed value renders invisible `Empty()`.
**Mode:** refute-by-code-reading + empirical reproduction against a fresh `tsc` build of v6.2.0.
**Verdict: refuted = false.** Every empirical claim in the finding reproduced exactly; no guard, overload trick, lint rule, or documented semantic exists that neutralizes it.

## What I tried in order to refute

### 1. Overload resolution might not pick the "exhaustive" overload for plain `string`
No. With two arguments only the no-default overload (`src/control/conditionals.ts:118-121`) is applicable (the partial form at :123-127 requires a third `defaultView` argument). `T` infers as `string`, and the mapped type `{ [K in string]: Thunk<View> }` is definitionally an index signature `{ [x: string]: Thunk<View> }`, to which the literal `{ a: () => Span("A") }` is assignable. Confirmed by compilation:

```
const s: string = "whatever";
render(Match(s, { a: () => Span("A") }));   // compiles clean, tsc --strict, exit 0
```

The same repro file contains a control proving the exhaustive overload *does* work for literal unions — `// @ts-expect-error` on a `"a" | "b"` value with a missing case is satisfied — so the failure is specifically the widening, exactly as claimed.

### 2. Runtime might not be a silent blank
It is. Ran the compiled repro against `dist/src`:

```
widened-string-miss: ""                    // Match("whatever", { a }) → Empty, no diagnostic
widened-string-hit:  "<span>A</span>"
partial-default:     "<span>FALLBACK</span>"
```

The miss path is `conditionals.ts:172`: `((casesOrDefault as Thunk<View> | undefined) ?? Empty)()` — with two args `casesOrDefault` is `undefined`, so `Empty()` renders `""`. No throw, no warning.

### 3. The JSDoc claim might not actually promise this
It does. `conditionals.ts:75`: "Without a default, TypeScript ensures every possible value has a handler (exhaustive)." For `T = string` that guarantee is void while the call still compiles in the no-default form — the doc contract is violated, not merely under-delivered.

### 4. An external guard might mitigate it
Checked `fluent-html-eslint-plugin/src/rules/` (all 30+ rules): no rule concerning `Match` exhaustiveness or widened discriminants. No runtime dev-mode warning exists in the implementation either.

### 5. It might be an unfixable inherent TS limitation (i.e., "not a defect, just TypeScript")
The proposed fix works as advertised. Verified with a standalone overload pair using
`value: string extends T ? never : number extends T ? never : T`:
- literal-union exhaustive call: compiles
- literal-union with missing case: rejected (as before)
- widened `string` in no-default form: **rejected** (new)
- widened `string` in partial-with-default form: compiles

`tsc --strict` exit 0 with both `@ts-expect-error` markers satisfied. So the gap is closable with a type-level change and no runtime cost.

## Notes on severity framing
The finding's classification (issue, medium) is fair: this is a type-contract/documentation gap, not a runtime crash. The blast radius is real though — unvalidated strings (DB columns, route params) are precisely the values that will be plain `string`, and the failure mode (blank SSR output) gives no signal. One caveat for the fixer: the conditional-type-in-value-position pattern can degrade inference for *generic wrappers* that forward an unresolved `T` into `Match`; direct call sites (the overwhelming majority) are unaffected.

## Repro artifacts
- `/private/tmp/claude-501/-Users-tony-jt-digital-fluent-html/f2f45330-dea1-49ee-a197-fd7d0ee2bfc5/scratchpad/cf4/repro.ts` (compile + runtime repro)
- `/private/tmp/claude-501/-Users-tony-jt-digital-fluent-html/f2f45330-dea1-49ee-a197-fd7d0ee2bfc5/scratchpad/cf4/fixcheck.ts` (fix-pattern validation)
