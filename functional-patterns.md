# Functional Programming Patterns

fluent-html provides a composable, type-safe toolkit of functional programming patterns for building and transforming HTML view trees.

---

## Recursion Schemes

Four recursion schemes operate over the `View` type — a recursive sum type of `Tag | string | RawString | View[]`.

### Catamorphism (`foldView`)

Collapse a View tree bottom-up into a result value. Children are folded before their parent, so the algebra always receives already-processed results.

```typescript
function foldView<A>(alg: ViewAlgebra<A>, view: View): A
```

**ViewAlgebra** defines how to handle each node type:

```typescript
interface ViewAlgebra<A> {
  text: (s: string) => A;
  raw: (html: string) => A;
  tag: (element: string, attrs: TagAttrs, children: A) => A;
  list: (children: A[]) => A;
}
```

```typescript
// Count all elements in a tree
foldView(countAlgebra, Div(P("Hello"), Span("World")))  // 3

// Extract plain text
foldView(textAlgebra, Div(H1("Title"), P("Body")))  // "Title\nBody\n\n"

// Collect all links
foldView(linksAlgebra, Nav(
  A("Home").setHref("/"),
  A("Docs").setHref("/docs").setTarget("_blank"),
))
// [{ href: "/" }, { href: "/docs", target: "_blank" }]

// Render to HTML (equivalent to render())
foldView(renderAlgebra, Div(P("Hello")))  // "<div><p>Hello</p></div>"

// Custom algebra — collect all element names
const elementNames: ViewAlgebra<string[]> = {
  text: () => [],
  raw: () => [],
  tag: (el, _, childNames) => [el, ...childNames],
  list: (arrays) => arrays.flat(),
};
foldView(elementNames, Div(P("A"), Span("B")))  // ["div", "p", "span"]
```

### Paramorphism (`paraView`)

Like `foldView`, but the `tag` handler also receives the original View subtree — useful when you need to inspect the original node while processing already-folded results.

```typescript
function paraView<A>(alg: ParaAlgebra<A>, view: View): A
```

```typescript
interface ParaAlgebra<A> {
  text: (s: string) => A;
  raw: (html: string) => A;
  tag: (element: string, attrs: TagAttrs, children: A, original: View) => A;
  list: (children: A[]) => A;
}
```

```typescript
// Wrap every <a> in a tooltip showing its href
const wrapLinks: ParaAlgebra<string> = {
  text: (s) => s,
  raw: (html) => html,
  tag: (el, attrs, children, _original) => {
    if (el === "a" && attrs.href) {
      return `<span title="${attrs.href}">${children}</span>`;
    }
    return `<${el}>${children}</${el}>`;
  },
  list: (items) => items.join(""),
};

paraView(wrapLinks, Div(A("Click").setHref("/page")))
// '<div><span title="/page">Click</span></div>'

// Built-in: generate accessibility descriptions
paraView(ariaDescribeAlgebra, Nav(
  A("Home").setHref("/"),
  A("About").setHref("/about"),
))
// "nav containing: link 'Home' (href: /), link 'About' (href: /about)"
```

### Anamorphism (`unfoldView`)

Build a View tree by recursively expanding a seed. The dual of `foldView` — instead of collapsing a tree into a value, it grows a tree from a seed.

```typescript
function unfoldView<S>(coalg: ViewCoalgebra<S>, seed: S): View
```

A coalgebra produces one layer of the tree per call, with new seeds where children will be:

```typescript
type ViewCoalgebra<S> = (seed: S) => ViewLayer<S>;

type ViewLayer<S> =
  | { type: "text"; value: string }
  | { type: "raw"; html: string }
  | { type: "tag"; element: string; attrs?: Partial<TagAttrs>; children: S[] }
  | { type: "list"; items: S[] };
```

