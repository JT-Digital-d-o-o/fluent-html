---
rfc: RFC-A-007
lens: correctness
verdict: survives-with-changes
confidence: 0.78
killer_objection: null
required_changes:
  - "Fix 1 (buildStatusConfig spaced-swap) is a NO-OP that does not fix the cited bug and ships on an unverified, self-contradicting htmx-grammar claim — it must be either (a) cut from this RFC and re-scoped, or (b) replaced with a fix whose emitted bytes actually differ from v6.0.0 and that is pinned to a confirmed htmx hx-status parse."
  - "Resolve the contradiction between RFC line 86 (prose: 're-prefix each modifier as its own swap: token / htmx merges repeated swap:') and line 92/94 (code: pushes the BARE modifier `scroll:top`, never `swap:scroll:top`). The code does not implement the prose. Pick one and prove it against htmx."
  - "F-A-121 explicitly includes spaced `target`/`select` values (e.g. `target: \"closest tr\"`) in the same delimiter-collision class. RFC-A-007 claims to resolve F-A-121 but its Fix 1 only touches `swap` and leaves `target`/`select` orphaning unaddressed. Either expand the fix to cover them or drop F-A-121 from `resolves:`."
  - "Honor the discovery directive (F-A-121 & F-A-141 both: 'Validate the chosen direction against the htmx 4 hx-status grammar in Wave 2'). Add a test pinned to the confirmed htmx parse of a multi-word hx-status value before merge; do not ship on assertion."
  - "Add the missing regression tests this RFC implies but omits: (Fix 2) `.trigger(\"123\").trigger(\"itemSaved\")` keeps both; `.trigger(\"itemSaved\")` alone still serializes byte-identically to `\"itemSaved\"` (guards existing test/patterns.ts:114); (Fix 3) `{ ignore: true }` → `hx-disable` exactly, and `boolVal('ignore')` removal does not leave a dead key."
---

# Verdict: RFC-A-007 — correctness lens

> Adversary stance: kill it. Default reject under uncertainty.

## Attack

The RFC bundles three independent serialization fixes. Two are correct; one — the
headline "grammar repair" (Fix 1, the spaced hx-status swap) — is wrong in a way
that defeats the RFC's own title and its `impact: high` framing.

### correctness failure mode 1 — Fix 1 is a verified NO-OP that claims to fix a bug

The current serializer (`src/render/serialize.ts:213`) does:

```ts
if (cfg.swap) parts.push('swap:' + cfg.swap);   // cfg.swap = "outerHTML scroll:top"
// → "swap:outerHTML scroll:top"
```

The RFC's proposed replacement splits on space and re-pushes:

```ts
const [style, ...mods] = cfg.swap.split(' ');   // ["outerHTML", "scroll:top"]
parts.push('swap:' + style);                    // "swap:outerHTML"
for (const m of mods) parts.push(m);            // "scroll:top"   (BARE — not "swap:scroll:top")
// → join(' ') → "swap:outerHTML scroll:top"
```

The emitted byte string is **identical** to v6.0.0 — the RFC admits this verbatim
(lines 168–172: *"The byte string is similar … existing single-word-swap output is
byte-identical"*; and the after-comment on line 169 reproduces the exact same
string as the before on line 163). This is a logical contradiction:

- If `swap:outerHTML scroll:top target:#errors` genuinely corrupts htmx's parse
  (the stated bug, F-A-141/F-A-121), then a fix that emits the **same bytes** has
  not fixed it.
- If the bytes are fine, there was no bug and Fix 1 is dead code churn.

Either way Fix 1 does not earn its place. The other two fixes change real bytes
(`hx-ignore="true"` → `hx-disable`; the trigger accumulator removes the parse-back
data-loss). Fix 1 does not.

### correctness failure mode 2 — the load-bearing justification is unverified and self-contradicting

The only thing that could rescue Fix 1 is the claim on line 86: *"htmx merges
repeated `swap:` directives onto the swap spec."* But:

