# fluent-html: Full-Stack Developer Review

> Perspective: Full-stack TypeScript developer (Fastify + Prisma + HTMX) evaluating fluent-html as an SSR templating solution.
>
> Version: 5.10.0 | Date: 2026-04-13

---

## Ratings

| Dimension | Score | Summary |
|-----------|-------|---------|
| **Type Safety** | 9.5/10 | Best-in-class for an HTML builder. Branded IDs, discriminated unions, route param inference, exhaustive `Match`. Minor gaps in fold attrs and form field names. |
| **API Design** | 9.5/10 | Fluent chaining is genuinely discoverable. One way to do each thing. Void elements reject children. `.on()` / `.at()` / `.when()` read like prose. |
| **Advanced Patterns** | 9/10 | Recursion schemes, context system with `using`, hylomorphisms, streaming render — unusually sophisticated for a templating lib. |
| **Developer Experience** | 9/10 | Autocomplete covers 100+ Tailwind methods, all HTML attributes, HTMX options. Error messages from branded types and strict unions are clear. |
| **Performance** | 8.5/10 | No virtual DOM, direct string concatenation, streaming render, discriminant-based type checks. Benchmark suite exists. No lazy evaluation of subtrees yet. |
| **Security** | 9.5/10 | Auto-escaping by default, `Raw()` explicit opt-in, event handler blocking, attribute key validation, prototype pollution guards, CSP nonce support. |
| **Full-Stack Integration** | 8/10 | Route type safety is excellent. Prisma-to-view type flow has a documented gap. Form field names are untyped. The `handle()` helper closes most route/handler gaps. |
| **Composability** | 9.5/10 | `apply()` for modifier stacking, `when()` for conditional chaining, `createContext` for cross-cutting concerns, plain functions as components. Zero abstraction overhead. |
| **Learning Curve** | 8.5/10 | Intuitive for anyone who knows Tailwind + HTML. Advanced features (fold algebras, recursion schemes) require FP familiarity but are entirely optional. |
| **Ecosystem & Distribution** | 8/10 | ESM-only, zero deps, subpath exports, dedicated Tailwind extractor. No VS Code extension for go-to-definition on fluent methods. No official starter template. |

**Overall: 8.9/10** — A serious, production-grade SSR library that treats TypeScript as a first-class design tool rather than an afterthought.

---

## 1. Type Safety — 9.5/10

### What it gets right

**Branded types prevent ID spoofing.** The `Id` type carries a `unique symbol` brand, so `{ id: "x", selector: "#x" }` won't pass where an `Id` is expected. IDs defined via `defineIds` are the only way to produce valid targets for HTMX swaps. This eliminates an entire class of "target not found" runtime bugs.

**Route param inference from path strings.** `defineRoutes` uses template literal types to extract `:param` segments and require them as arguments:

```typescript
const routes = defineRoutes("/users", {
  detail: { method: "get", path: "/:id" },
} as const);

routes.detail({ id: "123" });  // id required — inferred from "/:id"
routes.detail();               // compile error
```

A runtime guard (`assertNoUnresolvedParams`) catches any param placeholder that survives substitution — belt and suspenders.

**Discriminated union `Match` with automatic narrowing.** The most impressive type-level feature. Pass a discriminant key and get exhaustive, narrowed branches:

```typescript
Match(state, "status", {
  loading: ()  => Spinner(),
  error:   (s) => Alert(s.message),   // s: { status: "error"; message: string }
  success: (s) => UserList(s.data),   // s: { status: "success"; data: User[] }
})
```

Forget a case and TypeScript errors. The implementation uses `Extract<T, Record<K, V>>` — clean and correct.

**`IfThen` narrows nullable values.** The callback receives the non-null type, eliminating the need for `!` assertions or redundant null checks in the template:

```typescript
IfThen(user.avatar, (avatar) => Img().setSrc(avatar))  // avatar: string
```

**Strict HxSwap — no escape hatch.** The `HxSwap` type enumerates all valid swap strategies including modifier combinations (`outerHTML scroll:window:top`). Invalid combos are compile errors. `HxTrigger` and `HxTarget` intentionally keep `(string & {})` because custom events and CSS selectors are open-ended — a pragmatic design choice.

**String literal unions on every setter.** `InputType`, `FormMethod`, `BrowsingContext`, `AutocompleteHint`, `LinkRel`, `ReferrerPolicy` — all are closed unions (or escape-hatch unions where appropriate). `setType("emial")` is a compile error.

**Zero `as any` in the render pipeline.** Type guards (`isTag`, `isRawString`) use discriminant checks instead of `instanceof`. Schema key access uses `readonly _sk?: readonly string[]`. The render path is fully typed.

