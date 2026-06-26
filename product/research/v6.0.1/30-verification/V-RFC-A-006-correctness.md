---
rfc: RFC-A-006
lens: correctness
verdict: survives-with-changes
confidence: 0.82
killer_objection: The F-A-900 fix corrupts benign script bodies — `<\script` and `<\!--` are NOT no-ops for the JS engine, breaking the RFC's "byte-identical benign script" guarantee in at least three reachable cases.
required_changes:
  - "F-A-900: replace the opener-backslash neutralization with a JS-safe technique. Backslash insertion is the wrong tool for script-data — verified below it produces invalid JS / changed semantics on benign input."
  - "F-A-900: fix the worked example and the `<!--<script` test, which assert the broken `<\\!--<\\script>` output."
  - "F-A-122: drop or correct the false 'inherits prototype-pollution defense for free' claim (RFC line 110) and the broken proto-pollution test — the `data-` prefix means PROTO_KEYS never matches `data-__proto__`, so it does NOT throw `/prototype pollution/`."
file: /Users/tony/jt-digital/fluent-html/product/research/v6.0.1/30-verification/V-RFC-A-006-correctness.md
---

# Verdict: RFC-A-006 — correctness lens

> Adversary posture: kill the RFC; default to reject under uncertainty.

The RFC bundles three independent fixes. F-A-120 and F-A-122 are runtime-correct
(F-A-122 closes a real attribute-name-injection hole). **F-A-900 is broken** and,
as written, would regress benign output and ship failing tests. The bundle cannot
ship as-is, but the holes are real and two of three fixes are sound — hence
survives-with-changes, not reject. The correctness lens does not get to dictate
*which* technique fixes F-A-900, only that the shipped one is wrong.

## Attack

### Killer — F-A-900: the neutralization corrupts benign scripts (claim is false)

The RFC's load-bearing claim (line 108, 152): the backslash insertion is "a no-op
inside a JS string/regex/comment ... benign script ... is byte-identical to today."
This is **false**. `<script>` bodies are arbitrary JS, not just strings/comments.
Verified (node):

1. **Regex literal `/<script/` → `/<\script/`.** `\s` is the regex whitespace
   metacharacter, so the pattern's meaning changes: `/<\script/.test("a<script")`
   is now `false` (was `true`); it instead matches `< ` + whitespace + `cript`.
   `.source` differs. A benign inline sanitizer/parser/template-tool shipping
   `/<script/` is silently corrupted. (escape-by-default / additive-only violation:
   output differs for *benign, well-typed* input, not just malicious input.)

2. **`<!--` is a legal JS line comment (Annex B HTML-like comments).** `<\!--`
   is a **syntax error** (`<` `\` `!` ... in expression position — "Invalid or
   unexpected token", verified). A benign script using the legacy `<!--`/`-->`
   guard idiom is turned into un-parseable JS.

3. **Bare comparison `if (count<scripts)`.** Valid JS (`count < scripts`). The
   opener regex matches `<script` as a substring of `<scripts`, yielding
   `count<\scripts` — a **syntax error** (stray backslash in expression position).

So the fix can convert working pages into broken ones for inputs that contain none
of the actual break-out markup. That is a correctness regression strictly worse,
on the likelihood axis, than the obscure script-data-double-escaped threat it
closes (which requires the author to already be emitting attacker-controlled raw JS
into a `<script>` body — itself the documented "untyped/raw escape hatch" zone).
The RFC's own worked example (line 151) and the `<!--<script` test (lines 251-255)
assert this broken `<\!--<\script>` output, so they encode the regression as the
expected result.

### Secondary — F-A-122: the prototype-pollution claim and test are wrong

RFC line 110: "`setDataAttrs` inherits prototype-pollution ... defenses for free."
The key passed to `validateAttributeKey` is `data-${kebabCase(key)}`, so for input
`__proto__` the validated key is `data-__proto__`. `PROTO_KEYS.has("data-__proto__")`
is `false` → it does **not** throw `/prototype pollution/`; it passes and emits
`data-__proto__="v"`. Verified. The proto-pollution test (RFC lines 242-244) will
**fail in CI**. (The emitted attribute is harmless — `attributes` is null-prototype
`Object.create(null)`, and `data-__proto__` is an inert HTML attribute name — so
this is an overstated claim + a broken test, not a security hole. The core
attribute-injection guard via `VALID_ATTR_KEY` does work: `x" onmouseover=...`
throws correctly.)

### What holds up

- **F-A-120** (route `hx-preload` string through `escapeAttr`): correct, minimal,
  byte-identical for the typed `"mousedown"|"mouseover"` set; matches every other
  `str` attr. No objection.
- **F-A-122 core** (validate the computed `data-*` key): closes a genuine
  attribute-name-injection reachable from `Record<string,string>` with a runtime
  key. Correct mechanism (value-level guard, converges with `setAria`). Only the
  proto-pollution sub-claim/test are wrong.

## Does it survive?

**survives-with-changes (confidence 0.82).** The three holes are real and worth
patching, and two fixes are sound, so a blanket reject would throw out correct
security work. But F-A-900 as written ships a benign-input regression and the
bundle ships two broken tests — it cannot land unchanged.

Required changes (fold back into the RFC):

1. **F-A-900 — replace the opener-backslash technique.** Backslash insertion is
   safe for `</script` (the `\` lands before `/`, and `</script>` is never valid JS
   so there is nothing to corrupt) but is **not** safe before `!`/`script` in live
   code. Use a JS-string-safe transform that breaks the HTML tokenizer's literal
   `<!--`/`<script` match without changing JS semantics — e.g. for these openers
   emit them only when the author content is treated as raw, OR neutralize by
   inserting the break *after* `<` as an HTML-comment-invisible but JS-equivalent
   sequence. The reviewer-supplied direction: do not assume a single backslash is a
   universal no-op; prove byte-equivalence on `/(<script)/`, `<!--`-comment, and
   `a<scripts` before claiming "benign byte-identical." If no transform satisfies
   "byte-identical benign JS" for a patch, F-A-900 is a parked/major-scoped change
   (or must be reframed as a documented breaking output change), not a 6.0.1 patch.
2. **F-A-900 — fix the worked example (line 151) and the `<!--<script` test** to the
   corrected output once the technique changes.
3. **F-A-122 — remove the false "free prototype-pollution defense" claim (line 110)
   and the proto-pollution test (lines 242-244)**, or move the proto-key check
   ahead of the `data-` prefixing if a proto guard is actually desired (note:
   `data-__proto__` is inert, so the guard is cosmetic — recommend just dropping
   the claim/test). The real value-injection test stays.

F-A-120 may ship unchanged.

## Guardrail check (correctness owns: does the runtime honor the contract on every branch?)

- F-A-120: PASS — runtime now matches the type contract; no regression.
- F-A-122 core: PASS — closes the branch where a runtime-derived key bypassed
  validation. Proto sub-claim: FAIL (overstated + broken test).
- F-A-900: FAIL — the fix introduces a *new* incorrect branch (benign JS containing
  `/<script/`, `<!--`, or `<scripts`-style comparisons is mis-serialized into
  invalid/semantically-changed JS), violating the "benign byte-identical"
  guarantee the RFC itself asserts and the additive-only/escape-by-default posture.
