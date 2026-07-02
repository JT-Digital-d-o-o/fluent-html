# Refuter verdict: control-flow-2 — NOT REFUTED (bug confirmed)

**Finding:** `Match` resolves handlers through the prototype chain (`toString`/`constructor`) — `MatchValue` guards, `Match` does not.
**Anchor:** `src/control/conditionals.ts:159` (DU path) and `:168` (value path).
**Verdict:** CONFIRMED. I attempted to refute by code reading and by exercising both the runtime and the type layer; every refutation angle failed.

## What I checked

### 1. Source reading — no guard exists

`src/control/conditionals.ts`:

- DU path (lines 158–163): `const handler = cases[discriminant]; if (handler) { return handler(value); }` — bare property read, truthiness check only.
- Value path (lines 167–172): `const handler = cases[value as string | number]; if (handler) { return handler(); }` — same.

An object literal (`{ a: () => … }`) inherits from `Object.prototype`, so `cases["toString"]` yields the inherited `Object.prototype.toString` function, which is truthy and gets invoked as a handler. No `hasOwnProperty` guard, no `Object.create(null)`, no key sanitization anywhere on the path.

The sibling `src/control/match-value.ts:32` uses exactly the guard the finding proposes: `Object.prototype.hasOwnProperty.call(cases, value)` — confirming this is a known-correct pattern in the same codebase, inconsistently applied.

### 2. Runtime execution against `dist/` — defect reproduces, and is worse than reported

Ran via `dist/src/index.js` (the published entry point):

| Input | Expected (default) | Actual |
|---|---|---|
| `Match("toString", {a: …}, () => Span("DEFAULT"))` | `<span>DEFAULT</span>` | `"[object Undefined]"` rendered into the page |
| `Match("constructor", …, default)` | `<span>DEFAULT</span>` | `""` (Object constructor invoked, `{}` rendered as empty) |
| `Match("__proto__", …, default)` | `<span>DEFAULT</span>` | **throws** `TypeError: handler is not a function` |
| `Match("hasOwnProperty", …, default)` | `<span>DEFAULT</span>` | **throws** `TypeError: Cannot convert undefined or null to object` |
| DU form `Match({status: "toString"}, "status", …, default)` | DEFAULT | `"[object Undefined]"` |
| DU form with `"__proto__"` | DEFAULT | **throws** `TypeError` |
| Sanity: `"a"` hit / `"zzz"` miss | A / DEFAULT | correct |

So beyond the finding's claimed wrong-output cases, `"__proto__"` and `"hasOwnProperty"` **throw mid-render** in both forms — an attacker-triggerable 500 on any page that matches on a user-influenced string.

### 3. Type-layer refutation attempt — types do not prevent wide strings

The partial+default overloads are generic over `T extends string | number` with `cases: Partial<{[K in T]: …}>`. When `T = string`, `Partial<Record<string, Thunk>>` accepts any small case record. Verified with `tsc --strict`: both

```ts
declare const userInput: string;
Match(userInput, { a: () => Span("A") }, () => Span("DEFAULT"));

declare const obj: { status: string };
Match(obj, "status", { a: (_s) => Span("A") }, () => Span("DEFAULT"));
```

compile **clean**. The partial+default form is explicitly designed for values wider than the handled set, so user-influenced strings reaching the lookup is the intended use case, not a misuse.

## Conclusion

No guard, check, or semantic makes this a non-issue. The defect reproduces exactly as described against the built dist, the type system permits the triggering inputs, and the sibling `MatchValue` demonstrates the intended (guarded) behavior. The proposed fix — mirroring `match-value.ts:32`'s `hasOwnProperty` guard at both lookup sites (ideally combined with a `typeof handler === "function"` check) — is correct and also covers the throwing `__proto__`/`hasOwnProperty` cases found during verification.
