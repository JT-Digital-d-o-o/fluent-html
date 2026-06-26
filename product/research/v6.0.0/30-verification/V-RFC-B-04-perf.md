---
rfc: RFC-B-04
lens: perf
verdict: survives-with-changes
confidence: 0.78
killer_objection: null
required_changes:
  - "Constrain LoadingBar/HtmxIndicatorStyles to once-per-document emission: forbid per-node HtmxIndicatorStyles() injection and assert (dev-mode) a single <style> block. Document that Shell() must hoist the indicator <style> + LoadingBar to the document head exactly once, never per chrome render or per partial-swap response."
  - "Add a perf-smoke assertion to the RFC's test plan: Document()/Shell() must produce a render ms/op within +5% of the equivalent hand-rolled HTML(Head(...), Body(...)) baseline for the realistic-page bench (~200 tags). Gate adoption on it — this proves the wrapper adds no per-node tax."
  - "Forbid any per-node context read inside NavItem/SidebarNav/TabNav. Context (LayoutCtx) must be read once in the chrome callback and passed down as plain values via NavItem props (active: boolean already does this) — NavItem must never read LayoutCtx.current internally (would turn an O(1)/request read into O(nav-items) and couple the leaf to a live scope)."
  - "Pin .apply(brandNavColors) style-fns to module-level constants (matching the existing .apply() idiom) so the nav loop allocates no fresh closures per render; state this in the Guidelines impact so the taught pattern doesn't seed per-render closure churn that ForEach-heavy lists would amplify."
  - "Pin createLayoutContext to exactly one scope() per request (one Disposable alloc/request). Explicitly prohibit opening LayoutCtx.scope() inside ForEach/render loops — the recon's 1000-scope bench (4.2K ops/s) shows per-scope Disposable allocation is the one context cost that matters; one-per-request is free, one-per-node is not."
---

# Verdict: RFC-B-04 — perf lens

> You are an ADVERSARY. Your job is to KILL this RFC through the perf lens.
> Default to `reject` under uncertainty — a good API cut is cheaper than a bad API shipped.

## Attack

The mission: protect the synchronous SSR hot path (`renderImpl`, `render.ts:184-256`). The recon (`00-recon/04-performance.md`) is explicit about what is actually expensive in this library:

1. **Per-request construction allocation is a first-class cost** — the SSR pattern rebuilds the whole tree every request (~14.5 KB / 1000 nodes *before* render, §2.84; ~65 KB for a realistic page). Anything that adds *per-node* construction is paid every request.
2. **The fold layer is the slow, allocating path** (`extractAttrs` = `{...attributes}` + `Object.keys` per node, §1.5/§3.6). `render()` deliberately does **not** touch it (`render.ts` imports nothing from `fold/`).
3. **Per-scope `Disposable` allocation is the one measurable context tax** — the "1000 scopes" bench is 4.2K ops/s precisely because `scope()` allocates a fresh `{ [Symbol.dispose]() }` per call (`context.ts:78-84`, §3.8).

I attacked RFC-B-04 on each:

- **perf failure mode 1 — does the wrapper add per-node cost?** No. `Document()`, `Container()`, `Shell()`, `NavItem`, `SidebarNav`, `LoadingBar` are all **synchronous View builders that run once per page**, not per node. They emit the *same* `Tag` chains apps hand-write today — the worked examples are 1:1 substitutions: the storysell `<head>` chain becomes `Document({og})` producing the identical `Meta` tags; `.container()` funnels through the existing `addClass` (`tag.ts:102`) and emits only existing utilities `max-w-* mx-auto px-* sm:px-* lg:px-*`. There is **no new per-node mechanism**: `.container()`/`.htmxIndicator()` are prototype methods doing string `+=` like every other fluent method. The hot path (string concat, charCode escape) is untouched. This attack fails.

- **perf failure mode 2 — does it route through the fold/algebra layer?** No. Nothing in the API touches `foldView`/`paraView`/`renderAlgebra`. The `og` object → `<meta>` derivation runs **once per `Document()` call**, not per render node. This attack fails.

