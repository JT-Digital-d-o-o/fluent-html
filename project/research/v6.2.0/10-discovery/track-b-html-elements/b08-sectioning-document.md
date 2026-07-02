# Track B — Sectioning & Document Metadata (v6.2.0 discovery)

Lens scope: sectioning/landmark elements (`search`, `hgroup`, `figure`/`figcaption`, `address`, `main`, `nav`/`aside`/`article`) and `<head>` metadata (`meta`, `link` rel tokens + responsive/preload attrs, `base`, `title`). Goal: standard surface fluent-html does **not** yet expose as a tag class or typed setter.

## Status of the landmark/sectioning elements

All sectioning element factories already ship in `src/elements/structural.ts`: `Main`, `Header`, `Footer`, `Section`, `Article`, `Nav`, `Aside`, `Figure`, `Figcaption`, `Address`, `Hgroup`, and `Search` (the 2023 wrapper for filter/search forms). There is **no gap at the element-factory level** for this lens — every WHATWG sectioning/landmark element has a factory. The gaps are all in `<head>` metadata *attributes*, where `LinkTag`/`MetaTag`/`ScriptTag` are missing standard, performance-relevant attributes that today force an untyped `addAttribute(...)`.

---

## 1. `LinkTag.setImagesrcset` / `setImagesizes` — responsive image preload

