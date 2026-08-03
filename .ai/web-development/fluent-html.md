# fluent-html

Type-safe, zero-dependency HTML builder for TypeScript. Text content is **auto XSS-escaped**.

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
Input().setType("email").setPlaceholder("you@example.com").setName("email")  // InputTag (generic) — for one-off elements without a schema — else prefer Form<T>()
Input("number").setMin(0).setMax(100).setStep(5)                               // NumericInputTag (type-safe min/max)
Input("date").setMin("2024-01-01")                                              // DateTimeInputTag (string min/max)
Textarea().setPlaceholder("Message").setName("msg").setRows(5)         // TextareaTag — for one-off elements without a schema — else prefer Form<T>()
Select(Option("A").setValue("1"), Option("B").setValue("2")).setName("x") // SelectTag — for one-off elements without a schema — else prefer Form<T>()
A("Link").setHref("/page").setTarget("_blank")                         // AnchorTag
Img().setSrc("/img.jpg").setAlt("Photo").setLoading("lazy")            // ImgTag
Form(/* children */).setAction("/submit").setMethod("post")            // FormTag
```

**Universal methods** on all tags:

```typescript
Div()
  .setId("my-id")
  .cssClass("js-hook")             // append a legit NON-Tailwind class (intent marker; 6.8+)
  .cssProp("mask-repeat", "no-repeat") // arbitrary CSS → [mask-repeat:no-repeat] (6.8+; literal args only)
  .setStyle("color: red")          // string — replaces the style attribute
  .setStyles({ color: "red" })     // object — replaces (camelCase → kebab-case)
  .setDataAttrs({ userId: "123" }) // ✓ data-user-id="123" (auto kebab-case)
  .setAria({ label: "Close", expanded: false })    // ✓ values typed per-key: expanded/checked → boolean, live → "polite"|…
  .addAttribute("role", "dialog")  // escape hatch — ONLY when no typed setter exists
```

✗ never style through raw class strings — `setClass`/`addClass` with Tailwind is lint-blocked at error level (`no-tailwind-in-raw-class` autofixes to the fluent chain); `addClass` is the `@internal` emitter primitive, and `.cssClass()` is the only sanctioned way to attach a non-Tailwind class.

✗ never reach for `addAttribute` when a typed setter exists:

```typescript
.addAttribute("data-user-id", "123")          // ✗ → .setDataAttrs({ userId: "123" })
.addAttribute("aria-label", "Close")          // ✗ → .setAria({ label: "Close" })
.addAttribute("style", `width: ${pct}%`)      // ✗ → .setStyle(...) (addAttribute double-renders style)
.addAttribute("data-a", x).addAttribute("data-b", y)  // ✗ → .setDataAttrs({ a: x, b: y }) (batch)
```

- `setDataAttrs` / `setAria` batch multiple attrs in one call, auto-convert camelCase → kebab.
- `setAria` values are token-typed per key — enumerable states (`current`/`live`/`sort`/`haspopup`/`autocomplete`/`orientation`/`invalid`) take their literal unions (`setAria({ live: "polit" })` is a compile error); tristate states accept `boolean | "mixed"`.
- `setStyle`/`setStyles` both **replace** (set* = override; to compose, pass the full object once) — never `addAttribute("style", …)`.
- `addAttribute` is enforced by the `prefer-set-method` ESLint rule — `eslint --fix` rewrites the ✗ forms.

**Inline styles are the escape hatch, not a styling channel.** `setStyle`/`setStyles` are only for CSS the fluent API cannot express: interpolated runtime values, gradients with custom stops, `rgba()`/`color-mix()` overlays, `clamp()`/`calc()`/`var()`/`url()`, `backdrop-filter`, `aspect-ratio`. Static CSS with a fluent equivalent belongs in fluent calls; plain hex colors belong in theme tokens:

```typescript
Div().setStyle("width:44px;height:44px")   // ✗ → .w("px", 44).h("px", 44)
Div().setStyle("font-size:1.9rem")         // ✗ → .text("2xl") — the named scale, not an off-scale value
Div().setStyle("color:#FDB813")            // ✗ → .text(token) — promote the hex to a theme token
Div().setStyle(`width: ${progress}%`)      // ✓ runtime value — no static class can express it
Div().setStyle("background:linear-gradient(120deg,#1a4e86,#0a2340)")  // ✓ no fluent equivalent
```

**Before reaching for `setStyle`, three cheaper moves — all extractor-safe:**
- **Arbitrary `[…]` on the typed method** — the bracket overload isn't spacing-only; colors, grid, z-index, border, etc. all take it, and a *literal* `[…]` is scanned into the safelist. Reach for this before an inline style for any off-scale **static** value:
  ```typescript
  Div().gridCols("[repeat(auto-fill,minmax(258px,1fr))]")   // not setStyle("grid-template-columns:…")
  Div().border("left", "[#1a2b3c]")                          // not setStyle("border-left-color:#1a2b3c")
  Div().text("[clamp(1.9rem,3.6vw,2.6rem)]")                 // not setStyle("font-size:clamp(…)")
  ```
- **Opacity modifier for tints** — `color-mix(in srgb, var(--color-primary) 12%, surface)` over a solid surface is visually ~identical to `.bg("primary/12")` (the `${token}/${number}` form). Prefer the modifier; keep `color-mix` only where the backdrop is an image/gradient and the alpha would show through.
- **Promote recurring hexes to `defineTheme` tokens**, then `.text(token)` — the most common miss; a hex repeated across files is a token, not an inline style.

**Split bundled strings.** One `setStyle` often mixes a legit escape-hatch declaration with a violation — `setStyle("aspect-ratio:16/9;background:#000")` is flagged only on `background:#000`. Move the flagged declaration to a fluent/token call and keep **only** the genuine escape-hatch part inline; don't leave the whole string inline because one piece is unavoidable:
```typescript
Div().setStyle("aspect-ratio:16/9;background:#000")   // ✗ background:#000 has a token
Div().setStyle("aspect-ratio:16/9").bg("inverse")        // ✓ split — inline keeps only what has no fluent form
```

