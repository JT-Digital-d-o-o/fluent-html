---
rfc: RFC-A-08
lens: security/escape
verdict: survives-with-changes
confidence: 0.83
killer_objection: ".hxOn(event, js) writes hx-on:${event} directly into the attributes map, bypassing validateAttributeKey() that addAttribute() enforces; the attribute KEY is emitted unescaped at render.ts:222, so a `\"` in the event name breaks out of the attribute and injects arbitrary handlers (XSS). The new method is strictly LESS safe than the addAttribute it claims to supersede."
required_changes:
  - "Validate the event/attribute-name in the .hxOn runtime BEFORE writing it into the attributes map. Either call the existing validateAttributeKey on the full `hx-on:${event}` key (so it inherits PROTO_KEYS + VALID_ATTR_KEY + EVENT_HANDLER_RE checks), or reject any `event` not matching /^[a-zA-Z0-9:_.-]+$/ with a thrown error. This is mandatory — without it .hxOn is an attribute-name-injection XSS sink and a direct §11.3 violation."
  - "Drop the escapeJs `\\x3C` (`<` → `\\x3C`) addition, or justify it correctly. hx-on:* values are emitted as DOUBLE-QUOTED HTML attributes and already run through escapeAttr (= escapeHtml) at render.ts:226 / stream.ts:163, which entity-escapes `<` `>` `\"` `'`. The clipboard value cannot reach a raw `</script>` context via the hx-on path, so the `\\x3C` step is dead code that misrepresents the threat model. Keep the genuine fix (\\n \\r \\u2028 \\u2029) — those DO matter, see below."
  - "Correct the RFC's escapeJs rationale: the real bug is NOT HTML breakout (escapeAttr covers that) but JS-string-literal breakage. A newline inside navigator.clipboard.writeText('…') produces an unterminated single-quoted JS literal AFTER the browser entity-decodes the attribute and htmx evals it — a runtime SyntaxError / handler corruption, not an injected-markup XSS. Frame F-A-065 as a correctness/robustness fix, and note that escapeAttr is the actual XSS boundary for this context. \\u2028/\\u2029 escaping is required because htmx evals the decoded string as JS where they are line terminators."
  - "Resolve open question #1 (colon vs kebab) BEFORE locking, and add a dev-only assert in .hxOn that event contains no whitespace or quote, consistent with addAttribute's key validation — do not 'trust the typed surface', because (string & {}) makes the typed surface accept ANY string including `\" onload=\"...`. The open question already gestures at this; it must become a hard requirement, not a lean."
file: product/research/v6/30-verification/V-RFC-A-08-security-escape.md
---

# Verdict: RFC-A-08 — security/escape lens

> You are an ADVERSARY. Your job is to KILL this RFC through the security/escape lens.
> Default to `reject` under uncertainty — a good API cut is cheaper than a bad API shipped.

## Attack

### Failure mode 1 (KILLER) — `.hxOn` is an attribute-NAME injection sink; strictly less safe than the `addAttribute` it replaces

The RFC repeatedly sells `.hxOn` as "mirrors `.behavior()` exactly," "consistent with `addAttribute`," and the safe "sanctioned escape hatch." The security-relevant reality is the opposite. Trace the runtime (RFC §1):

```ts
(Tag.prototype as any).hxOn = function (event: string, js: string) {
  if (this.attributes === EMPTY_ATTRS) this.attributes = Object.create(null);
  const attr = `hx-on:${event}`;               // event is interpolated into the KEY
  this.attributes[attr] = existing ? existing + ";" + js : js;
  return this;
};
```

`event` is typed `HxOnEvent = … | (string & {})`, so **any string compiles**. It is written *as the attribute key*, then rendered:

```ts
// src/render/render.ts:218-228  (and identically src/render/stream.ts, src/fold/algebras/render.ts:16-20)
attrs += ' ' + key + '="' + escapeAttr(String(value)) + '"';   // ← KEY is NOT escaped; only the value is
```

The attribute **key** is concatenated raw. So:

```ts
Button("x").hxOn('click" onpointerover="alert(document.cookie)', "0")
// renders:  <button hx-on:click" onpointerover="alert(document.cookie)="0">…
```

A `"` in `event` closes the `hx-on:` attribute and injects a live `onpointerover` event handler — a textbook stored-XSS sink the moment any `event` value is derived from user/db input (and the `(string & {})` widening plus the "common DOM events" framing actively invites dynamic event names).

The damning part for this RFC's own thesis: the path it claims to supersede is **safer than the one it adds**. `addAttribute` routes through `validateAttributeKey` (`tag.ts:19`), which enforces `PROTO_KEYS`, `VALID_ATTR_KEY = /^[a-zA-Z_][a-zA-Z0-9\-_:.]*$/`, and `EVENT_HANDLER_RE`. Verified:

