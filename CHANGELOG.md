# Changelog

All notable changes to Lambda.html will be documented in this file.

## [4.0.0-beta.1] - 2025-01

### 🎉 New Feature: Reactive System

Lambda.html now includes a **minimal, compile-time-checked reactive system** for client-side rendering with automatic state management and DOM updates.

#### ✨ Key Features

**Declarative Reactive Bindings:**
- `.bindText(expr)` - Bind expression to textContent
- `.bindHtml(expr)` - Bind expression to innerHTML (⚠️ XSS risk)
- `.bindShow(expr)` / `.bindHide(expr)` - Conditional visibility
- `.bindClass(className, expr)` - Dynamic CSS classes
- `.bindAttr(attrName, expr)` - Dynamic attributes
- `.bindStyle(propName, expr)` - Dynamic inline styles
- `.bindValue(expr)` - Two-way input binding

**Event Handlers:**
- `.onClick(statement)` - Click event handler
- `.onInput(statement)` - Input event handler
- `.onChange(statement)` - Change event handler
- `.onSubmit(statement)` - Form submit handler (with automatic preventDefault)
- `.onKeydown(statement)` - Keyboard event handler
- `.onFocus(statement)` / `.onBlur(statement)` - Focus event handlers

**Compile-Time Validation:**
- `compile(view)` validates all reactive bindings before runtime
- Checks that all `data.xxx` references are bound by `bindState()`
- Prevents variable shadowing in nested state
- Provides helpful error messages for unbound variables

**Simple API Pattern:**
- `bind*` methods for reactive data → DOM
- `on*` methods for DOM events → data mutations
- All expressions reference state via `data.propertyName`

#### 📝 Usage Example

```typescript
import { Div, Button, Span, compile, renderWithScript } from 'lambda.html';

const counter = Div([
  Button("Increment").onClick("data.count++"),
  Span().bindText("'Count: ' + data.count"),
  Div("High count!").bindShow("data.count > 5")
]).bindState({ count: 0 });

const error = compile(counter);
if (error) throw new Error(error.message);

console.log(renderWithScript(counter));
// Outputs HTML + <script> with reactive behavior
```

#### 🔧 New API Functions

- `compile(view)` - Validate reactive bindings and assign unique IDs
- `generateScript(view)` - Generate JavaScript for reactive behavior
- `renderWithScript(view, renderFn?)` - Convenience function combining render() and generateScript()
- `resetIdCounter()` - Reset global ID counter (useful for testing)

#### 🏗️ Implementation Details

- Zero runtime dependencies - generates vanilla JavaScript
- Automatic ID assignment for reactive elements
- Efficient DOM updates via `update()` function
- Event handlers automatically call `update()` after mutations
- IIFE wrapper for state isolation
- Support for nested `bindState()` for component composition

#### 📚 Documentation

See the new **Reactive System** section in README.md for:
- Complete API documentation
- Reactive binding examples
- Event handler patterns
- Compile-time validation guide
- Complete working examples (counter, todo list, forms, tabs)

---

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