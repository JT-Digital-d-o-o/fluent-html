# Plan: Refactor builder.ts + Add Catamorphism/Fold Support

## Status: ✅ COMPLETED

**Completed:** January 28, 2026

### Summary
- Refactored monolithic `builder.ts` (2788 lines) into 41 modular files across 6 directories
- Added new catamorphism/fold API for generic View traversals
- All 131 tests passing (109 existing + 22 new fold tests)
- No circular dependencies
- Full API compatibility maintained

---

## Overview

Refactor the monolithic `builder.ts` (~2788 lines) into a modular structure and add catamorphism/fold functionality for generic View traversals.

---

## Final Directory Structure

```
src/
  index.ts                    # Main entry point (maintains API compatibility)
  htmx.ts                     # Existing
  patterns.ts                 # Existing
  ids.ts                      # Existing

  core/
    types.ts                  # View, Thunk types
    tailwind-types.ts         # Tailwind type definitions (~95 lines)
    raw-string.ts             # RawString class and Raw()
    tag.ts                    # Tag base class with styling methods (~630 lines)
    utils.ts                  # Empty(), El()
    index.ts                  # Barrel exports

  elements/
    structural.ts             # Div, Main, Header, Footer, Section, etc.
    text.ts                   # P, H1-H6, Span, Blockquote, Pre, Code, etc.
    inline.ts                 # Strong, Em, B, I, U, S, Mark, etc.
    lists.ts                  # Ul, Ol, Li, Dl, Dt, Dd, Menu
    tables.ts                 # Table, Thead, Tr, Th, Td + specialized Tags
    forms.ts                  # Input, Textarea, Button, Form + specialized Tags
    interactive.ts            # Details, Summary, Dialog
    media.ts                  # Img, Video, Audio, Canvas, Svg + specialized Tags
    svg.ts                    # Path, Circle, Rect, Line, etc.
    embedded.ts               # Iframe, ObjectEl, Embed
    links.ts                  # A, MapEl, Area
    document.ts               # HTML, Head, Body, Meta, Script, etc.
    data.ts                   # Time, Data, Progress, Meter
    webcomponents.ts          # Slot
    index.ts                  # Barrel exports

  control/
    conditionals.ts           # IfThen, IfThenElse, SwitchCase
    iteration.ts              # ForEach, Repeat, range
    overlay.ts                # Overlay, OverlayPosition
    index.ts                  # Barrel exports

  render/
    escape.ts                 # escapeHtml, escapeAttr
    render.ts                 # render(), renderImpl()
    index.ts                  # Barrel exports

  fold/                       # NEW: Catamorphism support
    types.ts                  # ViewAlgebra<A> interface
    fold.ts                   # foldView<A>() implementation
    algebras/
      render.ts               # renderAlgebra
      count.ts                # countAlgebra
      text.ts                 # textAlgebra
      links.ts                # linksAlgebra
      transform.ts            # transformation helpers
      index.ts
    index.ts
```

---

## Catamorphism API

### Core Types

```typescript
/**
 * F-algebra for View catamorphism.
 * Defines how to combine View components into a result type A.
 */
interface ViewAlgebra<A> {
  /** Handle plain text strings */
  text: (s: string) => A;

  /** Handle raw HTML strings */
  raw: (html: string) => A;

  /** Handle tag elements with their already-folded children */
  tag: (element: string, attrs: TagAttrs, children: A) => A;

  /** Handle arrays by combining folded children */
  list: (children: A[]) => A;
}

/** Attributes extracted from a Tag for fold operations */
interface TagAttrs {
  id?: string;
  class?: string;
  style?: string;
  attributes: Record<string, string>;
  htmx?: HTMX;
  toggles?: string[];
  [key: string]: unknown;  // element-specific attrs (src, href, etc.)
}
```

### Main Fold Function

```typescript
/**
 * Catamorphism over View structures.
 * Recursively folds a View into a result type A using the provided algebra.
 */
function foldView<A>(alg: ViewAlgebra<A>, view: View): A
```

### Pre-built Algebras

```typescript
// Count all elements in a View
const countAlgebra: ViewAlgebra<number>

// Extract plain text content
const textAlgebra: ViewAlgebra<string>

// Find all anchor hrefs
const linksAlgebra: ViewAlgebra<LinkInfo[]>

// Render to HTML string (alternative to render())
const renderAlgebra: ViewAlgebra<string>
```

### Transform Helpers

```typescript
// Create custom transformations
function createTransformAlgebra(
  transform: (element: string, attrs: TagAttrs) => { element: string; attrs: Partial<TagAttrs> } | null
): ViewAlgebra<View>

// Add class to matching elements
function addClassToMatching(
  predicate: (element: string, attrs: TagAttrs) => boolean,
  className: string
): ViewAlgebra<View>
```

### Usage Examples

