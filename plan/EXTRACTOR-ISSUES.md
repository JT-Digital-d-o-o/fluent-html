# Tailwind Extractor Issues

Known issues with `fluent-html-tailwind-extractor` discovered during real-world usage.

---

## 1. TypeScript `as` casts break class extraction

**Status:** Fixed

**Problem:** When a fluent method argument includes a TypeScript type cast (`as SomeType`), the extractor fails to extract the resulting Tailwind class.

```typescript
// BROKEN — extractor returns raw string, no class extracted
.animate("float" as TailwindAnimate)
// Extractor output: ['.animate("float" as TailwindAnimate)']

// WORKS — extractor correctly produces "animate-float"
.animate("float")
// Extractor output: ['.animate("float")', 'animate-float']
```

**Impact:** Custom animations defined in `tailwind.config.js` are silently dropped from compiled CSS. No build error — the class just doesn't exist at runtime, causing broken animations, overlapping text, and invisible elements.

**Workaround:** Use `@ts-expect-error` to suppress TypeScript errors instead of casting:

```typescript
// @ts-expect-error custom animation defined in tailwind.config.js
.animate("my-custom-animation")
```

**Fix:** Implemented `stripTypeCasts()` in the extractor (`src/index.ts:20-22`) which strips all `as` cast variants (`as const`, `as Type`, `as Type<Generic>`, `as "literal"`) before regex matching. Covered by 7 dedicated tests.

---

## 2. No compile-time feedback for missing animations

**Status:** Fixed

**Problem:** If the extractor fails to extract an animation class (or any class), there is no warning during the CSS build. The class is silently omitted. This makes debugging very difficult — the page renders without the animation and the developer has to manually grep the compiled CSS to figure out why.

**Fix:** Implemented an `onWarning` callback in `ExtractorOptions` (`src/index.ts:11-14`). The extractor now compares detected `.method(` calls against successfully extracted ones and warns about unresolved calls (e.g. when arguments use variables or expressions). Covered by tests at `src/index.test.ts:213-235`.
