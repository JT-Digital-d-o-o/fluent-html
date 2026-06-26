---
rfc: RFC-A-04
lens: security/escape
verdict: survives
confidence: 0.9
killer_objection: null
required_changes: []
---

# Verdict: RFC-A-04 — security/escape lens

> You are an ADVERSARY. Your job is to KILL this RFC through the security/escape lens.
> Default to `reject` under uncertainty — a good API cut is cheaper than a bad API shipped.

## Attack

I tried to find a new XSS sink, an unescaped interpolation path, or an attribute-injection vector that `ForEachOr` / `Tag.whenElse` introduce that `ForEach` / `Tag.when` did not already have. Each angle failed against the actual code.

- **New markup-emitting path? No.** Escaping in fluent-html is *render-time and runtime-type-dispatched*, not call-site-dispatched. `renderImpl` (`src/render/render.ts:184-191`) escapes by the View's runtime type: `typeof view === "string"` → `escapeHtml(view)`; `isRawString(view)` → emitted raw. Neither primitive constructs a `View` — both *forward* a caller-supplied one. `ForEachOr`'s non-empty branch delegates verbatim to `ForEach(arr, fn)`; its empty branch returns `empty()` (`src/control/iteration.ts` ref impl, RFC lines 114-137). `whenElse` returns `thenFn(this, …)` or `elseFn(this)` — both `this` (a `Tag`) — identical body shape to the shipped `when` (`src/core/tag.ts:199-201`). No string is concatenated into HTML anywhere in either function; the bytes that reach the page are escaped at render exactly as before.

- **Raw / unescaped interpolation? None introduced.** There is no `Raw()` call, no `RawString` construction, no `.html` access, no template-literal-into-markup inside either primitive. A `Raw("<script>")` passed *through* `ForEachOr` is exactly as (un)safe as the same `Raw` passed through `ForEach` or written inline — the explicit-Raw escape hatch (`src/core/raw-string.ts`) is untouched. The RFC adds zero new ways to opt out of escaping.

- **Attribute injection via the nullable-narrowing branch?** The most promising vector: `Span().whenElse(user.avatar, (t, src) => t.background("white").apply(avatarBg(src)), …)` (RFC lines 190-193) feeds attacker-influenceable `src` into the `thenFn`. But (a) `src` is forwarded by value to a caller-supplied closure exactly as `when`'s `(t, value)` already does (`src/core/tag.ts:197-201`); whatever that closure does with `src` — `setSrc`, `setStyle`, `addAttribute` — is the *closure's* sink, and every such Tag method already routes through `escapeAttr` at render (`render.ts:202`, `escape.ts:escapeAttr`). `whenElse` is not a sink and creates none. (b) The `condition as NonNullable<T>` cast (RFC line 110) is byte-for-byte the cast `when` already ships (`tag.ts:200`); it is a compile-time-only assertion with no runtime escaping consequence.

- **Falsy-but-renderable leak?** I checked whether the truthiness gate (`condition ? thenFn(...) : elseFn(...)`) could route an unsafe value into the rendered output unescaped. It cannot: the value never becomes markup inside the primitive; it is only handed to a closure or used as a boolean. Same semantics as `IfThenElse`/`when`, which the security lens already accepts.

- **`sanitizeRawContent` / raw-context propagation?** The raw-context flag (`render.ts:184` `isRawContext`) is set by the *element* being rendered (e.g. `<script>`/`<style>`), not by control-flow primitives. `ForEachOr`/`whenElse` return ordinary `View`/`Tag` nodes; they cannot smuggle a value into a raw context that the surrounding element didn't already establish. No change to that machinery.

## Does it survive?

**Survives.** The RFC's §11.3 self-assessment ("emit no markup themselves; they dispatch to caller-supplied views/modifiers, which escape as usual; no `Raw` path introduced") is verified true against the source. Both symbols are pure control-flow dispatchers over the existing `View`/`this` types; the escape boundary lives downstream at `renderImpl` and is reached identically whether a View arrives via the new primitives or the existing ones. There is no new XSS surface, no new unescaped interpolation, no new attribute-injection sink, and no new Raw entry point. The only residual XSS exposure is the *pre-existing* one shared by `Raw()` and by sink methods like `setStyle`/`addAttribute`/`setSrc` — and that exposure is exactly equal through the old paired form (`.when`/`IfThen`) and the new two-branch form, so the RFC is XSS-neutral.

No required changes.

## Guardrail check (security/escape owns §11.3)

§11.3 escape-by-default / no-XSS-regression: **confirmed, no regression.** Strings forwarded through `ForEachOr`/`whenElse` are HTML-escaped at render (`render.ts:186`, `escape.ts:escapeHtml`); `RawString` remains the sole, explicit, unchanged opt-out (`raw-string.ts`); attribute values still pass through `escapeAttr` (`render.ts:202`). The new surface adds no markup-emitting code path and no unescaped sink.
