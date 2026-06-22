---
rfc: RFC-D-03
lens: breaking-change
verdict: survives-with-changes
confidence: 0.78
killer_objection: The "thin wrapper" cannot make `foldView(renderAlgebra, v)` byte-identical to `render(v)` for script/style content without changing the public `ViewAlgebra` interface (`text: (s) => A` carries no render-context), so the headline fix (F-D-003 sanitization, worked example #3) is architecturally unreachable inside the algebra and the only real fix is a breaking signature change to an exported type — which the RFC mislabels `breaking: additive`.
required_changes: []
---

# Verdict: RFC-D-03 — breaking-change lens

> ADVERSARY review. Default to reject under uncertainty.

## Attack

The RFC's whole compatibility story rests on one claim: `renderAlgebra` keeps its
`ViewAlgebra<string>` shape, callers keep compiling, "only the *output* becomes correct,"
and a property test `foldView(renderAlgebra, v) === render(v)` enforces parity. Under the
breaking-change lens this claim breaks in three places, two of which force changes the RFC
marks as non-existent.

- **breaking failure mode 1 — the script/style fix requires changing the public `ViewAlgebra` interface (mislabeled `additive`).**
  `foldView` folds **bottom-up**: a `Script(userInput)` node is processed by
  `text: (s) => emit(escape)` *first* (fold.ts:62-63 → leaf), then handed to
  `tag('script', attrs, childHtml)` as an **already-HTML-escaped string**. The parent `tag`
  case cannot retroactively un-escape and re-`sanitizeRawContent` it. The `ViewAlgebra`
  interface (`text: (s: string) => A`, types.ts:23) carries **no render-context parameter**,
  so the algebra physically cannot decide escape-vs-sanitize at the leaf. Worked example #3's
  promised output `<script>...<\/script>...` is therefore **unreachable** through any
  `ViewAlgebra<string>` wrapper — you get `&lt;/script&gt;` (escaped), which is a *third*
  distinct output, not parity with `render()`. The only way to actually close F-D-003 in the
  fold path is to add a context argument to `ViewAlgebra.text`/`.tag` — a **breaking change to
  a type exported from `src/index.ts:352`** and consumed by user-authored algebras
  (`createTransformAlgebra` in transform.ts:25-27, plus any downstream consumer). The RFC's
  front-matter says `breaking: additive` and the migration section says "nothing breaks." That
  is wrong: either F-D-003 stays unfixed in the fold path (so the RFC under-delivers on its
  headline `resolves:` list), or `ViewAlgebra` breaks and it must be bundled into a real
  migration entry. The RFC cannot have it both ways.

- **breaking failure mode 2 — the promised parity invariant `foldView(renderAlgebra, v) === render(v)` will FAIL on attribute ordering, because `extractAttrs` drops `_sk` semantics.**
  `render()` emits element-specific attrs (`href`, `src`, …) in the **defined order of the
  tag's `_sk` schema-key list** (render.ts:208-216) and *skips re-emitting them* in the generic
  loop. But `extractAttrs` (fold.ts:9-28) flattens everything into a `TagAttrs` bag and the
  algebra's `buildAttributes` re-emits via unordered `Object.entries(attrs)` (render.ts fold
  algebra:23). `_sk` is carried only as a bare enumerable key, not as an ordering directive.
  The RFC's `emitOpenTag(element, attrs)` pseudocode (line 100) hand-waves this — to be
  byte-identical it must read `attrs._sk`, iterate it in order, and replicate the generic-loop
  skip, exactly mirroring render.ts:208-228. If it doesn't, the property test the RFC itself
  introduces as the safety net **fails**, which means the RFC as written does not pass its own
  acceptance gate. This is a load-bearing omission, not a detail.

- **breaking failure mode 3 — the `hyloView` path makes the post-hoc fix even more impossible, and it has no `_sk` at all.**
  `hyloView` (hylo.ts:18-40) never calls `extractAttrs`; it builds `attrs` from
  `layer.attrs` (a `Partial<TagAttrs>` from a user coalgebra) with no `_sk` and always wraps
  children through `alg.list(...)` (hylo.ts:27) before `alg.tag`. So for `hyloView(coalg, renderAlgebra, seed)`
  the script child is doubly-removed (escaped leaf → `list.join('\n')` → opaque string) before
  `tag` ever sees it. The RFC's `resolves:` and worked examples are written as if only
  `foldView` exists; `hyloView` is a second exported call site (test/recursion-schemes.ts:259-334)
  with strictly weaker reconstruction data, and the RFC does not say what its output becomes or
  acknowledge it can't reach parity there.