```typescript
// Build nested divs from a depth number
type Seed = { depth: number };
const nestCoalg: ViewCoalgebra<Seed> = (seed) => {
  if (seed.depth === 0) return { type: "text", value: "leaf" };
  return {
    type: "tag",
    element: "div",
    children: [{ depth: seed.depth - 1 }],
  };
};

render(unfoldView(nestCoalg, { depth: 3 }))
// "<div><div><div>leaf</div></div></div>"

// Built-in: table of contents from flat headings
const headings: TocEntry[] = [
  { text: "Introduction", id: "intro" },
  { text: "Getting Started", id: "start" },
];
render(unfoldView(linkedTocCoalgebra, { type: "list", entries: headings }))
// <ul><li><a href="#intro">Introduction</a></li><li><a href="#start">Getting Started</a></li></ul>
```

### Hylomorphism (`hyloView`)

Fused unfold-then-fold in a single pass — expands seeds via a coalgebra and immediately folds each layer via an algebra, without allocating an intermediate View tree.

```typescript
function hyloView<S, A>(coalg: ViewCoalgebra<S>, alg: ViewAlgebra<A>, seed: S): A
```

```typescript
// Render nested divs directly to HTML — no intermediate tree
hyloView(nestCoalg, renderAlgebra, { depth: 3 })
// "<div><div><div>leaf</div></div></div>"

// Count elements that would be generated
hyloView(nestCoalg, countAlgebra, { depth: 3 })  // 3

// Equivalent to (but more efficient than):
foldView(renderAlgebra, unfoldView(nestCoalg, { depth: 3 }))
```

### Built-in Algebras & Coalgebras

| Name | Type | Result | Purpose |
|------|------|--------|---------|
| `countAlgebra` | `ViewAlgebra<number>` | Element count | Count all tags in tree |
| `textAlgebra` | `ViewAlgebra<string>` | Plain text | Extract text with block-element newlines |
| `linksAlgebra` | `ViewAlgebra<LinkInfo[]>` | Link list | Collect all `<a>` hrefs, targets, rels |
| `renderAlgebra` | `ViewAlgebra<string>` | HTML string | Render tree to HTML |
| `createTransformAlgebra` | `ViewAlgebra<View>` factory | Transformed tree | Rewrite elements by predicate |
| `addClassToMatching` | `ViewAlgebra<View>` factory | Transformed tree | Add CSS class to matching elements |
| `ariaDescribeAlgebra` | `ParaAlgebra<string>` | Description | Accessibility audit descriptions |
| `tocCoalgebra` | `ViewCoalgebra<TocSeed>` | `<ul>/<li>` tree | TOC from flat heading list |
| `linkedTocCoalgebra` | `ViewCoalgebra<LinkedTocSeed>` | `<ul>/<li>/<a>` tree | Linked TOC with anchor hrefs |

---

## Control Flow

### IfThen / IfThenElse

Conditional rendering with nullable value narrowing.

```typescript
// Boolean condition
IfThen(user.isAdmin, () => Button("Admin Panel"))

// Nullable narrowing — avatar is string inside callback
IfThen(user.avatar, (avatar) => Img().setSrc(avatar))

// Two branches
IfThenElse(user.name, (name) => Span(name), () => Span("Anonymous"))
```

The nullable overload narrows the type — the callback receives `T`, not `T | null | undefined`.

### Match

Exhaustive pattern matching on string/number values or discriminated unions. TypeScript enforces completeness at compile time.

```typescript
// Value matching — all cases required
Match(status, {
  active:  () => Badge("Active").background("green-100"),
  pending: () => Badge("Pending").background("yellow-100"),
  error:   () => Badge("Error").background("red-100"),
})

// Partial with default
Match(role, { admin: () => AdminBadge() }, () => UserBadge())

// Discriminated union — automatic type narrowing per branch
type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; data: User[] };

Match(state, "status", {
  loading: ()  => Spinner(),
  error:   (s) => Alert(s.message),   // s: { status: "error"; message: string }
  success: (s) => UserList(s.data),   // s: { status: "success"; data: User[] }
})
```

