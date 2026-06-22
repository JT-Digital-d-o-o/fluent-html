---
rfc: RFC-D-03
lens: type-safety
verdict: survives-with-changes
confidence: 0.78
killer_objection: "The renderAlgebra.tag wrapper is type-unsound at the TagAttrs⇄Tag seam: emitOpenTag must consume the index-signature bag `TagAttrs` (`[key: string]: unknown`), which erases _sk ordering, void-element nominal identity, and the typed HTMX table. The RFC's central promise — `foldView(renderAlgebra, v) === render(v)` byte-for-byte — is NOT enforceable by any type the RFC proposes; it is a runtime invariant smuggled in under a 'thin wrapper' label, and the only thing guarding it is the fuzz test the RFC also adds. That is parity-by-test, the exact mechanism the RFC rejects in its own Alternatives section."
required_changes:
  - "Pin emit() / emitOpenTag() to the nominal `Tag` class, not `TagAttrs`. The RFC signature `export function emit(sink: Sink, view: View, ctx: RenderCtx)` already takes `View` (= Tag | string | RawString | View[]) — keep it. But the renderAlgebra.tag case receives `TagAttrs`, not a Tag, so it CANNOT call emit/emitOpenTag without a cast. State the reconstruction contract explicitly with a typed builder, e.g. `function tagAttrsToTag(element: string, attrs: TagAttrs): Tag`, and forbid `emitOpenTag(element: string, attrs: TagAttrs)` entirely — otherwise two emitter entry points exist (Tag-based and TagAttrs-based) and they re-diverge, defeating the dedup."
  - "Resolve the `_sk` ordering loss. render() emits element-specific attrs via the ordered `tag._sk` schema-key list (render.ts:208-216). `TagAttrs` has NO `_sk` field (fold/types.ts:6-15) — extractAttrs (fold/fold.ts:19-24) flattens them into the `[key: string]: unknown` index signature with `Object.keys` order. emitOpenTag over TagAttrs therefore emits element attrs in insertion/enumeration order, render() emits them in _sk order. The 'byte-identical' claim and worked-example #2's exact-bytes assertion are FALSE for any element with ≥2 schema attrs (e.g. `<a href hreflang>`, `<input name value>`). Either carry `_sk` through TagAttrs, or downgrade every 'byte-identical / identical bytes' claim in the RFC to 'semantically equivalent, attribute order may differ' and weaken the fuzz test to set-equality of attrs — which then no longer proves drift-freedom."
  - "Type the `Sink.append` backpressure boolean as a branded/named type or document that the boolean is load-bearing. As written, `append(s: string): boolean` lets StringSink return a bare `true` and StreamSink return Readable.push()'s boolean; nothing at the type level distinguishes 'ignored signal' from 'honored signal'. The Open Question admits backpressure is only plumbed, not honored — so the return type is a bare `boolean` that lies about being actionable. Either drop it to `void` for this RFC (and re-add typed in the incremental-streaming RFC) or wrap it: `type Backpressure = boolean & { __brand: 'pause' }`. A bare `boolean` return that callers are told to ignore is a misuse magnet."
  - "Add `assertNever(ctx)` to emitText's RenderCtx switch in the RFC body, not just prose. The RFC claims (Type-safety story bullet 1) that adding a future `'noscript'` ctx is 'a compile error in assertNever until handled' — but the shown emitText (lines 186-190) ends with `return void sink.append(sanitizeRawContent(s, ctx))` and relies on control-flow narrowing to `'script' | 'style'`. If a 4th non-sanitize ctx is added, that final branch silently mis-sanitizes it as script/style — NO compile error, because the narrowed call still type-checks against `el: 'script' | 'style'` only if the union happens to still be exactly those two. Make the exhaustiveness real: explicit `case` arms + `default: return assertNever(ctx)`."
file: /Users/tony/jt-digital/fluent-html/product/research/v6/30-verification/V-RFC-D-03-type-safety.md
---

# Verdict: RFC-D-03 — type-safety lens

> You are an ADVERSARY. Your job is to KILL this RFC through the type-safety lens.
> Default to `reject` under uncertainty — a good API cut is cheaper than a bad API shipped.

## Attack

The RFC's thesis is "structural dedup makes parity an *invariant*, not a test obligation"
(Alternatives, line 259). The type-safety lens kills that thesis: **the dedup the RFC
proposes is NOT structural at the type level — it is a runtime convention bridged by an
untyped `TagAttrs` bag — so parity remains a test obligation wearing a type costume.**

- **type-safety failure mode 1 — the `TagAttrs` index-signature any-leak (decisive).**
  `render()` and `renderToStream()` both consume the nominal class `Tag` (core/tag.ts:43,
  fields `el`, `child`, `htmx?: HTMX`, `toggles?`, `_sk?: readonly string[]`, plus typed
  specialized subclass props). `renderAlgebra.tag` does **not** receive a `Tag` — its
  signature is `tag: (element: string, attrs: TagAttrs, children: A) => A`
  (fold/types.ts:26). `TagAttrs` is `{ id?; class?; style?; attributes; htmx?; toggles?;
  [key: string]: unknown }` (fold/types.ts:6-15). That trailing **`[key: string]: unknown`
  index signature is the any-leak**: every element-specific attribute (`href`, `src`,
  `value`, `hreflang`, …) is typed `unknown`, reachable only by `String(value)` coercion.
  The RFC's proposed `emitOpenTag(element, attrs)` (line 100) must therefore either
  (a) take `TagAttrs` and re-implement attr emission over the untyped bag — i.e. a SECOND
  emitter, re-introducing exactly the drift the RFC exists to kill — or (b) reconstruct a
  `Tag` from `TagAttrs` (line 98 comment: "reconstruct minimal Tag-shaped node") via a
  cast through `unknown`. Both routes route the supposedly-deduped path through an untyped
  seam. **A wrong call compiles:** `emitOpenTag('img', { attributes: {}, foo: {nested:1} })`
  type-checks (index signature accepts `unknown`), then `String({nested:1})` emits
  `foo="[object Object]"`. The compiler cannot stop it because `TagAttrs` admits any key of
  any type.

