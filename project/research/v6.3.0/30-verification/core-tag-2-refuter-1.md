# Verdict: core-tag-2 — NOT REFUTED (defect confirmed)

**Finding:** setClass/setClasses inside `.on()`/`.at()` wipe accumulated classes and ignore the variant prefix.

**Mode:** refute-by-code-reading + runtime confirmation. I could not find any check, guard, or semantic that makes this a non-issue.

## Code reading

- `src/core/tag.ts:111-114` — `setClass(c) { this.class = c; return this; }`. Unconditional replace; never consults `_variantPrefix`.
- `src/core/tag.ts:329-332` — `setClasses(classes) { this.class = classes.filter(Boolean).join(" "); }`. Same: unconditional replace, no `_variantPrefix` check.
- `src/core/tag.ts:126-130` — `addClass` is the *only* class method that consults `_variantPrefix` (repo-wide grep for `_variantPrefix` hits only `addClass`, the field declaration at `tag.ts:546`, and `withVariant`).
- `src/core/tailwind-methods.ts:130-141` — `withVariant` sets `tag._variantPrefix` and passes the **same mutable tag** to the callback; the callback type is `(tag: this) => this`, so the full Tag API (including `setClass`/`setClasses`) is available inside the variant scope. No type-level restriction, no runtime guard, no throw.

## Runtime confirmation (dist/src/index.js, current build)

```
Div().padding('4').on('hover', t => t.setClass('foo'))
  → <div class="foo">                        // p-4 wiped, no hover: prefix, no error

Div().padding('4').on('hover', t => t.setClasses(['foo','bar']))
  → <div class="foo bar">                    // same double failure

Div().padding('4').on('hover', t => t.background('red-500'))
  → <div class="p-4 hover:bg-red-500">       // control: fluent path works correctly
```

## Refutation attempts considered and rejected

1. **"`set*` replaces by convention, so the wipe is documented behavior."** The wipe alone might be defensible under the set-overrides convention, but the *second* failure is not: the callback is explicitly scoped to `hover`, yet the emitted class carries no `hover:` prefix, so a class the author wrote as hover-scoped applies unconditionally. No documentation (README, JSDoc on `setClass`/`on`/`at`) mentions or sanctions this interaction.
2. **"Maybe the render path or a proxy fixes it up."** No — runtime output above is from the real render pipeline; the raw class string ships as-is.
3. **"Maybe types prevent it."** No — `on(state, fn: (tag: this) => this)` hands the full interface to the callback.

## Verdict

**refuted = false, confidence = high.** Both silent failures reproduce exactly as claimed. The proposed fix (throw from `setClass`/`setClasses` when `_variantPrefix !== null`) is sound: there is no coherent meaning for class-replace inside a variant scope, and today's behavior corrupts styling silently.
