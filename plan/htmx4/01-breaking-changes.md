# Breaking Changes: htmx 2 → htmx 4

## 1. Attribute Renames

### `hx-disabled-elt` → `hx-disable`

The old `hx-disabled-elt` is now `hx-disable`.
The old `hx-disable` (boolean, stops htmx processing) is now `hx-ignore`.

**Current code** (`src/htmx.ts`):
```typescript
// HTMX interface
disabledElt?: string;  // Elements to disable during request
disable?: boolean;     // Disable htmx processing
```

**Current renderer** (`src/render/render.ts`):
```typescript
if (htmx.disabledElt) result += ' hx-disabled-elt="' + escapeAttr(htmx.disabledElt) + '"';
if (htmx.disable !== undefined) result += ' hx-disable="' + htmx.disable + '"';
```

**Migration:**
```typescript
// HTMX interface — rename properties
disable?: string;      // Elements to disable during request (was disabledElt)
ignore?: boolean;      // Disable htmx processing (was disable)

// Renderer — update attribute names
if (htmx.disable) result += ' hx-disable="' + escapeAttr(htmx.disable) + '"';
if (htmx.ignore !== undefined) result += ' hx-ignore="' + htmx.ignore + '"';
```

**App migration:** Find/replace `disabledElt:` → `disable:` and `disable: true` → `ignore: true` in app code.

---

## 2. Removed Attributes

### `hx-params` — REMOVED

Previously filtered which params to include. Now use `htmx:config:request` event.

**Action:** Remove `params` from HTMX interface and renderer.

### `hx-prompt` — REMOVED

Previously showed a browser prompt dialog. Now use `hx-confirm` with `js:` prefix for async confirmation.

**Action:** Remove `prompt` from HTMX interface and renderer.

### `hx-ext` — REMOVED

Extensions are now activated via `<meta name="htmx-config">`, not per-element.

**Action:** Remove `ext` from HTMX interface and renderer. Add `HtmxConfig()` helper.

### `hx-disinherit` — REMOVED

No longer needed since inheritance is explicit by default.

**Action:** Remove `disinherit` from HTMX interface and renderer.

### `hx-inherit` — REMOVED

Same reason as `hx-disinherit`.

**Action:** Remove `inherit` from HTMX interface and renderer.

### `hx-request` — REMOVED

Replaced by `hx-config` attribute.

**Action:** Remove `request` from HTMX interface. Add `config` property instead.

### `hx-history` — REMOVED

localStorage is no longer used for history. htmx 4 does a full page refresh on history navigation.

**Action:** Remove `history` from HTMX interface and renderer.

### `hx-history-elt` — REMOVED

No longer needed.

**Action:** Remove `historyElt` from HTMX interface and renderer.

### `hx-select-oob` — REMOVED (verify)

Likely subsumed by `<hx-partial>`. Verify when htmx 4 is final.

**Action:** Remove `selectOob` from HTMX interface and renderer.

---

## 3. Removed Response Headers

### `HX-Trigger-After-Swap` — REMOVED
### `HX-Trigger-After-Settle` — REMOVED

These response headers no longer exist. Use `HX-Trigger` instead (events now fire at the right time automatically), or use JavaScript.

**Current code** (`src/patterns.ts`):
```typescript
triggerAfterSwap(event: string, detail?: Record<string, any>): this {
  this._headers["HX-Trigger-After-Swap"] = ...;
}

triggerAfterSettle(event: string, detail?: Record<string, any>): this {
  this._headers["HX-Trigger-After-Settle"] = ...;
}
```

**Action:** Remove `triggerAfterSwap()` and `triggerAfterSettle()` from `HxResponse` class.

---

## 4. Explicit Inheritance (Behavioral)

**htmx 2:** Attributes like `hx-target`, `hx-confirm`, `hx-boost`, `hx-swap` inherit from parent elements automatically.

**htmx 4:** Inheritance only happens when you add `:inherited` modifier — `hx-confirm:inherited="Are you sure?"`.

**Revert option:** `htmx.config.implicitInheritance = true`

**Impact on fluent-html:** We need a way to render `:inherited` modifiers. See [02-new-features.md](02-new-features.md).

---

## 5. Non-200 Status Codes Now Swap

**htmx 2:** Only 2xx responses trigger swaps. 4xx/5xx are ignored.

**htmx 4:** All responses swap by default. Only 204 and 304 don't swap.

**Impact:** This is actually **good** for SSR apps — your 422 validation error responses now swap automatically. No more need for the `response-targets` extension hack.

**Revert option:** `htmx.config.noSwap = [204, 304, '4xx', '5xx']`

---

## 6. Default Timeout

**htmx 2:** No timeout (0).
**htmx 4:** 60-second default timeout.

**Impact:** Long uploads or slow operations may need `hx-config='{"timeout": 0}'`.

---

## 7. OOB Swap Timing

**htmx 2:** Out-of-band swaps happen **before** the main content swap.
**htmx 4:** Out-of-band swaps happen **after** the main content swap.

**Impact:** Code that relies on OOB elements being present before the main swap settles will break. Generally this is fine, but worth auditing.

---

## 8. `hx-delete` Form Data

**htmx 2:** `hx-delete` includes enclosing form inputs.
**htmx 4:** `hx-delete` does NOT include form inputs (matches `hx-get` behavior).

**Fix:** Add `hx-include="closest form"` to delete buttons inside forms that need form data.

---

## 9. Request Header Changes

| htmx 2 | htmx 4 | Notes |
|---|---|---|
| `HX-Trigger` (request) | `HX-Source` | Format: `tagName#id` (e.g. `button#submit`) |
| `HX-Target` | `HX-Target` | Now uses `tagName#id` format too |
| `HX-Trigger-Name` | Removed | Use `HX-Source` |
| — | `HX-Request-Type` | `"full"` or `"partial"` |
| — | `Accept: text/html` | Explicitly set on all requests |

**Impact on server-side code:** If your Fastify controllers read `HX-Trigger` request header, rename to `HX-Source`.

---

## 10. Event Name Changes

All event names changed from camelCase to colon-separated:

| htmx 2 | htmx 4 |
|---|---|
| `htmx:afterSwap` | `htmx:after:swap` |
| `htmx:beforeRequest` | `htmx:before:request` |
| `htmx:configRequest` | `htmx:config:request` |
| `htmx:afterOnLoad` | `htmx:after:init` |
| `htmx:beforeSwap` | `htmx:before:swap` |
| `htmx:load` | `htmx:after:init` |
| All error events | `htmx:error` (consolidated) |

**Impact:** Any `hx-on:*` handlers or client-side event listeners need updating.

---

## Summary: Files Changed

| File | Changes |
|---|---|
| `src/htmx.ts` | Remove 9 properties, rename 2, add new ones |
| `src/render/render.ts` | Update `buildHtmx()` — remove 9 attrs, rename 1, add new attrs |
| `src/patterns.ts` | Remove `triggerAfterSwap()`, `triggerAfterSettle()` from HxResponse |
| `test/test.ts` | Update all htmx tests for new attribute names |
| `test/patterns.ts` | Update HxResponse tests |
