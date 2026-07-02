# Track A — App APIs · Forms & Validation

Lens scope: `Form<T>` usage, error/value wiring, multipart, repeated field markup, server-side validation round-trips, flash of validation errors — mined from `planet-positive-sport` (v5) and `pm-gui` (v6 template).

## Headline observation

**Neither real app uses `Form<T>` or `f.error()`.** pps and pm-gui both hand-roll plain `Form(...)` + hand-built field wrappers (`AuthFormField`, `Field`), and pps's *entire* validation UX is a single top-level `error` string plus a `data` bag for value refill — there is no per-field error rendering anywhere in either codebase. The typed binding shipped in 6.0/6.1 is technically complete (aria wiring, checkbox/radio, select-selected) but **the apps route around it** because the field-level ergonomics it assumes (a styled label+control+error shell, value refill from the request body) are exactly the parts left to user-land. The findings below target that gap: the boilerplate that sits *just outside* `Form<T>` and is why callers don't reach for it.

---

## A01-1 · `f.field(name, { label, type, ... })` — a label+control+error shell on the binding

**Problem / evidence.** Both apps hand-roll an identical "labelled field" wrapper:
- `planet-positive-sport/src/auth/auth.components.ts:27` `AuthFormField({ label, type, name, placeholder, value, required, minLength })` → `Div(Label().setFor(name), input)`, with manual `if (value) input.setValue(value)` / `if (required) input.toggle("required")` / `if (minLength) input.setMinlength()` plumbing.
- `pm-gui/src/app/scope/scope.authoring.view.ts:51` `Field(label, control)` → `Label(Span(label), control)`.
- 92 hand-written `Label(...)`+control sites across pps (`grep "Label(" | label/setFor`), in 14 distinct component files.

The wrapper is where the `Form<T>` binding *stops*: `f.input` returns a bare control, so to get a label+error the caller drops back to plain markup and loses the typed name. Critically, none of these wrappers has an **error slot**, which is the structural reason pps never renders per-field errors (it can only show one `Alert` at the top).

**Proposed API.** Extend `FormBinding<T>` with a composite field:
```ts
type FieldOpts = { label: string; type?: InputType; placeholder?: string; required?: boolean; hint?: string };
interface FormBinding<T> {
  field(name: keyof T & string, opts: FieldOpts): Tag; // wraps label + bound control + f.error(name)
}
```
Emits `<div><label for=name>label</label><input name aria-invalid aria-describedby value=…><span id=name-error>msg</span></div>`, reusing the existing value/error auto-wiring. The styling stays user-land (the wrapper Tag is returned so callers `.apply(fieldShell)`), but the *structure + a11y wiring + refill* come from the binding. This is the single change most likely to make apps actually adopt `Form<T>`.

**Before / after.**
```ts
// before (pps register.view.ts)
AuthFormField({ label: t("auth.register.email"), type: "email", name: "email", placeholder: …, value: data?.email, required: true })
// after
Form<RegisterReq>({ values: data, errors }, f =>
  f.field("email", { label: t("auth.register.email"), type: "email", placeholder: …, required: true }))
```

**Already in lib?** No. `FormBinding` has `input/textarea/select/checkbox/radio/hidden/error` (forms.ts:353) but no composite label+control+error. Mentioned as deliberately-user-land in the `error()` comment ("the styled FieldError shell lives in @jtdigital/ui") — but the *unstyled structural* shell is what every app re-derives.

**Value:** high. **Effort:** medium.

---

## A01-2 · `f.hidden(values)` / `HiddenFields(record)` — spread hidden inputs from an object

**Problem / evidence.** `Input().setType("hidden").setName(k).setValue(v)` is written 23 times in pps and 12 in pm-gui. pm-gui already abstracted it into a private helper:
- `pm-gui/src/app/scope/scope.comments.view.ts:24` `hiddenFields(hidden: Record<string,string>): Tag[]` → `Object.entries(hidden).map(([k,v]) => Input().setType("hidden")…)`, then `...hiddenFields(ctx.hidden)` spread into three different forms.
- pps register/login/authoring forms each open with 1–3 hand-written hidden inputs (`login.view.ts:65` `returnTo`, authoring forms carry `scope`/`story`).

**Proposed API.** A bulk hidden-field factory, and an overload on the binding:
```ts
function HiddenFields(values: Record<string, string | number | boolean>): View; // Fragment of <input type=hidden>
// and on FormBinding<T>, typed:
hidden(values: Partial<Record<keyof T & string, string>>): View;
```
Emits one `<input type="hidden" name=k value=v>` per entry. The existing single-field `f.hidden(name, value)` (forms.ts:415) stays.

**Before / after.**
```ts
// before
function hiddenFields(h: Record<string,string>) { return Object.entries(h).map(([k,v]) => Input().setType("hidden").setName(k).setValue(v)); }
Form(...hiddenFields(ctx.hidden), Textarea()…)
// after
Form(HiddenFields(ctx.hidden), Textarea()…)
```

