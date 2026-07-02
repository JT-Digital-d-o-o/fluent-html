# Verification: type-honesty-2 — refuter 2 (refute-by-reproduction)

**Verdict: CONFIRMED — refutation failed.** The defect reproduces exactly as described, at both the type level and runtime, against the built `dist/`.

## Source inspection

- `src/core/tag.ts:245-254` — `when` declares the generic overload **first**: `when<T>(condition: T | null | undefined, fn: (tag: this, value: NonNullable<T>) => unknown)`. Nothing excludes `T = boolean`. The implementation's boolean branch (`tag.ts:248-249`) calls `(fn as (tag: this) => unknown)(this)` — no second argument.
- `src/core/tag.ts:265-276` — `whenElse` declares the boolean overload first, but a two-param `thenFn` fails the boolean overload's arity check and falls through to the generic overload with `T = boolean`; boolean branch (`:269`) again calls `thenFn` with no value.
- `src/control/conditionals.ts:57-70` (`IfThen`) and `:23-37` (`IfThenElse`) — same pattern: generic overload accepts `T = boolean`; boolean branch invokes the callback zero-arg.
- Overload-ordering inconsistency claim also checks out: `when` is generic-first (245/246), `whenElse` and `IfThen`/`IfThenElse` are boolean-first — and both orderings leak, since ordering only matters when both overloads are applicable.

## Reproduction

Probe: `/private/tmp/claude-501/.../scratchpad/th2/probe.ts`, compiled with the repo's own `tsc` under `"strict": true` against `dist/src/index.d.ts` (dist is newer than `src/core/tag.ts`, so it reflects current source).

**Type level — all four compile clean (`tsc` exit 0) under `--strict`:**

```typescript
IfThen(isAdmin, (v: boolean) => ...)                                  // T = boolean via generic overload
IfThenElse(isAdmin, (v: boolean) => ..., () => ...)
Div().when(isAdmin, (t: Tag, value: boolean) => t)
Div().whenElse(isAdmin, (t: Tag, value: boolean) => t, (t: Tag) => t)
```

(The annotated one/two-param callbacks are not assignable to the boolean overloads' `Thunk<View>` / `(tag) => unknown` shapes, so overload resolution lands on the generic overload with `T = boolean` in every case — regardless of which overload is listed first.)

**Runtime — executed against `dist/src/index.js` with `isAdmin = true`:**

```
IfThen callback arg:  undefined undefined
IfThenElse then arg:  undefined undefined
when callback value:  undefined undefined
whenElse then value:  undefined undefined
rendered IfThen:      <div>v=undefined</div>
```

Every callback whose signature claims `boolean` / `NonNullable<T>` receives `undefined`. The rendered output (`v=undefined`) shows this is user-observable, not just a typing curiosity.

## Notes on secondary claims

- The proposal's premise holds: only the `condition === true` path reaches the callback in the boolean branch, so passing `condition` through (`fn(this, condition)` / `then(conditionOrValue)`) would hand the callback `true`, a legal inhabitant of the claimed type, and zero-arg thunks ignore extra arguments in JS.
- Minor nuance (does not weaken the finding): an *un-annotated* single-param callback like `IfThen(isAdmin, (v) => ...)` gets `v: boolean` inferred via `T = boolean` rather than implicit-`any` in my probe environment — the "implicit-any" phrasing in the finding overstates that corner slightly, but the annotated-probe behavior, the core type lie, and the runtime `undefined` are all exactly as reported.

## Conclusion

Not refutable. Type-level acceptance and runtime `undefined` both reproduce on `IfThen`, `IfThenElse`, `Tag.when`, and `Tag.whenElse`.
