# Track B — HTML Elements / lens: embedded-frames

Lens scope: embedded content — `iframe` (sandbox tokens / allow / credentialless / referrerpolicy), `object`/`embed`, `canvas`, `map`/`area`, `source` modern attributes and typed unions.

Baseline note: all proposals below are Baseline-Widely-available HTML, EXCEPT `credentialless` (explicitly NOT Baseline — Chromium-only) and the canvas color-management attrs, which are flagged accordingly.

---

## 1. `IframeTag.setSandbox` — typed token union instead of bare `string`

**Problem / evidence.** `src/elements/embedded.ts:14` declares `sandbox?: string;` and `:49` `setSandbox(sandbox?: string)`. The `sandbox` allowlist is a *fixed enumerated token set* per the HTML Living Standard, yet today there is no type safety: a typo like `"allow-scripts allow-form"` (missing `s`) compiles and silently grants nothing / breaks isolation. Every other enumerated attr in this file got closed unions in 6.0/6.1 (`loading`, `ReferrerPolicy`, `FetchPriority`); `sandbox` was left as a raw string. This is the single highest-value gap for the lens — `sandbox` is the security-critical attribute and is the one most prone to silent token typos.

The full WHATWG sandbox token set: `allow-downloads`, `allow-forms`, `allow-modals`, `allow-orientation-lock`, `allow-pointer-lock`, `allow-popups`, `allow-popups-to-escape-sandbox`, `allow-presentation`, `allow-same-origin`, `allow-scripts`, `allow-top-navigation`, `allow-top-navigation-by-user-activation`, `allow-top-navigation-to-custom-protocols`.

**Proposed API.** A closed token union + a variadic accumulating setter (joins with spaces):

```ts
export type SandboxToken =
  | 'allow-downloads' | 'allow-forms' | 'allow-modals'
  | 'allow-orientation-lock' | 'allow-pointer-lock' | 'allow-popups'
  | 'allow-popups-to-escape-sandbox' | 'allow-presentation'
  | 'allow-same-origin' | 'allow-scripts' | 'allow-top-navigation'
  | 'allow-top-navigation-by-user-activation'
  | 'allow-top-navigation-to-custom-protocols';

// override (replaces) — keep string for the empty-sandbox "" case
setSandbox(...tokens: SandboxToken[]): this;   // emits sandbox="allow-forms allow-scripts"
```

`setSandbox()` with no args still emits a bare `sandbox=""` (maximally locked) — the most common safe default. The variadic signature follows the `add*`/variadic-children house style and means tokens autocomplete one at a time.

**Before / After.**
```ts
// before — no safety, easy to misspell or forget a token
Iframe().setSandbox("allow-scripts allow-same-origin");

// after — each token autocompletes; typo is a compile error
Iframe().setSandbox("allow-scripts", "allow-same-origin");
Iframe().setSandbox();   // sandbox=""  (fully locked)
```

**Already in lib?** No. `sandbox` exists only as bare `string` (`embedded.ts:14,49`). The token union does not exist anywhere in `html-types.ts`.

**Value.** High. **Effort.** Small.

---

## 2. `IframeTag.setAllow` — Permissions-Policy directive union (typed `allow`)

**Problem / evidence.** `embedded.ts:12` `allow?: string` / `:39` `setAllow(allow?: string)` is a bare string. The `allow` attribute is a Permissions-Policy allowlist whose *directive names* are an enumerable set (MDN Permissions_Policy lists them: `camera`, `microphone`, `geolocation`, `fullscreen`, `autoplay`, `clipboard-read`, `clipboard-write`, `display-capture`, `encrypted-media`, `payment`, `picture-in-picture`, `web-share`, `usb`, `xr-spatial-tracking`, `accelerometer`, `gyroscope`, `magnetometer`, `screen-wake-lock`, …). The *value* grammar (`'self'`, `*`, `()`, origin lists) is freeform, so a full closed union isn't right — but the directive **names** can autocomplete.

