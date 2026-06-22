---
rfc: RFC-B-02
lens: security/escape
verdict: survives-with-changes
confidence: 0.83
killer_objection: "ToastContainer ships an inline <script> whose runtime safety the RFC asserts but never implements — and the one message channel it owns (HX-Trigger detail) is routinely populated with user-derived strings (filenames, search terms). The RFC defers the actual sink (textContent vs innerHTML, </script> breakout, \\u2028) to 'the security lens to confirm', meaning the only XSS-bearing path in the whole RFC is unspecified. An RFC whose escape story is a TODO cannot ship as-is."
required_changes:
  - "Specify the ToastContainer receiver script in full TS/JS, not prose. The render MUST insert the message via `node.textContent = detail.message` (or `document.createTextNode`), NEVER `innerHTML +=` or template-literal `innerHTML`. Add this as a normative, testable line in the RFC body, not an open question."
  - "Pin the script tag emission: the inline <script> body must be emitted as Raw/literal library-owned source with NO interpolation of any user or app value. `position`, `duration`, and `variant` are config — bake them in via `data-*` attributes on a container element (read with `dataset`/`getAttribute`) or a closed literal-union switch, never string-concatenated into the script source. State explicitly that the script contains zero `${...}` of non-constant data."
  - "Escape the `Id` interpolation in `el()` for the new openOverlay/closeOverlay (and the widened toggle/toggleClass) renderers. Today `el()` does `getElementById('${resolveId(value)}')` with NO escaping; the brand is compile-time only and `createId(userInput)` is legal at runtime, so a single quote in an id breaks out of the JS string. Route ALL id interpolation in behavior renderers through `escapeJs()` (as `clipboard` already does), or — better — fix `el()` once."
  - "Harden and reuse one escaper. `escapeJs` (behavior-methods.ts:85) only handles `\\` and `'` — it does NOT neutralize `</script>`, line separators (\\u2028/\\u2029), or `<!--`. Specify which escaper guards which sink: `hx-on:*` attribute snippets must additionally be HTML-attribute-escaped on emission (confirm `escapeAttr` runs on the `hx-on:` value at render); nothing user-derived enters a `<script>` element body at all."
  - "Document `toast(message)` as an ESCAPED text sink in the RFC and the guideline edit. Because messages are user-derived (the worked example is literally a filename: 'File uploaded' generalizes to 'File <user>.png uploaded'), the guideline must state the message renders as text. A rich/HTML toast, if ever wanted, must be an explicit separately-named Raw-equivalent — never an overload of the plain string path."
file: /Users/tony/jt-digital/fluent-html/product/research/v6/30-verification/V-RFC-B-02-security-escape.md
---

# Verdict: RFC-B-02 — security/escape lens

> You are an ADVERSARY. Your job is to KILL this RFC through the security/escape lens.
> Default to `reject` under uncertainty — a good API cut is cheaper than a bad API shipped.

## Attack

This RFC adds exactly one genuinely new markup-emitting, data-handling path — the `ToastContainer` inline `<script>` — and the RFC's own guardrail check (§11.3) outsources its safety to *this lens* with the words: *"Needs the `security/escape` lens to confirm `ToastContainer`'s DOM insertion uses `textContent`, not `innerHTML`."* That sentence is the whole case for rejection: **the RFC does not contain the code that determines whether it is safe.** It proposes a sink and a promise, not a sink and an implementation. Under default-reject, an unspecified XSS-bearing path is a rejection.

The danger is not hypothetical. The motivating examples make the toast message a **user-controlled** value:

- The worked example is a file-upload confirmation. Generalized, that message is `"File ${filename} uploaded"` — and `filename` is attacker-controlled. A file named `<img src=x onerror=alert(document.cookie)>.png` becomes the toast message.
- pps already added a free-form `type` payload; rideshare's "Link copied!" toast shows these strings are app-assembled. Real messages will carry user data.

So the toast `message` is a tainted string crossing a server→client trust boundary via `HX-Trigger` JSON, landing in a client-side render. Whether that render is XSS depends entirely on the unwritten script:

- **`element.innerHTML += message`** (the natural way to build a toast div) → reflected/stored XSS, account takeover via cookie theft. This is exactly how a careless ~20-line hand-rolled toast gets written, and the RFC hand-waves "~20 lines, library-owned" as if line count implied safety.
- **`element.textContent = message`** → safe. But the RFC nowhere mandates this; it merely *hopes* the lens confirms it.