**Problem/evidence.** `src/elements/document.ts` `LinkTag` exposes `rel/href/type/media/sizes/crossorigin/integrity/as/hreflang/fetchpriority` but **not** `imagesrcset`/`imagesizes`. These are the only way to preload a *responsive* LCP image (`<link rel="preload" as="image" imagesrcset sizes>`). `setSizes` exists but is the `<link rel=icon sizes="16x16">` grammar, not the responsive-image `sizes` grammar — they collide conceptually and `imagesizes` is a distinct attribute. Per MDN, `imagesrcset`/`imagesizes` are valid only with `rel="preload"` + `as="image"`, mirroring `<img srcset>`/`sizes`. Baseline: widely available (Chrome/Edge since 2019, Firefox 78, Safari 17.x) — effectively Baseline now. ([MDN imageSrcset](https://developer.mozilla.org/en-US/docs/Web/API/HTMLLinkElement/imageSrcset), [web.dev: preload responsive images](https://web.dev/articles/preload-responsive-images))

**Proposed API.**
```ts
setImagesrcset(imagesrcset?: string): this   // emits imagesrcset="..."
setImagesizes(imagesizes?: string): this     // emits imagesizes="..."
```
Add `imagesrcset`/`imagesizes` fields + schema keys to `LinkTag`. Values are free-form image-candidate / sizes strings (no closed union — same as `<img srcset>`).

**Before/After.**
```ts
// Before — untyped, no autocomplete, no schema
Link().setRel("preload").setAs("image")
  .addAttribute("imagesrcset", "/hero-480.avif 480w, /hero-960.avif 960w")
  .addAttribute("imagesizes", "100vw");
// After
Link().setRel("preload").setAs("image")
  .setImagesrcset("/hero-480.avif 480w, /hero-960.avif 960w").setImagesizes("100vw");
```

**Already in lib?** No. (`setSizes` exists but is the icon-sizes attribute.)
**Value:** high (LCP/Core-Web-Vitals is the canonical reason to hand-write `<link>` in SSR). **Effort:** small.

---

## 2. `LinkTag.setReferrerPolicy` — close the referrerpolicy gap on `<link>`

**Problem/evidence.** `ReferrerPolicy` is already a closed-ish union in `html-types.ts` and is wired on `AnchorTag` (`links.ts:52`) and `IframeTag` (`embedded.ts:59`). But `LinkTag` has no `setReferrerPolicy`, even though `referrerpolicy` is a standard `<link>` attribute (controls the referrer sent when fetching the preloaded/prefetched/stylesheet resource — relevant for cross-origin preconnect/preload to a CDN). Baseline: widely available. ([MDN link referrerpolicy](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/link#referrerpolicy))

**Proposed API.**
```ts
setReferrerPolicy(referrerpolicy?: ReferrerPolicy): this   // reuse existing union
```
Add `referrerpolicy?: ReferrerPolicy` field + schema key to `LinkTag`. Identical shape to the anchor/iframe setter — pure consistency fill-in.

**Before/After.**
```ts
Link().setRel("preload").setAs("font").setHref(url).addAttribute("referrerpolicy", "no-referrer"); // before
Link().setRel("preload").setAs("font").setHref(url).setReferrerPolicy("no-referrer");              // after
```

**Already in lib?** No (on `<link>`). The union and the setter pattern already exist elsewhere.
**Value:** medium. **Effort:** small.

---

## 3. `ScriptTag.setReferrerPolicy` / `setNonce` — script fetch policy + CSP nonce

**Problem/evidence.** `ScriptTag` (`document.ts`) exposes `src/type/crossorigin/integrity/fetchpriority` but not `referrerpolicy` (standard on `<script>`, same as `<link>`) nor `nonce`. `nonce` is the standard CSP `script-src 'nonce-...'` hook; an SSR app emitting an inline `<script>` under a strict CSP needs it, and today must use `addAttribute("nonce", ...)`. (The memory note "no framework glue" keeps nonce *generation* out of core, but the *attribute setter* is plain HTML surface.) Baseline: both widely available. ([MDN script nonce](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/script#nonce))

**Proposed API.**
```ts
setReferrerPolicy(referrerpolicy?: ReferrerPolicy): this
setNonce(nonce?: string): this   // emits nonce="..."
```
Add `referrerpolicy`/`nonce` fields + schema keys to `ScriptTag`. (`nonce` could also live on `Tag` globally since `<style>`/`<link>` accept it, but scoping to `Script` first is the high-value 80%.)

**Before/After.**
```ts
Script(js).addAttribute("nonce", cspNonce);   // before
Script(js).setNonce(cspNonce);                // after
```

**Already in lib?** No.
**Value:** medium (CSP-strict apps); high for those that need it. **Effort:** small.

---

## 4. `LinkTag.setBlocking` / `ScriptTag.setBlocking` — `blocking="render"`

**Problem/evidence.** The `blocking` attribute (`blocking="render"`) lets a `<link rel=stylesheet>`, `<link rel=preload>`, or `<script>` explicitly declare itself render-blocking — the standards-track replacement for the "critical CSS in `<head>`" ordering hacks and for deferring non-critical resources. Not present on any tag in `src/elements/`. Closed token set: currently just `"render"` (spec leaves room to grow). Baseline: newer — Chrome 105 / Safari 17.6 / Firefox not-yet at time of writing → **Baseline: limited/2024-ish**, so this is the lowest-confidence of the four. ([MDN blocking](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/blocking), [HTML spec](https://html.spec.whatwg.org/dev/semantics.html))

**Proposed API.**
```ts
type Blocking = "render";                 // closed, one-member (extensible)
setBlocking(blocking?: Blocking): this    // emits blocking="render"
```
on `LinkTag` and `ScriptTag` (and arguably `StyleTag`).

**Before/After.**
```ts
Link().setRel("stylesheet").setHref("/critical.css").setBlocking("render"); // after; before = addAttribute
```

**Already in lib?** No.
**Value:** low-medium (niche, and Firefox support is the blocker). **Effort:** small.
**Recommendation:** defer until Firefox ships / Baseline goes "widely available", unless an early-adopter use case appears.

---

## Considered and rejected (already covered or low-signal)

- **`search`/`hgroup`/`figure`/`figcaption`/`address`/`main` factories** — all already in `structural.ts`. No gap.
- **`Meta().setName/setCharset/setHttpEquiv/setProperty/setContent`, `theme-color` via `MetaName`** — already shipped (6.1.0 typed head unions). `MetaTag` even has `setMedia`? No — `media` is valid on `<meta name=theme-color media="(prefers-color-scheme:dark)">`. `MetaTag` lacks `setMedia`. Minor; folded into a note rather than a headline finding (single-attribute, narrow use — see note below).
- **`Base().setTarget/setHref`** — already shipped with `BrowsingContext`.
- **`link rel` resource-hint tokens** (`preconnect`/`preload`/`modulepreload`/`dns-prefetch`/`manifest`/`icon`/`apple-touch-icon`/`prefetch`/`prerender`) — already in `LinkElementRel` (6.1.0).
- **`fetchpriority` on link/script** — already shipped (6.1.0).

### Minor note: `MetaTag.setMedia`
`<meta name="theme-color" media="(prefers-color-scheme: dark)">` is the standard way to ship per-scheme theme colors; `MetaTag` has no `setMedia`. Small, real, but narrow — bundle it into the same PR as finding #1/#2 rather than tracking separately. (Value: low-medium, Effort: small.)

---

## Top picks
- **`LinkTag.setImagesrcset` / `setImagesizes`** — responsive LCP image preload; the highest-value real gap in this lens. (high / small)
- **`LinkTag.setReferrerPolicy`** — pure consistency fill-in; union + pattern already exist on anchor/iframe. (med / small)
- **`ScriptTag.setReferrerPolicy` + `setNonce`** — script fetch policy and CSP nonce, both standard plain-HTML attributes. (med / small)
- **`setBlocking("render")`** on link/script — standards-track render-blocking control, but **defer** pending Firefox/Baseline. (low-med / small)
