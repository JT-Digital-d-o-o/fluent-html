# fluent-html

Type-safe, zero-dependency HTML builder for TypeScript. All text content is **automatically XSS-escaped**.

## Element Creation

```typescript
Div("Hello")                       // text child
Div(P("One"), P("Two"))            // variadic children — NEVER wrap in arrays
Div()                              // empty element
El("custom-tag", P("Content"))    // dynamic/custom elements
Empty()                            // renders nothing (useful for conditional responses)
Raw("<svg>...</svg>")              // trusted HTML only — bypasses XSS escaping
```

## Tag Methods

**Use typed methods** — never `addAttribute` for standard HTML props:

```typescript
Button("Save").setType("submit")                                       // ButtonTag
Input().setType("email").setPlaceholder("you@example.com").setName("email")  // InputTag (generic)
Input("number").setMin(0).setMax(100).setStep(5)                               // NumericInputTag (type-safe min/max)
Input("date").setMin("2024-01-01")                                              // DateTimeInputTag (string min/max)
Textarea().setPlaceholder("Message").setName("msg").setRows(5)         // TextareaTag
Select(Option("A").setValue("1"), Option("B").setValue("2")).setName("x") // SelectTag
A("Link").setHref("/page").setTarget("_blank")                         // AnchorTag
Img().setSrc("/img.jpg").setAlt("Photo").setLoading("lazy")            // ImgTag
Form(/* children */).setAction("/submit").setMethod("post")            // FormTag
```

**Universal methods** on all tags:

```typescript
Div()
  .setId("my-id")
  .setClass("a b")                 // replace all classes
  .addClass("c")                   // append class
  .setClasses(["a", "b", false])   // filter falsy values
  .setStyle("color: red")          // string
  .setStyles({ color: "red" })     // object (camelCase -> kebab-case)
  .addAttribute("data-x", "val")   // custom attributes only
  .setDataAttrs({ userId: "123" }) // data-user-id="123" (auto kebab-case)
  .setAria({ label: "Close" })     // aria-label="Close"
```

**Boolean attributes** — `.toggle()` only:

```typescript
Input().toggle("required")                        // always on
Input().toggle("required", isRequired)            // conditional
Option(city).toggle("selected", city === current) // expression
```

**Void elements** reject children (silently ignored at render):

```typescript
Input()   // ✓ no children
Img()     // ✓ no children
Hr()      // ✓ no children
```

## Type-Safe Forms — `formFor<T>()`

Constrains field names to keys of a schema type — typos become compile errors:

```typescript
type CreateUserReq = { email: string; name: string; role: "admin" | "viewer" };
const f = formFor<CreateUserReq>();

Form(
  f.input("email", "email"),        // ✓ typed name + input type
  f.input("name", "text"),          // ✓
  f.input("nmae", "text"),          // ✗ compile error — not a key of CreateUserReq
  f.textarea("name"),               // ✓ typed textarea
  f.select("role",                  // ✓ typed select with children
    Option("Admin").setValue("admin"),
    Option("Viewer").setValue("viewer"),
  ),
  f.hidden("role", "admin"),        // ✓ typed hidden input with value
  Button("Submit").setType("submit"),
)
```

Returns standard `InputTag`/`TextareaTag`/`SelectTag` — full chaining works: `f.input("email", "email").setPlaceholder("you@example.com").toggle("required")`

Untyped `.setName()` still works for one-off elements outside a schema.

## Modifiers & Composition

```typescript
// .when() — conditionally apply modifications
Button("Save")
  .when(isLoading, t => t.toggle("disabled").opacity("50"))
  .when(isPrimary, t => t.background("blue-500").textColor("white"))

// .apply() — compose reusable modifier functions (accepts multiple)
const card = (t: Tag) => t.padding("6").background("white").rounded("lg").shadow("md");
const hoverLift = (t: Tag) => t.transition().on("hover", t => t.shadow("lg"));
Div("Content").apply(card, hoverLift)
```

## Fluent Tailwind Styling

> Use fluent methods (not `setClass`) for type safety + IDE autocomplete. `.on()` for pseudo-classes, `.at()` for breakpoints. All methods are strictly typed — check the library's TypeScript definitions for the full API.

