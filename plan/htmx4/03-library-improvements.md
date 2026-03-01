# Library Improvements Beyond Migration

Ideas to make apps faster, safer, less bug-prone, and more testable — inspired by htmx 4's new capabilities and general DX improvements.

---

## A. Faster: Morph as Default Swap

### Problem
`outerHTML` destroys and recreates DOM nodes. This loses focus, scroll position, CSS animation state, and form input values. Users see flicker.

### Solution
Make `outerMorph` the recommended default. Morph diffs the DOM tree intelligently — only changed nodes are touched.

### Implementation
1. Update CLAUDE.md swap guidance
2. Consider changing the `hx()` helper default swap (currently no default — htmx uses `innerHTML`)
3. Add a `defaultSwap` option to `HtmxConfig()` meta helper

### Tradeoff
Morph is slightly slower than `outerHTML` for large DOM trees, but the UX improvement is worth it for most cases. For truly large lists, use `outerHTML` explicitly.

---

## B. Faster: Preload Links

### Problem
Navigation feels slow because the request only starts when the user clicks.

### Solution
htmx 4's preload extension fires the request on `mouseover` (or `mousedown`). By the time the click lands, the response is already cached.

### Implementation
Add preload to nav links automatically via a layout helper:

```typescript
function NavLink(label: string, href: string): Tag {
  return A(label)
    .setHref(href)
    .toggle("hx-boost")
    .toggle("hx-preload");
}
```

### Impact
Perceived navigation time drops to near-zero for hover-then-click patterns.

---

## C. Safer: Status-Code Error Handling

### Problem
Without `hx-status`, error responses either don't swap (htmx 2 default) or swap into the wrong place. Developers resort to JavaScript event handlers for error routing.

### Solution
`hx-status:422` declaratively routes validation errors to the right container. `hx-status:5xx` can suppress swap or show a global error banner. All in HTML, no JavaScript.

### Implementation
```typescript
// Global error handling on the page layout
Body(...).addAttribute("hx-status:5xx:inherited", "swap:innerHTML target:#error-banner")

// Form-level validation routing
Form(...).hxPost("/users", {
  target: ids.content,
  swap: "outerMorph",
  status: {
    422: { target: ids.formErrors, swap: "innerHTML" },
  }
})
```

### Impact
Eliminates an entire class of "error response goes to wrong place" bugs.

---

## D. Safer: Compile-Time Route Registry

### Problem
Endpoint strings are scattered across views and controllers. A typo in `"/api/usrs"` causes a silent 404. Method mismatches (GET vs POST) cause silent failures.

### Solution
A type-safe route registry that connects views to controllers:

```typescript
// src/routes.ts
export const routes = {
  listUsers:   { method: "get",    path: "/users" },
  createUser:  { method: "post",   path: "/users" },
  deleteUser:  { method: "delete", path: "/users/:id" },
} as const;

type Route = typeof routes[keyof typeof routes];

// Type-safe hx helper
function hxRoute<K extends keyof typeof routes>(
  route: K,
  params?: Record<string, string>,
  options?: HxOptions
): HTMX {
  const r = routes[route];
  let path = r.path as string;
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      path = path.replace(`:${key}`, value);
    }
  }
  return hx(path, { ...options, method: r.method });
}

// Usage — typos are compile errors
Button("Delete").setHtmx(hxRoute("deleteUser", { id: user.id }))
Button("Delete").setHtmx(hxRoute("delleteUser"))  // TS error!
```

### Implementation
This is an app-level pattern, not a library feature. Document in CLAUDE.md as a recommended pattern. Could ship a `defineRoutes()` helper.

### Impact
Eliminates endpoint typo bugs. Method mismatches become impossible.

---

## E. Less Bug-Prone: Partial() over OOB

### Problem
OOB swaps are error-prone:
- Content element must have an ID matching the OOB target
- Forgetting to set `hx-swap-oob` silently fails
- OOB elements are hidden in the response — not obvious what targets what
- OOB timing changed in htmx 4 (after main swap, not before)

### Solution
`<hx-partial>` is explicit about target and swap per fragment:

```typescript
render(
  Partial(ids.userList, UserList(users), "outerMorph"),
  Partial(ids.userCount, Span(`${count} users`)),
)
```

### Impact
Multi-swap responses become readable and debuggable. No more "why didn't my OOB swap work" debugging sessions.

---

## F. Less Bug-Prone: Inherited Attribute Visibility

### Problem
In htmx 2, `hx-target` on a parent silently affected all children. This was convenient but caused spooky-action-at-a-distance bugs where adding an htmx attribute to a child unexpectedly used a parent's target.

### Solution
htmx 4's explicit inheritance (`:inherited` modifier) forces developers to be deliberate. The library should make this easy:

```typescript
// Layout with explicit inheritance
Div(
  Form(...).hxPost("/save"),   // uses inherited target
  Button("Cancel"),            // no htmx, not affected
).addAttribute("hx-target:inherited", ids.content.selector)
```

### Impact
Eliminates "why is my request targeting the wrong element" bugs.

---

## G. Testable: Snapshot Testing for Views

### Problem
View functions return Tag trees. Currently testing requires rendering to string and doing string comparison, which is fragile.

### Solution
Add test helpers to the library:

