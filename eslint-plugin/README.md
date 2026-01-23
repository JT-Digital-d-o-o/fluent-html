# eslint-plugin-lambda-html

ESLint plugin for [lambda.html](https://gitlab.com/seckmaster/lambda.html) that warns when `.setClass()` is used with Tailwind CSS classes that have dedicated SwiftUI-style methods.

## The Problem

When using lambda.html's SwiftUI-style API, calling `.setClass()` can override styles set by dedicated methods:

```typescript
// This is problematic:
Div()
  .background("green-700")  // Sets bg-green-700
  .padding("4")             // Sets p-4
  .setClass("bg-red-500")   // Overwrites everything! Only bg-red-500 remains
```

The `.setClass()` method **replaces** all classes, while dedicated methods like `.background()`, `.padding()`, etc., **append** classes safely.

## The Solution

This ESLint plugin warns you when `.setClass()` contains classes that have dedicated methods:

```typescript
// ❌ Warning: Use .background() instead
Div().setClass("bg-red-500 p-4")

// ✅ Correct: Use dedicated methods
Div()
  .background("red-500")
  .padding("4")

// ✅ Also correct: Use .addClass() for additional classes
Div()
  .background("red-500")
  .padding("4")
  .addClass("hover:bg-red-600")  // For pseudo-classes, this is fine
```

## Installation

```bash
npm install --save-dev eslint-plugin-lambda-html
```

## Usage

### Flat Config (ESLint 9+)

```javascript
// eslint.config.js
import lambdaHtml from "eslint-plugin-lambda-html";

export default [
  {
    plugins: {
      "lambda-html": lambdaHtml
    },
    rules: {
      "lambda-html/no-known-modifiers-in-setclass": "warn"
    }
  }
];
```

### Legacy Config (ESLint 8 and below)

```javascript
// .eslintrc.js
module.exports = {
  plugins: ["lambda-html"],
  extends: ["plugin:lambda-html/recommended"],
};
```

Or configure manually:

```javascript
// .eslintrc.js
module.exports = {
  plugins: ["lambda-html"],
  rules: {
    "lambda-html/no-known-modifiers-in-setclass": "warn",
  },
};
```

## Rule: `no-known-modifiers-in-setclass`

Warns when `.setClass()` is called with Tailwind classes that have dedicated SwiftUI-style methods.

### Detected Patterns

The rule checks for these Tailwind class patterns and suggests alternatives:

| Pattern | Suggested Method |
|---------|-----------------|
| `p-*`, `px-*`, `py-*`, `pt-*`, etc. | `.padding()` |
| `m-*`, `mx-*`, `my-*`, `mt-*`, etc. | `.margin()` |
| `bg-*` | `.background()` |
| `text-red-*`, `text-blue-*`, etc. | `.textColor()` |
| `text-xl`, `text-2xl`, etc. | `.textSize()` |
| `text-center`, `text-left`, etc. | `.textAlign()` |
| `font-bold`, `font-semibold`, etc. | `.fontWeight()` |
| `w-*`, `h-*` | `.w()`, `.h()` |
| `max-w-*`, `min-w-*` | `.maxW()`, `.minW()` |
| `flex`, `flex-col`, `flex-row` | `.flex()`, `.flexDirection()` |
| `justify-*`, `items-*` | `.justifyContent()`, `.alignItems()` |
| `gap-*` | `.gap()` |
| `grid`, `grid-cols-*` | `.grid()`, `.gridCols()` |
| `border`, `border-*` | `.border()`, `.borderColor()` |
| `rounded`, `rounded-*` | `.rounded()` |
| `shadow`, `shadow-*` | `.shadow()` |
| `relative`, `absolute`, `fixed`, etc. | `.position()` |
| `z-*`, `opacity-*`, `cursor-*` | `.zIndex()`, `.opacity()`, `.cursor()` |
| `overflow-*` | `.overflow()` |

### Examples

#### ❌ Incorrect

```typescript
// Will trigger warnings
Div().setClass("bg-red-500")
Div().setClass("p-4 m-2")
Div().setClass("flex justify-center items-center")
Div().setClass("text-xl font-bold text-center")
```

#### ✅ Correct

```typescript
// Use dedicated methods
Div().background("red-500")
Div().padding("4").margin("2")
Div().flex().justifyContent("center").alignItems("center")
Div().textSize("xl").fontWeight("bold").textAlign("center")

// Use .addClass() for classes without dedicated methods
Div()
  .background("red-500")
  .addClass("hover:bg-red-600 focus:ring-2")  // Pseudo-classes are fine

// Or use .setClass() for completely custom classes
Div().setClass("my-custom-class another-custom-class")
```

## When to Use `.setClass()` vs `.addClass()`

- **Use dedicated methods** (`.background()`, `.padding()`, etc.) for base styles
- **Use `.addClass()`** for:
  - Responsive variants: `md:w-1/2`, `lg:flex-row`
  - Pseudo-classes: `hover:bg-blue-600`, `focus:ring-2`
  - State variants: `active:scale-95`, `disabled:opacity-50`
  - Custom classes without dedicated methods
- **Use `.setClass()`** only when:
  - You need to completely replace all classes
  - You're using custom classes that don't conflict with SwiftUI methods

## Configuration

### Severity Levels

```javascript
// Error (blocks build)
"lambda-html/no-known-modifiers-in-setclass": "error"

// Warning (shows warning but doesn't block)
"lambda-html/no-known-modifiers-in-setclass": "warn"

// Disabled
"lambda-html/no-known-modifiers-in-setclass": "off"
```

## License

ISC
