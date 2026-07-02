# Verdict: ids-camel-2 — CONFIRMED (refutation failed)

**Finding:** defineIds runtime camelization diverges from type-level `KebabToCamel` — typed Id properties are `undefined` at runtime.
**Mode:** refute-by-code-reading. **Result:** could not refute; defect positively confirmed by code reading plus executable repro.

## Attempted refutations

1. **"Maybe a guard/validation elsewhere rejects non-lowercase-kebab names."** No. `defineIds` (src/ids.ts:103-115) performs no validation of `names`; the only transformation is the regex at src/ids.ts:110. Grep for `defineIds` across `src/` shows a single definition and no wrapping validator.
2. **"Maybe the type level also only camelizes lowercase letters, so types and runtime agree."** No. `KebabToCamel` (src/ids.ts:56-58) splits on **any** `-` and applies `Capitalize<Tail>` regardless of what the tail starts with. Verified with `tsc --strict`: for `defineIds(["col-2","user-List","step-3-panel","tab-1"] as const)`, the accesses `ids.col2`, `ids.userList`, `ids.step3Panel`, `ids.tab1` all type-check (exit 0), and a `@ts-expect-error` on `ids["col-2"]` is consumed — i.e. the type-level key is `col2`, not `col-2`.
3. **"Maybe the API contract restricts ids to lowercase kebab-case."** No such contract exists: JSDoc (src/ids.ts:67-102) says only "kebab-case IDs are converted", with no lowercase-only restriction; digit segments (`tab-1`, `col-2`, `step-3-panel`) are valid HTML ids and a natural usage. Nothing rejects them at compile time or runtime.
4. **"Maybe downstream consumers tolerate the undefined."** Partially, and that makes it worse: `setId(id?: string | Id)` (src/core/tag.ts:97-99) treats `undefined` as falsy and **silently drops the id** — the element renders with no `id` attribute, so the HTMX target silently never matches (not even a loud failure). Accessing `ids.col2.selector` throws `TypeError: Cannot read properties of undefined`.

## Executable repro (Node 26, importing src/ids.ts directly)

```
defineIds(["col-2","user-List","step-3-panel","tab-1","user-list"])
runtime keys: [ 'col-2', 'user-List', 'step-3Panel', 'tab-1', 'userList' ]
ids.col2:       undefined   // typed as Id
ids.step3Panel: undefined   // typed as Id
ids.tab1:       undefined   // typed as Id
ids.userList (from "user-List"): undefined at the runtime key the type expects? No —
  runtime key is 'user-List'; ids.userList only resolved here because "user-list" was ALSO in the list.
```

Root cause exactly as claimed: runtime regex `/-([a-z])/g` (src/ids.ts:110) only consumes a hyphen followed by a lowercase ASCII letter, while `Capitalize<Tail>` at the type level applies to any tail (digits and already-capitalized letters are no-ops for `Capitalize`, but the type still **removes the hyphen**; the runtime does not).

## Minor correction to the finding's failure narrative

The claim "crashes or renders id=\"undefined\"" is slightly off for `setId`: it silently omits the `id` attribute (src/core/tag.ts:98). The crash claim holds for `.selector` access (`ids.col2.selector` → TypeError). Either way the typed API lies about runtime shape, which is the substance of the finding.

## Verdict

**refuted = false, confidence = high.** The proposed fix (`name.replace(/-(.)/g, (_, c) => c.toUpperCase())`) mirrors `Capitalize` semantics for the reproduced cases; note `Capitalize` on a digit/uppercase tail is a no-op but the type still drops the hyphen, so the runtime must too — the proposal does that correctly. A trailing hyphen (`"foo-"`) is a residual edge: type key stays `foo-` (no match for `${Head}-${Tail}` with nonempty Tail? Actually `Tail` = `""` matches, yielding `foo`), so trailing-hyphen handling deserves the suggested round-trip assertion.
