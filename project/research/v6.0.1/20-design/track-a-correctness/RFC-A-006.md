---
id: RFC-A-006
track: A
title: Close three escape/injection holes — hx-preload string, dynamic data-* keys, and the script double-escaped break-out state
resolves: [F-A-120, F-A-122, F-A-900]
api_surface: []
breaking: false
ships_to: 6.0.1
guardrails_checked: [zero-deps, ssr-only, escape-by-default, type-safety, additive-only, instruction-set, class-vocab-sync, guideline-sync]
guideline_updates: [web-development/fluent-html.md, web-development/htmx.md]
impact: high
effort: M
depends_on: []
status: proposed
---

# RFC-A-006: Close three escape/injection holes — hx-preload string, dynamic data-* keys, and the script double-escaped break-out state

## Problem

Three independent break-out holes survived into v6.0.0. Each lets attacker-controlled data escape the context the serializer believes it is in. All three are pure serialization/validation bugs: the public types and method shapes are already correct, the runtime just fails to honor them on one branch.

### F-A-120 — `hx-preload` string value emitted UNescaped

Every other string-valued HTMX attribute routes through `escapeAttr` (see the `str`/`boolOrStr`/`jsonOrStr` helpers, `src/render/serialize.ts:113`–`140`). The `preload` special-case does not:

```ts
// src/render/serialize.ts:187–191
if (htmx.preload !== undefined) {
  result += typeof htmx.preload === 'string'
    ? ' hx-preload="' + htmx.preload + '"'   // ← raw concat, no escapeAttr
    : ' hx-preload';
}
```

The type is `'mousedown' | 'mouseover' | boolean` (`src/htmx.ts:252`), so a well-typed caller is safe. But an untyped caller (`as any`, JS, a value widened to `string`) can pass `mouseover" onload="alert(1)` and break out of the attribute — exactly the untyped-caller threat model the `hx-status` and `.toggle()` guards already defend against in the same file (`serialize.ts:199`, `:284`). This is the only string HTMX attribute that skips `escapeAttr`.

### F-A-122 — `setDataAttrs` skips key validation (attribute-name injection)

`setAria` runs its computed key through `validateAttributeKey` before storing it (`src/core/tag.ts:365`). `setDataAttrs` does not — it kebab-cases the key and writes it straight into the attribute bag (`src/core/tag.ts:305`–`309`):

```ts
setDataAttrs(attrs: Record<string, string>): this {
  if (this.attributes === EMPTY_ATTRS) this.attributes = Object.create(null) as Record<string, string>;
  for (const [key, value] of Object.entries(attrs)) {
    this.attributes[`data-${kebabCase(key)}`] = value;   // ← key never validated
  }
  return this;
}
```

`kebabCase` only lowercases `[A-Z]` (`src/core/tag.ts:24`–`28`); it does not strip quotes, spaces, or `=`. The value is escaped at emit time (`serialize.ts:269`) but the **key is concatenated raw** (`serialize.ts:269`: `' ' + key + '="'`). A dynamic key such as `x" onmouseover="alert(1)` becomes `data-x" onmouseover="alert(1)="..."` — a smuggled event handler. `Record<string, string>` does not constrain the key, so this is reachable from fully type-checked code with a runtime-derived key.

### F-A-900 — `sanitizeRawContent` only guards `</script`; the HTML "double-escaped" state defeats it

Inside a `<script>` body the serializer neutralizes `</script` (`src/render/serialize.ts:223`, `:227`–`229`):

```ts
const SCRIPT_CLOSE_RE = /<\/script/gi;
export function sanitizeRawContent(content: string, element: 'script' | 'style'): string {
  if (element === 'script') {
    return content.replace(SCRIPT_CLOSE_RE, '<\\/script');  // ← only the closer
  }
  return content.replace(STYLE_CLOSE_RE, '<\\/style');
}
```

The HTML tokenizer has a **script-data-double-escaped** state: an `<!--<script` opener inside script data flips the parser so that a subsequent `</script>` no longer ends the element, and a *second* `</script>` is needed. An attacker who controls part of a `<script>` body can emit `<!--<script>` to enter that state; the lone `</script` guard then mis-counts the closers and the page's real `</script>` is swallowed, letting the attacker's trailing markup run as script. The current guard escapes the closer but never the **openers** (`<!--`, `<script`) that arm the state — so the break-out is reachable even with the guard active. The covering test (`test/stream.test.ts:226`) only exercises the simple `</script>` case.

## Proposed API / fix

