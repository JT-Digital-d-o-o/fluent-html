# HTMX Guidelines

## Type-safe targets with defineIds

Never hardcode ID strings:
```typescript
export const ids = defineIds(["user-list", "user-count"] as const);
Div().setId(ids.userList)
Button("Load").hxGet("/api", { target: ids.userList })
hx("/api", { target: "#userList" })  // ✗ typos cause silent failures
```

## Type-safe routes with defineRoutes

Never hardcode endpoint strings:
```typescript
// Shared prefix avoids repetition (like Fastify's register prefix)
export const userRoutes = defineRoutes("/users", {
  list:   { method: "get",    path: "/" },
  create: { method: "post",   path: "/" },
  delete: { method: "delete", path: "/:id" },
} as const);
```

**Always use shared prefix** when routes share a common base path:
```typescript
// ✓
defineRoutes("/dashboard", {
  overview: { method: "get", path: "/" },
  project:  { method: "get", path: "/:repoName" },
} as const);

// ✗ repeating the prefix in every path
defineRoutes({
  overview: { method: "get", path: "/dashboard" },
  project:  { method: "get", path: "/dashboard/:repoName" },
} as const);
```

## Using routes in views

Method is locked, params are required, typos are compile errors:
```typescript
Button("Load").setHtmx(userRoutes.list())
Button("Load").setHtmx(userRoutes.list({ target: ids.userList }))
Button("Delete").setHtmx(userRoutes.delete({ id: user.id }, { target: ids.userList }))
userRoutes.lsit()            // ✗ typo — compile error
userRoutes.delete()          // ✗ missing params — compile error
```

## Using routes in controllers

Single-sourced paths:
```typescript
server.get(userRoutes.list.path, handler)       // "/users"
server.delete(userRoutes.delete.path, handler)  // "/users/:id"
```

## Resolved URLs

Use `.resolve()` for redirects and external links. Never write manual resolve helpers:
```typescript
reply.redirect(userRoutes.list.resolve())                  // "/users"
reply.redirect(userRoutes.delete.resolve({ id: user.id })) // "/users/42"

// ✗ NEVER do this — .resolve() already handles params + encoding
function resolveUser(id: string) { return `/users/${encodeURIComponent(id)}`; }
```

## Shorthand vs setHtmx

**Shorthand methods** for simple requests, **setHtmx(hx())** for complex:
```typescript
Button("Load").hxGet("/api/items")
Button("Save").hxPost("/api/save", { target: ids.result })

Form(/* fields */).setHtmx(hx("/search", {
  method: "post", target: ids.results,
  swap: "outerMorph", indicator: "#spinner"
}))
```

## Swap strategies

**Prefer outerMorph** — preserves focus, scroll, animations; innerHTML loses the target element's id:
```typescript
hx("/users", { target: ids.userList, swap: "outerMorph" })  // ✓
hx("/users", { target: ids.userList, swap: "innerHTML" })    // ✗
```
Use `outerHTML` only when you intentionally want to destroy and recreate DOM state.

**Morph swaps** — preserve DOM state (focus, scroll, animations):
```typescript
Button("Refresh").hxGet("/users", {
  target: ids.userList,
  swap: "outerMorph",
})
```

## Partial swaps

Update multiple page sections in one response:
```typescript
render(
  Partial(ids.mainContent, UserList(users)),
  Partial(ids.userCount, Span(`${users.length} users`)),
  Partial(ids.pageTitle, H1("Users")),
)
```

## Status-code routing

For validation and error responses:
```typescript
Form(/* fields */).hxPost("/users/create", {
  target: ids.mainContent,
  swap: "outerMorph",
  status: {
    422: { target: ids.formErrors, swap: "innerHTML" },
    "5xx": { swap: "none" },
  }
})
```

## Full layout navigations

Swap the main content area with `outerMorph` and scroll to top:
```typescript
// Navigation link — uses setHtmx, NOT setHref
A("Settings").setHtmx(settingsRoutes.index({ swap: "outerMorph show:window:top", target: ids.mainContent, pushUrl: true }))
A("Users").setHtmx(userRoutes.list({ swap: "outerMorph show:window:top", target: ids.mainContent, pushUrl: true }))

// Form submission that replaces the page
Form(/* fields */).setHtmx(userRoutes.create({
  target: ids.mainContent,
  swap: "outerMorph show:window:top",
}))

// Use Partial swaps to update nav, title, and content in one response
render(
  Partial(ids.mainContent, UserList(users)),
  Partial(ids.navBadge, Span(`${users.length}`)),
  Partial(ids.pageTitle, H1("Users")),
)
```

## Anchors

**Anchors with `setHtmx` need `cursor("pointer")`** — no `href` means no pointer by default:
```typescript
A("Users").setHtmx(userRoutes.list({ target: ids.mainContent })).cursor("pointer")
```

**Never use `setHref` for in-app navigation** — it causes a full page reload, bypassing HTMX:
```typescript
A("Users").setHtmx(userRoutes.list({ target: ids.mainContent }))           // ✓ HTMX swap
A("Users").setHref(userRoutes.list.resolve())                               // ✗ full page reload
A("Users").setHref("/users")                                                // ✗ full page reload
```
Use `setHref` only for external links or download URLs.

## Explicit inheritance

htmx 4 does not inherit attributes by default. Use `:inherited` modifier:
```typescript
Div(
  Button("Delete 1").hxDelete("/item/1"),
  Button("Delete 2").hxDelete("/item/2"),
).addAttribute("hx-confirm:inherited", "Are you sure?")

// Or opt back in to htmx 2 behavior globally:
HtmxConfig({ implicitInheritance: true })
```

## Global htmx config

Via meta tag:
```typescript
Head(
  HtmxConfig({
    extensions: "sse, preload",
    transitions: true,
    defaultSwap: "outerMorph",
  }),
  Script().setSrc("/htmx.js"),
)
```

## Per-element config

Replaces removed `hx-request`:
```typescript
Button("Upload").hxPost("/upload", {
  config: { timeout: 120000 },
})
```

## hxResponse

Server-driven navigation and events:
```typescript
const { html, headers } = hxResponse(Empty())
  .redirect("/users")
  .trigger("showToast", { message: "User created!" })
  .build();
reply.headers(headers);
reply.renderView(html);
```
