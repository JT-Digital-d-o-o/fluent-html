---
rfc: RFC-B-01
lens: security/escape
verdict: survives-with-changes
confidence: 0.74
killer_objection: null
required_changes:
  - "FieldError/FieldHint/FormField MUST route message/label/hint/placeholder/value through the normal escaped text+escapeAttr path (no Raw); add an explicit test that asserts an XSS payload in `error`, `hint`, `label`, `placeholder`, and `value` is HTML-escaped in both render.ts and stream.ts output."
  - "The `resetOnSuccess` renderer string MUST be a constant template that interpolates ONLY the boolean `selfOnly`; the RFC must state that no user/option string is ever concatenated into the emitted JS. Reject any future `resetOnSuccess` option that carries a selector/id/expression string unless it is wrapped exactly like the existing behavior `el()`/`escapeJs()` helpers."
  - "`FieldError({id})` / FormField auto-wiring of `aria-describedby`: the `Id` must be produced by `defineIds`/`createId`, never a raw `string`. Make `FieldErrorProps.id`/`FieldHintProps.id` typed as `Id` (not `string`), so a user-controlled value cannot reach the `id`/`aria-describedby` attribute path. Document that `createId` does NOT sanitize its name, so app-constructed ids from request data are forbidden."
  - "`multipart()` and `setCapture()` add no XSS surface (literal-union value, fixed enctype), but the RFC must state that `.multipart()` does not interact with `Raw`/`addAttribute` and that `setCapture` only accepts the `\"user\"|\"environment\"` literal union — no passthrough string."
  - "Add a one-line escape-contract note to the §11.3 guardrail row: every new prop that becomes an attribute value (`value`, `placeholder`, `name`) is escaped via `escapeAttr`; every new prop that becomes text (`label`, `error`, `hint`) is escaped via `escapeHtml`; FormField introduces NO attribute-key derived from user data."
---

# Verdict: RFC-B-01 — security/escape lens

> You are an ADVERSARY. Your job is to KILL this RFC through the security/escape lens.
> Default to `reject` under uncertainty — a good API cut is cheaper than a bad API shipped.

## Attack

The form system is, by definition, the part of the app that renders **user-controlled and request-echoed strings** back into markup: validation messages (`error: errors?.field`), prefilled `value`s, labels, placeholders, and field `name`s. That is the highest-value XSS target in the whole library, so the escape lens applies maximum scrutiny here.

- **escape failure mode 1 — message echo into markup.** `FieldError(message: string)` / `FieldHint(message: string)` / `FormField({ error, hint, label })` take bare strings. In every cited app the error bag is produced from validation of submitted input, and validation messages routinely interpolate the offending value (`"\"<script>\" is not a valid email"`). If any of these atoms emit through a `Raw`-equivalent or a non-escaped concatenation, that is a stored/reflected XSS. The RFC *asserts* (§11.3) "emit text children through the normal escaping path; no `Raw`," but ships **no test** proving it, and the signatures (`children: string`) are exactly the shape that invites a future maintainer to "support rich error markup" by switching to `Raw`. Verified against the renderer: text children go through `escapeHtml` (`render.ts:186`, `stream.ts:122`) and attribute values through `escapeAttr` (`render.ts:225`, `stream.ts:163`), so the *current* design is safe — but the contract is implicit and untested, which is how it regresses.

- **escape failure mode 2 — behavior JS is a script sink.** The existing `behavior()` system (`src/core/behavior-methods.ts`) builds **raw JavaScript strings** stored in `hx-on:*` attributes. Several existing renderers interpolate options into JS with **no escaping at all** — `toggle`/`remove`/`focus`/`scrollTo` build `document.getElementById('${id}')...` via `el()` with no `escapeJs`, and `toggleClass` interpolates `opts.class` raw. Only `clipboard` calls `escapeJs`. This RFC adds `resetOnSuccess` to that same sink. It is safe **only because** its emitted JS is a fixed constant template branching on a boolean (`selfOnly`) — no string option flows into the JS. That safety is incidental, not enforced: the RFC must lock it down so no future option (a selector, an id, a redirect target) is ever concatenated into the `resetOnSuccess` JS without going through the same escaping discipline. The stored JS is later HTML-escaped at serialize time (`escapeAttr` on the attribute value), so `'` becomes `&#39;` and a breakout of the *attribute* is prevented — but a JS-context breakout inside the running handler is NOT prevented by HTML-escaping, which is why an unescaped string option here would be a real injection.

- **escape failure mode 3 — `aria-describedby` / `id` wiring from unvalidated `Id`.** FormField auto-wires `aria-describedby` from `FieldError`'s `id`. `FieldErrorProps.id?: Id`. `createId(name)` (`src/ids.ts:45`) performs **zero validation/sanitization** of `name`. If an app constructs an id from request data (`createId(req.params.field)`), that value reaches both `id="..."` and `aria-describedby="..."`. Both are rendered through `escapeAttr`, so a `"`-breakout is blocked — confirmed. But the RFC leaves `id?: Id` and `name: string` as the kind of fields that *look* injectable, and the only thing saving them is the renderer's universal attribute escaping, not anything FormField does. No new attribute *key* is derived from user data (verified: `name` becomes a `name="..."` value via `setName`, not a key), so attribute-injection is not reachable — but the RFC should say so explicitly rather than leave it to the reader to re-derive from the renderer.

## Does it survive?

**Survives with changes.** I cannot land a killer objection: I traced every new markup-emitting path in this RFC to the existing escaped renderer.

- Text props (`error`, `hint`, `label`) → escaped via `escapeHtml`.
- Attribute-value props (`value`, `placeholder`, `name`) → escaped via `escapeAttr`; `name` becomes a value, never a key.
- `resetOnSuccess` emits a constant, user-string-free JS template.
- `createInputTheme` emits only existing Tailwind classes (no markup, no new vocabulary), `setCapture` is a literal union, `multipart()` sets a fixed enctype.

So the RFC does not, as written, introduce an XSS regression. But the escape-by-default guarantee is **implicit and untested** at exactly the surface most likely to carry attacker-controlled strings, and it bolts new entries onto the `behavior()` JS sink whose existing entries are inconsistently escaped. Under the lens's default-reject posture, that warrants `survives-with-changes`, not a clean `survives`: the contract must be made explicit and pinned by tests so a later maintainer cannot trade it away. The five required changes (frontmatter) fold the escape contract into the RFC, type `id` as `Id`, forbid user-string interpolation into `resetOnSuccess` JS, and add the XSS-payload tests.

## Guardrail check (security/escape — §11.3)

No XSS regression in the proposed design **as verified against the current renderer**: all new text and attribute paths inherit `escapeHtml`/`escapeAttr`; no `Raw`-equivalent is introduced; the one new behavior JS path is a constant template. The guarantee is correct but undertested and underspecified — the required changes make it explicit (escape-contract note in §11.3, payload tests in render.ts + stream.ts, `id: Id` typing, and a freeze on string-into-JS for `resetOnSuccess`). With those, §11.3 passes.
