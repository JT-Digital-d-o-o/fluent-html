---
id: RFC-A-08
track: A
title: Typed HTMX lifecycle escape hatch (.hxOn) + lifecycle behaviors + escapeJs fix
resolves: [F-A-018, F-A-065, F-A-086]
api_surface: ["Tag.prototype.hxOn()", "HxOnEvent", "BehaviorMap (formResetOnSwap, dismissOnEscape)", "escapeJs (internal fix)"]
breaking: additive
guardrails_checked: [zero-deps, ssr-only, escape-by-default, type-safety, backward-compat]
guideline_updates: ["web-development/CLAUDE.md", "web-development/htmx.md"]
impact: high
effort: M
depends_on: []
status: proposed
---

# RFC-A-08: Typed HTMX lifecycle escape hatch (`.hxOn`) + lifecycle behaviors + `escapeJs` fix

## Problem

The `.behavior()` system (`src/core/behavior-methods.ts:11`) owns the inline-JS story with 9 closed built-ins. The `renderers` map is private (`behavior-methods.ts:46`) with **no public extension point**. When an app needs click-time logic the built-ins don't cover, the only path is `addAttribute("hx-on:...", rawJs)` — exactly what the guideline forbids ("never raw inline JS", index `CLAUDE.md:201`). This produces three coupled defects:

1. **No typed lifecycle hook (F-A-018).** HTMX-4 `hx-on:htmx:after:swap` / `hx-on:keydown` patterns force raw `addAttribute`:
   ```ts
   // rideshare/src/settings/settings.view.ts:260
   .addAttribute("hx-on:htmx:after:swap", `if(!document.getElementById('${ids.passwordError.id}'))this.reset()`)
   // ttl/src/time-entry/views/time-entry.view.ts:679
   .addAttribute("hx-on:keydown", "if(event.key==='Escape'){this.querySelector('[type=button]').click()}")
   ```
   Unlike `.behavior()`, two `addAttribute("hx-on:keydown", …)` calls **overwrite** rather than concatenate, and nothing escapes interpolated values.

2. **`escapeJs` is incomplete (F-A-065).** `behavior-methods.ts:85` escapes only `\` and `'`. A clipboard value with a newline produces a **broken multi-line `hx-on:click` attribute** (invalid HTML, silently dropped by the parser):
   ```ts
   function escapeJs(str: string): string {
     return str.replace(/\\/g, "\\\\").replace(/'/g, "\\'");   // ✗ misses \n \r   < >
   }
   ```

3. **The rule is unenforceable (F-A-086).** 127 `addAttribute("hx-on:click", …)` call-sites across 12+ apps "violate" the index rule on every commit because there is no sanctioned escape hatch (`renderbox/.../studio.variant-2.view.ts:264`, `tela/.../comments-panel.ts:344`, `gzs/.../admin-quick-grade.view.ts:423`). A rule with no enumerated exception loses credibility and drives apps to the undocumented, unescaped path.

All three share one surface: the inline-JS / `hx-on:` boundary.

## Proposed API

Three coordinated additions, all additive.

### 1. `Tag.prototype.hxOn(event, js)` — typed escape hatch

```ts
// src/core/htmx-on-types.ts (new)

/** HTMX-4 lifecycle events (kebab, the `htmx:` namespace) + common DOM events.
 *  `(string & {})` keeps autocomplete while accepting any event name. */
export type HxOnEvent =
  // htmx lifecycle (htmx-4 kebab form, emitted as hx-on:htmx:after:swap …)
  | "htmx:before-request" | "htmx:after-request"
  | "htmx:before-swap"    | "htmx:after-swap"
  | "htmx:after-settle"   | "htmx:before-send"
  | "htmx:response-error" | "htmx:send-error" | "htmx:config-request"
  // common DOM events
  | "click" | "keydown" | "keyup" | "input" | "change"
  | "submit" | "focus" | "blur" | "load"
  | (string & {});

declare module "./tag.js" {
  interface Tag {
    /** Attach raw inline JS to an `hx-on:<event>` handler. Escape hatch — use
     *  `.behavior()` for the built-in cases. Multiple calls on the same event
     *  concatenate with `;` (same as `.behavior()`). The `js` string is emitted
     *  verbatim into the attribute: NEVER template-interpolate user content. */
    hxOn(event: HxOnEvent, js: string): this;
  }
}
```

Runtime mirrors `.behavior()` exactly — copy-on-write of `EMPTY_ATTRS`, concat with `;`:

