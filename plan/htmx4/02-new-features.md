# New htmx 4 Features for fluent-html

> **Status:** Features 1–8 and 10–11 implemented. Feature 5 (inheritance modifiers) uses `addAttribute()` approach (Option A). Feature 9 (view transitions) already works via swap modifiers. Feature 12 (SSE) not implemented (app-level concern).

## 1. Morph Swap Strategies ✅

htmx 4 ships with built-in morphing based on the idiomorph algorithm. Instead of blowing away and replacing DOM nodes, morphing diffs and patches — preserving focus, scroll position, CSS animation state, and form values.

### New swap styles

```
innerMorph  — morph target's children
outerMorph  — morph target element itself
```

### Type change

```typescript
// src/htmx.ts — update HxSwapStyle
export type HxSwapStyle =
  | 'innerHTML' | 'outerHTML' | 'textContent'
  | 'beforebegin' | 'afterbegin' | 'beforeend' | 'afterend'
  | 'before' | 'after' | 'prepend' | 'append'     // new short names
  | 'innerMorph' | 'outerMorph'                     // new morph strategies
  | 'delete' | 'none';
```

### Usage

```typescript
// Morph preserves scroll position, focus, input values
Button("Refresh").hxGet("/users", {
  target: ids.userList,
  swap: "outerMorph",
})
```

### CLAUDE.md recommendation

Change default swap guidance from `outerHTML` to `outerMorph`:
```typescript
// htmx 4 best practice
hx("/users", { target: ids.userList, swap: "outerMorph" })
```

---

## 2. `<hx-partial>` — Multiple Targeted Swaps ✅

The biggest DX improvement. Instead of OOB swaps (which require elements to have matching IDs and use the awkward `hx-swap-oob` attribute), `<hx-partial>` lets you send multiple independently-targeted swaps in a single response.

### How it works

Each `<hx-partial>` in the response specifies its own target and swap strategy:

```html
<hx-partial hx-target="#user-list" hx-swap="outerMorph">
  <ul id="user-list">
    <li>Alice</li>
    <li>Bob</li>
  </ul>
</hx-partial>
<hx-partial hx-target="#user-count" hx-swap="innerHTML">
  42 users
</hx-partial>
```

### New element factory

```typescript
// src/elements/htmx.ts (new file)
export function HxPartial(...children: View[]): Tag {
  return new Tag("hx-partial", ...children);
}
```

### New helper function

```typescript
// src/patterns.ts
export function Partial(
  target: string | Id,
  content: View,
  swap: HxSwap = "outerMorph"
): Tag {
  const selector = isId(target) ? target.selector :
    target.startsWith('#') ? target : `#${target}`;
  return new Tag("hx-partial", content)
    .addAttribute("hx-target", selector)
    .addAttribute("hx-swap", swap);
}
```

### Usage

```typescript
// Before (htmx 2 OOB — awkward)
render(withOOB(
  UserList(users).setId(ids.userList),
  OOB(ids.userCount, Span(`${users.length} users`)),
  OOB(ids.pageTitle, H1("Users")),
))

// After (htmx 4 Partial — clean)
render(
  Partial(ids.userList, UserList(users)),
  Partial(ids.userCount, Span(`${users.length} users`)),
  Partial(ids.pageTitle, H1("Users")),
)
```

### Benefits over OOB

- Each partial explicitly declares target + swap strategy
- No need to set IDs on content elements to match OOB targets
- Server response structure is clearer
- No `hx-swap-oob` attribute pollution on elements
- First partial is "main" content; rest are secondary updates

### Keep OOB?

Keep OOB helpers for backwards compat but mark as `@deprecated` in JSDoc. New code should use `Partial()`.

---

## 3. `hx-status:CODE` — Status-Code-Specific Swap Behavior ✅

Lets you declare different swap behavior per HTTP status code. Eliminates need for JavaScript error handling.

### Type definition

```typescript
// src/htmx.ts
export type HxStatusCode =
  | number                          // exact: 422, 404, 500
  | `${number}xx`                   // range: 4xx, 5xx
  | `${number}${number}x`;          // range: 40x, 50x

