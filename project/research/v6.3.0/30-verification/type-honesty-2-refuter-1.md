# Verification: type-honesty-2 (refuter pass 1)

**Verdict: NOT REFUTED — finding CONFIRMED (high confidence)**

## Finding under test

Boolean conditions match the nullable-value overloads of `IfThen`/`IfThenElse`/`when`/`whenElse`; the callback's "narrowed" value parameter (typed `T` / `NonNullable<T>`) is `undefined` at runtime.

## Refutation angles attempted

1. **"The boolean overload wins resolution, so the value-taking callback never binds"** — fails. For `IfThen(isAdmin, (v: boolean) => View)`, the boolean-first overload requires `then: Thunk<View>` (zero params); a one-param arrow is not assignable to a zero-param function type, so TS falls through to the generic overload and infers `T = boolean` (`boolean` is a legal inhabitant of `T | null | undefined` with no `T extends ...` constraint excluding it). Same fall-through for `IfThenElse` and `whenElse` (boolean-first) and directly for `when` (generic-first).
2. **"Strict mode rejects the extra parameter"** — fails. Compiled the four probes with `tsc --noEmit --strict` against `src/index.js`: **exit 0, zero diagnostics**.
3. **"A runtime guard passes the boolean through"** — fails. The implementations' boolean branches call the callback with no value argument:
   - `src/core/tag.ts:248-249` — `if (condition) (fn as (tag: this) => unknown)(this);`
   - `src/core/tag.ts:268-269` (`whenElse`) — `(thenFn as (tag: this) => unknown)(this);`
   - `src/control/conditionals.ts:63-64` (`IfThen`) — `(then as Thunk<View>)();`
   - `src/control/conditionals.ts:30-31` (`IfThenElse`) — `(thenBranch as Thunk<View>)();`

## Empirical evidence

Probes (scratchpad `th2-probe.ts` typecheck / `th2-run.mjs` runtime against `dist/src/index.js`):

```
tsc exit: 0            (all probes, --strict)

IfThen      value: undefined | typeof: undefined
IfThenElse  value: undefined | typeof: undefined
when        value: undefined | typeof: undefined
whenElse    value: undefined | typeof: undefined
v.toString() CRASHED: TypeError - Cannot read properties of undefined (reading 'toString')
```

The last probe is the concrete failure scenario: `IfThen(isAdmin, (v: boolean) => Div(v.toString()))` compiles clean (types promise `v: boolean`) and throws `TypeError` at render-build time when `isAdmin === true`.

## Evidence anchors verified

- `src/core/tag.ts:245-254` (`when` overloads + impl) — matches finding.
- `src/core/tag.ts:265-276` (`whenElse`) — matches; overload ordering is indeed boolean-first here vs generic-first on `when`, and both leak.
- `src/control/conditionals.ts:23-37` (`IfThenElse`), `:57-70` (`IfThen`) — match finding.

## Notes on the proposal

Passing the boolean through (`fn(this, condition)` / `then(conditionOrValue)`) is sound: only `true` reaches the callback in those branches, `true` inhabits `boolean`/`NonNullable<boolean>`, and existing zero-arg thunks ignore extra arguments in JS. The alternative (`T extends boolean ? never : T`) would instead turn the probes into compile errors; either resolves the dishonesty.

## Conclusion

The defect is real and reproducible end-to-end: compile-clean under `--strict`, `undefined` delivered where types claim `boolean`/`NonNullable<T>`, including a runtime crash when the callback dereferences the value. **refuted = false.**