```ts
// src/core/htmx-on-methods.ts (new)
(Tag.prototype as any).hxOn = function (event: string, js: string) {
  if (this.attributes === EMPTY_ATTRS) this.attributes = Object.create(null);
  const attr = `hx-on:${event}`;
  const existing = this.attributes[attr];
  this.attributes[attr] = existing ? existing + ";" + js : js;
  return this;
};
```

### 2. Two safe lifecycle behaviors (no raw JS surface) — extend `BehaviorMap`

```ts
// src/core/behavior-methods.ts — additions to BehaviorMap
export type BehaviorMap = {
  // … existing 9 …
  formResetOnSwap: { unless?: Id };   // hx-on:htmx:after-swap → reset form unless `unless` el exists
  dismissOnEscape: { trigger: Id };   // hx-on:keydown → Escape clicks `trigger`
};
```

```ts
// renderers additions
formResetOnSwap: (opts) => [
  "htmx:after-swap",
  opts.unless
    ? `if(!${el(opts.unless)})this.reset()`   // el() already wraps in getElementById('id')
    : "this.reset()",
],
dismissOnEscape: (opts) => [
  "keydown",
  `if(event.key==='Escape')${el(opts.trigger)}.click()`,
],
```

These cover the exact rideshare (`formResetOnSwap`) and ttl (`dismissOnEscape`) patterns with **zero raw-JS surface** — args are branded `Id`s, never user strings.

### 3. `escapeJs` — complete single-quoted-literal escaper (bug fix)

```ts
// src/core/behavior-methods.ts:85 — replace
function escapeJs(str: string): string {
  return str
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'")
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(//g, "\\u2028")   // line separator — JS line terminator in literals
    .replace(//g, "\\u2029")   // paragraph separator
    .replace(/</g, "\\x3C");          // neutralize </script> breakout in raw contexts
}
```

(Equivalent: `JSON.stringify(str).slice(1, -1)` then `'…'`-wrap — but it produces `\uXXXX` for `'` only with a double-quoted base; the explicit chain keeps the single-quote template unchanged and is dependency-free.)

## Worked examples (before → after)

### Form-reset-on-swap (rideshare)

```ts
// before — rideshare/src/settings/settings.view.ts:260
.setHtmx(settingsRoutes.changePassword({ target: layoutIds.page, swap: "outerMorph scroll:top" }))
.addAttribute("hx-on:htmx:after:swap", `if(!document.getElementById('${ids.passwordError.id}'))this.reset()`)
```
```ts
// after — typed behavior, no raw JS, no manual getElementById interpolation
.setHtmx(settingsRoutes.changePassword({ target: layoutIds.page, swap: "outerMorph scroll:top" }))
.behavior("formResetOnSwap", { unless: ids.passwordError })
```

### Dismiss-on-Escape (ttl)

```ts
// before — ttl/src/time-entry/views/time-entry.view.ts:679
.addAttribute("hx-on:keydown", "if(event.key==='Escape'){this.querySelector('[type=button]').click()}")
```
```ts
// after — typed behavior targeting a real Id (replace the [type=button] querySelector with the cancel Id)
.behavior("dismissOnEscape", { trigger: entryRowCancelId(entry.id) })
```

### Custom click logic with no matching built-in (renderbox)

```ts
// before — renderbox/.../studio.variant-2.view.ts:264
.addAttribute("hx-on:click", "switchTab(this, 'rbx')")
```
```ts
// after — sanctioned typed escape hatch; static literal, no interpolation
.hxOn("click", "switchTab(this, 'rbx')")
```

### Cmd/Ctrl+Enter submit (tela)

```ts
// before — tela/.../comments-panel.ts:344
.addAttribute("hx-on:keydown", "if(event.key==='Enter' && (event.metaKey || event.ctrlKey)) this.form.requestSubmit()")
```
```ts
// after
.hxOn("keydown", "if(event.key==='Enter' && (event.metaKey || event.ctrlKey)) this.form.requestSubmit()")
```

## Type-safety story

