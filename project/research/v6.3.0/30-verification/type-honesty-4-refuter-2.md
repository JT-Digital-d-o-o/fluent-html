# Verification: type-honesty-4 (refuter-2)

**Finding:** `Tag.attributes` is a public mutable `Record<string, string>` that is actually a shared frozen object — direct writes compile and throw.

**Verdict: CONFIRMED — not refuted.** Reproduced end-to-end by compiling a strict-mode probe against the published `.d.ts` and running against a freshly built `dist/`.

## Reproduction (mode: refute-by-reproduction)

Built `dist/` from current source (`npm run build`, tsc clean), then ran a probe.

### 1. Source anchors match the finding

- `src/core/tag.ts:11` — `export const EMPTY_ATTRS: Record<string, string> = Object.freeze(Object.create(null)) as Record<string, string>;`
- `src/core/tag.ts:71` — `declare attributes: Record<string, string>;` (public, non-readonly)
- `src/core/tag.ts:550` — `Tag.prototype.attributes = EMPTY_ATTRS;`
- Published `dist/src/core/tag.d.ts:31` — `attributes: Record<string, string>;` — no `readonly`, no `@internal` on the field itself, present in the public `.d.ts`.

### 2. Runtime probe (node, against `dist/src/index.js`)

```text
shared object: true                              // Div().attributes === Div().attributes
direct write threw: TypeError - Cannot add property data-x, object is not extensible
post-addAttribute direct write: succeeded, value = 1   // state-dependent, as claimed
b.attributes["data-x"]: undefined                // other tag unaffected (freeze prevented pollution)
```

Every runtime claim reproduces exactly:
- Fresh tags share one frozen object.
- `Div().attributes["data-x"] = "1"` throws `TypeError: Cannot add property data-x, object is not extensible`.
- After one `addAttribute()` call (copy-on-write at tag.ts:373/430), the same direct write on that tag **succeeds silently** — the failure is state-dependent/intermittent, as the finding says.

### 3. Type-level probe (tsc --strict --noEmit --skipLibCheck)

```ts
import { Div } from '.../dist/src/index.js';
Div().attributes["data-x"] = "1";   // exit 0 — compiles clean
```

Control case proving tsc would reject the proposed fix shape:

```ts
declare const x: { readonly attributes: Readonly<Record<string, string>> };
x.attributes["data-x"] = "1";       // error TS2542: Index signature ... only permits reading
```

So the compile-acceptance is attributable precisely to the mutable public type; the proposed `Readonly` publication would turn the runtime crash into a compile error.

## Notes

- `skipLibCheck` was used only to suppress unrelated `node:stream` errors from missing `@types/node` in the scratchpad; it does not affect checking of the probe's own assignment (declarations are still consumed).
- Object.freeze on a `Object.create(null)` object makes the write **throw** even in sloppy mode contexts here because ESM is strict; in a CommonJS non-strict consumer the write would instead **silently no-op**, which is arguably worse (data loss instead of a crash). Either way the public type lies.

## Conclusion

Refutation failed. The defect is real, reproducible, and matches the evidence anchor. Proposal (publish as `readonly attributes: Readonly<Record<string, string>>` with internal writer casts, or strip from public `.d.ts`) is sound — the control probe shows `readonly` publication catches the misuse at compile time.
