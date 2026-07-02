# Verification: type-honesty-5 (refuter 2)

**Verdict: CONFIRMED — not refuted.** Reproduced by tsc probe against `src/htmx.ts`.

## Method

Refute-by-reproduction. Wrote a minimal probe (`probe-swap.ts` in scratchpad) importing `HxSwap` and `HxTarget` directly from `/Users/tony/jt-digital/fluent-html/src/htmx.ts`, checked with:

```
npx tsc --noEmit --strict --allowImportingTsExtensions --skipLibCheck \
  --target es2022 --module esnext --moduleResolution bundler probe-swap.ts
```

## Results

### Claim A — HxSwap is closed despite JSDoc saying it is open: REPRODUCED

`src/htmx.ts:64` JSDoc: *"Also accepts any valid swap string for patterns not covered."*
`src/htmx.ts:66`: `export type HxSwap = HxSwapStyle | SwapWithModifier | SwapWithTwoModifiers;` — no open tail.

All three swap strings from the finding are compile errors, exactly as claimed:

```
error TS2820: Type '"innerHTML swap:250ms"' is not assignable to type 'HxSwap'. Did you mean '"innerHTML swap:200ms"'?
error TS2820: Type '"outerHTML swap:500ms settle:100ms"' is not assignable to type 'HxSwap'. Did you mean '"outerHTML settle:100ms"'?
error TS2820: Type '"innerHTML scroll:#log:bottom"' is not assignable to type 'HxSwap'. Did you mean '"innerHTML scroll:bottom"'?
```

All three are valid htmx swap values: htmx accepts arbitrary timing values for `swap:`/`settle:` (not just the 5 literals in `DelayValue`, htmx.ts:16), allows combining `swap:` and `settle:` modifiers, and supports `scroll:<selector>:top|bottom`. Control cases (`"outerMorph"`, `"outerHTML scroll:top"`, `"outerHTML scroll:top swap:500ms"`) compiled fine, so the errors are the closed grammar, not probe setup.

### Claim B — HxTarget collapses to `string`: REPRODUCED

`src/htmx.ts:69`: `type StandardCSSSelector = string;`
`src/htmx.ts:82`: `export type HxTarget = StandardCSSSelector | ExtendedCSSSelector;` → the union absorbs into `string`.

Probe results (no errors on any of these lines):

```typescript
const b1: HxTarget = "closest ]][ not a selector";   // compiles
const b2: HxTarget = "complete garbage %%%";          // compiles
type IsString<T> = [T] extends [string] ? ([string] extends [T] ? true : false) : false;
const proof: IsString<HxTarget> = true;               // compiles — HxTarget is exactly string
```

The bidirectional-assignability proof confirms `HxTarget` is *exactly* `string`; the `ExtendedCSSSelector` arm is decorative.

`src/routes.ts:161` (`target?: HxTarget | Id`) therefore accepts any string, while `README.md:18` claims "routes, IDs, and HTMX targets are compile-time validated" and `README.md:735` claims "compile-time validated HTMX targets". The claim holds only for the `Id` path (`defineIds`), not the string path — matching the finding.

## Conclusion

Both halves of the finding reproduce precisely. The JSDoc on `HxSwap` is false as written, and the README's target-validation claim overstates what `HxTarget` enforces. Not refuted.
