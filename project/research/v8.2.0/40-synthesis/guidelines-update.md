# Guidelines update

The patch against `guidelines/web-development/**` and the diverged `fluent-html/CLAUDE.md`. **Net delta: -25 lines** (§5.12 requires negative).

| Change | Δ lines |
|---|---|
| C-67 | 0 |
| RFC-A-01 | 0 |
| RFC-A-03 | -4 |
| RFC-A-05 | -1 |
| RFC-A-06 | 0 |
| RFC-A-07 | 0 |
| RFC-A-08 | 0 |
| RFC-B-01 | 0 |
| RFC-C-01 | -2 |
| RFC-C-04 | 0 |
| RFC-D-01 | -4 |
| RFC-A-04 | 0 |
| RFC-A-09 | -5 |
| RFC-B-02 | 0 |
| RFC-B-03 | -2 |
| RFC-E-01 | 0 |
| RFC-E-02 | 0 |
| RFC-E-04 | 0 |
| RFC-E-07 | -5 |
| RFC-E-08 | 0 |
| RFC-B-04 | 0 |
| RFC-C-02 | -1 |
| RFC-C-03 | 0 |
| RFC-A-02 | 0 |
| RFC-D-02 | -1 |

## C-67: setClosedby("any") teaching pairs it with onClickOutside for Safari 27, which ships no closedby

### 1. guidelines/web-development/htmx.md:591

Current (verbatim, checked 2026-10-01):
```
**Dialog dismiss** — `.setClosedby("any")` for native light-dismiss (click-outside + Esc), and `formmethod="dialog"` to close on submit — never hand-roll backdrop/Esc JS:
```
Replacement:
```
**Dialog dismiss**: `.setClosedby("any")` light-dismisses (click-outside + Esc) on Chromium and Firefox. Safari 27 has no `closedby` and ignores a backdrop click, so put the content and its styling in an inner panel whose `onClickOutside` clicks a `setCommand("close")` button (padding on the `Dialog` itself counts as outside). `formmethod="dialog"` closes on submit. Never hand-roll backdrop/Esc JS:
```

### 2. guidelines/web-development/htmx.md:593-594

Current (verbatim):
```
Dialog(form, Button("Cancel").setType("submit").setFormmethod("dialog"))
  .setId(ids.dialog).setClosedby("any")              // ✓ <dialog closedby="any">
```
Replacement:
```
Dialog(Div(form, Button("Close").setCommand("close").setCommandfor(ids.dialog).setId(ids.dialogClose)).p("6")
  .behavior("onClickOutside", { action: "click", target: ids.dialogClose })).setId(ids.dialog).setClosedby("any")  // ✓ closes on Safari too
```
Line 592 (the typescript fence) and line 595 (the ✗ `addAttribute("closedby", "any")` line) stay. The submit-and-close `formmethod="dialog"` example stays in both CLAUDE.md blocks. Net 0.

### 3. guidelines/web-development/CLAUDE.md:337

Current (verbatim):
```
Dialog(...).setId(ids.dialog).setClosedby("any")                     // ✓ native dialog light-dismiss (click-outside + Esc)
```
Replacement:
```
Dialog(Div(...).behavior("onClickOutside", { action: "click", target: ids.dialogClose })).setId(ids.dialog).setClosedby("any")  // ✓ light-dismiss; the panel's onClickOutside clicks a setCommand("close") button for Safari 27 (no closedby)
```
Net 0.

### 4. fluent-html/CLAUDE.md:314 (diverged copy)

Current (verbatim, identical to hunk 3):
```
Dialog(...).setId(ids.dialog).setClosedby("any")                     // ✓ native dialog light-dismiss (click-outside + Esc)
```
Replacement: the same line as hunk 3. Net 0.

projects-template's vendored copies follow through `npm run guidelines:pull`. Net guideline lines: 0.

## RFC-A-03: Executed htmx-bundle oracle in lib CI (rule-enumerated surface, byte-backed claims, a ratchet that names its mark, pin + template-served bundle); correct the records name-grep produced

