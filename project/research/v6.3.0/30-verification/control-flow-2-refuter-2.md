# Verdict: control-flow-2 — CONFIRMED (refutation failed)

**Finding:** Match resolves handlers through the prototype chain (`toString`/`constructor`) — MatchValue guards, Match does not.
**Mode:** refute-by-reproduction against `dist/`.
**Result:** Reproduced exactly as described. `refuted = false`.

## Source inspection

`src/control/conditionals.ts` — both lookup sites do a bare property access with a truthiness check:

- DU path (lines 158–163):
  ```typescript
  const cases = casesOrDefault as Record<string | number, ((value: unknown) => View) | undefined>;
  const handler = cases[discriminant];
  if (handler) {
    return handler(value);
  }
  ```
- Value path (lines 167–172):
  ```typescript
  const cases = casesOrKey as Record<string | number, Thunk<View> | undefined>;
  const handler = cases[value as string | number];
  if (handler) {
    return handler();
  }
  ```

Neither guards against inherited `Object.prototype` members. The sibling `src/control/match-value.ts:32` does:
```typescript
return Object.prototype.hasOwnProperty.call(cases, value) ? cases[value as string] : defaultValue;
```

## Reproduction (node against `dist/src/index.js`)

```javascript
const { Match, MatchValue, Span, render } = require('./dist/src/index.js');
render(Match('toString',    { a: () => Span('A') }, () => Span('DEFAULT')));  // "[object Undefined]"
render(Match('constructor', { a: () => Span('A') }, () => Span('DEFAULT')));  // ""
render(Match('zzz',         { a: () => Span('A') }, () => Span('DEFAULT')));  // "<span>DEFAULT</span>" (control)
render(Match({ status: 'toString' },    'status', { a: (s) => Span('A') }, () => Span('DEFAULT'))); // "[object Undefined]"
render(Match({ status: 'constructor' }, 'status', { a: () => Span('A') },  () => Span('DEFAULT'))); // ""
render(Match('__proto__',   { a: () => Span('A') }, () => Span('DEFAULT')));  // throws TypeError: handler is not a function
MatchValue('toString', { a: 'A' }, 'DEFAULT');                                 // "DEFAULT" (correctly guarded)
```

Observed output:

| Input | Expected | Actual |
|---|---|---|
| `Match("toString", …, default)` (value) | `<span>DEFAULT</span>` | `[object Undefined]` |
| `Match("constructor", …, default)` (value) | `<span>DEFAULT</span>` | `` (empty) |
| `Match({status:"toString"}, "status", …, default)` (DU) | `<span>DEFAULT</span>` | `[object Undefined]` |
| `Match({status:"constructor"}, "status", …, default)` (DU) | `<span>DEFAULT</span>` | `` (empty) |
| `Match("__proto__", …, default)` (value) | `<span>DEFAULT</span>` | **throws** `TypeError: handler is not a function` mid-render |
| `MatchValue("toString", …, "DEFAULT")` | `DEFAULT` | `DEFAULT` ✓ (guarded sibling) |

## Analysis of failure modes

- **`toString`**: bare lookup finds `Object.prototype.toString`, which is a function and truthy → invoked unbound as the handler. Its return value (`"[object Undefined]"`, a string) is a valid `View`, so it renders as page content instead of the default view.
- **`constructor`**: lookup finds `Object` (a function, truthy) → invoked as handler; `Object()` returns `{}`, which renders as empty output — the default view is silently skipped.
- **`__proto__`**: lookup on an object literal returns `Object.prototype` (truthy, not a function) → `handler(...)` throws a `TypeError` mid-render.

The partial-cases + default overloads exist precisely for values wider than the handled set, i.e. potentially user-influenced strings, so these are reachable in legitimate usage, and the behavior is inconsistent with `MatchValue`.

## Verdict

**CONFIRMED.** Cannot refute: every claimed symptom reproduces against the built `dist/` exactly as stated in the finding, and the proposed fix (mirror `match-value.ts:32`'s `hasOwnProperty` guard plus a `typeof handler === "function"` check at both lookup sites) directly addresses all three failure modes.
