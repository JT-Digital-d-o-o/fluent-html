---
id: RFC-B-01
track: B
resolves: [#14, #36, #32, #44, #56]
api_surface:
  - "VideoTag.crossorigin?: CrossOrigin | ''"
  - "VideoTag.setCrossOrigin(crossorigin?: CrossOrigin | ''): this"
  - "AudioTag.crossorigin?: CrossOrigin | ''"
  - "AudioTag.setCrossOrigin(crossorigin?: CrossOrigin | ''): this"
  - "SourceTag.width?: string"
  - "SourceTag.height?: string"
  - "SourceTag.setWidth(width: string | number): this"
  - "SourceTag.setHeight(height: string | number): this"
  - "ImgTag.referrerpolicy?: ReferrerPolicy"
  - "ImgTag.setReferrerPolicy(referrerpolicy?: ReferrerPolicy): this"
  - "LinkTag.referrerpolicy?: ReferrerPolicy"
  - "LinkTag.setReferrerPolicy(referrerpolicy?: ReferrerPolicy): this"
  - "LinkTag.imagesrcset?: string"
  - "LinkTag.imagesizes?: string"
  - "LinkTag.setImagesrcset(imagesrcset?: string): this"
  - "LinkTag.setImagesizes(imagesizes?: string): this"
  - "ScriptTag.referrerpolicy?: ReferrerPolicy"
  - "ScriptTag.setReferrerPolicy(referrerpolicy?: ReferrerPolicy): this"
  - "MetaTag.media?: string"
  - "MetaTag.setMedia(media?: string): this"
  - "AreaTag.referrerpolicy?: ReferrerPolicy"
  - "AreaTag.setReferrerPolicy(referrerpolicy?: ReferrerPolicy): this"
breaking: additive
guardrails_checked: ["§11.1", "§11.2", "§11.3", "§11.4", "§11.5", "§11.6", "§11.7", "§11.8"]
guideline_updates:
  - "README.md (lib) — media/resource-hint section: crossorigin on Video/Audio, sized <source> for CLS, referrerpolicy gap-fill, link image-preload (imagesrcset/imagesizes), per-scheme theme-color via Meta.setMedia"
  - "fluent-html.md — attribute reference rows for the new setters (VideoTag/AudioTag setCrossOrigin, SourceTag setWidth/setHeight, Img/Link/Script/Area setReferrerPolicy, LinkTag setImagesrcset/setImagesizes, MetaTag setMedia). NOTE: fluent-html.md is referenced as a guideline doc; land the edit wherever that reference resolves on disk."
  - "JSDoc on all new setters in src/elements/media.ts, src/elements/document.ts, src/elements/links.ts (crossorigin captions example; sized-<source> CLS note; setImagesrcset vs setSizes disambiguation; Meta.setMedia theme-color note)"
  - "test/types/type-surface.test-d.ts — positive + negative compile assertions (NOT a glob: the single real file). Negatives: Video().setCrossOrigin('anonymouss') ✗, Img().setReferrerPolicy('orig') ✗, and a guard that Source().setReferrerPolicy('origin') ✗ (setReferrerPolicy absent on SourceTag — locks the four-element scope)"
  - "../fluent-html-tailwind-extractor/README.md — no change required (attribute-only; no Tailwind classes emitted). Add a one-line note that this RFC emits no classes."
  - "../fluent-html-eslint-plugin/README.md — no change required (attribute-only; no class vocab touched). Add a one-line note."
impact: "Closes the media/resource-hint attribute completeness gap: cross-origin <track> captions + untainted canvas/Web-Audio capture (Video/Audio.setCrossOrigin), CLS-free art-directed <picture> (Source.setWidth/setHeight), the referrerpolicy holdouts on Img/Link/Script/Area, responsive <link rel=preload as=image> (imagesrcset/imagesizes), and per-color-scheme theme-color (Meta.setMedia). All net-new typed surface reusing existing closed unions; no call-site churn."
effort: M
depends_on: []
status: implemented
---

# RFC-B-01 — Media element completeness (crossorigin, source sizing, referrerpolicy, preload hints)

One convergent attribute-completeness pass over the media + document-head +
image-map elements: `setCrossOrigin` on `Video`/`Audio`, `setWidth`/`setHeight`
on `Source`, the `referrerpolicy` holdouts on `Img`/`Link`/`Script`/`Area`,
`setImagesrcset`/`setImagesizes` on `Link`, and `setMedia` on `Meta`. Every
setter reuses an already-shipped closed union or the established `string`
descriptor posture, and matches the name/shape of its existing siblings —
CONVERGE: exactly one way to set each attribute, identical across every element
that carries it.

> **Adversary verdict: survives-with-changes** (confidence 0.78). No kill found.
> The strongest objection — that `SourceTag.setWidth(string|number)` opens a
> third width/height shape and that two CONVERGE-relevant decisions shipped as
> *open questions* — is a convergence/DX wart, not a correctness or type-safety
> break. CONVERGE requires exactly one answer, so both questions are now **closed
> in-body** (not deferred): see *Type-safety story* and *Adversary review &
> resolutions* below.

## Problem

The media/resource-hint surface has six holes where a spec attribute is
reachable on *some* elements but missing on others, forcing the untyped
`addAttribute` escape hatch.

- **`crossorigin` is on `ImgTag` but not `VideoTag`/`AudioTag`.** `ImgTag`
  carries `crossorigin?: CrossOrigin | ''` with `setCrossOrigin`
  (`src/elements/media.ts:22`, `:65-68`), and so do `LinkTag`
  (`document.ts:124`, `:162`) and `ScriptTag` (`document.ts:243`, `:257`). But
  `VideoTag` (`media.ts:127-158`) and `AudioTag` (`media.ts:166-178`) have **no
  `crossorigin`**. Without it, cross-origin `<track>` caption files fail CORS,
  reading video frames into a `<canvas>` taints it, and a
  `MediaElementAudioSourceNode` over a cross-origin source yields silence — all
  silent runtime failures with no typed fix today.
- **`<source>` is the only sized media element with no `width`/`height`.**
  `Img`/`Video`/`Canvas`/`Svg` all carry `width`/`height`
  (`media.ts:16-17`, `:128-129`, `:221-222`, `:242-243`), but `SourceTag`
  (`media.ts:88-118`) exposes only `src`/`srcset`/`sizes`/`type`/`media`. In an
  art-directed `<picture>`, per-`<source>` `width`/`height` lets the browser
  reserve the correct aspect-ratio box at each breakpoint — without it,
  responsive image swaps shift layout (CLS).
- **`referrerpolicy` ships on `AnchorTag` + `IframeTag` but not the four other
  spec elements.** `AnchorTag.setReferrerPolicy` exists (`links.ts:52-55`,
  union at `html-types.ts:35-38`) and `IframeTag.setReferrerPolicy` ships with
  the identical `(referrerpolicy?: ReferrerPolicy): this` signature
  (`embedded.ts:59`, retyped to the closed union in 6.1.1, `CHANGELOG.md:81`).
  But `ImgTag` (`media.ts`), `LinkTag`/`ScriptTag` (`document.ts`), and `AreaTag`
  (`links.ts:80-123`) have **no `referrerpolicy`** — the four spec holdouts. The
  four additions are byte-for-byte the same signature as the two shipped carriers,
  so they CONVERGE rather than introduce a new shape. (`CHANGELOG.md:191` only
  *renamed* `setReferrerpolicy`→`setReferrerPolicy`; it never widened the
  element set.)
- **`<link rel=preload as=image>` responsive preload has no typed grammar.**
  `LinkTag` (`document.ts:118-182`) has `setSizes` (the *icon* `sizes` grammar,
  e.g. `16x16`) but not `imagesrcset`/`imagesizes`, the distinct responsive
  preload descriptors. Preloading the LCP hero responsively today needs
  `.addAttribute("imagesrcset", …)`.
- **`Meta` cannot carry `media`.** Per-color-scheme `theme-color`
  (`<meta name="theme-color" media="(prefers-color-scheme: dark)">`) needs
  `media` on `MetaTag` (`document.ts:72-110`). `setMedia` already exists on
  `LinkTag` (`document.ts:151`) and `StyleTag` (`document.ts:194`) — `Meta` is
  the gap.

**Verified not shipped in 6.1.x:** grepping
`setCrossOrigin|setReferrerPolicy|imagesrcset|imagesizes` across `src/` plus
reading `media.ts`/`document.ts`/`links.ts` in full confirms `VideoTag`/
`AudioTag` have no `crossorigin`, `SourceTag` has no `width`/`height`,
`Img`/`Link`/`Script`/`Area` have no `referrerpolicy`, `LinkTag` has no
`imagesrcset`/`imagesizes`, and `MetaTag` has no `media`. `CHANGELOG.md`
(6.0.0→6.1.1) touches `referrerpolicy` only at `:81` (Iframe retype) and `:191`
(the `setReferrerpolicy`→`setReferrerPolicy` rename) — never these elements.

These are plain HTML attribute setters — instruction-set primitives, not
`@jtdigital/ui` component opinion. They reuse the existing `CrossOrigin` and
`ReferrerPolicy` closed unions and route through the renderer's `escapeAttr`
choke point exactly like every other attribute.

### Correction to the synthesis: drop `<source>` from `referrerpolicy`

The synthesis (40-synthesis lines 29, 95) lists `<source>` among the
`referrerpolicy` holdouts. **This is wrong.** The WHATWG/MDN spec defines no
`referrerpolicy` on `<source>` — its attributes are
`src`/`srcset`/`sizes`/`media`/`type`/`width`/`height` only. Emitting
`referrerpolicy` on `<source>` would be a dead/invalid attribute and violate the
type-safety intent (§11.4). This RFC **drops `<source>`** from the
`referrerpolicy` set: the four real holdouts are `Img`/`Link`/`Script`/`Area`,
which — with the already-shipped `Anchor` + `Iframe` — completes the spec's
six-element `referrerpolicy` set. `<source>` still gains `width`/`height` (its
real spec attributes) from the sizing sub-area above. A negative compile guard
(`Source().setReferrerPolicy(...)` must fail) locks this scope so a later edit
cannot silently re-add the spec-invalid arm.

## Proposed API

Full TS signatures — **the contract**. All setters return `this`, take an
optional value (override semantics, `set*` convention), and emit a plain HTML
attribute via the existing schema render path.

### `src/elements/media.ts`

```typescript
// VideoTag — add crossorigin (byte-identical to ImgTag.setCrossOrigin)
class VideoTag {
  crossorigin?: CrossOrigin | '';
  /** Set `crossorigin` for cross-origin <track> captions, untainted <canvas>
   *  frame capture, and Web-Audio MediaElementAudioSourceNode. The bare `""`
   *  arm exists for signature parity with ImgTag/LinkTag/ScriptTag — one
   *  setCrossOrigin shape across all five carriers (CONVERGE). */
  setCrossOrigin(crossorigin?: CrossOrigin | ''): this;
}

// AudioTag — add crossorigin (byte-identical to ImgTag.setCrossOrigin)
class AudioTag {
  crossorigin?: CrossOrigin | '';
  /** Set `crossorigin` for a cross-origin Web-Audio MediaElementAudioSourceNode.
   *  Signature byte-identical to ImgTag.setCrossOrigin (CONVERGE). */
  setCrossOrigin(crossorigin?: CrossOrigin | ''): this;
}

// SourceTag — add width/height (most-permissive string|number → String superset)
class SourceTag {
  width?: string;
  height?: string;
  /** Per-<source> intrinsic width — reserves the aspect-ratio box in an
   *  art-directed <picture> to eliminate CLS on responsive image swaps.
   *  Picture-only: ignored on <source> inside <video>/<audio>.
   *  Accepts string | number; both coerce via String(...). */
  setWidth(width: string | number): this;   // this.width = String(width)
  setHeight(height: string | number): this;  // this.height = String(height)
}
```

`CrossOrigin` is already imported at `media.ts:5`. `ReferrerPolicy` must be
**added** to that import (currently only `CrossOrigin`, `FetchPriority`).

### `src/elements/media.ts` — ImgTag

```typescript
class ImgTag {
  referrerpolicy?: ReferrerPolicy;
  /** Set `referrerpolicy` for this image request (e.g. `"no-referrer"`).
   *  Byte-identical to AnchorTag/IframeTag.setReferrerPolicy (CONVERGE). */
  setReferrerPolicy(referrerpolicy?: ReferrerPolicy): this;
}
```

### `src/elements/document.ts` — LinkTag, ScriptTag, MetaTag

```typescript
class LinkTag {
  referrerpolicy?: ReferrerPolicy;
  imagesrcset?: string;
  imagesizes?: string;
  setReferrerPolicy(referrerpolicy?: ReferrerPolicy): this;
  /** `<link rel="preload" as="image">` responsive source set (srcset grammar:
   *  `"hero-480.jpg 480w, hero-1080.jpg 1080w"`). NOTE: distinct from `setSizes`,
   *  which is the *icon* `sizes` grammar (`"16x16"`). */
  setImagesrcset(imagesrcset?: string): this;
  /** Companion `sizes` descriptor for `imagesrcset` (e.g. `"100vw"`). */
  setImagesizes(imagesizes?: string): this;
}

class ScriptTag {
  referrerpolicy?: ReferrerPolicy;
  setReferrerPolicy(referrerpolicy?: ReferrerPolicy): this;
}

class MetaTag {
  media?: string;
  /** Set `media` — primarily for per-color-scheme `theme-color`
   *  (`<meta name="theme-color" media="(prefers-color-scheme: dark)">`).
   *  Mirrors `setMedia` on LinkTag/StyleTag. */
  setMedia(media?: string): this;
}
```

`ReferrerPolicy` must be added to the `document.ts` type import block
(`document.ts:6-17`, currently lacks it). `CrossOrigin`/`FetchPriority` already
imported there.

### `src/elements/links.ts` — AreaTag

```typescript
class AreaTag {
  referrerpolicy?: ReferrerPolicy;
  setReferrerPolicy(referrerpolicy?: ReferrerPolicy): this;
}
```

`ReferrerPolicy` is already imported at `links.ts:4`.

### `defineSchemaKeys` additions (append, order-stable)

```typescript
// media.ts
defineSchemaKeys(ImgTag,   ['src','alt','width','height','loading','decoding','srcset','sizes','crossorigin','fetchpriority','referrerpolicy']);
defineSchemaKeys(SourceTag,['src','srcset','media','sizes','type','width','height']);
defineSchemaKeys(VideoTag, ['src','poster','preload','width','height','crossorigin']);
defineSchemaKeys(AudioTag, ['src','preload','crossorigin']);

// document.ts
defineSchemaKeys(MetaTag,  ['name','charset',['httpEquiv','http-equiv'],'property','content','media']);
defineSchemaKeys(LinkTag,  ['rel','href','type','media','sizes','as','crossorigin','integrity','hreflang','fetchpriority','referrerpolicy','imagesrcset','imagesizes']);
defineSchemaKeys(ScriptTag,['src','type','integrity','crossorigin','fetchpriority','referrerpolicy']);

// links.ts
defineSchemaKeys(AreaTag,  ['shape','coords','href','alt','target','rel','download','referrerpolicy']);
```

`imagesrcset`/`imagesizes` are already the lowercase spec attribute spelling, so
property name == attribute name — **no `[prop, attr]` rename pair** needed
(unlike `httpEquiv`).

**Schema-key ordering — correctness note.** Every edit above **appends** the new
keys to the existing arrays (e.g. `LinkTag` gains `referrerpolicy`,
`imagesrcset`, `imagesizes` after `fetchpriority`). `defineSchemaKeys` order
governs only the **emission order** of attributes in the serialized tag, not
correctness — an unset attribute emits nothing, so existing call sites that do
not use the new setters render byte-identically. No snapshot/golden test in the
repo asserts attribute order for `Img`/`Source`/`Video`/`Audio`/`Meta`/`Link`/
`Script`/`Area` (verified: the type-surface tests are compile-only and the
serialize tests assert specific-attribute presence, not full-string order). If a
future golden test pins full-string order for any of these tags, it must be
regenerated; none exists today.

### Emitted output (the contract)

| Call | Output |
| --- | --- |
| `Video().setCrossOrigin("anonymous")` | `<video crossorigin="anonymous">` |
| `Video().setCrossOrigin("use-credentials")` | `<video crossorigin="use-credentials">` |
| `Audio().setCrossOrigin("anonymous")` | `<audio crossorigin="anonymous">` |
| `Source().setWidth(800).setHeight(600)` | `<source width="800" height="600">` |
| `Source().setWidth("1280")` | `<source width="1280">` |
| `Img().setReferrerPolicy("no-referrer")` | `<img referrerpolicy="no-referrer">` |
| `Link().setRel("preload").setAs("image").setImagesrcset("hero-480.jpg 480w, hero-1080.jpg 1080w").setImagesizes("100vw")` | `<link rel="preload" as="image" imagesrcset="hero-480.jpg 480w, hero-1080.jpg 1080w" imagesizes="100vw">` |
| `Link().setReferrerPolicy("strict-origin-when-cross-origin")` | `<link referrerpolicy="strict-origin-when-cross-origin">` |
| `Script().setReferrerPolicy("origin")` | `<script referrerpolicy="origin"></script>` |
| `Area().setReferrerPolicy("no-referrer-when-downgrade")` | `<area referrerpolicy="no-referrer-when-downgrade">` |
| `Meta().setName("theme-color").setContent("#0b0b0b").setMedia("(prefers-color-scheme: dark)")` | `<meta name="theme-color" content="#0b0b0b" media="(prefers-color-scheme: dark)">` |

## Worked examples

**Cross-origin captions + untainted frame capture.**

```typescript
// Before — impossible; no crossorigin on Video. The cross-origin .vtt fails CORS:
Video(Track().setSrc("https://cdn.example.com/caps.vtt").setKind("captions"));

// After:
Video(Track().setSrc("https://cdn.example.com/caps.vtt").setKind("captions"))
  .setCrossOrigin("anonymous");
// <video crossorigin="anonymous">…
```

**Art-directed `<picture>` without CLS.**

```typescript
// Before — layout shifts on swap; no width/height to reserve the box:
Picture(Source().setSrcset("/hero-wide.avif").setMedia("(min-width:768px)"));

// After:
Picture(
  Source().setSrcset("/hero-wide.avif").setMedia("(min-width:768px)")
    .setWidth(1280).setHeight(720),
);
// <source srcset="/hero-wide.avif" media="(min-width:768px)" width="1280" height="720">
```

**Responsive LCP preload (untyped escape hatch → typed).**

```typescript
// Before — the only way today; untyped, no autocomplete:
Link().setRel("preload").setAs("image")
  .addAttribute("imagesrcset", "/hero-480.jpg 480w, /hero-1080.jpg 1080w")
  .addAttribute("imagesizes", "100vw");

// After:
Link().setRel("preload").setAs("image")
  .setImagesrcset("/hero-480.jpg 480w, /hero-1080.jpg 1080w")
  .setImagesizes("100vw");
```

**Per-color-scheme theme-color + a referrer-policy'd image.**

```typescript
Meta().setName("theme-color").setContent("#0b0b0b")
  .setMedia("(prefers-color-scheme: dark)");
Img().setSrc("/avatar.jpg").setReferrerPolicy("no-referrer");
```

No in-repo app call site uses any of these attributes today (grep over
`fluent-html-demos` + `projects-template`); media/preload elements are not yet
used in the template, so this is net-new surface — nothing to migrate. The
closest existing typed pattern is `AnchorTag.setReferrerPolicy`
(`src/elements/links.ts:52`) and `IframeTag.setReferrerPolicy`
(`src/elements/embedded.ts:59`), whose `(referrerpolicy?: ReferrerPolicy): this`
shape this RFC replicates byte-for-byte onto Img/Link/Script/Area.

## Type-safety story

- **Closed unions reused, no bare `string` where literals are valid.**
  `crossorigin` is `CrossOrigin | ''` (`html-types.ts:41`); `referrerpolicy` is
  the closed `ReferrerPolicy` union (`html-types.ts:35-38`). `setCrossOrigin("anon")`
  and `setReferrerPolicy("origin-when")` are **compile errors**. Identical unions,
  identical setter names, identical emitted attributes across every element —
  CONVERGE.
- **`crossorigin` keeps the `CrossOrigin | ''` arm on `Video`/`Audio` (settled,
  not open).** The bare `""` arm is meaningless for media (it exists for the
  `Link` preconnect / Google-Fonts form), but keeping the signature byte-identical
  to `Img`/`Link`/`Script` upholds §11.6 CONVERGE: there is exactly **one**
  `setCrossOrigin` shape across all five carriers. A media-only `CrossOrigin`
  variant would be a *second* shape and a convergence violation. **Decision: keep
  `CrossOrigin | ''`.** (Closes former Open Question #1.)
- **`width`/`height` on `Source` adopt the most-permissive `string | number`
  → `String(...)` superset (settled, not open).** There is **no single
  established repo rule** — the codebase carries three width/height shapes:
  `Img`/`Iframe` = `string` (`media.ts:35-43`, `embedded.ts:29-37`),
  `Video`/`Canvas` = `number` (`media.ts:134-142`, `:224-232`), and `Svg` =
  `string | number` (`media.ts:250-258`). `Source` deliberately adopts the
  `SvgTag`-style `string | number` → `String` shape: it is the most permissive
  choice, narrows no caller, and is picture-friendly (a `<picture>`'s `<source>`
  ultimately feeds an `<img>`, whose width may be a string). The three-way
  width/height inconsistency is **pre-existing and explicitly out of scope** for
  this RFC. **Decision: keep `string | number`.** (Closes former Open Question #2.)
- **`imagesrcset`/`imagesizes` stay `string`** — the responsive-descriptor
  grammar, matching `srcset` on `ImgTag`/`SourceTag` (also `string`). A malformed
  descriptor is not a compile error, but that is the existing posture for the
  whole responsive-image surface; tightening it would be a separate, broader RFC.
- **No `[prop, attr]` rename pairs** — every new property name equals its lowercase
  spec attribute, so `defineSchemaKeys` takes plain string keys.
- **Compile-only tests** — add positive/negative rows to the single real file
  `test/types/type-surface.test-d.ts` (NOT a glob):
  - `Video().setCrossOrigin("anonymouss")` → `@ts-expect-error`;
  - `Img().setReferrerPolicy("orig")` → `@ts-expect-error`;
  - `Source().setReferrerPolicy("origin")` → `@ts-expect-error` — a guard that
    `setReferrerPolicy` does **not** exist on `SourceTag`, locking the deliberate
    four-element (`Img`/`Link`/`Script`/`Area`) scope so a later edit cannot
    silently re-add the spec-invalid `<source>` arm;
  - plus positive rows confirming each new setter returns `this` and accepts a
    valid union member.

## Migration & compatibility

**Additive within v6.** No existing signature changes; no emitted-output changes
for any current call. Every new property is optional; absent setters render
byte-identically to today (the schema-key arrays only gain trailing entries —
emission order can shift only when the new attributes are actually set, and no
golden test pins full-string order for these tags). v6 is greenfield, so there is
no v5 back-compat surface. The only honest caveat is the deliberate **divergence
from the synthesis**: `<source>` does not gain `referrerpolicy` (spec-invalid) —
reviewers expecting the "five-element" framing must accept the four-element
(`Img`/`Link`/`Script`/`Area`) correction.

## Docs impact (§11.8)

1. **`README.md` (lib root)** — add a **"Media & resource-hint attributes"**
   subsection:

   ```markdown
   ### Media & resource-hint attributes

   `crossorigin` is uniform across media — `Video`/`Audio`/`Img`/`Link`/`Script`
   all take `.setCrossOrigin("anonymous")` (required for cross-origin `<track>`
   captions, untainted `<canvas>` frame capture, and Web-Audio source nodes):

   ```typescript
   Video(Track().setSrc("https://cdn/x.vtt").setKind("captions"))
     .setCrossOrigin("anonymous");
   ```

   Size each `<source>` in an art-directed `<picture>` to kill CLS, preload the
   LCP image responsively, and ship a per-scheme theme-color:

   ```typescript
   Picture(Source().setSrcset("/hero.avif").setMedia("(min-width:768px)")
     .setWidth(1280).setHeight(720));
   Link().setRel("preload").setAs("image")
     .setImagesrcset("/hero-480.jpg 480w, /hero-1080.jpg 1080w").setImagesizes("100vw");
   Meta().setName("theme-color").setContent("#0b0b0b")
     .setMedia("(prefers-color-scheme: dark)");
   ```

   `setReferrerPolicy` is now uniform across `A`/`Img`/`Link`/`Script`/`Area`/`Iframe`.
   ```

2. **`fluent-html.md`** — add attribute reference rows: `Video`/`Audio`
   `setCrossOrigin`; `Source` `setWidth`/`setHeight` (note: picture-only for CLS);
   `Img`/`Link`/`Script`/`Area` `setReferrerPolicy`; `Link`
   `setImagesrcset`/`setImagesizes` (note: distinct from icon `setSizes`); `Meta`
   `setMedia` (note: theme-color use case). `fluent-html.md` is a referenced
   guideline doc — land the edit wherever that reference resolves on disk.

3. **JSDoc** — on all new setters (drafted in *Proposed API*): the crossorigin
   captions/canvas/Web-Audio rationale on `Video`/`Audio`; the picture-only CLS
   note on `Source.setWidth`; the `setImagesrcset` vs `setSizes` disambiguation on
   `Link`; the theme-color note on `Meta.setMedia`.

4. **`test/types/type-surface.test-d.ts`** — the negative + positive compile rows
   enumerated in *Type-safety story* (the file is single, not a glob).

5. **`CHANGELOG.md`** — an "Added" entry under the 6.2.0 heading listing the six
   element changes and the explicit "`referrerpolicy` is *not* on `<source>` (spec)".

6. **`../fluent-html-tailwind-extractor/README.md`** and
   **`../fluent-html-eslint-plugin/README.md`** — **no functional change**; this
   RFC emits no Tailwind classes. Note explicitly (one line each) that the change
   is attribute-only so no vocab/extractor/eslint update is implied.

### Lockstep (vocab + extractor + eslint)

**N/A.** These setters emit HTML attributes (`crossorigin`/`width`/`height`/
`referrerpolicy`/`imagesrcset`/`imagesizes`/`media`), not Tailwind classes. No
`src/class-vocab/vocab.ts` row, no extractor change, no eslint allowlist change.
§11.7 does not apply.

## Guardrail check

- **§11.1 zero-deps** — no new runtime dependency; plain field assignment in each setter.
- **§11.2 SSR-only / sync** — all setters are synchronous assignments; render stays sync.
- **§11.3 escape-by-default** — `width`/`height`/`referrerpolicy`/`imagesrcset`/`imagesizes`/`media`/`crossorigin` all flow through the renderer's existing `escapeAttr` choke point (`serialize.ts:270`, `escapeAttr(typeof value === 'string' ? value : String(value))`) like every other attribute — including the `String(number)` coercion path the new `width`/`height` numbers ride; `crossorigin`/`referrerpolicy` are closed enums. No new XSS sink.
- **§11.4 type-safety** — `CrossOrigin`/`ReferrerPolicy` are reused **closed** unions (no `(string & {})` tail; verified `html-types.ts:35-41`); a typo is a compile error. `string` only where the responsive-descriptor grammar already is bare `string` (matching existing `srcset`). `<source>` deliberately excluded from `referrerpolicy` to avoid a dead/invalid attribute, with a negative compile guard locking the scope.
- **§11.5 compat** — additive within v6; no signature or output change; greenfield, no v5 back-compat.
- **§11.6 idioms** — `set*` override convention; single optional arg (no options object for single-attribute setters); identical name/shape/union across every element that carries the attribute. CONVERGE is satisfied on every axis: **one** `setCrossOrigin` shape (`CrossOrigin | ''`) across all five carriers (Video/Audio/Img/Link/Script); **one** `setReferrerPolicy` shape (`(referrerpolicy?: ReferrerPolicy): this`) across all six carriers (A/Img/Link/Script/Area/Iframe), byte-identical to the two already-shipped ones (`links.ts:52`, `embedded.ts:59`); **one** `setMedia` shape (Link/Style/Meta). Both formerly-open CONVERGE questions (the `''` arm; the `Source` coercion type) are now **closed in-body** — no decision is deferred.
- **§11.7 class-string contract** — N/A; no Tailwind classes emitted.
- **§11.8 docs/guideline-sync** — lib README + `fluent-html.md` + JSDoc on every new setter + the named `test/types/type-surface.test-d.ts` rows + CHANGELOG, plus a one-line attribute-only note in both tooling READMEs; covers every symbol in `api_surface`.

## Alternatives considered

- **Drop the `''` arm from `Video`/`Audio` `setCrossOrigin` (use bare `CrossOrigin`).**
  Rejected (and now a settled decision, not an open question): the `''` arm is
  meaningless for media (it exists for `Link` preconnect / Google Fonts) but
  keeping the signature byte-identical to `Img`/`Link`/`Script` upholds CONVERGE —
  one `setCrossOrigin` shape everywhere. Diverging here would create a second
  cross-origin signature.
- **Include `<source>` in the `referrerpolicy` set (per the synthesis).**
  Rejected: spec-invalid — `<source>` has no `referrerpolicy`; it would emit a dead
  attribute and break the type-safety intent (§11.4). A negative compile guard
  enforces the exclusion.
- **Reuse `setSizes` for the image-preload `imagesizes` grammar.** Rejected:
  `setSizes` is the *icon* `sizes` grammar (`16x16`); the responsive-preload
  `imagesizes` is a distinct descriptor (`100vw`). Folding them would conflate two
  attributes — JSDoc disambiguates the two instead.
- **A typed responsive-descriptor type for `srcset`/`imagesrcset`.** Rejected for
  this RFC: the whole responsive-image surface (`srcset` on `Img`/`Source`) is bare
  `string` today; tightening descriptor grammar is a separate, broader RFC.
- **Number-only `setWidth` on `Source` (mirror `Video`).** Rejected (now settled):
  `Source` feeds `<img>` (string width) in `<picture>`. There is no single
  established repo coercion rule — `Img`/`Iframe` are `string`, `Video`/`Canvas`
  are `number`, `Svg` is `string | number`. `Source` adopts the most-permissive
  `string | number` → `String` superset (matching `SvgTag`); it narrows no caller.
  The three-way width/height inconsistency is pre-existing and out of scope.

## Adversary review & resolutions

The adversary verdict (`V-RFC-B-01.md`, **survives-with-changes**, confidence
0.78, no kill found) raised five required changes. All are folded in:

1. **Close Open Question #1 — keep `CrossOrigin | ''` on `Video`/`Audio`.**
   *Resolved.* Open Question #1 deleted; the resolution moved into *Type-safety
   story* as a settled decision and restated in the §11.6 Guardrail line: one
   `setCrossOrigin` shape across all five carriers; a media-only `CrossOrigin`
   variant would be a second shape and a CONVERGE violation.

2. **Close Open Question #2 — keep `string | number` → `String(...)` on
   `Source.setWidth/setHeight`; stop calling it "the established SvgTag rule".**
   *Resolved.* Open Question #2 deleted. *Type-safety story* and *Alternatives*
   now state plainly that the repo has **three** width/height shapes
   (`Img`/`Iframe`=`string`, `Video`/`Canvas`=`number`, `Svg`=`string|number`) and
   that `Source` deliberately adopts the most-permissive `string|number` superset
   (matching `SvgTag`), narrowing no caller, with the three-way inconsistency
   flagged pre-existing and out of scope.

3. **Fix the compile-test path and add the negative `SourceTag` guard.**
   *Resolved.* All references now name the single real file
   `test/types/type-surface.test-d.ts` (verified on disk; no `test/types/*.test-d.ts`
   glob). Required negatives enumerated: `Video().setCrossOrigin('anonymouss')` ✗,
   `Img().setReferrerPolicy('orig')` ✗, and `Source().setReferrerPolicy('origin')` ✗
   (guards the four-element scope). Reflected in `guideline_updates` and
   *Type-safety story*.

4. **Add `IframeTag` to the convergence-claim wording.** *Resolved.* The Problem
   section now names `IframeTag.setReferrerPolicy` (`embedded.ts:59`) alongside
   `AnchorTag` as the two already-shipped byte-identical carriers; the §11.6
   Guardrail line makes the CONVERGE claim explicit: "one `setReferrerPolicy`
   shape across all six carriers (A/Img/Link/Script/Area/Iframe), byte-identical to
   the two shipped ones." Verified in source: both ship
   `(referrerpolicy?: ReferrerPolicy): this`.

5. **State the schema-key ordering risk explicitly.** *Resolved.* A new
   "Schema-key ordering — correctness note" under *defineSchemaKeys additions*
   states that all new keys are appended, that order affects only emission order
   (not correctness), and that no snapshot/golden test pins full-string attribute
   order for any of the eight edited tags today (verified). *Migration &
   compatibility* repeats the caveat.