## Does it survive?

`survives-with-changes`. The structural dedup of `render`/`renderToStream` is sound and the
`renderToStream` widening to `(...views)` is genuinely additive and codemod-free (a `View[]`
is a `View`, single-arg callers untouched — verified against stream.ts:111 and render.ts:33).
That half ships clean. The `renderAlgebra` half does **not** ship as written: it either
silently under-delivers F-D-003/032/083 in the fold path, or it requires a breaking change to
the public `ViewAlgebra`/`TagAttrs` surface that the RFC denies. Default-to-reject is tempting,
but the fix is bounded and the RFC is honest about the alternative (it even lists "Delete
`renderAlgebra` (breaking)" in Alternatives), so it survives **only** if the following exact
changes fold back in:

1. **Re-classify `breaking:` and add a migration entry.** Either (a) accept that the fold-path
   sanitization fix needs `ViewAlgebra.text`/`.tag` to take a `RenderCtx` arg — then mark
   `breaking: minor`, list `ViewAlgebra` + `TagAttrs` in `breaking-changes.md` as a real
   contract change with the user-algebra migration (`createTransformAlgebra` callers, custom
   algebras), and confirm it is bundled into one migration; OR (b) explicitly scope F-D-003/031/032/083
   to the `render`/`renderToStream`/`renderAlgebra` paths **only where reconstruction is byte-exact**
   and remove the script/style-sanitization parity claim (worked example #3) from the fold path,
   downgrading `renderAlgebra` to "best-effort, not output-grade" — which contradicts the RFC's
   own "use `render`, not `renderAlgebra`, for output" steer and should then just **delete**
   `renderAlgebra` per the listed alternative. Pick one; the current "additive, nothing breaks,
   but also fully fixed" framing is internally inconsistent.

2. **Specify `_sk`-ordered attribute emission in `emitOpenTag`.** The wrapper must read
   `attrs._sk`, iterate it in order, escape per render.ts:208-216, and skip those keys in the
   generic `Object.entries` loop (mirroring render.ts:218-228). Add this to the pseudocode, or
   the promised `foldView(renderAlgebra, v) === render(v)` property test cannot pass and the RFC
   fails its own gate. (Note `extractAttrs` in fold.ts must also surface `_sk` as the ordered
   list, not a bare key — confirm it survives the `for (const key of Object.keys(tag))` copy.)

3. **State `hyloView`'s output contract.** `hyloView` lacks `_sk` (coalgebra `layer.attrs` is
   `Partial<TagAttrs>`) and pre-joins children via `alg.list`. The RFC must either (a) document
   that `hyloView(coalg, renderAlgebra, …)` is *not* byte-parity with `render` (attribute order
   undefined, script/style not sanitized) and add that as a known limitation, or (b) extend the
   parity fuzz test to cover `hyloView` and prove it — currently the RFC only promises the
   `foldView` fuzz, leaving the second exported call site unverified.

4. **Fix the front-matter `breaking: additive` → it is the wrong label** for the `renderAlgebra`
   output change regardless: changing the bytes a *public exported function* emits (dropped HTMX
   attrs now appearing, `<img></img>` → `<img>`, escaped vs sanitized script) is an observable
   behavioral change to public API. "Bug-fix output change" is a legitimate category, but it
   still belongs as a **breaking-changes.md entry**, not "a note, not a breaking entry" (RFC
   line 207). Snapshot-based downstream tests *will* break; that is the definition of a
   non-codemod-able behavioral change and must be honestly marked.

## Guardrail check (§11.5 backward-compat)

Fails as written. §11.5 requires breaking to be honestly marked and bundled into one migration.
RFC-D-03 marks `breaking: additive` while (a) requiring a public-type change to actually deliver
its sanitization fix in the fold path, and (b) changing observable output bytes of an exported
function in a way that breaks snapshot tests with no codemod. The `renderToStream` variadic
widening is clean; the `renderAlgebra`/`ViewAlgebra` portion is not. Required changes 1-4 bring
it back into compliance.
