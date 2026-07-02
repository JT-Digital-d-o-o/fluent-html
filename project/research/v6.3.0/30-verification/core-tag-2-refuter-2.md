# core-tag-2 — Refuter 2 verdict: NOT REFUTED (bug confirmed by reproduction)

**Finding:** setClass/setClasses inside `.on()`/`.at()` wipe accumulated classes and ignore the variant prefix.

**Mode:** refute-by-reproduction, run against the built `dist/` (verified `dist/src/core/tag.js` mtime is newer than `src/core/tag.ts`, so dist reflects current source).

## Reproduction

Probe (Node 26, ESM, importing `dist/src/index.js`):

```js
import { Div, render } from '.../dist/src/index.js';

render(Div().padding('4').on('hover', t => t.setClass('foo')));
// → <div class="foo"></div>            // BUG: p-4 wiped, no hover: prefix, no error

render(Div().padding('4').on('hover', t => t.addClass('foo')));
// → <div class="p-4 hover:foo"></div>  // control: addClass behaves correctly

render(Div().padding('4').on('hover', t => t.setClasses(['foo','bar'])));
// → <div class="foo bar"></div>        // BUG: same for setClasses

render(Div().padding('4').at('md', t => t.setClass('foo')));
// → <div class="foo"></div>            // BUG: same for .at() breakpoints
```

All three claimed symptoms reproduce:

1. **Pre-variant styling destroyed** — `p-4` is silently gone.
2. **Variant prefix ignored** — the class is emitted bare (`foo`, not `hover:foo` / `md:foo`), so the "hover-scoped" class applies unconditionally.
3. **Silent** — no error, no warning.

## Source confirmation

- `src/core/tag.ts:111-114` — `setClass(c) { this.class = c; }` replaces unconditionally and never reads `_variantPrefix`.
- `src/core/tag.ts:126-137` — only `addClass` consults `_variantPrefix`.
- `src/core/tailwind-methods.ts:130-141` — `withVariant` passes the same mutable tag to the callback with only `_variantPrefix` set, so any `set*` class method inside the callback has full destructive access.

`setClasses` (dist `tag.js:265`) joins and assigns to `this.class` directly — same defect, confirmed by repro 2 above.

## Verdict

**refuted = false, confidence = high.** The finding is accurate in every particular, including the exact repro (`Div().padding('4').on('hover', t => t.setClass('foo'))` → `<div class="foo">`). The proposal (throw from `setClass`/`setClasses` when `_variantPrefix !== null`) is reasonable: there is no coherent semantics for whole-attribute replacement inside a variant scope, and the current behavior fails twice, silently.

One note for the fixer: the guard must cover **both** `setClass` and `setClasses` (both reproduce).
