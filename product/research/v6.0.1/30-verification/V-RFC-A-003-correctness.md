---
rfc: RFC-A-003
lens: correctness
verdict: survives-with-changes
confidence: 0.86
killer_objection: null
required_changes:
  - "Gate the reserved-key skip on the dedicated field actually being set. `RESERVED_BAG_KEYS.has(key) && <field> !== undefined` — not an unconditional `continue`. As written, the RFC drops a bag `id`/`class`/`style` even when NO setId/setClass/setStyle was ever called, regressing a single-valid-attribute input to zero attributes (breaks the byte-identical claim)."
  - "Update the worked examples + CHANGELOG to state the precise contract: the bag key is skipped ONLY when the dedicated setter is set; with no dedicated field, `addAttribute('id', x)` still emits `id=\"x\"`."
  - "Add parity/fuzz fixtures for: (a) `addAttribute('id','b')` with NO setId → must still emit `id=\"b\"`; (b) `setId(undefined).addAttribute('id','b')` → emits `id=\"b\"`; (c) the true-collision case `setId('a').addAttribute('id','b')` → emits only `id=\"a\"`. Run through both `emit` and `emitChunks`."
file: /Users/tony/jt-digital/fluent-html/product/research/v6.0.1/30-verification/V-RFC-A-003-correctness.md
---

# Verdict: RFC-A-003 — correctness lens

> Adversarial review. Job: kill the RFC. Default reject under uncertainty.

## Attack

The RFC's two cited bugs are **real and correctly diagnosed** against the shipped code:

- Bug 1 (toggle dup): `Tag.toggle` (`src/core/tag.ts:190`) is a bare `push`; `buildAttrs` (`src/render/serialize.ts:288`) does `toggles.join(' ')` with no dedup. `.toggle("disabled").toggle("disabled")` → `disabled disabled`. Confirmed.
- Bug 2 (id/class/style dup): `buildAttrs` emits the dedicated field (`:238-243`) then iterates the generic bag (`:262-272`) emitting **every** key, and `addAttribute` (`src/core/tag.ts:158`) does not block `id`/`class`/`style`. `setId('a').addAttribute('id','b')` → `id="a" id="b"`. Confirmed.

So the *intent* is sound. The attack lands on the **proposed fix itself**, which introduces a new correctness regression:

- **Correctness failure mode 1 — unconditional reserved-key skip drops a NON-duplicate attribute.** The fix does `if (RESERVED_BAG_KEYS.has(key)) continue;` over the bag *regardless of whether the dedicated field is set*. `tag.id`/`class`/`style` are `string | undefined` (`src/core/tag.ts:58-60`), and `setId(undefined)`/`setClass(undefined)` are valid (`setId(id?: string)`, `:87`). Therefore:
  - `Div().addAttribute("id","b")` — no `setId` ever called. Baseline v6.0.0: `tag.id === undefined`, bag emits → `<div id="b">`. **Under the RFC: dedicated field undefined → nothing; bag key reserved → skipped → `<div>` with NO id.** A single, perfectly valid, NON-duplicate attribute is silently deleted.
  - Same for `addAttribute("class", …)` / `addAttribute("style", …)` on a tag with no fluent class/style.
  This directly **falsifies the RFC's central compatibility claim** ("Output is byte-identical for any tag that was not already emitting a duplicate name", §Compatibility). It is not byte-identical — it deletes attributes that were never duplicated.

- **Correctness failure mode 2 — no test coverage catches it.** A grep of `test/**` shows zero tests exercising `addAttribute("id"/"class"/"style")` (only `data-*`, `role`, etc.). So the regression ships green. The RFC's own mandated fuzz extension only adds *duplicate-name* fixtures — it would not exercise the no-collision `addAttribute('id')` path that regresses.

- **Non-issues checked and cleared (so they are not grounds to reject):**
  - toggle-vs-`_sk` collision: no `BooleanAttribute` name (`disabled`, `checked`, `selected`, `multiple`, `readonly`, `open`, …) is ever emitted via `_sk`; boolean attrs route exclusively through `.toggle()`. No current collision the fix misses.
  - toggle-vs-htmx / bag-vs-htmx: htmx attrs are all `hx-`-prefixed; cannot collide with reserved keys or bare toggle names.
  - The toggle loop's `RESERVED_BAG_KEYS.has(name) continue` is dead code (the `BooleanAttribute` union excludes id/class/style) but harmless.
  - Guardrails: zero-deps (module `Set`), ssr-only, escape-by-default (emits *fewer* attrs, never weakens escaping), additive-only (no shape change), instruction-set (no component), class-vocab (no classes emitted) — all hold. The would-be-breaking `addAttribute` overload is correctly parked.

## Does it survive?

**survives-with-changes.** The RFC correctly identifies two genuine malformed-HTML defects and the dedup mechanism + serialize-time choke-point placement is the right architecture. But the proposed `buildAttrs` body contains a regression: it conflates "key is reserved" with "dedicated setter won", and unconditionally drops bag `id`/`class`/`style` even with no dedicated field present — turning a valid single-attribute output into an empty one and breaking the stated byte-identical guarantee. That is not fatal to the RFC's thesis; it folds back into a one-line guard. Required changes above are mandatory before this can ship to 6.0.1.

Confidence 0.86 in survives-with-changes (the regression is concrete and code-verified; the fix is mechanical and does not disturb the RFC's design). Reserved for the residual chance a reviewer reads the *intended* semantics as "reserved keys are never author-settable via the bag, period" — but even then the fix must not delete a value the baseline emitted in a patch, so the gate is required regardless.

## Guardrail check (correctness)

The correctness lens does not clear this as-is: the fix as written **introduces** a new defect (silent attribute deletion on a non-duplicate input) while fixing two others. With the field-presence gate applied — skip the reserved bag key only when the matching dedicated field `!== undefined`, otherwise emit the bag value as the fallback — every attribute name is emitted at most once AND no previously-valid single attribute is lost, restoring the byte-identical-on-non-duplicate guarantee. Then the lens clears.
