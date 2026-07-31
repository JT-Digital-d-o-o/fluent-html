# Object Variants

## Problem

Variant lambdas cost ~10–14 chars of ceremony per group (`.on("hover", t => t.…)`), force `(t: Tag)` annotations, and carry two silent hazards: a callback that styles the wrong tag (`.on("hover", t => otherTag.bg(…))` compiles and applies no prefix) and silently empty callbacks. Variants are also the single largest residual divergence from the model's Tailwind prior after canonical names.

## Appetite

~1 week incl. tests + docs. **Breaking — ships in the same release as [canonical-names](../canonical-names/)** (object keys ARE the canonical names; separate releases = two vocabularies).

## Solution

Spike-proven 2026-07-31 (compile + runtime-verified, incl. 2-level nesting). Detail in [design.md](design.md):

- `.hover({ bg: "blue-600", scale: "105" })`, `.md({ px: "8" })`; nesting for stacks: `.md({ hover: { bg: "…" } })` → `md:hover:bg-…`. ~21 tier-1 variant methods + generic `.variant(name, obj)` for the long tail (`aria-[…]`, `data-[…]`, `has-[…]`, container queries, `2xl`).
- **Replaces `.on()`/`.at()` entirely** — all 25 real demo sites are object-expressible; conditionals become `undefined`-valued keys / boolean flags; presets spread (`.hover({ ...glow })`).
- `VariantStyleObject` + `KEY_EMIT` map generated from the vocab `valueType` field (shared with vocab-generator); ~60–80 hand LOC (`applyVariantObject` reuses `_variantPrefix` push/restore verbatim).
- Measured: −28.5% chars at variant sites; type-check cost is noise (+0.04 ms/site, excess-property checking is linear in provided keys); TS spell-checks keys and values two levels deep.

## Rabbit Holes

- No proxy chains (`.md.hover({…})`) — Proxy alloc per access, breaks `this`-typing on subclasses, defeats the flat generated interface.
- `2xl` is not an identifier — spike chose `xl2`; final naming is a scope decision (record it), container-query breakpoints stay `.variant()`-only.
- Extracted style consts bypass excess-property checking (the React-props hole) — mitigate with docs + an ESLint rule requiring `satisfies VariantStyleObject`, don't redesign the API around it.
- Multi-arg composite rows (`gradient`, `maskFrom`, `snap`) under a variant → readonly tuple values; only needed because `.on`/`.at` are fully removed.

## No-Gos

- No keeping `.on()`/`.at()` alongside (convergence — `.variant()` is the single generic form).
- No hand-written `KEY_EMIT`/interface — generated from vocab or not shipped.
