# Core API / DX (P3) — Tasks

<!-- hill: downhill -->
### As a developer I want boolean attributes to render truthfully via one .toggle() path so that checkboxes/disabled states work

- [x] [P0] Land the boolean render fix in the P1 emitter — `.toggle()` renders bare; the emitter validates toggle names via `BOOLEAN_ATTR_RE` in `buildAttrs` (the A-01 "boolean branch", mirrors `STATUS_KEY_RE`). All boolean `_sk` keys removed ⇒ no API produces a boolean `_sk` value, so `checked="false"` is impossible by construction. See [decisions.md](decisions.md)
- [x] [P0] Removed every named boolean setter (`setChecked`/`setDisabled`/`setReadonly`/`setMultiple`/`setAutofocus`/`setAsync`/`setDefer`/`setNomodule`/`setControls`/`setAutoplay`/`setLoop`/`setMuted`/`setPlaysinline`/`setOpen`/`setSelected`/`setNovalidate`/`setAllowfullscreen`/`setDefault`) + their boolean `_sk` keys across forms/media/document/interactive/embedded — `.toggle()` only
- [x] [P1] Closed `BooleanAttribute` (dropped `(string & {})`; restated as the full 25-attr standard set) so `.toggle("requried")` is a compile error
- [x] [P1] `prefer-set-method` boolean block dropped + new `prefer-toggle` rule (auto-fix static `addAttribute(<bool>,…)` → `.toggle()`, reports dynamic without fix); wired into `recommended`. Plugin suite 222 → 232
- [x] [P1] Tests — forms/elements expected output now bare (`checked` not `checked="true"`); toggle-name injection throws (security.test.ts); closed-union typo `@ts-expect-error`; `.toggle(cond)` on/off. Lib suite 1343 → 1346
- [x] [P1] Check for bugs — tsc clean, full suite green, bench gate (no regression), one shared `buildAttrs` so render≡stream parity holds; README hx-boost example fixed to `hxGet({boost,preload})`

<!-- hill: downhill -->
### As a developer I want typed accessibility setters so that I stop reaching for addAttribute("aria-*")

- [x] [P0] Added `setRole(AriaRole)`/`setTabindex(number)`/`setTitle(string)` (delegate to `addAttribute` → COW + key validation) + rewrote `setAria(AriaAttrs)` — closed `AriaAttributeName` (lowercase single-token, NO kebab so `haspopup` → `aria-haspopup` not `aria-has-popup`), `AriaValue = string|number|boolean` (tristate `"mixed"` is a string), `aria-${string}` escape arm, `validateAttributeKey` on the derived key. Types in `src/core/aria-types.ts`, exported via barrel
- [x] [P1] Extended `prefer-set-method` — `role`/`title` auto-fix (1:1); `aria-*`/`data-*`/`style`/`tabindex` report-only (`preferTypedSetter`, no unsafe fix). Plugin suite 232 → 238
- [x] [P1] Tests — `haspopup`→`aria-haspopup` (the kebab bug, fixed in `test/patterns.ts`), tristate `"mixed"` + number value, role/tabindex/title render, escape-arm verbatim, closed-union `@ts-expect-error`, malicious escape-key rejection (security.test.ts). Lib suite 1346 → 1351
- [x] [P1] Check for bugs — tsc clean, full suite green, lint-clean; escape-arm key runs through `validateAttributeKey` (injection blocked at set time); `undefined` values skipped; `kebabCase` still used by setStyles/setDataAttrs

<!-- hill: downhill -->
### As a developer I want complete, consistently named element setters so that no attribute is silently dead

