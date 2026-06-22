---
rfc: RFC-A-05
lens: breaking-change
verdict: survives-with-changes
confidence: 0.72
killer_objection: "`Context<T>` is a publicly exported type; adding the required members `bind` and `update` to it is a structural-typing breaking change for any app that *implements* or assigns to `Context<T>` (test fakes, mock contexts, wrapper adapters). The RFC marks `breaking: false` and asserts \"no signature changes\" — true for callers, false for implementers. This breakage is real, not codemod-able by find/replace, and is currently unmarked."
required_changes:
  - "Reclassify the `Context<T>` type extension honestly: either mark `breaking: additive` with an explicit note that adding required `bind`/`update` members can break consumers who supply their own `Context<T>` objects (test fakes, adapters), OR make `bind`/`update` OPTIONAL on the public `Context<T>` type (`bind?`, `update?`) and assert their presence internally — so existing structural implementers keep compiling. Pick one and state it in `Migration & compatibility`."
  - "Add a `breaking-changes.md` entry (or an 'adoption note' explicitly flagged as a potential compile/test break) covering: (a) the `Context<T>` member additions, and (b) the `createRequiredContext` error-message text change — any app asserting on the old message string (`expect(err.message).toContain('Wrap the call in')`) breaks at test time. Grep apps/tests for error-message assertions before shipping."
  - "Resolve, do not ship as 'proposed', the `update()` semantics on `createContext` when only the default frame is present (stack length 1), and define `current` after `renderWithScopes` returns. An undecided mutation contract is itself a future breaking change — pin it before merge."
  - "Bundle the template migration (`projects-template/templates/full-stack/src/core/i18n/i18n.plugin.ts` + the 5 production apps) into the SAME migration note as the symbol additions. The old `onRequest`/`onResponse` pattern still compiles but is now declared a concurrency hazard — bundle the discouraged-pattern guidance with the additive surface so adopters migrate once."
file: /Users/tony/jt-digital/fluent-html/product/research/v6/30-verification/V-RFC-A-05-breaking-change.md
---

# Verdict: RFC-A-05 — breaking-change lens

> Adversary brief: kill this RFC through hidden/unmarked breakage. Default reject under uncertainty.

## Attack

The RFC's compatibility story rests on one sentence: **"Additive — nothing breaks … no signature changes."** That is the *caller's* view. The breaking-change lens looks at *implementers* and *behavioral* contracts, and there it does not hold.

- **breaking failure mode 1 — public `Context<T>` gains required members.** `Context<T>` is exported from `src/control/index.ts` and re-exported from `src/index.ts` (`export type { Context }`). The RFC adds **two required members** to it: `bind(value): ScopeBinding<T>` and `update(value): void`. TypeScript is structural: any consumer who *produces* a `Context<T>` value — not just calls one — must now also provide `bind` and `update`. Real instances exist in app code: hand-rolled test fakes (`const ctx: Context<string> = { current, scope }`), mock contexts in view-test setup, and thin wrapper/adapter objects. After this RFC those objects stop type-checking. This is **non-codemod-able** (a codemod cannot synthesize a correct `bind`/`update` for an arbitrary fake) and is exactly the breakage guardrail §11.5(a)/(c) and §13's "Guardrail drift — a breaking API sneaks into a minor" exist to catch. The frontmatter `breaking: false` is inaccurate.

- **breaking failure mode 2 — error-message string change is a silent test break.** F-A-091 rewrites the `createRequiredContext` throw text from `Context "X" accessed outside of a scope. Wrap the call in X.scope(value).` (`src/control/context.ts:116`) to a multi-line message. Apps and the library's own tests routinely assert on error-message substrings. Any `toContain("Wrap the call in")` assertion breaks. Error-message text is part of the observable test contract; changing it is a behavioral break the RFC does not flag and no codemod fixes.

- **breaking failure mode 3 — unresolved `update()`/default-frame semantics.** The Open Questions leave `createContext` length-1 (default frame) `update()` behavior as "proposed: yes." Shipping an API whose mutation semantics on the default frame are undecided means the *behavioral* contract is unpinned — a later tightening (throw instead of overwrite) would itself be breaking. Pin it now so the contract is stable from v6.0.

- **What is NOT breaking (credited).** The `scope()` internal rewrite (frame object + `lastIndexOf`/`splice` + idempotent dispose) is genuinely observation-compatible for all strictly-LIFO `using` callers — same external contract, the `current` getter still reads the top frame, and idempotent dispose only *removes* a latent corruption rather than changing a defined behavior. The new free functions (`scopeAll`, `renderWithScopes`, `renderWithNonceAndScopes`) and the `fluent-html/testing` subpath are purely additive, including the `package.json` `exports` entry. So the RFC is *mostly* additive — the failure is honesty of marking and one undecided contract, not a catastrophic redesign.

## Does it survive?

**survives-with-changes.** The core value — a concurrency-safe request-wiring API that closes a real, evidenced data-corruption bug (F-A-031) — is sound, and the bulk of the surface is genuinely additive. But the RFC ships two unmarked breaks (public-type member additions; error-message assertion breakage) and one undecided behavioral contract. Under the default-reject posture these are not fatal: they are precisely fixable and do not touch a guardrail's hard floor. They simply cannot ship as `breaking: false` / "nothing breaks."

The cleanest fix preserving a truthful `breaking: false` is making `bind?`/`update?` **optional** on the exported `Context<T>` (presence-checked internally), so structural implementers keep compiling; then only the error-message change remains, downgraded to an explicit adoption/test note. If the authors prefer required members for ergonomics, they must flip frontmatter to `breaking: additive` and own the `breaking-changes.md` entry. Either path, plus pinning the `update()` default-frame semantics and bundling the template/app migration, folds the breakage into one honest migration.

## Guardrail check (breaking-change owns §11.5)

- §11.5(a) codemod-able where possible: **fails as written** — adding required `Context<T>` members is not codemod-able for arbitrary user-supplied implementations. Fixed by the optional-member route, or accepted-with-migration.
- §11.5(b) bundled into one migration: **currently absent** — RFC says "no entry (additive)." Required change adds the entry and bundles the template + 5-app migration.
- §11.5(c) justified by impact: **yes** — the concurrency-corruption bug (F-A-031) is high-impact and well-evidenced; the breakage cost is small relative to the fix.
- §11.2 sync hot path: untouched — `scope()` stays O(1) push; dispose cost is bounded by live scope depth (single digits). Not this lens's call, but consistent with no regression.