```typescript
import { foldView, countAlgebra, textAlgebra, linksAlgebra } from 'lambda.html';

// Count elements
const view = Div([P("Hello"), P("World")]);
const count = foldView(countAlgebra, view);  // 3

// Extract text
const heading = H1("Welcome to my site");
const text = foldView(textAlgebra, heading);  // "Welcome to my site\n"

// Find all links
const nav = Div([
  A("Home").setHref("/"),
  A("About").setHref("/about"),
  A("Contact").setHref("/contact")
]);
const links = foldView(linksAlgebra, nav);
// [{ href: "/" }, { href: "/about" }, { href: "/contact" }]

// Custom algebra: collect all element names
const elementNamesAlgebra: ViewAlgebra<string[]> = {
  text: () => [],
  raw: () => [],
  tag: (el, _, childNames) => [el, ...childNames],
  list: (arrays) => arrays.flat(),
};
const names = foldView(elementNamesAlgebra, view);  // ["div", "p", "p"]
```

---

## Implementation Phases

### Phase 1: Core Module (Foundation) ✅
1. Create `src/core/` directory
2. Create `tailwind-types.ts` - extract lines 14-105 from builder.ts
3. Create `raw-string.ts` - extract RawString class (lines 107-129)
4. Create `types.ts` - View, Thunk type definitions
5. Create `tag.ts` - Tag class with all methods (lines 131-758)
6. Create `utils.ts` - Empty(), El() functions
7. Create `index.ts` - barrel exports
8. **Verify**: `npm run build && npm test`

### Phase 2: Render Module ✅
1. Create `src/render/` directory
2. Create `escape.ts` - escapeHtml, escapeAttr, htmlEscapes
3. Create `render.ts` - render(), renderImpl(), buildAttributes(), buildHtmx()
4. Create `index.ts`
5. **Verify**: `npm run build && npm test`

### Phase 3: Elements Module ✅
1. Create `src/elements/` directory
2. Extract in order (simplest first, most complex last):
   - `structural.ts` - Div, Main, Header, Footer, Section, Article, Nav, Aside, Figure, Figcaption, Address, Hgroup, Search
   - `text.ts` - P, H1-H6, Span, Blockquote, Pre, Code, Hr, Br, Wbr
   - `inline.ts` - Strong, Em, B, I, U, S, Mark, Small, Sub, Sup, Abbr, Cite, Q, Dfn, Kbd, Samp, Var, Bdi, Bdo, Ruby, Rt, Rp
   - `lists.ts` - Ul, Ol, Li, Dl, Dt, Dd, Menu
   - `svg.ts` - Path, Circle, Rect, Line, Polygon, Polyline, Ellipse, G, Defs, Use, Text, Tspan
   - `tables.ts` - Table, Thead, Tbody, Tfoot, Tr, Th, Td, Caption, Colgroup, Col + ThTag, TdTag, ColgroupTag, ColTag
   - `interactive.ts` - Details, Summary, Dialog + DetailsTag, DialogTag
   - `webcomponents.ts` - Slot + SlotTag
   - `data.ts` - Time, Data, Progress, Meter + TimeTag, DataTag, ProgressTag, MeterTag
   - `links.ts` - A, MapEl, Area + AnchorTag, MapTag, AreaTag
   - `embedded.ts` - Iframe, ObjectEl, Embed + IframeTag, ObjectTag, EmbedTag
   - `media.ts` - Img, Picture, Source, Video, Audio, Track, Canvas, Svg + specialized Tags
   - `forms.ts` - Form, Input, Textarea, Button, Label, Select, Option, Optgroup, Datalist, Fieldset, Legend, Output + specialized Tags
   - `document.ts` - HTML, Head, Body, Title, Meta, Link, Style, Script, Base, Noscript, Template + specialized Tags
3. Create `index.ts` - barrel exports
4. **Verify after each file**: `npm run build && npm test`

### Phase 4: Control Module ✅
1. Create `src/control/` directory
2. Create `conditionals.ts` - IfThen, IfThenElse, SwitchCase
3. Create `iteration.ts` - ForEach (all overloads), ForEach1/2/3 (deprecated), Repeat, range
4. Create `overlay.ts` - Overlay, OverlayPosition, positionStyles
5. Create `index.ts`
6. **Verify**: `npm run build && npm test`

### Phase 5: Update Main Index ✅
1. Update `src/index.ts` to import from new modules instead of builder.ts
2. Delete `src/builder.ts`
3. **Verify**: Full test suite passes, all exports work

### Phase 6: Add Fold Module (New Feature) ✅
1. Create `src/fold/` directory
2. Create `types.ts` - ViewAlgebra<A>, TagAttrs interfaces
3. Create `fold.ts` - foldView<A>() implementation
4. Create `algebras/` directory:
   - `render.ts` - renderAlgebra
   - `count.ts` - countAlgebra
   - `text.ts` - textAlgebra
   - `links.ts` - linksAlgebra
   - `transform.ts` - createTransformAlgebra, addClassToMatching
   - `index.ts` - barrel exports
