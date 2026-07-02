---
id: RFC-B-01
track: B
title: "Form system — FormField / FieldError / FieldHint, FormErrors 422-binding, input-variant theme, multipart + resetOnSuccess behavior"
resolves: [F-B-001, F-B-002, F-B-003, F-B-114, F-B-005, F-B-092, F-B-123]
api_surface:
  - "FormField()"
  - "FieldError()"
  - "FieldHint()"
  - "FormErrors()"
  - "createInputTheme()"
  - "InputThemeCtx"
  - "formFor<T>().field()"
  - "Tag.prototype.behavior('resetOnSuccess')"
  - "FormTag.prototype.multipart()"
  - "InputTag.prototype.setCapture()"
breaking: additive
guardrails_checked: [zero-deps, ssr-only, escape-by-default, type-safety, backward-compat]
guideline_updates: ["web-development/CLAUDE.md", "web-development/fluent-html.md", "web-development/htmx.md"]
impact: high
effort: L
depends_on: []
status: proposed
---

# RFC-B-01: Form system — FormField / FieldError / FormErrors / input variants

## Problem

The form primitive is the single most-reimplemented thing in the fleet. Every app rebuilds the same triad — a label+input wrapper, a styled-input apply-fn, and an inline error — with diverging signatures, then hand-wires HTMX 422 re-render and form-reset via raw JS strings.

- **`FormGroup` reimplemented in 8 apps**, structurally identical, diverging only in brand tokens — `rideshare/src/shared/components/form.view.ts:4-13`, `mngmt/src/settings/settings.view.ts:36-73`, `storysell-ai/src/shared/components/ui.form.components.ts:14-51`, `planet-positive-sport/src/shared/components/forms/form.ts:21-66`, `vabilo30/src/auth/auth.view.ts:19-53`, `jtdigital-landing-page/src/contact/contact.view.ts:46-73` (F-B-001).
- **`FieldError` re-derived per view** — defined *twice in one feature* with mismatched margins: `rideshare/src/rides/views/create.view.ts:117-119` (`margin("t","1.5")`) vs `rideshare/src/shared/components/phone-input.view.ts:31-32` (`margin("t","1")`), with a code comment admitting the duplication. Five `IfThen(errors?.field, msg => FieldError(msg))` invocations in one file (`create.view.ts:218,271,278,289,324`) (F-B-002).
- **`inputStyle` apply-fn is the de-facto input theme**, hand-written in 4 apps, identical chain, brand-color-only diffs — `glimm/.../ui.form.components.ts:26-33`, `storysell-ai/.../ui.form.components.ts:26-33`, `rideshare/.../form.view.ts:16-18`, `planet-positive-sport/.../forms/form.ts:46-55` (F-B-114).
- **`placeholder:` forces `addClass`** — `storysell-ai/src/shared/components/brand/ui.brand.forms.ts:26` (`.addClass("placeholder:text-slate-400")`), and once in `addClass` devs dump adjacent `focus:` styles there too (`storysell-ai/src/product/views/product.list.view.ts:157`) (F-B-005).
- **Form-reset-on-success is raw inline JS** — `rideshare/src/settings/settings.view.ts:260,337` (`addAttribute("hx-on:htmx:after:swap", \`if(!document.getElementById('${ids.passwordError.id}'))this.reset()\`)`) and `planet-positive-sport/.../pre-approved-emails.list.view.ts:107` (`addAttribute("hx-on:htmx:after:request", "if (event.detail.ctx.response?.status < 300) this.reset()")`), each carrying a multi-line comment explaining the htmx-4 event-detail shape — 6+ sites (F-B-003, F-B-092).
- **File-upload forms need dual encoding attrs** — `setEnctype("multipart/form-data")` *and* `encoding: "multipart/form-data"` in `setHtmx`, repeated at 7 sites across 4 apps, sometimes via raw `addAttribute("hx-encoding", …)` (`planet-positive-sport/.../contributors-card.view.ts:330-331`); `capture` only reachable via `addAttribute` (`glimm/src/protect/views/protect.components.ts:59`) (F-B-123).

