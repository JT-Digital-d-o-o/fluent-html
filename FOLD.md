# Fold / Catamorphism

Lambda.html provides a **catamorphism** (`foldView`) for its `View` type — a single recursive function that can collapse any HTML tree into an arbitrary result type. If you have used `Array.reduce`, the concept is the same but generalised to trees.

---

## Why Fold?

A `View` is a recursive data type: tags contain children which are themselves views. Any operation that walks the tree — counting nodes, extracting text, collecting links, transforming elements — follows the same recursive pattern. `foldView` captures that pattern once so you only need to describe *what to do at each node*.

Benefits:

- **One traversal function** instead of hand-written recursion for every query
- **Composable** — algebras are plain objects, easy to create, test, and share
- **Type-safe** — the result type `A` is inferred from your algebra

---

## Core API

### `ViewAlgebra<A>`

An algebra is an object with four functions that tell `foldView` how to handle each kind of `View` node:

```typescript
interface ViewAlgebra<A> {
  /** Handle plain text strings */
  text: (s: string) => A;

  /** Handle raw (unescaped) HTML strings */
  raw: (html: string) => A;

  /** Handle a tag element — children have already been folded into type A */
  tag: (element: string, attrs: TagAttrs, children: A) => A;

  /** Handle an array of views — each item has already been folded into type A */
  list: (children: A[]) => A;
}
```

### `foldView<A>(algebra, view): A`

Recursively walks the `View` and applies the algebra bottom-up:

```typescript
import { foldView } from 'lambda.html';

const result = foldView(myAlgebra, myView);
```

### `TagAttrs`

Attributes extracted from a `Tag` instance for use inside the `tag` handler:

```typescript
interface TagAttrs {
  id?: string;
  class?: string;
  style?: string;
  attributes: Record<string, string>;
  htmx?: HTMX;
  toggles?: string[];
  [key: string]: unknown;  // element-specific attrs (href, src, etc.)
}
```

---

## Pre-built Algebras

### `countAlgebra` — count elements

```typescript
import { foldView, countAlgebra, Div, P, Ul, Li } from 'lambda.html';

const page = Div([
  P("Intro"),
  Ul([Li("A"), Li("B"), Li("C")])
]);

foldView(countAlgebra, page);
// 6  (div + p + ul + 3 li)
```

How it works:

```typescript
const countAlgebra: ViewAlgebra<number> = {
  text: () => 0,                          // strings are not elements
  raw:  () => 0,
  tag:  (_, __, childCount) => 1 + childCount,  // count self + children
  list: (counts) => counts.reduce((a, b) => a + b, 0),
};
```

### `textAlgebra` — extract plain text

Strips all tags and returns the concatenated text content. Block-level elements (`p`, `div`, headings, `li`, etc.) append a newline for readability.

```typescript
import { foldView, textAlgebra, Div, H1, P, Span } from 'lambda.html';

const view = Div([
  H1("Welcome"),
  P(["Read the ", Span("docs"), " carefully."])
]);

foldView(textAlgebra, view);
// "Welcome\nRead the docs carefully.\n\n"
```

### `linksAlgebra` — collect all links

Returns an array of `LinkInfo` objects for every `<a>` element in the tree.

```typescript
import { foldView, linksAlgebra, Div, A } from 'lambda.html';

const nav = Div([
  A("Home").setHref("/"),
  A("Docs").setHref("/docs"),
  A("GitHub").setHref("https://github.com/example").setTarget("_blank").setRel("noopener"),
]);

foldView(linksAlgebra, nav);
// [
//   { href: "/" },
//   { href: "/docs" },
//   { href: "https://github.com/example", target: "_blank", rel: "noopener" }
// ]
```

`LinkInfo` shape:

```typescript
interface LinkInfo {
  href: string;
  text?: string;
  target?: string;
  rel?: string;
}
```

### `renderAlgebra` — render to HTML string

An alternative to the built-in `render()` function, implemented as a fold. Useful for understanding the fold pattern; for production rendering prefer the optimised `render()`.

```typescript
import { foldView, renderAlgebra, Div, P } from 'lambda.html';

foldView(renderAlgebra, Div([P("Hello")]));
// '<div><p>Hello</p></div>'
```

---

## Transform Helpers

These helpers return `ViewAlgebra<View>` — they fold a `View` into a *new* `View`, letting you structurally transform your HTML trees.

### `createTransformAlgebra`

Create a custom element transformer. Return a new `{ element, attrs }` to modify the node, or `null` to keep it unchanged.

```typescript
import { foldView, createTransformAlgebra, Div, P, render } from 'lambda.html';

// Wrap every <p> in a container class
const wrapParagraphs = createTransformAlgebra((el, attrs) => {
  if (el === 'p') {
    return {
      element: el,
      attrs: { ...attrs, class: 'prose-paragraph' }
    };
  }
  return null;
});

const original = Div([P("First"), P("Second")]);
const transformed = foldView(wrapParagraphs, original);

render(transformed);
// <div><p class="prose-paragraph">First</p>
//      <p class="prose-paragraph">Second</p></div>
```

### `addClassToMatching`

A convenience wrapper around `createTransformAlgebra` that adds a CSS class to elements matching a predicate.

