# Core Primitives (P4)

## Problem

A handful of Track-B patterns genuinely **need library support** (type machinery, native elements, render-known classes) but are reimplemented per app today — typed form binding (`FormGroup` in 8 apps), modal show/hide JS-strings (5+ apps), 170+ raw `<svg>` icon calls via `Raw(string)` (an injection sink), and `htmx-indicator` applied via raw `.setClass`. Per the instruction-set decision, only these primitives stay in core; the opinionated component shells around them are cut to `@jtdigital/ui`.

## Appetite

Medium — depends on **P3** (`_sk` coverage for SVG + form inputs) and **P1** (`escapeJs` for behaviors). Smaller than P1–P3: most of Track B is cut, so this is the thin set of keepers.

## Solution

- **B-01** — `Form<T>(state?, build: (f) => View): FormTag` HOF; `FormState<T> = { values?, errors? }`; `f.input/textarea/select/hidden(name: keyof T)` + `f.error(name)`; `.multipart()`/`.setCapture()`.
- **B-02** — `behavior("openDialog"/"closeDialog")` (call native `<dialog>.showModal()`/`.close()`); behavior-option widening (`event?`/`force?`/`animateOut?`); fix the behavior-catalog docs.
- **B-05** — full SVG coverage: `SvgTag`/`SvgShapeTag` stroke setters + typed SVG container tags (`LinearGradient`/`RadialGradient`/`Stop`/`ClipPath`/`Mask`/`Filter`/`FeGaussianBlur`) — makes a user `Icon` trivial + View-based.
- **B-04** — `.htmxIndicator()` (emits the library-known `htmx-indicator`; Track-C whitelists).
- **B-03** — `.gradient()` lands in **P2/C-03** (v4-native), not here.

Contracts: [`v6-spec.md`](../../../product/research/v6/40-synthesis/v6-spec.md) §B-01…B-05.

## Rabbit Holes

- **Cut the component shells** — `Field`/`FieldError`/`FieldHint`, `Modal`/`Drawer`/`ToastContainer`, `Alert`/`Badge`/`Card`/…, `Icon` + icon set, `Table.of` data-grid, `SeoHead` → `@jtdigital/ui` (P6).
- **`.gradient()` is C-03**, not a P4 story.
- **No `Raw(icon)`** — SVG element coverage replaces the string-icon sink.

## No-Gos

- No opinionated component shells in core.
- No `formFor` name (the HOF `Form<T>(state, f => …)` is the binding), no `FormErrors`, no `resetOnSuccess` (→ `outerHTML`-swap guideline).
- No bundled icon set in core (opinionated content + license → `@jtdigital/ui`).
