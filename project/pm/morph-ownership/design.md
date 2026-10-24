# Morph ownership: design

## The lens

The live element tree is the source, the server's render is the view, and the morph is `put`.

| Law | Statement |
|---|---|
| PutGet | After a morph, every server-owned part equals the render |
| GetPut | A morph to the same render changes nothing |
| Complement | A morph leaves every client-owned part alone (Bancilhon and Spyratos' constant complement, 1981) |
| Identity | An element whose key survives the render keeps its object (alignment, as in matching lenses, Barbosa et al. 2010) |

Client ownership is the constant complement: the declared parts are fixed while the element lives.
A `"seeded"` owner would make the complement grow on the reader's first touch; it is parked, and
its laws with it.

## Owners

| Owner | On a morph |
|---|---|
| `"client"` | Never written by a morph |
| undeclared | htmx 4's behavior, unchanged |

## Mechanism

htmx 4.0.0 already has both halves.

- **A whole element:** `.owns("client")` emits `hx-morph-skip`. `morphNode` returns on it before any
  extension hook, so the element's attributes and children are left alone; the node still matches
  and moves.
- **One attribute:** `.owns({ src: "client" })` emits a data attribute naming the parts, and the
  extension returns `false` from `htmx:before:morph:attr` for each named one, on set and on removal.
  Cancelling `value` on an input also skips htmx's `.value` write, which sits in the same branch.
  Everyframe's `htmx-keep-open.js` is this hook for `open` alone.

## What the experiment measured

htmx 4.0.0, 300 random render pairs per law per engine
([research/morph-lens](../../research/morph-lens/README.md)).

| Law | Chromium 149 | Firefox 151 | WebKit 26.5 |
|---|---|---|---|
| PutGet | 300 of 300 | 300 of 300 | 300 of 300 |
| PutGet with a focused control | holds | holds | holds |
| Identity | 1 failure (the wrapper case) | same | same |
| GetPut: value, checked, selected, textarea, scroll, focus | holds | holds | holds |
| GetPut: script attribute, added child, script `src`, `<details>` toggle | fails every case | same | same |
| Complement: scroll | holds | fails 7 of 76 | fails 7 of 76 |
| Complement: focus | holds | fails 1 of 175 | fails 11 of 175 |
| Unkeyed rows, prepend and relabel | typed text in the wrong row every time | same | same |

Form controls, the server changing the declared value after the reader touched the control:

| Control | Unfocused | Focused |
|---|---|---|
| text, textarea | server | reader |
| checkbox | reader | reader |
| select | server | server |

When the server re-sends the same value, the reader's typed value, mark or choice stays and a
`<details>` toggle is reverted.

## Ledger

The suite expects these failures on today's htmx. An entry that starts passing fails the suite, and
each names what reopens the work.

| Expected failure | Seen in an app | Reopens when |
|---|---|---|
| GetPut on undeclared attributes and children | keep-open, library-upload, Cut's media, the landing loops | never: declaring `"client"` is the fix |
| Identity: an id moved out of its wrapper is replaced | no; issue drafted from [repro.mjs](../../research/morph-lens/repro.mjs) | htmx fixes it, or an app hits it |
| Complement: focus and scroll on a move (WebKit, Firefox) | Cut, once: WebKit focus on a moved clip, restored by hand in `cut-timeline.js` ([cut todo](../../../../everyframe-composer/project/pm/active/cut/todo.md), `keysFocus`) | a second app hits it |
| Unkeyed rows hand typed text to the wrong row | no | an app hits it |
| Verb state resets under a swap that covers it | `StudioSelect` relies on it to close its menu after a choice | a swap the menu did not cause closes it while open |
| Form controls: a touched checkbox ignores the server; text keeps the reader's only while focused | no | an app needs `"seeded"` or `"server"` |
