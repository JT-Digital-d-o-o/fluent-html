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

- [ ] [P0] Add `behavior("openDialog", { target })` / `behavior("closeDialog", { target })` — call native `<dialog>.showModal()`/`.close()`; ids route through `escapeJs` (P1/D-05)
- [ ] [P1] Widen behavior options — `event?`/`force?` on `toggle`/`toggleClass`, `animateOut?` on `remove`
- [ ] [P1] Fix the behavior-catalog docs (index showed 4/9; htmx.md had none)
- [ ] [P1] Write tests — open/close emit the right `hx-on`, option widening honored
- [ ] [P1] Check for bugs in the dialog behaviors

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
