# Core Primitives (P4) — Tasks

<!-- hill: downhill -->
### As a developer I want typed form binding so that field names are constrained to my schema and values/errors auto-wire

- [ ] [P0] Implement `Form<T>(state?, build: (f) => View): FormTag` HOF (chainable `.setHtmx()`/`.multipart()`)
- [ ] [P0] Implement `FormState<T> = { values?: Partial<T>; errors?: ErrorBag<T> }` + the `FormBinding<T>` factories `input/textarea/select/hidden(name: keyof T & string)` (value auto-wired from `state.values`)
- [ ] [P0] Implement `f.error(name: keyof T & string)` typed error accessor (reads `state.errors`)
- [ ] [P1] Add `FormTag.multipart()` + `InputTag.setCapture("user"|"environment")`
- [ ] [P1] Route all label/value/error text through escaped paths
- [ ] [P1] Write tests — `keyof T` rejects a typo'd name (tsc fixture), value/error wiring, multipart
- [ ] [P1] Check for bugs in `Form<T>`

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
