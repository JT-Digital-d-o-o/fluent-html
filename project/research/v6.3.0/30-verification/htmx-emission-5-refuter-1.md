# Verdict: htmx-emission-5 — NOT REFUTED (finding confirmed)

**Finding:** HxSwap JSDoc promises a string escape hatch the type doesn't have; valid htmx 4 swap specs unrepresentable.
**Mode:** refute-by-code-reading. **Result:** could not refute; defect positively confirmed.

## Evidence

### 1. The JSDoc/type contradiction is literal and unambiguous

`src/htmx.ts:56-66`:

```typescript
/**
 * HTMX Swap type with deep autocomplete.
 * ...
 * Also accepts any valid swap string for patterns not covered.   // line 64
 */
export type HxSwap = HxSwapStyle | SwapWithModifier | SwapWithTwoModifiers;  // line 66 — closed union
```

No `| (string & {})` member. The sibling types in the same file DO carry it:
- `HxTrigger` (src/htmx.ts:141-150) ends with `| (string & {})` and its JSDoc makes the same "also accepts any valid trigger string" promise — there it is true.
- `HxSync` (src/htmx.ts:160-168) likewise ends with `| (string & {})`.

So the JSDoc claim at line 64 was evidently copied from the HxTrigger pattern but the type never got the widening member. This is a self-contained inconsistency; no external htmx-spec knowledge is needed to confirm it.

### 2. tsc empirically confirms the rejections

Probe file assigning the finding's three example strings to `HxSwap` (tsc 5.x, strict):

```
error TS2820: Type '"innerHTML settle:250ms"' is not assignable to type 'HxSwap'. Did you mean '"innerHTML settle:200ms"'?
error TS2322: Type '"beforeend show:bottom showTarget:#other"' is not assignable to type 'HxSwap'.
error TS2820: Type '"outerHTML swap:1s settle:1s"' is not assignable to type 'HxSwap'. Did you mean '"outerHTML settle:1s"'?
```

The first error is particularly damning: the library's own grammar treats `settle:<time>` as a valid modifier family (`SwapTimingValue`, src/htmx.ts:39), but `DelayValue` (src/htmx.ts:16) is a closed 5-value set (`'100ms' | '200ms' | '300ms' | '500ms' | '1s'`). htmx parses timing intervals generically (any `Nms`/`Ns`), so `settle:250ms` / `swap:2s` are legal per the very grammar dimension the type models — rejected purely because the magic-value list omits them.

### 3. No sanctioned typed escape hatch exists — checked every surface

- `HTMX.swap` (src/htmx.ts:208), `HxOptions` (src/htmx.ts:290, inherits via `Partial<Omit<HTMX,...>>`), `HxStatusConfig.swap` (src/htmx.ts:179) — all `HxSwap`.
- `Partial(target, content, swap)` (src/patterns.ts:39) — parameter typed `HxSwap`.
- `setHtmx` overloads (src/core/htmx-methods.ts:16-17) — take `HTMX` / `HxOptions`; no wider swap path.
- `reswap(strategy: HxSwapStyle | string)` (src/patterns.ts:236) DOES accept `string`, but it only covers the server-side `HX-Reswap` response header — not element attributes, so it is no workaround for `hx()`/`setHtmx`/`Partial`.
- The only element-side workaround is generic `.addAttribute("hx-swap", "...")` (src/core/tag.ts:188) — an untyped catch-all that the project's own guidelines forbid for standard props, and which cannot be combined with the swap slot of a typed route callable or `Partial()`'s parameter. It does not qualify as "sanctioned," and in any case it does not cure the false JSDoc claim.

## Attempted refutations and why they fail

1. **"The escape hatch exists somewhere else"** — checked all swap-typed surfaces above; only `reswap` (response header) is wider, which does not cover the attribute-emission path the finding targets.
2. **"The example strings aren't valid htmx 4 grammar"** — even granting uncertainty about `showTarget:`/`scrollTarget:` (unverifiable offline), the `settle:250ms` and dual-timing cases are rejected solely by the arbitrary 5-value `DelayValue` set within a modifier family the type itself endorses. And the JSDoc/type contradiction (claim of a string fallback that does not exist) holds regardless of which specific strings are valid.
3. **"JSDoc is aspirational / intentional narrowing"** — untenable given HxTrigger and HxSync in the same file pair the identical JSDoc phrasing with an actual `| (string & {})` member; HxSwap alone has the promise without the member.

## Conclusion

The finding is accurate on all three legs: the JSDoc claim is false, the union is closed unlike its documented-identical siblings, and concretely legal swap strings (at minimum the timing cases) are unrepresentable with no typed workaround. **Not refuted.**