No public symbol changes. Three internal corrections, each making the runtime match the contract the types already promise.

```ts
// ── F-A-120: route the hx-preload string branch through escapeAttr (serialize.ts) ──
if (htmx.preload !== undefined) {
  result += typeof htmx.preload === 'string'
    ? ' hx-preload="' + escapeAttr(htmx.preload) + '"'   // was: raw concat
    : ' hx-preload';
}

// ── F-A-122: validate the computed data-* key, exactly like setAria (core/tag.ts) ──
setDataAttrs(attrs: Record<string, string>): this {
  if (this.attributes === EMPTY_ATTRS) this.attributes = Object.create(null) as Record<string, string>;
  for (const [key, value] of Object.entries(attrs)) {
    const attrKey = `data-${kebabCase(key)}`;
    validateAttributeKey(attrKey);                        // NEW — mirrors setAria (tag.ts:365)
    this.attributes[attrKey] = value;
  }
  return this;
}

// ── F-A-900: neutralize the state-arming openers, not only the closer (serialize.ts) ──
const SCRIPT_CLOSE_RE  = /<\/script/gi;
const SCRIPT_OPENER_RE = /<!--|<script/gi;   // NEW: <!-- and the bare <script opener
const STYLE_CLOSE_RE   = /<\/style/gi;

export function sanitizeRawContent(content: string, element: 'script' | 'style'): string {
  if (element === 'script') {
    return content
      .replace(SCRIPT_OPENER_RE, (m) => '<\\' + m.slice(1))  // <!-- → <\!--, <script → <\script
      .replace(SCRIPT_CLOSE_RE, '<\\/script');               // </script → <\/script (unchanged)
  }
  return content.replace(STYLE_CLOSE_RE, '<\\/style');
}
```

The backslash insertion is the same neutralization technique already used for `</script` — a `\` before the `/` or before the opener's first letter is a no-op inside a JS string/regex/comment but breaks the HTML tokenizer's literal `<!--`/`<script`/`</script` match, so the parser never enters (or exits) the double-escaped state on attacker input. `<style>` is unaffected: the double-escaped state is script-specific.

`validateAttributeKey` (`src/core/tag.ts:30`) already rejects `__proto__`/`constructor`/`prototype`, keys failing `^[a-zA-Z_][a-zA-Z0-9\-_:.]*$`, and `on*` handler names — so `setDataAttrs` inherits prototype-pollution and event-handler defenses for free, identical to `setAria`/`addAttribute`.

## Worked examples (before → after)

```ts
// ── F-A-120 ──────────────────────────────────────────────────────────────
// before (v6.0.0): untyped caller breaks out of the hx-preload attribute
render(Div().setHtmx(hx("/p", { preload: 'mouseover" onload="alert(1)' as any })))
// → <div hx-get="/p" hx-preload="mouseover" onload="alert(1)"></div>   ← injected handler
```
```ts
// after (this RFC): value is attribute-escaped like every other string attr
// → <div hx-get="/p" hx-preload="mouseover&quot; onload=&quot;alert(1)"></div>
//   (the well-typed preload: "mouseover" path is byte-identical to today)
```

```ts
// ── F-A-122 ──────────────────────────────────────────────────────────────
// before (v6.0.0): a runtime-derived key injects an attribute name
render(Div().setDataAttrs({ ['x" onmouseover="alert(1)']: "v" }))
// → <div data-x" onmouseover="alert(1)="v"></div>                       ← smuggled handler
```
```ts
// after (this RFC): the computed key is validated → throws, like setAria
render(Div().setDataAttrs({ ['x" onmouseover="alert(1)']: "v" }))
// → throws: Invalid attribute key: "data-x" onmouseover="alert(1)"
// well-formed keys are unchanged:
render(Div().setDataAttrs({ userId: "123" }))  // → <div data-user-id="123"></div>
```

```ts
// ── F-A-900 ──────────────────────────────────────────────────────────────
// before (v6.0.0): the opener arms the double-escaped state; the real </script>
// is swallowed and attacker markup after it runs
render(Script(`x = "<!--<script>"; /* attacker tail */`))
// → <script>x = "<!--<script>"; /* attacker tail */</script>           ← <!--<script> un-neutralized
```
```ts
// after (this RFC): both openers are neutralized, so the tokenizer never enters
// the double-escaped state and the closing </script> still terminates the element
render(Script(`x = "<!--<script>"; /* attacker tail */`))
// → <script>x = "<\!--<\script>"; /* attacker tail */</script>
//   benign script (no <!-- / <script / </script substrings) is byte-identical to today
```

## Type-safety story

The types are already correct for honest callers — these fixes harden the **untyped-caller** boundary, the same threat model the file already documents at `serialize.ts:170`–`172` and `:277`–`279`.

- `preload: 'mousedown' | 'mouseover' | boolean` already blocks the attack at compile time; the runtime now matches that contract for `as any`/JS callers.
- `setDataAttrs(attrs: Record<string, string>)` — `Record<string, string>` deliberately cannot enumerate every safe key, so a *value-level* guard (`validateAttributeKey`) is the correct mechanism, exactly as `setAria` already chose. No type change can express "any string except markup-breaking ones," so this stays a runtime invariant — but a **converging** one (one validation choke point shared by `addAttribute`/`setAria`/`setDataAttrs`).
- `sanitizeRawContent` is `@internal` and operates on `string` script bodies that are intentionally un-typed (raw JS) — there is no literal union to add; correctness lives in the serializer.

No `string` is widened and no new union is introduced, so guardrail 4 (no bare `string` where a literal union fits) is untouched.

## Compatibility & version

- **6.0.1 (patch):** All three are behavior fixes with **no public-shape change** — `api_surface: []`.
  - Output changes **only** for inputs that are already malformed/malicious: `hx-preload` strings containing `&"'<>` (now escaped, strictly more correct — and unreachable from the typed `'mousedown' | 'mouseover'` set); `setDataAttrs` keys that fail `validateAttributeKey` (now throw instead of silently emitting injectable markup, matching `setAria`/`addAttribute`); `<script>` bodies containing `<!--`/`<script` (now neutralized). Benign, well-typed inputs are **byte-identical**.
  - The new `setDataAttrs` throw is the same failure mode `addAttribute`/`setAria` already have for bad keys; it converts a silent XSS into a loud, fail-fast error — acceptable for a security patch and consistent with the existing surface.
