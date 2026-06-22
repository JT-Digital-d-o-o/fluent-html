---
rfc: RFC-B-05
lens: security/escape
verdict: survives-with-changes
confidence: 0.74
killer_objection: "The §11.3 self-check claims the F-B-042 `icon?: string`→`Raw()` XSS class is *removed*; it is not. The RFC is `breaking: additive`, the kill-switch ESLint rule (`no-raw-icon-string`) is explicitly deferred 'separately,' and the migration is opportunistic — so every existing `Raw('<svg>')` and `icon?: string` sink keeps compiling and shipping. The RFC adds a *safe alternative*, it does not *eliminate* the unsafe path. As written, the guardrail claim is overstated, which risks the synthesis agent recording a closed XSS class that is still open."
required_changes:
  - "Downgrade the §11.3 guardrail claim from 'the injection is removed' to 'a safe alternative is provided; the unsafe path is deprecated and flagged.' The XSS class is only closed once the companion ESLint rule lands and apps migrate — state that explicitly."
  - "Promote `no-raw-icon-string` from 'proposed separately' to an in-scope, same-milestone deliverable of this RFC (or an explicit `depends_on`). An additive Icon API with the lint rule deferred leaves the F-B-042 `Raw(icon)` sink (mngmt dashboard.components.ts:137-139) live with zero new friction. The lint rule is the only mechanism that actually retires the sink; without it the security win is aspirational."
  - "Specify that `registerIcon`/`registerIcons` accept ONLY path `d`-strings rendered via `Path().setD()` (attribute-escaped), and MUST NOT gain any raw-markup or `dangerouslySetInnerSVG`-style overload in this or a follow-up. Add a one-line invariant to the API contract so a future 'register a full <svg> string' convenience cannot reintroduce a `Raw` sink under the registry's trusted-looking name."
  - "Document that `Icon`'s `fill`/`stroke` options and the gradient `setStopColor`/`setId`/`Path().setFill('url(#id)')` values are emitted as discrete presentation ATTRIBUTES (escaped), never composed into a `style=\"\"` string — so no CSS-context (un-escaped `style`) sink is introduced. State this as an explicit non-goal/invariant to prevent a later 'inline-style icon color' shortcut."
  - "Pin the `title` option's emission in the Proposed API signature, not just prose: `Icon` MUST render the accessible label via `Title(opts.title)` (an escaped Tag text child) and set `role=\"img\"`/`aria-hidden` via typed setters/`addAttribute` — never via `Raw`, template concatenation, or string interpolation. The RFC asserts the `<title>`/`role=\"img\"` behavior but gives no signature; bind the implementation to the escaped path so a future implementer cannot grow the one markup path the RFC describes into a `Raw`-based sink (`title: \"</title><script>…\"`)."
file: product/research/v6/30-verification/V-RFC-B-05-security-escape.md
---

# Verdict: RFC-B-05 — security/escape lens

> Adversary. Goal: kill RFC-B-05 through the escape-by-default failure mode.

## Attack

I traced every markup-emitting path the RFC adds against the actual renderer (`src/render/stream.ts`, `src/render/escape.ts`) and the existing SVG tag schema (`src/elements/svg.ts`, `src/elements/media.ts`).

**Where the RFC is actually solid (and I could not break it):**

- All new setters (`setStrokeLinecap`, `setStrokeDasharray`, `setTransform`, `setStrokeOpacity`, `setId`, `setOffset`, `setStopColor`, `Path().setD`, gradient coords) write to `_sk`-listed instance fields. At render, `stream.ts:151` emits every `_sk` value as `' ' + key + '="' + escapeAttr(value) + '"'`, and `escapeAttr` (`escape.ts:37`) escapes `& < > " '`. Attributes are always double-quoted. So attacker-controlled path data, transforms, stop-colors, or ids cannot break out of the attribute, inject a new attribute, or open a tag. **`Path().setD(userControlled)` is genuinely safe** — this is the whole point of replacing `Raw("<svg>")`.
- The `title` option becomes a `<title>` *text child*, escaped via `escapeHtml` at `stream.ts:122`. No sink.
- `registerIcon(name, paths: IconPaths = readonly string[])` only ever feeds `Path().setD()` — even fully attacker-controlled registered paths are attribute-escaped. There is no raw-markup overload in the proposed surface.
- No new value is composed into a `style=""` string, so the known CSS-context gap (`escapeAttr` does not escape backtick/`=`, only safe for quoted HTML attrs — see the `escape.ts:30-36` caveat) is never reached.

