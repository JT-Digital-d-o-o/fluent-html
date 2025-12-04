# Changelog

All notable changes to Lambda.html will be documented in this file.

## [3.0.0] - 2025-01

### 🚀 Breaking Changes

This is a major release with a **completely redesigned API**. The new API uses **method chaining** instead of object configuration, providing superior IDE autocomplete and type safety.

#### Before (v1.x / v2.x)
```typescript
Div({
  id: "container",
  class: "flex items-center",
  child: Text("Hello")
})
```

#### After (v3.0.0)
```typescript
Div("Hello")
  .setId("container")
  .setClass("flex items-center")
```

### ✨ New Features

#### 🎯 IDE-Powered Development

The new type system provides **intelligent autocomplete** for:
- All HTMX triggers (`click`, `load`, `revealed`, `keyup changed delay:300ms`, etc.)
- All HTMX swap strategies (`innerHTML`, `outerHTML scroll:top`, etc.)
- All HTMX sync modes (`drop`, `abort`, `queue last`, etc.)
- Element-specific methods (`.setColspan()` only on `Th`/`Td`, `.setMin()` only on `Input`, etc.)

#### 🛡️ Built-in XSS Protection

All text content and attributes are **automatically HTML-escaped**:
- Text content: `<script>` → `&lt;script&gt;`
- Attributes: `"><script>` → `&quot;&gt;&lt;script&gt;`
- Script/Style elements are NOT escaped (intentional - they contain code)
- No opt-out, no `Raw()` helper - security by default

#### ⚡ Complete HTMX 2.0 Support

Full type-safe support for all HTMX 2.0 attributes:
- **Methods**: `get`, `post`, `put`, `patch`, `delete`
- **Targeting**: `target`, `swap`, `swapOob`, `select`, `selectOob`
- **Triggers**: All DOM events, `load`, `revealed`, `intersect`, polling, SSE, WebSocket
- **URL**: `pushUrl`, `replaceUrl` (with custom URL support)
- **Data**: `vals`, `headers`, `include`, `params`, `encoding`
- **Validation**: `validate`, `confirm`, `prompt`
- **Loading**: `indicator`, `disabledElt`
- **Sync**: `drop`, `abort`, `replace`, `queue`, `queue first`, `queue last`, `queue all`
- **Inheritance**: `disinherit`, `inherit`
- **History**: `history`, `historyElt`
- **Other**: `preserve`, `request`, `boost`, `disable`, `ext`

#### 🔧 Selector Helpers

Type-safe helpers for HTMX extended selectors:
```typescript
import { id, clss, closest, find, next, previous } from 'lambda.html';

id("content")      // → "#content"
clss("items")      // → ".items"
closest("tr")      // → "closest tr"
find(".content")   // → "find .content"
next("div")        // → "next div"
previous("li")     // → "previous li"
```

#### 📦 60+ HTML Elements

Complete HTML5 coverage with typed attribute methods:

**New semantic elements**: `Nav`, `Aside`, `Figure`, `Figcaption`, `Address`, `Hgroup`, `Search`

**New text elements**: `H5`, `H6`, `Strong`, `Em`, `Mark`, `Small`, `Sub`, `Sup`, `Abbr`, `Cite`, `Q`, `Dfn`, `Kbd`, `Samp`, `Var`, `Br`, `Wbr`, `Bdi`, `Bdo`, `Ruby`, `Rt`, `Rp`, `Blockquote`, `Pre`, `Code`

**New list elements**: `Dl`, `Dt`, `Dd`, `Menu`

**New table elements**: `Tfoot`, `Caption`, `Colgroup`, `Col` (with typed `ThTag`/`TdTag` supporting `colspan`/`rowspan`/`scope`)

**New form elements**: `Fieldset`, `Legend`, `Datalist`, `Output`, `Optgroup`

**Enhanced Input**: `step`, `pattern`, `minlength`, `maxlength`, `autocomplete`, `autofocus`, `checked`, `disabled`, `readonly`, `multiple`, `list`

**Enhanced Textarea**: `minlength`, `maxlength`, `wrap`, `autocomplete`, `autofocus`, `disabled`, `readonly`

**Enhanced Button**: `formaction`, `formmethod`, `disabled`

**New interactive elements**: `Details` (with `open`, `name`), `Summary`, `Dialog` (with `open`)

**New media elements**: `Audio`, `Source`, `Track`, `Picture`, `Canvas`, `Svg` + SVG primitives (`Path`, `Circle`, `Rect`, `Line`, `Polygon`, `Polyline`, `Ellipse`, `G`, `Defs`, `Use`, `Text`, `Tspan`)

**New embedded elements**: `Iframe` (with `sandbox`, `allow`, `loading`), `ObjectEl`, `Embed`, `MapEl`, `Area`

**New document elements**: `Title`, `Meta` (with `charset`, `name`, `content`, `httpEquiv`, `property`), `Link` (with `rel`, `href`, `type`, `media`, `sizes`, `crossorigin`, `integrity`, `as`), `Style`, `Base`, `Noscript`

**Enhanced Script**: `src`, `async`, `defer`, `integrity`, `crossorigin`, `nomodule`

**New data elements**: `Time` (with `datetime`), `Data` (with `value`), `Progress` (with `value`/`max`), `Meter` (with `value`/`min`/`max`/`low`/`high`/`optimum`), `Slot` (with `name`)

#### 🔄 Control Flow Improvements

- `ForEach1` - iteration with index
- `ForEach2` - range iteration (0 to n)
- `ForEach3` - range iteration (start to end)
- `Repeat` - repeat content n times

### 🔧 Improvements

- **Zero dependencies** - pure TypeScript
- **Cleaner HTML output** - no unnecessary whitespace
- **Better TypeScript support** - stricter types throughout
- **Smaller bundle size** - optimized render function
- **229 tests** - comprehensive test coverage

### 📦 Migration Guide

1. **Update element syntax:**
   ```typescript
   // Old
   Div({ class: "container", child: P({ child: Text("Hello") }) })
   
   // New
   Div(P("Hello")).setClass("container")
   ```

2. **Update HTMX usage:**
   ```typescript
   // Old
   Button({ htmx: { method: "post", endpoint: "/api" }, child: Text("Submit") })
   
   // New
   Button("Submit").setHtmx(hx("/api", { method: "post" }))
   ```

3. **Update control flow:**
   ```typescript
   // Old
   ForEach(items, item => Li({ child: Text(item) }))
   
   // New
   ForEach(items, item => Li(item))
   ```

4. **Text nodes no longer need `Text()` wrapper:**
   ```typescript
   // Old
   P({ child: Text("Hello") })
   
   // New
   P("Hello")
   ```

### 🐛 Bug Fixes

- Fixed inconsistent attribute ordering
- Fixed whitespace in rendered output
- Fixed boolean attribute rendering

---

## [2.x] - Previous Versions

See [GitLab releases](https://gitlab.com/seckmaster/lambda.html/-/releases) for previous version history.