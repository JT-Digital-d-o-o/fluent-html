# Verification: dx-ideas-6 — No `size()` method for Tailwind v4 `size-*`

**Verdict: gap confirmed. Score: 6/10.**

## Gap check

- `src/class-vocab/vocab.ts:112-119` — the Sizing block defines exactly `w`, `h`, `maxW`, `minW`, `maxH`, `minH`, `aspect`. No `size-*` row.
- `src/core/tailwind-methods.ts` — no `size(...)` method exists anywhere on the interface (`grep` hits only `textSize` at line 90 of vocab / 452 of methods and `resize` at 380/880). No overload, alias, or escape hatch other than `addClass("size-10")` covers `size-*`.
- Emitters confirm nothing else produces `size-` classes (the only `size-` string in src is `resize-`).

The claimed missing API is real: a v4-native library (bare `.ring()` already follows v4 1px semantics per project docs) has full w/h/min/max coverage but omits v4's `size-*`, forcing `.w("10").h("10")` or lint-hostile `addClass`.

## Call-site evidence (strict: src / test / examples of this repo)

Weak. Searched for same-value `.w(x).h(x)` pairs (adjacent and same-line):

- **0** same-value pairs in `src/`, `test/`, `examples/`.
- Only 4 lines combine `.w(` and `.h(` at all (`test/fluent-styling.ts:319,683,798`, `bench/render.ts:117`) — all rectangular (`w("full").h("48")` etc.).
- **0** small numeric `.w("3".."24")` / `.h(...)` calls anywhere in the repo; `examples/` uses no w/h at all.

So the "icons, avatars, spinners" pain is not demonstrated by any in-repo call site. It is a plausible downstream-app pattern (square sizing is idiomatic v4), but this repo provides no direct usage evidence.

## Effort check

Very low, fully pattern-following:

- One vocab row `size("size", "size")` next to `vocab.ts:113` — extractor/safelist support comes free via the `sizing` emit kind (`vocab.ts:33-34`).
- One `TailwindSize` union in `src/core/tailwind-types.ts` (mirror `TailwindWidth`/`TailwindHeight` intersection: spacing + `auto|full|min|max|fit` + fractions; note `size-*` supports no `screen`/viewport arms — needs a new union, not a reuse of `TailwindWidth`).
- Two overload declarations beside `w`/`h` at `tailwind-methods.ts:185-188` plus a ~3-line prototype function (identical shape to `p.textSize`).
- Tests + docs entry.

## Scoring rationale

- **For (pushes up):** objectively confirmed hole in an otherwise-complete sizing family; standard, heavily used v4 utility; trivial mechanical implementation with free extractor support; closed-union typing prevents the `addClass("size-10")` lint-hostile workaround.
- **Against (pulls down):** zero call sites in src/test/examples exhibit the double-call pain today, so measured-in-repo value density is entirely prospective; the workaround (`.w("10").h("10")`) is verbose but correct and type-safe.

Net: genuine v4-completeness gap with near-zero cost, but no in-repo demand signal → **6**.
