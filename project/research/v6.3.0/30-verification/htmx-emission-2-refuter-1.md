# Verification: htmx-emission-2 — Partial() corrupts non-id targets by force-prefixing '#'

**Verdict: CONFIRMED (refutation failed)**
**Mode:** refute-by-code-reading + runtime check
**Verifier:** refuter-1

## Attempted refutations

### 1. "Maybe the parameter is only meant for ids"
Refuted-refutation. The signature is `target: HxTarget | Id` (src/patterns.ts:37), and
`HxTarget = StandardCSSSelector | ExtendedCSSSelector` where `StandardCSSSelector = string`
(src/htmx.ts:69-82). The JSDoc on `Partial` explicitly says:
`@param target - CSS selector string or Id object` (src/patterns.ts:25).
So arbitrary CSS selectors are part of the documented, typed contract — not misuse.

### 2. "Maybe the selector builders aren't meant to feed Partial"
The shipped builders `clss()`, `closest()`, `find()`, `next()`, `previous()`
(src/htmx.ts:388-434) all return `HxTarget`, which is exactly the type `Partial` accepts.
TypeScript accepts `Partial(clss("items"), …)` with zero friction; nothing in code, types,
lint rules, or JSDoc warns against it.

### 3. "Maybe there's a guard that strips or detects non-id selectors"
There is none. The whole normalization is one expression (src/patterns.ts:41-42):

```ts
const selector = isId(target) ? target.selector :
  target.startsWith('#') ? target : `#${target}`;
```

Any string not starting with `#` gets `#` prepended unconditionally.

### 4. "Maybe it works at runtime anyway"
Runtime-reproduced against the built package (`dist/src/index.js`):

```
Partial(clss('items'), 'X')    → <hx-partial hx-target="#.items" …>
Partial(closest('tr'), 'X')    → <hx-partial hx-target="#closest tr" …>
Partial(find('.content'), 'X') → <hx-partial hx-target="#find .content" …>
```

`#.items` is an invalid CSS selector; `#closest tr` / `#find .content` are neither valid
CSS nor valid htmx extended selectors. The declared target can never match, so the swap
silently no-ops (or errors in querySelector), exactly as the finding claims.

### 5. "Maybe intended behavior is id-only convenience"
The tests (test/patterns.ts:144-169) only exercise bare ids (`"user-list"` → `"#user-list"`)
and already-prefixed ids (`"#sidebar"`). They confirm the bare-id convenience is intended,
but no test covers class or extended selectors — the corrupting path is simply untested,
not guarded. All README/docs examples use `Id` objects, so the bug is latent in shipped
apps but fully reachable through the public typed API.

## Conclusion

Every refutation angle fails. The defect is real: the type contract and JSDoc invite any
CSS selector (including outputs of the library's own `clss`/`closest`/`find` builders),
and line 41-42 of src/patterns.ts corrupts every one that doesn't start with `#`.

The proposed fix is sound: pass strings through verbatim, or restrict the bare-id
convenience to strings matching `/^[A-Za-z][\w-]*$/` (which also keeps the existing
tests green).

**refuted = false, confidence = high**