```
addAttribute("hx-on:x\" onload=\"alert(1)", …)  →  THROWS  (regex rejects space/quote)
.hxOn("x\" onload=\"alert(1)", …)                →  RENDERS  (no validation, key emitted raw)
```

`.hxOn` removes the only guard standing between an event string and the attribute name. That is a direct breach of guardrail §11.3 ("New APIs that emit markup must escape … no XSS regressions") and §11.6 (it does *not* in fact match `addAttribute`'s safety contract). A new markup-emitting path that is less safe than the old one is exactly what this lens exists to stop.

### Failure mode 2 — `escapeJs` change misdiagnoses the threat model; ships dead "security" code

The RFC adds `.replace(/</g, "\\x3C")` and labels it "neutralize `</script>` breakout in raw contexts." But `escapeJs` is only ever called inside the `clipboard` behavior renderer (`behavior-methods.ts:61`), whose output lands in `hx-on:click`, which the renderer emits as a **double-quoted HTML attribute** run through `escapeAttr` (= `escapeHtml`). `escapeHtml` already entity-escapes `<`, `>`, `"`, `'` (`escape.ts:11-28`). There is no raw/script context on the `hx-on:` path — `</script>` cannot break out, because `<` is already `&lt;` at the attribute layer. The `\x3C` step is dead code that misrepresents where the XSS boundary actually is (the boundary is `escapeAttr` at render time, not `escapeJs` at build time). Security code that defends a non-existent sink while the real one (failure mode 1) is wide open is worse than no code — it manufactures false assurance.

The *genuine* part of F-A-065 is real but mis-framed: a newline (or U+2028/U+2029) inside the single-quoted JS literal survives `escapeAttr` (those chars aren't HTML-escaped), gets entity-decoded by the browser, and then **htmx evals the decoded string as JS**, where a bare newline/LS/PS terminates the `'…'` literal → SyntaxError / handler corruption. That is a robustness/correctness bug, and the `\n \r    ` escapes fix it correctly. But it is not the XSS the RFC's prose implies, and the RFC must say so or a future maintainer will "optimize away" the wrong escape.

### Failure mode 3 — the two new behaviors are genuinely safe (the one place the RFC gets it right)

`formResetOnSwap`/`dismissOnEscape` take branded `Id`, routed through `el()` → `resolveId()` → `getElementById('<id>')`. `Id` is produced only by `defineIds`, so the interpolated value is a controlled token, not user input — zero string-interpolation XSS surface. This part survives cleanly and is the correct pattern; it is also the reason the RFC is salvageable rather than a reject (the dangerous capability is isolated to `.hxOn`, which is fixable).

## Does it survive?

**survives-with-changes** — confidence 0.83.

The core idea (a sanctioned, concatenating, typed `hx-on:` escape hatch + two branded-Id lifecycle behaviors + a real escapeJs robustness fix) is sound and worth the surface. But as written, `.hxOn` introduces an **attribute-name injection XSS that is strictly worse than the status quo** — a clean guardrail-§11.3 killer. Under the algorithm's default-reject-on-guardrail-killer posture this would escalate to reject; it earns survives-with-changes *only* because the fix is mechanical and local (one validation call in the `.hxOn` runtime) and the rest of the RFC is sound. The required changes are mandatory, not optional. If change #1 is not folded back in, this flips to `reject`.

Required changes (exact, fold back into RFC §1 and §3):

1. **Mandatory:** the `.hxOn` runtime must validate `event` before writing the key — either `validateAttributeKey(\`hx-on:${event}\`)` (preferred: inherits the existing PROTO/regex/event-handler guards) or an inline `if (!/^[a-zA-Z0-9:_.-]+$/.test(event)) throw …`. Without this, `.hxOn` is an XSS sink.
2. Remove the `\x3C` addition to `escapeJs` (or re-justify it against the actual emit context — it is dead on the `hx-on:` path because `escapeAttr` already entity-escapes `<`). Keep `\n \r    `.
3. Re-frame F-A-065 in the RFC: the XSS boundary for `hx-on:*` is `escapeAttr` at render time; `escapeJs` fixes JS-string-literal *robustness* (post-decode eval), not markup breakout. State this so the escapes aren't later removed as "redundant."
4. Promote open-question #2 to a hard requirement: dev-time assert/validate that `event` has no whitespace/quote — do NOT "trust the typed surface," because `(string & {})` accepts arbitrary strings including `" onload="…`.

## Guardrail check (this lens owns §11.3)

- **§11.3 escape-by-default — FAIL as written, PASS with change #1.** `.hxOn` emits an attribute whose *name* is unescaped and unvalidated → XSS regression vs. `addAttribute`. The two behaviors pass (branded `Id`). The `escapeJs` value fix is net-positive but mis-described and ships one dead escape. The attribute *value* path (`escapeAttr` in render.ts/stream.ts/renderAlgebra) is correct and unchanged — that boundary is fine; the gap is the *key*. Resolution requires the mandatory `.hxOn` event-name validation above.