- [x] [P0] Added the `_sk` tuple form `SchemaKey = string | readonly [prop, attr]` (`proto.ts`) + tuple-aware `buildAttrs` loop (one `typeof` per key, bench-clean). This is the A-03 half of the render-spine deferred emitter item. First real use: `['httpEquiv', 'http-equiv']` and SVG `['svgOpacity', 'opacity']` (decouples the field from the Tailwind `.opacity()` method)
- [x] [P1] Fixed `setHttpEquiv` (typed `HttpEquiv`, tuple → real `http-equiv`); added `setInputmode` (Input/Textarea, `InputMode`), `setHreflang` (Link/Anchor), `setCrossOrigin(CrossOrigin|"")` (widened + `""` for preconnect), SVG `setOpacity`/`setFilter` rerouted through `_sk` (dropped deprecated `setSvgOpacity` + the addAttribute path), `OptionTag.setValue(value?)` now optional
- [x] [P1] Renames — `setCrossorigin`→`setCrossOrigin` (Img/Link/Script), `setReferrerpolicy`→`setReferrerPolicy` (Anchor/Iframe). (The other spec'd renames — setReadonly/setAutofocus/setNovalidate/setAllowfullscreen — were boolean setters already deleted in A-01.) ESLint map updated in lockstep + new `hreflang`/`inputmode`/`http-equiv` entries
- [x] [P1] Tests — `http-equiv` emits the real name (was the `httpEquiv` bug), SVG opacity/filter via `_sk`, inputmode (Input+Textarea), anchor hreflang, bare `crossorigin=""`, `Option().setValue()`, renamed setters. Lib suite 1351 → 1358
- [x] [P1] Check for bugs — tsc clean project-wide, full suite green, bench gate passed; tuple verified through the real renderer (render≡stream via shared `buildAttrs`); attr NAMES are library literals (no injection), values escaped; `""` passes the emit guard intentionally

<!-- hill: downhill -->
### As a developer I want negative transforms and position/display shortcuts so that Tailwind transforms aren't silently dropped

- [x] [P0] Fixed the sign relocation — added `signNeg(prefix, value)` (shared in `class-vocab/types.ts`); `.translate`/`.rotate`/`.skewX`/`.skewY` now emit `-translate-y-1`/`-rotate-45`, not the dropped `translate-y--1`. Widened `TailwindRotate`/`TailwindSkew` with negative literals + added `TailwindTranslate`
- [x] [P1] Added dedicated shortcuts — position `.absolute()`/`.relative()`/`.fixed()`/`.sticky()`/`.static()` + display `.block()`/`.inlineBlock()`/`.inline()`/`.inlineFlex()`/`.inlineGrid()`/`.contents()` + `.flexShorthand("1"|"auto"|"initial"|"none")`. Dropped the `.position(v)`/`.display(v)` passthroughs + `.flex1()`. `.neg()` now has JSDoc
- [x] [P1] Vocab lockstep — removed `position`/`display`/`flex1` rows, added the static shortcuts + `flexShorthand`, made rotate/skew/translate `custom` rows using the shared `signNeg`. Extractor (runtime vocab import) auto-picks-up: 34/34. ESLint vocab regenerated (`gen:vocab` → 124 → 133 methods), drift test in sync
- [x] [P1] Tests — negative transforms (`-rotate-45`/`-translate-y-1`/`-skew-x-6`) + every shortcut emit, via `fluent-styling-v2.ts` + class-vocab explicit cases; lib-parity auto-validates the new rows. Lib suite 1358 → 1376
- [x] [P1] Check for bugs — tsc clean, full suite green, bench gate passed (signNeg is build-time, not render-hot); bracketed arbitrary values pass through signNeg untouched; README + FLUENT-STYLING migrated

<!-- hill: downhill -->
### As a developer I want .overlay() and clean type-only exports so that overlays compose fluently and verbatimModuleSyntax compiles

- [x] [P1] Split the 15 type-only re-exports to `export type` — htmx (11: HTMX/HxSwap/HxSwapStyle/HxTrigger/HxEncoding/HxTarget/HxHttpMethod/HxSync/HxOptions/HxConfig/HxStatusConfig), patterns (3: HtmxGlobalConfig/HxResponseResult/HxLocationConfig), `Id` (1) + `OverlayPosition`. tsc validates the value/type split (a misclassified value would error)
- [x] [P1] Implemented `Tag.prototype.overlay(position?, ...content): Tag` (replaces the `Overlay()` function) — wraps `this` in a `.relative()` container + an `.absolute()` layer with per-position inset/translate classes; `args[0]` is the position iff it's a known position word, else content + `"center"`. Uses `El()` (no elements-import cycle); works on void elements. Side-effect-registered via the control barrel
- [x] [P1] Tests — `test/overlay.ts` rewritten (void `Img()`, position-vs-content disambiguation, all 9 positions, base-styling-preserved); composition test migrated; type-only export compile-lock in `type-safety.ts`. Lib suite 1376 → 1372 (overlay 10→6 focused cases)
- [x] [P1] Check for bugs — tsc clean, suite green, bench + lint clean. **Known limitation (documented in JSDoc):** `.overlay()`'s positioning utilities are render-time, so the extractor's source scan can't safelist them — apps using centered/edge overlays must safelist the ~6 fractional inset/translate classes. Deep auto-safelisting of composition-helper output is a broader extractor concern (follow-up, not A-09)

<!-- hill: downhill -->
### As a developer I want for-else, when-else, Document(), and typed .hxOn() so that common patterns have first-class APIs

- [ ] [P1] Add `ForEachElse(items, renderItem, emptyView)` (separate fn) + `Tag.whenElse(cond|value, then, else)` (mirrors `IfThenElse`, not truthiness)
- [ ] [P1] Add `Document(...children)` (emits `<!DOCTYPE html>`; `DocumentTag extends HtmlTag`) + `Doctype()`; discriminate on the `_doc` brand so `HTML(...)` stays byte-identical
- [ ] [P1] Add `.hxOn(event, js)` (typed `HxOnEvent`, concat with `;`, escaped) + `formResetOnSwap`/`dismissOnEscape` behaviors + fix `escapeJs` (`\n \r  <`)
- [ ] [P1] Realign display/variant teaching to A-07 methods; rename the blocked-event error to name `.behavior()` (preserve the asserted substring)
- [ ] [P1] Write tests — `ForEachElse` empty/non-empty, `whenElse` falsy-not-null, `Document` DOCTYPE, `.hxOn` concat + escaping
- [ ] [P1] Check for bugs in control-flow/Document/hxOn
