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

- [ ] [P1] Add `SvgTag`/`SvgShapeTag` stroke setters — `setStrokeLinecap`/`setStrokeLinejoin`/`setStrokeDasharray`/`setStrokeDashoffset`/`setTransform`/`setStrokeOpacity` (extend each class's `_sk`)
- [ ] [P1] Add typed SVG container tags — `LinearGradient`/`RadialGradient`/`Stop`/`ClipPath`/`Mask`/`Filter`/`FeGaussianBlur`
- [ ] [P1] Add the `no-raw-icon-string` lint (retire the `Raw(icon)` sink)
- [ ] [P1] Write tests — each setter round-trips through `_sk`; container tags render
- [ ] [P1] Check for bugs in SVG coverage

<!-- hill: downhill -->
### As a developer I want .htmxIndicator() so that the loading-indicator class is sanctioned, not a raw string

- [ ] [P1] Add `Tag.prototype.htmxIndicator()` (emits the library-known `htmx-indicator`); whitelist it in `class-vocab` (P2) so the extractor/ESLint accept it
- [ ] [P1] Write a test — `.htmxIndicator()` emits the class; ESLint accepts it (not flagged as unknown)
- [ ] [P1] Check for bugs in `.htmxIndicator()`