So the *direct* XSS attack fails. The RFC's escape posture on its own new code is correct.

**The real failure mode — guardrail overstatement + deferred enforcement (the killer):**

- **§11.3 claims the injection class is *removed*.** It is not. The frontmatter is `breaking: additive`; Migration says "Existing `Raw('<svg>…')` … call sites keep compiling unchanged — apps migrate opportunistically." The F-B-042 sink — `GhostButton({ icon?: string })` doing `Raw(icon)` at `mngmt/src/dashboard/dashboard.components.ts:137-139`, plus `TaskStatusIcon`'s `Raw(TASK_STATUS_ICONS[status])` — **keeps compiling and shipping exactly as before.** The RFC adds a *safe alternative* and *deprecates* the unsafe one; it does not close the class. A verifier reading the §11.3 "pass — injection is removed" line would record a still-open XSS class as closed. That is the dangerous part: not a new sink, but a false "no regression / class eliminated" signal feeding Wave-4 synthesis.

- **The only mechanism that actually retires the sink is deferred.** The `no-raw-icon-string` ESLint rule (the thing that would make `icon?: string` → `Raw(icon)` *fail CI*) is parenthetically "proposed separately." Without it, an additive Icon API gives apps a nicer option with *zero new friction on the dangerous option*. Adoption of a safer alternative without deprecation enforcement is historically weak (cf. the RFC's own observation that `Match` sits at 18:1 vs `IfThen` despite being available). The security improvement is real only when the lint rule lands in the same milestone.

- **Latent expansion risk in the registry.** A registry that today accepts only `d`-strings is one convenience overload away from a `Raw` sink: a future "let me register a whole `<svg>` string" helper would render via `Raw`/`RawString` and inherit the registry's trusted framing. The RFC should nail the door shut with an explicit invariant, not leave it implied.

## Does it survive?

**survives-with-changes.** I cannot land a direct XSS through the proposed API — escaping is airtight on every new path, and the design correctly removes a `Raw` sink for adopters. But the RFC's own guardrail self-check *overstates* the result (claims removal of a class it only deprecates), and the enforcement that would make the claim true is deferred out of scope. Under default-reject discipline, an overstated escape guardrail plus a deferred kill-switch is exactly the kind of "false-closed" security signal Wave-4 must not inherit. The four required changes (above) are precise and fold straight back into §11.3, the Migration section, the API contract, and `depends_on`. With them, the lens is satisfied.

## Guardrail check (security/escape lens owns §11.3)

- **No new XSS sink:** confirmed. Every new setter routes through `_sk` → `escapeAttr` (double-quoted, `& < > " '` escaped); `title` routes through `escapeHtml` as a text child. No `style=""` composition, no raw-markup overload in the proposed surface.
- **Raw-equivalents explicit:** confirmed — there is no Raw-equivalent in the new API; the design's purpose is to *replace* `Raw("<svg>")`.
- **No XSS *regression*:** confirmed (additive; existing behavior unchanged).
- **Caveat that downgrades the verdict:** §11.3 must not claim the F-B-042 injection class is *removed* while it remains compilable and the retiring lint rule is deferred. Correct the wording and pull the lint rule in-scope (required changes 1-2). This is a documentation/scope defect, not a code-sink defect — hence survives-with-changes, not reject.
