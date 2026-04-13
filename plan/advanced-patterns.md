# fluent-html: Advanced Pattern Opportunities

> Analysis date: 2026-04-13 | Version: 5.10.0 | Based on real usage across TTL, Rideshare, and fluent-html-demos

These are library-level patterns that would eliminate repetitive boilerplate across every project. Ordered by impact (frequency x effort saved per use).

---

## 1. HTMX FORM PATTERN — `hxForm()` (Very High Impact)

**The boilerplate** — every single form in every project repeats this exact pattern:

```typescript
Form(/* fields */)
  .setHtmx(someRoute({
    target: layoutIds.mainContent,
    swap: "outerMorph show:window:top",
    status: {
      422: { target: formIds.theForm.selector, swap: "outerMorph" },
    },
  }))
```

The logic: submit to route, on success replace the full layout, on 422 (validation error) replace just the form so errors display inline. Found **10+ times** in TTL alone (auth, settings, time entries, admin, dashboard quick-log).

**Proposed pattern:**

```typescript
// In src/patterns.ts
export function hxForm(
  route: HTMX | RouteCallable,
  options: {
    formTarget: Id;                           // Where to swap on validation error (422)
    successTarget?: Id;                       // Where to swap on success (default: mainContent-style)
    successSwap?: HxSwap;                     // Default: "outerMorph show:window:top"
    errorSwap?: HxSwap;                       // Default: "outerMorph"
    extraStatus?: Record<number, HxStatusConfig>;
  }
): HTMX

// Usage:
Form(/* fields */)
  .setId(ids.createUserForm)
  .setHtmx(hxForm(userRoutes.create, {
    formTarget: ids.createUserForm,
    successTarget: ids.mainContent,
  }))

// Replaces 8 lines of boilerplate with 1 call
```

This eliminates the most common HTMX mistake: forgetting the 422 status handler, which causes validation errors to replace the whole page instead of just the form.

---

## 2. NAVIGATION LINK HELPER — `hxNav()` (Very High Impact)

**The boilerplate** — every navigation link repeats:

```typescript
A("Settings")
  .setHtmx(settingsRoutes.index({
    swap: "outerMorph show:window:top",
    target: ids.mainContent,
    pushUrl: true,
  }))
  .cursor("pointer")
```

Found **20+ times** across every app. The `swap`, `target`, `pushUrl`, and `.cursor("pointer")` are always identical.

**Proposed pattern:**

```typescript
// In src/patterns.ts
export function hxNav(
  route: HTMX | RouteCallable,
  target: Id,
  options?: { replace?: boolean }  // replaceUrl instead of pushUrl
): HTMX

// Usage — one call instead of 6 lines:
A("Settings").setHtmx(hxNav(settingsRoutes.index, ids.mainContent))

// Could also provide a full nav-link builder:
export function NavLink(
  label: View,
  route: HTMX | RouteCallable,
  target: Id,
  options?: { active?: boolean }
): Tag
```

---

## 3. INLINE EDIT PAIR — `editPair()` (High Impact)

**The boilerplate** — inline edit/view toggle pattern appears in time entries, project members, dashboard entries:

```typescript
// View mode:
const editHtmx = entryRoutes.edit(
  { entryId: entry.id },
  { target: `#entry-row-${entry.id}`, swap: "outerMorph" }
);

// Edit mode:
const cancelHtmx = entryRoutes.view(
  { entryId: entry.id },
  { target: `#entry-row-${entry.id}`, swap: "outerMorph" }
);

// Both need matching IDs, both use outerMorph, the ID pattern is always `prefix-${entity.id}`
```

**Proposed pattern:**

```typescript
export function editPair<P extends Record<string, string>>(options: {
  prefix: string;                    // e.g. "entry-row"
  entityId: string;                  // e.g. entry.id
  viewRoute: RouteCallable<P>;       // Route to get view mode
  editRoute: RouteCallable<P>;       // Route to get edit mode
  params: P;                         // Route params
}): {
  rowId: string;                     // "entry-row-{id}" — use as setId()
  toEdit: HTMX;                      // Attach to edit button
  toView: HTMX;                      // Attach to cancel button
  toSave: (saveRoute: RouteCallable<P>) => HTMX;  // Attach to save button with 422 handling
}