**Proposed API.** Keep `setAllow(string)` for the raw escape hatch, ADD an overload that accepts a directive→allowlist record so names are typed:

```ts
export type PermissionsPolicyDirective =
  | 'camera' | 'microphone' | 'geolocation' | 'fullscreen' | 'autoplay'
  | 'clipboard-read' | 'clipboard-write' | 'display-capture'
  | 'encrypted-media' | 'payment' | 'picture-in-picture' | 'web-share'
  | 'usb' | 'xr-spatial-tracking' | 'accelerometer' | 'gyroscope'
  | 'magnetometer' | 'screen-wake-lock' | 'midi' | 'idle-detection'
  | (string & {});

setAllow(allow?: string): this;                                     // raw
setAllow(policy: Partial<Record<PermissionsPolicyDirective, string>>): this;
// { camera: "'self'", fullscreen: '*' } → allow="camera 'self'; fullscreen *"
```

**Before / After.**
```ts
// before — typo "fulscreen" silently disables fullscreen
Iframe().setAllow("camera 'self'; fulscreen *");

// after — directive names autocomplete; value strings stay freeform
Iframe().setAllow({ camera: "'self'", microphone: "'self'", fullscreen: "*" });
```

**Already in lib?** No. `allow` is bare string; no permissions-policy union exists.

**Value.** Medium. **Effort.** Medium (overload + record serializer).

---

## 3. `IframeTag.toggle("credentialless")` reachability — and a doc note (NOT Baseline)

**Problem / evidence.** `credentialless` (load third-party iframe in an ephemeral, cookieless context so a COEP page can embed it) is a *boolean* iframe attribute. It is **not in `BooleanAttribute`** (`html-types.ts:151-156`), so `.toggle("credentialless")` is currently a **compile error** and the attribute is unreachable except via `addAttribute`.