export type HxStatusConfig = {
  swap?: HxSwap;
  target?: HxTarget | Id;
  select?: string;
  push?: boolean | string;
  replace?: boolean | string;
  transition?: boolean;
};
```

### HTMX interface addition

```typescript
// On the HTMX interface
status?: Record<string, string | HxStatusConfig>;
```

### Renderer addition

```typescript
// src/render/render.ts — in buildHtmx()
if (htmx.status) {
  for (const [code, config] of Object.entries(htmx.status)) {
    const value = typeof config === 'string' ? config : buildStatusConfig(config);
    result += ` hx-status:${code}="${escapeAttr(value)}"`;
  }
}
```

### Usage

```typescript
// Validation errors go to error container
Form(...).hxPost("/users/create", {
  target: ids.mainContent,
  swap: "outerMorph",
  status: {
    422: { swap: "innerHTML", target: ids.errors, select: "#validation-errors" },
    500: { swap: "none" },
    "5xx": { swap: "innerHTML", target: ids.errorBanner },
  }
})

// Or with string shorthand
Form(...).hxPost("/users/create", {
  target: ids.mainContent,
  status: {
    422: "swap:innerHTML target:#errors",
    "5xx": "swap:none",
  }
})
```

---

## 4. `hx-config` — Per-Element Request Configuration ✅

Replaces the removed `hx-request`. Lets you configure fetch behavior per element.

### Type definition

```typescript
export type HxConfig = {
  timeout?: number;
  credentials?: boolean;
  mode?: 'cors' | 'same-origin' | 'no-cors';
};
```

### HTMX interface

```typescript
config?: HxConfig | string;
```

### Renderer

```typescript
if (htmx.config) {
  const value = typeof htmx.config === 'string'
    ? htmx.config
    : JSON.stringify(htmx.config);
  result += ` hx-config='${escapeAttr(value)}'`;
}
```

### Usage

```typescript
// Long upload — disable timeout
Button("Upload").hxPost("/upload", {
  config: { timeout: 0 },
})

// CORS request
Button("Fetch").hxGet("https://api.example.com/data", {
  config: { mode: "cors", credentials: true },
})
```

---

## 5. Inheritance Modifiers (`:inherited`, `:append`) — Via `addAttribute()`

### The problem

htmx 4 defaults to NO inheritance. Attributes on parent elements don't propagate to children unless marked with `:inherited`.

### New modifier support

```typescript
// Option A: boolean flag on hx() options
Div(
  Button("Delete 1").hxDelete("/item/1"),
  Button("Delete 2").hxDelete("/item/2"),
).addAttribute("hx-confirm:inherited", "Are you sure?")

// Option B: dedicated methods
.hxConfirm("Are you sure?", { inherited: true })
.hxTarget(ids.result, { inherited: true })
.hxBoost(true, { inherited: true })
```

### Renderer support

For inheritable attributes (`hx-confirm`, `hx-target`, `hx-swap`, `hx-boost`, `hx-indicator`, `hx-include`, `hx-sync`, `hx-validate`, `hx-encoding`), support the `:inherited` suffix in the attribute name.

This needs design thought. Options:

**Option A — Separate inherited HTMX object:**
```typescript
Div(...).addAttribute("hx-confirm:inherited", "Are you sure?")
```
Simple, explicit, uses existing API. No magic.

**Option B — Modifier on each property:**
```typescript
// Complex, bloats the interface
confirm?: string | { value: string; inherited: true };
```

**Recommendation:** Option A. Keep it simple — use `addAttribute()` directly for inherited attrs. These are typically only set on layout containers, not frequently.

---

## 6. `hx-optimistic` — Optimistic UI ✅

Shows expected content immediately before the server responds, then replaces with actual response.

### Renderer

```typescript
if (htmx.optimistic !== undefined) result += ' hx-optimistic';
```

### Usage in templates

```html
<button hx-post="/like" hx-target="#like-count">
  <template hx-optimistic>
    <span>Liked!</span>
  </template>
  Like