```typescript
import { foldView, addClassToMatching, Div, H1, H2, P, render } from 'lambda.html';

// Highlight all headings
const highlightHeadings = addClassToMatching(
  (el) => el.startsWith('h'),
  'text-blue-600 font-bold'
);

const page = Div([H1("Title"), P("Body"), H2("Subtitle")]);
const highlighted = foldView(highlightHeadings, page);

render(highlighted);
// Headings now have class="text-blue-600 font-bold"
```

---

## Writing Custom Algebras

Creating your own algebra is as simple as defining an object with `text`, `raw`, `tag`, and `list`. Here are several practical examples.

### Collect element names

```typescript
import { foldView, ViewAlgebra, Div, P, Span } from 'lambda.html';

const elementNamesAlgebra: ViewAlgebra<string[]> = {
  text: () => [],
  raw:  () => [],
  tag:  (el, _, childNames) => [el, ...childNames],
  list: (arrays) => arrays.flat(),
};

foldView(elementNamesAlgebra, Div([P("Hello"), Span("World")]));
// ["div", "p", "span"]
```

### Calculate max depth

```typescript
const depthAlgebra: ViewAlgebra<number> = {
  text: () => 0,
  raw:  () => 0,
  tag:  (_, __, childDepth) => 1 + childDepth,
  list: (depths) => Math.max(0, ...depths),
};

foldView(depthAlgebra, Div([Div([Div([P("Deep")])])]));
// 4  (div > div > div > p)
```

### Check if a class exists anywhere in the tree

```typescript
const hasClassAlgebra = (target: string): ViewAlgebra<boolean> => ({
  text: () => false,
  raw:  () => false,
  tag:  (_, attrs, childResult) =>
    (attrs.class?.split(' ').includes(target) ?? false) || childResult,
  list: (results) => results.some(Boolean),
});

const view = Div([P("Normal"), Span("Highlighted").setClass("highlight")]);
foldView(hasClassAlgebra("highlight"), view);  // true
foldView(hasClassAlgebra("missing"), view);    // false
```

### Collect all images

```typescript
interface ImageInfo {
  src: string;
  alt?: string;
}

const imagesAlgebra: ViewAlgebra<ImageInfo[]> = {
  text: () => [],
  raw:  () => [],
  tag:  (el, attrs, childImages) => {
    if (el === 'img' && attrs.src) {
      return [{ src: attrs.src as string, alt: attrs.alt as string | undefined }, ...childImages];
    }
    return childImages;
  },
  list: (arrays) => arrays.flat(),
};
```

### Build a table of contents

```typescript
interface TocEntry {
  level: number;
  text: string;
  id?: string;
}

const tocAlgebra: ViewAlgebra<TocEntry[]> = {
  text: () => [],
  raw:  () => [],
  tag:  (el, attrs, childEntries) => {
    const match = el.match(/^h([1-6])$/);
    if (match) {
      // childEntries is the folded text inside the heading
      // For a proper TOC you'd combine with textAlgebra
      return [{
        level: parseInt(match[1]),
        text: '',  // would need text extraction
        id: attrs.id,
      }, ...childEntries];
    }
    return childEntries;
  },
  list: (arrays) => arrays.flat(),
};
```

---

## How It Works

`foldView` pattern-matches on the four possible shapes of a `View`:

| View shape   | Handler called               |
|-------------|------------------------------|
| `string`    | `algebra.text(s)`            |
| `RawString` | `algebra.raw(html)`          |
| `Tag`       | `algebra.tag(el, attrs, foldedChildren)` |
| `View[]`    | `algebra.list(foldedItems)`  |

Crucially, children are folded **before** their parent — the `children` parameter in `tag` and the items in `list` are already of type `A`, not `View`. This bottom-up evaluation is what makes catamorphisms powerful: you never need to write recursion yourself.

```
Div([P("Hello"), P("World")])

foldView(countAlgebra, ...) evaluates as:

  list([ foldView(P("Hello")),  foldView(P("World")) ])
  list([ tag("p", {}, text("Hello")),  tag("p", {}, text("World")) ])
  list([ tag("p", {}, 0),  tag("p", {}, 0) ])
  list([ 1,  1 ])
  → 2

  tag("div", {}, 2)
  → 3
```

---

## API Summary

| Export                    | Type                    | Description                                      |
|--------------------------|-------------------------|--------------------------------------------------|
| `foldView(alg, view)`   | `<A>(ViewAlgebra<A>, View) => A` | Core fold function                     |
| `ViewAlgebra<A>`         | interface               | Algebra definition                               |
| `TagAttrs`               | interface               | Tag attributes passed to `tag` handler           |
| `countAlgebra`           | `ViewAlgebra<number>`   | Count all elements                               |
| `textAlgebra`            | `ViewAlgebra<string>`   | Extract plain text                               |
| `linksAlgebra`           | `ViewAlgebra<LinkInfo[]>` | Collect all `<a>` links                        |
| `renderAlgebra`          | `ViewAlgebra<string>`   | Render to HTML (use `render()` in production)    |
| `createTransformAlgebra` | `(...) => ViewAlgebra<View>` | Create element transformers                 |
| `addClassToMatching`     | `(...) => ViewAlgebra<View>` | Add a class to matching elements            |
| `LinkInfo`               | interface               | Shape returned by `linksAlgebra`                 |