- **Literal union + `(string & {})`** — `HxOnEvent` autocompletes the 9 htmx-4 lifecycle events and 9 common DOM events while still accepting arbitrary names (same pattern as `HxSwap`, `htmx.ts:51`). Typo-resistance without a closed set.
- **Branded `Id`** — `formResetOnSwap`/`dismissOnEscape` take `Id` (the `__idBrand` from `ids.ts:21`), not `string`. A bare string is a compile error, so the JS template can only ever interpolate a controlled, validated id — **zero XSS surface** by construction. This is why the two known lifecycle patterns are behaviors (typed) rather than `.hxOn` calls (raw).
- **Discriminated-union behavior dispatch** — `behavior<K extends BehaviorName>(name, …args)` already narrows option shape per key via `BehaviorMap[K]` (`behavior-methods.ts:28`); the two new keys plug in with no signature change.
- **`.hxOn(event, js: string)`** is honestly typed as "raw JS" — `js` is `string`, the JSDoc says "NEVER template-interpolate user content". It is the *typed* escape hatch (typed event, concatenating, consistent), not a *type-safe* one — the right altitude for a documented last resort.

## Migration & compatibility

**Additive — nothing breaks.**
- `.hxOn()` is a new method; existing `addAttribute("hx-on:…")` calls keep working.
- Two new `BehaviorMap` keys; the 9 existing behaviors are untouched.
- `escapeJs` is internal (not exported). The fix only *adds* escapes — any value that rendered correctly before still does; values that previously produced broken HTML (newlines) now render correctly. No call-site changes.

**No codemod required.** Optional adoption codemod (Wave-4, nice-to-have): rewrite `addAttribute("hx-on:<evt>", js)` → `.hxOn("<evt>", js)` (mechanical, AST-safe, preserves js verbatim). The two lifecycle-behavior migrations (rideshare/ttl) are not mechanical (they drop the interpolation) and are left manual.

**`breaking-changes.md`:** no entry — additive.

## Guidelines impact

Two patches. The index already forbids inline JS but offers no exit; this RFC supplies the sanctioned ladder: `.behavior()` → `.hxOn()` → `addAttribute` (last resort).

### Index (`web-development/CLAUDE.md`) — replace the `.behavior()` block (lines 201–208)

```md
**`.behavior()` for client-side interactions** — never raw inline JS:
```typescript
Button("Toggle").behavior("toggle", { target: ids.filterPanel })
Button("Copy").behavior("clipboard", { value: apiKey })
Button("Submit").behavior("disable")
A("Back").behavior("back").cursor("pointer")
Form(...).behavior("formResetOnSwap", { unless: ids.error })   // reset on successful swap
Row(...).behavior("dismissOnEscape", { trigger: ids.cancel })  // Escape → click cancel
```
Built-in: `toggle`, `toggleClass`, `remove`, `clipboard`, `disable`, `focus`, `scrollTo`, `selectAll`, `back`, `formResetOnSwap`, `dismissOnEscape`.

**No matching built-in? `.hxOn(event, js)` — the typed escape hatch, never `addAttribute`:**
```typescript
Button("Tab").hxOn("click", "switchTab(this,'rbx')")               // ✓ typed event, concatenates
Button("Tab").addAttribute("hx-on:click", "switchTab(this,'a')")   // ✗ overwrites, no escaping
```
- ✓ `.hxOn` autocompletes htmx-4 lifecycle events (`htmx:after-swap`, …) + DOM events; multiple calls on one event concatenate with `;`.
- ✗ NEVER template-interpolate user/db content into the `js` string (XSS). Use a behavior with a branded `Id` instead.
```

### Topic ref (`web-development/htmx.md`) — append new section after `## hxResponse` (end of file)

```md
## Client-side behaviors & inline-JS ladder

Three rungs, in order of preference:

1. **`.behavior(name, opts)`** — library-owned inline JS, no client runtime. Prefer always.
```typescript
Button("Toggle").behavior("toggle", { target: ids.panel })
Button("Copy").behavior("clipboard", { value: apiKey })
Form(...).setHtmx(routes.save({ target: ids.page }))
  .behavior("formResetOnSwap", { unless: ids.error })   // hx-on:htmx:after-swap → this.reset()