Per the search above, `credentialless` is **NOT Baseline** — Chromium-only (Chrome 110+, no Firefox/Safari). Adding it to the closed `BooleanAttribute` union would be the minimal, correct surface (it's not an enumerated value attr, just present/absent), but it must ship documented as non-Baseline / progressive-enhancement.

**Proposed API.** Add the token to `BooleanAttribute`:
```ts
export type BooleanAttribute = … | 'credentialless' | … ;
```
No new method — `.toggle()` is already the canonical boolean path (per 6.0 removal of named boolean setters, CHANGELOG:181).

**Before / After.**
```ts
Iframe().setSrc(adUrl).toggle("credentialless");   // <iframe credentialless src=…>
```

**Already in lib?** No (`credentialless` absent from `BooleanAttribute`). `allowfullscreen` IS already covered (`html-types.ts:152`) — do not re-propose.

**Value.** Medium (real COEP use-case, but non-Baseline narrows audience). **Effort.** Small.

---

## 4. `IframeTag` width/height numeric overload + `name` is fine — gap is missing `referrerpolicy` parity is done

**Problem / evidence.** `IframeTag.width/height` are `string` only (`embedded.ts:10-11`), unlike `VideoTag`/`CanvasTag` which take `number`. `<iframe width height>` are HTML pixel integers, so a `number` overload (`setWidth(640)`) matches `VideoTag.setWidth(width: number)` (`media.ts:134`) and removes `String()` boilerplate at call sites. Same applies to `ObjectTag`/`EmbedTag` width/height (`embedded.ts:80-100,116-140`), all bare `string`.

**Proposed API.**
```ts
setWidth(width?: string | number): this;   // on Iframe, ObjectEl, Embed
setHeight(height?: string | number): this;
```
Mirrors the `SvgTag.setWidth(width: string | number)` pattern already in the codebase (`media.ts:250`).

**Before / After.**
```ts
Iframe().setWidth("640").setHeight("360");   // before
Iframe().setWidth(640).setHeight(360);       // after
```

**Already in lib?** No (current signatures are `string`-only). `referrerpolicy` already typed to `ReferrerPolicy` (CHANGELOG:81) — covered; `fetchpriority` already shipped (CHANGELOG:115) — covered.

**Value.** Low–Medium (ergonomic consistency). **Effort.** Small.

---

## 5. `SourceTag` — `width` / `height` for `<picture>` CLS prevention

**Problem / evidence.** `SourceTag` (`media.ts:88-125`) exposes `src/srcset/sizes/type/media` but **NOT `width`/`height`**. Per the HTML Living Standard, `<source>` inside `<picture>` accepts `width` and `height` (Baseline widely available) specifically so the browser can reserve aspect-ratio space and avoid Cumulative Layout Shift when art-directing responsive images. Today a `<picture>` art-direction setup can set dimensions on the fallback `<img>` but not per-`<source>`, defeating CLS reservation for the chosen source.

**Proposed API.**
```ts
class SourceTag {
  width?: string; height?: string;
  setWidth(width?: string | number): this;
  setHeight(height?: string | number): this;
}
// add 'width','height' to defineSchemaKeys(SourceTag, …)
```

**Before / After.**
```ts
// before — can't reserve space per art-directed source
Source().setSrcset("/hero-wide.avif").setMedia("(min-width: 800px)").setType("image/avif");

// after — browser reserves correct aspect box, no CLS
Source().setSrcset("/hero-wide.avif").setMedia("(min-width: 800px)")
        .setType("image/avif").setWidth(1600).setHeight(900);
```

**Already in lib?** No (`SourceTag` has no width/height; schema keys at `media.ts:121`).

**Value.** Medium (Core Web Vitals / CLS). **Effort.** Small.

---

## 6. `ImgTag.setUseMap` + `MapTag`/`AreaTag` wiring — image maps reachable end-to-end

**Problem / evidence.** `MapEl`/`Area` exist (`links.ts:65-129`), but `ImgTag` (`media.ts:13-77`) has **no `usemap` setter** — so an author who builds a `<map>` cannot type-safely associate it with the image; they must drop to `addAttribute("usemap", "#name")`. `ismap` (server-side image map, for `<img>` inside `<a>`) IS in `BooleanAttribute` (`html-types.ts:154`) but `usemap` (client-side, the common case) has no path. Also `AreaTag` is missing `referrerpolicy` and `ping` (both Baseline) while its sibling `AnchorTag` has the full link grammar — an `<area>` is a hyperlink and should reach the same attrs.

**Proposed API.**
```ts
class ImgTag { usemap?: string; setUseMap(usemap?: string): this; }   // "#mapname"
class AreaTag {
  referrerpolicy?: ReferrerPolicy; ping?: string;
  setReferrerPolicy(p?: ReferrerPolicy): this;
  setPing(ping?: string): this;
}
```

**Before / After.**
```ts
// before
Img().setSrc("/floorplan.png").addAttribute("usemap", "#rooms");

// after — typed, paired with MapEl whose name matches
Img().setSrc("/floorplan.png").setUseMap("#rooms");
MapEl(Area().setShape("rect").setCoords("0,0,80,80").setHref("/kitchen")).setName("rooms");
```

**Already in lib?** Partial. `MapEl`/`Area`/`ismap` exist; `usemap` on `Img` and `referrerpolicy`/`ping` on `Area` do NOT.

**Value.** Low (image maps are niche), but completes an already-shipped element pair cheaply. **Effort.** Small.

---

## Top picks
- **#1 `setSandbox(...SandboxToken[])`** — security-critical, closed union, small effort. Clear top pick.
- **#5 `SourceTag` width/height** — Baseline, Core Web Vitals (CLS) win, trivial effort.
- **#2 `setAllow` directive-record overload** — typed Permissions-Policy names, medium value.
- (Defer #3 `credentialless` until it gains broader engine support — ship documented as non-Baseline only if a concrete COEP embedding need lands.)
