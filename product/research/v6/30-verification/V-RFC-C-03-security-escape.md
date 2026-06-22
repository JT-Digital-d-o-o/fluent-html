---
rfc: RFC-C-03
lens: security/escape
verdict: survives
confidence: 0.86
killer_objection: null
required_changes: []
---

# Verdict: RFC-C-03 — security/escape lens

> You are an ADVERSARY. Your job is to KILL this RFC through the security/escape lens.
> Default to `reject` under uncertainty — a good API cut is cheaper than a bad API shipped.

## Attack

The thesis I tried to prove: RFC-C-03 widens several type tables to include the
`` `[${string}]` `` / `(string & {})` escape hatches and adds a fleet of new
class-emitting methods. If any of those strings reach the `class="..."` attribute
without escaping, an attacker who controls a styling value (a tenant theme token,
a user-supplied arbitrary spacing like `bg-(--brand)`, a persisted "accent color")
gets attribute injection / `"><script>`-style XSS. Three concrete attack surfaces:

- **Attribute-injection via the arbitrary-value hatch.** `TailwindRounded`,
  `TailwindBlur`, `TailwindShadow`, `TailwindRingWidth`, `TailwindGradientDirection`,
  and `TailwindTransition` all carry `` `[${string}]` `` or `(string & {})`. A value
  like `lg" onmouseover="alert(1)` flows `value → addClass(`shadow-${value}`) → tag.class`.
  If `class` is emitted unescaped, that breaks out of the quoted attribute.
- **New gradient methods as a fresh sink.** `gradientTo`/`gradientRadial`/`gradientConic`
  interpolate `direction` into `bg-linear-${d}` — a new template string that, on paper,
  could be a new injection point distinct from the audited existing methods.
- **Dual-target branch divergence.** The `getTailwindTarget()` branch produces *two*
  different strings per method (`bg-linear-*` vs `bg-gradient-*`, `shadow-xs` vs `shadow-sm`).
  An adversary hopes one branch routes through a different, unescaped emit path.

## Does it survive?

**Yes — the attack fails on every surface, because the RFC adds no new markup-emitting
path; it only writes more strings into the one field that is already uniformly escaped.**

Every method in the RFC (`gradientTo`, `gradientRadial`, `gradientConic`, `shadow`,
`rounded`, `blur`, `backdropBlur`, `outlineHidden`, `ring`, `transition`, `border`,
`spaceX/Y`) terminates in `this.addClass(...)` (`src/core/tailwind-methods.ts`).
`addClass` appends only into `this.class` (`src/core/tag.ts:102-114`). The `class`
attribute is then HTML-attribute-escaped in **all three** render backends before it
ever reaches output:

- sync render: `attrs += ' class="' + escapeAttr(tcls) + '"'` (`src/render/render.ts:204`)
- streaming:   `attrs += ' class="' + escapeAttr(tcls) + '"'` (`src/render/stream.ts:142`)
- fold/algebra: `class="${escapeAttr(attrs.class)}"` (`src/fold/algebras/render.ts:12`)

`escapeAttr` (`src/render/escape.ts:37`) escapes `& < > " '`. The renderer always emits
double-quoted attributes, so escaping `"` and the angle brackets/ampersand fully neutralizes
the attribute-injection payload above: `shadow-lg" onmouseover=...` becomes
`shadow-lg&quot; onmouseover=...` inside the quotes — inert. The `(string & {})` /
`` `[${string}]` `` hatches do not bypass this; they are *type-level* widenings, not a
render-path change. They produce ordinary `tag.class` content, escaped like any other.

The dual-target branch does not matter to the security argument: both branches return the
same kind of value (a class string) into the same `addClass` → `tag.class` → `escapeAttr`
pipeline. There is no second emit path, no `Raw`, no `style` write, no attribute key
interpolation, and no `dangerouslySetInnerHTML`-equivalent introduced anywhere in the RFC.
The new gradient template strings are structurally identical to the dozens of existing
interpolating methods (`background`, `textColor`, `padding` arbitrary-value at
`tailwind-methods.ts:338`) that already ship through the same escaped sink.

The RFC's own guardrail line (§11.3, "N/A — emits class strings, no markup; existing
escaping unchanged") is therefore accurate, not a hand-wave — I verified the claim against
the three render backends rather than taking it on faith.

One residual, explicitly **out of scope for this lens and not grounds to reject**: an
arbitrary-value class is escaped for *HTML* but is still attacker-influenced *CSS*. A
tenant-controlled `(string & {})` could inject a CSS expression (e.g. a custom property /
`url()` in an `@theme` token) — but that is a CSS-injection / content-security concern that
(a) pre-exists this RFC on every existing arbitrary-value method, (b) is unchanged by it,
and (c) belongs to a CSS-sanitization policy, not the HTML-escape guardrail this lens owns.
Flagging it for the Wave-4 synthesis as a pre-existing, RFC-orthogonal note; it does not
move the verdict.

Confidence is 0.86 rather than higher only because the RFC ships pseudo-code, not the final
diff: the verdict is contingent on the implementation actually routing through `addClass`
(as every existing method does and as the RFC pseudo-code shows) and not introducing a bespoke
emit. If a future implementer hand-rolls a `setClass`/attribute write, re-verify — but that
would be an implementation defect, not an RFC defect.

## Guardrail check (security/escape owns §11.3)

§11.3 escape-by-default — **PASS, no XSS regression.** RFC-C-03 emits only `class`-string
content, which is HTML-attribute-escaped via `escapeAttr` in the sync, stream, and fold
render paths (`render.ts:204`, `stream.ts:142`, `fold/algebras/render.ts:12`). It introduces
no new markup-emitting path, no unescaped attribute sink, no `Raw`-equivalent, and no script
sink. The `(string & {})` / `` `[${string}]` `` escape hatches are type widenings that do not
bypass escaping. No required changes.
