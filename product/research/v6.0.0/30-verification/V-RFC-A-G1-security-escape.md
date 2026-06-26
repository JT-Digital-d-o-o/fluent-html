---
rfc: RFC-A-G1
lens: security/escape
verdict: survives
confidence: 0.9
killer_objection: null
required_changes: []
---

# Verdict: RFC-A-G1 — security/escape lens

> You are an ADVERSARY. Your job is to KILL this RFC through the security/escape lens.
> Default to `reject` under uncertainty — a good API cut is cheaper than a bad API shipped.

## Attack

I attacked along every path where an escape-by-default regression could hide. There are only three plausible vectors, and each fails to land:

- **Vector 1 — new markup-emitting surface bypassing the escaper.** Rejected on inspection. The RFC adds *zero* library code (`api_surface: []`, frontmatter `breaking: false`). The five APIs it teaches (`IfThen`, `IfThenElse`, `Match`, `ForEach` count overload) already ship in `src/control/conditionals.ts` and `src/control/iteration.ts`. I grepped those files for any sink (`Raw`, `escape`, `innerHTML`, `setHtml`, `sanitize`) — none exist. They are pure dispatchers: they evaluate a condition/discriminant and return a `View` produced by *other* tag functions. All escaping is centralized in `src/render/render.ts::renderImpl` (string children → `escapeHtml`, attributes → `escapeAttr`, `Raw` is the explicit opt-out, string raw-context → `sanitizeRawContent`). That renderer is untouched. No new path reaches markup.

- **Vector 2 — a worked-example refactor that silently changes what reaches a script/markup sink.** This is the only example with a genuine sink: §5, `IfThen(!!props.structuredData, () => StructuredData(props.structuredData!))` → `IfThen(props.structuredData, (data) => StructuredData(data))`, where `StructuredData` plausibly emits `<script type="application/ld+json">` via a `Raw`-equivalent in app code. I checked whether the refactor moves, widens, or re-routes the data that hits that sink. It does not: the transform changes **only the guard form** (`!!x` truthiness coercion → nullable-overload narrowing). The callback body `StructuredData(data)` is byte-for-byte identical in payload to `StructuredData(props.structuredData!)` — same value, same component, same sink. `!!x` and the nullable overload select the truthy/non-null branch on the *same* set of values (the only divergence is empty-string/`0`/`NaN`, which `!!` excludes and `!= null` includes — and even that edge does not weaken escaping, it only changes whether the branch renders at all). No new XSS surface is introduced; the JSON-LD sink's (pre-existing, app-owned) escaping responsibility is unchanged. If `StructuredData` was unsafe before, it is exactly as unsafe after — the RFC neither creates nor cures that, and correctly leaves it out of scope.

- **Vector 3 — the guideline teaching an unsafe idiom.** Rejected. The ✗/✓ pairs steer toward narrowing callbacks and `Match`; none introduce a `Raw`, `setHtml`, attribute-interpolation, or unsanitized-string pattern. The examples pass *values* into typed components (`Img().setSrc(u)`, `Card(q)`), all of which route through `escapeAttr`/`escapeHtml`. The guideline does not teach any string-into-markup shortcut, so an LLM reader copying these patterns inherits escape-by-default for free.

I also checked the F-A-026 `ForEach(Array.from…)` → `ForEach(count, fn)` rewrite: the index `i` is a `number`, never interpolated as raw markup, and the callback output is rendered through the same escaper. No injection surface.

## Does it survive?

**Survives.** This RFC is the safest possible class of change for the escape lens: a documentation-only adoption fix with no library code, no new markup-emitting path, and no public surface added (`api_surface: []`). Every code path it references already exists and already routes through the centralized escaper in `render.ts`. The single sink-adjacent example (StructuredData/Canonical) is a payload-identity-preserving refactor of the *guard*, not the sink — escaping behavior is provably unchanged. The RFC's own §11.3 self-check ("escape-by-default: pass — no markup-emitting surface touched") is accurate and verified.

No required changes. Confidence is 0.9 rather than 1.0 only because the sink components (`StructuredData`, `Canonical`) live in out-of-repo app code I could not directly read; if one of them were *already* an unescaped `Raw(JSON.stringify(userInput))` sink, that is a pre-existing app vulnerability this RFC neither introduces nor is responsible for — and it would be equally present in the "before" code. The RFC does not regress it.

## Guardrail check (security/escape — §11.3)

Confirmed **no XSS regression**. Escape-by-default is preserved: all rendering still flows through `renderImpl` (`escapeHtml` for string children, `escapeAttr` for attributes, explicit `Raw` opt-out, `sanitizeRawContent` for raw contexts). No `Raw`-equivalent is added or made implicit. No unsanitized interpolation, attribute injection, or new script sink is introduced. Guardrail §11.3 passes.
