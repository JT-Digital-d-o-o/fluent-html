# Track B — HTML Elements Discovery: Media lens (v6.2.0)

Lens scope: `picture`/`source` (media/sizes/srcset/type/**width/height/referrerpolicy**), `img` (loading/decoding/fetchpriority/srcset/sizes/**referrerpolicy**), `video`/`audio` (poster/preload/playsinline/controls/muted/loop/autoplay/**crossorigin**), `track` (kind/srclang/label).

Source under review:
- `src/elements/media.ts` (ImgTag, SourceTag, VideoTag, AudioTag, TrackTag)
- `src/elements/html-types.ts` (`CrossOrigin`, `ReferrerPolicy`, `FetchPriority`, `BooleanAttribute` unions)
- `src/core/tag.ts` `toggle(name: BooleanAttribute, condition?)`

What is already correct and SHOULD NOT be re-proposed:
- Boolean media attrs — `controls`, `autoplay`, `loop`, `muted`, `playsinline` — are all members of the `BooleanAttribute` union (`html-types.ts:151`), so `Video().toggle("muted").toggle("autoplay").toggle("playsinline")` already works. The named `setAutoplay/setLoop/setMuted/setPlaysinline/setControls` were intentionally removed in 6.0.0 (CHANGELOG:181). **Do not re-add them.**
- `Img().setFetchPriority` / `setLoading` / `setDecoding` / `setSrcset` / `setSizes` / `setCrossOrigin` — all present (`media.ts:45-74`).
- `Source().setSrc/setSrcset/setSizes/setType/setMedia` — present (`media.ts:95-118`).
- `Video().setPoster/setPreload/setWidth/setHeight/setSrc`, `Audio().setSrc/setPreload`, `Track().setSrc/setKind/setSrclang/setLabel` — present.

---

## Proposal 1 — `crossorigin` on Video / Audio (`setCrossOrigin`)

**Problem / evidence.** `VideoTag` (`media.ts:127-160`) and `AudioTag` (`media.ts:166-181`) expose no `crossorigin` setter, yet the `CrossOrigin` union (`html-types.ts:41`) and the exact `setCrossOrigin(crossorigin?: CrossOrigin | '')` pattern already exist on `ImgTag` (`media.ts:65-68`) and `LinkTag`. `crossorigin` is a standard WHATWG media-element attribute (Baseline: widely available) and is **mandatory** for: cross-origin `<track>` captions (CORS-checked), drawing cross-origin video frames to an un-tainted `<canvas>`, and feeding audio to the Web Audio API. Today the only route is `addAttribute("crossorigin", "anonymous")` — untyped, typo-prone, and inconsistent with `Img`.

**Proposed API.**
```ts
class VideoTag /* + AudioTag */ {
  crossorigin?: CrossOrigin | '';
  setCrossOrigin(crossorigin?: CrossOrigin | ''): this;
}
// add 'crossorigin' to each defineSchemaKeys(...) list
```
Emits `<video crossorigin="anonymous">`.

**Before / After.**
```ts
// Before
Video().setSrc("https://cdn.example.com/clip.mp4")
  .addAttribute("crossorigin", "anonymous")   // untyped escape hatch
  .addChild(Track().setSrc("https://cdn.example.com/en.vtt").setKind("captions"));
// After
Video().setSrc("https://cdn.example.com/clip.mp4")
  .setCrossOrigin("anonymous")                // typed; "anonymos" is a compile error
  .addChild(Track().setSrc("https://cdn.example.com/en.vtt").setKind("captions"));
```

**Already in lib?** No. Confirmed absent from `media.ts` and the CHANGELOG 6.0.0→6.1.1.
**Value:** medium-high (the union exists; canvas/Web-Audio/CORS-captions all silently break without it, and `Img` already has it — pure consistency gap).
**Effort:** small (copy the `Img.setCrossOrigin` 4 lines onto two classes + two schema-key edits).

---

## Proposal 2 — `width` / `height` on `SourceTag` (art-directed picture, CLS)

**Problem / evidence.** `SourceTag` (`media.ts:88-121`) has `src/srcset/sizes/type/media` but **no `width`/`height`**. The WHATWG `<source>` spec (images.html / embedded-content.html) defines `width` and `height` on `<source>` inside `<picture>` precisely so each art-directed source can declare its own intrinsic size, letting the UA reserve the right box and avoid layout shift when the breakpoint swaps the image. This is Baseline (Chrome/Edge/Firefox/Safari all ship it). `ImgTag` and `VideoTag` already have `setWidth/setHeight`; `SourceTag` is the odd one out, forcing `addAttribute("width", "800")`.

**Proposed API.**
```ts
class SourceTag {
  width?: number;
  height?: number;
  setWidth(width?: number): this;
  setHeight(height?: number): this;
}
// defineSchemaKeys(SourceTag, ['src','srcset','media','sizes','type','width','height'])
```
Emits `<source width="800" height="600">`.

**Before / After.**
```ts
// Before — mobile source can't declare its own box → CLS on breakpoint swap
Picture(
  Source().setSrcset("/hero-mobile.avif").setMedia("(max-width: 640px)")
    .addAttribute("width", "640").addAttribute("height", "480"),
  Img().setSrc("/hero.avif").setWidth("1200").setHeight("900").setAlt("Hero"),
);
// After
Picture(
  Source().setSrcset("/hero-mobile.avif").setMedia("(max-width: 640px)")
    .setWidth(640).setHeight(480),
  Img().setSrc("/hero.avif").setWidth("1200").setHeight("900").setAlt("Hero"),
);
```

**Already in lib?** No.
**Value:** medium (real Core-Web-Vitals / CLS use; standard + Baseline; closes the only-element-without-size gap).
**Effort:** small.

---

## Proposal 3 — `referrerpolicy` on `ImgTag` and `SourceTag` (`setReferrerPolicy`)

**Problem / evidence.** `ReferrerPolicy` union already exists (`html-types.ts:35`) and `setReferrerPolicy` already ships on `IframeTag` (`embedded.ts:59-62`), `LinkTag`, and `ScriptTag`. The WHATWG spec defines `referrerpolicy` on **`<img>`** (images.html) and on **`<source>`** (embedded-content.html) too — it is the standard, Baseline mechanism to strip/trim the `Referer` header when fetching a privacy-sensitive or third-party image (e.g. `no-referrer`, `same-origin`). `ImgTag` (`media.ts:13-75`) and `SourceTag` have no such setter, so the only route is the untyped `addAttribute("referrerpolicy", …)`, inconsistent with every other resource-loading element in the library.

**Proposed API.**
```ts
class ImgTag /* + SourceTag */ {
  referrerpolicy?: ReferrerPolicy;
  setReferrerPolicy(referrerpolicy?: ReferrerPolicy): this;
}
// add 'referrerpolicy' to each defineSchemaKeys list
```
Emits `<img referrerpolicy="no-referrer">`.

**Before / After.**
```ts
// Before
Img().setSrc("https://3p.example.com/pixel.png")
  .addAttribute("referrerpolicy", "no-referrer");
// After
Img().setSrc("https://3p.example.com/pixel.png")
  .setReferrerPolicy("no-referrer");
```

**Already in lib?** No (present on Iframe/Link/Script, absent on Img/Source).
**Value:** medium (privacy/CORS-referrer control; union + method pattern already exist — pure consistency).
**Effort:** small.

---

## Considered and rejected (documented so they aren't re-surfaced)

- **`controlslist` (`nodownload`/`nofullscreen`/`noremoteplayback`) typed setter** — REJECTED. Per MDN/WICG it was **never adopted into the WHATWG HTML Living Standard**; it is a Chromium-only feature that the W3C validator flags as invalid and that Firefox/Safari ignore. fluent-html tracks the Living Standard, so a first-class typed setter would canonise a non-standard attribute. Reachable today via `addAttribute("controlslist", "nodownload")` for the apps that want it. **Not a finding.**
- **`disablepictureinpicture` / `disableremoteplayback` (boolean attrs)** — REJECTED for v6.2.0. Both are explicitly **not Baseline** (incomplete support across major browsers per MDN, 2025). They are real WHATWG attributes, so the only honest packaging would be adding them to the `BooleanAttribute` union (then `Video().toggle("disablepictureinpicture")` works). Low value given non-Baseline status; park unless a concrete app need appears. **Not a finding** (noted as a possible cheap union extension if demand arises).
- **`muted`/`autoplay`/`loop`/`playsinline`/`controls` setters** — already covered via `.toggle()` + `BooleanAttribute`. Not a finding.

## Top picks
- **Proposal 1 — `setCrossOrigin` on Video/Audio**: highest signal; union + 4-line pattern already exist, and its absence silently breaks CORS captions, canvas frame-grab, and Web Audio.
- **Proposal 3 — `setReferrerPolicy` on Img/Source**: closes a consistency gap (already on Iframe/Link/Script), standard + Baseline, zero new types.
- **Proposal 2 — `setWidth`/`setHeight` on Source**: standard + Baseline CLS win for art-directed `<picture>`.