Enforced by the `no-fluent-equivalent-in-setstyle` ESLint rule (added in the plugin's **v1.8.0**). The rule is opt-in per project, so "enforced" is not automatic: confirm it's set to `error` in the project's `eslint.config.mjs` **and** that the `eslint-plugin-fluent-html` pin is ≥ v1.8.0. A project scaffolded before the rule landed carries neither, so nothing flags these calls and they accumulate silently into the hundreds — bump the pin and enable the rule, then `eslint --fix` + manual conversion to clear the backlog. Exception: email views (`src/infra/email/`) — email clients require inline CSS, so the rule is disabled there via an eslint override and `setStyles` is the correct tool.

**Global editing / structured-data setters** on any element (never `addAttribute`): `setEnterkeyhint`, `setContenteditable`/`setSpellcheck`/`setAutocapitalize`, `setLang`/`setDir`/`setTranslate`, `setHidden("until-found")` (Ctrl-F-revealable), `setMicrodata({ type, prop, id })` (schema.org SEO; `type` also sets `itemscope`), `setForm(id)` (associate a control with a `<form>` elsewhere by id). `setList`/`setFor` accept an `Id`.

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

## Type-Safe Forms — `Form<T>()`

`Form<T>()` constrains field names to keys of a schema type — typos are compile errors. Pass a callback receiving field builder `f`, returning a `View[]` (the form's children):

```typescript
type CreateUserReq = { email: string; name: string; role: "admin" | "viewer" };

Form<CreateUserReq>((f) => [
  f.input("email", "email"),        // ✓ typed name + input type
  f.input("name", "text"),          // ✓
  f.input("nmae", "text"),          // ✗ compile error — not a key of CreateUserReq
  f.textarea("name"),               // ✓ typed textarea
  f.select("role", [                // ✓ typed select — descriptor array
    { value: "admin",  label: "Admin" },
    { value: "viewer", label: "Viewer" },
  ]),
  f.hidden("role", "admin"),        // ✓ typed hidden input with value
  f.error("email"),                 // ✓ renders the bound field's error (no-op when absent)
  Button("Submit").setType("submit"),
])
```

Fields return standard `InputTag`/`TextareaTag`/`SelectTag` — full chaining: `f.input("email", "email").setPlaceholder("you@example.com").toggle("required")`

**Checkbox/radio** — use `f.checkbox(name, value?)` / `f.radio(name, value)`, never `f.input(name, "checkbox")`:
```typescript
f.checkbox("notify")              // ✓ checked = Boolean(state.values.notify)
f.radio("plan", "pro")            // ✓ checked when state.values.plan === "pro" (shared name group)
f.input("notify", "checkbox")     // ✗ silently emits value="true", never `checked`
```

**Prefill + errors** — pass a state object first (`Form<T>(state, (f) => …)`); `f` reads defaults from `state.values` and surfaces `state.errors` via `f.error(name)`:
```typescript
Form<CreateUserReq>({ values: user, errors }, (f) => [
  f.input("email", "email"),
  f.error("email"),                 // ✓ shows errors.email when present
  Button("Save").setType("submit"),
])
```

When `state.errors[name]` is set, the bound control auto-gets `aria-invalid="true"` + `aria-describedby="<name>-error"`, and `f.error(name)` renders its span with the matching `id` — input and message wired as one unit for assistive tech and the `aria-invalid:`/`invalid:` Tailwind variant. No extra code.

Untyped `.setName()` still works for one-off elements outside a schema.

**Form-control completeness setters** (never `addAttribute` for these): `setAccept([…])` (file inputs — array overload joins with `,`; autocomplete only, `accept` is open by spec); `setDirname("${name}.dir")` on Input/Textarea (bidi submit companion — pass a field name, not a direction); `setAutocomplete(…)` on Input/Textarea/**Select** (full WHATWG token set + `shipping`/`billing` prefix + `webauthn` suffix — IDE autocomplete + hover docs, **not** typo-rejection: the open tail means typos still compile); `setFormtarget`/`setFormenctype` on Button (per-submit-button overrides — `FormEnctype` is **closed**, the one typo-rejecting union); `Output().setFor(...ids)` (space-separated id-set, variadic + Id-typed). Exported unions: `AutofillField`/`AddressField`/`AddressPurpose` (DX) and `FormEnctype` (closed).

**Where `T` comes from:** the request type your controller validates. Schema exists ⇒ never bare `.setName()`:
```typescript
import type { SignInReq } from "../core/server/types.js";
Form<SignInReq>((f) => [
  f.input("emial", "email"),                 // ✗ compile error — not a key of SignInReq
  Input().setType("email").setName("email"), // ✗ bypasses the schema — a rename fails only at runtime (422)
])
```

## Modifiers & Composition

```typescript
// .when() — conditionally apply modifications
Button("Save")
  .when(isLoading, t => t.toggle("disabled").opacity("50"))
  .when(isPrimary, t => t.bg("primary").text("on-accent"))

// .whenElse() — one Tag, two mutually-exclusive branches (never `cond ? TagA : TagB`)
Badge(label)
  .whenElse(active,
    t => t.bg("success/10").text("success"),
    t => t.bg("surface-2").text("text-faint"))

// .whenMatch() — one modifier per variant of a string/number discriminant (v6.5+)
Span(status).whenMatch(status, {        // status: "active" | "pending" | "closed" — missing a case = compile error
  active:  t => t.bg("success/10").text("success"),
  pending: t => t.bg("warning/10").text("warning"),
  closed:  t => t.bg("surface-2").text("text-dim"),
})
Button(l).whenMatch(tone, { danger: t => t.bg("danger") }, t => t.bg("surface-3"))  // subset needs a default fn

// .apply() — compose reusable modifier functions (accepts multiple)
const card = (t: Tag) => t.p("6").bg("surface").rounded("card").shadow("md");
const hoverLift = (t: Tag) => t.transition().hover({ shadow: "lg" });
Div("Content").apply(card, hoverLift)
```

Use `.whenElse()` — not a ternary that swaps the whole `Tag`, and **not a `.when(x)` + `.when(!x)` pair** (the styling twin of the `IfThen(x)`/`IfThen(!x)` footgun: two evals that drift, and `!x` collapses a nullable to boolean) — when branches differ only by interpolated classes. One `.whenElse` keeps one element identity so morphs/focus survive, and both class sets stay statically visible to the extractor.

Use `.whenMatch()` — **not a chained `.when(x === "a", …).when(x === "b", …)`** on one discriminant (the styling twin of the chained-`IfThen` footgun below: non-exhaustive, so a new union member compiles silently and renders unstyled, and the value is re-tested per branch). The exhaustive form makes a missing case a compile error; keep each branch's fluent calls literal (`t.maxW("lg")`, not `t.maxW(key)`) so the extractor sees the classes. It completes the family: `IfThen → when`, `IfThenElse → whenElse`, `Match → whenMatch` (view-level analogue below in [Control Flow](#control-flow)).

```typescript
Span(s).when(s === "active", t => t.bg("success/10"))
       .when(s === "closed", t => t.bg("surface-2"))                                            // ✗ chained .when on a discriminant
Span(s).whenMatch(s, { active: t => t.bg("success/10"), closed: t => t.bg("surface-2") })  // ✓ exhaustive, one eval
```

Even when variant names coincide with tokens (`width: "lg" | "2xl"`), don't reach for `.maxW(width)` — a variable argument is invisible to the extractor, and the general discriminant maps each variant to several properties anyway.

`.when()`/`.whenElse()` run on **`!= null`** (like `IfThen`), so a present-but-falsy value (`0`, `""`) takes the run branch. Modifier fns may return anything (a base-`Tag` style-fn like `card` composes onto `Button`/`Input`/`A` subclasses too).

**Append children** — `.addChild(...views)` is the structural counterpart to `.apply`/`.when` (which only touch classes/attrs):
```typescript
Button("Save").when(isLoading, t => t.addChild(Spinner()))   // ✓ conditionally append a child
Ul().addChild(ForEach(users, (u) => Li(u.name)))            // ✓ append a list after construction (ForEach, not .map)
```

**Negative spacing** — `.neg()` (never `addClass("-mt-2")`):
```typescript
Div().neg("mt-2")           // → -mt-2   (closed TailwindSpacing — typo is a compile error)
Div().neg("[-0.5rem]")      // → -[0.5rem]   (arbitrary escape hatch for off-scale values)
Div().addClass("-mt-2")     // ✗ untyped raw string
```

## Fluent Tailwind Styling

> Fluent methods (not `setClass`) for type safety + IDE autocomplete. Variants are typed style objects — tier-1 states/breakpoints are direct methods (`.hover({…})`, `.md({…})`), everything else via `.variant(name, {…})`. All methods strictly typed — check the library's TypeScript definitions for the full API.

**Variant objects: keys are the canonical style names** — spell-checked two levels deep, `undefined`/`false` skipped, tier-1 names nest to stack prefixes. `.variant()` accepts any state prefix or breakpoint — relational, named-group, arbitrary:
```typescript
parent.group()                                              // ✓ mark the hover/focus scope
child.groupHover({ opacity: "100" })                        // ✓ responds to the parent (tier-1)
child.addClass("group-hover:opacity-100")                   // ✗ untyped escape hatch
Input().peer(); Label().peerChecked({ text: "primary" })    // ✓ peer state (tier-1)
.variant("group-hover/info", {…}) .variant("[&:has(input:checked)]", {…})  // ✓ named group + arbitrary
.variant("aria-checked", {…}) .variant("data-[open]", {…}) .variant("nth-3", {…}) .variant("*", { p: "2" })  // ✓ aria/data/nth/child are typed
.sm({ gridCols: "2" }).variant("@lg", { gridCols: "4" })    // ✓ responsive (tier-1 sm md lg xl xl2) + container (@3xs…@7xl closed)
.md({ hover: { bg: "primary-700" } })                       // ✓ nesting stacks → md:hover:bg-primary-700
.addClass("sm:grid-cols-2")                                 // ✗ raw breakpoint string
```

Key method categories — method name = Tailwind class prefix; merged prefixes discriminate by argument: spacing (`p`/`m` + directional `px`/`py`/`pt`/`pb`/`pl`/`pr`, `mx`/`my`/`mt`/`mb`/`ml`/`mr`, `gap`, `insetX`/`insetY`/`insetS`/`insetE`), colors (`bg`, `text`, `border`, `shadow`, SVG paint `fill`/`stroke`, `accent`/`caret`, `decoration` (color/style/thickness), `scheme`), typography (`text` (size/align/wrap), `font` (weight/family), `lineClamp`, `hyphens`, `textShadow`), layout (`flex` (+direction/wrap), `grid`, `w`, `h`, grid placement `colStart`/`colEnd`/`rowStart`/`rowEnd`/`rowSpan`, `columns`, fragmentation `breakInside`/`breakBefore`/`breakAfter`/`boxDecoration`, scroll `snap`/`snapAlign`/`snapStop`/`scroll`/`scrollM`/`scrollP`, `fieldSizing`), effects (`shadow`, `opacity`, `blur`, `brightness`, `dropShadow`, `insetShadow`/`insetRing`, `mixBlend`/`bgBlend`, `isolate`), gradients (`gradient`, `bgLinear`, `bgRadial`, `bgConic`, `from`/`via`/`to`), masks (`mask` (image/composite), `maskFrom`/`maskTo`, `maskType`), container queries (`containerQuery()` + `.variant("@sm", {…})`), group/peer (`group()`, `peer()`), transforms (2D `scale`/`rotate`/`translate`/`skewX`/`skewY` + 3D `rotateX`/`rotateY`/`rotateZ`, `scaleX`/`scaleY`/`scaleZ`/`scale3d`, `perspective`/`perspectiveOrigin`, `translate("z", …)`, `transform("3d")`/`backface`), transitions (`transition` (+`"discrete"`), `duration`, `delay`, `ease`).

**v4 semantics** (don't silently get v3 looks): bare `.ring()` = 1px + `currentColor`; bare `.border()` = `currentColor` (add `.border(...)`); `Button()` has no default cursor (add `.cursor("pointer")`); prefer `.flex().gap()` over `space-*`; `.outline("hidden")` over `.outline("none")`. Scales gained an `xs` slot (`shadow-sm` is now medium-ish).

**Arbitrary values** — unit overloads for sizing/spacing/position **and the scalar type/spacing methods** (`text`/`leading`/`tracking`/`underlineOffset`), so the raw `[…]` string is the last resort (`prefer-unit-overload` autofixes it):
```typescript
Div().w("px", 180)          // → w-[180px]
Div().leading("rem", 1.15)  // → leading-[1.15rem]   (not .leading("[1.15rem]"))
```

Type is the exception: `text` has the same overload, but off-scale sizes are how a codebase acquires dozens of near-identical ones. Stay on the named scale, and promote a genuinely missing size (a sub-12px `micro`, say) to a `fontSize` token instead of spelling it at the call site.

**TW4 platform hooks** — `:has()` relational state and View Transitions, typed (no raw strings):
```typescript
Card().variant("has-[:checked]", { ring: "2" })  // ✓ has-/group-has-/peer-has-/in-[…] are typed .variant() states
Img().viewTransitionName(ids.hero)               // ✓ [view-transition-name:…] — hero morphs across an outerMorph swap when HtmxConfig({ transitions: true })
Img().addAttribute("style", "view-transition-name: hero")  // ✗ untyped inline style, not purge-safe
```

**Gradients (v4 `bg-linear-*`)** — fluent chain, never raw string:
```typescript
Div().gradient("primary", "primary-700", "to-r")                              // ✓ shorthand → bg-linear-to-r from-… to-…
Div().bgLinear("to-r", "oklch").from("primary", "10%").to("primary-700", "90%")  // ✓ interpolation + positioned stops
Div().bgLinear(45)  // bg-linear-45 (angle)   ·   Div().bgRadial("top-left")  // bg-radial-[at_top_left]
Div().bgConic(180)  // bg-conic-180   ·   negative angles relocate the sign (-65 → -bg-linear-65)
Div().addClass("bg-gradient-to-r from-blue-500 to-cyan-500")               // ✗ raw string (v3 name) — breaks TW scan
```

### Theming — `defineTheme()`

Define design tokens **once** → typed autocomplete on fluent methods + v4 `@theme` CSS + extractor safelist. Tokens only (`colors`/`spacing`/`fontSize`/`radius`/`shadow`); component presets stay user-land `.apply()` helpers.

**Name a token for the role it plays, never as a numeric ramp.** A ramp (`ink-100` … `ink-900`) fixes the count and the ordering of your surfaces before you know either, and the number stops predicting anything the moment a brand changes. Roles stay true: `surface-2` and `line` move independently, `ink-200` and `ink-300` cannot. Two jobs means two tokens, even when they share a hex today — a divider and a skeleton fill diverge the first time anyone touches one.

```ts
// theme.ts — the one place tokens live
import { defineTheme, type ThemeKeys, type ThemeSpec } from "fluent-html";

const tokens = {
  colors: {
    primary: "#2563eb", "primary-700": "#1d4ed8", "on-accent": "#ffffff",  // brand: the block a project edits
    bg: "…", surface: "…", "surface-2": "…", "surface-3": "…",             // ground · cards · insets · skeletons
    text: "…", "text-dim": "…", "text-faint": "…",                         // three roles, not six shades
    line: "…", "line-strong": "…",                                         // dividers vs control edges
    success: "…", danger: "…", warning: "…", info: "…",                    // one hue per meaning
  },
  radius: { card: "0.75rem", control: "0.5rem" },
} as const satisfies ThemeSpec;

export const theme = defineTheme(tokens);

// One line per family — written once, derives from `tokens` (add tokens freely).
declare module "fluent-html" {
  interface FluentCustomColors extends ThemeKeys<typeof tokens, "colors"> {}
  interface FluentCustomRadius extends ThemeKeys<typeof tokens, "radius"> {}
}
```
```ts
Div().bg("surface").border("line")        // ✓ your tokens, autocompleted + typo-checked
Span(msg).bg("danger/10").text("danger")  // ✓ tint = opacity modifier on the role token
Div().bg("surfcae")                            // ✗ compile error (closed unions — `(string & {})` is gone)
Div().bg("gray-100")                           // ✗ palette literal — survives no rebrand
```

**Tints come from the opacity modifier, not from tokens.** `bg("success/10")` renders through the same token, so a rebrand carries every tint with it. A `success-100` sibling is a second value to keep in sync and near-doubles the color count for nothing.

**A dark surface is a second prefixed family, added when a design needs one.** `defineTheme` has no light/dark mode and tokens are single-value, so the second surface is `night-bg` / `night-surface` / `night-text` … beside the light set, plus a lightened accent (a hue that clears AA on white usually fails it on near-black). Purely additive — adding it later touches no existing call site, so don't guess the values up front.

**Keep the scales closed.** Radius is `card` (cards, sheets, modals, panels) and `control` (buttons, inputs, badges, chips); `rounded("full")` stays literal, because a pill is a shape decision and not a brand one. Type stays on the named scale — `text("sm")`, never `text("rem", 0.82)`, which is how a codebase ends up with dozens of near-identical sizes and no scale at all.

### Tailwind v4 build wiring

Fluent methods append class strings at render time — **invisible to v4's auto content detection**. Wire the extractor as a plugin (or generate a safelist file).

Wiring is deliberately dumb: a prebuild step writes the safelist to a **real `.css` file** that your CSS `@import`s (Tailwind only resolves `@import`s from disk). No bundler plugin.

```ts
// scripts/build-safelist.ts — run before the CSS build (a "prebuild" npm script)
import { writeFileSync } from "node:fs";
import { generateFluentSafelist, globFiles } from "fluent-html-tailwind-extractor";
import { theme } from "./theme";

writeFileSync("./src/fluent-safelist.css",
  generateFluentSafelist(globFiles(["./src/**/*.ts", "./public/**/*.html"]), { theme, onUnresolved: "error" }));
```
```css
/* app.css */
@import "tailwindcss";
@import "./fluent-safelist.css";   /* the generated file — add it to .gitignore */
```
```jsonc
// package.json
"scripts": { "prebuild": "tsx scripts/build-safelist.ts", "build": "postcss src/app.css -o dist/app.css" }
```

- `onUnresolved: "error"` (default) — a fluent call with a non-literal arg (`.bg(c)`) fails the build (a dropped class is an unstyled element with no other warning). Cover variable-driven tokens via `defineTheme`'s `staticManifest`.
- ✗ `content.extract: { ts: fluentHtmlExtractor }` — removed in v4. ✗ `@tailwind base/components/utilities` — use `@import "tailwindcss"`.

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

ForEach(users, (user, i) => Li(user.name))         // array — the list primitive
Div(...users.map((u) => Li(u.name)))               // ✗ spread .map — prefer-foreach autofixes → Div(ForEach(users, …))
Div(...STATS.map(StatBlock))                        // ✗ a named-component ref is the SAME violation → Div(ForEach(STATS, StatBlock))
Div(users.map((u) => Li(u.name)))                  // ✗ array child — also prefer-foreach (NOT prefer-variadic-children: it only matches a literal [a, b])
ForEach(5, i => Div(`Item ${i}`))                  // 0..n
ForEach(1, 6, i => Div(`Item ${i}`))               // range
Repeat(3, () => Br())                              // simple repeat

// MatchValue → a value for TEXT / attrs / content — never a styling class. The extractor scans
// fluent styling methods for LITERAL args, so a MatchValue result must never flow into one.
Span(MatchValue(trend, { up: "↑", down: "↓" }, "→"))                  // ✓ "↑" | "↓" | "→" — text content
Div().bg(MatchValue(tone, { ok: "success/10" }, "surface-2"))  // ✗ unresolved arg → dropped class → unstyled (build error)
// value→class on a closed union, INLINE one-off → .whenMatch() (v6.5+): exhaustive, literal calls stay extractor-visible
Div().whenMatch(tone, { ok: t => t.bg("success/10"), err: t => t.bg("danger/10") })  // ✓ missing case = compile error
// value→class map that is SHARED/exported (several call sites) → a key→Styler map applied with
// .apply(). Build it with the `stylers` helper (scaffold: shared/stylers.ts) — exhaustive via the
// explicit key union, and it preserves the tag subtype so the chain lives on.
const toneBg = stylers<Tone>({
  ok:  (t) => t.bg("success/10"),
  err: (t) => t.bg("danger/10"),
})
Div().apply(toneBg[tone])                          // ✓ typed + extractor-resolvable + exhaustive; .apply(toneBg[tone]).setType(…) still checks
const toneBg2 = { ok: <T extends Tag>(t: T) => t.bg("success/10"),
                  err: <T extends Tag>(t: T) => t.bg("danger/10") } satisfies Record<Tone, Styler>  // ✗ hand-rolled generic map — same result, needless boilerplate; use stylers()
Div().addClass(toneClasses[tone])                  // ✗ record[var] → raw string, invisible to the extractor → dropped class
// separator BETWEEN mapped Views, never after the last (the View analogue of Array.join)
Nav(Intersperse(crumbs, c => A(c.label).nav(c.route), () => Span("/").text("text-faint")))
state === "ok" ? "success" : "text-faint"          // ✗ value lookup as ternary — use MatchValue

// ✗ chained IfThen on a discriminant — non-exhaustive, no narrowing (F-A-021)
IfThen(reservation.status === "PENDING",   () => Confirm())
IfThen(reservation.status === "CONFIRMED", () => Remove())
// ✓ Match on the discriminant key — exhaustive (drop the default), each branch narrowed
Match(reservation, "status", {
  PENDING:   (r) => Confirm(),
  CONFIRMED: (r) => Remove(),
}, () => Empty())

// ✗ DU prop via boolean flag — variant fields need re-checks, new variant silently ignored (F-A-103)
const isSuccess = props.state === "success"
IfThenElse(isSuccess, () => Ok(), () => Retry())
// ✓ Match the whole prop — `s.message` typed without re-narrowing
Match(props, "state", {
  success: ()  => Ok(),
  error:   (s) => Retry(s.message),                 // s: { state:"error"; message: string }
})

// ✗ paired IfThen — evaluates the condition twice, branches can drift (F-A-025)
IfThen(items.length > 0,  () => List(items))
IfThen(items.length === 0, () => EmptyState())
// ✓ IfThenElse — one expression, one eval, always synchronized
IfThenElse(items.length > 0, () => List(items), () => EmptyState())

// ✗ !! / != null collapse the value to boolean before IfThen narrows → forces ! (F-A-105)
IfThen(!!url, () => Img().setSrc(url!))
IfThen(quote != null, () => Card(quote!))
// ✓ pass the value; the callback arg is the narrowed non-null value
IfThen(url,   (u) => Img().setSrc(u))
IfThen(quote, (q) => Card(q))

// ✗ Array.from to make a range — allocates an intermediate array (F-A-026)
ForEach(Array.from({ length: count }, (_, i) => i), (i) => Item(i))
// ✓ count overload
ForEach(count, (i) => Item(i))
```

## Scoped context

Rendering is **synchronous**, so the app's scoped context — `using` scopes from your `core/context` module, **not** a `fluent-html` import — is the escape hatch for cross-cutting render-time values (nonce, user, i18n, theme) instead of prop-drilling. **Never `AsyncLocalStorage`** (it leaks across concurrent requests; never hold a scope across an `await`). Full pattern + examples: [views.md § Scoped context](views.md#scoped-context--cross-cutting-render-time-values).

## HTMX Integration

> Full patterns: [htmx.md](htmx.md) — `defineRoutes`, `defineIds`, `setHtmx`, `Partial` swaps, `hxResponse`.

## Rendering

```typescript
render(Div("Hello"))               // <div>Hello</div>
render(Li("One"), Li("Two"))       // multiple elements, no wrapper
HTML(Head(), Body()).setLang("en") // document root
renderWithNonce(nonce, view)       // applies CSP nonce to all Script/Style tags
```

## Head Elements — typed unions

Head-element setters are typed **open unions** (autocomplete for the canonical set; custom/vendor values still compile). Prefer over `addAttribute`:

```typescript
Meta().setCharset("utf-8");                                              // Charset (canonical lowercase)
Meta().setName("viewport").setContent("width=device-width, initial-scale=1");
Meta().setName("theme-color").setContent("#0b0b0b");                     // MetaName: viewport|description|theme-color|color-scheme|robots|…
Link().setRel("preconnect").setHref("https://fonts.gstatic.com").setCrossOrigin("");  // LinkElementRel (resource hints + doc rels)
Link().setRel("preload").setHref("/inter.woff2").setAs("font").setType("font/woff2"); // LinkAs / LinkType
Script().setSrc("/app.js").setType("module");                           // ScriptType: module|importmap|…
Base().setTarget("_blank");                                             // reuses BrowsingContext
```

- `Link().setRel(...)` → `LinkElementRel` — **distinct** from the anchor-rel `LinkRel` (`A().setRel(...)`): `<link>` offers `preconnect`/`preload`/`modulepreload`/`stylesheet`/…, an anchor offers `noopener`/`nofollow`/….
- `setFetchPriority('high' | 'low' | 'auto')` (closed) on `Img`/`Link`/`Script`/`Iframe` — the Core Web Vitals priority hint; see [performance.md](../infrastructure/performance.md).
- `setCrossOrigin(CrossOrigin | '')` is uniform across `Video`/`Audio`/`Img`/`Link`/`Script`; `setReferrerPolicy(ReferrerPolicy)` (closed) across `A`/`Img`/`Link`/`Script`/`Area`/`Iframe`. `<source>` has **no** referrerpolicy (spec) — it gains `setWidth`/`setHeight` only (string | number → String; reserves the CLS box in art-directed `<picture>`).
- Responsive LCP preload: `Link().setRel("preload").setAs("image").setImagesrcset("… 480w, … 1080w").setImagesizes("100vw")` — `setImagesrcset` is distinct from `setSizes` (the icon `sizes` grammar). `Meta().setMedia(...)` for per-color-scheme `theme-color`.
- **Iframe security:** `Iframe().setSandbox("allow-scripts", "allow-same-origin")` — variadic **closed** `SandboxToken` (typo = compile error); `setSandbox()` (no args) → `sandbox=""` (fully locked). `Iframe().setAllow({ geolocation: "'self'", camera: "*" })` — Permissions-Policy **record** (`setAllow({})` → deny-all `allow=""`; `setAllow()` clears it); directive names are an open union so name typos still compile.
- **Accessible tables:** `scope` for simple/regular tables (`Th().setScope("col")`); `headers` for complex/spanning ones — `Td().setHeaders(ids.priceCol, ids.q3Row)` is **Id-typed** against `defineIds` (typo = compile error). `set*` overrides, `add*` accumulates (de-duped), empty call clears. `setAbbr` is th-only. Pass the raw id token, not a `#selector`; don't also `addAttribute("headers", …)` (double-emits). `TableCellScope` is exported for prop typing.
- All open unions take any string via the `(string & {})` tail; a typo just loses autocomplete, it doesn't error.

## Native interactivity & anchor positioning

Open/close overlays with the platform, not hand-written JS — `<button>` Commands (`.setCommand()`/`.setCommandfor()`) and the Popover API (`.setPopover()`/`.setPopovertarget()`/`.setPopovertargetaction()`). Place via the anchor-positioning class emitters:

```typescript
Tag().anchorName(id);        // [anchor-name:--<id>]      — register an anchor
Tag().positionAnchor(id);    // [position-anchor:--<id>]  — bind to a named anchor
Tag().positionArea("bottom"); // position-area-bottom     — TailwindPositionArea (+ [..] hatch)
```

`anchorName`/`positionAnchor` are `Id`-typed (reuse the popover's `Id`). Full patterns + the Commands/Popover table: [htmx.md](htmx.md) § Native interactivity.

## SVG Elements

All SVG shapes have typed attribute setters via the `SvgShapeTag` base (`setFill`, `setStroke`, `setStrokeWidth`, `setSvgOpacity`, `setTransform`):

```typescript
Svg(
  Circle().setCx("50").setCy("50").setR("40").setFill("none").setStroke("currentColor"),
  Rect().setX("10").setY("10").setWidth("80").setHeight("80").setRx("5"),
  Path().setD("M10 80 C40 10, 65 10, 95 80").setFill("none"),
  Line().setX1("0").setY1("0").setX2("100").setY2("100"),
  Text("Hello").setX("10").setY("50").setTextAnchor("start").setFontSize("16"),
  Use().setHref("#icon").setX("0").setY("0"),
)
```

> `setSvgOpacity()` avoids conflict with Tailwind's `.opacity()`.

## Edit & quotation elements

Typed `cite`/`datetime` setters — never `addAttribute` for these standard props:

```typescript
Ins("added clause").setCite("/audit/12").setDatetime("2026-06-29T10:00"); // <ins cite datetime>
Del("removed clause").setDatetime("2026-06-29");                          // <del datetime>
Q(snippet.text).setCite(snippet.sourceUrl);                               // <q cite>
Blockquote(P(article.excerpt)).setCite(article.url);                      // <blockquote cite>
```

- `Ins`/`Del` carry `setCite` + `setDatetime`; `Q`/`Blockquote` carry **only** `setCite` (no `datetime` in the spec).
- `datetime` is free-text (date / datetime-local / duration / week), matching `Time.setDatetime`.
- `cite` is a URL — HTML-escaped on render but **not** scheme-sanitized (same stance as `setHref`/`setSrc`).

## Types

```typescript
import type { View } from "fluent-html";
// View = Tag | string | RawString | View[]

// Named Tailwind types (exported for consumer use)
import type { TailwindPosition, TailwindTextAlign, TailwindFlexDirection, TailwindJustifyContent, TailwindAlignItems } from "fluent-html";
```
