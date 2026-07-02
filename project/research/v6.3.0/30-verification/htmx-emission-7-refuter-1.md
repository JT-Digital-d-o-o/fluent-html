# Verdict: htmx-emission-7 — NOT REFUTED (CONFIRMED)

**Finding:** hx-status HCON value grammar corruptible via typed inputs; 50x wildcards rejected.
**Mode:** refute-by-code-reading. **Result:** could not refute — all three sub-claims positively confirmed against code and htmx 4 docs.

## Sub-claim 1: `swap` typed as full `HxSwap` corrupts the value grammar — CONFIRMED

- `HxStatusConfig.swap?: HxSwap` (`src/htmx.ts:179`). `HxSwap` (`src/htmx.ts:66`) includes `SwapWithModifier` template literals such as `"innerHTML scroll:top"` and even `SwapWithTwoModifiers` (`"outerHTML scroll:top swap:500ms"`).
- `buildStatusConfig` (`src/render/serialize.ts:219-228`) does a naive `parts.push('swap:' + cfg.swap)` and `parts.join(' ')` — no validation, no narrowing, no quoting.
- four.htmx.org, `hx-status` reference, verbatim: **"The value takes space-separated `key:value` pairs."** Supported keys: `swap`, `target`, `select`, `push`, `replace`, `transition`.
- Therefore `{ swap: "innerHTML scroll:top" }` type-checks and emits `hx-status:422="swap:innerHTML scroll:top"`, which per the documented grammar tokenizes as pairs `swap:innerHTML` + `scroll:top` — `scroll` is not a supported hx-status key. The modifier is silently dropped or mis-parsed. No guard anywhere in the emission path.

## Sub-claim 2: `target` typed as full `HxTarget` admits space-containing selectors — CONFIRMED

- `HxStatusConfig.target?: HxTarget` (`src/htmx.ts:180`). `HxTarget` (`src/htmx.ts:82`) is `string | ExtendedCSSSelector`, and the `ExtendedCSSSelector` union **explicitly models** space-containing forms: `` `closest ${string}` ``, `` `next ${string}` ``, `` `previous ${string}` ``, `` `find ${string}` `` (`src/htmx.ts:70-80`). This is not merely a wide-string escape hatch — the library's own typed union invites `"closest form"`.
- Emission: `target:closest form` — under the space-separated pair grammar the target becomes the invalid selector `closest` and `form` is a dangling token. `escapeAttr` escapes quotes only, not spaces; nothing quotes or rejects the value.

## Sub-claim 3: `50x`-style wildcards rejected though valid htmx 4 — CONFIRMED

- `STATUS_KEY_RE = /^(?:[1-5][0-9]{2}|[1-5]xx)$/` (`src/render/serialize.ts:165`) and `HxStatusKey` (`src/htmx.ts:193-195`, `` `${1|2|3|4|5}${StatusDigit}${StatusDigit}` | `${1|2|3|4|5}xx` ``) both exclude `50x`.
- four.htmx.org `hx-status` reference, fetched twice with independent prompts, verbatim:
  - "Supports exact codes, single-digit wildcards (`x`), and range wildcards (`xx`):"
  - Example: `hx-status:404="select:#not-found" hx-status:50x="select:#bad-gateway" hx-status:5xx="swap:none"`
  - "Evaluated in order of specificity: exact match (`404`), then 2-digit wildcard (`50x`), then 1-digit wildcard (`5xx`)."
- Consequence: a documented-valid htmx key is inexpressible. Typed callers hit a compile error; untyped callers (`as any` / JS) hit the render-time throw at `src/render/serialize.ts:207-208`. `status` is `Partial<Record<HxStatusKey, …>>` with no `(string & {})` escape, so there is no workaround short of bypassing the library.

## Refutation attempts that failed

1. **Looked for a runtime guard/normalizer** in `buildStatusConfig` and `buildHtmx` — none; only the key regex exists, and it validates keys, not values.
2. **Looked for an htmx-side leniency** (quoted values, greedy swap parsing) — the docs specify plain space-separated pairs with no quoting mechanism mentioned; and even if htmx supported quoting, the library never emits quotes.
3. **Checked whether existing tests pin a contrary semantic** — `test/htmx.test.ts:169-190` only exercises single-token swap values (`swap:innerHTML`, `swap:none`, `swap:outerMorph`) and space-free targets (`#errors`), so the corrupt paths are simply untested, not sanctioned.
4. **Checked whether the `50x` gap could be doc hallucination** — verified with a second verbatim-quote fetch; `50x` appears in prose, in an example, and in the specificity ordering.

## Notes on the proposal

The proposed fix direction is sound: narrow `HxStatusConfig.swap` to `HxSwapStyle`, restrict/validate `target` against spaces, and extend the key grammar with `[1-5][0-9]x` in both `HxStatusKey` and `STATUS_KEY_RE`. One nuance: the finding's phrase "throwing at render for valid htmx" applies only to untyped callers; typed callers are blocked earlier at compile time — the defect stands either way (valid htmx inexpressible).

**refuted = false, confidence = high.**