- **type-safety failure mode 2 — `_sk` ordering is unrepresentable in `TagAttrs`, so
  "byte-identical" is a type lie.** render() emits element attrs by iterating the ordered
  schema-key list `tag._sk` (render.ts:208-216) — a `readonly string[]` that fixes
  attribute *order*. `TagAttrs` has no `_sk` field; `extractAttrs` (fold/fold.ts:19-24)
  spreads specialized props into the index signature with `Object.keys` enumeration order
  and drops `_sk` entirely (its loop explicitly skips `_t`, `el`, `child` but never copies
  `_sk` as orderable metadata). Therefore the RFC's repeated **"byte-identical output"**
  (lines 152, 205) and worked-example #2's exact-string assertion
  (`hx-target="#mainContent" hx-push-url="true"` in a fixed order) are **not provable and,
  for multi-schema-attr elements, false**. The fuzz test the RFC leans on
  (`foldView(renderAlgebra, v) === render(v)`, line 210) will *fail* on any generated tree
  containing an element with two or more `_sk` attributes whose enumeration order differs
  from `_sk` order — which is precisely the kind of element (`<a>`, `<input>`, `<link>`)
  the test is told to generate. The RFC's own acceptance criterion contradicts its own
  parity claim.

- **type-safety failure mode 3 — `Sink.append(): boolean` is a return-type that lies.**
  The Open Question (line 265) admits the backpressure boolean is *plumbed but not honored*.
  So `emit` calls `sink.append(s)` and discards the result in every wrapper (StringSink
  always returns `true`; the eager `read()` ignores StreamSink's `false`). A `boolean`
  return value that the whole codebase is instructed to ignore is a textbook misuse vector:
  a future contributor sees `append(): boolean`, assumes pausing works, builds on it, and
  ships a streaming bug the types actively *endorsed*. The lens wants `boolean` only where
  the boolean is actionable now.

- **type-safety failure mode 4 — `RenderCtx` exhaustiveness is asserted in prose, absent in
  code.** The Type-safety story (line 195) promises `assertNever` protection for a future
  ctx, but the shown `emitText` (lines 186-190) uses fall-through narrowing, not an
  exhaustive switch. The protection it advertises does not exist in the proposed body.

## Does it survive?

**survives-with-changes.** It does not die outright because the *direction* is correct and
type-positive: `boolean | string` → `RenderCtx` literal union (genuinely safer, §11.4),
`sanitizeRawContent(s, el: 'script' | 'style')` narrowing (real), and `renderToStream`
variadic parity (real, and `View[]` ⊂ `View` makes it pure widening — backward-safe). The
XSS-closing and void-element fixes are net type-safety *gains* on the public fold path.

But the load-bearing claim — that dedup makes parity a compiler-enforced invariant — is
**false as specified**, because the fold algebra's `tag` case is typed over the
index-signature bag `TagAttrs`, not the nominal `Tag`. Until the four required changes land,
the RFC ships a "thin wrapper" whose thinness is unprovable: the parity it promises is held
up by a fuzz test that, given its own _sk reasoning, will not even pass for ordered
schema attrs. That is enough to block as-is, not enough to reject the idea.

The single highest-leverage fix is required-change #1+#2 together: pin the shared emitter to
`Tag` (carry or reconstruct `_sk`), and either prove byte-identity by construction or
honestly downgrade the parity claim to attribute-set equivalence. With that, the
index-signature any-leak is sealed behind one typed reconstruction function and the
"invariant, not test obligation" thesis becomes true.

## Guardrail check (§11.4 type-safety)

- `boolean | string` → `RenderCtx` literal union: **confirmed improvement.** Real narrowing
  to `'script' | 'style'` in the sanitize branch — provided required-change #4 (explicit
  `assertNever`) lands; otherwise the narrowing is incidental, not enforced.
- `sanitizeRawContent(s, el: 'script' | 'style')`: **confirmed** — callers can't pass an
  arbitrary element name.
- `renderToStream(...views: View[])` variadic parity: **confirmed type-safe widening** —
  `View[]` is assignable to `View`, single-arg callers unaffected, no `any`.
- **Open hole (blocks pass):** `renderAlgebra.tag` consumes `TagAttrs` with a
  `[key: string]: unknown` index signature; the shared emitter is `Tag`-shaped. This seam is
  the residual any-leak §11.4 forbids ("No bare `string`/`any` where a literal union /
  nominal type fits"). The guardrail is **not satisfied** until the emitter is pinned to
  `Tag` and `_sk` ordering is carried or the byte-parity claim is withdrawn.
