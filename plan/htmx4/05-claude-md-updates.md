# CLAUDE.md Updates for htmx 4

> **Status:** Not yet applied. All library changes are implemented — these CLAUDE.md updates should be applied as Phase 9.

## Changes to HTMX Section

### 1. Swap Guidance: `outerHTML` → `outerMorph`

**Before:**
```markdown
**Always outerHTML swap** — innerHTML loses the target element's id:
hx("/users", { target: ids.userList, swap: "outerHTML scroll:top" })
```

**After:**
```markdown
**Prefer outerMorph swap** — preserves focus, scroll, animations; innerHTML loses the target element's id:
hx("/users", { target: ids.userList, swap: "outerMorph" })

Use `outerHTML` only when you intentionally want to destroy and recreate DOM state.
```

### 2. OOB → Partial

**Before:**
```markdown
**OOB swaps** — update multiple page sections in one response:
render(withOOB(
  UserList(users).setId(ids.mainContent),
  OOB(ids.userCount, Span(`${users.length} users`)),
  OOB(ids.pageTitle, H1("Users")),
))
```

**After:**
```markdown
**Partial swaps** — update multiple page sections in one response:
render(
  Partial(ids.mainContent, UserList(users)),
  Partial(ids.userCount, Span(`${users.length} users`)),
  Partial(ids.pageTitle, H1("Users")),
)
```

### 3. Status Code Error Handling (New Section)

```markdown
**Status-code routing** for validation and error responses:
Form(/* fields */).hxPost("/users/create", {
  target: ids.mainContent,
  swap: "outerMorph",
  status: {
    422: { target: ids.formErrors, swap: "innerHTML" },
    "5xx": { swap: "none" },
  }
})
```

### 4. hxResponse — Remove After-Swap/Settle

**Before:**
```markdown
const { html, headers } = hxResponse(Empty())
  .redirect("/users")
  .trigger("showToast", { message: "User created!" })
  .triggerAfterSwap("scrollToTop")
  .build();
```

**After:**
```markdown
const { html, headers } = hxResponse(Empty())
  .redirect("/users")
  .trigger("showToast", { message: "User created!" })
  .build();
```

### 5. Inheritance (New Section)

```markdown
**Explicit inheritance** — htmx 4 does not inherit attributes by default. Use `:inherited` modifier:
Div(
  Button("Delete 1").hxDelete("/item/1"),
  Button("Delete 2").hxDelete("/item/2"),
).addAttribute("hx-confirm:inherited", "Are you sure?")

For global config use `HtmxConfig()`:
HtmxConfig({ implicitInheritance: true })  // opt back in to htmx 2 behavior
```

### 6. Config Meta Tag (New Section)

```markdown
**Global htmx config** via meta tag:
Head(
  HtmxConfig({
    extensions: "sse, preload",
    transitions: true,
    defaultSwap: "outerMorph",
  }),
  Script().setSrc("/htmx.js"),
)
```

### 7. Per-Element Config (New Section)

```markdown
**Per-element config** — replaces removed `hx-request`:
Button("Upload").hxPost("/upload", {
  config: { timeout: 120000 },
})
```

### 8. Remove `disabledElt` References

Any examples using `disabledElt` should use `disable` instead:

```typescript
// htmx 4
Button("Save").hxPost("/save", { disable: "closest form" })
```

### 9. Remove `hx-ext` References

Extensions are no longer per-element:

```typescript
// htmx 2 (removed)
Div().setHtmx(hx("/sse", { ext: "sse" }))

// htmx 4
HtmxConfig({ extensions: "sse" })
```

---

## Changes to Fastify Section

### 1. Error Responses Now Swap

**Before:**
```markdown
reply.renderView(PageView({ error: "Not found" }));  // error state
```

**After:**
```markdown
// 422 responses swap automatically in htmx 4
reply.code(422).renderView(CreateUserForm({ email: "Email taken" }));

// Use hx-status on the form to route errors to specific targets
```

### 2. Request Header Change

If any server code reads the `HX-Trigger` request header, it's now `HX-Source` in htmx 4 with format `tagName#id`.

---

## New Section: htmx 4 Patterns

Add to CLAUDE.md:

```markdown
## htmx 4 Patterns

**Morph swaps** — preserve DOM state (focus, scroll, animations):
Button("Refresh").hxGet("/users", {
  target: ids.userList,
  swap: "outerMorph",
})

**Preload** — start fetch on hover, cached by click time:
A("Dashboard").setHref("/dashboard").toggle("hx-boost").toggle("hx-preload")

**View transitions** — smooth animations between page states:
Button("Navigate").hxGet("/page", {
  swap: "outerMorph transition:true",
})

**ETag caching** — 304 responses skip swap automatically:
const { html, headers } = hxResponse(UserList(users))
  .etag(`"${hash}"`)
  .build();
```
