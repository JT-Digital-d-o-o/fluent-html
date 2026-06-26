# fluent-html v6 — Breaking Changes & Migration Guide

> ⚠️ **REFRAMED by curation (§1 greenfield).** v6 is a **new line for new projects** — existing apps stay on v5 — so there is **no migration to run** and no "concentrate breaking in v6.0" bundle. This file is no longer a migration gate; it now serves only as a **v5→v6 diff reference**. The authoritative diff is [`v6-spec.md`](./v6-spec.md) → *"What v6 cuts vs v5"*. The codemod/[mechanical]/[assisted] annotations below are obsolete (greenfield deletes outright, no `@deprecated` aliases). Read for the v5-contrast only.
>
> ~~**Wave-4 deliverable.** One migration, run once. Every breaking change in v6 is concentrated in the **v6.0** release so adopters upgrade a single time; **v6.1+ is purely additive**.~~

## TL;DR — what breaks, by surface

| # | Surface | RFC | Codemod scope | One-liner |
|---|---|---|---|---|
| 1 | Boolean attributes serialize correctly | A-01 | mechanical | `setChecked(false)` no longer renders `checked` |
| 2 | `setAria` key narrowing + `ariaDescribe` | A-02 | assisted | typed ARIA keys reject camelCase; auditor output changes |
| 3 | Tailwind transform type-surface | A-07 | mechanical | `.rotate("-45")` now type-checks (was an error); `-translate-y-1` emitted |
| 4 | `Overlay()` emits classes, not inline styles | A-09 | manual | CSP `style-src`, selectors, snapshots shift |
| 5 | No library `declare module "fastify"` | B-07 | manual | apps own their `request.user`/`renderView` augmentation; cookie-name default |
| 6 | `renderView` decorator signature narrows | B-09 | mechanical | single `renderView(view?, opts?)` shape; `RenderOptions` is one bag |
| 7 | Tailwind v4 default flip is **opt-in** | C-02/C-03 | mechanical+assisted | `setTailwindTarget("v4")` renames/scales; some semantic changes need review |
| 8 | `frozen` algebra arm on public algebras | D-01 | manual | custom `ViewAlgebra`/`ParaAlgebra` implementers add a `frozen` arm |
| 9 | CSP nonce no longer mutates the tree | D-04 | mechanical | `renderWithNonce` → `render(view, {nonce})`; precedence resolved |
| 10 | `escapeAttr` fast path (internal) | D-06 | none (note) | byte-identical inside double-quoted attrs |
| 11 | D-07 is fully additive — no breaking change | D-07 | none | `setStyles` unchanged (replace); F-D-073 fixed by docs only |

**Do this once, in order:** (1) bump to `@6`, default behavior is byte-identical for non-breaking paths; (2) run the lib codemod bundle (`npx @fluent-html/codemod v6`); (3) run `eslint --fix`; (4) work the **[manual]** checklist below; (5) (optional, separate step) flip Tailwind to v4 with `setTailwindTarget("v4")` + the v4 ESLint preset.

---

## 1. Boolean-attribute serialization (A-01) — [mechanical]

**What changed.** The older `_sk` serialization path emitted booleans via `String(value)`, so `setChecked(false)` produced `checked="false"` (**browsers treat any `checked` attribute as checked**) and `setDefer()` produced HTML-invalid `defer="true"`. v6 branches on a boolean-FIELD registry across all three emitters: `true` → bare attribute name, `false`/`null`/`undefined` → omitted.

**Why it can break you.** Any app that *relied on* the buggy `checked="false"` rendering an unchecked-but-present attribute (none should), or that snapshots boolean-attribute HTML, sees different output. The output is now correct HTML.

**Migration.**
- The typed boolean setters (`setChecked`/`setDisabled`/`setDefer`/`setReadOnly`/…) still exist and now render correctly, but are **`@deprecated` (removed in v7, not v6)**. Codemod rewrites them to `.toggle()`:
  ```ts
  // before                         after
  Input().setChecked(isOn)     →    Input().toggle("checked", isOn)
  Input().setDisabled()        →    Input().toggle("disabled")
  Script().setDefer()          →    Script().toggle("defer")
  ```