The guideline already *shows* a `FormField` snippet (`web-development/views.md:136-148`) — but it's example code to copy, not a built-in. That gap is exactly where the boilerplate lives.

## Proposed API

Five additive pieces, all zero-dep, all SSR-synchronous, all composing with the existing `formFor<T>()`, `.behavior()`, `.on()`, and `setHtmx` surfaces.

```ts
// ── 1. Input-variant theme (resolves F-B-114, F-B-005) ─────────────────────
// A configurable token set, entered once per app via context. Replaces the
// per-app `inputStyle` apply-fn. Tokens are existing Tailwind scale values,
// so the class-string contract (guardrail #7) is unchanged — no new classes.
export type InputThemeTokens = {
  width?:           TailwindWidth;          // default "full"
  paddingX?:        TailwindSpacing;        // default "4"
  paddingY?:        TailwindSpacing;        // default "3"
  border?:          TailwindBorderWidth;    // default "1"
  borderColor:      TailwindColor;
  focusBorderColor: TailwindColor;
  focusRing?:       TailwindRingWidth;      // omit → no ring
  focusRingColor?:  TailwindColor;
  radius?:          TailwindRounded;        // default "lg"
  background?:      TailwindColor;
  placeholderColor?: TailwindColor;         // emits .on("placeholder", …) — no addClass
  invalidBorderColor?: TailwindColor;       // applied when a field error is present
};

export type InputTheme = <T extends Tag>(tag: T) => T;          // an apply-fn

/** Build an apply-fn from tokens. Pure, allocation-free per call after build. */
export function createInputTheme(tokens: InputThemeTokens): InputTheme;

/** Context the built-ins read. Default theme = neutral gray, never throws. */
export const InputThemeCtx: Context<InputTheme>;               // createContext(defaultTheme)

// ── 2. FieldError / FieldHint atoms (resolves F-B-002) ─────────────────────
export type FieldErrorProps  = { id?: Id; children: string };
export type FieldHintProps   = { id?: Id; children: string };

/** Small inline error text. `id` wires aria-describedby from FormField. */
export function FieldError(message: string, options?: { id?: Id }): Tag;
export function FieldHint(message: string,  options?: { id?: Id }): Tag;

// ── 3. FormField — label + input + hint/error stack (resolves F-B-001) ─────
export type FormFieldProps = {
  name:      string;                         // typed via formFor<T>().field — see below
  label?:    string;
  type?:     InputType;                      // default "text"
  required?: boolean;
  value?:    string;
  hint?:     string;
  error?:    string;                         // when set: renders FieldError + invalid style
  placeholder?: string;
  /** Override the rendered control entirely (textarea, select, custom). */
  input?:    (base: InputTag) => Tag;        // base is theme-styled + name/type/value wired
  /** Override the input theme for this field only. */
  theme?:    InputTheme;
};
export function FormField(props: FormFieldProps): Tag;

// formFor<T>() gains a typed field factory so `name` is checked against the schema.
// (Additive method on the existing factory return type.)
export function formFor<T extends Record<string, unknown>>(): {
  input<K extends keyof T & string>(name: K, type?: InputType): InputTag;       // unchanged
  textarea<K extends keyof T & string>(name: K): TextareaTag;                   // unchanged
  select<K extends keyof T & string>(name: K, ...children: View[]): SelectTag;  // unchanged
  hidden<K extends keyof T & string>(name: K, value: string): InputTag;         // unchanged
  field<K extends keyof T & string>(                                            // NEW
    props: Omit<FormFieldProps, "name"> & { name: K },
  ): Tag;
};

// ── 4. FormErrors — bind a validation-error bag to a form (F-B-002) ─────────
// A controller passes `errors` (whatever keys failed). FormErrors makes those
// errors visible to every nested FormField/FieldError via context, so views
// stop threading `errors?.field` through props and IfThen at each call site.
export type ErrorBag<T = Record<string, string>> = Partial<Record<keyof T & string, string>>;

/** Wrap a Form (or its children) to publish field errors to descendants. */
export function FormErrors<T>(errors: ErrorBag<T> | undefined, ...children: View[]): View;
export const FormErrorsCtx: Context<ErrorBag>;   // FormField reads its own name out of this

// ── 5. Behavior + fluent setters (resolves F-B-003, F-B-092, F-B-123) ──────
declare module "fluent-html" {
  interface BehaviorMap {
    // Reset the form after a successful (HTTP < 300) submit, preserving 422 input.
    // Emits the correct htmx-4 `hx-on:htmx:after:request` guard expression.
    resetOnSuccess: { selfOnly?: boolean } | void;
  }
  interface FormTag {
    /** setEnctype("multipart/form-data") + flags setHtmx to emit hx-encoding. */
    multipart(): this;
  }
  interface InputTag {
    /** Typed `capture` attribute for file inputs (mobile camera). */
    setCapture(value: "user" | "environment"): this;
  }
}
```