- **perf failure mode 3 — async on the sync path?** No. The RFC §"Guardrail check §11.2" and the §5.5 note are explicit: the only `ssr-only` risk (F-B-035 context-surviving-await) is *deferred* to RFC-B-06; this RFC uses **only** the synchronous `using _ = ctx.scope()` happy path. No `await`, no `AsyncLocalStorage`, no async children. Correct posture; this attack fails.

- **perf failure mode 4 — context cost.** `createLayoutContext` *is* `createRequiredContext`: O(1) `stack.push`, and read is `stack[stack.length-1]` (O(1), `context.ts:114-118`). The one cost — the per-scope `Disposable` alloc — is paid **once per request** (one `.scope()` in the render handler), not in the hot 1000-scope loop the recon flags. One Disposable/request is negligible vs. the ~65 KB/request already spent constructing the tree. Glancing blow only, and only under misuse (see changes).

So why not a clean `survives`? Three **latent** per-node / per-request foot-guns the RFC leaves unconstrained, which would silently move cost onto the hot path if an app (or a future codemod) wires them naively:

- **(a) `HtmxIndicatorStyles()` per-partial-swap.** The CLAUDE.md default is *full-layout swaps targeting `ids.mainContent`* — but inline indicators and partial swaps exist. If a partial response re-runs `HtmxIndicatorStyles()`/`LoadingBar()`, the canonical CSS is emitted **per response** — an unbounded byte tax and a duplicate-`<style>` correctness smell. The RFC says "injected once" but never *enforces* once.

- **(b) per-node context read in `NavItem`.** `NavItem` takes `active: boolean` as a prop (good — read once in `chrome`). But nothing *prevents* a future variant where `NavItem` reads `LayoutCtx.current` internally. With N nav items that is N stack-top reads plus leaf-to-scope coupling, converting an O(1)/request read into O(N). Must be forbidden in the contract.

- **(c) per-render closure allocation in `.apply(brandNavColors)`.** The worked example maps `items.map(item => NavItem(...).apply(brandNavColors))`. If `brandNavColors` is a module constant this is free; if it's an inline closure built per render, each nav row allocates one. Nav is ~5-10 items so absolute cost is tiny — but the *taught idiom* must pin style-fns to module constants so the pattern doesn't normalize per-render closure churn that ForEach-heavy lists would amplify.

None is a hot-path regression *as designed* — they are unconstrained edges the RFC's own "injected automatically once" / "read it in chrome" language gestures at but does not nail down. Under default-reject, an additive API that *can* be wired to tax the hot path needs the constraint written into the contract, not left implicit.

## Does it survive?

**survives-with-changes.** The core design is perf-clean: it is sugar over the exact `Tag` chains apps already build, never touches the fold layer, adds zero per-node mechanism, and keeps all async strictly deferred to RFC-B-06. The synchronous hot path (`renderImpl`) is provably untouched — the strongest perf attacks (per-node tax, fold routing, async on sync path) all fail.

The required changes are guardrails, not redesigns: pin once-per-document indicator/style emission, forbid per-node context reads in nav primitives, pin `.apply()` style-fns to module constants, cap context to one scope/request, and add a perf-smoke assertion that `Document()`/`Shell()` render within +5% of the hand-rolled baseline. With these folded in, nothing in this RFC can move cost onto the synchronous SSR hot path.

## Guardrail check (§11.2 — SSR-only, synchronous render path stays fast)

**Pass with the listed changes.** No async on the sync path (deferred to RFC-B-06; only the synchronous `using` scope is used). No new per-node allocation or per-node fold traversal. The primitives run once per page; `createLayoutContext` adds one Disposable/request (negligible vs. the ~65 KB/request construction baseline). The +5% perf-smoke gate makes the "no hot-path tax" claim verifiable rather than asserted. Track D owns de-recursion/streaming; this RFC neither helps nor hinders it — the doctype is a real first node, so a deeply nested `Document` body hits the same ~3.5k recursion ceiling as any tree (out of scope here, not introduced here).
