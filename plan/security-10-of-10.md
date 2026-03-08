# Plan: Security 10/10

> Goal: Close all remaining security gaps to achieve a 10/10 score.
>
> **Current: 9/10** — Attribute escaping fixed, XSS protection by default. Gaps: script/style content injection, attribute key validation, CSP nonce support.

---

## Phase 1 — Script/Style Content Sanitization

**Problem:** `Raw()` inside `<script>` or `<style>` tags bypasses escaping (by design), but there's no guard against `</script>` injection in script content or `</style>` in style content.

**Fix:**
- In `renderImpl`, when `isRawContext === true` and element is `script`, scan for `</script` (case-insensitive) in the content and throw or escape it
- Same for `style` + `</style`
- The HTML spec requires this: a `</script>` inside a script tag closes the tag regardless of context

**Files:** `src/render/render.ts`

**Tests:**
- `Raw("<\/script><script>alert(1)")` inside `Script()` must not produce valid injection
- Same for `Style()` with `</style>`

---

## Phase 2 — Attribute Key Validation

**Problem:** `addAttribute(key, value)` accepts any string as `key`. A crafted key like `onclick` or `" onmouseover="` could inject event handlers or break out of the attribute context.

**Fix:**
- Validate attribute keys in `addAttribute()`: must match `/^[a-zA-Z][a-zA-Z0-9\-:]*$/`
- Reject or throw on invalid keys at build time (not render time — fail fast)
- Consider a deny-list for dangerous attributes (`onclick`, `onerror`, `onload`, etc.) with an explicit opt-in escape hatch

**Files:** `src/core/tag.ts`

**Tests:**
- `addAttribute("onclick", "alert(1)")` — blocked or warned
- `addAttribute('" onmouseover="x', "y")` — throws
- `addAttribute("data-custom", "safe")` — passes
- `addAttribute("hx-get", "/api")` — passes (not an event handler)

---

## Phase 3 — Prototype Pollution Guard on `attributes`

**Problem:** `tag.attributes` is a plain object. If user-controlled keys flow into `addAttribute`, `__proto__` or `constructor` keys could cause issues.

**Fix:**
- Use `Object.create(null)` for the attributes object (check if `EMPTY_ATTRS` already does this)
- Add a guard in `addAttribute` rejecting `__proto__`, `constructor`, `prototype` keys

**Files:** `src/core/tag.ts`

---

## Phase 4 — CSP Nonce Support

**Problem:** No built-in way to add `nonce` attributes for Content Security Policy on inline scripts/styles.

**Fix:**
- Add `setNonce(nonce: string)` method on `Tag` (or at minimum on Script/Style elements)
- Alternatively, document the pattern: `Script("...").addAttribute("nonce", nonce)`
- Consider a `renderWithNonce(view, nonce)` helper that auto-applies nonce to all script/style tags

**Files:** `src/core/tag.ts` or `src/render/render.ts`

---

## Phase 5 — Security Test Suite

**Problem:** Security tests are scattered across the main test file.

**Fix:**
- Create `test/security.ts` with dedicated sections:
  - XSS via text content
  - XSS via attribute values
  - XSS via attribute keys
  - Script/style injection
  - HTMX attribute escaping
  - Prototype pollution
  - Unicode edge cases (null bytes, RTL override, zero-width chars)

**Files:** `test/security.ts`

---

## Acceptance Criteria

- [x] `</script>` injection inside `Script()` is prevented
- [x] Attribute key validation rejects malformed keys
- [x] Event handler attributes (`on*`) are blocked by default
- [x] Prototype pollution via attribute keys is impossible
- [x] CSP nonce support via `setNonce()` and `renderWithNonce()`
- [x] Dedicated security test suite with comprehensive edge cases
- [x] `tsc --noEmit` clean, all existing tests pass (623/623)