`resetOnSuccess` renderer (library-owned JS, mirrors the verified app expression in F-B-092):

```ts
resetOnSuccess: (opts) => [
  "htmx:after:request",
  opts.selfOnly
    ? "if(event.target===this&&event.detail.ctx.response?.status<300)this.reset()"
    : "if(event.detail.ctx.response?.status<300)this.reset()",
],
```

## Worked examples (before → after)

### A. The FormGroup/StyledInput/FieldError triad → `FormField`

```ts
// before — rideshare/src/shared/components/form.view.ts:4-18 + create.view.ts:117-119,218
export function FormGroup(label: string, input: View, required = false) {
  return Div(
    Label(label + (required ? " *" : ""))
      .textSize("sm").fontWeight("medium").textColor("body").margin("b","1").display("block"),
    input,
  ).margin("b","4");
}
export const styledInputStyle = <T extends Tag>(t: T): T => t
  .w("full").padding("x","4").padding("y","3").border("2").borderColor("site-border")
  .rounded("lg").transition("colors").on("focus", t => t.borderColor("leaf").outline("none")) as T;
function FieldError(message: string) {
  return P(message).textSize("xs").textColor("red-600").margin("t","1.5");
}
// call site (create.view.ts):
FormGroup("Departure city",
  formFor<CreateRideReq>().input("departureCity","text").apply(styledInputStyle), true),
IfThen(errors?.departureCity, (msg) => FieldError(msg)),
```

```ts
// after — zero local helpers. Theme configured once at app root (see ex. C).
const f = formFor<CreateRideReq>();
f.field({ name: "departureCity", label: "Departure city", required: true,
          error: errors?.departureCity }),
```

`FormField` renders the label (with `*` when `required`), the theme-styled input (wired `name`/`type`/`value`), and — when `error` is set — the invalid border + `FieldError` with `aria-describedby` linked automatically. Deletes the local `FormGroup`, `styledInputStyle`, *and* `FieldError`, plus the per-field `IfThen`.

### B. 422 error binding → `FormErrors`, no per-field threading

```ts
// before — pps threads errors?.field manually + the [&>input]: arbitrary-selector hack
// planet-positive-sport/src/shared/components/forms/form.ts:39
.when(!!error, t => t.addClass("[&>input]:border-red-300 [&>textarea]:border-red-300 …"))
```

```ts
// after — controller passes the bag once; fields read their own error from context.
// view:
FormErrors(errors,                              // ErrorBag<CreateRideReq> | undefined
  Form(
    f.field({ name: "departureCity", label: "Departure city", required: true }),
    f.field({ name: "seats",         label: "Seats", type: "number" }),
    Button("Post ride").setType("submit"),
  ).setHtmx(rideRoutes.create({
    target: ids.mainContent, swap: "outerMorph scroll:top",
    status: { 422: { target: ids.mainContent, swap: "outerMorph" } },
  })),
)
// each f.field auto-renders its invalid style + FieldError when errors[name] is set.
```

