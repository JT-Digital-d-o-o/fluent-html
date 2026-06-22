---
rfc: RFC-D-07
lens: correctness
verdict: survives-with-changes
confidence: 0.74
killer_objection: "Adding `get()` as a required member of the `TagAttrs` interface breaks the only two sites that construct a `TagAttrs` (fold.ts:10, para.ts:9) — they build a plain object literal with no `get` method, so they stop compiling. The RFC's impl section shows no change to `extractAttrs`, and its 'additive / nothing re-signatured' claim is therefore false as written."
required_changes:
  - "Update `extractAttrs` in BOTH src/fold/fold.ts:9-28 and src/fold/para.ts:9 to attach a `get` implementation (or make TagAttrs a class with a method). The RFC's `## Proposed API` and impl block must show the `extractAttrs` change; otherwise the object literals at fold.ts:10 and para.ts:9 fail to satisfy `TagAttrs` (missing `get`)."
  - "Specify `get`'s implementation against the actual extracted shape: element attrs live BOTH as top-level own-keys (copied by the loop at fold.ts:21-25, e.g. `href`) AND in `attrs.attributes` (custom map). `get(key)` must check both and return `undefined` for non-string values. State the precedence (top-level then `attributes`) — links.ts reads `attrs.href` (top-level) but aria-describe.ts:32 reads `attrs.alt ?? attrs.attributes?.alt` (both), so the single accessor must replicate that fallback or it silently regresses aria-describe."
  - "Resolve the `get` vs index-signature interaction explicitly: with `[key: string]: unknown` present, `attrs.get` is reachable as `unknown` via index access in some positions; pin the method declaration order/typing so `attrs.get('href')` resolves to the method signature, not the index. Add a test that a custom algebra calling `attrs.get('href')` type-checks AND returns the value."
  - "Fix the `RawCtx` drop-in claim: render.ts:184/239 and stream.ts:120/180 pass `isRawContext` (currently `boolean`) THROUGH as `childCtx` for the non-script/style case. Converting `boolean | string` → `RawCtx` is not a pure rename — the `=== false`/`typeof === 'string'` branches and the `childCtx = ... : isRawContext` pass-through must be rewritten to the 4-member union. The RFC must show the new branch structure, not just the type alias, and confirm `true`→`'raw'` mapping preserves the current implicit passthrough (today `true` is never compared — it's the fall-through default)."
  - "Fix the setStyles concat edge cases: with the proposed `this.style + '; ' + s`, a prior `setStyle('position: relative;')` (trailing semicolon — a legal, common input) yields `'position: relative;; width: 100px'`. Either normalize/trim trailing `;` or document that callers must not pass trailing semicolons. Also confirm behavior when prior `style` is an empty string `''` (falsy) vs `undefined` — both must take the no-prefix branch (the `this.style ?` ternary handles `''` correctly, but state it)."
  - "Lower the confidence on F-D-113 'zero improvement' framing: the 'Full request' bench measures `benchFlatPage()` build cost, but `benchFlatPage` is itself the harness builder — verify it actually allocates per call (no memoized/cached tree) or the new 'flat-full' line measures nothing new. Cite the `benchFlatPage` body."
file: /Users/tony/jt-digital/fluent-html/product/research/v6/30-verification/V-RFC-D-07-correctness.md
---

# Verdict: RFC-D-07 — correctness lens

> Adversary brief: kill RFC-D-07 through the correctness failure mode. Default-reject under uncertainty.

## Attack

This RFC bundles six low-risk cleanups, but two of them do not actually work as drawn, and one supporting claim is unverified. Under the correctness lens the headline `TagAttrs.get()` change is the killer.

- **Correctness failure mode 1 — `TagAttrs.get()` breaks its own construction sites (KILLER).** The RFC adds `get(key): string | undefined` as a **required** member of the `TagAttrs` *interface* (Proposed API lines 94-95). But `TagAttrs` is never a class instance — it is a plain object literal built in exactly two places:
  - `src/fold/fold.ts:9-28` — `const attrs: TagAttrs = { id, class, style, attributes, htmx, toggles }` then a loop copying element-specific own-keys.
  - `src/fold/para.ts:9` — identical `extractAttrs`.

  Neither assigns a `get` method. Adding `get` to the interface makes both literals fail to satisfy `TagAttrs` (TS2741: property `get` missing). The RFC's impl block (lines 107-128) shows `defineSchemaKeys`, `setDiscriminant`, `setStyles`, `replaceStyles` — but **no change to `extractAttrs`**. So the RFC as written does not compile, and its compatibility section's central promise — *"Additive. Nothing in the public surface is removed or re-signatured… Old algorithms keep compiling"* (line 239-242) — is false for the producers. It's additive for *consumers* of `TagAttrs` (algebra authors) but breaking for the *producers*, which the RFC never acknowledges.

