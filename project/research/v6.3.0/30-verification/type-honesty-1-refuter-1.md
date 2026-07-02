# Refuter verdict: type-honesty-1 — Match prototype-chain lookup

**Verdict: CONFIRMED (refutation failed).** I attempted to refute by code reading and runtime reproduction; every claim in the finding held.

## Code reading

`src/control/conditionals.ts` implementation (lines 148–173):

- DU form, line 159: `const handler = cases[discriminant]; if (handler) { return handler(value); }` — bare property access, truthy guard only.
- Value form, line 168: `const handler = cases[value as string | number]; if (handler) { return handler(); }` — same.

No `hasOwnProperty` guard, no `Object.create(null)` normalization, no key sanitization anywhere in the function. The case records come straight from the caller as plain object literals, so `Object.prototype` members (`toString`, `constructor`, `hasOwnProperty`, `valueOf`, …) are reachable through the lookup and are truthy functions, so they pass the `if (handler)` check and get invoked as handlers.

The sibling `MatchValue` (`src/control/match-value.ts:32`) already guards with
`Object.prototype.hasOwnProperty.call(cases, value)` — confirming the guard is the project's own established pattern and its absence in `Match` is an inconsistency, not a deliberate semantic.

## Type-level reachability (is this only reachable from untyped JS?)

No. The partial-with-default overloads accept `T extends string | number`. With a widened `string` (route param, DB field, query value), `Partial<{ [K in string]: Thunk<View> }>` collapses to an index signature, so `Match(someString, { a: () => … }, () => Default())` typechecks. Any runtime string equal to a prototype member name triggers the bug through fully typed code.

## Runtime reproduction (dist/src, via the library's own `render()`)

```
Match('toString',    { a: () => Span('A') }, () => Span('DEFAULT'))  -> "[object Undefined]"
Match('constructor', { a: () => Span('A') }, () => Span('DEFAULT'))  -> ""            (default never runs)
Match({ status: 'hasOwnProperty' }, 'status', { a: … }, () => …)     -> TypeError: Cannot convert undefined or null to object
Match('b', { a: () => Span('A') }, () => Span('DEFAULT'))            -> "<span>DEFAULT</span>"  (sanity)
Match('a', { a: () => Span('A') }, () => Span('DEFAULT'))            -> "<span>A</span>"        (sanity)
```

All three failure outputs match the finding's claims exactly, including the DU-form `TypeError` (`Object.prototype.hasOwnProperty` invoked with `this === undefined`).

## Refutation angles tried and rejected

1. **"A guard exists elsewhere"** — searched the implementation; none. Only `MatchValue` guards.
2. **"Unreachable through the type system"** — false; widened-string + partial-with-default overload compiles.
3. **"Default catches it"** — false; the truthy check on inherited functions short-circuits before the default, which is exactly the defect.
4. **"Renders harmlessly"** — false; observable wrong output (`"[object Undefined]"`, silently empty render) and a hard `TypeError` in the DU form.

## Conclusion

Defect confirmed as described. The proposed fix (mirror `match-value.ts:32`'s `Object.prototype.hasOwnProperty.call(cases, key)` guard on both lookups, lines 159 and 168) is correct and minimal; adding `typeof handler === "function"` is optional hardening since an own-property lookup on the typed case record already implies a function.
