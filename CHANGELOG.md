# Changelog

All notable changes to Fluent HTML will be documented in this file.

## [6.3.0] - Packaging integrity & URL sanitization

### 💥 Breaking (type-level only — no runtime behavior change)

These reject call shapes that already misbehaved at runtime; well-formed code is unaffected. Same flavor as 6.2.0's type-narrowing breaks.

- **`IfThen`/`IfThenElse`/`.when()`/`.whenElse()` reject a `boolean`-containing value on the nullable overload.** A `boolean | null` value (e.g. a Prisma `Boolean?` column) resolved to the nullable-*value* overload at compile time but was reinterpreted as a *condition* at runtime — `false` rendered the else-branch, and `true` invoked the callback with `undefined` typed as a definite `boolean`. Passing such a value is now a compile error; use an explicit comparison: `IfThen(user.emailVerified === true, …)`. Plain `boolean` conditions and non-boolean nullable narrowing are unchanged.
- **`Match` no-default (exhaustive) form rejects a widened `string`/`number`.** When the value widened past a literal union (a DB column typed `string`, an unvalidated route param), the mapped-type exhaustiveness check silently collapsed, so any subset of cases compiled while a real miss rendered an invisible `Empty()`. The exhaustive form now requires a literal union; an unconstrained value must use the partial-with-default form `Match(value, cases, fallback)`.

### 🔒 Security

- **URL-valued attributes are now scheme-sanitized** — HTML-escaping prevents attribute *breakout* but does nothing about a `javascript:` URL that executes on click or a `data:text/html` URL that loads an attacker-authored document. `A("x").setHref(user.website)` — trusting the README's "XSS prevented" promise — could ship stored XSS. The typed URL setters (`setHref`, `setSrc`, `setAction`, `setFormaction`, `setData`, `setPoster`, `setCite`) now run their value through a new `sanitizeUrl()`: `javascript:`/`vbscript:` and scriptable `data:` URLs (`data:text/html`, `data:image/svg+xml`), including obfuscated forms (case, embedded tab/control chars, leading whitespace), are neutralized to `about:blank`. Relative URLs, fragments, protocol-relative `//host`, `http(s)`/`mailto`/`tel`, and non-scriptable `data:` media (`image/png`, `audio/*`, `video/*`, `font/*`) pass through byte-identically. `sanitizeUrl` is exported (also re-exported from the root) for standalone use.
  - **Escape hatch:** the untyped `addAttribute("href", value)` bag is intentionally *not* sanitized — it is the explicit, low-level opt-out for the rare `javascript:` bookmarklet, mirroring how `Raw()` opts out of content escaping.
  - **Docs:** the README's absolute "all content escaped — XSS prevented" claim is scoped to what it actually guarantees (text/attribute breakout + URL schemes on typed setters), with a new *URL Scheme Sanitization* section and the two documented bypasses (`Raw`, `addAttribute`).

### 🐛 Fixed — packaging integrity

A class of packaging defects where the library worked from `node dist/` (and its own test suite) but broke downstream — the failures only surfaced in a consumer's bundler or when importing a subpath. The entire chainable API (`.padding()`, `.setHtmx()`, `.behavior()`, `.overlay()`, …) is attached to `Tag.prototype` by side-effect-only modules; the packaging metadata was telling bundlers those modules were safe to drop. No public API changed — every current import renders byte-identically.


- **`sideEffects: false` erased the fluent method surface in bundled builds** — any consumer bundling their server (esbuild-for-Lambda, Vite SSR, Next-style deploys) got `Div(...).padding is not a function` at runtime, because the prototype-mixin modules have zero exports and were legally tree-shaken away. `sideEffects` is now an array listing the effectful modules, so bundlers preserve them. Verified with an esbuild bundle of the published layout.
- **`fluent-html/elements` (and `./core`, `./control`) were broken when imported standalone** — element factories import `Tag` directly from `core/tag.js`, bypassing the barrel that registered the mixins, so a Tag from the `./elements` subpath had *none* of its fluent methods (while its `.d.ts` still advertised them — a guaranteed runtime crash that type-checked). Registration is now an invariant of every Tag-producing barrel via a single `core/register.js` module. As part of this, `overlay()` moved from `control/` to `core/` alongside the other three mixins; `OverlayPosition` is still exported from the package root and from `fluent-html/control`, so no import path changes.
- **Published tarball shipped dangling sourcemap references** — every `.js`/`.d.ts` pointed at `.map` files that weren't packed, degrading debugger output and "Go to Definition". The `.js.map`, `.d.ts.map`, and `src/**/*.ts` files are now included so the references resolve end-to-end.

### 🐛 Fixed — element & attribute API consistency

- **`.toggle(name, false)` now removes a previously-added boolean attribute** — it was add-only (`false` was a silent no-op), so `.toggle("required").toggle("required", false)` still rendered `required`. This was the one primitive that violated last-call-wins, breaking `.apply()` presets and `.when()` branches that toggle `disabled`/`hidden`. A later `false` now removes; re-adding works; adds are de-duplicated.
- **`setWidth`/`setHeight` accept `string | number` uniformly across all seven media/embedded classes** — the same spec attribute had five different signatures: `Img().setWidth(800)` (the standard CLS fix) was a compile error while `Video().setWidth("800")` was an error the other way. All of `Img`/`Video`/`Canvas`/`Source`/`Svg`/`Iframe`/`Object`/`Embed` now take `?: string | number` and clear on `undefined` (numbers are stringified — byte-identical output). `Video`/`Canvas` `width`/`height` fields changed from `number` to `string` to match their siblings.
- **`setRel` is variadic** on `A`/`Area`/`Link` — the security pair `setRel("noopener", "noreferrer")` now gets per-token autocomplete and typo-checking instead of only compiling through the `(string & {})` escape hatch. Single-token and single space-joined-string calls are unchanged; no args clears.
- **`Area.setDownload` accepts the boolean form** (`setDownload(true)`) like `A`, closing the last divergence between the two link elements.

### ⚡ Performance

Byte-identical output (parity-checked by the full suite incl. the render/stream fuzz test); ~2× render throughput on HTMX-heavy pages.

- **`escapeHtml` short-circuits clean strings with a native regex pre-test** — the char-by-char JS scan ran on *every* attribute value, including machine-generated class strings, ids, and URLs that can never contain `&<>"'`. A `/[&<>"']/.test()` pre-test lets V8's vectorized engine reject the clean common case: the variant-heavy bench (long clean class attribute) went from ~10K to ~40K ops/sec (**~3.9×**), and every other bench rose 20–45%.
- **`buildHtmx` unrolled from a config-table loop to direct checks** — the 19-entry table did a megamorphic dynamic `htmx[key]` read per entry per htmx tag (~3× slower, mostly finding `undefined`). The unrolled monomorphic `if` sequence lifts the HTMX-attrs bench ~55% (combined with the above, ~2.4×).
- **Bench harness reports the median of several samples after a time-budget warm-up** — a single contiguous sample had 25–57% run-to-run spread (the same order as the deltas above), so real regressions could pass the gate. Runs are now stable to ~2%.

### 🐛 Fixed — Tailwind v4 class fidelity

- **`gradientRadial(origin, interpolation)` emitted a class Tailwind v4 rejects — zero CSS** — Tailwind v4 doesn't support the `/interpolation` modifier on the arbitrary-value radial form, so `gradientRadial("top-right", "oklch")` produced `bg-radial-[at_top_right]/oklch`, which compiles to *nothing* (silent missing gradient). Origin + interpolation now fold into one arbitrary value (`bg-radial-[at_top_right_in_oklch]`), with hue keywords expanded the way Tailwind's own modifier does (`longer` → `in oklch longer hue`). The emitter and the class-vocab row now share one `radialGradientClass` helper so they can't drift.
- **`.on("only-child", …)` emitted a variant that doesn't exist** — Tailwind's variant for `:only-child` is `only:` (there is no `only-child:` in any version), so it type-checked, rendered into the HTML, got safelisted, and produced no style. `"only-child"` is removed from the variant union; use `"only"` / `"only-of-type"` (both already supported).

### 🐛 Fixed — routes & ids

- **A `:param` value starting with `*` crashed `resolve()` on splatless routes** — `substituteParams` applied the splat regex to the *already-substituted* output, so `search.resolve({ term: "*" })` (a realistic wildcard search) re-triggered the splat branch and threw `Unresolved route splat`, or — if `*name` matched a params key — mis-substituted slash-preservingly. Splat-ness is now decided from the template once, before `:param` substitution, so the output is never re-parsed for route syntax.
- **`defineIds` runtime camelization diverged from the type-level `KebabToCamel`** — the `/-([a-z])/` regex only upcased a *lowercase letter* after a hyphen, so `col-2`, `user-List`, and `step-3-panel` produced runtime keys (`col-2`, `user-List`, `step-3Panel`) that didn't match their compile-time keys (`col2`, `userList`, `step3Panel`). `ids.col2` type-checked everywhere but was `undefined` at runtime, rendering `id="undefined"`. Runtime now mirrors the type exactly (split on `-`, capitalize each following segment), covering digits, uppercase, and trailing/double hyphens. Additionally, `defineIds` now **throws** when two names collapse to the same camelCase key (previously a silent last-write-win that retargeted every reference).

### 🐛 Fixed — HTMX emission

- **`formResetOnSwap` behavior listened on `htmx:after-swap`, an event htmx 4 never fires** — htmx 4 lifecycle events are colon-separated (`htmx:after:swap`); the emitted `hx-on:htmx:after-swap` bound a listener that never triggered, so the form silently never reset. Now emits `htmx:after:swap`.
- **`Partial()` corrupted every non-id target** — it force-prefixed `#`, turning `Partial(clss("items"), …)` into `hx-target="#.items"` and `Partial(closest("tr"), …)` into `hx-target="#closest tr"` — both target nonexistent elements, so the swap silently no-ops. `<hx-partial>` accepts any CSS selector, and the library ships `clss()`/`closest()`/`find()` builders whose output this destroyed. Now only a bare id token (`user-list`) gets the `#` convenience; every explicit selector (and `Id`) passes through verbatim.
- **`optimistic: false` / `preload: false` emitted the *enabling* attribute; `swapOob: false` emitted a broken swap spec** — the serializer gated on `!== undefined`, so disabling a feature via a variable (`optimistic: featureFlag`) turned it on. These now gate on truthiness; `swapOob: false` omits the attribute entirely (`hx-swap-oob="false"` would be read by htmx as a garbage swap style). `pushUrl`/`replaceUrl: false` still emit the literal `"false"`, which is meaningful htmx grammar.
- **`hxResponse` `HX-Trigger`/`HX-Location` JSON crashed on non-Latin1 characters** — `JSON.stringify` passes characters above U+00FF through raw, but HTTP header values must be Latin-1, so a detail payload with `š`, `č`, an emoji, or a typographic quote (routine in non-English apps) made `res.setHeader` throw `ERR_INVALID_CHAR` at request time. The library-built header JSON is now `\uXXXX`-escaped; htmx's `JSON.parse` decodes it transparently.

