# Verification: core-tag-7 — refuter 2 (refute-by-reproduction)

**Verdict: CONFIRMED (not refuted).** Both halves of the finding reproduce against the built `dist/`.

## Reproduction

Script: `repro-core-tag-7.mjs` (scratchpad), run with Node v26 against `dist/src/index.js` + `dist/src/render/index.js`. The dist build matches current `src/core/tag.ts` (same `c.split(" ")` at `dist/src/core/tag.js:88`, same `this.attributes[key] = value` in `addAttribute`).

```js
const t1 = Div().on('hover', t => t.addClass('a  b'));   // double space
render(t1);
// R1:  <div class="hover:a hover: hover:b"></div>       ← dangling bare "hover:" class

const t1b = Div().on('hover', t => t.addClass('a b'));   // single space (control)
// R1b: <div class="hover:a hover:b"></div>              ← correct

const t2 = Div().addAttribute('data-x', 'one').addAttribute('data-x', 'two');
// R2:  <div data-x="two"></div>                          ← silent replace, despite add* name
```

## Assessment of each claim

1. **addClass variant split on `" "` emits dangling `hover:`** — CONFIRMED by output R1. `src/core/tag.ts:127-129` splits on a single-space literal; a double space yields an empty segment that gets prefixed to a bare `hover:`. Consecutive whitespace of any kind (tabs, newlines from template literals) would produce the same or worse — e.g. `addClass('a\nb')` under a variant takes the no-space branch (`indexOf(' ') === -1`) and emits `hover:a\nb`, leaving `b` unprefixed entirely. Proposed fix `c.split(/\s+/).filter(Boolean)` addresses both.

2. **addAttribute overwrites despite the set*/add* convention** — CONFIRMED by output R2 and by code (`src/core/tag.ts:193`, `this.attributes[key] = value`). The convention is stated in the library's own JSDoc at `src/core/tag.ts:142-144` ("set* methods override and add* methods accumulate"). The finding correctly frames this as a naming inconsistency, not a behavioral bug — replace-per-key is the right semantics for an attribute map; the name is what's wrong. Note `setNonce` (tag.ts:204-210) already uses the `set*` name for the same replace-into-attributes operation, underscoring the inconsistency.

## Refutation attempts that failed

- Checked whether dist was stale (it wasn't — code identical to src).
- Checked whether the renderer deduplicates/normalizes class strings before emit (it doesn't — the dangling `hover:` survives into final HTML).
- Considered whether a bare `hover:` class is harmless: it is inert in CSS, but it pollutes emitted markup, can trip class-based extractors/safelist tooling, and is plainly unintended output.

## Conclusion

Finding stands as written. Evidence anchor (`src/core/tag.ts:193` and `:127-129`) is accurate; the confirmed repro in the finding matches byte-for-byte.
