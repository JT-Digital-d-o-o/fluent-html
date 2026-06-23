# Core API / DX (P3)

## Problem

The everyday authoring surface has correctness gaps and missing typed paths, so apps fall back to `addAttribute`/`addClass`/raw JS:

- **Boolean attributes lie** (`checked="false"` → checked) and there are many overlapping named boolean setters.
- **Accessibility has no typed setters** — `setRole`/`setTabindex`/`setTitle`/typed `setAria` don't exist, so ~300 sites use `addAttribute("aria-*")`.
- **Element setters are incomplete and inconsistently named** (`setHttpEquiv` emits the dead `httpEquiv`; `setReadonly`/`setCrossorigin` lowercase).
- **Negative Tailwind transforms are broken** (`-translate-y-1` emits the silently-dropped `translate-y--1`).
- **Type-only exports break `verbatimModuleSyntax`** (TS1205); `Overlay()` uses the forbidden `Div([...])` array form.
- **No `ForEach`-else / `when`-else**, no `Document()`/DOCTYPE (40+ apps `Raw("<!DOCTYPE")`), no typed `.hxOn()`.

## Appetite

Large — depends on **P1** (the emitter: A-01 boolean branch + A-03 `_sk` fold in) and **P2** (the vocab: A-07 transforms + A-09 `.overlay()` classes). Mostly additive; the breaking pieces (boolean setters removed, outright renames, `.overlay()` replacing `Overlay()`) are free under greenfield.

## Solution

- **A-01** — boolean render fix in the emitter; `.toggle()` is the only boolean path (named boolean setters **removed**); `BooleanAttribute` closed; `prefer-toggle` lint.
- **A-02** — `setRole`/`setTabindex`/`setTitle`/typed `setAria` (closed `AriaAttributeName`, boolean/tristate values).
- **A-03** — `_sk` tuple form `[prop, attr]`; `setHttpEquiv` fix; `setInputmode`/`setHreflang`/`setCrossOrigin(""|…)`/SVG `setOpacity`/`setFilter`; outright camelCase renames.
- **A-07** — sign-relocation transforms (`.translate/.rotate/.skewX/.skewY` + negatives) + dedicated position/display shortcuts + `.flexShorthand()`; `.neg()` documented.
- **A-09** — split 15 type-only re-exports to `export type`; **`.overlay(position?, …content)`** fluent method (replaces `Overlay()`).
- **A-04** — `ForEachElse` (separate fn) + `Tag.whenElse`.
- **A-06** — `Document()`/`Doctype()` (emits `<!DOCTYPE html>`; `DocumentTag extends HtmlTag`).
- **A-08** — typed `.hxOn(event, js)` + `formResetOnSwap`/`dismissOnEscape` behaviors + the `escapeJs` bug fix (consumed by P1's D-05).
- **A-G2/A-G4** — adoption: extend `prefer-set-method` to flag `addAttribute("aria-*"/"data-*"/"style")`; realign display teaching to A-07 methods; `.behavior()` error-msg rename.

Contracts: [`v6-spec.md`](../../../product/research/v6/40-synthesis/v6-spec.md) §A-01…A-G5.

## Rabbit Holes

- **Outright renames** — no `@deprecated` lowercase aliases.
- **`.overlay()` replaces `Overlay()`** — don't keep the function; works on void elements (`Img().overlay(...)`).
- **Don't keep `.position(value)`/`.display(value)`/`.flex1()`** — dedicated A-07 methods only.

## No-Gos

- No named boolean setters (`setChecked`/`setDisabled`/…) — `.toggle()` only.
- No `Overlay()` function, no `Doctype` array anti-pattern.
- A-05 context teaching (A-G5) ships with the framework (P5), not here.
