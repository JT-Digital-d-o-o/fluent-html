# Verification: dx-ideas-3 — htmx 4 `:inherited` attributes have no typed API

**Verdict: gap confirmed. Score: 4/10.**

## Finding summary

README.md (~L474–478) documents explicit htmx-4 inheritance as
`Div(...).addAttribute("hx-confirm:inherited", "Are you sure?")` — a stringly,
hand-composed attribute key. The claim is that the library has no typed path for
per-container inherited attributes, only the global `implicitInheritance` config flag.

## Gap check — CONFIRMED

- `grep -ri inherit src/` yields exactly two hits: `implicitInheritance?: boolean`
  (src/patterns.ts:76, the global `HtmxConfig` opt-in) and the unrelated Tailwind
  color literal `"inherit"` (src/core/tailwind-types.ts:77).
- No method, option, or overload in `src/htmx.ts`, `src/core/htmx-methods.ts`,
  `src/core/tag.ts`, or `src/render/serialize.ts` emits an `hx-*:inherited`
  attribute. The `HTMX` options type has no `inherited` field.
- The README example is therefore accurate: the escape hatch **is** the only
  per-element path, and it bypasses both key autocomplete and value typing
  (e.g. `HxTarget`/Id serialization, `HxSwap` unions, vals JSON encoding).
- Implementation would be cheap-to-moderate: `src/render/serialize.ts` already
  holds a per-key `AttrConfig` table (str/boolOrStr/json serializers, L115–139,
  registry around L155) that an `hxInherit(options)` emitter could reuse with an
  `:inherited` suffix on the attribute name. It also closes a small
  attribute-name-injection surface that raw `addAttribute` keys leave open.

## Demand check — WEAK

Judged strictly on evidence in src/test/examples (and sibling app repos as a
sanity check):

- `test/`, `examples/`: zero `:inherited` occurrences.
- fluent-html-demos, ttl, rideshare, mngmt sources: zero `:inherited`
  occurrences, zero `implicitInheritance` usage.
- The README snippet is the **only** call site in the entire workspace.

The prevailing app pattern (per-element `setHtmx` full-layout swaps, per the
project guidelines) rarely needs container-level inheritance, which is
consistent with the observed zero usage.

## Score: 4/10

- **For:** genuine hole in a library whose core pitch is "no stringly hx-*
  attributes"; the README dogfoods the escape hatch it tells users to avoid;
  low implementation cost by reusing existing serializers; htmx 4's
  non-inheritance default makes the pattern structurally plausible (shared
  `confirm`/`target` across button groups, tables of row actions).
- **Against:** zero real call sites improve today — not one test, example,
  demo, or downstream app uses `:inherited` or even the global flag. Value is
  speculative/API-completeness-driven rather than pain-driven. If shipped, it
  should be a small, narrowly scoped method (`confirm`/`target`/`swap`/
  `headers`/`vals` etc.), not a large surface.
