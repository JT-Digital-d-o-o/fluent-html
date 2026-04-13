# View Guidelines

## View file segregation

**!IMPORTANT:** Always abstract and reuse components — avoid code duplication across views.

Split by page/interaction, not by component size:
- One view file per distinct page or HTMX endpoint response
- Shared fragments (table rows, cards, status badges) go in `[feature].components.ts`
- Each view file exports a single main function + any tightly-coupled sub-components
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

## Components

Plain functions with a typed props object (never positional args):
```typescript
type FormFieldProps = { id: string; label: string; type?: string; error?: string };

function FormField({ id, label, type = "text", error }: FormFieldProps) {
  return Div(
    Label(label).setFor(id).fontWeight("medium").textSize("sm"),
    Input().setId(id).setName(id).setType(type)
      .w("full").padding("2").border().borderColor("gray-300").rounded(),
    IfThen(error, (msg) => P(msg).textColor("red-500").textSize("sm"))
  );
}
```

## Discriminated unions for page states

```typescript
type UsersViewProps =
  | { state: "list"; users: User[] }
  | { state: "form"; error?: string }
  | { state: "detail"; user: User };

export function UsersView(props: UsersViewProps) {
  return Match(props.state, {
    list:   () => UserListSection(props.users),
    form:   () => UserFormSection(props.error),
    detail: () => UserDetailSection(props.user),
  });
}
```

## Type-safe form fields with `formFor`

Use `formFor<T>()` to constrain field names to schema keys — typos become compile errors:

```typescript
type CreateUserReq = { email: string; name: string; role: "admin" | "viewer" };
const f = formFor<CreateUserReq>();

function CreateUserForm(errors: FormErrors = {}) {
  return Form(
    FormField({ id: "name", label: "Name", input: f.input("name", "text"), error: errors.name }),
    FormField({ id: "email", label: "Email", input: f.input("email", "email"), error: errors.email }),
    Button("Create").setType("submit")
  ).hxPost("/users/create", { target: ids.mainContent, swap: "outerMorph" });
}
```

## Inline form validation errors

```typescript
type FormErrors = { [field: string]: string | undefined };

function CreateUserForm(errors: FormErrors = {}) {
  return Form(
    FormField({ id: "name", label: "Name", error: errors.name }),
    FormField({ id: "email", label: "Email", type: "email", error: errors.email }),
    Button("Create").setType("submit")
  ).hxPost("/users/create", { target: ids.mainContent, swap: "outerMorph" });
}
// Controller re-renders with errors: reply.renderView(CreateUserForm({ email: "Email already in use" }));
```