### 🐛 Fixed — control-flow robustness

- **`Match` resolved handlers through the prototype chain** — a bare `cases[discriminant]` lookup found inherited `Object.prototype` members, so `Match("toString", …)` invoked `Object.prototype.toString` as a handler (rendering `[object Undefined]`) and `Match("constructor", …)` / `Match("__proto__", …)` produced garbage or threw, instead of falling back to the default. Since the partial-with-default form is exactly what you use for user-supplied values (a status off a query param), this was attacker-reachable. Both the value and discriminated-union paths now use an own-property (`hasOwnProperty`) lookup, matching what `MatchValue` already did.
- **`ForEach` count/range overloads crashed the render on non-natural lengths** — `new Array(len)` throws `RangeError` for negative, fractional, `NaN`, or `Infinity` lengths, so `ForEach(capacity - items.length, …)` on an over-full list, a count derived from division, or an inverted range `ForEach(5, 3, …)` took down the whole SSR response. Numeric lengths are now clamped to a non-negative integer, so those cases render zero times (matching the empty-iterable overload) instead of throwing.
- **Discriminated-union `Match` accepted numeric/symbol discriminant keys that crashed at runtime** — `K extends keyof T` admitted keys the runtime `typeof key === "string"` guard rejects, sending the call down the wrong path (`TypeError` mid-render). The key is now constrained to `keyof T & string`, removing the class at compile time.

### ✨ Added

- **`./package.json` export** — tooling (the Tailwind extractor, ESLint plugin, bundler plugins, dependency scanners) can now read the package manifest through the exports map, which previously returned `ERR_PACKAGE_PATH_NOT_EXPORTED`.
- **Packaging regression test** (`test/packaging.test.ts`) — asserts `sideEffects` stays an array covering every mixin module, that each subpath yields a fully-populated Tag, and that `./package.json` remains exported, so none of the above can silently revert.

## [6.2.0] - Tailwind v4 Method Surface + HTML Element Completeness

Two tracks. **Track C** — 63 new fluent Tailwind methods (plus pure type-union additions on `.on()`/`.at()`) that previously forced a raw `.setClass(...)` escape hatch — covering SVG paint, text effects, shadows/filters/blending, v4 gradients, 3D transforms, attribute/structural variants, layout, and v4.1 masks. Every method is in the shared class vocabulary, so the extractor (safelist) and ESLint plugin (`134 → 197` methods) pick them up in lockstep. **Track B** — HTML-element attribute completeness closing `addAttribute` escape hatches: text-level edit/quotation (`Ins`/`Del`/`Q`/`Blockquote` `cite`/`datetime`), media & resource hints (`crossorigin`/`referrerpolicy`/`<source>` sizing/responsive preload/`theme-color` media), iframe security (typed `sandbox` tokens + `allow` record), and accessible tables (Id-typed `headers`, `abbr`, `TableCellScope`). Additive apart from the intentional type-narrowing breaks listed below; benign, well-typed inputs render unchanged.

### 💥 Breaking

