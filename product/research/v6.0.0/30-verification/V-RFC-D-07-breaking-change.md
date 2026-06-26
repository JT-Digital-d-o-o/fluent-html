---
rfc: RFC-D-07
lens: breaking-change
verdict: survives-with-changes
confidence: 0.82
killer_objection: "`TagAttrs.get()` is declared as a method on an interface whose instances are everywhere built as plain object literals (`extractAttrs` in fold.ts/para.ts) and shallow-spread (`{ ...attrs, class }` in transform.ts:76, plus partial literals in toc.ts:104, hylo.ts:31, unfold.ts). A spread copies data props only — the result has no `get`, so any algebra that runs after a transform and calls `attrs.get('href')` throws `TypeError: attrs.get is not a function` at runtime. The RFC labels this `breaking: additive` with `No codemod required`, which is false on both counts: adding a non-optional method to the interface is a compile-break at ≥4 construction sites, and the spread case is a silent runtime break that no codemod can mechanically fix."
required_changes:
  - "Re-specify `TagAttrs.get` so it cannot be a per-instance method: either (a) make `get` a free function `getAttr(attrs, key, guard?)` in the fold public surface, or (b) keep `get` as a method but have `extractAttrs` build TagAttrs via a class/factory (`makeTagAttrs(...)`) and migrate ALL literal/spread sites (`fold.ts:10`, `para.ts:10`, `transform.ts:76`, `toc.ts:104`, `hylo.ts:31`, `unfold.ts`) to it. Option (a) is non-breaking and spread-safe; option (b) requires a codemod the RFC currently denies needing."
  - "Reclassify the frontmatter `breaking` field. `setStyles()` accumulate is a runtime BEHAVIOR change to a PUBLIC method (different bytes out for `setStyle().setStyles()` chains and double `setStyles()`). Mark it `breaking: behavior` (not `additive`) and add it to `breaking-changes.md` proper, not merely a 'non-breaking behavior fixes' footnote. A behavior change to public output that a codemod cannot detect (it depends on call-site intent) is the textbook case §11.5 governs."
  - "Provide the promised codemod scope honestly. The `attrs.X as string` → `attrs.get('X')` rewrite is only safe under option (b) above (method form) AND only at sites where `attrs` originates from a real factory, never from a `{ ...attrs }` spread. State that the codemod is best-effort/lint-flag, not a complete mechanical migration."
  - "If `setStyles` stays silent (per Open Question), add a dev-mode `console.warn` on overwrite of a non-empty `style` for one minor, OR ship `replaceStyles` first and flip `setStyles` semantics in the major. Bundle the flip into the single v6 migration entry; do not let a public-output behavior change land in a minor."
file: /Users/tony/jt-digital/fluent-html/product/research/v6/30-verification/V-RFC-D-07-breaking-change.md
---

# Verdict: RFC-D-07 — breaking-change lens

> Adversary. Job: kill RFC-D-07 through the breaking-change lens. Default reject under uncertainty.

## Attack

The RFC frontmatter declares `breaking: additive` and the Migration section asserts "Nothing in the public surface is removed or re-signatured … No codemod required." Both claims are false, and the gap between the marked breakage and the actual breakage is exactly the failure mode this lens exists to catch (ALGORITHM §13: *"a breaking API sneaks into a minor"*).

- **Breaking-change failure mode 1 — `TagAttrs.get()` is not additive; it breaks construction sites at compile time AND breaks consumers at runtime.** `TagAttrs` is a plain data interface. Its instances are *not* produced by a constructor — they are built as object literals and spreads:
  - `src/fold/fold.ts:10` — `const attrs: TagAttrs = { id, class, style, attributes, htmx, toggles }`
  - `src/fold/para.ts:10` — identical literal
  - `src/fold/algebras/transform.ts:76` — `attrs: { ...attrs, class: newClass }` (shallow spread)
  - `src/fold/algebras/toc.ts:104` — `attrs: { attributes: { href: seed.href } }` (partial literal in a coalgebra seed)
  - `src/fold/hylo.ts:31`, `src/fold/unfold.ts:36` — partial `attrs` literals

  Adding a **non-optional `get(...)` method** to the interface makes every one of those literals a type error (missing `get`). Worse — and uncodemoddable — the spread at transform.ts:76 copies *data properties only*. Even if you bolt a `get` onto the factory output, `{ ...attrs }` strips it. So an algebra composed *after* `addClassToMatching` that calls `attrs.get('href')` throws `TypeError: attrs.get is not a function` at runtime. The RFC's own worked example (links.ts rewritten to `attrs.get('href')`) is precisely an algebra that can run downstream of a transform. This is a silent runtime regression introduced by a change the RFC calls "no app impact, no codemod."