### C. Input theme configured once → no per-app `inputStyle`

```ts
// before — 4 apps each define this, identical but for colors (F-B-114):
export const inputStyle = (t: InputTag) => t.w("full").padding("x","4").padding("y","3")
  .border("2").borderColor("site-border").rounded("lg")
  .transition("colors").on("focus", tt => tt.borderColor("leaf").outline("none"));
```

```ts
// after — one token set, entered at the layout root; FormField/raw Input both pick it up.
const rideshareInputTheme = createInputTheme({
  border: "2", borderColor: "site-border", focusBorderColor: "leaf",
  invalidBorderColor: "red-300", placeholderColor: "slate-400",
});
function Layout(...children: View[]) {
  using _ = InputThemeCtx.scope(rideshareInputTheme);   // synchronous scope, no ALS
  return Html(/* … */);
}
```

### D. File upload — `.multipart()` instead of dual attrs (F-B-123)

```ts
// before — rideshare/src/settings/settings.view.ts:137-143
Form(/* … */)
  .setEnctype("multipart/form-data")
  .setHtmx(settingsRoutes.uploadAvatar({
    target: layoutIds.page, swap: "outerMorph scroll:top",
    encoding: "multipart/form-data",
  })),
```

```ts
// after — one call expresses the requirement; setHtmx infers hx-encoding.
Form(
  Input().setType("file").setName("avatar").setCapture("environment"),
)
  .multipart()
  .setHtmx(settingsRoutes.uploadAvatar({ target: layoutIds.page, swap: "outerMorph scroll:top" })),
```

### E. Form reset after success → `.behavior("resetOnSuccess")` (F-B-003, F-B-092)

```ts
// before — rideshare/src/settings/settings.view.ts:260 (raw JS, fragile id template)
.addAttribute("hx-on:htmx:after:swap",
  `if(!document.getElementById('${ids.passwordError.id}'))this.reset()`),
// pps variant — addAttribute("hx-on:htmx:after:request", "if (event.detail.ctx.response?.status < 300) this.reset()")
```

```ts
// after — status-guarded, library-owned, no raw JS, no id template
Form(/* … */)
  .setHtmx(settingsRoutes.changePassword({ target: layoutIds.page, swap: "outerMorph scroll:top" }))
  .behavior("resetOnSuccess"),            // or .behavior("resetOnSuccess", { selfOnly: true })
```

## Type-safety story

- **`formFor<T>().field({ name })`** — `name` is `keyof T & string`. `f.field({ name: "nmae" })` is a compile error, identical to the existing `f.input` guarantee. This is the discoverability fix: the typed path is the *short* path, so apps stop reaching for untyped `FormField({ name: "…" })`.
- **`FormErrors<T>(errors)`** takes `ErrorBag<T> = Partial<Record<keyof T & string, string>>` — the error bag is keyed to the same schema, so a stray `errors.deparrtureCity` is a type error, not a silent miss.
- **`InputThemeTokens`** fields are the existing literal-union scale types (`TailwindColor`, `TailwindSpacing`, …) — no bare `string`; a typo like `borderColor: "site-bordr"` fails to compile against the project's generated palette.
- **`setCapture(value: "user" | "environment")`** — literal union, not `string`; rejects `setCapture("front")`.
- **`behavior("resetOnSuccess")`** — `selfOnly?: boolean` via the existing `BehaviorMap` declaration-merge; the renderer owns the htmx-4 detail-shape string so apps never re-type `event.detail.ctx.response?.status`.
- **`multipart()`** returns `this` (`FormTag`), chainable before/after `setHtmx`; the encoding flag is read at serialize time so call order doesn't matter.

## Migration & compatibility