- **`TailwindGradientDirection` is closed** — the `(string & {})` escape is removed, so `gradientTo`/`gradient` no longer accept an arbitrary/angle string (`gradientTo("45")` is a compile error). Use the new `gradientLinear(angle)`; only the 8 `to-*` keywords are valid as a direction.
- **`.at()` container-query breakpoints narrow to a closed scale** — `TailwindContainerBreakpoint` goes from the fully-open `` `@${string}` `` to the `@3xs`…`@7xl` scale (+ `@max-*` and the `@[…]`/`@min-[…]`/`@max-[…]` arbitrary arms). Every real container breakpoint still compiles; the only inputs that now error are out-of-scale tokens / typos (`.at("@8xl")`, `.at("@mdd")`) — which Tailwind never generated a class for, so no working CSS changes (same flavor as 6.1.1's sizing-union closure). The `nth-[…]` arm is also folded into the structural `nth-*` family, but that is value-compatible (every `nth-[…]` literal still type-checks).
- **`IframeTag.setSandbox` is now variadic closed tokens (RFC-B-03)** — `setSandbox(...tokens: SandboxToken[])` replaces the bare-string setter. A space-joined string no longer type-checks: `setSandbox("allow-scripts allow-same-origin")` → `setSandbox("allow-scripts", "allow-same-origin")`; `setSandbox()` → `sandbox=""` (fully locked). A misspelled token is now a compile error instead of a silently-weakened policy.
- **`IframeTag.setAllow` is now record-only (RFC-B-03)** — `setAllow(policy?: Partial<Record<PermissionsPolicyDirective, string>>)`; the raw-string arm is removed (a record value is a freeform string and subsumes any raw allowlist, including multiple origins). `setAllow("accelerometer; autoplay")` → `setAllow({ accelerometer: "", autoplay: "" })`; `setAllow({ camera: "'self'" })` → `allow="camera 'self'"`; `setAllow({})` → `allow=""` (deny all); `setAllow()` clears the attribute. Directive *names* are an open union (`PermissionsPolicyDirective`) — name typos still compile (autocomplete-assisted only), unlike the fully-closed `SandboxToken`.

### ✨ Added

- **SVG paint & color family** — `fillColor` / `strokeColor` (`fill-*` / `stroke-*`; named off `fill`/`stroke` to avoid the `SvgTag`/`SvgShapeTag` field collision — use `setFill`/`setStroke` for the literal SVG attribute), `strokeWidth`, `accentColor`, `caretColor`, `decorationColor` / `decorationStyle` / `decorationThickness`, and `scheme` (`color-scheme`).

  ```typescript
  Svg(Path().setD(icon)).fillColor("current").strokeColor("red-500").strokeWidth(2);
  A("Docs").underline().decorationColor("blue-500").decorationStyle("wavy").decorationThickness("2");
  ```

- **Axis & logical inset shorthands** — `insetX` / `insetY` (+ RTL-correct `insetS` / `insetE`), each with the `(unit, amount)` overload. (`size()` — the `size-*` w+h shorthand — is **deferred**: it collides with the `<select size>` instance field, the same class of break C-01 hit.)

- **Typography & text effects** — `textWrap` (`text-balance`/`text-pretty`, distinct from `whitespace`), `hyphens`, and `textShadow` / `textShadowColor` (Tailwind v4.1; value required, with the `text-shadow-lg/30` size-opacity form).

- **Shadows, filters & blending** — `dropShadow` / `dropShadowColor`, `insetShadow` / `insetShadowColor`, `insetRing` / `insetRingColor`, `mixBlend`, `bgBlend`, and `isolate` / `isolation`. (`dropShadow`/`insetShadow` require a value — v4 ships no bare `drop-shadow`/`inset-shadow`.)

- **Transitions** — `delay` (companion to `duration`) and `transitionBehavior` (`transition-discrete`, which makes `display`/popover/dialog animate — emit it alongside `transition`).

- **Tailwind v4 gradients** — optional stop positions on `from`/`via`/`to` (`from("indigo-500", "10%")`), `gradientLinear(angle)` as the sole linear-angle path, angle + origin on `gradientConic`/`gradientRadial`, and an optional color-interpolation modifier (`gradientTo("to-r", "oklch")` → `bg-linear-to-r/oklch`) on all four gradient emitters.

- **3D transforms** — `perspective` / `perspectiveOrigin` (the depth gates), per-axis `rotateX`/`rotateY`/`rotateZ` and `scaleX`/`scaleY`/`scaleZ` + `scale3d`, `transformStyle` / `backfaceVisibility`, and a `translate("z", …)` overload. Negatives relocate the leading `-` (`rotateX(-45)` → `-rotate-x-45`).

- **Variants & selectors on `.on()`/`.at()`** (pure type additions — the runtime already passed the prefix through) — named + unnamed `group-*`/`peer-*` states, the nine first-class `aria-*` boolean heads + `aria-[…]`/`group-aria-`/`peer-aria-`, `data-[…]`/`group-data-[…]`/`peer-data-[…]`, extra pseudo-classes (`read-only`, `target`, `autofill`, `user-valid`, `rtl`/`ltr`, …), the structural `nth-*` family, child/descendant `*`/`**`, and the closed `@3xs`…`@7xl` container scale.

  ```typescript
  Form<T>(...).on("aria-invalid", t => t.borderColor("red-500"));  // Form<T> already emits aria-invalid
  Ul(ForEach(rows, r => Li(r))).on("*", t => t.padding("y", "2"));
  ```

- **Layout** — grid-line placement `colStart` / `colEnd` / `rowStart` / `rowEnd` (negative lines → `-col-start-1`) and `rowSpan`; multi-column `columns` with `breakBefore` / `breakAfter` / `breakInside` / `boxDecoration`; scroll `snap` (+ strictness) / `snapAlign` / `snapStop` / `scrollBehavior` / `scrollMargin` / `scrollPadding`; and `fieldSizing` (JS-free auto-grow `<textarea>`; Chromium-only, degrades gracefully).

- **Masks (Tailwind v4.1)** — `maskImage` (`mask-none` / arbitrary), `maskFrom` / `maskTo` directional edge fades (the hero/scroll-edge fade), `maskComposite`, and `maskType` (SVG `<mask>`). The gradient-type roots (`mask-linear/radial/conic`) stay cut — they need their own from/to stops to mask anything.

  ```typescrip t
  Div().background("[url(/hero.jpg)]").maskFrom("b", "50%").maskTo("b", "90%");
  ```

- **HTML elements — form-control completeness (RFC-B-05)** — `setAccept` gains a `readonly string[]` overload (joins with `,`; ergonomics + autocomplete, **not** typo-checking — `accept` is open by spec); `setDirname` on Input/Textarea (the bidi submit companion, `${name}.dir`); `setAutocomplete` widened to the full WHATWG detail-token set with `shipping`/`billing` prefixes + `webauthn` suffix and extended to `Select` — this is **IDE autocomplete + hover-docs DX, not typo-rejection** (the `(string & {})` tail keeps the long-tail grammar compiling, so `"cc-numbr"` still compiles); `setFormtarget`/`setFormenctype` on Button (per-submit-button form-association overrides) backed by a new **closed** `FormEnctype` union (the one genuinely typo-rejecting addition, also single-sourcing the `enctype` literal previously inlined in `FormTag`); and `OutputTag.setFor` widened to the spec'd variadic, Id-typed space-separated id-set. New exports: `AutofillField`, `AddressField`, `AddressPurpose`, `FormEnctype`. Additive — every current call renders byte-identically. (eslint `prefer-set-method` gains `dirname`/`formtarget`/`formenctype`.)

  ```typescript
  Input("file").setName("avatar").setAccept(["image/png", "image/jpeg", "image/webp"]);
  Button("Upload").setType("submit").setFormaction("/upload").setFormenctype("multipart/form-data").setFormtarget("_blank");
  ```

- **HTML elements — accessible tables (RFC-B-04)** — `headers` cell-association on `ThTag`/`TdTag` via `setHeaders(...ids)` / `addHeaders(...ids)`, **Id-typed** against the `defineIds` registry (a typo is a compile error; `set` overrides, `add` accumulates de-duped, an empty list clears the attribute rather than emitting a dead `headers=""`); `abbr` on `ThTag` (`setAbbr`, th-only — a condensed header label for assistive tech); and the existing `th` `scope` literal promoted to an exported `TableCellScope` union for typing component props. Pass the raw id token (or an `Id`), not a `#selector`.

  ```typescript
  const ids = defineIds(["price-col", "q3-row"] as const);
  Th("Price (USD)").setId(ids.priceCol).setScope("col").setAbbr("Price");
  Td("$42").setHeaders(ids.priceCol, ids.q3Row);   // <td headers="price-col q3-row">
  ```

- **HTML elements — iframe security types (RFC-B-03)** — net-new exported unions `SandboxToken` (the fixed 13-token WHATWG `sandbox` set, fully closed) and `PermissionsPolicyDirective` (the `allow` directive registry, open-tailed) backing the breaking `setSandbox`/`setAllow` signature changes above. The two `<iframe>` attributes that form the security boundary are now typed: a misspelled `sandbox` token is a compile error, and `allow` is a directive record instead of a hand-joined string.

- **HTML elements — media & resource-hint completeness (RFC-B-01)** — `setCrossOrigin` on `Video`/`Audio` (reusing the `CrossOrigin | ''` union shipped on `Img`/`Link`/`Script`); `setWidth`/`setHeight` on `Source` (`string | number` → `String`, reserves the CLS box in art-directed `<picture>`); the `setReferrerPolicy` holdouts on `Img`/`Link`/`Script`/`Area` (completing the closed-`ReferrerPolicy` set already on `A`/`Iframe`); `setImagesrcset`/`setImagesizes` on `Link` for responsive `<link rel=preload as=image>`; and `setMedia` on `Meta` for per-color-scheme `theme-color`. `<source>` deliberately gains **no** `referrerpolicy` (the spec defines none) — locked by a negative compile assertion.

  ```typescript
  Video(Track().setSrc("https://cdn/x.vtt").setKind("captions")).setCrossOrigin("anonymous");
  Link().setRel("preload").setAs("image").setImagesrcset("/hero-480.jpg 480w, /hero-1080.jpg 1080w").setImagesizes("100vw");
  ```

- **HTML elements — text-level edit & quotation (RFC-B-02)** — new `Ins` / `Del` factories (`InsTag` / `DelTag`) carrying `setCite` + `setDatetime`; these are the only text-level edit elements that previously had no factory at all. `Q` / `Blockquote` are promoted in place to `QTag` / `BlockquoteTag` with `setCite` (additive return-type widening, no source-module move — barrel names and source lines unchanged). `cite` / `datetime` flow through the existing `escapeAttr` choke point; `cite` is escaped but not scheme-sanitized, matching `setHref`/`setSrc`.

  ```typescript
  Ins("added clause").setCite("/audit/12").setDatetime("2026-06-29T10:00");
  Blockquote(P(article.excerpt)).setCite(article.url);
  ```

- **Compile-only type tests** for the new closed unions in `test/types/*.test-d.ts` — positive/negative `@ts-expect-error` assertions lock "a typo is a compile error" (including the no-collision pin `Svg(Path()).fillColor("current")`, and the negative `Q`/`Blockquote` `setDatetime` assertions for RFC-B-02).

## [6.1.1] - Composition, Typed Forms, Morph Keys & Modern-Platform Hooks

Mostly additive, plus two intentional type-narrowing breaks and a couple of behavior alignments (all listed below). Folded into 6.1.1 because v6 is greenfield with no published consumers to break. Benign, well-typed inputs render unchanged.

### 💥 Breaking

- **The six sizing unions are now closed** (`TailwindWidth`/`Height`/`MaxWidth`/`MinWidth`/`MaxHeight`/`MinHeight`) — the `(string & {})` open tail is removed, so `.w("brnad")` is a **compile error** instead of silently emitting a dead `w-brnad` class. This finishes the v6 union-closure that colors/spacing/fontSize/radius/shadow already got. Arbitrary values are unaffected — use the bracket arm (`.w("[37px]")`) or the `(unit, amount)` overload (`.w("px", 37)`); `MaxWidth`/`MinWidth`/`MinHeight` gained an explicit `` `[${string}]` `` arm.
- **Removed the deprecated `OOB` / `withOOB` helpers** — replaced by `Partial()` (htmx 4's `<hx-partial>`) since 6.0. Migrate `OOB(id, content)` → `Partial(id, content)`; `withOOB(main, ...oob)` → a plain array `[main, ...partials]`.

### ✨ Added

- **`FluentCustomMethods` augmentation seam** — an empty interface that `Tag extends`, so an app can type chainable methods it registers on `Tag.prototype` (the same C-02 pattern `FluentCustomColors` et al. use to open the token unions). Declare the signatures through the barrel and they land on every `Tag`/subclass; `this` returns keep the fluent chain typed. Needed because `Tag` is a class re-exported through the barrel, so `declare module "fluent-html" { interface Tag }` cannot merge into it directly.

  ```typescript
  declare module "fluent-html" {
    interface FluentCustomMethods { nav(route: HTMX): this }
  }
  ```

- **`Tag.addChild(...views)`** — append children during fluent composition, the structural counterpart to `apply`/`when` (which only touch classes/attrs). Normalizes the scalar/array `child` union and escapes appended children like constructor children. (The `.when()` JSDoc previously referenced a `t.children(...)` method that never existed — now it points at the real `addChild`.)

  ```typescript
  Button("Save").when(isLoading, t => t.addChild(Spinner()));
  ```

- **`Tag.addStyle(decl)`** — the accumulating `add*` counterpart to `setStyle` (which replaces): appends a `prop: value` declaration to the inline `style` attr, merging with any existing style. With it, **all four CSS-custom-ident emitters — `anchorName` / `positionAnchor` / `positionArea` / `viewTransitionName` — now emit inline style instead of a Tailwind class** (`anchor-name: --x`, `position-area: bottom span-right`, …). Tailwind v4 has no native utility for any of them and the arbitrary-property/`position-area-*` classes were pure passthroughs the safelist extractor can't resolve (a dynamic ident was even an `onUnresolved` build error), so the classes silently rendered nothing. As inline style they're extractor-opaque and just work. `positionArea` stays fully type-safe via its closed `TailwindPositionArea` union — the hyphenated tokens map to their spaced CSS values (`"bottom-span-right"` → `position-area: bottom span-right`) and the `[…]` arm is unwrapped verbatim. The four methods are not in the class vocab; method signatures are unchanged.

  ```typescript
  A("Account").setPopovertarget(ids.menu).anchorName(ids.menu);   // style="anchor-name: --menu"
  Div().setPopover().positionAnchor(rowId);                       // dynamic id — no build error
  Div().setPopover().positionAnchor(menu).positionArea("bottom-span-right");
  //   style="position-anchor: --…; position-area: bottom span-right"  — no safelist needed
  ```

- **Native dialog dismiss (completes the 6.1.0 interactivity surface)** — `DialogTag.setClosedby("any" | "closerequest" | "none")` + the exported `ClosedBy` type give native `<dialog>` light-dismiss (`"any"` = click-outside + Esc), the standards-track replacement for hand-rolled backdrop/Escape handlers. `Button().setFormmethod` now also accepts `"dialog"` (widened to the existing `FormMethod` union) — a submit button that closes its ancestor `<dialog>` with its value. Together with `setCommand("show-modal")`, a modal now opens, dismisses, and closes with zero JS.

  ```typescript
  Dialog(EditForm(), Button("Cancel").setType("submit").setFormmethod("dialog"))
    .setId(ids.modal).setClosedby("any");
  Button("Edit").setCommand("show-modal").setCommandfor(ids.modal);   // opens it
  ```

- **`f.checkbox(name, value?)` / `f.radio(name, value)`** on the `Form<T>` builder — typed `checked`-wiring for the two controls whose state binding is most error-prone. `checkbox` reflects `Boolean(state.values[name])`; `radio` is checked when `String(state.values[name])` equals its `value`. Previously `f.input("agree", "checkbox")` silently emitted `value="true"` and never `checked`.

  ```typescript
  Form<SettingsReq>({ values: user }, (f) => [f.checkbox("notify"), f.radio("plan", "pro")]);
  ```

- **`apply` / `when` / `whenElse` accept `(tag) => unknown`** modifiers (return value was always discarded). A reusable style-fn typed against the base `Tag` — `const card = (t: Tag) => …` — now composes onto element subclasses (`Button`, `Input`, `A`, `Img`, …), and void-returning modifiers are accepted.

- **`ForEachKeyed(items, keyOf, renderItem)`** — keyed iteration that stamps each row's root tag with a stable `id` from `keyOf(item)`, so HTMX/idiomorph matches rows **by key** on reorder/insert/delete (positional matching otherwise loses focus, scroll, and in-progress transitions on a morph swap). `renderItem` must return a `Tag`.

  ```typescript
  Ul(ForEachKeyed(users, (u) => u.id, (u) => Li(u.name)))   // <li id="42">…</li>
  ```

- **TW4 relational state hooks** on `.on()` — `has-[…]`, `group-has-[…]`, `peer-has-[…]`, and the implicit-ancestor `in-[…]` arms added to `TailwindState`, so `.on("has-[:checked]", t => t.ring("2"))` type-checks and emits the prefix (was raw `.addClass` only). Pure type add — no emitter/vocab change.

- **`viewTransitionName(name | Id)`** — emits inline `style="view-transition-name: <name>"` (via `addStyle`, see above) so a hero element morphs across an HTMX `outerMorph` swap when `HtmxConfig({ transitions: true })` is on. Like the other three custom-ident emitters it is deliberately **not** in the class vocab — Tailwind has no native utility for it and the ident is extractor-opaque.

- **`defineRoutes` typed params — enum + path-checked keys.** A param can now be an enum (a `readonly` literal tuple → its member union): `params: { status: ["open", "paid"] as const }` makes `route({ status: "shipped" })` a compile error. And a `params` key that is **not** a `:param` in the path is now a compile error (was a silent no-op that re-widened the param to `string`). Exported `ParamType`.

  ```typescript
  defineRoutes("/orders", { byStatus: { method: "get", path: "/:status", params: { status: ["open","paid"] as const } } });
  ```

- **`HxOptions.query` — query params on `hx()`.** The string `hx()` escape hatch now takes a typed `QueryParams` bag, mirroring the route-callable surface (6.1.0). It folds into the endpoint URL through a single **join-aware** `buildQueryString(base, query)` shared by both surfaces: nullish entries are skipped, values are url-encoded, and params join with `?` or `&` depending on whether the base already carries a query string — so a fully-resolved `.resolve(params, query)` URL is safe to pass. Prefer a typed route callable when the route is modeled by `defineRoutes`; this bag is the escape hatch for ad-hoc URLs (a `searchUrl` prop, a third-party endpoint). Distinct from `vals` (request body, not url-encoded). `QueryParams` / `QueryParamValue` and `buildQueryString` moved from `routes.ts` to `htmx.ts` (public symbol names unchanged).

  ```typescript
  hx("/task", { query: { scope: "open", text: q } });   // → hx-get="/task?scope=open&text=…"
  hx("/task?event=E", { query: { _target: id } });       // → hx-get="/task?event=E&_target=…"  (joins with &)
  ```

- **Wildcard / splat route params on `defineRoutes`.** A trailing `*` (or named `*name`) captures the rest of the path as one required `string` param: `path: "/scope/*"` adds a `splat` param, `path: "/files/*path"` a `path` param. Each segment is url-encoded but `/` is preserved (catch-all) — so splats fit file trees and scoped slugs. An omitted/typo'd splat key is a compile error, and a missing value throws at `resolve()`. Only a *trailing* `/*` is a splat (mid-path wildcards are unsupported), and a splat route takes no declared `params` (it's always `string`) — declaring one stays a compile error.

  ```typescript
  const r = defineRoutes({
    scope: { method: "get", path: "/scope/*" },       // r.scope.resolve({ splat })
    file:  { method: "get", path: "/files/*path" },   // r.file.resolve({ path })
  } as const);
  r.scope.resolve({ splat: "a/b" });   // "/scope/a/b"     (slashes preserved)
  r.file.resolve({ path: "a b/c" });   // "/files/a%20b/c" (segments encoded)
  ```

- **Compile-only type tests** (`test/types/*.test-d.ts`) — positive/negative `@ts-expect-error` assertions for the closed/open unions, `Form<T>` field-name narrowing, and the new route-param typing, checked by `tsc` in the build. Locks "a typo is a compile error" as an enforced contract.

- **Global editing / keyboard setters on `Tag`** — `setEnterkeyhint`, `setContenteditable` (`"true"`/`"false"`/`"plaintext-only"`, bare call ⇒ `"true"`), `setSpellcheck`, `setAutocapitalize`, `setLang`/`setDir`/`setTranslate` (on any element, not just `<html>`), and `setHidden("until-found")` (find-in-page-revealable hidden content). New closed unions `EnterKeyHint`/`ContentEditable`/`Autocapitalize`/`Spellcheck`.

- **`setMicrodata({ type?, prop?, ref?, id? })`** on `Tag` — typed schema.org structured-data attributes (`itemtype`/`itemprop`/`itemref`/`itemid`); setting `type` also marks the element an `itemscope`. The value-bearing counterpart to the `itemscope` boolean toggle.

- **`setForm(id)`** on `Tag` — associate a form-associated control with a `<form>` elsewhere in the document by `id` (string or `Id`). `Input().setList(...)`, `Label().setFor(...)`, and `Output().setFor(...)` now also accept an `Id`.

- **Scalar `(unit, amount)` overloads** for `textSize` / `leading` / `tracking` / `underlineOffset` — `.textSize("px", 13)` → `text-[13px]` (the value overload is byte-identical). The `prefer-unit-overload` ESLint rule now covers and autofixes them. The raw `[…]` string remains the escape hatch.

- **`IframeTag.referrerpolicy`** retyped from bare `string` to the closed `ReferrerPolicy` union (matching `AnchorTag`), and **`AriaRole`** gained the WAI-ARIA 1.2/1.3 roles (`mark`, `comment`, `suggestion`, `meter`, `code`, `emphasis`, `strong`, …; additive — the union stays open).

### 🐛 Fixed

- **`Tag.when()` now branches on `!= null`**, matching `whenElse` and `IfThen`. A present-but-falsy value (`0`, `""`) takes the run branch and is narrowed to `NonNullable<T>`, instead of being silently skipped by JS truthiness. The boolean overload is unchanged (`when(false, …)` still skips).

- **`Form<T>` error wiring is now complete (a11y).** When `state.errors[name]` is set, the bound control (`f.input`/`textarea`/`select`/`checkbox`/`radio`) emits `aria-invalid="true"` and `aria-describedby="<name>-error"`, and `f.error(name)` renders its span with the matching `id="<name>-error"` — so the control and its message are wired as one unit for assistive tech and the `aria-invalid:` Tailwind variant. **Output change:** errored controls now carry these two ARIA attributes (well-formed/non-errored forms are byte-identical).

- **`setAria` values are now per-key typed** (was flat `string | number | boolean`). The enumerable states carry their token unions — `current`, `haspopup`, `live`, `sort`, `autocomplete`, `orientation`, `invalid` — so `setAria({ live: "polit" })` is now a compile error; tristate states accept `boolean | "mixed"`, numeric states accept `number`. **Narrowing:** only previously-broken token strings start erroring; every valid call still compiles.

### 📝 Docs

- Corrected the `defineRoutes` examples in the guidelines/`CLAUDE.md` to use **lowercase** HTTP methods (`method: "get"`/`"post"`) — uppercase `"GET"`/`"POST"` does not type-check against the `HxHttpMethod` union, so scaffolded routes were born non-building.

---

## [6.1.0] - Native Interactivity, Resource Hints & Control-Flow Combinators

Additive only — new setters, new exported types, and two new combinators. Open-union widenings keep every v6.0.0 caller compiling; rendered output is byte-identical for values that were already valid.

### ✨ Added

- **Native interactivity — Popover API, invoker Commands, and CSS anchor positioning** (zero JS, no CSP nonce):
  - **Popover API** — `setPopover(state?)` (defaults `"auto"`: light-dismiss + top-layer; `"manual"` for explicit dismiss), `setPopovertarget(id)`, `setPopovertargetaction(action?)` on any element. `PopoverState` / `PopoverAction` are closed unions; the target is `Id`-typed. Omitting the action emits no attribute (relies on the native `toggle` default).
  - **Invoker Commands** — `Button().setCommand(command)` / `setCommandfor(id)` — a JS-free, nonce-free alternative to the `openDialog`/`closeDialog` behaviors (which **remain**). `CommandFor` is closed over the native verbs (`show-modal`/`close`/`request-close`/`show-popover`/`hide-popover`/`toggle-popover`) plus a `` `--${string}` `` author-command arm.
  - **CSS anchor positioning** — `anchorName(id)` / `positionAnchor(id)` emit `[anchor-name:--<id>]` / `[position-anchor:--<id>]`; `positionArea(area)` emits `position-area-<area>` (`TailwindPositionArea`). Registered in the class-vocab so the extractor + eslint stay in lockstep. (Called with an `Id` variable, the two `[…:--<id>]` emitters are surfaced as *unresolved* by the extractor — safelist them; only `positionArea("literal")` resolves statically.)

  ```typescript
  Button("Open").setCommand("show-modal").setCommandfor(ids.dialog)   // <button command commandfor> — no hx-on, no nonce
  const menu = ids.userMenu;
  Button("Account").setPopovertarget(menu).anchorName(menu);
  Div(/* items */).setId(menu).setPopover().positionAnchor(menu).positionArea("bottom");
  ```

- **`setFetchPriority('high' | 'low' | 'auto')`** on `Img`, `Link`, `Script`, and `Iframe` — the typed Core Web Vitals priority hint (previously reachable only via `addAttribute`). Promote the LCP image/resource with `'high'` or de-prioritise a below-the-fold preload with `'low'`. `FetchPriority` is a **closed** union, so a typo is a compile error.

  ```typescript
  Img().setSrc("/hero.avif").setAlt("").setFetchPriority("high");          // LCP promotion
  Link().setRel("modulepreload").setHref("/app.js").setFetchPriority("low");
  ```

- **Typed open unions for head-element attributes**, replacing bare `string`: `LinkElementRel` (`<link rel>` resource hints + document relations — distinct from the anchor-rel `LinkRel`), `LinkAs`, `LinkType`, `ScriptType`, `MetaName`, and `Charset`. Each retypes its setter — `Link().setRel/setAs/setType`, `Script().setType`, `Meta().setName/setCharset` — and `Base().setTarget` now reuses the existing `BrowsingContext` union. Additive: custom/vendor values still compile via the `(string & {})` open tail; the canonical set autocompletes.

  ```typescript
  Link().setRel("preconnect").setHref("https://fonts.gstatic.com").setCrossOrigin("");
  Meta().setName("theme-color").setContent("#0b0b0b");
  Script().setSrc("/app.js").setType("module");
  ```

- **`MatchValue(value, cases, default?)`** — the value-returning sibling of `Match`: maps a value to another **value** (keeping its literal union) via a plain-value case record. Exhaustive without a default; supply a default to match a subset. Recovers the union a ternary erases to `string`. The result assigns into a fluent styling method only when every case value is a real Tailwind token (the closed `TailwindColor` union, or a `defineTheme()`-registered token):

  ```typescript
  const trend = MatchValue(omtm.trend, { up: "↑", down: "↓" }, "→");        // "↑" | "↓" | "→"
  Div().background(MatchValue(tone, { ok: "green-100", err: "red-100" }, "gray-100"));
  ```

- **`Intersperse(items, renderItem, separator)`** — places a separator *between* mapped Views, never after the last (the View analogue of `Array.join`). The thunk separator form is called once per gap, so callers return fresh Tag instances:

  ```typescript
  Nav(Intersperse(crumbs, (c) => A(c.label).setHtmx(c.route), () => Span("/").textColor("gray-400")));
  ```

---

## [6.0.1] - Correctness & Security Patch

Behavior-only fixes — no public API changes shape. Output differs **only** for inputs that were already malformed, malicious, or incorrect; well-typed, benign inputs are byte-identical.

### 🔒 Security

- **`hx-preload` string values are now attribute-escaped**, like every other `hx-*` string attribute. Closes an attribute break-out reachable from untyped callers (the typed `"mousedown" | "mouseover"` path is unchanged).
- **`setDataAttrs` now validates the computed `data-*` key** (the same attribute-name guard as `setAria`/`addAttribute`): a markup-breaking key — quotes, spaces, `=` — throws instead of emitting injectable HTML.

### 🐛 Fixed

- **Duplicate-attribute emission eliminated.** Every attribute name is now emitted at most once.
  - `.toggle("x").toggle("x")` (or two `.toggle("x", cond)` calls both true) now renders a single `x`, not `x x`.
  - `id`, `class`, and `style` are reserved to their dedicated setters: when a setter (`setId`/`setClass`/`setStyle`/fluent class) **and** `addAttribute("id"|"class"|"style", …)` are both used on a tag, the dedicated setter wins and the bag value is skipped (precedence: dedicated field > generic bag > bare toggle). With no dedicated setter, `addAttribute("id", …)` still emits the attribute.
  - A `.toggle("x")` whose name is also set via `addAttribute("x", …)` is dropped in favor of the value form.
- **Route params:** `defineRoutes()` callables and `.resolve()` now substitute each `:param` with a boundary-aware match in one shared helper. A param name that is a prefix of another (e.g. `:id` next to `:idCard`) no longer corrupts the URL, and a path that repeats a param now resolves all occurrences instead of throwing.
- **`HxResponse.trigger`:** multiple triggers are now accumulated in a structured map and serialized once at `build()`/`getHeaders()` — bare events as a comma list (`"a, b"`), detailed events as the JSON object form. An event name that parses as JSON (e.g. `"123"`) no longer drops earlier triggers.
- **htmx `ignore`:** `{ ignore: true }` now emits the bare boolean `hx-ignore` (htmx 4's disable-processing attribute) instead of the valued `hx-ignore="true"` — and never `hx-disable`, which in htmx 4 is the disabled-elements selector (the `disable` field), so the two no longer collide.

### 🔧 Tooling (extractor / eslint / class-vocab)

- **Extractor:** no longer emits spurious un-prefixed / partial-prefix classes for nested `.on()`/`.at()` variants — a class written only as `hover:focus:bg-red-500` no longer also safelists `hover:bg-red-500` and `bg-red-500`.
- **Extractor:** `extractDefaultClasses` no longer swallows a fluent call expression (`setHtmx(routes.list)`) as a class token; a `(...)` group is matched only inside an arbitrary `[...]` value.
- **ESLint `prefer-unit-overload`:** the CSS unit list is now generated from the library's `UNITS` (via `VOCAB_UNITS` in `vocab.generated.ts`) and drift-guarded, instead of being hardcoded in the rule.
- **Reverse class-vocab parity test:** every class-emitting `Tag.prototype` method must now appear in `classVocab` — catches a new emitter that forgets to register (as `htmxIndicator` once did) and would otherwise emit a class no extractor safelists.

---

## [6.0.0] - Greenfield v6

A greenfield, v4-native, instruction-set rewrite of the contract for new projects. Beyond the HTMX 4 migration, v6 reworks the everyday authoring surface (P3) and the keeper primitives (P4): one `.toggle()` boolean path, typed ARIA, complete/consistent setters, layout shortcuts, `.overlay()`, first-class control-flow/document APIs, typed `Form<T>` binding, native dialog behaviors, full SVG coverage, and `.htmxIndicator()`.

### 🚀 Breaking Changes

#### Boolean attributes — `.toggle()` only (P3)

Every named boolean setter is **removed** — `setChecked`, `setDisabled`, `setReadonly`, `setMultiple`, `setAutofocus`, `setSelected`, `setOpen`, `setNovalidate`, `setControls`, `setAutoplay`, `setLoop`, `setMuted`, `setPlaysinline`, `setAsync`, `setDefer`, `setNomodule`, `setAllowfullscreen`, `setDefault`. Use `.toggle("name")`, which renders the attribute **bare** — fixing the old `checked="false"` → browser-sees-checked bug. `BooleanAttribute` is now a closed union, so a typo is a compile error.

```typescript
Input().setChecked()          // ✗ removed
Input().toggle("checked")     // ✓ → <input checked>
Button().toggle("disabled", isLoading)
```

#### Setter renames + fixes (P3)

No aliases (greenfield): `setCrossorigin` → `setCrossOrigin` (now also accepts `""` for preconnect / Google Fonts), `setReferrerpolicy` → `setReferrerPolicy`, `setSvgOpacity` → `setOpacity`. `setHttpEquiv` now emits the real `http-equiv` attribute (was the silently-dead `httpEquiv`).

#### Position/display passthroughs → shortcuts (P3)

`.position(v)`, `.display(v)`, and `.flex1()` are removed in favor of dedicated zero-arg shortcuts: `.absolute()`/`.relative()`/`.fixed()`/`.sticky()`/`.static()`, `.block()`/`.inline()`/`.inlineBlock()`/`.inlineFlex()`/`.inlineGrid()`/`.contents()`, and `.flexShorthand("1"|"auto"|"initial"|"none")`.

#### `formFor` → `Form<T>(state?, build)` (P4)

The `formFor<T>()` factory is replaced by the `Form<T>` HOF, which additionally auto-wires values/errors from `state`:

```typescript
Form<CreateUserReq>({ values, errors }, (f) => [
  f.input("email", "email"),   // value wired from state; name typed to keyof T
  f.error("email"),            // error <span> from state.errors
])
```

#### `Overlay()` → `.overlay()` (P3)

The `Overlay(content, overlay, position)` function is replaced by the `Tag.prototype.overlay(position?, ...content)` method (works on void elements, e.g. `Img().overlay("bottom-right", Badge("3"))`).

#### Removed the fold / recursion-schemes layer

The fold layer is gone — `foldView`/`paraView`/`unfoldView`/`hyloView`, all algebras/coalgebras (`countAlgebra`/`textAlgebra`/`linksAlgebra`/`renderAlgebra`/`ariaDescribeAlgebra`/`createTransformAlgebra`/`addClassToMatching`/`tocCoalgebra`/`linkedTocCoalgebra`), the `fluent-html/fold` subpath, and their types. It was demo-only (~1000 LOC) and a disproportionate source of Track-D bugs; the real needs (a11y audit / TOC / link extraction) are short plain recursive `View` walks in app-land. `FOLD.md` and `functional-patterns.md` are deleted.

#### No context/DI in core

`createContext` / `createRequiredContext` / `Context` (added on the v5 line) are **not** part of v6 core. Scoped context is a request-lifecycle concern that belongs to the framework layer (an `@fluent-html/fastify`-style package), where async isolation can be handled correctly — a pure HTML builder has no business owning a process-global DI stack. Render is fully decoupled from context (values are baked into the tree at construction; `render()` never reads context), so it leaves cleanly.

#### HTMX 4 Compatibility

Updated the HTMX integration from v2 to v4. This is a major update that aligns with htmx 4's new defaults and removed features.

**Removed attributes:**
- `selectOob` — removed from htmx 4
- `params` — removed from htmx 4
- `prompt` — removed from htmx 4
- `disinherit` / `inherit` — htmx 4 no longer inherits by default; use `:inherited` modifier instead
- `history` / `historyElt` — removed from htmx 4
- `request` — replaced by per-element `config`
- `ext` — extensions are now configured globally via `HtmxConfig()`

**Renamed attributes:**
- `disabledElt` → `disable` — aligns with htmx 4 naming
- `disable` (boolean) → `ignore` — `hx-disable` is now `hx-ignore` in htmx 4

**Removed response helpers:**
- `triggerAfterSwap()` / `triggerAfterSettle()` — removed from htmx 4's `HxResponse`

### ✨ New Features

#### Type-Safe Routes (`defineRoutes`)

New `defineRoutes()` function for compile-time-safe HTMX endpoints:

```typescript
// Shared prefix avoids path repetition
export const userRoutes = defineRoutes("/users", {
  list:   { method: "get",    path: "/" },
  create: { method: "post",   path: "/" },
  delete: { method: "delete", path: "/:id" },
} as const);

// Views — method is locked, params are required, typos are compile errors
Button("Load").setHtmx(userRoutes.list())
Button("Delete").setHtmx(userRoutes.delete({ id: user.id }, { target: ids.userList }))

// Controllers — single-sourced paths
server.get(userRoutes.list.path, handler)

// Resolved URLs for redirects, links, etc.
reply.redirect(userRoutes.delete.resolve({ id: user.id }))
```

Path parameters (`:id`) are extracted at the type level and required at call time. Routes expose `.method`, `.path`, and `.resolve()` for server-side use.

#### Query Parameters on Routes

Routes now accept query parameters on both the callable and `.resolve()`. Nullish values are silently skipped:

```typescript
// resolve() with query params
userRoutes.list.resolve({ page: "2", sort: "name" })                       // "/users?page=2&sort=name"
userRoutes.delete.resolve({ id: user.id }, { tab: "posts" })               // "/users/42?tab=posts"
userRoutes.list.resolve({ page: "1", filter: undefined })                   // "/users?page=1"

// HTMX calls with query params
Button("Page 2").setHtmx(userRoutes.list({ query: { page: "2" } }))
```

Supports `string`, `number`, and `boolean` values. Keys and values are properly encoded via `encodeURIComponent`.

#### Morph Swap Strategies

New swap styles for DOM-preserving morphs:
- `outerMorph` — morph the target element itself (preserves focus, scroll, animations)
- `innerMorph` — morph the target's children

Short swap aliases: `before`, `after`, `prepend`, `append`.

#### Partial Multi-Swap (`Partial`)

New `Partial()` helper replaces OOB swaps with htmx 4's `<hx-partial>` element:

```typescript
render(
  Partial(ids.mainContent, UserList(users)),
  Partial(ids.userCount, Span(`${users.length} users`)),
)
```

`OOB()` and `withOOB()` are now deprecated.

#### Global HTMX Config (`HtmxConfig`)

New `HtmxConfig()` helper for type-safe global htmx configuration via `<meta>` tag:

```typescript
Head(
  HtmxConfig({
    extensions: "sse, preload",
    transitions: true,
    defaultSwap: "outerMorph",
    implicitInheritance: true,
  }),
)
```

#### Per-Element Config

New `config` option replaces the removed `hx-request` attribute:

```typescript
Button("Upload").hxPost("/upload", { config: { timeout: 120000 } })
```

#### Status-Code Routing

Route HTMX responses to different targets based on HTTP status codes:

```typescript
Form().hxPost("/users/create", {
  target: ids.mainContent,
  swap: "outerMorph",
  status: {
    422: { target: ids.formErrors, swap: "innerHTML" },
    "5xx": { swap: "none" },
  }
})
```

#### Preload & Optimistic UI

- `preload` — prefetch responses on hover before click
- `optimistic` — show expected content before server responds

#### Typed accessibility setters (P3)

`setRole(AriaRole)`, `setTabindex(number)`, `setTitle(string)`, and a retyped `setAria(AriaAttrs)` with closed `AriaAttributeName` keys + boolean/tristate values. `setAria({ haspopup: true })` now emits the correct `aria-haspopup` (was the mangled `aria-has-popup`).

#### Expanded element setters + `_sk` tuple (P3)

`setInputmode` (Input/Textarea), `setHreflang` (Link/Anchor), `setCapture` (Input), SVG `setStrokeDashoffset`/`setStrokeOpacity`, and an optional `OptionTag.setValue()`. Internally, `_sk` schema keys gained a `[prop, attr]` tuple form so a JS field can emit a differently-named attribute (e.g. `httpEquiv` → `http-equiv`).

#### Negative transforms + layout shortcuts (P3)

`.translate`/`.rotate`/`.skewX`/`.skewY` accept negatives and emit them correctly (`-translate-y-1`, not the dropped `translate-y--1`). Plus the position/display shortcuts and `.flexShorthand()` noted in Breaking Changes.

#### Control-flow & document APIs (P3)

- `ForEachElse(items, renderItem, emptyView)` — list with an empty fallback.
- `Tag.whenElse(cond|value, then, else)` — two-branch modifier (mirrors `IfThenElse`, not truthiness — `""`/`0` take the `then` branch).
- `Document(...)` / `Doctype()` — a full document that emits `<!DOCTYPE html>` (`DocumentTag extends HtmlTag`, chainable); plain `HTML(...)` stays byte-identical.
- `.hxOn(event, js)` — typed one-off `hx-on:*` handler (event validated, js attribute-escaped).

#### `.overlay()` + type-only exports (P3)

SwiftUI-style `.overlay()` (see Breaking Changes). The 15 HTMX/`Id` type re-exports are now `export type` — TS1205-safe under `verbatimModuleSyntax`.

#### Typed form binding — `Form<T>` (P4)

`Form<T>(state?, build)` (see Breaking Changes), with `FormState<T>`/`FormBinding<T>`/`ErrorBag<T>` types, value/error auto-wiring (including `<select>` selected state), and `FormTag.multipart()`.

#### Native dialog behaviors + behavior widening (P4)

- `behavior("openDialog"/"closeDialog", { target })` — call native `<dialog>.showModal()`/`.close()` (free backdrop / Esc / focus-trap / top-layer).
- `toggle`/`toggleClass`/`remove` gained `event?`, `force?`, and `animateOut?`.
- New `formResetOnSwap` / `dismissOnEscape` behaviors.

#### Complete SVG coverage (P4)

Typed container builders — `LinearGradient`/`RadialGradient`/`Stop`, `ClipPath`, `Mask`, `Filter`/`FeGaussianBlur` — plus the missing stroke setters, so icons and effects are typed Views instead of `Raw("<svg…>")` strings.

#### `.htmxIndicator()` (P4)

Sanctioned method emitting the library-known `htmx-indicator` class, recognised by the Tailwind extractor and ESLint (unlike a raw `.setClass("htmx-indicator")`).

#### New & updated ESLint rules

`prefer-toggle` (boolean `addAttribute` → `.toggle()`), `no-removed-v4-utilities`, `no-raw-icon-string`, and an extended `prefer-set-method` (drops the removed boolean setters; flags `aria-*`/`data-*`/`style`/role/title/tabindex).

---

## [5.11.0] - Type-Safe Routes & Contexts

### ✨ New Features

#### Typed Route Parameters

`defineRoutes()` now supports typed path parameters — `string`, `number`, and `uuid`. The type is enforced at compile time and validated at resolve time:

```typescript
export const userRoutes = defineRoutes("/users", {
  list:   { method: "get",  path: "/" },
  detail: { method: "get",  path: "/:id", params: { id: "number" } as const },
  bySlug: { method: "get",  path: "/:slug", params: { slug: "string" } as const },
  byUuid: { method: "get",  path: "/:uuid", params: { uuid: "uuid" } as const },
} as const);

userRoutes.detail.resolve({ id: 42 })      // "/users/42" — id must be number
userRoutes.bySlug.resolve({ slug: "hello" }) // "/users/hello" — slug must be string
```

#### Required Context (`createRequiredContext`)

New `createRequiredContext()` for values that **must** have an active scope — throws if accessed outside one. Use for values like request-specific auth where a missing scope is always a bug:

```typescript
const AuthCtx = createRequiredContext<User>("AuthCtx");

function handler(user: User) {
  using _ = AuthCtx.scope(user);
  return Page();
}

function Page() {
  const user = AuthCtx.current;  // User — throws if no scope active
  return Div(`Hello, ${user.name}`);
}
```

Compare with `createContext(defaultValue)` which returns the default silently.

#### Strict `HxSwap` Type

`HxSwap` is now a strict union type — invalid swap values are compile errors instead of being silently accepted.

---

## [5.10.0] - Performance, Inputs & Styling

### ✨ New Features

#### Generic `Input()` Factory

`Input()` now accepts an optional type argument that locks `min`, `max`, and `step` to the correct types:

```typescript
Input("number").setMin(0).setMax(100).setStep(5)   // min/max: number
Input("date").setMin("2024-01-01")                   // min/max: string
Input("range").setMin(0).setMax(10).setStep(0.5)    // min/max: number
Input("email")                                       // no min/max/step
Input()                                              // all types allowed
```

#### 29 New Tailwind Fluent Methods

Added fluent methods for gradients, filters, typography, and more:

- **Gradients:** `gradientTo(direction)`, `from(color)`, `via(color)`, `to(color)`
- **Filters:** `blur()`, `brightness()`, `contrast()`, `grayscale()`, `hueRotate()`, `invert()`, `saturate()`, `sepia()` — plus `backdrop*` variants for all
- **Group/Peer:** `group(name?)`, `peer(name?)` — support named variants like `group/form`
- **Typography:** `fontFamily()`, `antialiased()`, `tabularNums()`, `underlineOffset()`, `lineClamp()`, `breakAll()`, `listStyleType()`, `listStylePosition()`
- **Colors:** `shadowColor()`
- **Layout:** `gridAutoFlow()`, `gridAutoRows()`, `gridAutoCols()`, `placeContent()`, `placeItems()`, `placeSelf()`
- **Other:** `ease()`, `skewX()`, `skewY()`, `willChange()`, `overscroll()`, `resize()`, `neg(cls)`

#### Arbitrary Value Unit Overloads

Sizing, spacing, and position methods now accept a `(unit, amount)` overload for arbitrary values:

```typescript
Div().w("px", 180)        // → w-[180px]
Div().h("rem", 2.5)       // → h-[2.5rem]
Div().minH("vh", 50)      // → min-h-[50vh]
Div().padding("px", 12)   // → p-[12px]
Div().top("em", 1.5)      // → top-[1.5em]
```

Units: `px`, `rem`, `em`, `%`, `vh`, `vw`, `dvh`, `svh`, `lvh`. Available on `w`, `h`, `minW`, `maxW`, `minH`, `maxH`, `padding`, `margin`, `gap`, `top`, `right`, `bottom`, `left`, `inset`.

#### Recursion Schemes

Three new recursion schemes for View tree processing, complementing the existing `foldView`:

- **`paraView(alg, view)`** — Paramorphism: like `foldView`, but the `tag` handler also receives the original subtree
- **`unfoldView(coalg, seed)`** — Anamorphism: builds a View tree by recursively expanding a seed
- **`hyloView(coalg, alg, seed)`** — Hylomorphism: fused unfold-then-fold in a single pass without intermediate allocation

Built-in algebras: `ariaDescribeAlgebra` (paramorphism for accessibility audit). Built-in coalgebras: `tocCoalgebra`, `linkedTocCoalgebra` (generate `<ul>/<li>` TOC from flat heading list).

See [functional-patterns.md](functional-patterns.md) for full documentation.

### 🔧 Improvements

#### Render Performance

Optimized the render path: **+47% throughput** on flat pages, **+20%** on realistic nested pages. No API changes.

#### SVG Improvements

- `setStrokeWidth()` added to `SvgTag` (not just shape elements)
- `setWidth()`, `setHeight()`, `setStrokeWidth()` now accept `string | number` on `SvgTag`, `RectTag`, and `ForeignObjectTag`
- `setOpacity()` added to `SvgShapeTag`
- `G()` now returns `SvgShapeTag` (gains fill, stroke, transform methods)

---

## [5.9.1]

### 🔧 Improvements

- Updated codebase analysis: API Design now 10/10 (all dimensions at 10/10)

---

## [5.9.0] - Strict Types & API Cleanup

### 🚀 Breaking Changes

#### Strict Tailwind Types

The `Autocomplete<T> = T | (string & {})` escape hatch has been replaced with strict union types on all Tailwind method signatures. Wrong values don't compile. For arbitrary Tailwind values (e.g., `p-[37px]`), use `addClass()`.

#### `.toggle()` Only

`setToggles()` has been replaced by `.toggle()`:

```typescript
Input().toggle("required").toggle("disabled")
Input().toggle("required", isRequired)  // conditional
```

#### `Match()` Only

The deprecated `SwitchCase` export has been replaced by `Match()`.

#### Void Elements Reject Children

Void element factories (`Input`, `Img`, `Hr`, `Br`, `Source`, `Track`, `Col`, `Embed`, `Area`, `Wbr`, `Meta`, `Link`, `Base`) now accept zero arguments. Children passed to void elements are silently ignored at render time.

### ✨ New Features

#### Named Tailwind Types

Extracted 5 named types for better consumer DX:
- `TailwindPosition` — `"static" | "fixed" | "absolute" | "relative" | "sticky"`
- `TailwindTextAlign` — `"left" | "center" | "right" | "justify"`
- `TailwindFlexDirection` — `"row" | "col" | "row-reverse" | "col-reverse"`
- `TailwindJustifyContent` — `"start" | "end" | "center" | "between" | "around" | "evenly"`
- `TailwindAlignItems` — `"start" | "end" | "center" | "baseline" | "stretch"`

All types re-exported from `core/index.ts`.

#### Typed SVG Attribute Setters

All SVG elements now have typed tag classes with fluent attribute setters:

- **`SvgShapeTag`** (shared base) — `setFill()`, `setStroke()`, `setStrokeWidth()`, `setStrokeLinecap()`, `setStrokeLinejoin()`, `setStrokeDasharray()`, `setSvgOpacity()`, `setTransform()`
- **`CircleTag`** — `setCx()`, `setCy()`, `setR()`
- **`RectTag`** — `setX()`, `setY()`, `setWidth()`, `setHeight()`, `setRx()`, `setRy()`
- **`LineTag`** — `setX1()`, `setY1()`, `setX2()`, `setY2()`
- **`PathTag`** — `setD()`, `setFillRule()`, `setClipRule()`
- **`EllipseTag`** — `setCx()`, `setCy()`, `setRx()`, `setRy()`
- **`PolygonTag`** / **`PolylineTag`** — `setPoints()`
- **`SvgTextTag`** — `setX()`, `setY()`, `setDx()`, `setDy()`, `setTextAnchor()`, `setDominantBaseline()`, `setFontSize()`, `setFontFamily()`
- **`TspanTag`** — `setX()`, `setY()`, `setDx()`, `setDy()`
- **`UseTag`** — `setHref()`, `setX()`, `setY()`, `setWidth()`, `setHeight()`

> `setSvgOpacity()` is used instead of `setOpacity()` to avoid conflict with Tailwind's `.opacity()`.

---

## [5.8.1]

### 🔧 Improvements

#### Type Safety Improvements

- **Literal string unions** — replaced bare `string` types with specific literal unions where only certain values are valid
- **Branded `Id` type** — prevents mixing up different ID types at compile time
- **Type guards** — `isTag()` and `isRawString()` for safe runtime type narrowing
- **Constrained `.toggle()`** — now accepts only valid `BooleanAttribute` names

---

## [5.8.0]

### 🔧 Improvements

#### Test Suite Migration

- Migrated entire test suite from custom test runner to `node:test` (built-in Node.js test runner)
- All tests now run with `node --test` — no external test framework needed

#### Code Quality

- Refactored `buildHtmx` to data-driven architecture, eliminating repetitive conditional branches
- Extracted `resolveSelector` utility for consistent ID/selector handling
- Removed deprecated `ForEach1`, `ForEach2`, `ForEach3` aliases
- Output target updated to ES2020 with ESM modules

---

## [5.7.1]

### ✨ New Features

#### Variadic `render()`

`render()` now accepts variadic arguments, making multi-element responses cleaner:

```typescript
render(Partial(ids.list, items), Partial(ids.count, count))
```

#### New ESLint Rules

Six new rules added to the `fluent-html` ESLint plugin:

- **`no-setclass-in-when-apply-callback`** — prevents `setClass()` inside `.when()` / `.apply()` callbacks (overwrites earlier classes)
- **`prefer-variadic-children`** — suggests `Div(a, b)` over `Div([a, b])`
- **`no-conditional-in-setclass`** — flags template literals/ternaries in `setClass()`; suggests `.setClasses()` or `.when()`
- **`no-innerhtml-swap`** — prevents `swap: "innerHTML"` (loses target ID); auto-fixes to `"outerHTML"`
- **`prefer-set-method`** — suggests `.setType("submit")` over `.addAttribute("type", "submit")`; auto-fixable
- **`no-raw-ids`** — flags hardcoded `.setId("string")` and `target: "#string"`; suggests `defineIds()`

### 🔧 Improvements

- `no-known-modifiers-in-setclass` now also checks `addClass()` calls (skips pseudo-class prefixed classes like `hover:`)
- `no-setclass-after-fluent-modifier` recognizes `when()` and `apply()` as fluent modifiers

---

## [5.7.0]

### ✨ New Features

#### Conditional Modifier (`.when()`)

Conditionally apply modifications to a tag without breaking the chain:

```typescript
Button("Save")
  .when(isLoading, t => t.toggle("disabled").addClass("opacity-50"))
  .when(isPrimary, t => t.addClass("bg-blue-500 text-white"))
```

#### Composable Modifier (`.apply()`)

Apply reusable modifier functions for consistent styling patterns:

```typescript
const card = (t: Tag) => t.padding("6").background("white").rounded("lg").shadow("md");
const danger = (t: Tag) => t.addClass("border-red-500 text-red-700");

Div("Warning").apply(card, danger)
```

---

## [5.6.0]

### 🔧 Improvements

- Documentation updates across README, AI instructions, and styling guides to reflect variadic children as the recommended pattern
- Removed deprecated array-only iteration helpers

---

## [5.5.0]

### ✨ New Features

#### Variadic Children

Element constructors now accept **variadic children** instead of requiring an array:

```typescript
// Before (array required for multiple children)
Div([H1("Title"), P("Body")])

// After (variadic — no array needed)
Div(H1("Title"), P("Body"))
```

The array form still works but variadic is now the recommended style. Use arrays only when passing a dynamic `View[]` variable (e.g., from `ForEach` or `.map()`).

#### HTMX Shorthand Methods

New shorthand methods on all tags for the most common HTMX operations:

```typescript
// Before — always needed the hx() wrapper
Button("Load").setHtmx(hx("/api/items"))
Button("Save").setHtmx(hx("/api/save", { method: "post", target: "#result" }))

// After — shorthand methods with the HTTP method baked in
Button("Load").hxGet("/api/items")
Button("Save").hxPost("/api/save", { target: "#result" })
Button("Update").hxPut("/api/item/1")
Button("Patch").hxPatch("/api/item/1")
Button("Remove").hxDelete("/api/item/1", { confirm: "Sure?" })
```

#### setHtmx Overloads

`setHtmx` now accepts an endpoint string and options directly, in addition to a pre-built HTMX object:

```typescript
// New — inline args (method defaults to GET)
Button("Load").setHtmx("/api/items")
Button("Save").setHtmx("/api/save", { method: "post", target: "#result" })

// Still works — pre-built hx() object
Button("Load").setHtmx(hx("/api/items"))
```

#### HxOptions Type

New exported `HxOptions` type derived from the `HTMX` interface. Eliminates duplication between the interface and the `hx()` function signature:

```typescript
import type { HxOptions } from 'fluent-html';

// HxOptions = Partial<Omit<HTMX, 'endpoint' | 'method' | 'target'>>
//           & { method?: HxHttpMethod; target?: HxTarget | Id }
```

#### Nullable Value Overloads for IfThen / IfThenElse

`IfThen` and `IfThenElse` now accept a nullable value (`T | null | undefined`) instead of a boolean. When the value is non-null, it is passed into the callback with its type narrowed to `T`:

```typescript
const user: User | null = getUser();

// Before — requires !! and !
IfThen(!!user, () => Span(`Welcome, ${user!.name}`))

// After — type-safe, no assertions needed
IfThen(user, (u) => Span(`Welcome, ${u.name}`))

// Works with IfThenElse too
IfThenElse(user, (u) => Span(`Welcome, ${u.name}`), () => A("Login").setHref("/login"))
```

## [5.1.0] - 2025-01

### ✨ New Features

#### Type-Safe Fluent Styling

All fluent styling methods now have **type-safe parameters** with IDE autocomplete for Tailwind values:

```typescript
Div()
  .w("full")              // IDE suggests: "full", "1/2", "screen", "64", etc.
  .background("red-500")  // IDE suggests: all color-shade combinations
  .rounded("lg")          // IDE suggests: "sm", "md", "lg", "xl", "full", etc.
```

The type system suggests valid Tailwind values while still allowing custom/arbitrary values when needed via the `Autocomplete<T>` helper type.

#### New Text Styling Methods

Added 10 new fluent methods for common text styling:

- `.bold()` - Shorthand for `font-bold`
- `.italic()` - Add `italic` class
- `.uppercase()` - Text transform to uppercase
- `.lowercase()` - Text transform to lowercase
- `.capitalize()` - Capitalize first letter of each word
- `.underline()` - Add underline decoration
- `.lineThrough()` - Add line-through decoration
- `.truncate()` - Truncate with ellipsis
- `.leading(value)` - Line height (`leading-tight`, `leading-relaxed`, etc.)
- `.tracking(value)` - Letter spacing (`tracking-wide`, `tracking-tight`, etc.)

**Example:**
```typescript
Span("IMPORTANT")
  .bold()
  .uppercase()
  .tracking("wide")
  .textColor("red-500")

P("Long text that might overflow...")
  .truncate()
  .w("48")
```

---

## [4.0.0-beta.1] - 2025-01

### 🎉 New Feature: Reactive System

Fluent HTML now includes a **minimal, compile-time-checked reactive system** for client-side rendering with automatic state management and DOM updates.

#### ✨ Key Features

**Declarative Reactive Bindings:**
- `.bindText(expr)` - Bind expression to textContent
- `.bindHtml(expr)` - Bind expression to innerHTML (⚠️ XSS risk)
- `.bindShow(expr)` / `.bindHide(expr)` - Conditional visibility
- `.bindClass(className, expr)` - Dynamic CSS classes
- `.bindAttr(attrName, expr)` - Dynamic attributes
- `.bindStyle(propName, expr)` - Dynamic inline styles
- `.bindValue(expr)` - Two-way input binding

**Event Handlers:**
- `.onClick(statement)` - Click event handler
- `.onInput(statement)` - Input event handler
- `.onChange(statement)` - Change event handler
- `.onSubmit(statement)` - Form submit handler (with automatic preventDefault)
- `.onKeydown(statement)` - Keyboard event handler
- `.onFocus(statement)` / `.onBlur(statement)` - Focus event handlers

**Compile-Time Validation:**
- `compile(view)` validates all reactive bindings before runtime
- Checks that all `data.xxx` references are bound by `bindState()`
- Prevents variable shadowing in nested state
- Provides helpful error messages for unbound variables

**Simple API Pattern:**
- `bind*` methods for reactive data → DOM
- `on*` methods for DOM events → data mutations
- All expressions reference state via `data.propertyName`

#### 📝 Usage Example

```typescript
import { Div, Button, Span, compile, renderWithScript } from 'fluent-html';

const counter = Div([
  Button("Increment").onClick("data.count++"),
  Span().bindText("'Count: ' + data.count"),
  Div("High count!").bindShow("data.count > 5")
]).bindState({ count: 0 });

const error = compile(counter);
if (error) throw new Error(error.message);

console.log(renderWithScript(counter));
// Outputs HTML + <script> with reactive behavior
```

#### 🔧 New API Functions

- `compile(view)` - Validate reactive bindings and assign unique IDs
- `generateScript(view)` - Generate JavaScript for reactive behavior
- `renderWithScript(view, renderFn?)` - Convenience function combining render() and generateScript()
- `resetIdCounter()` - Reset global ID counter (useful for testing)

#### 🏗️ Implementation Details

- Zero runtime dependencies - generates vanilla JavaScript
- Automatic ID assignment for reactive elements
- Efficient DOM updates via `update()` function
- Event handlers automatically call `update()` after mutations
- IIFE wrapper for state isolation
- Support for nested `bindState()` for component composition

#### 📚 Documentation

See the new **Reactive System** section in README.md for:
- Complete API documentation
- Reactive binding examples
- Event handler patterns
- Compile-time validation guide
- Complete working examples (counter, todo list, forms, tabs)

---

## [3.0.0] - 2025-01

### 🚀 Breaking Changes

This is a major release with a **completely redesigned API**. The new API uses **method chaining** instead of object configuration, providing superior IDE autocomplete and type safety.

#### Before (v1.x / v2.x)
```typescript
Div({
  id: "container",
  class: "flex items-center",
  child: Text("Hello")
})
```

#### After (v3.0.0)
```typescript
Div("Hello")
  .setId("container")
  .setClass("flex items-center")
```

### ✨ New Features

#### 🎯 IDE-Powered Development

The new type system provides **intelligent autocomplete** for:
- All HTMX triggers (`click`, `load`, `revealed`, `keyup changed delay:300ms`, etc.)
- All HTMX swap strategies (`innerHTML`, `outerHTML scroll:top`, etc.)
- All HTMX sync modes (`drop`, `abort`, `queue last`, etc.)
- Element-specific methods (`.setColspan()` only on `Th`/`Td`, `.setMin()` only on `Input`, etc.)

#### 🛡️ Built-in XSS Protection

All text content and attributes are **automatically HTML-escaped**:
- Text content: `<script>` → `&lt;script&gt;`
- Attributes: `"><script>` → `&quot;&gt;&lt;script&gt;`
- Script/Style elements are NOT escaped (intentional - they contain code)
- No opt-out, no `Raw()` helper - security by default

#### ⚡ Complete HTMX 2.0 Support

Full type-safe support for all HTMX 2.0 attributes:
- **Methods**: `get`, `post`, `put`, `patch`, `delete`
- **Targeting**: `target`, `swap`, `swapOob`, `select`, `selectOob`
- **Triggers**: All DOM events, `load`, `revealed`, `intersect`, polling, SSE, WebSocket
- **URL**: `pushUrl`, `replaceUrl` (with custom URL support)
- **Data**: `vals`, `headers`, `include`, `params`, `encoding`
- **Validation**: `validate`, `confirm`, `prompt`
- **Loading**: `indicator`, `disabledElt`
- **Sync**: `drop`, `abort`, `replace`, `queue`, `queue first`, `queue last`, `queue all`
- **Inheritance**: `disinherit`, `inherit`
- **History**: `history`, `historyElt`
- **Other**: `preserve`, `request`, `boost`, `disable`, `ext`

#### 🔧 Selector Helpers

Type-safe helpers for HTMX extended selectors:
```typescript
import { id, clss, closest, find, next, previous } from 'fluent-html';

id("content")      // → "#content"
clss("items")      // → ".items"
closest("tr")      // → "closest tr"
find(".content")   // → "find .content"
next("div")        // → "next div"
previous("li")     // → "previous li"
```

#### 📦 60+ HTML Elements

Complete HTML5 coverage with typed attribute methods:

**New semantic elements**: `Nav`, `Aside`, `Figure`, `Figcaption`, `Address`, `Hgroup`, `Search`

**New text elements**: `H5`, `H6`, `Strong`, `Em`, `Mark`, `Small`, `Sub`, `Sup`, `Abbr`, `Cite`, `Q`, `Dfn`, `Kbd`, `Samp`, `Var`, `Br`, `Wbr`, `Bdi`, `Bdo`, `Ruby`, `Rt`, `Rp`, `Blockquote`, `Pre`, `Code`

**New list elements**: `Dl`, `Dt`, `Dd`, `Menu`

**New table elements**: `Tfoot`, `Caption`, `Colgroup`, `Col` (with typed `ThTag`/`TdTag` supporting `colspan`/`rowspan`/`scope`)

**New form elements**: `Fieldset`, `Legend`, `Datalist`, `Output`, `Optgroup`

**Enhanced Input**: `step`, `pattern`, `minlength`, `maxlength`, `autocomplete`, `autofocus`, `checked`, `disabled`, `readonly`, `multiple`, `list`

**Enhanced Textarea**: `minlength`, `maxlength`, `wrap`, `autocomplete`, `autofocus`, `disabled`, `readonly`

**Enhanced Button**: `formaction`, `formmethod`, `disabled`

**New interactive elements**: `Details` (with `open`, `name`), `Summary`, `Dialog` (with `open`)

**New media elements**: `Audio`, `Source`, `Track`, `Picture`, `Canvas`, `Svg` + SVG primitives (`Path`, `Circle`, `Rect`, `Line`, `Polygon`, `Polyline`, `Ellipse`, `G`, `Defs`, `Use`, `Text`, `Tspan`)

**New embedded elements**: `Iframe` (with `sandbox`, `allow`, `loading`), `ObjectEl`, `Embed`, `MapEl`, `Area`

**New document elements**: `Title`, `Meta` (with `charset`, `name`, `content`, `httpEquiv`, `property`), `Link` (with `rel`, `href`, `type`, `media`, `sizes`, `crossorigin`, `integrity`, `as`), `Style`, `Base`, `Noscript`

**Enhanced Script**: `src`, `async`, `defer`, `integrity`, `crossorigin`, `nomodule`

**New data elements**: `Time` (with `datetime`), `Data` (with `value`), `Progress` (with `value`/`max`), `Meter` (with `value`/`min`/`max`/`low`/`high`/`optimum`), `Slot` (with `name`)

#### 🔄 Control Flow Improvements

- `ForEach1` - iteration with index
- `ForEach2` - range iteration (0 to n)
- `ForEach3` - range iteration (start to end)
- `Repeat` - repeat content n times

### 🔧 Improvements

- **Zero dependencies** - pure TypeScript
- **Cleaner HTML output** - no unnecessary whitespace
- **Better TypeScript support** - stricter types throughout
- **Smaller bundle size** - optimized render function
- **229 tests** - comprehensive test coverage

### 📦 Migration Guide

1. **Update element syntax:**
   ```typescript
   // Old
   Div({ class: "container", child: P({ child: Text("Hello") }) })
   
   // New
   Div(P("Hello")).setClass("container")
   ```

2. **Update HTMX usage:**
   ```typescript
   // Old
   Button({ htmx: { method: "post", endpoint: "/api" }, child: Text("Submit") })
   
   // New
   Button("Submit").setHtmx(hx("/api", { method: "post" }))
   ```

3. **Update control flow:**
   ```typescript
   // Old
   ForEach(items, item => Li({ child: Text(item) }))
   
   // New
   ForEach(items, item => Li(item))
   ```

4. **Text nodes no longer need `Text()` wrapper:**
   ```typescript
   // Old
   P({ child: Text("Hello") })
   
   // New
   P("Hello")
   ```

### 🐛 Bug Fixes

- Fixed inconsistent attribute ordering
- Fixed whitespace in rendered output
- Fixed boolean attribute rendering

---

## [2.x] - Previous Versions

See [GitHub releases](https://github.com/JT-Digital-d-o-o/fluent-html/-/releases) for previous version history.