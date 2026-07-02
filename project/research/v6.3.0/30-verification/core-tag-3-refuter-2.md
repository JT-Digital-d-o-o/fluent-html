# core-tag-3 — Refuter 2 verdict: CONFIRMED (not refuted)

**Finding:** Variant scope covers only `addClass` — `.toggle()`, `.addStyle()`, attribute setters inside `.on()`/`.at()` apply unconditionally.

**Mode:** refute-by-reproduction against a fresh `npm run build` (`dist/src/index.js`, fluent-html 6.2.0, node v26).

## Reproduction

Probe: `/private/tmp/claude-501/-Users-tony-jt-digital-fluent-html/f2f45330-dea1-49ee-a197-fd7d0ee2bfc5/scratchpad/probe-core-tag-3.mjs`

| # | Input | Output | Verdict |
|---|-------|--------|---------|
| 1 | `Input().on('disabled', t => t.toggle('disabled'))` | `<input disabled>` | attribute emitted unconditionally — element is *always* disabled |
| 2 | `Div().at('md', t => t.addStyle('color: red'))` | `<div style="color: red"></div>` | inline style applies at every breakpoint, no `md:` scoping |
| 3 | control: `Div().on('hover', t => t.background('blue-600'))` | `<div class="hover:bg-blue-600"></div>` | class path correctly prefixed (confirms mechanism works only there) |
| 4 | `Button('x').on('focus', t => t.addAttribute('data-x', '1'))` | `<button data-x="1">x</button>` | attribute applied unconditionally |
| 5 | `Div().at('md', t => t.positionArea('top'))` | `<div style="position-area: top"></div>` | inline-style emitter escapes variant scope |

Both headline examples from the finding reproduce byte-for-byte, plus the attribute-setter and `positionArea` escape paths.

## Source confirmation

- `src/core/tailwind-methods.ts:130-141` — `withVariant` sets `tag._variantPrefix` and invokes the callback on the *same* tag with the full mutation API (`on(state, fn: (tag: this) => this)` at line 150).
- `grep _variantPrefix src/core/*.ts` — the prefix is consumed in exactly one place: `Tag.addClass` (`src/core/tag.ts:126-129`). No guard, warn, or throw exists in `toggle`/`addStyle`/`addAttribute` or anywhere else while a variant prefix is active.
- `src/core/tailwind-methods.ts:917-923` — `anchorName`/`positionAnchor`/`positionArea`/`viewTransitionName` all route through `addStyle`, so they silently escape variant scope exactly as the finding says.

## Verdict

**Not refuted.** The defect is real, silent (no error, no warning), and the API shape actively invites it — the variant callback exposes the full `Tag` surface while only the class channel honors the variant. Evidence anchor (tailwind-methods.ts:130) and both cited repro cases are accurate.
