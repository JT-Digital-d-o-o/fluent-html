# Plan: Type Safety 10/10 — COMPLETED

> Goal: Close all type safety gaps identified in the codebase analysis to achieve a 10/10 score.
>
> **Status: All 6 phases implemented. `tsc --noEmit` clean, 519/519 tests passing.**

---

## Phase 1 — String Literal Unions on Element Setters ✅

Created `src/elements/html-types.ts` exporting: `InputType`, `AutocompleteHint`, `FormMethod`, `BrowsingContext`, `LinkRel`, `ReferrerPolicy`, `BooleanAttribute`.

Updated in `src/elements/forms.ts`:
- `InputTag.type` → `InputType`, `setType()` → `InputType`
- `InputTag.autocomplete` / `TextareaTag.autocomplete` → `AutocompleteHint`
- `FormTag.method` → `FormMethod`, `setMethod()` → `FormMethod`
- `FormTag.target` → `BrowsingContext`, `setTarget()` → `BrowsingContext`
- `ButtonTag.formmethod` → `'get' | 'post'`

Updated in `src/elements/links.ts`:
- `AnchorTag.target` / `AreaTag.target` → `BrowsingContext` (removed `| string` that defeated the union)
- `AnchorTag.rel` / `AreaTag.rel` → `LinkRel`
- `AnchorTag.referrerpolicy` → `ReferrerPolicy`

---

## Phase 2 — Branded `Id` Type ✅

Updated `src/ids.ts`:
- Added `declare const __idBrand: unique symbol` and `readonly [__idBrand]: true` to `Id` interface
- `createId()` casts through `unknown` since brand is compile-time only
- `isId()` type guard unchanged — structural check at runtime, branded narrowing at compile time

---

## Phase 3 — Type Guards for Render Discriminants ✅

Created `src/core/guards.ts` with `isTag()` and `isRawString()` — uses `{ _t?: number }` intermediate type instead of `any`.

Updated `src/render/render.ts`:
- Replaced `(view as any)._t` checks with `isTag(view)` / `isRawString(view)` — eliminates 2 `as any` casts
- `Tag` no longer imported as a value (only `EMPTY_ATTRS` needed)

Updated `src/fold/fold.ts`:
- Replaced `instanceof Tag` / `instanceof RawString` with type guard functions
- `Tag` and `RawString` switched to type-only imports

---

## Phase 4 — Typed `_sk` Property Access ✅

Updated `src/core/tag.ts`:
- Added `declare readonly _sk?: readonly string[]` to `Tag` class

Updated `src/render/render.ts`:
- `tag._sk` accessed directly (no cast)
- `htmx[attr.key as keyof HTMX]` replaces `(htmx as any)[attr.key]`

---

## Phase 5 — Constrained `toggle()` ✅

Updated `src/core/tag.ts`:
- `toggle(name: BooleanAttribute, ...)` — imports `BooleanAttribute` from `html-types.ts`
- `(string & {})` escape hatch preserves backward compatibility

---

## Phase 6 — Eliminate Remaining `as any` in Render Pipeline ✅

Updated `src/render/render.ts`:
- `(tag as unknown as Record<string, unknown>)[sk[i]]` replaces `(tag as any)[sk[i]]`
- **Result: 0 `as any` casts remaining in render.ts**

Accepted limitations (unchanged):
- Prototype `_t` / `_sk` assignments in `tag.ts`, `raw-string.ts`, `forms.ts`, `links.ts` — inherent TypeScript limitation
- `extractAttrs` dynamic copy in `fold.ts` — 1 `as any` remaining, inherent

---

## Implementation Summary

| # | Phase | Files Changed | Status |
|---|-------|---------------|--------|
| 1 | String literal unions | `forms.ts`, `links.ts`, new `html-types.ts` | ✅ |
| 2 | Branded `Id` | `ids.ts` | ✅ |
| 3 | Type guards | new `guards.ts`, `render.ts`, `fold.ts` | ✅ |
| 4 | Typed `_sk` access | `tag.ts`, `render.ts` | ✅ |
| 5 | Constrained `toggle()` | `tag.ts` | ✅ |
| 6 | Remaining `as any` | `render.ts` | ✅ |

---

## Acceptance Criteria

- [x] `tsc --noEmit` passes with no regressions
- [x] All existing tests pass (519/519)
- [x] No new `as any` casts introduced (net reduction: render.ts went from 4 → 0)
- [x] Autocomplete works for all literal unions in VS Code
- [x] `(string & {})` escape hatch works for custom values
- [x] Branded `Id` prevents `{ id: "x", selector: "#x" }` from passing as `Id`
