# Morph ownership

## Problem

htmx 4's `outerMorph` is the default swap behind every verb in projects-template (`.nav`, `.tab`,
`.submit`, `.fragment`, the 422 re-render). It decides alone what survives a swap. The lens-law
experiment ([research/morph-lens](../../research/morph-lens/README.md)) measured its rule in three
engines:

- It applies the render exactly: PutGet held in 900 of 900 random cases per engine.
- It erases every attribute and child the render lacks, in 100% of cases: whatever a script, a
  built-in verb (`toggle`, `toggleClass`, `drawer`) or the reader wrote as an attribute (`class`,
  `aria-expanded`, `hidden`, `src`, a `<details>` toggle).
- Form controls resolve a conflict three ways: text and textarea keep the reader's value only while
  focused and typed in, a touched checkbox stays the reader's for good, select lets the server win.
- htmx 4.0.0 replaces an element whose id moves out of its wrapper
  (`<div><div><div id="c">` to a top-level `<div id="c">`), losing its focus and typed text.
- WebKit has no `moveBefore` and drops focus (with no blur event) and scroll on a move; Firefox's
  `moveBefore` keeps focus but loses scroll.
- Rows without keys hand typed text to the wrong row when a row is added and the labels change.

Apps patch this one hook at a time. Everyframe carries a keep-open htmx extension, library-upload's
`src` / `data-held` hook and `hx-morph-skip` on Cut's media and timeline and the run's sound, and an
unpatched case blanks its landing's loops after a same-page `.nav`. Every one of these is a part a
script or the reader owns. The other measured failures have bitten an app once (Cut gives a moved
clip its focus back by hand in WebKit) or never.

## Appetite

Small batch, one to two days. The conformance suite first, since it judges everything after it and
ledgers what this bet leaves out; then client ownership.

## Solution

A script's or the reader's part of an element is declared the client's, and a morph never touches
it.

1. **Conformance suite.** The lens laws as a Playwright and fast-check suite in `test/acceptance`,
   in three engines, against the htmx the template ships. Today's known failures are ledgered as
   expected, each naming what reopens it ([design.md § Ledger](design.md#ledger)), so the suite is
   green on today's htmx and flags an entry that starts passing.
2. **`.owns()`, client only, typed per tag.**
   ```ts
   Video().owns({ src: "client" })        // a script's; no morph touches it
   Details(...).owns({ open: "client" })  // replaces Everyframe's keep-open extension
   Div(...).owns("client")                // the whole element: emits htmx's own hx-morph-skip
   ```
   The owner union is `"client"` alone; `"seeded"` and `"server"` widen it without a break if an
   app needs them.
3. **One small htmx extension, its own asset.** `htmx:before:morph:attr` cancels the set and the
   removal of a declared attribute. A whole element needs no extension: htmx checks `hx-morph-skip`
   before any hook runs. Undeclared parts keep htmx's behavior.

Verb state is unchanged: what `toggle`, `toggleClass` and `drawer` write resets with the render
([decisions](decisions.md)).

The how, the laws and the measured results: [design.md](design.md). Template adoption is
projects-template's own scope:
[morph-ownership](../../../../projects-template/project/pm/morph-ownership/prd.md).

## Rabbit Holes

- **Client means for good.** A client-owned attribute ignores every later render while the element
  lives, so the server cannot reset it. `"seeded"` would fix that, and it is parked: `toggle` fires
  on the morph's own `open` write, so it cannot tell the reader's touch from the server's.
- **`class` is all or nothing.** `.owns({ class: "client" })` freezes the server's classes too.
  Ownership per token is parked with verb state.
- **A textarea's value is not an attribute.** htmx writes it in `morphNode`, outside the attribute
  hook, so the per-tag types offer `value` only where the hook reaches it.
- **The experiment's grammar was small.** Untested: lists past `morphScanLimit` (10), SVG,
  `<template>`, `hx-*` attributes, OOB partials, `hx-preserve`, two morphs in a row.

## No-Gos

- The machine half (client code as typed state machines over browser event protocols) is a separate
  bet, tested first on Cut's timeline drag in everyframe-composer.
- No fork of htmx and no replacement of its morph algorithm. The identity bug is reported upstream,
  not patched.
- No change for apps that declare nothing.
- Parked, each a ledger entry in the suite that names what reopens it: the `"seeded"` and
  `"server"` owners, the move restore, verb state surviving a swap (and the class merge it needs),
  and the eslint rule that keys rows holding `.owns()` or `.behavior()`.