// Usage:
const ep = editPair({
  prefix: "entry-row",
  entityId: entry.id,
  viewRoute: timeEntryRoutes.view,
  editRoute: timeEntryRoutes.edit,
  params: { entryId: entry.id },
});

// View row:
Tr(/* ... */).setId(ep.rowId)
Button("Edit").setHtmx(ep.toEdit)

// Edit row:
Tr(/* ... */).setId(ep.rowId)
Button("Cancel").setHtmx(ep.toView)
Button("Save").setHtmx(ep.toSave(timeEntryRoutes.update))
```

---

## 4. DELETE WITH CONFIRMATION — `hxDelete()` (High Impact)

**The boilerplate** — every delete action:

```typescript
Button("Delete")
  .setHtmx(entityRoutes.remove(
    { entryId: entry.id },
    {
      target: `#entry-row-${entry.id}`,  // or closest(".entry-row")
      swap: "delete",
      confirm: "Are you sure?",
    },
  ))
```

And in the controller:
```typescript
await prisma.entity.delete({ where: { id } });
reply.code(200).send("");
```

The `swap: "delete"` + `confirm` + empty response pattern is identical everywhere.

**Proposed pattern:**

```typescript
export function hxDelete(
  route: HTMX | RouteCallable,
  options: {
    target?: string | Id;            // Element to remove from DOM
    confirm?: string;                // Confirmation message (default: "Are you sure?")
    closest?: string;                // Alternative: remove closest ancestor matching selector
  }
): HTMX

// Usage:
Button("Delete").setHtmx(hxDelete(
  timeEntryRoutes.remove({ entryId: entry.id }),
  { confirm: "Delete this entry?" }
))
```

---

## 5. FIELD ERROR HELPER — `FieldError()` (High Impact)

**The boilerplate** — in every form, for every field:

```typescript
IfThen(errors?.projectId, (msg) =>
  Span(msg).textSize("xs").textColor("red-400").margin("t", "1")
)
```

And on the input itself:
```typescript
Input("text").setName("email")
  .when(!!errors?.email, t => t.borderColor("red-500"))
```

This two-part pattern (highlight input + show message) appears **50+ times** across all projects.

**Proposed pattern:**

```typescript
// Library-level: just the conditional error message
export function FieldError(error: string | undefined | null): View {
  return IfThen(error, (msg) => Span(msg).textSize("xs").textColor("red-400").margin("t", "1"));
}

// And a modifier for the input border:
export function withFieldError(error: string | undefined | null) {
  return (t: Tag) => t.when(!!error, t => t.borderColor("red-500"));
}

// Usage:
Div(
  Input("text").setName("email").apply(withFieldError(errors?.email)),
  FieldError(errors?.email),
)
```

Lightweight, composable, no opinion on layout. The app-level `FormGroup` component composes these.

---

## 6. SECTION SWAP — `hxSection()` (Medium-High Impact)

**The boilerplate** — updating a specific section without full-page navigation:

```typescript
Button("Remove")
  .setHtmx(projectRoutes.removeMember(
    { projectId: project.id, userId: member.user.id },
    {
      target: ids.membersSection.selector,
      swap: "outerMorph",
    },
  ))
```

Different from nav (no pushUrl, no show:window:top — just swap a section in place).

**Proposed pattern:**

```typescript
export function hxSection(
  route: HTMX | RouteCallable,
  target: Id,
  options?: { swap?: HxSwap }  // default: "outerMorph"
): HTMX

