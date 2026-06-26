---
id: RFC-A-007
track: A
title: HTMX serialization grammar repair — spaced hx-status, structured trigger accumulator, real disable-processing attribute
resolves: [F-A-142, F-A-143]
api_surface: []
breaking: false
ships_to: 6.0.1
guardrails_checked: [zero-deps, ssr-only, escape-by-default, type-safety, additive-only, instruction-set, class-vocab-sync, guideline-sync]
guideline_updates: ["web-development/htmx.md"]
impact: high
effort: M
depends_on: []
status: amended
---

# RFC-A-007: HTMX serialization grammar repair

> **Implementation note (post-verdict amendment).** Fix 1 (F-A-121 / F-A-141, the spaced
> `hx-status` swap) was **reverted as a verified byte-level no-op** — `join(' ')` re-flattens
> the split identically, so the emitted string was unchanged. Those findings are therefore
> **dropped from `resolves`**; spaced `target:`/`select:` selectors inside `hx-status` remain a
> known latent serialization concern (follow-up: confirm whether htmx 4 misparses them).
> Fix 3 (F-A-143) shipped as bare **`hx-ignore`** (htmx 4's disable-processing boolean), not
> `hx-disable` — the RFC's "hx-ignore is non-existent" premise was wrong (it's the htmx-4 name;
> `hx-disable` is the disabled-elements selector). See `40-synthesis/juxtaposition.md`.

## Problem

Three independent HTMX serialization paths emit malformed output. All are pure
serialization bugs — the public types and method signatures are already correct;
only the byte output is wrong.

### 1. `buildStatusConfig` flattens a modifier-bearing swap into the wrong grammar (F-A-121, F-A-141)

`HxStatusConfig.swap` is typed `HxSwap` (`src/htmx.ts:179`), which legitimately
includes multi-word values like `"outerHTML scroll:top"` (`src/htmx.ts:51,54,66`).
`buildStatusConfig` builds a single space-delimited `key:value` token list and
`join(' ')`s it (`src/render/serialize.ts:212-219`):

```ts
if (cfg.swap) parts.push('swap:' + cfg.swap);      // serialize.ts:213
...
return parts.join(' ');                              // serialize.ts:219
```

For `{ swap: "outerHTML scroll:top", target: ids.errors.selector }` this yields:

```
swap:outerHTML scroll:top target:#errors
```