**Already in lib?** No bulk form. Single `f.hidden(name, value)` exists; the record/spread form that the apps actually re-implement does not.

**Value:** medium. **Effort:** small.

---

## A01-3 · A submit/revalidate preset for the 422 re-render round-trip

**Problem / evidence.** The server-side validation round-trip (post → on 422, re-render the same view in place with errors) is the dominant forms pattern, and its HTMX config is copy-pasted verbatim:
```ts
status: { 422: { target: layoutIds.mainContent.selector, swap: "outerMorph" } }
```
This exact block appears **30 times** in pps (`grep "status: {"`), nearly always identical (`register.view.ts:111`, `login.view.ts:75`, `reset-password.view.ts:49`, all four `settings/views/*`, etc.). pm-gui felt the same pain and hand-rolled prototype verbs to hide it: `pm-gui/src/core/htmx/swap-verbs.ts` adds `.submit(route)` = `{ target: MAIN, swap: "outerMorph", indicator: LOADER }` via the `FluentCustomMethods` seam — but notably **even pm-gui's `.submit()` drops the 422 status branch**, so its forms silently can't re-render validation errors to a 422 response.

The insight: for a validation-driven form, the success swap *and* the 422 swap almost always target the same node with the same swap. Forcing callers to spell out the `status` map (and remember `.selector` vs the `Id`) is the boilerplate.

**Proposed API.** Add a `revalidate` convenience to the HTMX options that auto-derives the 422 (and optionally 4xx) status branch from the primary `target`/`swap`:
```ts
type HxOptions = … & { revalidate?: boolean | HxStatusKey | readonly HxStatusKey[] };
// revalidate: true → status: { "4xx": { target, swap-without-scroll } }
```
When set, the resolver copies the call's `target` into a status branch for the given code(s), stripping `scroll:`/`show:` modifiers (you don't re-scroll on an error re-render). Eliminates the repeated literal and the `.selector` foot-gun.

**Before / after.**
```ts
// before (every auth form)
authRoutes.loginSubmit({ target: layoutIds.mainContent, swap: "outerMorph scroll:top",
  status: { 422: { target: layoutIds.mainContent.selector, swap: "outerMorph" } } })
// after
authRoutes.loginSubmit({ target: layoutIds.mainContent, swap: "outerMorph scroll:top", revalidate: true })
```

**Already in lib?** No. `HTMX.status` (htmx.ts:254) and `HxStatusKey` (the `Nxx`/numeric key) exist as raw primitives; there is no preset that derives the error branch from the success target. The repetition above proves the primitive alone isn't enough.

**Value:** high. **Effort:** small/medium.

---

## A01-4 · `cross` / form-level error on `Form<T>` state (cross-field + top-level errors)

**Problem / evidence.** `ErrorBag<T>` is keyed strictly by `keyof T` (forms.ts:340), so it has nowhere to put an error that isn't tied to one field. Real validation produces exactly those:
- `auth.controller.ts:192` "passwords do not match" — a cross-field error (`password` vs `passwordConfirm`).
- `auth.controller.ts:112/214` "invalid credentials" / "account exists" — form-level errors with no single owning field.

Because `ErrorBag<T>` can't hold them, pps invented a *parallel* channel: a top-level `error?: string` prop on every page, rendered as `IfThen(error, msg => Alert({message: msg}))` (register/login/reset all do this). So apps run **two** error systems — `state.errors` (unused) and an ad-hoc `error` string (used everywhere) — which is why `f.error()` is dead code in these apps.

**Proposed API.** Give the form state a form-level error and the binding a renderer:
```ts
type FormState<T> = { values?: Partial<T>; errors?: ErrorBag<T>; formError?: string };
interface FormBinding<T> { formError(): View; } // <div role="alert" aria-live="polite"> when present
```
Optionally let `errors` accept extra non-field keys via a `_form` sentinel. This unifies the two channels so the apps' top-level `Alert` becomes part of the same typed state the fields use.

**Before / after.**
```ts
// before: two systems
type Props = { error?: string; data?: {...} };  IfThen(error, m => Alert({message:m}))
// after: one
Form<LoginReq>({ values, errors, formError }, f => [f.formError(), f.field("email", …), …])
```

**Already in lib?** No. `ErrorBag<T>` is field-keyed only; there is no form-level/cross-field error slot. `f.error(name)` (the per-field span) is the only error renderer.

**Value:** high. **Effort:** small.

---

## Top picks
- **A01-1 `f.field(...)`** — the composite label+control+error shell; the missing rung that makes apps actually use `Form<T>` (both apps re-derive it; the missing error slot is *why* pps has no per-field errors).
- **A01-3 `revalidate`** — kills the 422 status block copy-pasted 30× in pps; pm-gui's own `.submit()` workaround dropped it entirely.
- **A01-4 form-level/cross-field error** — unifies the parallel `error: string` channel every page hand-rolls with the unused `state.errors`.