- `eslint --fix` rules: **`prefer-toggle`** (auto-fixes setter → `.toggle()`; report-only for non-`boolean` args) and **`no-set-toggles`** (`.setToggles(["a","b"])` → `.toggle("a").toggle("b")`, paying off 186 legacy sites).
- `BooleanAttribute` dropped its `(string & {})` tail: `.toggle("requried")` is now a **compile error** (fix the typo). New valid members: `nomodule`, `playsinline`, `selected`.
- Re-baseline any boolean-attribute HTML snapshots.

**Lesson encoded:** the v5.9 `setToggles` removal shipped without a codemod and froze 11 apps. v6 **deprecates, never removes**; removal waits for v7 *with* the codemod already in hand.

---

## 2. `setAria` key narrowing + `ariaDescribe` (A-02) — [assisted]

**What changed.** `setAria` is now typed: `AriaAttrs` keys are a **closed** union of lowercase single-token ARIA names (`label`, `labelledby`, `describedby`, `expanded`, `checked`, …) plus a `aria-${string}` template-literal escape arm. State keys take a real `boolean` (+ tristate `"mixed"`). `ariaDescribeAlgebra` now reads `aria-label`/`role`.

**Why it can break you.**
- camelCase keys no longer compile: `setAria({ hasPopup: … })` is an error — the correct key is `aria-haspopup` (single token, lowercase), so `setAria({ haspopup: true })`.
- `setAria({ lable: … })` (typo) is now a compile error instead of silently emitting `aria-lable`.
- The `ariaDescribe` auditor output changes (a labeled icon button is no longer described as `"button"`) → internal snapshot re-baseline (`test/recursion-schemes.ts`).

**Migration.**
- Codemod **flags** every `setAria({...})` call with a camelCase or unknown key and suggests the kebab/lowercase form. It cannot blindly rewrite (some keys are genuinely custom `aria-*`) → review each.
- For genuinely dynamic/custom ARIA, use the escape arm: `setAria({ "aria-rowindex": String(i) })`.
- Fix README:1803 and `test/patterns.ts:46/50` (the `hasPopup`→`aria-has-popup` example was wrong; the correct attribute is `aria-haspopup`).

---

## 3. Tailwind transform type-surface (A-07) — [mechanical]

**What changed.** `.translate("y","-1")` used to emit the invalid `translate-y--1` (silently dropped by Tailwind). v6 relocates the sign to emit valid `-translate-y-1` (same for `.rotate`/`.skewX`/`.skewY`). `TailwindRotate`/`TailwindSkew` are **widened to admit negative literals** — `.rotate("-45")` was a *compile error* before (which made the runtime fix dead code).

**Why it can break you.** This is a *correctness* change: a hover-lift that did nothing in production now works. If you worked around the bug by writing `addClass("-translate-y-1")` directly, that still works but is now redundant.

**Migration.**
- No action required for correct code — broken transforms start working.
- Optional codemod (v6.x): `addClass("-translate-…")` → `.translate(...)`/`.neg(...)`; `position("fixed")` → `.fixed()`.
- The extractor + ESLint vocab (via `@fluent-html/class-vocab`, C-05) recognize the new sign-relocated forms and the 11 zero-arg display/position shortcuts in the same release — no orphaned classes.

---

## 4. `Overlay()` emits Tailwind classes, not inline styles (A-09) — [manual]

**What changed.** `Overlay()` is rewritten variadic + fluent and now emits Tailwind classes (`relative`, `-translate-x-1/2`, `top-1/2`) instead of inline `style="..."`.

**Why it can break you.** Not codemod-able: it shifts the CSP surface (`style-src` no longer needs `'unsafe-inline'` for these; positioning moves to `class`), changes CSS selectors that targeted the inline-styled element, and breaks snapshots.