### Where the gaps are

**Prisma query-view type flow is manual.** The recommended pattern (co-locate query shape with view via `satisfies`) works but isn't enforced. A view expecting `include: { posts: true }` compiles fine even when the handler omits it — `posts` is optional in the base Prisma type. This is the most common source of runtime errors in the stack.

**Form field names are untyped.** `.setName("nmae")` compiles without error. A `TypedInput<CreateUserBody>("email")` helper pattern exists conceptually but isn't built in.

**Fold algebra attrs are `unknown`.** When using `foldView`, element-specific attributes (like `src` on `img`) require casting. An element-aware algebra could narrow attrs per tag name.

---

## 2. Advanced Patterns — 9/10

### Recursion schemes — a genuine differentiator

Most templating libraries stop at "render a tree." fluent-html provides the full algebra toolkit:

| Scheme | What it does | Use case |
|--------|-------------|----------|
| **Catamorphism** (`foldView`) | Collapse a tree bottom-up | Count elements, extract text, collect links |
| **Paramorphism** (`paraView`) | Like fold, but sees the original node too | Wrap links in tooltips using their href |
| **Anamorphism** (`unfoldView`) | Build a tree from a seed | Generate TOC from heading list, nav from flat routes |
| **Hylomorphism** (`hyloView`) | Fused unfold+fold, no intermediate tree | Stream large tables directly to HTML |

The hylomorphism is particularly interesting for SSR — it converts flat data to HTML in a single pass without allocating the `View` tree. Pre-built algebras (`countAlgebra`, `textAlgebra`, `linksAlgebra`, `ariaDescribeAlgebra`) demonstrate practical use.

These are 100% optional. A developer who never touches `fold/` loses nothing. But for anyone building accessibility tools, HTML-to-markdown converters, or streaming renderers, the algebra is there.

### Context system with `using`

The `createContext` / `createRequiredContext` API uses TC39 Explicit Resource Management for automatic scope cleanup:

```typescript
const AuthCtx = createRequiredContext<User>("AuthCtx");

function App(user: User) {
  using _ = AuthCtx.scope(user);
  return Div(Header(), Content());  // all descendants see user
}
```

Stack-based scoping means nested overrides work correctly. `createRequiredContext` throws a descriptive error if accessed outside a scope — no silent `undefined`. This replaces `AsyncLocalStorage` for synchronous SSR, which is the right call for a string-concatenation renderer.

### Behavior system — discriminated map pattern

The `BehaviorMap` type maps behavior names to their required payloads:

```typescript
Button("Copy").behavior("clipboard", { value: apiKey })  // requires { value }
Button("Toggle").behavior("toggle", { target: ids.panel }) // requires { target: Id }
Button("Submit").behavior("disable")                       // void — no payload
```

This is the best type safety pattern in the codebase. It's essentially a typed command dispatch without runtime overhead — the behavior compiles to an inline `hx-on:click` attribute. No client-side framework required.

### Conditional composition

`.when()` and `.apply()` enable modifier stacking without breaking the chain:

```typescript
const card = (t: Tag) => t.padding("6").background("white").rounded("lg").shadow("md");
const danger = (t: Tag) => t.borderColor("red-500").textColor("red-700");

Div("Alert")
  .apply(card)
  .when(isError, danger)
  .when(isLoading, t => t.opacity("50").cursor("wait"))
```

`when()` with a nullable value narrows the second argument — `when(user.role, (t, role) => ...)` gives `role: string`.

---

## 3. Tailwind Type System — 9/10

### Strategy by use case

The library uses three different typing strategies for Tailwind values, each chosen for a reason:

| Strategy | Where used | Why |
|----------|-----------|-----|
| **Strict union** | Layout, typography, display, position | Finite set of valid values |
| **Union + `(string & {})`** | Colors, animations, font families | Custom theme tokens are common |
| **Union + `` `[${string}]` ``** | Font size, opacity, z-index | Arbitrary CSS values need bracket syntax awareness |

`Stringified<T extends number>` allows both `2` and `"2"` for numeric scales — pragmatic for template expressions where values might come as strings.

### Directional overloads

```typescript
padding("4")                // p-4
padding("x", "4")           // px-4
padding("px", 180)          // p-[180px]
margin("y", "auto")         // my-auto
```

The overloads guide discovery: type `padding(` and see all valid calling patterns. Unit-based overloads (`px`, `rem`, `em`, `%`, `vh`, `vw`, `dvh`, `svh`, `lvh`) cover arbitrary values without `addClass`.

### Pseudo-class and responsive design

