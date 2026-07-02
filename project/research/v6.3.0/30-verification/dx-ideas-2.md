# Verification: dx-ideas-2 — FormBinding label()/id wiring

**Finding:** FormBinding never sets control ids and has no `label()` — label wiring is manual triple-repetition.

## Gap check: CONFIRMED

- `FormBinding<T>` (src/elements/forms.ts:381-395) exposes `input/textarea/select/checkbox/radio/hidden/error` — no `label`.
- `createFormBinding` (forms.ts:400-453): every factory calls `setName(name)` only; none calls `setId`. Verified in `input` (413), `textarea` (422), `select` (431), `checkbox` (434), `radio` (441), `hidden` (444).
- `Label(...).setFor(...)` exists (forms.ts:312, LabelTag) but takes a raw `string | Id` — nothing ties it to `keyof T`, and since bound controls have no id, `setFor` has nothing to point at anyway.
- Searched src for any existing bridge (`label(`, `setFor` overloads, a `formFor` helper): none exists. `setFor` appears only on LabelTag (312) and OutputTag (567).
- The library's own example (examples/htmx.ts:27-33, 35-42) repeats each field name **three times** (`Label("Name").setFor("name")` + `.setId("name")` + `.setName("name")`) — exactly the stringly repetition the typed binding was built to eliminate.
- Internal consistency point: the binding *already* does id-based wiring for errors — `fieldErrorId(name)` = `${name}-error` with `aria-describedby` (forms.ts:397-407, 450). Labels are the one accessibility link left entirely manual, so the omission is an inconsistency within the same abstraction, not a deliberate boundary.

## Value density

Benefits every `Form<T>` call site with a visible control — which is nearly all of them (only `hidden` needs no label). Today a caller who wants an accessible label must abandon the typed binding for string literals, i.e. the feature undermines its own value prop at the most common touchpoint; the path of least resistance is silently skipping `setFor`, an invisible a11y regression. Implementation is small: one interface method returning `Label(...children).setFor(name)`, plus `setId(name)` in the factories (radio: `${name}-${value}`).

Costs / caveats (kept the score off 9-10):
- **Test churn**: form-for.test.ts asserts exact HTML (`<input type="checkbox" name="notify">` etc.); every assertion changes when ids appear by default.
- **Duplicate-id risk**: two forms on one page sharing a field name (e.g. `email` in login + newsletter) now collide on `id="email"`. Callers can override via `setId`, but the default makes the collision easy; worth a docs note or an optional id-prefix on `Form<T>`.
- **Radio wrinkle**: proposal's `label(name)` sets `for={name}`, but radio ids are `${name}-${value}` — `label` needs a radio-aware overload (`label(name, value, ...children)`) or the radio case stays manual/wrapped.
- Evidence base in-repo is tests + one example (the binding is new, B-01/F-C-140); breadth is inferred from "every form needs labels" rather than counted call sites.

## Score: 8/10

High-frequency pain (every labeled field in every typed form), zero existing workaround inside the abstraction, small implementation, and it completes an id-wiring convention the binding already started with `${name}-error`. Docked for default-id collision semantics and the radio `for` mismatch, which need a design decision before this is purely mechanical.