**Migration (checklist).**
- [ ] If your CSP allowed inline styles only for Overlay, you can tighten `style-src`.
- [ ] Update any selector/test that matched the old inline `style` attribute (`test/overlay.ts` ships 10 updated assertions as the reference; `test/composition.test.ts` updates too).
- [ ] Re-baseline Overlay snapshots.
- [ ] Confirm the fractional translate/inset classes (`-translate-x-1/2`, `top-1/2`, `left-1/2`) resolve in your Tailwind build (they are in the C-05/C-06 vocab → extractor safelist).

**Separately, additive (no break):** 15 type-only symbols (`HTMX`, `HxSwap`, `Id`, `OverlayPosition`, …) move from value-position `export {}` to `export type` — this *fixes* TS1205 re-export failures under `verbatimModuleSyntax`.

---

## 5. No library `declare module "fastify"` (B-07) — [manual]

**What changed.** The `@fluent-html/fastify` plugin does **not** ship a side-effect `declare module "fastify"` augmenting `request.user` / `reply.signIn` / `reply.signOut`. Apps own their own augmentation.

**Why it can break you.** A library-side augmentation collides with the app's (TS2717), widens `request.user` to `unknown`, and broke 261 call sites in the survey. The cookie-name default also matters: a default of `__sid` ≠ your existing cookie name = **silent session flush on deploy**.

