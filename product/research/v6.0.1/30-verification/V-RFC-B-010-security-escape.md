---
rfc: RFC-B-010
lens: security/escape
verdict: survives-with-changes
confidence: 0.78
killer_objection: null
required_changes:
  - "Correct the false security premise in §'Proposed API / fix' / §'Type-safety story': the RFC asserts the Id's raw `.id` is 'already constrained to ID-safe characters by defineIds'. It is NOT — `createId`/`defineIds` (src/ids.ts:45-115) store the name verbatim with ZERO runtime validation and ZERO throw. The escape guarantee actually rests on the renderer's `escapeAttr` choke point (serialize.ts:239/241/257), not on Id sanitization. Restate the rationale to credit `escapeAttr` (covers the `id`, `class`, and schema-key `command`/`commandfor`/`popovertarget` attributes alike) instead of a non-existent `defineIds` constraint, so future authors don't build on a guarantee that isn't there."
  - "Add an escape/breakout test to the RFC's test plan: an Id whose `.id` contains HTML-special and CSS-grammar chars (e.g. `\"x] ;color:red[ &<>` ) driven through `setPopovertarget`/`setCommandfor`/`anchorName`/`positionAnchor` must render with all of `\"<>&'` entity-escaped in BOTH the `class=\"…\"` and the attribute outputs — pinning that the new sinks ride the existing `escapeAttr` path and cannot break out of the double-quoted attribute."
---

# Verdict: RFC-B-010 — security/escape lens

> Adversary review. Goal: KILL the RFC on an XSS / escape-by-default regression. Default reject under uncertainty.

## Attack

The RFC adds three new value sinks. Each was probed for an escape regression:

- **Failure mode 1 — schema-key attribute injection (`command` / `commandfor` / `popovertarget`).**
  These serialize via the schema-key loop in `buildAttrs` (serialize.ts:245-260), which wraps every value in `escapeAttr(...)` and double-quotes it. `commandfor`/`popovertarget` take an `Id` (raw `.id`), `command` is a closed `CommandFor` union with a `` `--${string}` `` arm. The `` `--${string}` `` arm admits arbitrary tail chars at the type level, and an `Id` carries an unvalidated string — BUT both land in a double-quoted attribute that is `escapeAttr`'d, so `"<>&'` are neutralized. No HTML breakout. **No regression.**

- **Failure mode 2 — CSS-context injection via the anchor class emitters (`anchorName`/`positionAnchor`).**
  These emit `[anchor-name:--<id.id>]` / `[position-anchor:--<id.id>]` into `this.class` via `addClass`. The whole class string is `escapeAttr`'d at render (serialize.ts:241). CSS-grammar chars (`]` `;` `{` `}` `:`) are not HTML-special, so they survive into the `class="…"` value — but a class *name* is never evaluated as CSS by the browser. The real CSS is produced at Tailwind BUILD time by scanning source, not from rendered HTML, so a runtime-tainted Id never reaches the CSS compiler. This is the exact trust model of every existing arbitrary-value method (`.textSize("[13px]")`). **No new runtime CSS-injection sink.**

- **Failure mode 3 — the load-bearing FALSE security claim.**
  The RFC justifies escape-by-default partly on "[the Id] is already constrained to ID-safe characters by `defineIds`." This is factually wrong: `createId`/`defineIds` (src/ids.ts:45-115) do no validation and never throw; the type-safety test only checks shape, not chars. The claim is not what actually saves the design — `escapeAttr` does. Shipping a security rationale that misattributes the guarantee is the strongest objection this lens has, but it is a rationale defect, not an exploit: the renderer backstops it. So it downgrades to a required correction, not a kill.

## Does it survive?

**survives-with-changes (0.78).** The escape-by-default guardrail is NOT regressed. Every new value rides the existing single `escapeAttr` choke point (attributes) or is build-time-resolved (classes), and the RFC even *removes* a JS-emitting sink (the `openDialog`/`closeDialog` `.showModal()`/`.close()` snippets), shrinking the nonce/CSP surface — a net security win. The only thing wrong is a false premise in the prose ("constrained by `defineIds`") that must be corrected so the real guarantee (`escapeAttr`) is documented and future code isn't built on a phantom invariant, plus an explicit breakout test pinning the new sinks to that escape path. Neither change touches the API shape, so the 6.1.0-additive contract is unaffected.

## Guardrail check (this lens owns escape-by-default)

`security/escape` CONFIRMS no XSS regression: `command`/`commandfor`/`popovertarget` serialize through `escapeAttr` (serialize.ts:257); `anchorName`/`positionAnchor`/`positionArea` emit inert build-time class tokens through the `escapeAttr`'d `class` attribute (serialize.ts:241); no new `hx-on:*`/JS string is generated (the RFC deletes JS, reducing the nonce surface); the event-handler block (`EVENT_HANDLER_RE`, tag.ts:37) and proto-pollution guard are untouched. PASS, contingent on the two required_changes (correct the rationale + add the breakout test).
