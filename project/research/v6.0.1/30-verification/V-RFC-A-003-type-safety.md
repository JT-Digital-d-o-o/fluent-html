---
rfc: RFC-A-003
lens: type-safety
verdict: survives
confidence: 0.82
killer_objection: null
required_changes: []
---

# Verdict: RFC-A-003 — type-safety lens

> ADVERSARY note: I tried to kill this as (a) a type-shape break smuggled into a
> patch, (b) a bare-`string` surface widening, (c) a types-lie-about-runtime
> regression. None lands hard enough to reject.

## Attack

- **type-safety failure mode 1 — types now lie about runtime (the strongest shot).**
  After this fix, `Div("x").setId("a").addAttribute("id", "b")` still **compiles**
  (the shipped `addAttribute(key: string, value: string)` signature accepts
  `"id"`), and `.addAttribute("class", …)` / `.addAttribute("style", …)` /
  `.addAttribute("disabled", "")` all type-check as if they set the attribute —
  but the engine now *silently drops* them. The type system asserts a write that
  runtime discards. That is exactly the "no bare `string` where a literal union
  fits" smell (guardrail #4): `addAttribute`'s key is bare `string`, and these
  reserved/boolean collisions are precisely the cases a literal-excluding overload
  would catch at compile time. The RFC chose runtime least-astonishment over a
  type-level guarantee.
  → **Does not reject.** The RFC names this exact gap, identifies the correct
  type-level fix (an `addAttribute` overload excluding `'id' | 'class' | 'style'`),
  and *correctly parks it as breaking* (`ships_to: parked-major`) rather than
  smuggling a narrowing into 6.0.1. Guardrail #4 governs *new* public surface; it
  does not compel retrofitting an already-shipped `addAttribute(string)` signature
  inside a patch, and doing so would violate guardrail #5 (no break in a patch).
  The RFC is type-*honest* about the residual gap, which is the disciplined call.

- **type-safety failure mode 2 — bare-`string` surface widening / `any`.**
  Checked: the only new symbol is `RESERVED_BAG_KEYS = new Set<string>(['id',
  'class', 'style'])` — a module-level, closed, `@internal` constant. No exported
  type added or changed (`api_surface: []`); `toggle`/`addAttribute`/`buildAttrs`
  signatures are byte-identical. No `any` introduced. The public `.toggle()`
  constraint stays the **closed** `BooleanAttribute` union
  (`src/elements/html-types.ts:58`, verified — no `(string & {})` hatch), and the
  `BOOLEAN_ATTR_RE` runtime choke point (`serialize.ts:284`) is preserved as the
  net for `as any` callers. No widening.

- **type-safety failure mode 3 — dedup misses a typed-attribute path (`_sk`).**
  The dedup loop skips `RESERVED_BAG_KEYS` and the generic bag but **not** the
  `_sk` element-attribute set (`serialize.ts:245-260`). I checked every
  `defineSchemaKeys(...)` call across `src/elements/**`: *no* `_sk` key name
  overlaps any `BooleanAttribute` value (boolean attrs are emitted exclusively via
  the `toggles` path, never via `_sk`). So a toggle-vs-`_sk` duplicate is
  architecturally impossible and the omission is sound. A `_sk`-vs-generic-bag
  collision (e.g. `Meter().setValue(…)` + `addAttribute("value", …)`) is
  pre-existing, out of this RFC's stated scope (reserved set = id/class/style
  only), and not a type-safety defect.

## Does it survive?

**survives** (confidence 0.82).

The type-safety lens is satisfied: no public type shape changes, no bare-`string`
surface added, no `any`, the closed `BooleanAttribute` union and its runtime guard
are untouched, and the one genuine type-level improvement is correctly identified
as breaking and parked rather than smuggled into the patch. The residual "types
permit a write the engine now drops" gap is real but is (a) pre-existing in the
shipped `addAttribute(string)` signature, (b) explicitly acknowledged, and (c)
only closeable via a parked-major change — so it cannot be held against a 6.0.1
behavior fix under this lens.

Minor non-blocking note (not a required change, doc accuracy only): the RFC speaks
of "two serializer copies" needing lockstep duplicate-name fixtures, but `render`
and `renderToIterable` both call the single shared `buildAttrs` (`serialize.ts:337`
and `:417`) — the dedup logic is not duplicated. The parity fixture is still worth
adding, but the lockstep-divergence risk is overstated. This does not affect the
type-safety verdict.

## Guardrail check (type-safety, owned by this lens)

PASS. No bare `string` where a literal union fits is *introduced*; the closed
`BooleanAttribute` union remains the sole public `.toggle()` input type; the new
`RESERVED_BAG_KEYS` is a closed internal `Set`; no `any`; no public signature
shape change (consistent with additive-only/patch guardrail #5). The known
type-level tightening (`addAttribute` literal-excluding overload) is correctly
deferred to `parked-major`.