- **Correctness failure mode 2 — `get()` semantics underspecified vs the real two-location attr storage.** Element attrs are not stored in one place. The copy loop at `fold.ts:21-25` lifts subclass own-properties (`href`, `src`) to **top-level** `attrs.href`; but custom `addAttribute` values live in `attrs.attributes`. aria-describe.ts:32/39 already reads **both**: `attrs.alt ?? attrs.attributes?.alt`. The RFC's `get()` JSDoc says it reads "element-specific attribute … falling back to the custom-`attributes` map" — good, but the impl is never shown, the precedence is never stated, and the worked example (links.ts, lines 168-177) only exercises the top-level path. If `get` checks only top-level (as the links example implies), it silently regresses aria-describe's `attributes` fallback. A "typed accessor" that changes lookup semantics is a correctness bug, not a cast removal.

- **Correctness failure mode 3 — `RawCtx` is sold as a rename but is a control-flow rewrite.** The cited flag is `isRawContext: boolean | string` (render.ts:184, stream.ts:120). The dispatch branches on `=== false` and `typeof === 'string'`; the `true` case is the *implicit* passthrough (never compared). Critically, render.ts:239 / stream.ts:180 do `childCtx = el === 'script' ? 'script' : el === 'style' ? 'style' : isRawContext` — passing the boolean **through**. Replacing `boolean | string` with `"escape"|"raw"|"script"|"style"` forces rewriting every comparison and the pass-through, and the `true → 'raw'` mapping must preserve the current "fall through, don't escape" behavior. This is exactly the escape-sensitive code path (§11.3); presenting it as "same runtime branches" (line 321) understates a refactor that, done wrong, flips escaping. Not killer (the security lens owns escape), but the correctness claim "no convention to remember, same runtime branches" is not demonstrated.

- **Correctness failure mode 4 — `setStyles` concat edge cases.** Proposed `this.style ? this.style + "; " + s : s`. `setStyle` (tag.ts:125-128) does `this.style = style` with no trailing-semicolon normalization, and the library's own Overlay/positionStyles use trailing `;` heavily. `setStyle("position: relative;").setStyles({width:"1px"})` → `"position: relative;; width: 1px"` — valid CSS, but the RFC's worked examples promise clean `"a; b"` output and a snapshot/byte test would fail. Minor, fixable, but it's a real wrong-output case the RFC's examples don't cover.

- **Correctness failure mode 5 — F-D-113 'zero improvement' claim unverified.** The RFC asserts the new "Full request" line re-runs construction by calling `benchFlatPage()` inside the measured loop. That only measures construction if `benchFlatPage` allocates a fresh tree each call. I did not confirm `benchFlatPage`'s body has no caching; if it returns a shared/memoized tree the "build + render" line measures nothing new and the F-D-113 fix is a no-op. The RFC should cite the builder body.

## Does it survive?

**survives-with-changes.** None of these are fatal to the RFC's *intent* — they are all fixable, and the four other items (`defineSchemaKeys`/`setDiscriminant` localizing 54 casts, `Overlay` variadic, bench-in-CI, accumulate-on-`setStyles` as a concept) are correct and verified against source (54 `as any` in `src/elements`, confirmed; Overlay's `Div([...])` at overlay.ts:23, confirmed; `setStyles` clobbers at tag.ts:257, confirmed; bench has no assertion and `npm test` omits it, confirmed at package.json:49/51).

But the `TagAttrs.get()` change as drawn **does not compile** and changes lookup semantics without specifying them — that is a correctness defect serious enough to block ship until the `extractAttrs` change and `get`'s two-location lookup precedence are written into the RFC. Default-reject pressure is held off only because the fix is mechanical and the rest of the cluster is sound. The required changes above are the exact deltas that fold back into RFC-D-07.

## Guardrail check (correctness does not own a §11 guardrail)

Adjacent observation for the security/escape verifier: the `RawCtx` conversion touches render.ts:186-187/239 and stream.ts:122-123/180 — the escape-vs-passthrough decision points. Confirm `true → "raw"` keeps the current non-escaping fall-through and that `childCtx` propagation is unchanged before accepting the §11.3 "pass" the RFC self-reports.
