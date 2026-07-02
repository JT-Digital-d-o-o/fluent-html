# Verdict: type-honesty-1 — CONFIRMED (refutation failed)

**Finding:** Match looks up handlers on the prototype chain — typed calls render "[object Undefined]" or throw.
**Mode:** refute-by-reproduction against `dist/` (v6.2.0, `dist/src/index.js`).
**Verdict:** NOT refuted. Every claimed behavior reproduced exactly.

## Source inspection

`src/control/conditionals.ts` matches the finding's anchors:

- Line 159 (DU form): `const handler = cases[discriminant]; if (handler) return handler(value);` — bare truthy lookup, no own-property guard.
- Line 168 (value form): `const handler = cases[value as string | number];` — same.
- The sibling `src/control/match-value.ts:32` already guards with `Object.prototype.hasOwnProperty.call(cases, value)`, so the inconsistency claim is accurate too.

Compiled `dist/src/control/conditionals.js` (lines 27–37) carries the same unguarded lookups.

## Runtime reproduction (node, real `render()` from dist)

```
toString case      => "[object Undefined]"        // expected "<span>DEFAULT</span>"
constructor case   => ""                          // default never runs; Object() rendered as ""
DU hasOwnProperty  => TypeError: Cannot convert undefined or null to object
sanity a           => "<span>A</span>"            // control: normal match works
sanity default     => "<span>DEFAULT</span>"      // control: default works for non-proto keys
```

Repro calls:

- `Match("toString", { a: () => Span("A") }, () => Span("DEFAULT"))` → the inherited `Object.prototype.toString` is truthy, gets invoked as a zero-arg handler, and its return string is rendered as `[object Undefined]`. Matches the finding verbatim.
- `Match("constructor", { a: ... }, () => Span("DEFAULT"))` → inherited `Object` constructor invoked; renders `""`; the default thunk is silently skipped. Matches verbatim.
- `Match({ status: "hasOwnProperty" }, "status", { active: ... }, () => Span("DEFAULT"))` → inherited `hasOwnProperty` invoked with `this === undefined` → `TypeError: Cannot convert undefined or null to object`. Matches verbatim.

## Type-level reachability

A probe with **no casts** typechecks clean under `tsc --strict` against the published `.d.ts`:

```typescript
declare const userInput: string;
Match(userInput, { a: () => Span("A") }, () => Span("DEFAULT"));      // partial-with-default overload

declare const state: { status: string };
Match(state, "status", { active: (s) => Span("ACTIVE") }, () => Span("DEFAULT"));
```

`TYPECHECK PASSED` — so any widened string (user input, DB value, parsed param) flowing into the partial-with-default overloads reaches the defect through the typed API. The reachability claim holds.

## Proposal sanity

Guarding both lookups with `Object.prototype.hasOwnProperty.call(cases, key)` (mirroring `match-value.ts:32`) fixes all three repro cases; a `typeof handler === "function"` check additionally covers an explicit `undefined` case value. No API change required. Proposal is sound.

## Conclusion

`refuted = false`, confidence **high**. The defect is real, reachable through the typed surface without casts, and reproduces deterministically against the shipped dist.
