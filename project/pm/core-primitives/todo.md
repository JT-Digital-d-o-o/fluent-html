# Core Primitives (P4) — Tasks

<!-- hill: downhill -->
### As a developer I want typed form binding so that field names are constrained to my schema and values/errors auto-wire

- [x] [P0] Implemented `Form<T>` as overloads of the existing `Form` (in `elements/forms.ts`): `Form<T>(build)` / `Form<T>(state, build)` (typed binding) + `Form(...children)` (plain element factory, kept). HOF detected by `typeof args[0]/args[1] === "function"`; returns a chainable `FormTag`. Deleted the old `formFor` (`src/form.ts`)
- [x] [P0] `FormState<T> = { values?; errors? }` + `ErrorBag<T>` + `FormBinding<T>` factories `input/textarea/select/hidden(name: keyof T & string)` — values auto-wire (input→`value`, textarea→text content, select→marks the matching option `selected` via `.toggle("selected")`). `select` takes a `SelectOption[]` descriptor so it can build + wire the options
- [x] [P0] `f.error(name: keyof T & string)` — unstyled `<span>message` from `state.errors`, or `Empty()` (the styled FieldError shell stays cut to @jtdigital/ui)
- [x] [P1] `FormTag.multipart()` (sets `enctype=multipart/form-data`) + `InputTag.setCapture("user"|"environment")` (field + `_sk` + setter)
- [x] [P1] Escaped paths — values via `setValue` (attr→escapeAttr), textarea/error via text content (escapeHtml). Locked by a test rendering `"><script>` / `<b>x</b>`
- [x] [P1] Tests — `keyof T` typo `@ts-expect-error`, value/error/select-selected/textarea wiring, escaping, multipart, setCapture, plain element-factory still works. Lib suite 1393 → 1400
- [x] [P1] Check for bugs — tsc clean, full suite green, bench gate passes (clean run); CLAUDE.md `formFor` section retaught as `Form<T>`

<!-- hill: downhill -->
### As a developer I want native dialog behaviors so that modals get free backdrop/Esc/focus-trap without hand-rolled JS

- [x] [P0] Added `behavior("openDialog"/"closeDialog", { target })` — emit native `<dialog>.showModal()`/`.close()`; the id routes through `el()`→`escapeJs` (P1/D-05)
- [x] [P1] Widened behavior options — `event?` on `toggle`/`toggleClass`/`remove` (default `"click"`, via the new `ev()` helper), `force?` on `toggle`/`toggleClass` (→ `classList.toggle(cls, force)`), `animateOut?` on `remove` (add class + remove on `transitionend`). The user-supplied event is validated in the `behavior` impl (`HX_ON_EVENT_RE`, shared with `.hxOn()`) — attribute-name injection guard
- [x] [P1] Fixed the behavior-catalog docs — CLAUDE.md now lists all 13 (+ option widening + `.hxOn()` pointer); README adds open/close + widening examples; added a full **Client-side behaviors** table to `guidelines/web-development/htmx.md` (had none)
- [x] [P1] Tests — open/close emit `showModal()`/`close()`, `event?`/`force?`/`animateOut?` honored, injected event throws. Lib suite 1400 → 1406
- [x] [P1] Check for bugs — tsc clean, full suite green, bench gate passes, lint clean; `el()` escapes the target id, event names validated

<!-- hill: downhill -->
### As a developer I want complete SVG coverage so that icons are typed Views, not Raw(string) injection

- [x] [P1] Added the missing `SvgShapeTag` stroke setters — `setStrokeDashoffset`/`setStrokeOpacity` (the linecap/linejoin/dasharray/transform setters already existed); both via kebab `_sk` fields (`stroke-dashoffset`/`stroke-opacity`, no collision so no tuple needed)
- [x] [P1] Added the typed SVG container tags — `LinearGradient`/`RadialGradient` (+`Stop`), `ClipPath`, `Mask`, `Filter` (+`FeGaussianBlur`), each a `Tag` subclass with typed setters + `_sk` + factory, exported through the barrel (factory functions, matching the existing SVG convention)
- [x] [P1] Added `no-raw-icon-string` ESLint rule (`recommended: warn`) — flags `Raw("<svg…>")` (string + template-literal args), points to the typed builders. Plugin suite 238 → 243
- [x] [P1] Tests — `setStrokeDashoffset`/`setStrokeOpacity` round-trip; LinearGradient+Stop, RadialGradient, ClipPath/Mask, Filter+FeGaussianBlur render; rule valid/invalid. Lib suite 1406 → 1411
- [x] [P1] Check for bugs — tsc clean (incl. the reserved-word `in` field on FeGaussianBlur), full suite green, bench gate passes, lint clean; README SVG section updated with the new setters + a gradient example

<!-- hill: downhill -->
### As a developer I want .htmxIndicator() so that the loading-indicator class is sanctioned, not a raw string

- [x] [P1] Added `Tag.prototype.htmxIndicator()` (in `htmx-methods.ts`) → `addClass("htmx-indicator")`; registered as a `stat("htmxIndicator","htmx-indicator")` class-vocab row, so the extractor (runtime import) + ESLint (regenerated vocab, 133 → 134 methods) accept the class
- [x] [P1] Tests — render emits `class="htmx-indicator"` (htmx.test) + composes with other utilities; class-vocab explicit case + lib-parity auto-validate; ESLint drift test in sync confirms recognition; extractor 34/34. Lib suite 1411 → 1414
- [x] [P1] Check for bugs — tsc clean, full suite green, bench gate passes, lint clean; htmx.md guideline gains a Loading-indicators note
