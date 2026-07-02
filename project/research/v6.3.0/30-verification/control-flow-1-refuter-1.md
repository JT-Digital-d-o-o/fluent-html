# control-flow-1 — Refuter 1 verdict: NOT REFUTED (CONFIRMED)

**Finding:** `IfThen`/`IfThenElse` nullable overload breaks for boolean-typed values (callback gets `undefined` or is skipped).
**Mode:** refute-by-code-reading + independent reproduction.
**Verdict:** Could not refute. Both the type-level and runtime halves of the finding reproduce exactly as stated. **refuted = false, confidence = high.**

## Refutation avenues attempted

### 1. "Maybe TS picks the boolean-condition overload, so no type lie exists" — fails

Checked with `tsc --strict --noEmit` against `dist/src/index.d.ts`:

```typescript
declare const flag: boolean | null;
IfThen(flag, (v) => {
  const definitelyBoolean: boolean = v;  // compiles clean → v: boolean (definite)
  ...
});
```

Exit 0. `boolean | null` is not assignable to the first overload's `condition: boolean` under strict null checks, so resolution falls to `IfThen<T>(value: T | null | undefined, then: (value: T) => View)` with `T = boolean`. The callback parameter is typed as a **definite `boolean`**. Same for `IfThenElse`. A `@ts-expect-error` probe confirmed `v` is not `any`. The type contract genuinely promises `cb(false)` runs and `cb` receives a real boolean.

### 2. "Maybe a runtime guard handles it" — fails

`src/control/conditionals.ts:63-64` (and `:30-31` for `IfThenElse`):

```typescript
if (typeof conditionOrValue === 'boolean') {
  return conditionOrValue ? (then as Thunk<View>)() : Empty();
}
```

The `typeof` dispatch fires **before** the `!= null` check and unconditionally reinterprets the value as a condition. There is no guard distinguishing "boolean passed as condition" from "boolean passed as nullable value" — they are runtime-indistinguishable, exactly as the finding says. Reproduced against `dist/`:

| Call | Types promise | Actual output |
|---|---|---|
| `IfThen(false as boolean\|null, v => Span('got:'+v))` | `<span>got:false</span>` | `""` |
| `IfThen(true as boolean\|null, v => Span('got:'+v))` | `<span>got:true</span>` | `<span>got:undefined</span>` |
| `IfThenElse(false as boolean\|null, v => Span('then:'+v), () => Span('else'))` | `<span>then:false</span>` | `<span>else</span>` |
| `IfThenElse(true as boolean\|null, …)` | `<span>then:true</span>` | `<span>then:undefined</span>` |

The `true` case is the worst variant: the callback is invoked with **zero arguments** (`(then as Thunk<View>)()`), so a parameter statically typed as definite `boolean` holds `undefined` at runtime.

### 3. "Maybe this is documented/pinned as intended semantics" — fails

- JSDoc (conditionals.ts:8, :43): "When called with a nullable value, narrows the type and passes the non-null value to the callback" — no boolean carve-out.
- `test/control-flow.test.ts:48-60` explicitly pins the design contract under the heading *"Falsy non-null values — must pass through, not be swallowed"*: `0`, `""`, and `NaN` all reach the callback. Boolean `false` is the **only** falsy non-null value that gets swallowed — an accident of overload dispatch order, not a documented semantic.
- No test exercises `boolean | null`; the behavior is unpinned and contradicts the library's own stated falsy-passthrough principle.

### 4. Severity/reachability check — realistic

Not exotic: any nullable boolean field (Prisma `Boolean?`, tri-state flags) typed `boolean | null` silently resolves to the broken overload with zero compiler feedback. `false` (a legitimate, meaningful non-null value) renders nothing; `true` leaks `undefined` into typed code.

## Note on the proposed fix

The proposal (`boolean extends T ? never : T | null | undefined` on the nullable overload) is sound in direction. One nuance for implementation: with the nullable overload rejected, `boolean | null` then matches **no** overload (it is also not assignable to `condition: boolean`), producing a compile error that pushes callers to `flag === true` / `flag != null` — which is the intended outcome, but the error message will be an overload-resolution failure rather than a targeted diagnostic. Acceptable; just worth a doc line.

## Conclusion

The check the finding describes exists exactly as described, no guard or documented semantic neutralizes it, and both failure modes reproduce byte-for-byte from `dist/`. **Finding stands.**
