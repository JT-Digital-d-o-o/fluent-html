---
rfc: RFC-A-01
lens: security/escape
verdict: survives-with-changes
confidence: 0.78
killer_objection: "The RFC elevates `.toggle()` to 'the one path' for boolean attributes and funnels frozen-app codemods + ESLint auto-fix onto it, but `.toggle(name)` accepts `(string & {})` and its render sink `toggles.join(' ')` (render.ts:234, stream.ts:172, fold/algebras/render.ts:45) emits the name with ZERO escaping. A toggle name derived from request data injects a tag-breakout XSS — and the RFC's §11.3 guardrail check falsely certifies 'no user value interpolated.'"
required_changes:
  - "Escape or validate the `toggles` render sink in all THREE serializers — render.ts:234, stream.ts:172, fold/algebras/render.ts:45 — before joining. Bare `toggles.join(' ')` is an unescaped markup sink. Either run each name through escapeAttr, or reject any name not matching /^[A-Za-z][A-Za-z0-9-]*$/ at render time (a boolean-attr name containing whitespace, '>', '\"', '=', or '/' is invalid HTML and must never be emitted verbatim)."
  - "Correct the §11.3 escape-by-default guardrail claim. 'the boolean branch emits only a curated attribute name (no user value interpolated)' is true ONLY for the new `_sk` branch (sk[i] is a static prototype key). It is FALSE for the `.toggle()` path the RFC promotes: `BooleanAttribute` (html-types.ts:45) has a `(string & {})` tail admitting arbitrary runtime strings. The RFC must acknowledge the `.toggle()` sink as in-scope and state how it is made safe."
  - "Add an XSS regression test to the render suite: `Tag().toggle('x><script>alert(1)</script>')` and a conditional variant must NOT produce a tag breakout in any of the three render paths. The RFC ships boolean-attr fixture updates but no escape test for the path it elevates."
  - "Resolve the `(string & {})` escape-hatch tail on `BooleanAttribute`: drop/narrow it, or document it as a Raw-equivalent and route arbitrary names through the render-time validation above. As written the type advertises 'any string is a valid boolean-attr name,' which is the type-level invitation to the sink."
---

# Verdict: RFC-A-01 — security/escape lens

> You are an ADVERSARY. Your job is to KILL this RFC through the security/escape lens.
> Default to `reject` under uncertainty.

## Attack

The RFC's thesis is "collapse two boolean-attribute mechanisms onto `.toggle()`." Its §11.3 guardrail check certifies the change `pass`, reasoning: *"the boolean branch emits only a curated attribute name (no user value interpolated)."* That reasoning analyzes the **wrong code path** and certifies a guardrail it has not actually checked.

- **Failure mode 1 — the elevated path has an unescaped sink the RFC never inspected.** The RFC's *new* `_sk` branch (`if (value) attrs += ' ' + sk[i]!`) is safe, because `sk[i]` is a statically declared prototype key (`ScriptTag.prototype._sk = ['src','type','async','defer',...]`, document.ts:241) — never user data. True. But the RFC then deprecates every typed setter and steers all callers — including the 186 frozen-app call-sites migrated by `no-set-toggles`, and all future code via the `prefer-toggle` auto-fix — onto `Tag.prototype.toggle(name)` (tag.ts:173), which pushes `name` into `this.toggles`. **All three** serializers emit that array with no escaping at all:
  - `render.ts:234` — `attrs += ' ' + toggles.join(' ')`
  - `stream.ts:172` — `attrs += ' ' + toggles.join(' ')`
  - `fold/algebras/render.ts:45` — `parts.push(...attrs.toggles)`

  No `escapeAttr`, no validation — raw concatenation into the open tag.

- **Failure mode 2 — the type system invites the sink.** `BooleanAttribute` (html-types.ts:45) is `'disabled' | … | (string & {})`. The `(string & {})` tail makes `.toggle(userControlledString)` type-check cleanly. Combined with the unescaped sink this is textbook attribute-injection → tag-breakout XSS:

  ```ts
  // toggleName flows from a request param / DB field / i18n key
  Div().toggle('x><script>alert(document.cookie)</script>')
  // renders: <div x><script>alert(document.cookie)</script>>
  ```

  Proof of the exact sink: `' ' + ['x><script>alert(1)</script>'].join(' ')` → `" x><script>alert(1)</script>"`. Tag closed, script injected.

- **Why this folds back into THIS RFC, not "pre-existing, out of scope."** (1) The RFC's §11.3 makes an affirmative, **false** safety claim about the path it promotes — a guardrail certified on a misread is worse than no certification. (2) The RFC *concentrates* attack surface: it deprecates the genuinely-safe static setters (`setChecked` etc. route through fixed `_sk` keys) and funnels that traffic onto the single unescaped sink, then ships codemods that mechanically perform that migration across 186 call-sites with no escape audit. Moving callers from a safe sink to an unsafe one is a security regression even when functionality is "identical." (3) Guardrail §11.3 is owned by this lens and is not satisfied.

- **Severity calibration (why not a hard reject).** In surveyed apps, toggle names are today string literals (`'defer'`, `'checked'`), so there is no *currently shipping* exploit. The vulnerability is latent: the type permits it, the sink permits it, and the RFC's promotion + codemods enlarge the blast radius and lower the bar to reaching it. The fix is small, local (three sink lines + one type decision + one test), API-preserving — so the surgical fix strictly dominates an API cut.

## Does it survive?

**survives-with-changes.** The core design — render-fix the `_sk` boolean branch and converge on `.toggle()` — is sound, and the new `_sk` branch is provably safe. But the RFC cannot honestly ship its §11.3 `pass` while elevating an unescaped sink and shipping codemods that funnel traffic into it. The four required changes (escape/validate the `toggles` sink in all three serializers, correct the §11.3 claim, add a breakout regression test, resolve the `(string & {})` tail) close the gap without touching the proposed public surface. With them folded in, the escape-by-default story becomes true rather than asserted.

## Guardrail check (§11.3 escape-by-default)

**Not satisfied as written.** The new `_sk` boolean branch introduces no XSS (emits static prototype keys only). But the lens does NOT confirm "no XSS regression" overall: the RFC promotes `.toggle()` — backed by the unescaped `toggles.join(' ')` sink across render.ts:234 / stream.ts:172 / fold/algebras/render.ts:45 — to the single canonical boolean-attribute path and ships codemods migrating 186 call-sites onto it, while certifying §11.3 `pass` on a misread of which path carries user data. The guardrail clears only after the required changes.
