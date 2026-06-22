---
rfc: RFC-C-05
lens: security/escape
verdict: survives-with-changes
confidence: 0.78
killer_objection: null
required_changes:
  - "State explicitly that `emitClasses`/`prefixOf` output is untrusted-input-free: vocab entries are author-authored compile-time constants, never derived from request data. Add a one-line invariant to the RFC forbidding any runtime value (request params, user input) from reaching `prefixOf()` or `emitClasses()` args — they take method-arg strings that today already flow into `addClass`, which is escaped at render via `escapeAttr`, but the RFC must assert this boundary so a future `kind` is not added that bypasses it."
  - "Constrain the codegen output sink. The `.generated.ts` files are git-tracked TypeScript executed at build time; the RFC must specify that codegen emits only string-literal class fragments via a serializer that rejects/escapes backticks, `${`, quotes, and newlines in any `prefix`/`class`/`bare`/`dirMap` value, so a malicious or typo'd vocab string cannot inject code into the generated module (build-time template-injection / arbitrary-code-in-generated-file)."
  - "Pin `TARGET`. The codegen reads `TARGET` from `build env` (RFC line 93). The RFC must specify TARGET is validated against the `TailwindTarget` literal union (`v3`|`v4`) and defaults deterministically; an unvalidated env string must not flow into generated class prefixes (env-controlled class string)."
  - "Revise the guideline edit so it does not normalize raw `addClass` of dynamic, interpolated Tailwind strings. The proposed fluent.md snippet contrasts `addClass(\"bg-linear-to-r\")` (a static literal) with the method form, but the broader v6 guideline must keep teaching `addClass` as a Raw-equivalent escape hatch whose argument must be a trusted static literal — never an interpolated/request-derived string — to avoid attribute-injection via the class attribute."
file: product/research/v6/30-verification/V-RFC-C-05-security-escape.md
---

# Verdict: RFC-C-05 — security/escape lens

> You are an ADVERSARY. Your job is to KILL this RFC through the security/escape lens.
> Default to `reject` under uncertainty.

## Attack

I tried to find an XSS/injection sink this RFC opens. The honest finding: **it emits no new markup-emitting path.** The vocab produces *class strings* that flow `emitClasses`/`prefixOf` → `addClass` → `tag.class` → `escapeAttr(tcls)` at render. I verified all three render backends escape the class attribute:

- `src/render/render.ts:204` — `attrs += ' class="' + escapeAttr(tcls) + '"'`
- `src/render/stream.ts:142` — same
- `src/fold/algebras/render.ts:12` — `class="${escapeAttr(attrs.class)}"`

So the runtime XSS surface is **unchanged** from today. The RFC self-classified §11.3 as "N/A — no markup emission changes," and that is correct for the render-time path. A pure-reject on runtime XSS would be dishonest.

But the lens is broader than runtime render. Three real failure modes survive scrutiny:

- **security/escape failure mode 1 — build-time code injection into a git-tracked, executed module.** This RFC's novelty is that it *generates TypeScript that is then compiled and executed* (`method-patterns.generated.ts`, `fixable-patterns.generated.ts`). The codegen interpolates vocab `prefix`/`bare`/`class`/`dirMap` strings into source. If codegen emits via naive template interpolation (the RFC shows ``addClass(`${prefixOf("gradientTo")}-${d}`)`` and ``buildMethodPatterns(classVocab, TARGET)`` without specifying the serializer), a vocab value containing a backtick, `${...}`, or `"` breaks out of the string literal and injects arbitrary code into a build-executed file. The blast radius is the build host, not the browser — but it is a real new sink the RFC does not address. The drift test (byte-identical comparison) does **not** catch this: both the generated file and the freshly-generated comparison would contain the same injected payload, so they match and CI stays green.

- **security/escape failure mode 2 — env-controlled class prefix.** `TARGET from build env, default "v4"` (line 93). An unvalidated env string flowing into `buildMethodPatterns`/`buildFixablePatterns` becomes part of generated class prefixes and the runtime `prefixOf` output. This is low-severity (build-time, operator-controlled) but it is exactly the kind of "string of unknown provenance reaches a class emitter" the escape lens must flag. The RFC must pin TARGET to the `TailwindTarget` union and reject anything else.

- **security/escape failure mode 3 — the guideline edit weakens the Raw-equivalent boundary.** The proposed `fluent-html.md` snippet (lines 186–189) frames `addClass("bg-linear-to-r")` purely as "invisible to the extractor," teaching the LLM reader that the *only* cost of `addClass` is missed extraction. That under-teaches the security contract: `addClass` is a Raw-equivalent escape hatch and its argument must be a **trusted static literal**. An LLM that internalizes "addClass is just unextracted" is one step from `addClass(\`text-${userColor}\`)` — an attribute-injection vector into the class attribute. Today the class value is escaped, so this is defense-in-depth, not a hole; but the RFC's own guideline change actively normalizes the wrong mental model around the one method that is the escape hatch. The escape-by-default guardrail (§11.3) owns "Raw-equivalents must be explicit" — the guideline must keep `addClass`'s static-literal expectation explicit, not bury it under an extraction footnote.

## Does it survive?

**Survives-with-changes.** The runtime escape contract is untouched and provably so (three escaped render paths). There is no browser-facing XSS regression. But the RFC introduces a new *build-time* code-emission path it leaves unspecified, threads an unvalidated env var into class strings, and ships a guideline edit that erodes the explicitness of the one Raw-equivalent escape hatch. None of these is a killer (all are build-time or defense-in-depth, the runtime render escapes regardless), so reject is too strong — but all four required changes fold cleanly back into the RFC and close the gaps. They are in the YAML `required_changes`.

## Guardrail check

- **§11.3 escape-by-default / no XSS regression:** confirmed at runtime — class strings from the vocab are escaped identically to today via `escapeAttr` in render, stream, and fold backends. No new runtime markup sink. The escape concerns are pushed to (a) the build-time codegen serializer and (b) the guideline's treatment of `addClass` as a Raw-equivalent — both addressed by the required changes. The RFC must not be read as license to interpolate untrusted data into class strings; required change #1 makes that boundary explicit.