- **Breaking-change failure mode 2 — `setStyles()` is a public-output behavior change mislabeled as a "bug fix (non-breaking)."** Confirmed at `src/core/tag.ts:249-258`: `this.style = styleString` clobbers unconditionally. Flipping it to accumulate changes the rendered bytes for any `setStyle(...).setStyles(...)` chain or repeated `setStyles(...)`. §11.5 is about *backward-compat policy*, not about whether the old behavior was "correct" — a change to public render output that (a) a codemod cannot detect because correctness depends on caller intent, and (b) can silently double-apply a property (`width: 100px; width: 200px`) is exactly a breaking change that belongs in `breaking-changes.md` and a major, not a footnote under "Behavior fixes (non-breaking)." Calling it a bug fix to dodge the migration ledger is the "guardrail drift" symptom verbatim.

- **Breaking-change failure mode 3 (minor) — the codemod is promised but not deliverable as described.** "optional one: rewrite `attrs.X as string` → `attrs.get('X')`" cannot be applied mechanically wherever `attrs` may be a spread result, because the rewrite would convert a working `as string` read into a `TypeError`. The migration tooling story is incoherent with the construction reality above.

## Does it survive?

**survives-with-changes.** The non-`TagAttrs` portions of the RFC are genuinely additive and well-marked, so a full reject is too harsh:
- `defineSchemaKeys` / `setDiscriminant` / `RawCtx` are `@internal`, not exported from `index.ts` — zero app surface, no breakage. Clean.
- `replaceStyles()` is net-new — additive. Clean.
- `Overlay` change is byte-identical (verified: renderer flattens nested arrays; `Div([...])` vs variadic produce the same tree) — pure internal cleanup, no breakage.
- Bench/CI changes touch `bench/` + `test/` + `package.json` only — no shipped code, no breakage.

But two of the six findings carry breakage the RFC actively mismarks, so it cannot ship as written. The required changes (frontmatter, see above) are surgical and fold back cleanly:
1. Re-spec `TagAttrs.get` as a **free function** (`getAttr(attrs, key, guard?)`) — spread-safe, literal-safe, truly additive — or commit to the factory + full migration and stop claiming "no codemod."
2. Reclassify `setStyles` as `breaking: behavior`, put it in the real migration guide, gate it to the v6 major.
3. Honest codemod scope (best-effort lint flag, not mechanical).
4. Loudness mechanism for the `setStyles` flip.

With #1 done via the free-function route, RFC-D-07 returns to genuinely `breaking: additive` for everything except `setStyles`, and `setStyles` is the single honestly-marked behavior change — which is shippable.

## Guardrail check (§11.5 backward-compat — this lens owns it)

- **`defineSchemaKeys`/`setDiscriminant`/`RawCtx`:** internal, unexported → pass.
- **`replaceStyles`, `Overlay`, bench/CI:** additive / non-shipped → pass.
- **`TagAttrs.get` as a method:** FAIL §11.5(a) — not codemod-able (spread strips the method → runtime `TypeError`), and breaks ≥4 in-repo construction sites at compile time. Frontmatter `breaking: additive` is wrong. Fixable by the free-function form.
- **`setStyles` accumulate:** FAIL §11.5(b)/(c) as filed — a public-output behavior change is not in `breaking-changes.md` and is mislabeled `additive`. Fixable by reclassification + migration entry + gating to the major.
