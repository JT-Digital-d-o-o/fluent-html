# Implementation Phases

## Version Strategy

Ship as **fluent-html v6.0.0** — clean break, htmx 4 only. No backwards compat layer (htmx ships their own `htmx-2-compat` extension for gradual migration).

---

## Phase 1: Remove Deleted Attributes (Breaking) ✅

**Done.** Removed 9 properties, renamed 2, removed 2 response header methods.

### Changes made

**`src/htmx.ts`** — HTMX interface:
- Removed: `params`, `prompt`, `ext`, `disinherit`, `inherit`, `request`, `history`, `historyElt`, `selectOob`
- Renamed: `disabledElt: string` → `disable: string`, `disable: boolean` → `ignore: boolean`
- `HxOptions` updated automatically (derives from HTMX via `Partial<Omit<...>>`)

**`src/render/render.ts`** — `buildHtmx()`:
- Removed rendering of: `hx-params`, `hx-prompt`, `hx-ext`, `hx-disinherit`, `hx-inherit`, `hx-request`, `hx-history`, `hx-history-elt`, `hx-select-oob`
- Renamed: `hx-disabled-elt` → `hx-disable`, `hx-disable` → `hx-ignore`

**`src/patterns.ts`** — `HxResponse` class:
- Removed: `triggerAfterSwap()`, `triggerAfterSettle()` methods
- Cleaned up JSDoc example referencing `triggerAfterSwap`

**`test/test.ts`**:
- Removed tests for `hx-params`, `hx-ext`, `hx-select-oob`

**Header comment** updated to `Compatible with HTMX 4.0+`.

---

## Phase 2: Add New Swap Styles ✅

**Done.** Added morph and short swap names to `HxSwapStyle`.

### Changes made

**`src/htmx.ts`** — `HxSwapStyle` union expanded with:
- `'before'`, `'after'`, `'prepend'`, `'append'` (short aliases)
- `'innerMorph'`, `'outerMorph'` (morph strategies)

**`test/test.ts`** — 7 new tests:
- `outerMorph`, `innerMorph`, `before`, `after`, `prepend`, `append`, `outerMorph` with modifier

---

## Phase 3: Add `hx-config` ✅

**Done.** Per-element request configuration replaces removed `hx-request`.

### Changes made

**`src/htmx.ts`**:
- Added `HxConfig` type: `{ timeout?, credentials?, mode? }`
- Added `config?: HxConfig | string` to HTMX interface

**`src/render/render.ts`**:
- Renders as single-quoted `hx-config='...'` (JSON.stringify for objects, raw for strings)
- JSON objects not escaped (matches `hx-headers` pattern); string values not escaped either

**`src/index.ts`** — exported `HxConfig` type

**`test/test.ts`** — 3 new tests: object config, string config, full options

---

## Phase 4: Add `hx-status:CODE` ✅

**Done.** Declarative status-code-specific swap behavior.

### Changes made

**`src/htmx.ts`**:
- Added `HxStatusConfig` type: `{ swap?, target?, select?, push?, replace?, transition? }`
- Added `status?: Record<string, string | HxStatusConfig>` to HTMX interface
- `target` in `HxStatusConfig` uses `HxTarget` (string); users pass `ids.foo.selector` directly

**`src/render/render.ts`**:
- Added `buildStatusConfig()` helper: serializes config object to `swap:value target:value ...` format
- Renders as `hx-status:CODE="..."` attributes, iterating over status record keys

**`src/index.ts`** — exported `HxStatusConfig` type

**`test/test.ts`** — 4 new tests: string config, object config, multiple codes, with transition

---

## Phase 5: Add `<hx-partial>` Support ✅

**Done.** Clean multi-swap responses replacing OOB.

### Changes made

**`src/patterns.ts`**:
- Added `Partial(target, content, swap)` function — creates `<hx-partial>` elements
  - `target` accepts `HxTarget | Id`; auto-prepends `#` for bare strings
  - `swap` defaults to `"outerMorph"`