1. It is asserted, not verified. Both source findings explicitly deferred this to
   Wave 2: F-A-121 *"confirm htmx's actual hx-status parsing"*; F-A-141 *"Validate
   the chosen direction against the htmx 4 hx-status grammar in Wave 2."* The RFC
   never did. The "Open questions" section even ends by asking someone to *"Confirm
   the exact htmx 4 attribute name … before merge"* — i.e. the grammar is admittedly
   still open while the fix is proposed as ready.
2. The code does not implement the prose. The prose says re-prefix each modifier as
   `swap:<modifier>`; the code (line 94) pushes the **bare** modifier (`scroll:top`),
   exactly as today. So even granting "htmx merges repeated `swap:`," the proposed
   code does not produce repeated `swap:` tokens. The argument describes a different
   fix than the one shipped.

### correctness failure mode 3 — Fix 1 under-resolves F-A-121

`resolves: [F-A-121, ...]`. F-A-121 states the collision hits *"any `target`/`select`
… value that contains a space (`target: \"closest tr\"` style selectors)"*. Fix 1
touches only `swap`. A status config `{ target: "closest tr" }` still emits
`target:closest tr`, orphaning `tr` — the exact bug F-A-121 describes, left
unfixed while the RFC marks F-A-121 resolved. That is a false resolution claim.

### What survives clean

- **Fix 2 (trigger accumulator):** correct. The structured `Map` removes the
  `JSON.parse(existing)` round-trip (`patterns.ts:207`) that drops a first trigger
  whose name parses as JSON (`"123"`, `"[1,2]"`). Crucially it preserves the
  existing single-bare-event contract — `serializeTriggers()` returns the bare
  `"itemSaved"` when all triggers are detail-less, so `test/patterns.ts:114`
  (`=== "itemSaved"`) still passes. No public shape change. Genuinely additive bugfix.
- **Fix 3 (`ignore` → `hx-disable`):** correct. `hx-ignore="true"` is not a real
  htmx attribute (the inert claim is right); the bare `hx-disable` is. Removing
  `boolVal('ignore')` from `HTMX_ATTRS:161` and special-casing it in `buildHtmx`
  is the right shape. The shared-name collision with the `disable` selector field
  is real but the RFC correctly parks the breaking rename and ships only the
  additive bare boolean. Acceptable for 6.0.1. (Required: a test pinning the exact
  output and confirming no dead `ignore` key remains.)

## Does it survive?

**survives-with-changes.** Two of three fixes are correct, additive, and
patch-safe; they should ship. But the headline Fix 1 cannot ship as written: it is
a no-op dressed as a grammar repair, justified by an unverified htmx claim that its
own code contradicts, and it falsely claims to resolve F-A-121's spaced-`target`
case. That is a correctness defect in a *correctness* RFC.

This is not a full `reject` only because the defect is severable: Fix 1 can be cut
or re-scoped without touching the two sound fixes. If the author insists Fix 1 and
the trigger/ignore fixes are one indivisible unit, this flips to `reject` — Fix 1
in its current form must not land.

Required changes (fold back into the RFC), see front-matter list. In short:
1. Cut Fix 1 or replace it with a fix whose bytes actually change AND that is
   pinned to a confirmed htmx hx-status parse (verify, don't assert).
2. Reconcile the prose/code contradiction (bare modifier vs. repeated `swap:`).
3. Either extend the fix to spaced `target`/`select` or drop F-A-121 from `resolves`.
4. Add the regression tests for all three fixes (the RFC ships none).

## Guardrail check (correctness owns "the emitted bytes are right")

- **additive-only / patch-safe:** Fixes 2 and 3 hold (no public shape change;
  single-bare-trigger output byte-identical; `hx-ignore="true"` was inert so its
  change regresses nothing). Pass.
- **emitted-bytes-correct:** FAILS for Fix 1 — output is unchanged from the broken
  v6.0.0 bytes, so the cited corruption (if real) persists; if not real, the change
  is unjustified. This is the lens's core failure.
- **escape-by-default:** unaffected; values still route through `escapeAttr`
  (`serialize.ts:204`). No XSS regression introduced. Pass.