Line numbers are today's. CURRENT blocks are quoted verbatim (their em dashes included, so the patch applies); replacements add none. RFC-D-02 edits the same two files (htmx.md `:346`, `:389`, `:391`; fluent-html/CLAUDE.md `:274`), so apply by text match.

**1. `guidelines/web-development/htmx.md:276-278`** (net -2)

CURRENT:
```
Emits `<template hx type="partial" hx-target=… hx-swap=…>`, the shape htmx 4 scans for. Before
8.0.0 it emitted `<hx-partial>`, which htmx never processed — partial swaps were inert. Apps on a
pre-8.0.0 pin still ship the dead shape.
```
REPLACEMENT:
```
Emits `<template hx type="partial" hx-target=… hx-swap=…>`, the shape htmx 4 scans for.
```

**2. `guidelines/web-development/htmx.md:282`** (0; in-line substring)

CURRENT substring:
```
(4.0.0-beta4 briefly dropped that fallback; the release restored it, and the template pins it against the vendored bundle in `tests/unit/htmx-grammar-contract.test.ts`.)
```
REPLACEMENT:
```
(4.0.0-beta4 briefly dropped that fallback; the release restored it, and fluent-html's grammar oracle pins it in row `record/form enctype fallback`.)
```

**3. `guidelines/web-development/htmx.md:412`** (0)

CURRENT:
```
One-off `sync`/`delay` beyond these args: drop to `setHtmx`. (`preload`/`optimistic` are gone from fluent-html 7.2.0 — neither exists in the htmx 4 runtime, so they no longer compile.)
```
REPLACEMENT:
```
One-off `sync`/`delay` beyond these args: drop to `setHtmx`.
```

**4. `guidelines/web-development/htmx.md:499`** (net -1)

CURRENT (delete the line):
```
    extensions: "sse, preload",
```

**5. `fluent-html/CLAUDE.md:272`** (0)

CURRENT:
```
- **File uploads: pass `{ encoding: "multipart/form-data" }` in the route options AND `.setEnctype(...)`** — htmx 4 sends FormData only with `hx-encoding` (no longer falls back to the form's `enctype`); `.setEnctype()` alone → urlencoded → 406 "the request is not multipart". See [htmx.md § File uploads](.ai/web-development/htmx.md#file-uploads-multipart).
```
REPLACEMENT:
```
- **File uploads: pass `{ encoding: "multipart/form-data" }` in the route options AND `.setEnctype(...)`**: htmx 4 sends FormData for `hx-encoding`, and from 4.0.0-beta6 on also for the form's own `enctype` (4.0.0-alpha7 and -beta4 ignore `enctype` and send urlencoded). See [htmx.md § File uploads](.ai/web-development/htmx.md#file-uploads-multipart).
```

**6. `fluent-html/CLAUDE.md:276`** (net -1)

CURRENT (delete the line):
```
- **Nothing may be built on `preload` / `optimistic`** — fluent-html types both and emits `hx-preload`; neither attribute exists in the htmx 4.0.0-beta4 runtime.
```

Not present in `guidelines/web-development/CLAUDE.md` (its `:271` already states the 4.0.0 fallback; no preload bullet). Net: -4.

## RFC-A-05: One URL sanitizer with two policies for every URL value fluent hands to htmx (htmx sinks block every data: URL); js:/javascript: in confirm and vals throws in dev and renders as text in production

CURRENT block quoted verbatim (its em dash included, so the patch applies).

**1. `guidelines/web-development/fluent-html.md:511`** (net -1)

CURRENT (delete the line; false on 8.1.0 already: `setCite`/`setHref`/`setSrc` with `javascript:` emit `about:blank`):
```
- `cite` is a URL — HTML-escaped on render but **not** scheme-sanitized (same stance as `setHref`/`setSrc`).
```

Not present in `fluent-html/CLAUDE.md` (grep `scheme-sanitized`: 0). Net: -1.

## RFC-A-07: Form<T>: valued checkboxes bind by membership and a group gets per-value ids; dev throw on any Form() argument mix that drops arguments