// Usage:
Button("Remove").setHtmx(hxSection(
  projectRoutes.removeMember({ projectId: project.id, userId: member.user.id }),
  ids.membersSection,
))
```

---

## 7. FRAGMENT HELPER — `Fragment()` (Medium Impact)

**The gap** — when you need to return multiple sibling elements without a wrapper div:

```typescript
// Current: must return an array (works, but awkward in component returns)
function UserInfo(user: User): View {
  return [
    Span(user.name).bold(),
    Span(user.email).textColor("gray-500"),
  ];
}

// Or wrap in a div (adds unnecessary DOM node):
function UserInfo(user: User): Tag {
  return Div(
    Span(user.name).bold(),
    Span(user.email).textColor("gray-500"),
  );
}
```

**Proposed pattern:**

```typescript
// Explicit intent, self-documenting:
export function Fragment(...children: View[]): View {
  return children.length === 1 ? children[0]! : children;
}

// Usage:
function UserInfo(user: User): View {
  return Fragment(
    Span(user.name).bold(),
    Span(user.email).textColor("gray-500"),
  );
}
```

Tiny utility, but makes the intent clear when reading code. The array return works, but `Fragment()` signals "these are siblings on purpose, not a forgotten wrapper."

---

## 8. SAFE RAW — `TrustedHtml()` / `SafeRaw()` (Medium Impact)

**The gap** — `Raw()` bypasses all escaping, which is necessary for SVG icons and pre-rendered HTML, but scary for anything user-adjacent:

```typescript
Raw(svgIconString)     // Fine — trusted static content
Raw(markdownHtml)      // Risky — was the markdown sanitized?
Raw(userBio)           // XSS vulnerability
```

There's no middle ground between "escape everything" (string) and "escape nothing" (`Raw()`).

**Proposed pattern:**

```typescript
// A branded type that marks HTML as pre-sanitized
declare const __sanitized: unique symbol;
export type SanitizedHtml = string & { readonly [__sanitized]: true };

// Mark content as sanitized (developer assertion):
export function trustHtml(html: string): SanitizedHtml {
  return html as SanitizedHtml;
}

// Only accepts SanitizedHtml, not plain strings:
export function SafeRaw(html: SanitizedHtml): RawString {
  return Raw(html);
}

// Usage:
import { sanitize } from 'some-sanitizer';

const cleanBio = trustHtml(sanitize(user.bio));
SafeRaw(cleanBio);      // ✓ Compiles
SafeRaw(user.bio);       // ✗ TypeScript error — not SanitizedHtml

// Static SVG is fine with regular Raw():
Raw(svgIconString);      // Still works for trusted static content
```

This doesn't add runtime safety — it's a **type-level lint** that forces developers to acknowledge "I sanitized this" before bypassing escaping. The branded type propagates through the codebase, making unsanitized paths visible in code review.

---

## 9. CONDITIONAL CLASS LIST — `cx()` (Medium Impact)

**The gap** — conditional class composition is verbose:

```typescript
Button("Save")
  .when(isActive, t => t.background("accent").textColor("white"))
  .when(!isActive, t => t.background("slate-800").textColor("slate-400"))
```

This works but is 3 lines for a binary toggle. For mutually exclusive states with 3+ options, it gets long.

**Proposed pattern:**

```typescript
// Conditional class helper (like clsx but for fluent-html):
export function cx(
  ...entries: (string | false | null | undefined | [boolean, string] | [boolean, string, string])[]
): string

// Usage:
Button("Save").addClass(cx(
  "font-medium rounded-lg",
  [isActive, "bg-accent text-white", "bg-slate-800 text-slate-400"],
  [isLoading, "opacity-50 cursor-wait"],
))
```

Ternary tuples: `[condition, trueClasses, falseClasses]`. Binary tuples: `[condition, classes]`. Strings always included. Falsy values skipped.

Complements the existing `.when()` for cases where you're only toggling classes (not calling multiple methods).

---

## 10. VIEW STATE DISCRIMINATOR — `ViewState<T>` + `matchState()` (Medium Impact)

**The gap** — every page that loads data has the same three states, defined ad-hoc:

```typescript
// In every controller:
type PageState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; data: User[] };

