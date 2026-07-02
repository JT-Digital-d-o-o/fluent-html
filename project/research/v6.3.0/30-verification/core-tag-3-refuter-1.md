# core-tag-3 — Refuter verdict: NOT REFUTED (finding confirmed)

**Finding:** Variant scope covers only `addClass` — `.toggle()`, `.addStyle()`, and attribute setters inside `.on()`/`.at()` apply unconditionally.

**Verdict: CONFIRMED.** I attempted to refute by locating a guard, check, or documented semantic that would make this a non-issue. None exists.

## Code-reading evidence

1. **`withVariant` sets the prefix on the whole tag** — `src/core/tailwind-methods.ts:130-141`. It assigns `tag._variantPrefix` and runs the callback on the same mutable tag; `p.on` / `p.at` (`tailwind-methods.ts:519-525`) are thin wrappers around it. The callback type is `(tag: this) => this` (`tailwind-methods.ts:150-151`) — the **full** mutation API, no facade, and no JSDoc caveat on either method.

2. **Only one consumer of the prefix.** `grep -rn "_variantPrefix" src/` yields exactly three sites: the field declaration (`src/core/tag.ts:546`), `withVariant` itself, and `addClass` (`src/core/tag.ts:126-130`). No other method reads it.

3. **The escape paths ignore it, unguarded:**
   - `toggle` (`src/core/tag.ts:220`) pushes into `this.toggles` directly.
   - `addStyle` (`src/core/tag.ts:171-175`) appends to `this.style` directly.
   - Attribute setters route through plain attribute assignment — no prefix check.
   - Inline-style emitters `anchorName` / `positionAnchor` / `positionArea` / `viewTransitionName` (`src/core/tailwind-methods.ts:917-923`) delegate to `addStyle`, so they escape the same way.
   - No `NODE_ENV` / dev-mode guard anywhere in `src/core/*.ts`.

## Empirical reproduction (built `dist/src/index.js`, v6.2.0)

```
render(Input().on('disabled', t => t.toggle('disabled')))   → <input disabled>                    // always disabled
render(Div().at('md', t => t.addStyle('color: red')))       → <div style="color: red"></div>       // every breakpoint
render(Div().on('hover', t => t.background('red-500')))     → <div class="hover:bg-red-500"></div> // classes scope correctly
render(Div().at('md', t => t.positionArea('top-left')))     → <div style="position-area: top left"></div>
render(Input().on('focus', t => t.setPlaceholder('oops')))  → <input placeholder="oops">           // unconditional
```

Both repro cases in the finding reproduce exactly as claimed, plus two additional escape paths (attribute setters, `positionArea`).

## Refutation angles considered and rejected

- **"By design / documented":** the `on`/`at` declarations carry no JSDoc, and no source-level documentation restricts the callback to class-emitting methods. The `(tag: this) => this` signature actively advertises the full API.
- **"Dev-mode guard exists elsewhere":** no `process.env` / warn / throw path exists in `src/core`.
- **"Harmless":** `Input().on('disabled', t => t.toggle('disabled'))` silently renders a permanently disabled control — wrong output, no error, in a plausible user expression.

The finding's evidence anchors, repro claims, and mechanism description are all accurate.