- **6.1.0 (minor):** N/A — nothing additive.
- **parked-major:** N/A — no break required.

## Guidelines impact

The public surface is unchanged, so guideline edits are clarifying notes that reinforce existing rules (untyped escape hatches keep their escaping; dynamic `data-*` keys must be static-ish). Required because the threat-model note is new guidance.

- **Index (`web-development/CLAUDE.md`):** no new rule — the existing "All text content is automatically XSS-escaped" line already covers honest callers. No edit.
- **Topic ref (`web-development/fluent-html.md`):** add a short note under the escaping section.
- **Topic ref (`web-development/htmx.md`):** add a one-line ✓/✗ for `preload` strings.

`web-development/fluent-html.md` — insert after the XSS-escape intro (around line 3):

```md
<!-- setDataAttrs: keys are validated like any attribute name -->
Button("Save").setDataAttrs({ userId: id })          // ✓ data-user-id — key kebab-cased + validated
Button("Save").setDataAttrs({ [userInput]: v })      // ✗ a runtime/user-derived data-* KEY throws (attribute-name injection guard)
// values are always escaped; the KEY must be a static, well-formed name (same guard as .addAttribute/.setAria)
```

`web-development/htmx.md` — add to the attribute notes:

```md
<!-- hx-preload string values are attribute-escaped like every hx-* string -->
A("Page").setHtmx(hx("/p", { preload: "mouseover" }))   // ✓ typed: "mousedown" | "mouseover" | true
// never widen preload to a runtime string — the value is escaped, but keep it inside the typed union
```

- **Lib-own docs:**
  - **JSDoc** — `setDataAttrs` (`src/core/tag.ts:291`): add a line — `Keys are validated (same guard as setAria/addAttribute); a markup-breaking key throws.` And on `sanitizeRawContent` (`serialize.ts:226`): note it neutralizes the `<!--`/`<script` openers as well as `</script`, blocking the double-escaped break-out.
  - **CHANGELOG** — add a `## [6.0.1]` section above `## [6.0.0]`:

```md
## [6.0.1] - Security patch

### 🔒 Fixes

- **hx-preload** string values are now attribute-escaped, like every other `hx-*` string attribute (closes an attribute break-out reachable from untyped callers).
- **setDataAttrs** now validates the computed `data-*` key (prototype-pollution / attribute-name / `on*`-handler guard), matching `setAria` and `addAttribute`. A markup-breaking key throws instead of emitting injectable HTML.
- **Script serialization** now neutralizes the `<!--` and `<script` openers in addition to `</script`, blocking the HTML "double-escaped" break-out state where the page's real `</script>` could be swallowed.
```