**Additive — nothing breaks.** Every symbol is net-new (`FormField`, `FieldError`, `FieldHint`, `FormErrors`, `createInputTheme`, `InputThemeCtx`, `FormErrorsCtx`, `.field()`, `behavior("resetOnSuccess")`, `multipart()`, `setCapture()`). `formFor<T>()` keeps all four existing methods unchanged; `.field()` is added alongside them. Existing `FormGroup`/`inputStyle`/`FieldError` helpers in apps keep working — apps delete them at their own pace.

**Codemod (optional, app-side):** a jscodeshift transform can rewrite `FormGroup(label, formFor<T>().input(name,type).apply(inputStyle), required)` + the trailing `IfThen(errors?.name, …)` into a single `formFor<T>().field({ name, label, type, required, error: errors?.name })`. Mechanical for the canonical shape; flagged-for-review where the input override is non-trivial.

**`breaking-changes.md` note:** none — additive. (The placeholder pseudo-element `.on("placeholder", …)` already exists in v5.11 `TailwindState`; this RFC only stops apps from needing `addClass` for it by routing it through `createInputTheme`. That's an adoption fix, not a surface change.)

## Guidelines impact

New public surface across forms, styling, and htmx → patches to the index plus three topic refs.

### Index — `web-development/CLAUDE.md`

Replace the current one-line `formFor<T>()` bullet (line 91) with a fuller form-system block:

```md
**`formFor<T>()` + `.field()`** — type-safe fields; `.field()` renders the full label+input+error stack. Never hand-roll a `FormGroup`/`StyledInput`/`FieldError` triad. See [fluent-html.md § Type-Safe Forms](fluent-html.md#type-safe-forms--formfort).
```typescript
const f = formFor<CreateUserReq>();
f.field({ name: "email", label: "Email", type: "email", required: true, error: errors?.email }) // ✓ label+input+error
f.input("email", "email")                                                                       // ✓ bare control when you need one
function FormGroup(label, input) { … }                                                          // ✗ never — use f.field()
P(msg).textColor("red-600")                                                                     // ✗ never — use FieldError / the error prop
```

**Input theme** — configure once via context; never a per-app `inputStyle` apply-fn:
```typescript
using _ = InputThemeCtx.scope(createInputTheme({ borderColor: "gray-200", focusBorderColor: "brand-500" })); // ✓ at layout root
const inputStyle = (t: InputTag) => t.w("full").border()…                                                    // ✗ never — use createInputTheme
```

**Validation errors** — bind the bag once with `FormErrors`; fields read their own error:
```typescript
FormErrors(errors, Form(f.field({ name: "email", label: "Email" }), …))  // ✓ no per-field IfThen
IfThen(errors?.email, msg => FieldError(msg))                            // ✗ FormField wires this for you
```

**File uploads** — one `.multipart()`, never the dual enctype/encoding pair:
```typescript
Form(Input().setType("file").setName("avatar").setCapture("environment")).multipart().setHtmx(route(...)) // ✓
.setEnctype("multipart/form-data").setHtmx(route({ encoding: "multipart/form-data" }))                     // ✗ redundant pair
```
```

Also extend the existing `.behavior()` list (CLAUDE.md line 201-208 and the htmx mirror) to include `resetOnSuccess`:
```md
Button("Submit").behavior("disable")
Form(...).behavior("resetOnSuccess")        // ✓ resets on HTTP<300, keeps 422 input — never hx-on:htmx:after:request JS
```

### Topic ref — `web-development/fluent-html.md` (extend § Type-Safe Forms, after line 87)

```md
### `f.field()` — full field stack

`.field()` renders label + theme-styled input + inline error/hint in one call. `name` is schema-checked exactly like `.input()`:

```typescript
const f = formFor<CreateUserReq>();
f.field({ name: "email", label: "Email", type: "email", required: true, error: errors?.email })
f.field({ name: "bio",   label: "Bio",   hint: "Optional", input: base => base.replaceWith(Textarea().apply(/*…*/)) })
```

- `error` set → invalid border (from the input theme's `invalidBorderColor`) + `FieldError` with `aria-describedby` wired.
- `input?: (base) => Tag` overrides the control (textarea, select, custom) while keeping name/value/theme.
- Bare atoms exist for custom layouts: `FieldError(msg)`, `FieldHint(msg)`.

### Input theme — `createInputTheme` + `InputThemeCtx`

One token set per app, entered at the layout root; `f.field()` and bare `Input()` both resolve it. Replaces the per-app `inputStyle` apply-fn:

```typescript
const theme = createInputTheme({
  border: "2", borderColor: "gray-200", focusBorderColor: "brand-500",
  focusRing: "1", focusRingColor: "brand-500/20", placeholderColor: "slate-400",
  invalidBorderColor: "red-300",
});
function Layout(...children: View[]) {
  using _ = InputThemeCtx.scope(theme);   // synchronous — never AsyncLocalStorage
  return Html(/* … */);
}
```

`placeholderColor` emits `.on("placeholder", …)` — there is **no** reason to `addClass("placeholder:…")` (the `placeholder` state is already a valid `.on()` target).

### Validation — `FormErrors`

```typescript
// controller passes ErrorBag<CreateUserReq>; view binds it once:
FormErrors(errors,
  Form(
    f.field({ name: "email", label: "Email" }),
    f.field({ name: "name",  label: "Name"  }),
  ).setHtmx(userRoutes.create({ target: ids.mainContent, swap: "outerMorph",
                                status: { 422: { target: ids.mainContent, swap: "outerMorph" } } })),
)
```

`ErrorBag<T>` is `Partial<Record<keyof T & string, string>>` — keys are schema-checked.
```

### Topic ref — `web-development/htmx.md` (extend § Status-code routing, after line 136)

```md
## Form reset after success

`outerMorph` preserves dirty input across the swap, so a `value=""` does not visually clear. Reset on success (HTTP < 300) while keeping 422 input — use the behavior, never raw `hx-on`:

```typescript
Form(/* fields */)
  .setHtmx(userRoutes.create({ target: ids.mainContent, swap: "outerMorph",
                               status: { 422: { target: ids.mainContent, swap: "outerMorph" } } }))
  .behavior("resetOnSuccess")                 // ✓ status-guarded, htmx-4 detail shape owned by the lib
  .behavior("resetOnSuccess", { selfOnly: true })  // ✓ when child requests share the form

// ✗ never:
.addAttribute("hx-on:htmx:after:request", "if (event.detail.ctx.response?.status < 300) this.reset()")
```

## File uploads — `.multipart()`

htmx 4 ignores the form's native `enctype` on AJAX submit; you must also send `hx-encoding`. `.multipart()` does both — set `enctype` *and* flag `setHtmx` to emit `hx-encoding`. One call, either order:

```typescript
Form(Input().setType("file").setName("avatar").setCapture("environment"))
  .multipart()
  .setHtmx(settingsRoutes.uploadAvatar({ target: ids.mainContent, swap: "outerMorph" }))  // ✓

.setEnctype("multipart/form-data").setHtmx(route({ encoding: "multipart/form-data" }))    // ✗ redundant pair
.addAttribute("hx-encoding", "multipart/form-data")                                       // ✗ raw attribute
```
```

**Adoption note:** the old `views.md:136-148` taught `FormField` as a *copy-this snippet*, and `fluent-html.md` taught `.on()` covers pseudo-classes without listing `placeholder`/`selection`/`marker`/`file` (all already valid). Apps therefore (a) re-implemented `FormField` per project and (b) fell back to `addClass("placeholder:…")`. The fix is to ship `FormField`/`f.field()` as real built-ins and make `createInputTheme.placeholderColor` the sanctioned path, so the guideline points at library surface, not example code.

## Guardrail check

- **§11.1 zero-deps:** PASS — pure TS, no new runtime deps; renderers are string templates.
- **§11.2 ssr-only / sync fast path:** PASS — `FormField`/`FormErrors` render synchronously; `InputThemeCtx`/`FormErrorsCtx` use the existing synchronous `createContext` stack (no `AsyncLocalStorage`).
- **§11.3 escape-by-default:** PASS — `FieldError`/`FieldHint`/`FormField` emit text children through the normal escaping path; no `Raw`. Behavior JS is library-owned, not user-interpolated.
- **§11.4 type-safety:** PASS — `keyof T & string` field names, `ErrorBag<T>`, literal-union theme tokens and `setCapture`, `BehaviorMap` merge; no bare `string`, no `any` in the public surface.
- **§11.5 backward-compat:** PASS — fully additive; `formFor` existing methods untouched; optional codemod for app-side cleanup.
- **§11.6 idioms:** PASS — variadic children (`FormErrors(errors, …children)`), specialized setters (`setCapture`, `multipart`), `.on()` over `addClass` (placeholder via theme), `.behavior()` over inline JS (`resetOnSuccess`), `defineRoutes`/`defineIds` in examples.
- **§11.7 class-string contract:** PASS — `createInputTheme` emits only existing Tailwind classes via existing fluent methods; no new vocabulary, so Track-C tooling needs no change.
- **§11.8 guideline-sync:** PASS — Guidelines impact covers every `api_surface` symbol: `FormField`/`FieldError`/`FieldHint`/`formFor().field()` (fluent-html.md § Type-Safe Forms), `createInputTheme`/`InputThemeCtx` (input theme block), `FormErrors` (validation block), `behavior('resetOnSuccess')` (htmx.md), `FormTag.multipart()`/`InputTag.setCapture()` (htmx.md file-uploads); index `CLAUDE.md` carries the one-line rules. `guideline_updates` lists all three patched files.

## Alternatives considered

- **Pass `errors` as a prop to every `FormField`** (no `FormErrors` context). Rejected: re-introduces the per-field threading the findings complain about; context lets a form bind the bag once. `FormField` still accepts an explicit `error?` for the rare out-of-form case.
- **`Form().withErrors(errors).validateInto(ids.form)`** chained-config form (recon §3.2 sketch). Rejected for v6.0 scope: couples error display to a specific 422-swap target, which apps wire differently (`mainContent` full-layout vs feature target). `FormErrors` (display) + the existing `status:{422}` route option (wiring) keep the two concerns orthogonal and match the house "full-layout swap is the default" rule. Revisit as sugar later.
- **A single `Input().variant("default")` token method** instead of `createInputTheme` + context. Rejected: a named-variant enum can't carry per-app brand colors without the library knowing the palette; the apply-fn-via-context approach lets apps configure tokens once and keeps zero new classes.
- **A bare `FieldError`/`FieldHint` only, no `FormField`.** Rejected: the dominant pain is the *whole stack* (8 apps reimplement `FormGroup`), not just the error atom. We ship both granularities.
- **`resetOnSuccess` via `after:swap` + error-element check** (rideshare's variant). Rejected in favor of the status-guard (`after:request`, HTTP<300) — it doesn't depend on a specific error element id and matches the more robust pps pattern; `selfOnly` covers the child-request edge case.

## Open questions

1. **Default `InputThemeCtx` value** — ship a neutral gray default (works with no setup) or require a scope (forces apps to configure)? Leaning neutral default for zero-config DX; apps override at the root.
2. **`FormField` label position / layout** — fixed vertical stack (label-over-input) only, or a `layout?: "stacked" | "inline"` token? Findings only show stacked; defer `inline` until a real instance appears.
3. **`FormErrors` + nested forms** — context is a stack, so an inner `FormErrors` shadows an outer correctly, but should a `FormField` outside any `FormErrors` silently render no error (current design) or warn in dev? Leaning silent (matches `createContext` default semantics).
4. **Codemod ownership** — ship the jscodeshift transform in this repo's `scripts/` or leave app-side? Recommend shipping it so the 8 apps migrate uniformly.
