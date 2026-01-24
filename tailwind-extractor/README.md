# lambda-html-tailwind-extractor

Tailwind CSS content extractor for lambda.html's SwiftUI-style methods. This extractor tells Tailwind which classes to generate based on your lambda.html code.

## The Problem

When you use lambda.html's SwiftUI-style API, Tailwind doesn't automatically know which classes to generate:

```typescript
// Tailwind can't detect that this generates "bg-red-500 p-4"
Div()
  .background("red-500")
  .padding("4")
```

This extractor solves that by teaching Tailwind how to read lambda.html method calls.

## Installation

```bash
npm install --save-dev lambda-html-tailwind-extractor
```

## Usage

### Basic Setup

Update your `tailwind.config.js`:

```javascript
const lambdaHtmlExtractor = require('lambda-html-tailwind-extractor');

module.exports = {
  content: {
    files: [
      './src/**/*.{ts,tsx,js,jsx}',
      './views/**/*.{ts,tsx,js,jsx}',
    ],
    extract: {
      // Use the lambda.html extractor for TypeScript files
      ts: lambdaHtmlExtractor,
      tsx: lambdaHtmlExtractor,
    },
  },
  theme: {
    extend: {},
  },
  plugins: [],
};
```

### TypeScript/ESM Setup

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss';
import lambdaHtmlExtractor from 'lambda-html-tailwind-extractor';

const config: Config = {
  content: {
    files: [
      './src/**/*.{ts,tsx}',
      './views/**/*.{ts,tsx}',
    ],
    extract: {
      ts: lambdaHtmlExtractor,
      tsx: lambdaHtmlExtractor,
    },
  },
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
```

## What It Extracts

The extractor recognizes all lambda.html SwiftUI-style methods:

### Method Calls

```typescript
.background("red-500")          → bg-red-500
.padding("4")                   → p-4
.padding("x", "4")              → px-4
.margin("top", "8")             → mt-8
.textColor("blue-500")          → text-blue-500
.textSize("xl")                 → text-xl
.textAlign("center")            → text-center
.fontWeight("bold")             → font-bold
.w("full")                      → w-full
.h("screen")                    → h-screen
.flex()                         → flex
.flexDirection("col")           → flex-col
.justifyContent("center")       → justify-center
.alignItems("center")           → items-center
.gap("4")                       → gap-4
.grid()                         → grid
.gridCols("3")                  → grid-cols-3
.border()                       → border
.rounded("lg")                  → rounded-lg
.shadow("md")                   → shadow-md
.position("relative")           → relative
.zIndex("10")                   → z-10
.opacity("50")                  → opacity-50
.cursor("pointer")              → cursor-pointer
.overflow("hidden")             → overflow-hidden
```

### Direct Class Methods

```typescript
.setClass("bg-white p-4")       → bg-white, p-4
.addClass("hover:bg-blue-600")  → hover:bg-blue-600
```

## Complete Example

### Your lambda.html Code

```typescript
// src/components/card.ts
import { Div, H2, P, Button } from "lambda.html";

export const Card = () =>
  Div([
    H2("Card Title")
      .textSize("2xl")
      .fontWeight("bold")
      .margin("bottom", "4"),

    P("Card content")
      .textColor("gray-600")
      .margin("bottom", "6"),

    Button("Click me")
      .padding("x", "6")
      .padding("y", "3")
      .background("blue-500")
      .textColor("white")
      .rounded("lg")
      .cursor("pointer")
      .addClass("hover:bg-blue-600 transition-colors"),
  ])
    .background("white")
    .padding("6")
    .rounded("xl")
    .shadow("lg")
    .border()
    .borderColor("gray-200")
    .w("full")
    .maxW("md");
```

### Extracted Classes

The extractor will find:
```
text-2xl, font-bold, mb-4, text-gray-600, mb-6, px-6, py-3, bg-blue-500,
text-white, rounded-lg, cursor-pointer, hover:bg-blue-600, transition-colors,
bg-white, p-6, rounded-xl, shadow-lg, border, border-gray-200, w-full, max-w-md
```

Tailwind will generate CSS for all these classes.

## PostCSS Setup

Make sure you have PostCSS configured to process Tailwind:

```javascript
// postcss.config.js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

And import Tailwind in your CSS:

```css
/* styles.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

## Advanced Configuration

### Custom File Extensions

If you use custom file extensions:

```javascript
// tailwind.config.js
module.exports = {
  content: {
    files: ['./src/**/*.custom-ext'],
    extract: {
      'custom-ext': lambdaHtmlExtractor,
    },
  },
};
```

### Combining with Other Extractors

```javascript
const lambdaHtmlExtractor = require('lambda-html-tailwind-extractor');
const defaultExtractor = require('tailwindcss/lib/lib/defaultExtractor');

module.exports = {
  content: {
    files: ['./src/**/*.{ts,html}'],
    extract: {
      ts: (content) => {
        // Combine lambda.html extractor with default extractor
        const lambdaClasses = lambdaHtmlExtractor(content);
        const defaultClasses = defaultExtractor(content);
        return [...lambdaClasses, ...defaultClasses];
      },
      html: defaultExtractor,
    },
  },
};
```

### Safelist for Dynamic Classes

If you generate class names dynamically, add them to the safelist:

```javascript
module.exports = {
  content: {
    files: ['./src/**/*.ts'],
    extract: {
      ts: lambdaHtmlExtractor,
    },
  },
  safelist: [
    // Always include these classes
    'bg-red-500',
    'bg-blue-500',
    'bg-green-500',
    // Pattern-based safelist
    {
      pattern: /bg-(red|blue|green)-(100|200|300|400|500)/,
    },
  ],
};
```

## Troubleshooting

### Classes Not Being Generated

1. **Check file paths**: Make sure your `content.files` includes all files using lambda.html
2. **Check extractor assignment**: Ensure the extractor is assigned to the right file extensions
3. **Rebuild**: Run your build command to regenerate Tailwind CSS
4. **Check syntax**: The extractor uses regex, so unusual syntax might not be detected

### Viewing Extracted Classes

Add this to see what's being extracted:

```javascript
const lambdaHtmlExtractor = require('lambda-html-tailwind-extractor');
const fs = require('fs');

// Read a file
const content = fs.readFileSync('./src/components/card.ts', 'utf-8');
const classes = lambdaHtmlExtractor(content);
console.log('Extracted classes:', classes);
```

### Dynamic Class Names

The extractor works with string literals. For dynamic classes, use safelist:

```typescript
// ❌ Won't be extracted (dynamic)
const color = getColor();
Div().background(color);

// ✅ Will be extracted (literal)
Div().background("red-500");

// ✅ Solution: Use safelist in tailwind.config.js
```

## How It Works

The extractor:

1. Parses your TypeScript/JavaScript files as strings
2. Finds lambda.html method calls using regex
3. Extracts arguments from methods like `.background("red-500")`
4. Converts them to Tailwind classes (e.g., `bg-red-500`)
5. Returns the list of classes to Tailwind
6. Tailwind generates CSS for those classes

## Requirements

- Tailwind CSS 3.0 or higher
- lambda.html 4.0 or higher

## License

ISC
