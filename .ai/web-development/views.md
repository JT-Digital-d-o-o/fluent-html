# View Guidelines

## View file segregation

**!IMPORTANT:** Always abstract and reuse components — avoid code duplication across views.

Split by page/interaction, not by component size:
- One view file per page or HTMX endpoint response
- Shared fragments (table rows, cards, status badges) → `[feature].components.ts`
- Each view file exports one main function + tightly-coupled sub-components
- Keep `ids` in `[feature].routes.ts` — views import them, never define their own

```typescript
// views/users.list.view.ts — one page, one file
export function UsersListView(props: { users: User[] }) { ... }

// views/users.form.view.ts
export function UsersFormView(props: { errors?: FormErrors }) { ... }

// views/users.components.ts — reused across list + detail
export function UserRow(props: { user: User }) { ... }
export function UserBadge(props: { status: Status }) { ... }
```

## Decomposing page functions

A page function is a **thin composition shell** — it calls sub-components, no deep nesting itself. Past ~30 lines of view code, extract a named sub-component per logical section:

```typescript
// ✗ Monolithic — hard to read, hard to test individual sections
export function DashboardPage(props: DashboardPageProps) {
  return AppLayout({
    navActions: Div(
      Button(...), IfThen(..., () => Form(...).setHtmx(...)),
    ).flex().gap("2"),
    children: Div(
      BackLink(...),
      Span(eventName).text("lg")...,
      CategoryNavbar({ ... }),
      SectionTabs({ ... }),
      Div(Span(`${count} of ${total}`), A("Edit")...).flex()...,
      FilterButtons({ ... }),
      IfThenElse(items.length > 0, () => ForEach(...), () => EmptyState(...)),
    ).maxW("7xl")...,
  });
}

// ✓ Composed — each section is named, readable, independently testable
export function DashboardPage(props: DashboardPageProps) {
  return AppLayout({
    navActions: DashboardNavActions({ ... }),
    children: DashboardContent({ ... }),
  });
}

function DashboardContent(props: DashboardContentProps) {
  return Div(
    ContentHeader({ ... }),
    Navigation({ ... }),
    ProgressBar({ ... }),
    ItemList({ ... }),
  ).maxW("7xl")...;
}
```

**Match branches** — extract any branch with more than a single component call:
```typescript
// ✗ Inline branches with logic
Match(user.role, {
  LOC: () => Div(Button(...), IfThen(ready, () => Form(...)...)).flex()...,
  COLLABORATOR: () => Div(Button(...)).flex()...,
}, () => Div(Button(...), Button(...)).flex()...)

// ✓ Named components per branch
Match(user.role, {
  LOC: () => LocNavActions({ eventId, submitReady }),
  COLLABORATOR: () => CollaboratorNavActions(),
}, () => DefaultNavActions())
```

**Shared styling** — extract repeated wrapper patterns:
```typescript
const navActionBar = (...children: Parameters<typeof Div>) =>
  Div(...children).flex().alignItems("center").gap("2");
```

## Components

Plain functions with a typed props object (never positional args):
```typescript
type StatCardProps = { label: string; value: string; hint?: string };

function StatCard({ label, value, hint }: StatCardProps) {
  return Div(
    Span(label).text("text-dim").text("sm"),
    Span(value).text("2xl").font("bold"),
    IfThen(hint, (h) => Span(h).text("text-faint").text("xs")),
  ).apply(cardChrome).p("4");
}
```

**Export the chrome, not just the component.** A shared component only survives contact with a
second project if the look is reachable without the markup. Ship the surface as an apply-fn
beside it (`cardChrome`, `primaryCta`) typed as `Styler` — `<T extends Tag>(t: T) => T`, exported
from `src/shared/stylers.ts` — and **leave spacing out of it** so a caller can set its own:
```typescript
export const cardChrome: Styler = (t) => t
  .bg("surface").rounded("card").shadow("sm").border().border("line");

Div(H2("Scope").apply(cardTitle), body).apply(cardChrome).p("5")   // ✓ same look, own markup
```

**Compose to add, never to change.** fluent appends classes, it does not replace them, so
`Card(…).apply(t => t.p("5"))` emits `p-6 … p-5` and Tailwind picks the winner by
**stylesheet order**, which the caller cannot see — overriding `p-6` with `p-5` silently loses
while `p-8` would win. So a styler is a seam only for the properties it deliberately leaves
open. Want a different padding? Compose the chrome onto your own element. Want a different
title size? Write the heading yourself; don't compose `cardTitle` and then fight it.
```typescript
Card({ title, content }).apply(t => t.p("5"))   // ✗ silently keeps p-6 — not an override
```

> **Don't hand-roll form-field components** (`Input().setName()` + manual error rendering) — bind the whole form with [`Form<T>()`](#type-safe-form-fields-with-formt) and let `f.error(name)` render errors with automatic aria wiring.

## Discriminated unions for page states

```typescript
type UsersViewProps =
  | { state: "list";   users: User[] }
  | { state: "create"; error?: string }
  | { state: "detail"; user: User };

export function UsersView(props: UsersViewProps) {
  // discriminant-key Match → each callback gets the narrowed variant `p`
  return Match(props, "state", {
    list:   (p) => UserListSection(p.users),
    create: (p) => UserFormSection(p.error),
    detail: (p) => UserDetailSection(p.user),
  });
}
```