```typescript
Button("Save")
  .on("hover", t => t.background("blue-600").scale("105"))
  .on("focus", t => t.ring("2").outline("none"))
  .on("disabled", t => t.opacity("50"))
  .at("md", t => t.padding("x", "8"))
```

The callback pattern for `.on()` and `.at()` is superior to string-based Tailwind classes: the modifier scope is lexical, not positional. You can't accidentally apply a hover style to the wrong property.

### What's missing

No `group-hover` / `peer-checked` compound modifiers via the fluent API (must use `addClass`). Dark mode is supported but the `prefers-color-scheme` vs `class`-based strategy isn't toggleable per-component.

---

## 4. Full-Stack Integration — 8/10

### The type chain

```
defineRoutes (path params inferred)
    → handle(server, route) (Fastify binds params/body types)
    → prisma.query({ include }) (manual — gap here)
    → ViewFunction(data) (plain typed function)
    → render(view) (auto-escaped string)
    → reply.renderView(html) (SSR response)
```

### What works well

**`handle()` binds routes to handlers type-safely.** The route definition carries its method and path, so Fastify receives the correct types. Combined with JSON Schema validation (`as const` on type values), request bodies and query params are typed at the handler level.

**`defineIds` + HTMX targeting is bulletproof.** An ID defined in `feature.routes.ts` is used in both the view (as an element ID) and the HTMX trigger (as a target selector). The branded `Id` type ensures they can't diverge.

**`renderView` on the reply object** keeps the SSR contract clean — no JSON escape hatches. Validation errors render forms with error states. Redirects use `reply.redirect`. The server is purely an HTML server.

### Where it breaks down

**Prisma `include` / `select` mismatches are the #1 runtime bug source.** The recommended co-location pattern works:

```typescript
const userDetailQuery = { include: { posts: true } } as const satisfies ...;
type UserDetailData = Prisma.UserGetPayload<{ include: typeof userDetailQuery }>;
```

But nothing enforces it. A linting rule or helper function that ties query shape to view function would close this gap.

**Route params are always `string`.** `:id` in a path comes through as `string` even when the database expects a number or UUID. Parsing/validation is manual in every handler.

---

## 5. Security — 9.5/10

### Defense in depth

| Layer | Mechanism |
|-------|-----------|
| **Text content** | Auto-escaped via `escapeHtml()` — all strings rendered safely by default |
| **Raw HTML** | Explicit `Raw()` opt-in — impossible to accidentally render unescaped content |
| **Attribute values** | Escaped in render pipeline — no injection via attribute context |
| **Attribute keys** | Validated against `/^[a-zA-Z][a-zA-Z0-9\-:]*$/` — blocks breakout attacks |
| **Event handlers** | Blocked — `onclick`, `onerror`, etc. are rejected; use HTMX `hx-on:*` via behaviors |
| **Prototype pollution** | `__proto__`, `constructor`, `prototype` keys rejected in attribute map |
| **Script/style injection** | `</script>` and `</style>` sequences sanitized inside their respective tags |
| **CSP nonce** | `renderWithNonce()` injects nonce into all script/style elements |

The security model is "safe by default, unsafe by explicit choice." `Raw()` is the only way to bypass escaping, and it's syntactically loud. The behavior system channels all client-side interactivity through a typed, auditable code path — no arbitrary inline JS.

---

## 6. Performance — 8.5/10

### Architecture advantages

- **No virtual DOM** — direct string concatenation, O(n) in tree size
- **Discriminant-based type checks** — `_t === 1` instead of `instanceof`, no prototype chain walk
- **Pre-allocated attribute arrays** — `_sk` on element subclasses avoids `Object.keys` in render
- **Streaming render** — `renderToStream()` yields chunks at tag boundaries for early flushing
- **Hylomorphism** — unfold+fold in one pass, no intermediate tree allocation

### Benchmark results (from bench suite)

The library includes benchmarks for flat pages, deep trees, heavy escaping, HTMX attributes, and realistic pages. String concatenation is the ceiling — there's no framework overhead to optimize away.

### What could improve

- **No lazy subtree evaluation** — `ForEach` eagerly evaluates all children. For very large lists (10K+ items), a lazy/chunked mode could reduce peak memory.
- **No incremental render** — changing one component re-renders the entire tree. Not a problem for SSR (each request is a fresh render), but limits potential for partial caching.

---

## 7. Composability — 9.5/10

### Components are plain functions

No base class, no decorator, no registration. A component is a function that takes a typed props object and returns `View`:

```typescript
function UserCard(props: { user: User; showActions: boolean }): View {
  return Div(
    H3(props.user.name),
    IfThen(props.showActions, () => ActionButtons({ userId: props.user.id }))
  );
}
```