### Hunk 1 of 1: `guidelines/web-development/fluent-html.md:132` (whole line, net 0 lines)

Current line, quoted verbatim including the em dash this hunk removes:

```
**Checkbox/radio** — use `f.checkbox(name, value?)` / `f.radio(name, value)`, never `f.input(name, "checkbox")`:
```

Replacement:

```
**Checkbox/radio**: `f.checkbox(name)` for a boolean, `f.checkbox(name, value)` per group option (8.1.1+: checked when the field is or includes `value`), `f.radio(name, value)`; never `f.input(name, "checkbox")`:
```

The code block under it (`:133-137`) is unchanged. `fluent-html/CLAUDE.md` has no checkbox line, so it takes no hunk. The stale pulled copy `fluent-html/.ai/web-development/fluent-html.md:132` carries the same current text and refreshes through `guidelines:pull`. Publish only after fluent-html 8.1.1 is tagged (V-RFC-A-07-combined #2).

## RFC-B-01: Swap verbs name the route-callable fix and the verb's stance for a raw route; dev throw on a request-less HTMX bag

### Hunk 1 of 1: `guidelines/web-development/CLAUDE.md:265` and `fluent-html/CLAUDE.md:265`

Same substring in both files, verified present today; net 0 lines in each (V-RFC-B-01-agent-fitness #4).

Current (substring):

```
**`.resolve(query?)`** / route callables (`route({ query })`) for redirects & links,
```

Replacement:

```
**`.resolve(query?)`** for redirects and hrefs; swap verbs take the called route (`route({ query })`),
```

Resulting `guidelines/web-development/CLAUDE.md:265`:

```
- **`.resolve(query?)`** for redirects and hrefs; swap verbs take the called route (`route({ query })`), **`hx(url, { query })`** for ad-hoc URLs (`query` ≠ `vals`, which is the request body; escapes: `externalUrl()`/`assetUrl()`) <!-- enforced: type ResolvedRoute -->
```

In `fluent-html/CLAUDE.md:265` the rest of the line after the substring is unchanged. This hunk keeps the clause `; escapes: `externalUrl()`/`assetUrl()`` verbatim, so RFC-B-03's deletion of that clause applies before or after it. `projects-template/CLAUDE.md:265` carries the guidelines text and follows through `guidelines:pull`. Publish with the template release that ships the reworded verbs: from then on "for redirects & links" contradicts the error's "not ... .resolve()".

## RFC-C-01: no-tailwind-in-raw-class: an oracle-swept fix contract (every autofix type-checks and renders its class); no-method utilities get a .cssProp redirect

### 1. `guidelines/web-development/fluent-html.md:233` (in place, 0 net lines)

Current (verbatim):
````
Key method categories — method name = Tailwind class prefix; merged prefixes discriminate by argument (`.text("lg")` / `.text("primary")` / `.text("center")`). The full method census lives in the package README (top-50 methods + 10 patterns); REFERENCE.md carries the complete list. 8.0.0 pruned 38 zero-use methods (masks, 3D transforms, `snap*`/`scrollM`, `backdrop*` except `backdropBlur`, `placeContent`/`placeItems`/`placeSelf`, `breakBefore`/`breakAfter`, `isolation`, `hyphens`, `scheme`, `fieldSizing`) — the successors are `.variant()` / `.cssProp()`.
````
Replacement (the final sentence is deleted; the rest of the line is unchanged):
````
Key method categories — method name = Tailwind class prefix; merged prefixes discriminate by argument (`.text("lg")` / `.text("primary")` / `.text("center")`). The full method census lives in the package README (top-50 methods + 10 patterns); REFERENCE.md carries the complete list.
````

### 2. `fluent-html/README.md:268-271` (lib docs, net -2)

Current (verbatim):
````
from the package root, and ~38 zero-use methods were deleted (`hxPut`/`hxPatch`/`hxDelete`,
backdrop filters except `backdropBlur`, masks, 3D transforms, snap/scroll-margin,
place/break/isolation/hyphens/scheme/field-sizing families) — their CSS stays reachable via
`.cssProp()`/`.variant()`. See [CHANGELOG.md](CHANGELOG.md) for migration notes.
````
Replacement:
````
from the package root, and ~38 zero-use methods were deleted (`hxPut`/`hxPatch`/`hxDelete` and 35
styling methods). See [CHANGELOG.md](CHANGELOG.md) for migration notes.
````

### 3. `fluent-html/CLAUDE.md`
No hunk: the pruned-38 sentence is not in the diverged copy (`grep "8.0.0 pruned"`: 0 hits). `guidelines/web-development/fluent-html.md:46` ("`no-tailwind-in-raw-class` autofixes to the fluent chain") stays and becomes true.

## RFC-C-04: Retire @jtdigital/ui: delete packages/ui, keep src/shared/ui as the one component layer, move selectStyle into it, and fail CI on a workspace package that emits classes or dynamic styling calls

### 1. `guidelines/web-development/CLAUDE.md:231` (in place, 0 net)
Current text (verbatim fragment of the line):
````
never hand-maintain theme objects, per-app `inputStyle`, or `@theme` CSS.
````
Replacement:
````
never hand-maintain theme objects or `@theme` CSS.
````

### 2. `fluent-html/CLAUDE.md:235` (in place, 0 net)
Current text (verbatim fragment of the line, identical to hunk 1):
````
never hand-maintain theme objects, per-app `inputStyle`, or `@theme` CSS.
````
Replacement:
````
never hand-maintain theme objects or `@theme` CSS.
````

No guideline line names `@jtdigital/ui` (git grep at `95067fa`: 0 hits), so nothing else changes. The line's bold spans hold no never/always/must, so the guideline-enforcement tag test is unaffected.

## RFC-D-01: Dynamic-arg tool messages stop prescribing staticManifest and print a fix that clears the error, per argument shape

Apply by quoted content: other slices also edit these two CLAUDE.md files, so line numbers can shift.

### 1. `guidelines/web-development/CLAUDE.md:72` (delete, -1)
Current (verbatim):
````
- **Literal args into typed styling methods** — a variable-driven token belongs in `defineTheme()`'s `staticManifest`. <!-- enforced: lint fluent-html/no-dynamic-typed-styling-arg -->
````
Replacement: delete the line.

### 2. `fluent-html/CLAUDE.md:72` (delete, -1)
Current (verbatim):
````
- **No dynamic class interpolation** — prefer literal fluent calls; when a token must come from a variable, put it in `defineTheme()`'s `staticManifest` so the extractor still emits it.
````
Replacement: delete the line.

### 3. `guidelines/web-development/fluent-html.md:349` (delete, -1)
Current (verbatim):
````
- `onUnresolved: "error"` (default) — a fluent call with a non-literal arg (`.bg(c)`) fails the build (a dropped class is an unstyled element with no other warning). Cover variable-driven tokens via `defineTheme`'s `staticManifest`.
````
Replacement: delete the line (`:337` already shows `onUnresolved: "error"` in the wiring snippet).

### 4. `fluent-html/CLAUDE.md:157` (delete, -1)
Current (verbatim):
````
// a MatchValue result assigns into .bg()/.border() only if every value is a real theme token
````
Replacement: delete the line.

### 5. `guidelines/web-development/CLAUDE.md:155` and `fluent-html/CLAUDE.md:156` (in place, 0 net)
Current (verbatim, identical in both):
````
state === "ok" ? "success" : "text-faint"                // ✗ value lookup as ternary → MatchValue
````
Replacement:
````
state === "ok" ? "Saved" : "Draft"                       // ✗ value lookup as ternary → MatchValue (a styling token branches: .whenMatch)
````

### 6. `guidelines/web-development/CLAUDE.md:191` and `fluent-html/CLAUDE.md:193` (in place, 0 net)
Current (verbatim, identical in both):
````
- Runtime-computed style value → `.setStyle(...)` (extractor-opaque, dynamic-safe)
````
Replacement:
````
- Runtime-computed style value → `.addStyle(...)` (accumulates, extractor-opaque, dynamic-safe)
````

### 7. `guidelines/web-development/CLAUDE.md:229` and `fluent-html/CLAUDE.md:233` (in place, 0 net)
Current (verbatim, identical in both):
````
Keys = the canonical style names; `true` for no-arg utilities (`truncate: true`), `undefined`/`false` skipped (`bg: cond ? "primary-700" : undefined`), tuples for multi-arg (`border: ["top", "line-strong"]`). Tier-1: `hover focus focusVisible focusWithin active disabled checked dark first last odd even groupHover peerChecked before after sm md lg xl xl2` (`xl2` → `2xl:`). Everything else: `.variant("data-[state=open]", {…})`, `.variant("@sm", {…})`.
````
Replacement:
````
Keys = the canonical style names; `true` for no-arg utilities (`truncate: true`), `undefined`/`false` skipped (a conditional key branches the call: `.when(cond, t => t.hover({ bg: "primary-700" }))`), tuples for multi-arg (`border: ["top", "line-strong"]`). Tier-1: `hover focus focusVisible focusWithin active disabled checked dark first last odd even groupHover peerChecked before after sm md lg xl xl2` (`xl2` → `2xl:`). Everything else: `.variant("data-[state=open]", {…})`, `.variant("@sm", {…})`.
````

Net: -4 lines (hunks 1-4); hunks 5-7 are 0 net. projects-template re-vendors the same edits into its `CLAUDE.md` and `.ai/web-development/{CLAUDE,fluent-html}.md`; the 14 other canonical repos take them on their next guidelines sync.

## RFC-A-09: Opt-in serialize-time class merge: setClassMerge(theme) makes the later class of a family win

### 1. `guidelines/web-development/views.md:126-134` (9 lines → 4, net -5)

Current (verbatim):
`````
**Compose to add, never to change.** fluent appends classes, it does not replace them, so <!-- prose-only -->
`Card(…).apply(t => t.p("5"))` emits `p-6 … p-5` and Tailwind picks the winner by
**stylesheet order**, which the caller cannot see — overriding `p-6` with `p-5` silently loses
while `p-8` would win. So a styler is a seam only for the properties it deliberately leaves
open. Want a different padding? Compose the chrome onto your own element. Want a different
title size? Write the heading yourself; don't compose `cardTitle` and then fight it.
```typescript
Card({ title, content }).apply(t => t.p("5"))   // ✗ silently keeps p-6 — not an override
```
`````
Replacement (the agent-fitness lens's tested text, [`required-views-md.txt`](../70-artifacts/probes/wave3/RFC-A-09-agent-fitness/required-views-md.txt), lines 1-4):
`````
**Override by chaining only where boot calls `setClassMerge(theme)`** (grep `src/` for it; the template's
`buildServer` does). Then a later call of the same family replaces the earlier one: `Card(…).apply(t => t.p("5"))`
renders `p-5`, not `p-6 … p-5`. Without that call fluent appends and stylesheet order picks the winner, so
compose the chrome onto your own element instead of chaining an override. Families are per prefix (`p-2` does not replace `px-6`) and `hidden` is never merged.
`````
The bold span holds no never/always/must, so `tests/guidelines-enforcement.test.ts` needs no tag on it. Ships no earlier than the fluent-html 8.2.0 commit.

### 2. `guidelines/web-development/views.md:118`
Kept (Open question 5, V-RFC-A-09-agent-fitness #3).

### 3. `fluent-html/.ai/web-development/views.md:113-121`
No hand edit: the lib's synced copy (guidelines version `ac24da07`, without the `<!-- prose-only -->` marker) takes hunk 1 on the next `guidelines:pull`.

### 4. `fluent-html/CLAUDE.md`
No hunk: the diverged copy carries no "Compose to add" text (grep: 0 hits).

## RFC-B-03: Branded route sinks print their producers on line 1 in resolve([params,] query?) notation; prefer-set-method stops autofixing a raw href into a TS2345

All hunks are in `guidelines/web-development/`; net -2 lines, -552 B (145 + 114 + 182 + 72 + 39). None of these strings exists in `fluent-html/CLAUDE.md` (its `:265` has no escapes clause), so that file takes no hunk from this RFC. Publish after fluent-html 8.2.0 is tagged.

### H1: `CLAUDE.md:265` (delete a substring, line kept, -39 B)

Current substring (present today, and kept verbatim by RFC-B-01's hunk on the same line):

```
; escapes: `externalUrl()`/`assetUrl()`
```

Replacement: nothing. After both RFC-B-01 and this hunk the line reads:

```
- **`.resolve(query?)`** for redirects and hrefs; swap verbs take the called route (`route({ query })`), **`hx(url, { query })`** for ad-hoc URLs (`query` ≠ `vals`, which is the request body) <!-- enforced: type ResolvedRoute -->
```

### H2: `htmx.md:181` (replace a substring, line kept, -72 B)

Current substring:

```
; escapes for genuinely external targets: `externalUrl()` / `assetUrl()`:
```

Replacement:

```
:
```

(`assetUrl` is not for external targets; the sink error now names all three producers.)

### H3: `htmx.md:215` (delete a substring including its trailing space, line kept, -182 B)

Current substring:

```
A `"/api/items"` literal is neither type, so it does not compile; the endpoint is a route callable, a `.resolve()`, `assetUrl()`, `externalUrl()`, or a literal `https://…`/`#…`. 
```

Replacement: nothing. Its "a route callable" is false: `hxGet(routes.detail)` and `hxPost(routes.list())` are TS2345 on 8.1.0 (probes w20, w23).

### H4: `htmx.md:225` (delete the whole line, -145 B)

Current line (67 spaces between `)` and `//`):

```
Button("Load").hxGet("/api/items")                                                                   // ✗ a "/" literal is not a ResolvedRoute
```

### H5: `htmx.md:474` (delete the whole line, -114 B)

Current line (19 spaces between `)` and `//`):

```
A("Users").setHref("/users")                   // ✗ does not compile since 8.0.0 (ResolvedRoute | ExternalHref)
```

## RFC-E-01: Tag.getId(): the read for a wrapper handed a built control; the template FormGroup wires label for/id and a hint through it, and Form<T> views keep f.label

No guideline hunk (net 0). `guidelines/web-development/**` has 0 lines on `FormGroup`, `getClass` or reading ids, and the curation keeps it that way: no guideline teaches `getId`, so `f.label(name)` stays the one documented way to label a `Form<T>` control in a view (the lib's `REFERENCE.md:138`, `:462` and `:469` already show it). The accessor is taught where agents read it: its JSDoc (they found it from `tag.d.ts` in 6/6 prototype runs) and a `REFERENCE.md` entry beside `getClass`, both naming `f.label` for a view that holds `f`.

## RFC-E-02: Dev-check: a required select whose own markup would submit a value nobody chose throws, naming the field, the value and the fix; a value the controller or the request binds never decides a throw

No guideline hunk (net 0). `guidelines/web-development/**` carries 0 lines on placeholder options or preselection (grep for placeholder option, empty option, preselect: 0 hits), and no `FormBinding.select` JSDoc line is added: the measured line changed no outcome.

## RFC-E-04: Form<T>: f.select option values typed by the bound field, one accepted shape (the descriptor array; the label-record arm is cut); radio, hidden and checkbox values follow in 9.0.0

No guideline hunk (net 0). The RFC's -3 (`guidelines/web-development/fluent-html.md:120-123`, the descriptor-array example collapsed to a record line) taught the cut record arm, so those 4 lines stay as they are: the descriptor array is the one shape, and the example's literal values are now checked against `role: "admin" | "viewer"` with no prose change. The unchecked cases are taught in the `select` JSDoc, which every measured run read; no guideline line is added.

## RFC-E-07: IfNotEmpty / IfNotEmptyElse: a list guard that binds the list and treats null, undefined and [] alike; prefer-if-not-empty autofixes the restated guards and ForEachElse, which leaves in 9.0.0

Apply by quoted text, in wave G2: after the fluent-html 8.2.0 tag and the eslint-plugin-fluent-html 4.3.0 publish (the new line names the rule). CURRENT blocks are verbatim, their em dashes included so the patch applies; replacements add none. Net **-5**.

### 1. guidelines/web-development/fluent-html.md:411-415 (-3)

Current (verbatim, checked 2026-10-01):
```
// ✗ paired IfThen — evaluates the condition twice, branches can drift (F-A-025)
IfThen(items.length > 0,  () => List(items))
IfThen(items.length === 0, () => EmptyState())
// ✓ IfThenElse — one expression, one eval, always synchronized
IfThenElse(items.length > 0, () => List(items), () => EmptyState())
```
Replacement:
```
// ✓ lists: IfNotEmptyElse binds the list; [], null and undefined take the else (prefer-if-not-empty autofixes length checks)
IfNotEmptyElse(items, (xs) => List(xs), () => EmptyState())
```

### 2. guidelines/web-development/CLAUDE.md:166-167 (-1)

Current (verbatim):
```
IfThen(items.length > 0, () => List(items))                    // ✗ paired with the next line…
IfThen(items.length === 0, () => Empty())                      // ✗ …use IfThenElse (one eval, can't drift)
```
Replacement:
```
IfNotEmptyElse(items, (xs) => List(xs), () => Empty())         // ✓ lists: [], null, undefined take the else
```
Copies: `projects-template/CLAUDE.md:166-167` and every app's root `CLAUDE.md` follow through `guidelines:pull`.

### 3. fluent-html/CLAUDE.md:168-169 (diverged copy, fluent-html repo commit; -1)

Current (verbatim, identical to hunk 2; `fluent-html/.ai/web-development/CLAUDE.md:168-169` carries the same two lines):
```
IfThen(items.length > 0, () => List(items))                    // ✗ paired with the next line…
IfThen(items.length === 0, () => Empty())                      // ✗ …use IfThenElse (one eval, can't drift)
```
Replacement: the line of hunk 2.

### 4. guidelines/web-development/views.md:43 (0, in place)

Current (verbatim):
```
      IfThenElse(items.length > 0, () => ForEach(...), () => EmptyState(...)),
```
Replacement:
```
      IfNotEmptyElse(items, (xs) => ForEach(xs, ...), () => EmptyState(...)),
```

Measured on the RFC's wording (V-RFC-E-07-agent-fitness): `CLAUDE.md` 77 to 49 tokens per copy (-28, always loaded when guided), `fluent-html.md` 131 to 84 (-47), `views.md` 36 to 42 (+6). `guidelines/CLAUDE.md` at the guidelines repo root holds the same two lines at :168-169; no curated entry edits that file, and it is outside the counted delta.

## RFC-E-08: .size(): one typed call for Tailwind's size-* (equal width and height); prefer-size autofixes only receivers it can prove clean, and a one-time receiver-checked codemod folds the 423 fleet pairs

Apply by quoted text, in wave G2 (after the fluent-html 8.2.0 tag: the lines teach `.size`). Net **0**.

### 1. guidelines/web-development/fluent-html.md:65 (0, in place)

Current (verbatim, checked 2026-10-01):
```
Div().setStyle("width:44px;height:44px")   // ✗ → .w("px", 44).h("px", 44)
```
Replacement:
```
Div().setStyle("width:44px;height:44px")   // ✗ → .size("px", 44)
```
Copies at `fluent-html/.ai/web-development/fluent-html.md:65` and `projects-template/.ai/web-development/fluent-html.md:65` follow through `guidelines:pull`.

### 2. guidelines/web-development/CLAUDE.md:182 (0, in place)

Current (verbatim):
```
// Methods: w, h, minW, maxW, minH, maxH, p, m (+ px…pr, mx…mr), gap, top, right, bottom, left, inset,
```
Replacement:
```
// Methods: w, h, size, minW, maxW, minH, maxH, p, m (+ px…pr, mx…mr), gap, top, right, bottom, left, inset,
```

### 3. fluent-html/CLAUDE.md:184 (diverged copy, fluent-html repo commit; 0)

Current (verbatim, identical to hunk 2; `fluent-html/.ai/web-development/CLAUDE.md:184` carries the same line):
```
// Methods: w, h, minW, maxW, minH, maxH, p, m (+ px…pr, mx…mr), gap, top, right, bottom, left, inset,
```
Replacement: the line of hunk 2.

## RFC-C-02: 9.0.0 prune gated on recorded agent guesses: 2 dead second spellings and 4 duplicate root exports leave; containerQuery, root setDevChecks, setMicrodata and the census-zero setters and utilities stay

### 1. guidelines/web-development/fluent-html.md:383 (delete)

Current (verbatim, checked 2026-10-01):
```
Repeat(3, () => Br())                              // simple repeat
```
Replacement: none, the line is deleted. `ForEach(5, i => Div(`Item ${i}`))` at :381 already teaches the count form. Net -1.

### Not edited
- `guidelines/web-development/fluent-html.md:90` (the `setMicrodata({ type, prop, id })` clause): unchanged, `setMicrodata` stays.
- `fluent-html/CLAUDE.md`: no `Repeat`, `multipart`, `extractId`, `extractSelector`, `EVENT_TABLE`, `HTMX_EVENTS` or `setMicrodata` text (grep: 0 hits), so no hunk.
- projects-template's vendored `.ai/web-development/fluent-html.md` follows through `npm run guidelines:pull`.

Net guideline lines: -1.

## RFC-D-02: .search emits sync "queue last" while the served htmx 4.0.0 lets a replaced request free its replacement's slot; an asymmetric-latency smoke row and a tripwire gated on the 4.0.0 RequestQueue mark the way back to "replace"

Line numbers are today's. CURRENT blocks are quoted verbatim (their em dashes included, so the patch applies); replacements add none. RFC-A-03 deletes `htmx.md:277-278` and `fluent-html/CLAUDE.md:276` in the same files, so apply by text match.

**1. `guidelines/web-development/htmx.md:346`** (0)

CURRENT:
```
| `.search(route, delay?)`<br>`.search(target, route, delay?)` | `input changed delay:300ms` trigger, `sync: "replace"`, `include: "this"`, morph `#main-content` (or `target`) | debounced live filters / type-ahead (see [§ Trigger verbs](#trigger-verbs--search-onchange-fire)) |
```
REPLACEMENT:
```
| `.search(route, delay?)`<br>`.search(target, route, delay?)` | `input changed delay:300ms` trigger, newest query wins, `include: "this"`, morph `#main-content` (or `target`) | debounced live filters / type-ahead (see [§ Trigger verbs](#trigger-verbs--search-onchange-fire)) |
```

**2. `guidelines/web-development/htmx.md:389`** (0)

CURRENT:
```
Three 4.0.0-beta4 runtime facts these bake (each one silently wrong when hand-rolled):
```
REPLACEMENT:
```
Two runtime facts these bake (each one silently wrong when hand-rolled):
```

**3. `guidelines/web-development/htmx.md:391`** (net -1; the runtime fact stays in the ✗ example at `:400`, `// ✗ "queue first" drops requests`)

CURRENT (delete the line):
```
- **default `hx-sync` is `"queue first"`** — one request in flight + one queued ⇒ every later one is **dropped**. `.search` emits `sync: "replace"`.
```

**4. `guidelines/web-development/CLAUDE.md:273`** (0; in-line substring)

CURRENT substring:
```
`.search` emits `sync: "replace"` (debounced filter);
```
REPLACEMENT:
```
`.search` is the debounced, newest-wins filter;
```

**5. `fluent-html/CLAUDE.md:274`** (0; same substring and replacement as hunk 4)

CURRENT substring:
```
`.search` emits `sync: "replace"` (debounced filter);
```
REPLACEMENT:
```
`.search` is the debounced, newest-wins filter;
```

Net: -1.