Row(...).behavior("dismissOnEscape", { trigger: ids.cancel })  // hx-on:keydown → Escape clicks cancel
```
Built-ins: `toggle`, `toggleClass`, `remove`, `clipboard`, `disable`, `focus`, `scrollTo`, `selectAll`, `back`, `formResetOnSwap`, `dismissOnEscape`. Options taking a `target`/`trigger`/`unless` require a branded `Id` from `defineIds` — never a raw selector string.

2. **`.hxOn(event, js)`** — typed escape hatch when no built-in fits. Emits `hx-on:<event>`; `event` autocompletes htmx-4 lifecycle + DOM events; repeated calls on one event concatenate with `;`.
```typescript
Button("Tab").hxOn("click", "switchTab(this,'rbx')")                          // ✓ static literal
Textarea().hxOn("keydown", "if(event.metaKey&&event.key==='Enter')this.form.requestSubmit()")  // ✓
Button(label).hxOn("click", `track('${userInput}')`)                          // ✗ XSS — interpolated content
```
- ✓ static JS literals, references to `this`/`event`, or values you control.
- ✗ any user- or db-derived value interpolated into the string. If you need dynamic data, route it through a behavior whose options are branded `Id`s (compile-time safe), or pass it as an `hx-vals`/`data-*` attribute the handler reads.

3. **`.addAttribute("hx-on:…", js)`** — ✗ do not use. It overwrites on repeat (no `;` concat) and bypasses the `.hxOn` event typing. `.hxOn` supersedes it for every case.

**Adoption note:** the old index rule said "never raw inline JS" but listed no exit, so 127 `addAttribute("hx-on:click", …)` call-sites accumulated across apps. The rule is now enforceable: built-in → `.hxOn` → (never `addAttribute`).
```

## Guardrail check

- **§11.1 zero-deps:** pass — no new dependencies; `escapeJs` fix is plain string ops.
- **§11.2 ssr-only / fast sync path:** pass — `.hxOn`/behaviors mutate `attributes` and return `this`, identical cost profile to `.behavior()`; render path unchanged.
- **§11.3 escape-by-default:** pass — directly *fixes* an escape bug (F-A-065); new behaviors take branded `Id`s (no string interpolation); `.hxOn` is honestly documented as raw with explicit ✗ XSS guidance.
- **§11.4 type-safety:** pass — `HxOnEvent` literal-union + `(string & {})`; branded `Id` options; per-key narrowing via `BehaviorMap`. No `any` in consumer surface (the `as any` is an internal prototype-patch cast, same as existing `.behavior`).
- **§11.5 backward-compat:** pass — additive; no `breaking-changes.md` entry; optional non-mandatory codemod.
- **§11.6 consistency:** pass — `.behavior()` over inline JS reinforced; branded `Id` single-sourcing; `.hxOn` concat semantics mirror `.behavior()`.
- **§11.7 class-string contract:** N/A — emits no Tailwind classes; Track-C tooling unaffected.
- **§11.8 guideline-sync:** pass — Guidelines impact patches both index (`CLAUDE.md`) and topic ref (`htmx.md`), covering every `api_surface` symbol: `.hxOn` (both files), `HxOnEvent` (event autocomplete note), the two `BehaviorMap` behaviors (built-in list + examples), and the `escapeJs` fix (internal — no public surface, correctly untaught).

## Alternatives considered

- **`.behavior()`-only (Option A, no `.hxOn`).** Safest (zero raw-JS surface) but cannot cover the long tail of one-off click logic (127 call-sites, `switchTab`, conditional guards). Would leave the rule unenforceable for the majority case. Rejected as incomplete; we ship *both* — behaviors for the two known lifecycle patterns, `.hxOn` for the tail.
- **Public behavior-registry (`registerBehavior`).** Open the `renderers` map for app-defined named behaviors. More powerful but a larger surface, shared mutable global, and a Track-B concern (noted in F-A-086). Deferred — `.hxOn` solves the immediate DX gap additively.
- **`JSON.stringify` for `escapeJs`.** Produces a guaranteed-safe literal but changes the quote style of every behavior template (single→double) and over-escapes. The explicit replace-chain is a smaller, reviewable diff that keeps existing templates byte-stable except for the newly-handled chars.
- **Auto-escaping `.hxOn` value.** Rejected — `js` is *code*, not data; escaping it would break valid handlers. The safety boundary is "don't interpolate data," enforced by docs + the branded-`Id` behaviors for the data case.

## Open questions

- `HxOnEvent` htmx names use the htmx-4 kebab form (`htmx:after-swap`). The rideshare code uses the **colon** form (`htmx:after:swap`). Confirm the htmx-4 canonical separator before locking the literal union (the `(string & {})` fallback means a wrong guess is non-breaking, only autocomplete-affecting).
- Should `.hxOn` validate that `event` doesn't contain `"` / whitespace (attribute-name safety), or trust the typed surface? Leaning trust + a dev-only assert, consistent with `addAttribute`'s key validation (`tag.ts:19`).