**Migration (checklist).**
- [ ] Keep your existing `declare module "fastify"` block in the app (do **not** delete it expecting the lib to provide one). Type `request.user` as your `User`.
- [ ] Delete any local `reply.decorate("renderView", …)` — the plugin provides it; double-registration crashes with `FST_ERR_DECORATOR_ALREADY_PRESENT`. Do this in the same commit as adding the plugin.
- [ ] Set `cookieName` explicitly to your current session cookie (don't accept the default) or you log every user out on deploy.
- [ ] `@fastify/cookie` is a required seam (the zero-dep lib can't import it) — register it; the plugin exposes `sign`/`unsign`.
- [ ] If you used auth roles, note the typing is now `requireRole(...roles: TRole[])` (typed via the plugin's `TUser`/`Role`), not `...string[]`.
- [ ] `safeReturnTo` now rejects `//evil`, `/\evil`, `\evil`, scheme URLs, and CRLF — verify your redirect targets still pass (they should; these were always unsafe).

---

## 6. `renderView` decorator signature narrows (B-09 + D-04 + B-08) — [mechanical]

**What changed.** There is exactly **one** augmented reply signature: `renderView(view?: View | View[], opts?: RenderViewOptions): FastifyReply`. The old `renderView(view?): void` is replaced once. `RenderOptions` is a single options bag — D-04 owns `nonce`, B-09 adds `contexts`, B-08 adds the HTMX response options (`reswap`/`retarget`/`reselect`/`trigger`/`code`). There is **no** `*WithNonce` sibling and **no** polymorphic-arg0 overload of `render`/`renderToStream`.

**Why it can break you.** The return type changes (`void` → `FastifyReply`, enabling chaining) and the signature gains an options arg. Apps that re-declared their own narrower `renderView` augmentation must update it to match.

**Migration.**
- Update your app's `declare module "fastify"` `renderView` to the single shape `renderView(view?: View | View[], opts?: RenderViewOptions): FastifyReply`.
- Replace `renderToStreamWithNonce(view, nonce)` → `renderToStream(view, { nonce })`.
- Replace any parallel options bag with the shared `RenderOptions` (`{ nonce, contexts }`).
- For request-scoped context, use `renderView(view, { contexts: [entry(LocaleCtx, locale)] })` or `seedContext(server, ctx, loadFn)` — do **not** scope across an `await` manually.

> The render-options surface (the `RenderOptions.contexts` field + the decorator signature) ships in **v6.0** with D-04 so the signature changes exactly once; B-09's i18n companion (`createI18nContext`/`i18nPlugin`) follows additively in v6.1.

---

## 7. Tailwind v4 — the opt-in flip (C-02 + C-03) — [mechanical + assisted]

**What changed.** v6 adds a process-global `setTailwindTarget(target: "v3" | "v4")`. **Default is `"v3"` — installing v6 changes nothing.** The break occurs only when you deliberately call `setTailwindTarget("v4")`, as a single staged step. `setTailwindTarget` is a set-once-before-render singleton (documented footgun).

**Under `target: "v4"`:**

| Category | Behavior | Migration |
|---|---|---|
| **Renames** | `.gradientTo()` → `bg-linear-*`; new `.gradientRadial()`/`.gradientConic()` for `bg-radial`/`bg-conic` | automatic — [mechanical] |
| **Scale-shifts** | `.shadow("sm")`→`shadow-xs`, `.rounded`/`.blur`/`.backdropBlur` remap to preserve the v3 *look* | automatic; opt into the new slot with `.shadow("xs")` — [mechanical]. (Demoted to ESLint-flagged where a custom `@theme` ramp makes the auto-remap wrong.) |
| **Semantic (NOT auto-safe)** | `.outline("none")`→`.outlineHidden()` (a11y); bare `.ring()`→`.ring("3")`; bare `.border()` needs `.borderColor`; `.transition("transform")` set change; `Button()` needs explicit `.cursor("pointer")`; `.spaceX/Y()` selector change → prefer `.flex().gap()` | **ESLint-flagged/fixed** — [assisted] |
| **Hover→pointer** | `hover:` now gates on pointer devices (C-06) | review the 57 `.on("hover", …)` sites; use `.onPointerHover()` to make intent explicit — [assisted] |
| **Removed `*-opacity-*`** | `bg-opacity-50` family removed | `.background("black/50")` slash-opacity; `no-removed-v4-utilities` rule (message-only) — [manual] |

**Pipeline migration (C-02, docs):** `@import "tailwindcss"` (not `@tailwind base/components/utilities`); `@tailwindcss/postcss`; CSS-first `@theme` tokens (not `tailwind.config.js`). Wire the extractor: `fluentHtmlPlugin({ target: "v4", onUnresolved: "error" })` so a dropped dynamic-arg class is a **build failure**, not an invisible blank element. Switch the ESLint preset to `recommendedV4`.

**Migration (staged, per app):**
1. Migrate the build pipeline + extractor + ESLint preset.
2. `setTailwindTarget("v4")`.
3. `eslint --fix` (handles the autofixable call-level changes — renames, scale-shifts).
4. Work the ESLint-flagged semantic changes (outline/ring/border/transition/cursor/space) by hand.
5. Review the `.on("hover")` sites for the pointer-only shift.

> The default never flips to `v4` in v6 — that is a v7 (major) change. Apps on v3 stay byte-identical.

---

## 8. `frozen` algebra arm on public algebras (D-01) — [manual]

**What changed.** `Frozen(view)` introduces a `FrozenView` node (`_t: 3`). The public `ViewAlgebra`/`ParaAlgebra`/`ViewLayer` interfaces gain an **optional** `frozen` arm (default behavior: descend into `node.view`).

**Why it can break you.** Only if you implement a **custom** `ViewAlgebra`/`ParaAlgebra` (a fold/transform). The arm is optional with a default, so most implementers are unaffected; exhaustive-switch implementers must add a `frozen` case.

**Migration (checklist).**
- [ ] If you have a custom algebra with an exhaustive `assertNever`, add a `frozen` arm (descend into `node.view` unless you specifically handle frozen subtrees).
- [ ] Never `Frozen()` per-request data (user/csrf/nonce/locale) — freeze at module scope only. A frozen `<script>`/`<style>` subtree throws under nonce/fold analysis (CSP-bypass guard).

---

## 9. CSP nonce no longer mutates the tree (D-04) — [mechanical]

**What changed.** `renderWithNonce` was a pre-pass that permanently mutated the live `Tag` tree (`setNonce` wrote `attributes.nonce` and never restored it), so a shared/reused layout leaked the first request's nonce into every later plain `render()`. v6 threads nonce as a per-request render-time value: `render(view, { nonce })` / `renderToStream(view, { nonce })`.

**Why it can break you.** Nonce **precedence** is now defined: an author-set `.setNonce()` wins over the ambient render-time nonce (resolved per `_merge.md` §4 D-04.1). If you relied on the old "render-time overwrites author" behavior, output changes.

**Migration.**
- Replace `renderWithNonce(nonce, ...views)` → `render(views, { nonce })` (still exported, demoted to a legacy aside).
- Replace `renderToStreamWithNonce(view, nonce)` → `renderToStream(view, { nonce })` (the `*WithNonce` stream variant is **cut**).
- `nonce: ""` is now guarded (empty nonce = silently-broken CSP) — pass a real nonce.
- `.setNonce()` the method survives; only the mutating `applyNonce` traversal is removed.
- You can now stop setting `contentSecurityPolicy: false`.

---

## 10. `escapeAttr` fast path (D-06) — [none — note only]

**What changed.** A new **internal** `escapeQuotedAttr` fast path skips escaping `>`/`'`/`<` (inert inside double-quoted attributes) for the three serializers. The **public** `escapeAttr` stays `=== escapeHtml` (additive, unchanged).

**Why it (barely) matters.** Output is **byte-identical inside double-quoted attributes**. Skip-escape applies only on the numeric/boolean branch; string `value`/`width`/`height` stay fully escaped. No app action — listed only because `test/escape.ts:72-75` re-baselines internally.

---

## 11. D-07 is fully additive — no breaking change [none]

**No migration.** `setStyle`/`setStyles` are **unchanged** — both REPLACE the `style` attribute (`set*` = override). F-D-073 (apps chaining `setStyle().setStyles()` expecting a merge and losing the first style) is fixed by **documentation only**: the new `set*` overrides / `add*` accumulates convention in `guidelines-update.md`. No codemod, no `replaceStyles`, no `addStyles`.

> Additive internals in D-07 (no break): the `RawCtx` flag (`boolean|string` → `"escape"|"raw"|"script"|"style"`), `getAttr(attrs, key)`, and the localized `defineSchemaKeys`/`setDiscriminant` are all internal.

---

## Bug-fix output deltas (no codemod — re-baseline internal snapshots)

These are not migrations you act on; they are corrected output the library produces. Listed for snapshot-owners.

- **D-03** — `renderAlgebra` was lossy: it dropped 16 of 20+ HTMX attrs, emitted `<img></img>`, and skipped `</script>` sanitization (a real XSS gap on a public export). v6 unifies it into the single emitter — dropped attrs reappear, void elements self-close, script/style is sanitized.
- **D-05** — `rebuildTag` restores previously-dropped `_sk` attrs (`href`/`src`/`type` no longer silently lost in transforms); `HxStatusKey` tightening rejects only already-invalid keys; `tocCoalgebra` (always-broken) is removed (`linkedTocCoalgebra` documented).
- **A-02** — `ariaDescribe` auditor output change (see §2).

---

## Migration checklist (single pass)

```
[ ] Bump to fluent-html@6 + @fluent-html/eslint@6 (+ @fluent-html/fastify@6 if used)
[ ] npx @fluent-html/codemod v6        # §1 prefer-toggle/no-set-toggles, §9 nonce, §6 renderView signature
[ ] eslint --fix                        # §1, §3 vocab, §7 (after target flip)
[ ] Re-baseline HTML snapshots          # §1, §2, §4, §10, D-03/D-05 deltas
[ ] MANUAL: §4 Overlay (CSP/selectors/snapshots)
[ ] MANUAL: §5 Fastify augmentation + cookieName + delete local renderView decorator
[ ] MANUAL: §8 custom-algebra frozen arm (only if you implement ViewAlgebra/ParaAlgebra)
[ ] REVIEW: §2 setAria flagged keys
[ ] (separate, optional) §7 setTailwindTarget("v4") + recommendedV4 preset + semantic-change review
```

After this single pass, **all subsequent v6.1+ releases are additive** — no further migration.

---

*Traceability: each item → its RFC (`20-design/`) → `30-verification/` killer objections → `_merge.md` §4 amendments + §7 aggregate. Sequencing → `roadmap.md`. Teaching the new idioms → `guidelines-update.md`.*
