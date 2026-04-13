# fluent-html: Improvement Opportunities

> Analysis date: 2026-04-13 | Version: 5.10.0 | 926 tests passing

---

## 1. RENDER/STREAM CODE DUPLICATION (High Impact, Low Risk)

**The problem:** `src/render/render.ts` and `src/render/stream.ts` share ~90 lines of identical code:
- `VOID_ELEMENTS` Set (duplicated)
- `HTMX_ATTRS` array + all 5 serializer factories (`str`, `boolOrStr`, `boolVal`, `jsonOrStr`, `json`)
- `buildHtmx()` function
- `buildStatusConfig()` function
- `SCRIPT_CLOSE_RE` / `STYLE_CLOSE_RE` regexes + `sanitizeRawContent()`
- Attribute rendering logic (id/class/style/sk/extraAttrs/htmx/toggles) — ~35 lines copy-pasted

The comment on `stream.ts:14-15` says *"duplicated here to avoid circular deps"* — but there's no circular dependency risk. Both files import from `../htmx.js`, `../core/tag.js`, `../core/guards.js`, and `./escape.js`. A shared `render-shared.ts` internal module would break no cycles.

**Why it matters:** Any bug fix or new HTMX attribute must be applied in two places. As HTMX evolves this becomes a real maintenance hazard.

---

## 2. STREAMING HAS ZERO TESTS (High Impact, High Risk)

