---
rfc: RFC-A-G4
lens: security/escape
verdict: survives-with-changes
confidence: 0.74
killer_objection: "The reworded error message canonizes `.behavior()` as THE replacement, but `.behavior()` emits unescaped JS into `hx-on:*` sinks for `toggleClass` (class arg) and any non-Id target — driving demonstrated error-path traffic onto a latent injection sink without a single trust caveat."
required_changes:
  - "In the reworded blocked-event error string and in both guideline edits, add a one-clause caveat that `.behavior()` option values must be static/trusted, OR scope the headline recommendation to the void/Id-typed behaviors that have no string sink."
  - "Keep the §11.3 entry but make it honest: state that the fix routes traffic onto the existing `.behavior()` emitter (behavior-methods.ts) rather than implying the change is escape-inert; do not let `escape-by-default: pass` launder a downstream gap."
  - "Cross-reference (do not couple) a security seed for Wave-4: `escapeJs` is applied only to `clipboard.value` (behavior-methods.ts:61); `toggleClass.class` (line 53) and `el()` non-Id `String(value)` (lines 39/42) reach the JS sink raw."
---

# Verdict: RFC-A-G4 — security/escape lens

> You are an ADVERSARY. Your job is to KILL this RFC through the security/escape lens.
> Default to `reject` under uncertainty — a good API cut is cheaper than a bad API shipped.

## Attack

The RFC frames itself as escape-neutral ("No new markup-emitting API added"; §11.3 = pass). For its *literally new* surface that is true. But the escape lens does not stop at "what bytes did you add to the emitter" — it asks "where does this change route developer behavior, and is that destination escape-safe?" This RFC's single most-consequential change is behavioral steering, and it steers toward an unescaped sink.

- **Escape failure mode 1 — the reword canonizes an unescaped escape hatch.** The whole point of fixing `tag.ts:27` (F-A-092) is that three apps fell through the vague old message into `addAttribute("hx-on:click", rawJs)`. The fix names `.behavior()` as the blessed replacement, in the thrown error *and* in both guideline blocks (CLAUDE.md insert lines 175-180, fluent-html.md). But `.behavior()` is not uniformly escape-safe. In `behavior-methods.ts`:
  - `toggleClass` (lines 51-54) interpolates `String(opts.class)` **raw** into a JS string literal: `` `...classList.toggle('${String(opts.class)}')` ``. No `escapeJs`. A `class` value containing `')` breaks out of the JS string into the `hx-on:click` handler.
  - `el()` (lines 38-44) interpolates `String(value)` raw for any **non-Id** target into `document.getElementById('${...}')`. The type says `target: Id`, but `resolveId` falls through to `String(value)` whenever `isId` fails, and `as`-casts / `any`-typed locals routinely defeat that at call sites.
  - Only `clipboard.value` (line 61) is run through `escapeJs`. The protection is inconsistent, and the methods the RFC recommends include the unprotected ones.
  Render-time `escapeAttr` (render.ts:225) escapes for the **HTML-attribute** context (`& < > " '` → entities), preventing attribute breakout — but the payload still sits inside a `hx-on` **JS** context, and HTML entity-decoding happens before the handler evaluates, so `&#39;` decodes back to `'` at eval time. Attribute-context escaping is the wrong escaper for a JS sink. This is a real, pre-existing layered-context gap, and this RFC pours the demonstrated error-path traffic straight onto it while advertising it as the safe answer.

- **Escape failure mode 2 — a guardrail checklist that reads "pass" where the honest answer is "pass for my own bytes, but I redirect onto someone else's leak."** §11.3 asserts the XSS guard is intact because the reworded error "still *blocks* `on*` handlers." Verified: `validateAttributeKey` (tag.ts:19-29) still throws on `EVENT_HANDLER_RE = /^on[a-z]/i`, and the reword touches only the message text after the throw condition — the `on*` block is byte-for-byte preserved. But the checklist conflates "I didn't weaken the block" with "the path I send people to is safe." A Wave-4 reader scanning `guardrails_checked: [...escape-by-default...]` treats this RFC as escape-clean and never opens `behavior-methods.ts`. That is exactly how the gap survives another major.

What does NOT kill it (I tried):
- **`.display()`/`.hidden()`/`.on()`/`.at()`/`.transition()`** all write to `tag.class`, escaped at render.ts:204 via `escapeAttr`. Their args are literal-union-typed (`TailwindDisplay`, `VariantState`, `Breakpoint`), so even attacker-controlled-looking input can't reach the class string with arbitrary bytes through the typed path. No new sink; class-attribute context is the correct context for `escapeAttr`. Clean.
- **The error reword itself** interpolates only `${key}` — the already-validated-as-blocked attribute name — and is thrown, never rendered into a page. No injection in the message.
- **The `.when()`/`.apply()` JSDoc fixes** replace a broken `t.children()` example and two `setClass`/`addClass` raw-string examples with typed-method examples. This strictly *reduces* the raw-string-into-class surface the docs teach. Net-positive for escape posture.

So the RFC's own additions are escape-safe. The kill attempt lands only on the steering effect — which is real but is a *documentation/caveat* defect, not a structural sink the RFC creates. That is the line between reject and survives-with-changes.

## Does it survive?

**survives-with-changes.** The RFC adds no XSS sink and preserves the `on*` block verbatim — under the strict "new markup-emitting path" reading it passes, and cannot be rejected on its own bytes. But it cannot pass *clean* either: its headline fix (F-A-092) makes `.behavior()` the official, doc-blessed, error-message-named replacement, and `.behavior()` has an inconsistent, latent JS-context escaping gap that the RFC neither flags nor caveats. Steering known error-path traffic onto an unescaped sink while marking the escape guardrail "pass" is precisely the silent-drift failure the escape lens exists to catch.

Required changes (fold back into RFC):

1. **Caveat the recommendation.** In the reworded error string and both guideline `.behavior()` blocks, add a trust note — `.behavior()` option values (`toggleClass` class, custom targets) must be static/trusted, not user input — or restrict the docs' headline recommendation to the no-string-sink behaviors (`disable`, `back`, `selectAll`, and Id-typed `toggle`/`remove`/`focus`/`scrollTo`).
2. **Honest guardrail entry.** Keep `escape-by-default: pass` for the RFC's own surface, but the §11.3 line must explicitly state the fix *routes onto* `.behavior()` and that behavior-method JS-context escaping is a separate, tracked concern — not silently imply the whole change is escape-inert.
3. **Seed, don't couple.** Record a security seed for Wave-4: `escapeJs` (behavior-methods.ts:85) must cover `toggleClass.class` (line 53) and non-Id `el()` targets (line 39), not only `clipboard.value` (line 61). Fixing it is out of scope for this docs RFC; *flagging* it is not — otherwise this verdict launders a real gap as "escape-clean."

With those three, ship it.

## Guardrail check (escape-by-default)

- **`on*` event-handler block:** INTACT. `validateAttributeKey` (tag.ts:26) still throws on `/^on[a-z]/i`; the reword changes only the message text after the condition. Verified against source.
- **New emitting paths:** NONE. `.display`/`.hidden`/`.on`/`.at`/`.transition` write only to `tag.class`, escaped via `escapeAttr` (render.ts:204), with literal-union-typed args. No unescaped interpolation, no attribute injection, no script sink introduced by this RFC.
- **Residual concern (not introduced here, but amplified):** `.behavior()` emits `hx-on:*` JS with inconsistent `escapeJs` coverage; render-time `escapeAttr` is HTML-attribute-context, not JS-context. The RFC steers traffic here and must caveat it. This is the gating reason the verdict is survives-*with-changes*, not survives.
