---
rfc: RFC-D-05
lens: breaking-change
verdict: survives-with-changes
confidence: 0.74
killer_objection: The RFC's frontmatter declares `breaking: additive`, but its own recommended resolution of Open Question 1 — removing `tocCoalgebra` — deletes a PUBLIC export (`src/index.ts:347`), making the change breaking and the marking false. The break is neither honestly marked nor bundled into the migration.
required_changes:
  - "Resolve Open Question 1 BEFORE merge — do not ship with the breaking removal as an open decision. If tocCoalgebra is removed, change frontmatter `breaking: additive` → `breaking: breaking` (or minor) and add the removal to breaking-changes.md with the migration `tocCoalgebra → linkedTocCoalgebra` (and `TocSeed` is also a public export — account for it)."
  - "Acknowledge createTransformAlgebra / addClassToMatching / unfoldView as PUBLIC, documented, tested APIs (test/fold.ts, src/index.ts exports) — not 'library-internal'. The `_sk`-restoration output change to these APIs must be in breaking-changes.md, not dismissed as 're-baseline internal snapshots'. App code that folded over trees containing <a>/<img>/<input> and depended on the current (lossy) output gets changed HTML."
  - "Scope the el() escaping change correctly: the proposed `escapeJs` in `el()` (line 77) alters output for FIVE renderers (toggle/toggleClass/remove/focus/scrollTo), not just toggleClass. Either narrow the change to the interpolated string args only (class/value) and leave el()'s id-interpolation, or document all five as changed. The migration note naming only toggleClass under-states the surface."
  - "rebuildTag depends on a NEW element-name→_sk registry, but _sk today lives only on ~30 subclass PROTOTYPES (AnchorTag, InputTag, …), keyed by class, never by element name. registerSchemaKeys/schemaKeysFor must be populated for every element that currently has _sk, or rebuildTag silently restores nothing for un-registered elements — re-introducing F-D-071/F-D-111 for any element whose registry entry is missed. Make the registry the single source the subclass prototypes also read from, and add a test asserting schemaKeysFor() is non-empty for every element with a prototype _sk."
file: /Users/tony/jt-digital/fluent-html/product/research/v6/30-verification/V-RFC-D-05-breaking-change.md
---

# Verdict: RFC-D-05 — breaking-change lens

> You are an ADVERSARY. Your job is to KILL this RFC through the breaking-change lens.
> Default to `reject` under uncertainty.

## Attack

### Failure mode 1 — `breaking: additive` is a false label (the killer)
The frontmatter declares `breaking: additive` and the Migration section asserts "Additive / bug-fix — nothing well-formed breaks." But **Open Question 1** carries the RFC's own recommendation: *"Recommend **remove `tocCoalgebra`** in v6."* `tocCoalgebra` is a **public export**, not internal:

- `src/index.ts:347` — `tocCoalgebra,`
- `src/fold/index.ts:19` — `tocCoalgebra,`
- `src/fold/algebras/index.ts:7` — `export { tocCoalgebra, linkedTocCoalgebra, TocEntry, TocSeed } …`

Removing a public symbol is a hard breaking change — `import { tocCoalgebra }` stops compiling, no codemod can know the caller wanted `linkedTocCoalgebra` (different seed type `TocSeed` vs `LinkedTocSeed`, so it is not a drop-in rename). `TocSeed` is also publicly exported and would dangle. The RFC ships the breaking decision as an *open question* — i.e. it merges with `breaking: additive` while recommending a break. The break is neither honestly marked nor bundled into the single migration. That is precisely the failure mode this lens exists to catch.

### Failure mode 2 — `_sk` restoration is a behavioral change to PUBLIC APIs, mislabeled "internal"
The RFC defends the output change with: *"a transform that today emits `<a>` (no href) will now emit `<a href=…>` … these are library-internal tests, not app code."* This is wrong on the "internal" claim. `createTransformAlgebra`, `addClassToMatching`, and `unfoldView` are public exports (`src/index.ts`) with public tests (`test/fold.ts:185-239`). Any app that folds `addClassToMatching` over a tree containing `<a>/<img>/<input>/<th>/<time>/…` gets **different rendered HTML** after this RFC — the fix is correct, but it is a behavioral change to a shipped public API surface, and §11.5/breaking-changes must say so. Calling it "re-baseline internal snapshots" hides app-visible output drift.

### Failure mode 3 — `el()` escaping silently widens the output-change surface
The proposed code (line 77) adds `escapeJs` inside `el()` itself: `document.getElementById('${escapeJs(resolveId(value))}')`. `el()` is used by FIVE renderers (`toggle`, `toggleClass`, `remove`, `focus`, `scrollTo` — `behavior-methods.ts:42-83`), not just `toggleClass`. `createId`/`defineIds` do not constrain the id string (`ids.ts:46`), so any id containing `\`/`'` changes output across all five. The migration note names only `toggleClass`, under-scoping the change.

### Failure mode 4 — `rebuildTag` needs a registry the codebase does not have, keyed differently
`_sk` today is attached to ~30 **subclass prototypes** keyed by *class* (`AnchorTag.prototype._sk`, `InputTag.prototype._sk`, …; render reads `tag._sk` at `render.ts:208`). The fold layer builds base `new Tag(element)` whose prototype has **no** `_sk`. `rebuildTag` proposes resolving by *element name* via a brand-new `schemaKeysFor(element)`. If that registry misses even one element, `rebuildTag` silently restores nothing for it — re-opening F-D-071/F-D-111 for that element with no error. This is a correctness-of-the-fix gap that the breaking-change story (single bundled, complete migration) must close with a registry-completeness test.

## Does it survive?

**survives-with-changes.** None of the four findings invalidate the core thesis (route reconstruction through one hardened primitive; escape consistently). The XSS/JS-injection closures (F-D-103/104/115/053) are genuinely additive bug-fixes and well-argued. But the RFC currently **mis-labels its breaking surface**: a recommended public-symbol removal left as an open question under a `breaking: additive` flag, plus a public-API output change dismissed as "internal." Those are exactly the breaks this lens must force into the open. With the four required changes — resolve the `tocCoalgebra` removal decision and re-flag it, put the public-API output changes in breaking-changes.md, scope the `el()` change honestly, and guarantee registry completeness — the breaking surface becomes honest, complete, and bundled. It does not warrant outright reject because nothing well-formed silently breaks at runtime; the defects are in *labeling and scoping*, which fold back cleanly.

## Guardrail check (§11.5 backward-compat — this lens owns it)
- `rebuildTag`/`registerSchemaKeys`/`schemaKeysFor` internal, additive: OK.
- `validateAttributeKey`/`escapeJs` new exports: OK additive.
- `HxStatusKey` tightening: correctly identified as the *type-level* break; only malformed keys (already invalid HTML) fail — acceptable and documented. (Note: `1xx` allowed but `100`/`199` are not valid HTTP statuses — harmless over-wide, Open Question 2.)
- **FAILS as written** on: (a) recommended `tocCoalgebra` public removal under `additive` flag; (b) public fold-API output change labeled "internal." Both must move to breaking-changes.md and the frontmatter must reflect the real classification before this passes §11.5.