## Per-variant values and styling: `MatchValue` and `.whenMatch()`

`Match` dispatches a discriminant to **View thunks**. Its two smaller siblings cover the non-View cases — pick by what the variant determines:

- **Text / attribute / content value** → `MatchValue(value, cases, default?)` — a plain value lookup that preserves the literal union (no widening to `string`).
- **Styling** → `.whenMatch(value, cases, defaultFn?)` (fluent-html 6.5+) — one modifier per variant, exhaustive in the two-arg form. Each branch keeps literal fluent calls, so the extractor sees every concrete class; a `MatchValue` result must never flow into a styling method (non-literal args are invisible to the extractor — see [fluent-html.md § Control Flow](fluent-html.md#control-flow)).

```typescript
function StatusBadge({ status }: { status: "active" | "pending" | "closed" }) {
  return Span(status).whenMatch(status, {
    active:  t => t.bg("success/10").text("success"),
    pending: t => t.bg("warning/10").text("warning"),
    closed:  t => t.bg("surface-2").text("text-dim"),
  });
}
Span(MatchValue(trend, { up: "↑", down: "↓" }, "→"))             // ✓ MatchValue for text content
// ✗ .bg(MatchValue(status, { active: "success/10", … })) — non-literal arg → dropped class
// ✗ status === "active" ? "success/10" : "surface-2"             — ternary erases the union
```

When a variant map is shared across components, extract it with the `stylers<K>({...})` helper and `.apply()` it; keep `.whenMatch()` for inline one-offs.

## List & breadcrumb separators with `Intersperse`

`Intersperse(items, renderItem, separator)` places the separator **between** items, never after the last — the View analogue of `Array.join`. The separator is a thunk, so each gap gets a fresh `Tag`. Use it over a hand-rolled loop (which leaks a trailing separator):

```typescript
Nav(
  Intersperse(
    crumbs,
    (c) => A(c.label).nav(c.route).cursor("pointer"),
    () => Span("/").text("text-faint"),
  )
)
```

## Keyed lists for morph-stable swaps with `ForEachKeyed`

When a list re-renders into an `outerMorph` swap and rows can reorder/insert/delete, use `ForEachKeyed(items, keyOf, render)` — it stamps each row's root `Tag` with `id = keyOf(item)`, so idiomorph matches rows **by key** (plain `ForEach` matches positionally, reusing the wrong DOM nodes — losing focus/scroll/animation). `render` must return a `Tag`:

```typescript
Ul(
  ForEachKeyed(todos, (t) => t.id, (t) => Li(t.title))   // id stamped from keyOf automatically
)
```

## Scoped context — cross-cutting render-time values

Pass component data as **props**. For values you'd otherwise thread through every layer — nonce, current user, i18n locale, theme — use the app's scoped context (`createContext` / `createRequiredContext` from your `core/context` module, **not** from `fluent-html`): open a scope at the page root, read anywhere below.

```typescript
import { createRequiredContext } from "~/core/context";

const UserCtx = createRequiredContext<User>("user");   // .current throws if unscoped — a missing scope is always a bug

function Page(user: User) {
  using _ = UserCtx.scope(user);            // `using` auto-closes the scope after render
  return Div(Header(), Content());
}

function Header() {
  return Nav(Span(UserCtx.current.name));    // read deep in the tree, no prop drilling
}
```

The scope is **synchronous** — `using` auto-restores on block exit; rendering is sync, so use a scope, **never `AsyncLocalStorage`** (it leaks across concurrent requests) and never hold one open across an `await`. `createRequiredContext` throws when accessed unscoped (use for auth/request data — a missing scope is always a bug); `createContext(default)` returns the default silently.

Use context only for genuinely cross-cutting values; everything else stays a prop.

## Type-safe form fields with `Form<T>`

Use the [`Form<T>()`](fluent-html.md#type-safe-forms--formt) builder inside view functions to bind fields to schema keys. The callback receives field builder `f` and returns a `View[]`:

```typescript
function CreateUserForm() {
  return Form<CreateUserReq>((f) => [
    f.input("name", "text"),
    f.input("email", "email"),
    Button("Create").setType("submit"),
  ]).submit(userRoutes.create());
}
```

> Field types (`f.checkbox`/`f.radio`/`f.select`/`f.hidden`) and the full builder API live in [fluent-html.md § Type-Safe Forms](fluent-html.md#type-safe-forms--formt) — e.g. `f.checkbox`/`f.radio` for typed `checked`-wiring, never `f.input(name, "checkbox")`.

## Inline form validation errors

Pass a state object first (`Form<T>(state, (f) => …)`); `f.error(name)` renders the bound field's error (no-op when absent); the controller re-renders the same view with errors filled in:

```typescript
function CreateUserForm(state: FormState<CreateUserReq> = {}) {
  return Form<CreateUserReq>(state, (f) => [
    f.input("name", "text"),
    f.error("name"),
    f.input("email", "email"),
    f.error("email"),
    Button("Create").setType("submit"),
  ]).submit(userRoutes.create());
}
// Controller re-renders with errors: reply.renderView(CreateUserForm({ errors: { email: "Email already in use" } }));
```

Errored fields are auto-wired for assistive tech (`aria-invalid` + `aria-describedby`, with the `aria-invalid:` Tailwind variant available to style them) — full mechanics in the [fluent-html reference](fluent-html.md#type-safe-forms--formt).
