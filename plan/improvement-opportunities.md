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

## 2. ~~STREAMING HAS ZERO TESTS~~ (DONE)

**Fixed:** Added 52 tests for `renderToStream()` covering:
- Basic elements, nested/deep structures, arrays
- All attribute types (id, class, style, custom, boolean toggles, element-specific)
- All void elements (br, hr, img, input, meta, link, source, col)
- XSS escaping (text content, attribute values, Raw passthrough)
- Script/style raw context (no-escape + `</script>`/`</style>` sanitization)
- 11 HTMX attribute tests (get, post, target, swap, push-url, trigger, vals, headers, confirm, swap-oob, boost, indicator)
- Complex realistic structures (page, table, form, mixed Raw content, 100-item list)
- Stream-specific behavior (chunked output, Readable API)

Every test asserts `renderToStream()` output equals `render()` output for the same view.

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

## 6. ~~MISSING TAILWIND METHODS~~ (DONE)

**Fixed:** Added 29 new fluent methods with full type safety:

**Filters (14 methods):** `brightness()`, `backdropBrightness()`, `contrast()`, `backdropContrast()`, `grayscale()`, `backdropGrayscale()`, `hueRotate()`, `backdropHueRotate()`, `invert()`, `backdropInvert()`, `saturate()`, `backdropSaturate()`, `sepia()`, `backdropSepia()`

**Layout (7 methods):** `placeContent()`, `placeItems()`, `placeSelf()`, `gridAutoFlow()`, `gridAutoRows()`, `gridAutoCols()`, `order()`

**Modern features (5 methods):** `skewX()`, `skewY()`, `willChange()`, `overscroll()` (with directional overload)

**Not added:** `container()` / container queries — requires deeper `.at("@md", ...)` integration, tracked separately.

47 new tests added.

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

## 8. ~~`listStyleType` AND `listStylePosition` PRODUCE IDENTICAL OUTPUT~~ (DONE)

**Fixed:** Added JSDoc to both methods documenting that they share the `list-` prefix intentionally — Tailwind uses `list-disc`/`list-decimal` for type and `list-inside`/`list-outside` for position. Type safety is enforced via separate union types (`TailwindListStyleType` vs `TailwindListStylePosition`). No runtime change needed.

---

## 9. ~~`escapeAttr` IS JUST `escapeHtml`~~ (DONE)

**Fixed:** Added JSDoc to `escapeAttr` documenting the double-quoted attribute assumption and what would need to change for unquoted/single-quoted attributes. No code change needed — the indirection is intentional.

---

## 10. ~~BENCHMARK SUITE MISSES KEY SCENARIOS~~ (DONE)

**Fixed:** Added benchmarks for:
- ~~Variant-heavy rendering~~ — 100 buttons with 10+ `.on()`/`.at()` variants
- ~~`foldView` traversal~~ — `countAlgebra` over realistic page
- ~~Context creation/scope/dispose~~ — 1000 scope/read cycles
- ~~Large ForEach~~ — 5000 items

**Remaining:** Streaming vs string rendering comparison (blocked on #2 — stream tests).

---

## Summary of Priorities

| # | Improvement | Impact | Effort | Risk | Status |
|---|-------------|--------|--------|------|--------|
| 1 | Extract shared render internals | Maintenance++ | Low | Low | |
| 2 | ~~Add stream tests~~ | Reliability++ | Low | None | **DONE** — 52 tests, full parity with render() |
| 3 | ~~Optimize flat-page render path~~ | Performance++ | Medium | Low | **DONE** — +47% flat page, +20% realistic |
| 4 | ~~Fast-path single-class variant prefix~~ | Performance+ | Trivial | None | **DONE** |
| 5 | Optimize `foldView` extraction | Performance+ | Low | Low | |
| 6 | ~~Add missing Tailwind methods~~ | DX++ | Medium | None | **DONE** — 29 methods, 47 tests |
| 7 | Add SVG container elements | Feature++ | Medium | None | |
| 8 | ~~JSDoc listStyleType/listStylePosition~~ | Quality+ | Trivial | None | **DONE** |
| 9 | ~~JSDoc escapeAttr~~ | Quality+ | Trivial | None | **DONE** |
| 10 | ~~Add missing benchmarks~~ | Quality+ | Low | None | **DONE** — foldView, context, variants |

Items 1-2 are the next highest-value targets — they touch maintenance pain and reliability gaps.