## Guardrail check

- **zero-deps:** pass — no new imports; reuses `escapeAttr` and `validateAttributeKey`.
- **ssr-only:** pass — serializer/validation only, synchronous, no async added.
- **escape-by-default:** pass — closes three holes; strictly more escaping/validation.
- **type-safety:** pass — no bare `string` introduced; types already correct, runtime now honors them.
- **additive-only:** pass — `api_surface: []`, no public shape change; output differs only for malformed/malicious input.
- **instruction-set:** pass — no new component; pure hardening of existing primitives.
- **class-vocab-sync:** N/A — emits no classes; tailwind-extractor + eslint-plugin untouched.
- **guideline-sync:** pass — Guidelines impact covers the (notes-only) surface; `api_surface` is empty so no symbol is left undocumented.

### Tests (house style, append to `test/security.test.ts`)

```ts
describe("hx-preload string injection prevention (F-A-120)", () => {
  it("escapes a preload string crafted to break out of the attribute", () => {
    const evil = 'mouseover" onload="alert(1)';
    const html = render(Div().setHtmx(hx("/p", { preload: evil as never })));
    assert.ok(!html.includes('" onload="'), html);
    assert.ok(html.includes("hx-preload=\"mouseover&quot; onload=&quot;alert(1)\""), html);
  });
  it("leaves a typed preload value byte-identical", () => {
    assert.equal(render(Div().setHtmx(hx("/p", { preload: "mouseover" }))), '<div hx-get="/p" hx-preload="mouseover"></div>');
  });
});

describe("setDataAttrs key injection prevention (F-A-122)", () => {
  it("throws on a data-* key that would break out of the tag", () => {
    assert.throws(() => render(Div().setDataAttrs({ ['x" onmouseover="alert(1)']: "v" } as never)), /Invalid attribute key/);
  });
  it("rejects a prototype-pollution data-* key", () => {
    assert.throws(() => Div().setDataAttrs({ ['__proto__']: "v" } as never), /prototype pollution/);
  });
  it("emits a well-formed key unchanged", () => {
    assert.equal(render(Div().setDataAttrs({ userId: "123" })), '<div data-user-id="123"></div>');
  });
});

describe("script double-escaped break-out prevention (F-A-900)", () => {
  it("neutralizes the <!--<script opener that arms the double-escaped state", () => {
    const html = render(Script(`a = "<!--<script>"; b()`));
    assert.ok(!html.includes("<!--<script>"), html);
    assert.ok(html.includes("<\\!--<\\script>"), html);
  });
  it("still neutralizes a bare </script closer", () => {
    assert.ok(!render(Script("x='</script>'")).includes("</script>'"));
  });
  it("leaves benign script byte-identical", () => {
    assert.equal(render(Script("if (x < 10 && y > 5) return;")), "<script>if (x < 10 && y > 5) return;</script>");
  });
});
```

## Alternatives considered

- **F-A-120: drop the `preload` special-case and route it through the `HTMX_ATTRS` table** (a `boolOrStr('preload')` entry). Rejected for a patch: `boolOrStr` emits `hx-preload="true"` for the boolean case, whereas the shipped contract is the bare `hx-preload` flag (`test/htmx.test.ts:156`). Changing that is a public-output change; the minimal `escapeAttr` wrap preserves it exactly. The table refactor is a fine 6.1.0 cleanup, not a security patch.
- **F-A-122: type the key as a literal union.** No finite union can express "any HTML-safe attribute name," and `data-*` keys are legitimately dynamic (test ids, etc.). The value-level guard is what `setAria` already chose — converge on it rather than invent a second mechanism.
- **F-A-900: strip the openers entirely (delete `<!--`/`<script`).** Rejected — deletion changes the script's meaning; backslash-neutralization is a no-op for the JS engine while breaking the HTML tokenizer match, matching the existing `</script` treatment (least-surprise, byte-reversible by the reader).
- **F-A-900: HTML-comment-encode the whole body.** Over-broad; would corrupt legitimate `<!--` in regexes/strings beyond what's needed and diverge from the targeted closer guard.

## Open questions

- **F-A-122 throw vs. silent-drop:** this RFC throws (matches `addAttribute`/`setAria`). If product prefers a non-throwing posture for `setDataAttrs` specifically, the alternative is to skip the offending key — but that hides a likely bug and diverges from the sibling setters. Recommendation: throw. Decision for a human only if the throw is considered too aggressive for a patch.