// In every view:
Match(state, "status", {
  loading: () => Spinner(),
  error: (s) => Alert(s.message),
  success: (s) => UserList(s.data),
})
```

The `loading | error | success` triple is defined from scratch in every feature.

**Proposed pattern:**

```typescript
// Generic data-loading state:
export type ViewState<T> =
  | { status: "loading" }
  | { status: "error"; message: string; code?: number }
  | { status: "empty"; message?: string }
  | { status: "success"; data: T };

// Constructors:
export const ViewState = {
  loading: (): ViewState<never> => ({ status: "loading" }),
  error: (message: string, code?: number): ViewState<never> => ({ status: "error", message, code }),
  empty: (message?: string): ViewState<never> => ({ status: "empty", message }),
  success: <T>(data: T): ViewState<T> => ({ status: "success", data }),
} as const;

// Shorthand Match with sensible defaults:
export function matchState<T>(
  state: ViewState<T>,
  cases: {
    success: (data: T) => View;
    loading?: () => View;
    error?: (message: string, code?: number) => View;
    empty?: (message?: string) => View;
  }
): View

// Usage in controller:
const users = await prisma.user.findMany();
const state = users.length === 0
  ? ViewState.empty("No users yet")
  : ViewState.success(users);

// Usage in view:
matchState(state, {
  success: (users) => UserTable(users),
  empty: (msg) => EmptyState({ title: msg ?? "Nothing here" }),
  // loading and error get sensible defaults if omitted
})
```

The `empty` state is separate from `success` because empty lists need different UI (illustration, call-to-action) vs populated lists. Currently every view handles this with `IfThenElse(data.length > 0, ...)`.

---

## 11. CLOSEST / THIS SELECTORS — typed helpers (Low-Medium Impact)

**The gap** — HTMX's `closest` and `this` selectors are raw strings:

```typescript
{ target: "closest tr" }    // String — no validation
{ target: "closest .card" } // Typo in class? Silent failure
```

**Proposed pattern:**

```typescript
export function closest(selector: string): string {
  return `closest ${selector}`;
}

export function find(selector: string): string {
  return `find ${selector}`;
}

export function next(selector?: string): string {
  return selector ? `next ${selector}` : "next";
}

export function previous(selector?: string): string {
  return selector ? `previous ${selector}` : "previous";
}

// Usage:
{ target: closest("tr") }
{ target: find(".error-message") }
```

Small but self-documenting. These already exist as HTMX concepts — just giving them named functions instead of string templates.

---

## Summary

| # | Pattern | Impact | Effort | Frequency in real apps |
|---|---------|--------|--------|----------------------|
| 1 | `hxForm()` — form + 422 handler | Very High | Low | 10+ per project |
| 2 | `hxNav()` — navigation link | Very High | Trivial | 20+ per project |
| 3 | `editPair()` — inline edit toggle | High | Medium | 2-5 per project |
| 4 | `hxDelete()` — delete + confirm | High | Low | 5-10 per project |
| 5 | `FieldError()` — validation display | High | Trivial | 50+ per project |
| 6 | `hxSection()` — section-only swap | Medium-High | Trivial | 5-10 per project |
| 7 | `Fragment()` — sibling wrapper | Medium | Trivial | Throughout |
| 8 | `SafeRaw()` — branded trusted HTML | Medium | Low | Per-project policy |
| 9 | `cx()` — conditional classes | Medium | Low | 15+ per project |
| 10 | `ViewState<T>` — data loading states | Medium | Low | 1 per feature |
| 11 | `closest()` etc. — HTMX selectors | Low-Medium | Trivial | 5+ per project |

Items 1-2 alone would eliminate the most repetitive HTMX boilerplate. Items 5 and 7 are near-zero-effort additions that clean up every view file. Item 8 is a type-safety multiplier that pays off in security audits.