`src/render/stream.ts` (195 lines) has **no test coverage at all**. This is concerning because:
- It's the SSR performance path — the one you'd use for large pages in production
- It has its own copy of all rendering logic (see #1)
- Edge cases like void elements, script/style raw content, and HTMX attributes in streaming are unverified
- The `read()` callback does all work synchronously — for very large trees this defeats the purpose of streaming

926 tests pass, but none exercise `renderToStream()`.

---

## 3. ~~FLAT-PAGE RENDER IS THE BOTTLENECK~~ (DONE)

**Fixed:** Removed the `len > 8` branch in `renderImpl` that allocated `new Array<string>(len)` + `.join('\n')`. Now uses `+=` concatenation for all array sizes — V8 optimizes cons strings well and the allocation overhead was the real bottleneck.

| Benchmark | Before | After | Change |
|-----------|--------|-------|--------|
| **Flat page (1000 divs)** | **4.78K** | **7.01K** | **+47%** |
| Deep tree (100 levels) | 122K | 133K | +9% |
| Heavy escaping (200 paragraphs) | 9.18K | 11.75K | +28% |
| HTMX attributes (100 buttons) | 16.1K | 19.4K | +20% |
| Realistic page (~200 tags) | 20.8K | 24.9K | +20% |

Added 3 new tests for large array rendering (20, 1000 items, single-item edge case). Added `Variant-heavy` and `Large ForEach (5000 items)` benchmarks.

---

## 4. ~~`addClass` VARIANT PREFIX OVERHEAD~~ (DONE)

**Fixed:** Added `indexOf(' ')` check before splitting — single-class inputs (95%+ of calls from Tailwind methods) now skip `split → map → join` and use direct string concatenation. Added 2 tests for single-class and multi-class variant `addClass` paths.

---

## 5. `foldView` ALLOCATES ON EVERY TAG (Medium Impact)

`fold/fold.ts:9-28` — `extractAttrs()` does `{ ...tag.attributes }` (shallow copy) and `Object.keys(tag)` loop on every tag visit. For a 200-tag tree, that's 200 object spreads and 200 `Object.keys` calls.

Since `EMPTY_ATTRS` is frozen and shared, the spread is wasted work for most tags. And the `Object.keys` loop to copy element-specific properties is O(n) where n = all own enumerable keys.

**Opportunity:** Skip the spread when `tag.attributes === EMPTY_ATTRS`, and use `_sk` (which already exists on tag subclasses) to copy only the relevant properties instead of `Object.keys()`.

---

## 6. MISSING TAILWIND METHODS (Medium Impact, Additive)

Compared to Tailwind v3.4/v4, these commonly-used utilities have no fluent method:

**Filters (frequently used in image-heavy UIs):**
- `brightness()`, `contrast()`, `grayscale()`, `hueRotate()`, `invert()`, `saturate()`, `sepia()`
- Backdrop variants of all above

**Layout (used in complex grids):**
- `placeContent()`, `placeItems()`, `placeSelf()`
- `gridAutoFlow()`, `gridAutoRows()`, `gridAutoColumns()`
- `order()`

**Modern features:**
- `container()` / container query support via `.at("@md", ...)`
- `skewX()` / `skewY()` transforms
- `willChange()` for performance hints
- `overscroll()` behavior

Every one of these that's missing forces users to fall back to `.addClass("brightness-50")` — losing type safety and autocomplete.

---

## 7. SVG SUPPORT GAPS (Medium Impact for SVG-heavy apps)

Current SVG support covers basic shapes well, but is missing container/definition elements critical for non-trivial SVG:

- **Gradients:** `<linearGradient>`, `<radialGradient>`, `<stop>` — needed for any styled SVG
- **Clipping/Masking:** `<clipPath>`, `<mask>` — needed for icon libraries
- **Patterns:** `<pattern>` — needed for backgrounds
- **Symbols:** `<symbol>` (note: `<use>` already exists)
- **Animation:** `<animate>`, `<animateTransform>` — CSS animations are usually preferred, but SMIL is still used
- **`<foreignObject>`** — for embedding HTML inside SVG (useful for tooltips, labels)

---

## 8. `listStyleType` AND `listStylePosition` PRODUCE IDENTICAL OUTPUT

`tailwind-methods.ts:500-501`:
```typescript
p.listStyleType = function (value: string) { return this.addClass(`list-${value}`); };
p.listStylePosition = function (value: string) { return this.addClass(`list-${value}`); };
```

Both generate `list-${value}`. This happens to work because Tailwind uses `list-disc`, `list-decimal`, `list-inside`, `list-outside` — all under the `list-` prefix. But it means the two methods are **functionally identical** and provide no compile-time protection against passing a position value to `listStyleType` or vice versa. The type system catches this via separate union types, but the runtime doesn't distinguish them at all. Not a bug per se, but worth noting for documentation clarity.

---

## 9. `escapeAttr` IS JUST `escapeHtml` (Minor, Correctness)

`escape.ts:31-33`:
```typescript
export function escapeAttr(unsafe: string): string {
  return escapeHtml(unsafe);
}
```

This is fine for double-quoted attributes (which is all the renderer produces). But if you ever support unquoted or single-quoted attributes, this would need to also escape backticks, equals signs, etc. The indirection is good forward-thinking — just noting it.

---

## 10. BENCHMARK SUITE MISSES KEY SCENARIOS (Minor)

The benchmark covers construction and render, but doesn't measure:
- **Variant-heavy rendering** (`.on("hover", ...)` called 10+ times per element — tests the `split/map/join` path)
- **Streaming vs string rendering** comparison
- **`foldView` traversal** performance
- **Context creation/scope/dispose** overhead
- **Large ForEach** (10K items) — where the array allocation in render really hurts

---

## Summary of Priorities

| # | Improvement | Impact | Effort | Risk | Status |
|---|-------------|--------|--------|------|--------|
| 1 | Extract shared render internals | Maintenance++ | Low | Low | |
| 2 | Add stream tests | Reliability++ | Low | None | |
| 3 | ~~Optimize flat-page render path~~ | Performance++ | Medium | Low | **DONE** — +47% flat page, +20% realistic |
| 4 | ~~Fast-path single-class variant prefix~~ | Performance+ | Trivial | None | **DONE** |
| 5 | Optimize `foldView` extraction | Performance+ | Low | Low | |
| 6 | Add missing Tailwind methods | DX++ | Medium | None | |
| 7 | Add SVG container elements | Feature++ | Medium | None | |
| 8-10 | Minor fixes & benchmarks | Quality+ | Low | None | |

Items 1-2 are the next highest-value targets — they touch maintenance pain and reliability gaps.