```typescript
// src/test-utils.ts (new file, separate export)
import { render } from "./render/render.js";
import type { View } from "./core/types.js";

/** Render a view and normalize whitespace for comparison */
export function renderNormalized(view: View): string {
  return render(view).replace(/\s+/g, ' ').trim();
}

/** Assert a view contains specific htmx attributes */
export function assertHtmx(tag: Tag, expected: Partial<HTMX>): void {
  const htmx = tag.htmx;
  if (!htmx) throw new Error("Tag has no htmx attributes");
  for (const [key, value] of Object.entries(expected)) {
    if ((htmx as any)[key] !== value) {
      throw new Error(`Expected htmx.${key} = ${value}, got ${(htmx as any)[key]}`);
    }
  }
}

/** Assert a view renders to contain a substring */
export function assertContains(view: View, substring: string): void {
  const html = render(view);
  if (!html.includes(substring)) {
    throw new Error(`Expected render output to contain "${substring}"\nGot: ${html}`);
  }
}

/** Extract all htmx attributes from rendered HTML */
export function extractHtmxAttrs(view: View): Record<string, string> {
  const html = render(view);
  const attrs: Record<string, string> = {};
  const regex = /hx-[\w:-]+="[^"]*"/g;
  let match;
  while ((match = regex.exec(html))) {
    const [key, value] = match[0].split('=');
    attrs[key] = value.slice(1, -1);
  }
  return attrs;
}
```

### Impact
Views become properly unit-testable without relying on exact string matches.

---

## H. Testable: Tag Introspection

### Problem
To test a Tag, you currently have to render it to HTML and parse the string. This is roundabout.

### Solution
The Tag class already exposes `htmx`, `id`, `class`, `attributes`, `toggles` as public properties. Document these as the testing API:

```typescript
// Test that a form has the right htmx config
const form = CreateUserForm();
assert(form.htmx?.method === "post");
assert(form.htmx?.endpoint === "/users/create");
assert(form.htmx?.target === "#main-content");

// Test that a button is disabled
const btn = SaveButton({ disabled: true });
assert(btn.toggles?.includes("disabled"));
```

### Impact
Tests run faster (no rendering), are more readable, and less fragile.

---

## I. Safer: CSP Nonce Support

### Problem
Content Security Policy requires nonces on inline scripts and styles. htmx 4 has `inlineScriptNonce` and `inlineStyleNonce` config options, but any inline `hx-on:*` handlers need nonces too.

### Solution
Add nonce support to `HtmxConfig`:

```typescript
HtmxConfig({
  inlineScriptNonce: request.nonce,
  inlineStyleNonce: request.nonce,
})
```

And add a `setNonce()` method for Script/Style tags:

```typescript
Script("...").addAttribute("nonce", request.nonce)
```

### Impact
Enables strict CSP policies without breaking htmx.

---

## J. DX: `renderPartials()` Response Helper

### Problem
Building multi-partial responses is verbose:

```typescript
reply.renderView(render(
  Partial(ids.a, contentA),
  Partial(ids.b, contentB),
  Partial(ids.c, contentC),
));
```

### Solution
A dedicated helper:

```typescript
export function renderPartials(
  ...partials: { target: string | Id; content: View; swap?: HxSwap }[]
): string {
  return render(
    ...partials.map(p => Partial(p.target, p.content, p.swap))
  );
}

// Usage
reply.renderView(renderPartials(
  { target: ids.userList, content: UserList(users) },
  { target: ids.userCount, content: Span(`${count}`) },
));
```

---

## K. DX: ETag Support Awareness

### Problem
htmx 4 has built-in ETag support — it stores ETags and sends `If-None-Match` automatically. 304 responses skip swapping. But Fastify needs to set ETag headers.

### Solution
Document the pattern in CLAUDE.md. Add an `etag()` method to `HxResponse`:

```typescript
// src/patterns.ts
etag(value: string): this {
  this._headers["ETag"] = value;
  return this;
}

// Usage — Fastify controller
const users = await getUsers();
const hash = computeHash(users);

const { html, headers } = hxResponse(UserList(users))
  .etag(`"${hash}"`)
  .build();

reply.headers(headers);
reply.renderView(html);
```

### Impact
Free caching — repeated requests for unchanged data return 304 with no body. Reduces server load and network traffic.

---

## Summary: Improvement Priority

| Priority | Improvement | Category | Status |
|---|---|---|---|
| **P1** | Morph as default swap | Faster | ✅ `Partial()` defaults to `outerMorph`; CLAUDE.md update pending |
| **P1** | `Partial()` over OOB | Less bugs | ✅ Implemented; OOB deprecated |
| **P1** | Status-code error handling | Safer | ✅ `hx-status:CODE` implemented |
| **P2** | Preload links | Faster | ✅ `hx-preload` attribute supported |
| **P2** | Tag introspection testing docs | Testable | Not started |
| **P2** | Snapshot test helpers | Testable | Not started (Phase 8) |
| **P2** | `renderPartials()` helper | DX | Skipped — `render(Partial(...), ...)` works directly |
| **P2** | `HtmxConfig()` meta helper | DX | ✅ Implemented |
| **P3** | Route registry pattern | Safer | Not started (app-level pattern) |
| **P3** | ETag support | Faster | Not started |
| **P3** | CSP nonce support | Safer | Not started |
