# core-tag-5 — Refuter 2 verdict: CONFIRMED (not refuted)

**Finding:** No class-conflict resolution — chain order does not determine the winning utility.
**Mode:** refute-by-reproduction against `dist/` (v6.2.0, `dist/src/index.js`).

## Reproduction

```js
const m = require('./dist/src/index.js');
m.render(m.Div().padding('4').when(true, t => t.padding('2')));
// => <div class="p-4 p-2"></div>

m.render(m.Div().padding('4').padding('2'));
// => <div class="p-4 p-2"></div>

const card = t => t.padding('6').background('white');
m.render(m.Div().apply(card).padding('2'));
// => <div class="p-6 bg-white p-2"></div>
```

All three emit **both** conflicting utilities. No dedup happens at render time.

## Source confirmation

`src/core/tag.ts:125` — `addClass` only concatenates (`this.class += ' ' + classes`); every
fluent styling method funnels through it. There is no conflict-group logic anywhere in the
render path (the emitted output above proves it end-to-end).

## Consequence check

- With `p-4 p-2` both present and equal specificity, the winner is the utility that appears
  **later in Tailwind's generated stylesheet**, not later in the chain. Tailwind sorts the
  spacing scale numerically, so `p-4` beats a later-chained `p-2` — the "later call overrides"
  idiom silently fails in exactly this direction.
- `FLUENT-STYLING.md:44-58` documents `.when()` (base + conditional restyle, e.g.
  `.when(isPrimary, t => t.background("blue-500"))`) and `.apply(preset)` composition without
  any warning that conflicting utilities are not resolved — the natural reading invites the
  broken pattern.
- `README.md:2262-2266` (fluent-html repo, documenting the ESLint plugin) states
  `// ⚠️ warn: conflicting classes — "p-8" overwrites "p-4" (same prefix)` — "overwrites"
  describes last-wins semantics the runtime does not have. (The finding's anchor
  "README.md:2265" is in the fluent-html README, not the plugin README — the plugin README is
  only 234 lines — but the cited text exists verbatim at that line.)
- Lint cannot see `.when()`/`.apply()`-conditional conflicts at all (they span callbacks /
  separate helper functions), so the unreliable-override case is invisible to tooling.

## Verdict

**refuted = false.** The defect reproduces exactly as described on the built package.
Only nit: the lint-message citation points at the wrong repo's README, but the quoted line
exists verbatim in `fluent-html/README.md:2265`; substance of the finding is fully accurate.