**security/escape failure mode 1 — unspecified sink in the one new script.** The blessed `.toast()` path's safety is undefined. The RFC must *specify* `textContent`/`createTextNode` as normative and forbid `innerHTML`, in the RFC body — not park it in Open Questions.

**security/escape failure mode 2 — script-body / config interpolation.** `ToastContainer({ position, duration })` config must reach the client. If the implementation does the obvious `<script>const POS='${position}';const MS=${duration};…</script>`, then even though `position`/`duration` are typed, the *pattern* is a script-injection sink one refactor away from interpolating a non-literal — and a `</script>` sequence in any interpolated text closes the script element regardless of JS-string escaping (`escapeJs` does not touch `</script>`). Config must go via `data-*` attributes, with zero value concatenated into the `<script>` body.

**security/escape failure mode 3 — `el()` id interpolation has no escaping, and the RFC widens its blast radius.** The existing renderers build `document.getElementById('${resolveId(value)}')` with **no escaping** (behavior-methods.ts:42-44). The RFC's new `openOverlay`/`closeOverlay`/widened `toggle` all flow through this same `el()`. The defense offered is "`Id` is branded, from `defineIds`, not user input." That defense is **false at runtime**: the brand is compile-time only (ids.ts: *"brand is compile-time only"*), `createId(name: string)` and `defineIds([...])` apply **zero validation** to the name (ids.ts:45-52, 103-116), and nothing prevents `createId(req.query.tab)` or an id assembled from data. An id of `x');alert(1);('` breaks out of `getElementById('…')` and executes in the `hx-on:click` handler. The RFC inherits and multiplies an existing un-escaped interpolation instead of fixing it — and `clipboard` already proves the fix (`escapeJs(String(opts.value))`, behavior-methods.ts:61), so the omission is inconsistent, not defensible.

**security/escape failure mode 4 — `escapeJs` is too weak for any `<script>` context.** `escapeJs` (behavior-methods.ts:85) escapes only backslash and single-quote. It does NOT neutralize `</script>`, line/paragraph separators (` `/` `), or `<!--`. It is *adequate* for the single-quoted-JS-string-inside-an-HTML-attribute context the behaviors use today — but only IF the outer `hx-on:` value is additionally attribute-escaped on render, which the RFC never confirms. It is **not** adequate if any config path reaches a `<script>` element body. Name which escaper guards which sink and confirm the `hx-on:` attribute path is attribute-escaped.

## Does it survive?

**survives-with-changes.** The architecture is sound and *reduces* attack surface versus the status quo of 30 hand-rolled `addAttribute("hx-on:…", jsStringHelper(id))` sites with zero escaping. The RFC introduces no *new class* of vulnerability the codebase lacks; it inherits the existing un-escaped-id pattern and adds one new script sink whose safety is merely unspecified rather than demonstrably broken.

But "unspecified" is not "safe," and this lens owns the guardrail. It cannot pass as written: the safety-critical script is a TODO, the id interpolation is unescaped while the RFC's justification for that is factually wrong (compile-time brand ≠ runtime sanitization), and `escapeJs` is too weak for the contexts the RFC gestures at. The five `required_changes` make the escape story *normative and testable* instead of aspirational. With them folded in — `textContent`-only message rendering, zero interpolation into the `<script>` body (config via `data-*`), `escapeJs`/`escapeAttr` on every id in every behavior renderer, and `.toast()` documented as an escaped-text sink — the RFC carries no XSS regression and is a net security improvement. Hence survives-with-changes, not reject: the fixes are precise and local, not a redesign.

## Guardrail check (§11.3 escape-by-default; this lens owns it)

- **FAIL as written → PASS with required changes.** §11.3 requires "new APIs that emit markup must escape; `Raw`-equivalents must be explicit." `ToastContainer` emits a script that renders runtime, user-derived text via an *unspecified* DOM-insertion method — the escape obligation is unmet until `textContent` is mandated. The overlay/behavior additions emit `hx-on:` snippets that interpolate ids with no escaping; escape-by-default is violated for the id channel until those flow through `escapeJs`/`escapeAttr`.
- **Raw-equivalent explicitness:** plain `.toast(string)` must be a guaranteed text sink; any future HTML-bearing toast must be a separately named, explicit Raw-equivalent — never a silent overload (required-change #5).
- **Reuse the library's real escapers:** `escapeHtml`/`escapeAttr` are already exported (render/escape.ts, render/index.ts); a weak private `escapeJs` exists. The fix is to *use* them at the named sinks, not invent more — no new dependency, no §11.1 impact.