Key method categories: spacing (`padding`, `margin`, `gap`), colors (`background`, `textColor`, `borderColor`, `shadowColor`), typography (`textSize`, `fontWeight`, `fontFamily`, `lineClamp`), layout (`flex`, `grid`, `w`, `h`), effects (`shadow`, `opacity`, `blur`, `brightness`), gradients (`gradientTo`, `from`, `via`, `to`), group/peer (`group()`, `peer()`), transforms (`scale`, `rotate`, `translate`, `skewX`, `skewY`), transitions (`transition`, `duration`, `ease`).

**Arbitrary values** — unit overloads for sizing/spacing/position:
```typescript
Div().w("px", 180)       // → w-[180px]
Div().h("rem", 2.5)      // → h-[2.5rem]
```

## Control Flow

**`IfThen` narrows nullable values** — callback receives the non-null type. Do NOT re-check, cast, or use ternaries:

```typescript
IfThen(user.avatar, (avatar) => Img().setSrc(avatar))            // avatar: string
IfThenElse(user.name, (name) => Span(name), () => Span("Anon")) // name: string

Match(status, {
  active: () => Badge("Active"),
  error:  () => Badge("Error"),
}, () => Badge("Unknown"))                         // pattern matching + optional default

// Discriminated union Match — pass a key for automatic type narrowing
Match(state, "status", {
  loading: ()  => Spinner(),
  error:   (s) => Alert(s.message),               // s: { status: "error"; message: string }
  success: (s) => UserList(s.data),               // s: { status: "success"; data: User[] }
})

// Partial discriminated union with default
Match(state, "status", {
  error: (s) => Alert(s.message),
}, () => Spinner())

ForEach(users, (user, i) => Li(user.name))         // array
ForEach(5, i => Div(`Item ${i}`))                  // 0..n
ForEach(1, 6, i => Div(`Item ${i}`))               // range
Repeat(3, () => Br())                              // simple repeat
```

## Scoped Context

Use for cross-cutting values (theme, auth, locale, nonce) instead of prop drilling. **Never use `AsyncLocalStorage`** — `createContext` is sufficient for synchronous rendering.

```typescript
const ThemeCtx = createContext<"light" | "dark">("light");       // returns default when no scope
const AuthCtx = createRequiredContext<User>("AuthCtx");          // throws if no scope active

function handler(user: User) {
  using _t = ThemeCtx.scope("dark");
  using _a = AuthCtx.scope(user);
  return Page();
}

function Header() {
  const theme = ThemeCtx.current;  // reads innermost scope
  const user = AuthCtx.current;    // throws if called without scope
}
```

Use `createContext(default)` for values with sensible defaults. Use `createRequiredContext(name)` when a missing scope is always a bug.

## HTMX Integration

> Full patterns: [htmx.md](htmx.md) — `defineRoutes`, `defineIds`, `setHtmx`, `Partial` swaps, `hxResponse`.

## Rendering

```typescript
render(Div("Hello"))               // <div>Hello</div>
render(Li("One"), Li("Two"))       // multiple elements, no wrapper
HTML(Head(), Body()).setLang("en") // document root
renderWithNonce(nonce, view)       // applies CSP nonce to all Script/Style tags
```

## SVG Elements

All SVG shapes have typed attribute setters via `SvgShapeTag` base (`setFill`, `setStroke`, `setStrokeWidth`, `setSvgOpacity`, `setTransform`):

```typescript
Svg(
  Circle().setCx("50").setCy("50").setR("40").setFill("none").setStroke("blue"),
  Rect().setX("10").setY("10").setWidth("80").setHeight("80").setRx("5"),
  Path().setD("M10 80 C40 10, 65 10, 95 80").setFill("none"),
  Line().setX1("0").setY1("0").setX2("100").setY2("100"),
  Text("Hello").setX("10").setY("50").setTextAnchor("start").setFontSize("16"),
  Use().setHref("#icon").setX("0").setY("0"),
)
```

> `setSvgOpacity()` avoids conflict with Tailwind's `.opacity()`.

## Types

```typescript
import type { View } from "fluent-html";
// View = Tag | string | RawString | View[]

// Named Tailwind types (exported for consumer use)
import type { TailwindPosition, TailwindTextAlign, TailwindFlexDirection, TailwindJustifyContent, TailwindAlignItems } from "fluent-html";
```