5. Create `fold/index.ts`
6. Export fold module from main `src/index.ts`
7. **Verify**: Add and run new fold tests

### Phase 7: Final Verification ✅
1. `npm run build` - TypeScript compilation succeeds
2. `npm test` - all existing + new tests pass
3. Check no circular dependency warnings
4. Verify `dist/` output structure is correct
5. Test consumer imports: `import { Div, foldView, countAlgebra } from 'lambda.html'`

---

## Key Design Decisions

### 1. Keep existing render() implementation
- Don't replace render() with foldView(renderAlgebra, ...)
- Keep both: existing render() for performance, renderAlgebra for flexibility
- Users can choose which to use

### 2. Nested directory structure
- `core/`, `elements/`, `control/`, `render/`, `fold/`
- Clear separation of concerns
- Easier to navigate and maintain

### 3. Separate files per category
- Better tree-shaking potential
- Clearer code ownership
- Easier to find specific elements

### 4. Specialized Tags stay with factories
- InputTag lives in `forms.ts` with Input()
- ImgTag lives in `media.ts` with Img()
- Keeps related code together

### 5. Breaking circular dependencies
Use type-only imports:
```typescript
// core/types.ts
import type { Tag } from './tag';
export type View = Tag | string | RawString | View[];

// core/tag.ts
import type { View } from './types';  // type-only, no runtime dep
```

---

## Files Summary

| New File | Lines (approx) | Contents |
|----------|----------------|----------|
| `core/tailwind-types.ts` | 95 | Tailwind type definitions |
| `core/raw-string.ts` | 25 | RawString class, Raw() |
| `core/types.ts` | 15 | View, Thunk types |
| `core/tag.ts` | 630 | Tag class with all methods |
| `core/utils.ts` | 15 | Empty(), El() |
| `elements/structural.ts` | 55 | Div, Main, Header, etc. |
| `elements/text.ts` | 75 | P, H1-H6, Span, etc. |
| `elements/inline.ts` | 90 | Strong, Em, Mark, etc. |
| `elements/lists.ts` | 30 | Ul, Ol, Li, etc. |
| `elements/tables.ts` | 100 | Table elements + Tags |
| `elements/forms.ts` | 425 | Form elements + Tags |
| `elements/interactive.ts` | 45 | Details, Dialog + Tags |
| `elements/media.ts` | 315 | Img, Video, etc. + Tags |
| `elements/svg.ts` | 50 | SVG primitives |
| `elements/embedded.ts` | 140 | Iframe, Embed + Tags |
| `elements/links.ts` | 110 | A, Area + Tags |
| `elements/document.ts` | 210 | Meta, Script, etc. + Tags |
| `elements/data.ts` | 95 | Time, Progress + Tags |
| `elements/webcomponents.ts` | 20 | Slot + SlotTag |
| `control/conditionals.ts` | 45 | IfThen, SwitchCase |
| `control/iteration.ts` | 60 | ForEach, Repeat |
| `control/overlay.ts` | 35 | Overlay utility |
| `render/escape.ts` | 20 | HTML escaping |
| `render/render.ts` | 165 | render(), renderImpl() |
| `fold/types.ts` | 30 | ViewAlgebra, TagAttrs |
| `fold/fold.ts` | 55 | foldView() |
| `fold/algebras/*.ts` | 300 | Pre-built algebras |

---

## Verification Checklist

### After Each Phase
```bash
npm run build    # TypeScript compiles
npm test         # All tests pass
```

### Final Verification ✅
- [x] All exports from old builder.ts available from index.ts
- [x] TypeScript IntelliSense works for consumers
- [x] No runtime errors when importing
- [x] Generated .d.ts files have correct types
- [x] Package size reasonable (no bloat from refactor)
- [x] Circular dependency check: `npx madge --circular src/`

### New Fold Tests ✅
```typescript
describe('foldView', () => {
  it('counts elements', () => {
    const view = Div([P("Hello"), P("World")]);
    expect(foldView(countAlgebra, view)).toBe(3);
  });

  it('extracts text', () => {
    const view = H1("Title");
    expect(foldView(textAlgebra, view).trim()).toBe("Title");
  });

  it('finds links', () => {
    const view = Div([A("Home").setHref("/"), A("About").setHref("/about")]);
    const links = foldView(linksAlgebra, view);
    expect(links).toHaveLength(2);
    expect(links[0].href).toBe("/");
  });
});
```

---

## Test Results

```
✅ Passed: 131 (109 existing + 22 fold tests)
❌ Failed: 0
Total: 131
```

**Circular Dependencies:** None detected