</button>
```

### fluent-html approach

```typescript
// Works with existing Template element + toggle
Button(
  Template(Span("Liked!")).toggle("hx-optimistic"),
  "Like"
).hxPost("/like", { target: ids.likeCount })
```

---

## 7. `hx-preload` — Preload on Hover ✅

Triggers requests early (on mouseover or mousedown) so the response is cached by the time the user clicks.

### HTMX interface

```typescript
preload?: "mousedown" | "mouseover" | boolean;  // true = mouseover
```

### Renderer

```typescript
if (htmx.preload !== undefined) {
  result += typeof htmx.preload === 'string'
    ? ` hx-preload="${htmx.preload}"`
    : ' hx-preload';
}
```

### Usage

```typescript
// Preload nav links on hover
A("Dashboard").setHref("/dashboard").toggle("hx-preload")
```

---

## 8. `HtmxConfig` Meta Helper ✅

Since extensions and global config are now set via `<meta>`, provide a helper:

```typescript
// src/patterns.ts or src/htmx.ts
export function HtmxConfig(config: {
  extensions?: string;
  transitions?: boolean;
  defaultSwap?: HxSwapStyle;
  defaultTimeout?: number;
  implicitInheritance?: boolean;
  noSwap?: (number | string)[];
  prefix?: string;
  metaCharacter?: string;
}): Tag {
  return new Tag("meta")
    .addAttribute("name", "htmx-config")
    .addAttribute("content", JSON.stringify(config));
}
```

### Usage

```typescript
Head(
  HtmxConfig({
    extensions: "sse, preload",
    transitions: true,
    defaultSwap: "outerMorph",
  }),
  Script().setSrc("/htmx.js"),
  Script().setSrc("/ext/hx-sse.js"),
  Script().setSrc("/ext/hx-preload.js"),
)
```

---

## 9. View Transitions Support

htmx 4 integrates with the View Transitions API for smooth DOM transitions.

### Already supported via swap modifiers

```typescript
Button("Navigate").hxGet("/page", {
  swap: "outerMorph transition:true",
})
```

### Optional dedicated option

Could add a `transition` boolean to `HxOptions` that appends `transition:true` to the swap string:

```typescript
// In hx() builder
if (options.transition) {
  htmx.swap = (htmx.swap ?? 'innerHTML') + ' transition:true';
}
```

---

## 10. Modern Swap Short Names ✅

htmx 4 supports shorter names alongside the old `insertAdjacentHTML` names:

| Old | New (alias) |
|---|---|
| `beforebegin` | `before` |
| `afterbegin` | `prepend` |
| `beforeend` | `append` |
| `afterend` | `after` |

Already handled by updating `HxSwapStyle` union type. Both old and new names work.

---

## 11. `strip:true` Swap Modifier

New modifier that removes the outer wrapper element before swapping:

```typescript
Button("Load").hxGet("/fragment", {
  swap: "innerHTML strip:true",
})
```

Useful when the server response wraps content in a container div you don't want.

---

## 12. SSE Extension (Rewritten)

The SSE extension is completely rewritten for htmx 4. It uses fetch + ReadableStream (supports POST, custom headers, cookies). Two modes:

- **One-off streams:** Set `Accept: text/event-stream` on a normal `hx-get` request
- **Persistent connections:** Use `hx-sse:connect="/events"` attribute

### Potential helper

```typescript
// For persistent SSE connections
export function SseConnect(
  endpoint: string,
  options?: { swap?: string }
): Record<string, string> {
  return { "hx-sse:connect": endpoint, ...(options?.swap ? { "hx-sse:swap": options.swap } : {}) };
}

// Usage
Div().addAttribute("hx-sse:connect", "/events")
```

This uses colon-based attribute names which are new in htmx 4. The `metaCharacter` config option can change `:` to `-` for JSX/TSX compat — something to note.
