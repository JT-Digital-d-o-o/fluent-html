# Tailwind CSS Setup for lambda.html

Quick guide to set up Tailwind CSS with lambda.html's SwiftUI-style API.

## The Problem

When you use lambda.html's SwiftUI-style methods, Tailwind CSS doesn't automatically know which classes to generate:

```typescript
Div()
  .background("red-500")  // Generates "bg-red-500"
  .padding("4")           // Generates "p-4"
```

**Solution:** Use the `lambda-html-tailwind-extractor` to tell Tailwind which classes to generate.

## Quick Setup (3 Steps)

### 1. Install Dependencies

```bash
npm install --save-dev tailwindcss autoprefixer postcss lambda-html-tailwind-extractor
```

### 2. Configure Tailwind

Create or update `tailwind.config.js`:

```javascript
const lambdaHtmlExtractor = require('lambda-html-tailwind-extractor');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: {
    files: [
      './src/**/*.{ts,tsx,js,jsx}',
      './views/**/*.{ts,tsx,js,jsx}',
    ],
    extract: {
      ts: lambdaHtmlExtractor,
      tsx: lambdaHtmlExtractor,
      js: lambdaHtmlExtractor,
      jsx: lambdaHtmlExtractor,
    },
  },
  theme: {
    extend: {},
  },
  plugins: [],
};
```

### 3. Configure PostCSS

Create `postcss.config.js`:

```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

### 4. Import Tailwind in Your CSS

Create `styles.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

Then import it in your app:

```typescript
import './styles.css';
```

## How It Works

The extractor scans your lambda.html code and tells Tailwind which classes to generate:

```typescript
// Your code:
Div()
  .background("red-500")
  .padding("4")
  .textColor("white")
  .rounded("lg")

// Extractor finds: bg-red-500, p-4, text-white, rounded-lg
// Tailwind generates CSS for these classes
```

## Build Process

Add to your `package.json`:

```json
{
  "scripts": {
    "build:css": "tailwindcss -i ./styles.css -o ./dist/output.css",
    "watch:css": "tailwindcss -i ./styles.css -o ./dist/output.css --watch"
  }
}
```

Then run:

```bash
npm run build:css    # Build once
npm run watch:css    # Watch for changes
```

## Complete Example

```typescript
// src/views/card.ts
import { Div, H2, P, Button } from "lambda.html";

export const Card = () =>
  Div([
    H2("Card Title")
      .textSize("2xl")
      .fontWeight("bold")
      .margin("bottom", "4"),

    P("Card content")
      .textColor("gray-600"),

    Button("Click")
      .padding("x", "4")
      .padding("y", "2")
      .background("blue-500")
      .textColor("white")
      .rounded()
      .addClass("hover:bg-blue-600"),
  ])
    .background("white")
    .padding("6")
    .rounded("lg")
    .shadow("md");
```

With this setup, Tailwind will generate CSS for:
- `text-2xl`, `font-bold`, `mb-4`
- `text-gray-600`
- `px-4`, `py-2`, `bg-blue-500`, `text-white`, `rounded`
- `hover:bg-blue-600`
- `bg-white`, `p-6`, `rounded-lg`, `shadow-md`

## Troubleshooting

### Classes Not Showing Up

1. Check `content.files` includes your lambda.html files
2. Make sure the extractor is assigned to your file extensions
3. Rebuild your CSS: `npm run build:css`
4. Check browser console for CSS loading errors

### Want to See What's Being Extracted?

```javascript
// Test the extractor
const lambdaHtmlExtractor = require('lambda-html-tailwind-extractor');
const fs = require('fs');

const content = fs.readFileSync('./src/views/card.ts', 'utf-8');
const classes = lambdaHtmlExtractor(content);
console.log('Extracted classes:', classes);
```

## Publishing the Extractor

The extractor is in `/tailwind-extractor`. To publish updates:

```bash
cd tailwind-extractor
npm version patch   # or minor/major
npm publish
```

## Resources

- [Tailwind Extractor README](./tailwind-extractor/README.md)
- [Tailwind Content Configuration](https://tailwindcss.com/docs/content-configuration)
- [lambda.html SwiftUI Styling](./AI-SWIFTUI-STYLING.md)
