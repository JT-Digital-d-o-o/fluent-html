# Track B — HTML Elements — v6.2.0 Synthesis

Consolidated from 10 discovery lenses (b01–b10). All items re-verified against `src/` at
v6.1.1 and against the CHANGELOG 6.0.0 → 6.1.1 so nothing already shipped in 6.1.x leaks
through. Naming follows the house rule (`set*` overrides, `add*` accumulates; boolean attrs
via `.toggle()`; arbitrary values via unit overloads or `[…]`).

## Theme of the track

Track B is overwhelmingly **gap-filling**: standard, Baseline-widely-available attributes
that already have a typed home on a *sibling* element but force the CLAUDE.md-forbidden
`addAttribute` on the element under review. The pattern (field + `set*` + `defineSchemaKeys`
entry, reusing an existing union) is the same for almost every item, so most are genuine
small quick-wins. Two items are new element factories (Ins/Del), one is a new typed-class
promotion (Template/DSD), and one is a typed builder extension (`Form<T>.multiselect`).

---

## Prioritized table

| # | Proposal | Proposed API | Value | Effort | Why |
|---|----------|--------------|-------|--------|-----|
| 1 | **crossorigin on Video/Audio** | `VideoTag.setCrossOrigin(c?: CrossOrigin \| ''): this`; same on `AudioTag` | high | small | Required for CORS `<track>` captions, untainted-canvas video, Web Audio. Union + exact setter already ship on `ImgTag`; pure copy. Verified absent (media.ts:127-185). |
| 2 | **headers on th/td (Id-typed)** | `addHeaders(...ids: (string\|Id)[]): this` + `setHeaders(...)` on a shared cell mixin → `headers="col-age row-john"` | high | small | The standard a11y mechanism for irregular/multi-level-header tables when `scope` is insufficient. Today only via hand-joined `addAttribute`. Lib already Id-types setId/setFor/setForm/setList. Verified absent (tables.ts:53-72). |
| 3 | **Ins / Del edit elements** | `class InsTag/DelTag extends Tag { setCite(c?); setDatetime(d?) }` + `Ins()/Del()` factories | high | small | The only text-level semantic elements with **no factory at all** in the lib. Carry `cite`+`datetime`. Mirror `TimeTag` (data.ts:6). Verified absent (no Ins/Del in src/). |
| 4 | **IframeTag.setSandbox typed token union** | `type SandboxToken = …13 allow-* tokens…`; `setSandbox(...tokens: SandboxToken[]): this`; `setSandbox()` → `sandbox=""` | high | small | Security-critical fixed enumerated token set currently bare `string` (embedded.ts:14,49). A typo silently breaks isolation. Variadic accumulate, joins with spaces. |
| 5 | **TemplateTag + declarative shadow DOM** | promote `Template` to `class TemplateTag` with `setShadowrootmode("open"\|"closed")` + `.toggle("shadowrootclonable"\|"shadowrootdelegatesfocus"\|"shadowrootserializable")` | high | small | DSD (Baseline 2024-08) is the only zero-JS way an SSR builder ships shadow trees. Today `Template` is a bare `El("template")` (document.ts:236), unreachable without addAttribute. Add the three DSD tokens to `BooleanAttribute`. |
| 6 | **SourceTag width/height (CLS)** | `SourceTag.setWidth(w?: string\|number): this`; `setHeight(...)` → `<source width height>` | medium | small | `<source>` in `<picture>` reserves aspect-ratio box → kills layout shift on art-directed swaps. Only sized media element missing them (media.ts:88-121). *Merged b04+b05* (use `string\|number`→String, matching the mixed Img(string)/Video(number) reality). |
| 7 | **referrerpolicy gap fill (Img, Source, Link, Script, Area)** | `setReferrerPolicy(p?: ReferrerPolicy): this` on each | medium | small | `ReferrerPolicy` union + setter already ship on Anchor/Iframe; these five are the standard-attribute holdouts. Privacy/Referer control on resource fetches. *Merged b04+b05+b08.* |
| 8 | **ScriptTag.setNonce** | `setNonce(nonce?: string): this` → `nonce="..."` | medium | small | The CSP `script-src 'nonce-…'` hook for inline `<script>` under strict CSP. Plain-HTML surface (nonce *generation* stays in the framework layer). Verified absent (document.ts:240,274). |
| 9 | **LinkTag.setImagesrcset / setImagesizes** | `setImagesrcset(s?): this`; `setImagesizes(s?): this` | medium | small | The only standard way to preload a responsive LCP image (`<link rel=preload as=image>`). `setSizes` is the unrelated icon-sizes grammar. Verified absent from LinkTag schema (document.ts:184). |
| 10 | **ButtonTag.setFormtarget / setFormenctype** | `setFormtarget(t?: BrowsingContext): this`; `setFormenctype(e?: FormEnctype): this` (+ extract `FormEnctype` union) | medium | small | Button already has formaction/formmethod; formtarget/formenctype are the asymmetric gap vs `<form>`'s setTarget/setEnctype (forms.ts:217-321). Extract the enctype union from FormTag. |
| 11 | **SelectTag.setAutocomplete** | `setAutocomplete(a?: AutocompleteHint): this` | medium | small | `<select>` is autofill-eligible; Input/Textarea already use the shipped `AutocompleteHint`. Select is the odd-one-out (forms.ts:449). Reuses existing union. |
| 12 | **setDirname on Input + Textarea** | `setDirname(d?: string): this` on both | medium | small | The standard bidi/RTL form mechanism (submits text directionality under a companion field). Free-text field name, mirrors setName. Verified absent (forms.ts). |
| 13 | **setCite on Q + Blockquote** | promote both to `QTag/BlockquoteTag` with `setCite(c?: string): this` | medium | small | Both are bare `El()` today (inline.ts:53, text.ts:37); `cite` only via addAttribute. Same promotion shape as #3. |
| 14 | **setAbbr on ThTag** | `setAbbr(abbr: string): this` → `abbr="…"` | medium | small | Short header label AT announces instead of long visible text. th-only. Verified absent (tables.ts:26-47). |
| 15 | **setPart / addPart / setExportparts (global)** | `Tag.setPart(...names): this`; `addPart(name)`; `setExportparts(...maps)` | medium | small | The only standards-track way to theme inside a shadow tree (`::part()`). Pairs with #5 DSD. Aligns with "ship primitives" stance. *Merged b09+b10.* |
| 16 | **setSlot (global)** | `Tag.setSlot(name?): this` → `slot="header"` | medium | small | Assigns a light-DOM child into a named slot; distinct from `SlotTag.setName`. Completes the web-components surface. *Merged b09+b10.* |
| 17 | **setDraggable (enumerated)** | `setDraggable(v: boolean\|'true'\|'false'\|'auto' = true): this` | medium | small | Enumerated (not boolean) so deliberately excluded from `.toggle()`; real gap for DnD/kanban. boolean→"true"/"false". |
| 18 | **MetaTag.setMedia** | `setMedia(media?: string): this` | low | small | Per-color-scheme `theme-color` (`<meta media="(prefers-color-scheme: dark)">`). Mirrors Link/Style setMedia. Bundle into #9's PR. |
| 19 | **OutputTag.setFor accepts multiple ids** | `setFor(...forIds: (string\|Id)[]): this` → joins with space | low | small | `<output for>` is a space-separated id set. Single-arg calls stay byte-identical (back-compatible widening). |
| 20 | **Typed accept token union (file inputs)** | `type AcceptToken = 'image/*'\|…\|`.${string}`\|`${string}/${string}``; `setAccept(a?: AcceptToken)` + list overload | low | small | Bare string lets `'image'`/`'jpg'` through silently (forms.ts:20). Open union w/ wildcard autocomplete + `.ext` arm. |
| 21 | **ImgTag.setUseMap + AreaTag ping** | `ImgTag.setUseMap(usemap?): this`; `AreaTag.setPing(ping?): this` (referrerpolicy folded into #7) | low | small | Completes client-side image-map wiring; Area is itself a hyperlink missing anchor's ping. Niche. |
| 22 | **popover="hint" union member** | widen `PopoverState = "auto"\|"manual"\|"hint"` (setPopover signature unchanged) | medium | small | Native tooltip/hovercard primitive; cross-engine as of 2026 (FF149 + Chrome + Safari). Closed union currently a compile error with no escape hatch. *See also forward-looking #FW1.* |

---

## Bigger bets

| Proposal | Proposed API | Value | Effort | Why |
|----------|--------------|-------|--------|-----|
| **Form<T>.multiselect** | `FormBinding<T>.multiselect(name: keyof T & string, options: readonly SelectOption[]): SelectTag` → `<select multiple>`, pre-selects every option whose value ∈ the bound array; reuses `markInvalid` | medium | medium | The one constraint control the typed builder can't represent; callers drop to hand-built `Option().toggle('selected')` loops, losing `keyof T` name typing + the 6.1.1 aria error wiring (forms.ts:396-404). Needs an array-membership path, not just `String(===)`. |
| **Structured autocomplete detail tokens** | `type AutofillField = 'cc-number'\|'given-name'\|'address-line1'\|…`; `AutocompleteHint = 'on'\|'off'\|AutofillField\|`shipping ${AutofillField}`\|`billing ${AutofillField}`\|`${AutofillField} webauthn`\|(string&{})` | medium | small–medium | Type-only widening of the existing `AutocompleteHint` (html-types.ts:20). Big checkout/address/login autofill payoff; typos in known tokens silently break autofill today. No emitter change. Effort bumped for getting the canonical token set + template-literal grammar right. |
| **IframeTag.setAllow directive-record overload** | `type PermissionsPolicyDirective = 'camera'\|'microphone'\|'geolocation'\|…\|(string&{})`; `setAllow(policy: Partial<Record<PermissionsPolicyDirective,string>>): this` (keep `setAllow(string)` raw) | medium | medium | Directive *names* are enumerable even though the value grammar is freeform (embedded.ts:12,39). Serializes `{camera:'self'}` → `"camera self; …"`. Overload, not a break. |

---

## Cut / deferred (non-Baseline or already shipped)

**Forward-looking / non-Baseline — defer or ship explicitly documented as progressive enhancement:**

- **`setInterestfor` (Interest Invokers)** — the hover/focus trigger half that pairs with
  `popover="hint"`. Experimental: Chrome behind flag, WebKit opposed to the touch-tooltip
  case. Not Baseline. (b01) → revisit when it lands; pairs with #22.
- **`setBlocking("render")`** on Link/Script — standards-track critical-CSS ordering, but
  Firefox doesn't support `blocking` yet (Chrome 105 / Safari 17.6 only). Limited Baseline. (b08) → defer.
- **iframe `credentialless`** — add the token to `BooleanAttribute` is the minimal surface,
  but Chromium-only (no Firefox/Safari). Not Baseline. (b05) → defer.
- **`setIs` (customized built-ins)** — WebKit/Safari has declined to implement customized
  built-ins. Not Baseline. (b09/b10) → low value, defer.

**Already in lib (do not re-propose):**

- `referrerpolicy` on **Iframe / Anchor / Link / Script** — wait: Iframe & Anchor already
  ship it (embedded.ts:59, links.ts:52); **Link & Script do NOT** (verified document.ts:184,274) —
  so #7 above is only the *holdout* elements. The IframeTag.referrerpolicy retype to the
  closed union already shipped in 6.1.1.
- `setFetchPriority` on Img/Link/Script/Iframe — shipped 6.1.0.
- `setCrossOrigin` on Img/Link — shipped; the proposal is to extend it to **Video/Audio** (#1).
- Popover API (`setPopover`/`setPopovertarget`/`setPopovertargetaction`), invoker Commands
  (`setCommand`/`setCommandfor`), native dialog `setClosedby` + `formmethod="dialog"`,
  CSS anchor positioning (`anchorName`/`positionAnchor`/`positionArea`/`viewTransitionName`),
  `setMicrodata`, `setContenteditable`/`setEnterkeyhint`/`setSpellcheck`/`setAutocapitalize`/
  `setLang`/`setDir`/`setTranslate`, `setHidden("until-found")`, `setForm`/`setList`/`setFor`
  by `Id`, `Form<T>` typed builder (input/textarea/select/hidden/checkbox/radio/error),
  `ForEachKeyed`, `addChild`/`addStyle`, relational state hooks — **all shipped 6.0–6.1.1.**

---

## Merge log

| Merged-away | Into | Reason |
|-------------|------|--------|
| b05 SourceTag width/height (`string`) | #6 (b04, `string\|number`) | Same attr; pick the `string\|number`→String signature consistent with `SvgTag.setWidth`. |
| b04/b05/b08 referrerpolicy (Img, Source, Area, Link, Script) | #7 | One union, one family; emit one PR. |
| b09 setPart/setExportparts | #15 (b10, fuller: adds `addPart`) | Same attrs; b10 has the accumulate counterpart. |
| b09 setSlot | #16 (b10) | Identical global setter. |
| b09 setIs / b10 setIs | Cut list | Identical; both flag non-Baseline. |
| b05 ImgTag.setUseMap + Area referrerpolicy/ping | #21 (usemap+ping) + #7 (Area referrerpolicy) | Split: referrerpolicy joins the family, usemap+ping stays a niche pair. |

**Dropped duplicates: 6.**