### ForEach

Iterate over items, a count, or a range.

```typescript
// Iterable
Ul(ForEach(users, (user, i) => Li(`${i + 1}. ${user.name}`)))

// Count (0 to n-1)
Div(ForEach(5, (i) => Span(`Star ${i}`)))

// Range (low to high-1)
ForEach(1, 6, (page) => A(`Page ${page}`).setHref(`/page/${page}`))
```

### Repeat

Repeat a view a fixed number of times.

```typescript
Div(Repeat(3, () => Span("*")))
```

---

## Scoped Context

Implicit, request-safe values without prop drilling. Uses `using` (TC39 Explicit Resource Management) for automatic cleanup.

```typescript
const ThemeCtx = createContext<"light" | "dark">("light");
const LocaleCtx = createContext("en-US");

function Page(theme: "light" | "dark") {
  using _ = ThemeCtx.scope(theme);
  return Div(Header(), Content(), Footer());
}

function Header() {
  // Reads current scope value — no prop drilling needed
  const bg = ThemeCtx.current === "dark" ? "gray-900" : "white";
  return Nav("Home", "About").background(bg);
}
```

Scopes nest correctly — inner scopes override, disposal restores the previous value:

```typescript
const Ctx = createContext("default");

{
  using _outer = Ctx.scope("outer");
  Ctx.current  // "outer"

  {
    using _inner = Ctx.scope("inner");
    Ctx.current  // "inner"
  }

  Ctx.current  // "outer" (restored)
}

Ctx.current  // "default" (restored)
```

Use for cross-cutting values read by many components (i18n, theme, auth, nonce, feature flags). Use props for component-specific data.

---

## Tag Composition

### `.when()` — Conditional Modifier

Conditionally apply modifications to a tag. Supports boolean conditions and nullable value narrowing.

```typescript
Button("Save")
  .when(isLoading, t => t.toggle("disabled").opacity("50"))
  .when(isPrimary, t => t.background("blue-500").textColor("white"))

// Nullable narrowing
Div("Profile")
  .when(user.avatar, (t, avatar) => t.children(Img().setSrc(avatar)))
```

### `.apply()` — Reusable Modifiers

Apply one or more modifier functions. Enables composable, reusable styling.

```typescript
const card = (t: Tag) => t.padding("6").background("white").rounded("lg").shadow("md");
const danger = (t: Tag) => t.borderColor("red-500").textColor("red-700");

Div("Alert").apply(card)
Div("Error").apply(card, danger)
```

### Transform Algebras

Rewrite View trees structurally using fold.

```typescript
// Replace all <div> with <section>
const divToSection = createTransformAlgebra((el, attrs) => {
  if (el === "div") return { element: "section", attrs };
  return null;
});
const transformed = foldView(divToSection, myPage);

// Add class to all paragraphs
const highlightP = addClassToMatching((el) => el === "p", "prose");
const highlighted = foldView(highlightP, myPage);
```

---

## Summary

| Pattern | Category | Purpose |
|---------|----------|---------|
| `foldView` | Catamorphism | Collapse tree to value |
| `paraView` | Paramorphism | Fold with original subtree access |
| `unfoldView` | Anamorphism | Grow tree from seed |
| `hyloView` | Hylomorphism | Fused unfold + fold (no intermediate tree) |
| `IfThen` / `IfThenElse` | Control flow | Conditional rendering with nullable narrowing |
| `Match` | Control flow | Exhaustive pattern matching with union narrowing |
| `ForEach` / `Repeat` | Control flow | Iteration over items, counts, or ranges |
| `createContext` | Context | Scoped implicit values (i18n, theme, auth) |
| `.when()` | Composition | Conditional tag modification |
| `.apply()` | Composition | Reusable modifier functions |
| `createTransformAlgebra` | Tree rewriting | Structural View transformation |
| `addClassToMatching` | Tree rewriting | Add classes by predicate |