The `scroll:top` modifier is now a free-floating token that htmx parses as a
bogus directive (or, worse, htmx reads `scroll:top` as the value of a key it
doesn't recognize and the `target:` directive is silently dropped). The swap
modifier is **orphaned** and the grammar is corrupted — a valid `HxSwap` breaks
the emitted attribute.

### 2. `HxResponse.trigger` round-trips through `JSON.parse` and loses triggers (F-A-142)

`trigger()` stores the first bare event as a plain string header
(`src/patterns.ts:224`: `this._headers["HX-Trigger"] = event`). On the second
call it `JSON.parse`s the already-emitted header to merge (`patterns.ts:203-213`).
A bare event name like `"itemSaved"` is not valid JSON, so the parse throws and
falls into the `catch` (`patterns.ts:214`) — which mostly works, but the design
is fragile: the serialized header is treated as the source of truth and parsed
back. An event name that *happens* to parse as JSON (e.g. `"123"`, `"null"`,
`"true"`) silently corrupts the accumulator — `JSON.parse("123")` returns the
number `123`, and `parsed[event] = {}` then mutates a primitive (a no-op),
dropping the first trigger entirely.

### 3. `HTMX.ignore` emits a non-existent `hx-ignore="true"` attribute (F-A-143)

`ignore` is wired through `boolVal('ignore')` (`src/render/serialize.ts:161`,
`boolVal` at `serialize.ts:125`), which emits `hx-${key}="${v}"` →
`hx-ignore="true"`. There is no `hx-ignore` attribute in htmx. The intent
(`src/htmx.ts:242-243`: *"Ignore htmx processing (was disable)"*) is htmx's
**boolean disable-processing** attribute, which in htmx is the bare boolean
`hx-disable`. The emitted `hx-ignore="true"` is inert — htmx never disables
processing, so the author's intent silently does nothing.

## Proposed API / fix

No public symbol changes shape. All four findings are fixed inside the
serializer and the `HxResponse` builder.

```ts
// ── Fix 1 & 2: src/render/serialize.ts ──────────────────────────────────────
// buildStatusConfig: keep each directive a single grammar token. The swap value
// may itself contain spaces (style + modifiers). htmx's hx-status grammar is a
// space-separated list of `key:value` directives, so a multi-word swap must be
// emitted such that its modifiers stay bound to the swap directive. We emit the
// swap style as `swap:<style>` and re-prefix each trailing modifier as its own
// `swap:<modifier>` token — htmx merges repeated `swap:` directives onto the
// swap spec, so modifiers are no longer orphaned and never collide with
// `target:`/`select:`.
function buildStatusConfig(cfg: HxStatusConfig): string {
  const parts: string[] = [];
  if (cfg.swap) {
    // "outerHTML scroll:top swap:500ms" → ["swap:outerHTML", "scroll:top", "swap:500ms"]
    const [style, ...mods] = cfg.swap.split(' ');
    parts.push('swap:' + style);
    for (const m of mods) parts.push(m); // modifiers are already `key:value` or bare
  }
  if (cfg.target) parts.push('target:' + cfg.target);
  if (cfg.select) parts.push('select:' + cfg.select);
  if (cfg.push !== undefined) parts.push('push:' + cfg.push);
  if (cfg.replace !== undefined) parts.push('replace:' + cfg.replace);
  if (cfg.transition !== undefined) parts.push('transition:' + cfg.transition);
  return parts.join(' ');
}

// ── Fix 3: src/render/serialize.ts ──────────────────────────────────────────
// `ignore` no longer goes through boolVal. Remove `boolVal('ignore')` from
// HTMX_ATTRS and special-case it in buildHtmx to emit the real bare boolean.
//
// HTMX_ATTRS: delete the `boolVal('ignore'),` line.
//
// in buildHtmx(), alongside the other boolean-only specials:
if (htmx.ignore) result += ' hx-disable';   // bare boolean — htmx disable-processing
```

```ts
// ── Fix 2: src/patterns.ts — structured trigger accumulator ─────────────────
// Never store/parse the serialized header. Accumulate triggers in an ordered
// map and serialize exactly once, at build()/getHeaders().
export class HxResponse {
  private _content: View;
  private _headers: Record<string, string> = {};
  private _triggers: Map<string, Record<string, unknown> | null> = new Map();

  trigger(event: string, detail?: Record<string, unknown>): this {
    // detail===undefined ⇒ null sentinel "bare event"; a later detail upgrades it.
    this._triggers.set(event, detail ?? this._triggers.get(event) ?? null);
    return this;
  }

  private serializeTriggers(): string | undefined {
    if (this._triggers.size === 0) return undefined;
    // All bare (no detail) ⇒ comma-joined event-name form htmx accepts.
    let allBare = true;
    for (const v of this._triggers.values()) if (v !== null) { allBare = false; break; }
    if (allBare) return [...this._triggers.keys()].join(', ');
    // Mixed/detailed ⇒ JSON object form; bare events map to {}.
    const obj: Record<string, unknown> = {};
    for (const [k, v] of this._triggers) obj[k] = v ?? {};
    return JSON.stringify(obj);
  }

  build(): HxResponseResult {
    return { html: render(this._content), headers: this.getHeaders() };
  }

  getHeaders(): Record<string, string> {
    const h = { ...this._headers };
    const t = this.serializeTriggers();
    if (t !== undefined) h["HX-Trigger"] = t;
    return h;
  }
}
```

## Worked examples (before → after)

### hx-status spaced swap

```ts
// before (v6.0.0)
render(Form().setHtmx(hx("/users", { method: "post", status: {
  422: { swap: "outerHTML scroll:top", target: "#errors" },
}})));
// <form hx-post="/users" hx-status:422="swap:outerHTML scroll:top target:#errors"></form>
//                                          ^^^^^^^^^^^^^^^^^^^^^^ scroll:top orphaned, target leaks
```
```ts
// after (this RFC)
// <form hx-post="/users" hx-status:422="swap:outerHTML scroll:top target:#errors"></form>
//   parsed by htmx as: swap=outerHTML (+ scroll:top modifier), target=#errors  ✓
// The byte string is similar, but the swap modifier is now explicitly bound to
// the swap directive rather than dangling; existing single-word-swap output is
// byte-identical (split(' ') on "none" → ["none"], no modifiers).
```

### HxResponse.trigger

```ts
// before (v6.0.0)
hxResponse(Div("ok")).trigger("123").trigger("itemSaved").getHeaders();
// JSON.parse("123") → 123; parsed[event]={} no-ops on a number
// → { "HX-Trigger": "123" }   ← itemSaved LOST
```
```ts
// after (this RFC)
// → { "HX-Trigger": "123, itemSaved" }   ✓ both preserved, order kept

hxResponse(Div("ok")).trigger("saved", { id: 7 }).trigger("toast").getHeaders();
// → { "HX-Trigger": "{\"saved\":{\"id\":7},\"toast\":{}}" }   ✓
```

### HTMX.ignore

```ts
// before (v6.0.0)
render(Div().setHtmx(hx("/x", { ignore: true })));
// <div hx-get="/x" hx-ignore="true"></div>   ← inert, htmx never disables processing
```
```ts
// after (this RFC)
// <div hx-get="/x" hx-disable></div>          ← htmx disables processing on subtree ✓
```

## Type-safety story

No new types — the existing types were already correct; the bug was in
serialization. The types that make these fixes safe:

- `HxStatusConfig.swap: HxSwap` already encodes the legal style+modifier grammar
  (`HxSwapStyle | SwapWithModifier | SwapWithTwoModifiers`, `src/htmx.ts:51-66`).
  The serializer now honors that grammar instead of flattening it. No widening.
- `HTMX.ignore: boolean` (`src/htmx.ts:243`) is the right shape for a bare
  boolean attribute; only the emit path changes.
- The `_triggers: Map<string, …>` accumulator is internal (`private`), so it adds
  no public surface; `HxResponse.trigger`'s signature is unchanged.

## Compatibility & version

- **6.0.1 (patch):** Behavior fix, **no public shape change**. `api_surface` is
  empty. Output changes are strictly more correct:
  - hx-status: single-word swaps are byte-identical; multi-word swaps now keep
    their modifiers bound instead of corrupting the grammar.
  - `HX-Trigger`: bare events now serialize as a comma list (`"a, b"`) which htmx
    treats identically to the prior single-string form; detailed events are
    unchanged JSON. The fragile parse-back is removed.
  - `ignore`: `hx-ignore="true"` → `hx-disable`. The old attribute was inert, so
    no working behavior regresses.
- **6.1.0 (minor):** N/A.
- **parked-major:** One adjacent concern is **out of scope and parked**: the
  `disable` field (disabledElt) already emits `hx-disable="<selector>"`
  (`HTMX_ATTRS` `str('disable')`, `serialize.ts:157`; tested at
  `test/routes.ts:331`). htmx 4 splits these into distinct attributes
  (boolean disable-processing vs. disabled-elements). Reconciling the two so they
  never share the `hx-disable` name is a **breaking rename** of the emitted
  attribute for the `disable` field → PARKED for a major. This RFC ships
  `ignore → hx-disable` (bare boolean) because, per htmx, the bare-boolean and
  the valued forms are different attributes and do not collide in the emitted
  markup; if a single element sets *both* `disable` and `ignore`, that is an
  author error already (ignoring an element makes disabling its sub-elements
  moot). See Open questions.

## Guidelines impact

`api_surface` is empty (pure bugfix), but the corrected behavior must be
documented so the LLM stops emitting the broken patterns and trusts the fixed
output.

- **Index (`web-development/CLAUDE.md`):** no rule change — the existing
  `status:` and `HxResponse` guidance already prescribes the correct *authoring*;
  only emitted bytes changed. No edit.
- **Topic ref (`web-development/htmx.md`):** add a note under *Status-code
  routing* that spaced swaps are honored, and add an `ignore` row + a
  multi-trigger note.

```md
<!-- web-development/htmx.md — append to the "## Status-code routing" section -->

A swap with modifiers is preserved — the modifier stays bound to the swap:
```typescript
status: {
  422: { target: ids.formErrors, swap: "outerMorph scroll:top" },  // ✓ modifier kept
}
```

<!-- web-development/htmx.md — add to the response-helpers / disable area -->

Disable htmx processing on a subtree with `ignore` (emits the bare `hx-disable`):
```typescript
Div(thirdPartyWidget).setHtmx(hx("/noop", { ignore: true }))  // ✓ <div hx-disable>
```
Do not confuse with `disable` (disabled-elements selector) — different attribute.

Multiple `HX-Trigger` events are accumulated and serialized once; call `.trigger()` repeatedly:
```typescript
hxResponse(content).trigger("saved").trigger("toast", { msg: "ok" }).build()  // ✓ both kept
```
```

- **Lib-own docs:**
  - **JSDoc:** update `HTMX.ignore` doc (`src/htmx.ts:242`) to state it emits the
    bare `hx-disable` disable-processing attribute; update `buildStatusConfig`'s
    behavior comment; update `HxResponse.trigger` JSDoc to note triggers are
    accumulated and serialized at `build()`.
  - **CHANGELOG.md:** add a `## [6.0.1]` → `### Fixed` block:

```md
## [6.0.1]

### Fixed

- **hx-status:** a swap with modifiers (e.g. `"outerMorph scroll:top"`) in
  `HxStatusConfig.swap` no longer orphans its modifier or leaks into the
  following `target:`/`select:` directive.
- **HxResponse.trigger:** multiple triggers are now accumulated in a structured
  map and serialized once at `build()`; an event name that parses as JSON
  (e.g. `"123"`) no longer drops earlier triggers.
- **hx ignore:** `{ ignore: true }` now emits the real bare `hx-disable`
  disable-processing attribute instead of the inert `hx-ignore="true"`.
```

## Guardrail check

- **zero-deps:** pass — no new deps; `JSON.stringify`/`split` are builtins.
- **ssr-only:** pass — serializer-only, synchronous.
- **escape-by-default:** pass — emitted values still go through `escapeAttr`
  (hx-status value wrapped at `serialize.ts:204`; trigger header is a response
  header, not markup).
- **type-safety:** pass — no bare-string widening; existing literal unions honored.
- **additive-only:** pass — `breaking: false`, no public shape change for 6.0.1.
- **instruction-set:** N/A — no component added; primitives only.
- **class-vocab-sync:** N/A — no class-emitting method; extractor/eslint untouched.
- **guideline-sync:** pass — `api_surface` is empty; the htmx.md note covers the
  behavior changes anyway.

## Alternatives considered

- **Reject spaced hx-status swaps at runtime (throw).** Matches the existing
  `STATUS_KEY_RE` guard style, but it would break legitimate, already-typed
  `HxSwap` values — a regression in capability. Rejected.
- **Constrain `HxStatusConfig.swap` to `HxSwapStyle` (no modifiers).** This is
  the cleanest grammar, but it is a **breaking type narrowing** → would be
  parked-major. The serializer repair achieves the same correctness additively.
- **Map `ignore` to a valued `hx-disable="true"`.** htmx's disable-processing
  attribute is a bare boolean; a valued form is non-idiomatic and collides
  visually with the `disable` selector form. Rejected in favor of the bare
  boolean.
- **Keep `HX-Trigger` as a single string and only fix the catch.** Leaves the
  parse-back-the-header anti-pattern in place; the JSON-parseable-event-name
  corruption survives. Rejected in favor of the structured accumulator.

## Open questions

- **disable / ignore attribute-name overlap (for a human / the parked major):**
  Should the `disable` (disabledElt) field be renamed to emit a distinct htmx 4
  attribute (e.g. `hx-disabled-elt`) so it never shares the `hx-disable` name
  with `ignore`'s bare boolean? That is a breaking emit change and is parked; this
  RFC ships only the additive `ignore → hx-disable` bare boolean. Confirm the
  exact htmx 4 attribute name for disable-processing before merge (`hx-disable`
  vs. any 4.0 rename) and pin a test to it.
