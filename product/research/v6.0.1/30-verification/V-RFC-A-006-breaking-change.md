---
rfc: RFC-A-006
lens: breaking-change
verdict: survives-with-changes
confidence: 0.72
killer_objection: null
required_changes:
  - "CHANGELOG/JSDoc must state the F-A-900 backslash-neutralization is NOT semantics-preserving for script bodies that contain a bare `<script` substring inside a regex literal (`/<script/` → `/<\\script/` changes meaning, since `\\s` is the regex whitespace class). The RFC's 'no-op for the JS engine' claim (line 269) is false for that case. Scope the byte-identity guarantee in docs to bodies with NO `<!--`/`<script`/`</script` substrings (as already worded in the spec) and drop the over-broad 'no-op for the JS engine' justification."
  - "Add a regression test asserting that a benign script body containing `<script` as a substring outside a string (e.g. a regex literal) still terminates the element correctly, documenting the accepted output delta — so the behavior change for that input class is intentional and covered, not silent."
file: /Users/tony/jt-digital/fluent-html/product/research/v6.0.1/30-verification/V-RFC-A-006-breaking-change.md
---

# Verdict: RFC-A-006 — breaking-change lens

> Adversary task: kill this 6.0.1 patch if it changes any public shape or breaks any currently-valid, documented behavior. A patch that changes a public shape FAILS and must be forced to parked-major.

## Attack

I pressed three angles for a smuggled break.

- **Public-shape break (the lane-check killer):** None found. All three fixes touch internals only.
  - F-A-120 edits a literal-concat branch inside `buildHtmx`; no signature, no type.
  - F-A-122 adds a `validateAttributeKey(attrKey)` call inside `setDataAttrs`; the signature `setDataAttrs(attrs: Record<string, string>): this` is untouched.
  - F-A-900 edits `sanitizeRawContent` (marked `@internal`, `serialize.ts:226`); signature unchanged.
  `api_surface: []` is accurate. No exported symbol, type, union, or method shape changes. The lane-check does not fire.

- **Silent break of currently-valid behavior #1 (F-A-120 escape):** The typed contract is `'mousedown' | 'mouseover' | boolean` (`htmx.ts:252`). `escapeAttr` is a no-op for those values (no `&"'<>`), and the shipped tests at `htmx.test.ts:156`/`:158`/`:160` (`hx-preload`, `hx-preload="mouseover"`, `hx-preload="mousedown"`) stay byte-identical. Output changes ONLY for `&"'<>`-bearing strings — unreachable from the typed union and malicious by construction. No valid behavior broken.

- **Silent break of currently-valid behavior #2 (F-A-122 throw):** This is the change from "silently emit" to "throw," which IS a behavior change for a class of currently-accepted inputs. I checked whether any *legitimate* input newly throws. The key is always validated AFTER `data-` prefixing, so:
  - the leading-char rule (`^[a-zA-Z_]`) can never fire — the prefixed key always starts with `d`;
  - `EVENT_HANDLER_RE` (`^on`) can never fire — the key starts with `data-`;
  - `PROTO_KEYS` (`__proto__`/`constructor`/`prototype`) can never fire — `data-__proto__` is not in the set.
  The ONLY keys that now throw are those carrying quotes/spaces/`=`/`<>` (i.e. attribute-name injection). The documented examples (`testid`, `userId`, `actionType` — `patterns.ts:30`) and all kebab-cased names pass unchanged. So no *valid* `setDataAttrs` call newly throws. The throw is confined to malformed/malicious keys — acceptable for a security patch and consistent with the sibling `setAria`/`addAttribute`/`.toggle()`/`hx-status` guards that already throw in the same way.

- **Silent break of currently-valid behavior #3 (F-A-900 — the strongest hit):** The fix backslash-neutralizes `<!--` and `<script` openers. The RFC justifies this (line 108, line 269) as "a no-op for the JS engine." That justification is **wrong for one input class**: a bare `<script` substring inside a **regex literal**. `/<script/` becomes `/<\script/`, and `\s` is the regex whitespace metaclass — so the regex's *meaning* changes (matches `<`+whitespace, not `<script`). Inside JS *string* literals the backslash is correctly swallowed (`"<\!--"` === `"<!--"`, `"<\script"` === `"<script"`), so the string-literal case is genuinely benign; only the regex/identifier-adjacent case is corrupted. This is a real behavior delta for currently-valid, benign input.
  BUT, weighed through THIS lens: it triggers only when a script body literally contains the substring `<script` (not `</script`) — itself a latent break-out vector — and the RFC's *byte-identity guarantee is correctly scoped* ("benign script (no `<!--`/`<script`/`</script` substrings) is byte-identical"). It does not claim semantic preservation for bodies that DO contain those substrings. No public shape changes; the existing `stream.test.ts:222`/`:227` cases (`1 < 2`, `</script>`) stay green. The defect is in the RFC's *justification text*, not in the patch/minor lane discipline.

## Does it survive?

**survives-with-changes.** From the breaking-change lens the verdict is narrow: this RFC does not smuggle a public-shape break into a patch. `api_surface: []` holds, every exported symbol/type/signature is unchanged, every shipped test stays green, and the only output deltas land on malformed or markup-bearing inputs — exactly what a 6.0.1 security patch is licensed to change. It correctly stays in-lane; it does NOT need to be parked to a major.

It does not get a clean `survives` because the F-A-900 justification overclaims ("no-op for the JS engine"), which masks a genuine semantic delta for benign-but-regex script bodies. That is a documentation/test-coverage defect, not a lane violation, so it folds back as required changes rather than a reject:

1. Correct the JSDoc/CHANGELOG/RFC justification: backslash-neutralization is byte-preserving for bodies with no `<!--`/`<script`/`</script` substrings and value-preserving inside JS *string* literals, but it is NOT semantics-preserving inside regex literals (`/<script/` → `/<\script/`). Drop the blanket "no-op for the JS engine" claim.
2. Add a regression test for a benign `<script`-substring-in-regex body so the accepted output delta is intentional and covered, not silent.

(Both changes are documentation/test only — no code-shape impact, so they keep the patch in 6.0.1.)

## Guardrail check (breaking-change owns the lane-check)

- **Lane-check (6.0.1 = no public-shape change):** PASS. No exported symbol, type, union, or method signature changes. `setDataAttrs`/`buildHtmx`/`sanitizeRawContent` keep their shapes; `sanitizeRawContent` is `@internal`.
- **Currently-valid behavior preserved:** PASS for F-A-120 (typed union escape is a no-op) and F-A-122 (no legitimate prefixed key newly throws). QUALIFIED for F-A-900 (output/semantics delta limited to script bodies containing `<!--`/`<script`/`</script`, which the spec already scopes out of the byte-identity guarantee) — covered by the two required doc/test changes.
- **Additive-only / no break smuggled into a patch:** PASS. Nothing here requires a major; correctly stays `ships_to: 6.0.1`.