- Deprecated `OOB()` and `withOOB()` with `@deprecated` JSDoc
- Did NOT add separate `HxPartial()` element factory or `renderPartials()` helper — `Partial()` is sufficient; `render()` variadic already handles multiple partials

**`src/index.ts`** — exported `Partial`

**`test/patterns.ts`** — 4 new tests: string target, `#` prefix, custom swap, multiple partials

### Not implemented (from plan)

- `renderPartials()` helper — unnecessary; `render(Partial(...), Partial(...))` works directly
- Separate `HxPartial()` element factory — `Partial()` covers all use cases

---

## Phase 6: Add `HtmxConfig` Meta Helper ✅

**Done.** Type-safe global htmx configuration.

### Changes made

**`src/patterns.ts`**:
- Added `HtmxGlobalConfig` type with 13 config options
- Added `HtmxConfig(config)` function — creates `<meta name="htmx-config" content="...">` tag

**`src/index.ts`** — exported `HtmxConfig` and `HtmxGlobalConfig`

**`test/patterns.ts`** — 2 new tests: basic config, multiple options

---

## Phase 7: Minor New Attributes ✅

**Done.** `hx-optimistic` and `hx-preload` support.

### Changes made

**`src/htmx.ts`**:
- Added `optimistic?: boolean` — renders as boolean attribute `hx-optimistic`
- Added `preload?: 'mousedown' | 'mouseover' | boolean` — renders as `hx-preload` (boolean) or `hx-preload="mouseover"` (string)

**`src/render/render.ts`** — rendering logic for both attributes

**`test/test.ts`** — 4 new tests: optimistic, preload boolean, preload mouseover, preload mousedown

---

## Phase 8: Test Utilities (Optional) — Not started

**Goal:** Ship test helpers for app developers.

- `renderNormalized()`
- `assertHtmx()`
- `assertContains()`
- `extractHtmxAttrs()`
- Separate export entry point: `fluent-html/test`

---

## Phase 9: Documentation & CLAUDE.md — Not started

**Goal:** Update all guidance for htmx 4.

See [05-claude-md-updates.md](05-claude-md-updates.md) for specific changes.

---

## Implementation Order (Actual)

```
Phase 1 (Remove/Rename)  ── done first
    │
    ├── Phase 2 (Swap Styles)  ── done in parallel
    ├── Phase 3 (hx-config)    ── done in parallel
    └── Phase 7 (Minor attrs)  ── done in parallel
         │
         ├── Phase 4 (hx-status)   ── done in parallel
         ├── Phase 5 (hx-partial)  ── done in parallel
         └── Phase 6 (HtmxConfig)  ── done in parallel
              │
              ├── Phase 8 (Test utils) ── not started
              └── Phase 9 (Docs)       ── not started
```

---

## Test Summary

| Suite | Tests |
|---|---|
| `test/test.ts` | 281 passing (was 263) |
| `test/patterns.ts` | All passing (added Partial + HtmxConfig tests) |
| `test/swiftui-style.ts` | 124 passing (unchanged) |

All tests pass. Zero failures.

---

## Files Changed

| File | Changes |
|---|---|
| `src/htmx.ts` | Removed 9 props, renamed 2, added `HxConfig`, `HxStatusConfig`, `config`, `optimistic`, `preload`, `status`; expanded `HxSwapStyle` |
| `src/render/render.ts` | Removed 9 attr renders, renamed 2, added `config`, `optimistic`, `preload`, `status` rendering + `buildStatusConfig()` |
| `src/patterns.ts` | Removed `triggerAfterSwap`/`triggerAfterSettle`; added `Partial()`, `HtmxConfig()`, `HtmxGlobalConfig`; deprecated `OOB`/`withOOB` |
| `src/index.ts` | Exported `HxConfig`, `HxStatusConfig`, `Partial`, `HtmxConfig`, `HtmxGlobalConfig` |
| `test/test.ts` | Removed 3 deleted-attr tests, added 18 new tests |
| `test/patterns.ts` | Added 6 new tests (Partial + HtmxConfig) |