This means:
- Components compose with standard function calls
- TypeScript infers prop types with zero ceremony
- Testing is trivial — call the function, fold the result
- No lifecycle, no hooks, no state management to learn

### Modifier functions as first-class composition

```typescript
const elevated = (t: Tag) => t.shadow("lg").rounded("xl").background("white");
const interactive = (t: Tag) => t.cursor("pointer").transition("all")
  .on("hover", t => t.shadow("2xl").scale("102"));

Div("Card").apply(elevated, interactive)
```

Modifiers compose, are reusable, and carry no runtime cost. This is the functional equivalent of Tailwind's `@apply` — but type-checked and composable.

### Context vs props — clear guidance

The library makes a clear architectural choice: `createContext` for cross-cutting concerns (auth, theme, i18n, nonce), props for component-specific data. No `AsyncLocalStorage` misuse. No global mutable state. The `using` keyword ensures scope cleanup is automatic.

---

## 8. Developer Experience — 9/10

### IDE experience

- **100+ Tailwind methods** with full autocomplete — type `.p` and see `padding`, `paddingX`, `position`, etc.
- **Overload hints** — each method shows its calling patterns in the tooltip
- **Literal union completions** — type `setType("` and see all valid input types
- **Go-to-definition** lands on the actual method, not a `.d.ts` proxy
- **Error messages** from branded types are clear: "Type '{ id: string; selector: string }' is not assignable to type 'Id'"

### Control flow reads like prose

```typescript
ForEach(users, (user) =>
  Tr(
    Td(user.name),
    Td(user.email),
    Td(
      IfThenElse(user.isActive,
        () => Badge({ label: "Active", color: "green" }),
        () => Badge({ label: "Inactive", color: "gray" }),
      )
    ),
  )
)
```

No JSX. No template strings. No special syntax. Just TypeScript.

### What could improve

- **No VS Code extension** for jumping from a fluent method call to the Tailwind class it generates (e.g., `.padding("4")` → show `p-4` in hover)
- **No official starter template** with Fastify + Prisma + HTMX pre-wired
- **Fold algebra learning curve** — the `ViewAlgebra` / `ParaAlgebra` / `ViewCoalgebra` types require FP background to understand, and the JSDoc explanations could be more beginner-friendly

---

## 9. Comparison With Alternatives

| Dimension | fluent-html | JSX (React SSR) | Template literals | Pug/EJS |
|-----------|-------------|-----------------|-------------------|---------|
| Type safety | Branded IDs, literal unions, route inference | Props typed, but HTML attrs are `string` | None | None |
| Tailwind DX | 100+ typed methods with autocomplete | Class strings, no validation | Class strings | Class strings |
| HTMX integration | First-class: typed routes, swap modes, behaviors | Manual attributes | Manual attributes | Manual attributes |
| Composability | Functions + `apply` + `when` + context | Components + hooks + context | String concatenation | Mixins/includes |
| Performance | Direct string concat, streaming | Full React runtime, hydration | Direct string concat | Template compilation |
| Learning curve | Low (HTML + Tailwind knowledge transfers) | Medium (React concepts) | Very low | Low |
| Ecosystem | Small (dedicated extractor, ESLint plugin) | Massive | N/A | Medium |

---

## 10. Verdict

fluent-html is what happens when you take TypeScript's type system seriously in a templating context. It's not just "HTML with types" — it's a design where **the wrong thing is hard to express**. Branded IDs, exhaustive `Match`, route param inference, and strict swap types work together to catch bugs at compile time that other SSR solutions only surface in production.

The advanced patterns (recursion schemes, hylomorphisms, context with `using`) signal a library that's thinking about long-term architectural needs, not just the happy path. The behavior system is a particularly elegant solution to the "how do I add client-side interactivity without a JS framework" problem.

The main gaps are at the seams: Prisma query shapes don't enforce their contract with views, form field names are untyped strings, and fold algebras lose element-specific type information. These are documented and have clear paths forward.

For a full-stack TypeScript developer building SSR apps with HTMX, this is the best option available. The type safety isn't decorative — it prevents real bugs. The fluent API isn't gimmicky — it's genuinely faster to write and easier to read than the alternatives. The advanced patterns aren't academic — they solve real problems (streaming, accessibility auditing, tree transformation) with clean abstractions.

**Recommended for:** Teams building server-rendered TypeScript apps who want compile-time safety across the full route-to-HTML pipeline.

**Not recommended for:** Projects that need React ecosystem compatibility, client-side hydration, or developers who prefer template-file-based approaches (Pug, EJS, Handlebars).
