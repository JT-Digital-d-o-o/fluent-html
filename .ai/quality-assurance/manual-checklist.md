# Manual QA Checklist

Browser-based verification before deploy. Automated tests catch logic regressions — this checklist catches visual, UX, and integration issues that only show up in a real browser.

---

## When to Run This Checklist

```
Always:
- Before deploying to production
- After significant UI changes (layout, forms, navigation)
- After auth or payment flow changes

Skip (rely on automated tests):
- Backend-only changes (schema, config, utils)
- Dependency updates with passing CI
- Documentation-only changes
```

---

## 1. HTMX Navigation

| Check | How to verify |
|---|---|
| Links swap content correctly | Click navigation links — main content area updates without full page reload |
| scroll:top works | Navigate to a long page, scroll down, click a nav link — page scrolls to top |
| Browser back/forward works | Navigate through 3+ pages, use browser back/forward — content matches URL |
| URL updates on navigation | Click nav links — browser URL bar updates to match the page |
| No double-swap glitches | Click links rapidly — no stale content, flickering, or stacked responses |
| Loading indicators appear | Click a slow-loading link — loading state shows before content arrives |

---

## 2. Forms

| Check | How to verify |
|---|---|
| Valid submission works | Fill form correctly, submit — success redirect or confirmation shown |
| Required field validation | Leave required fields empty, submit — inline errors appear next to fields |
| Field values persist on error | Submit with one invalid field — other fields retain their entered values |
| Inline errors clear on resubmit | Fix the error, resubmit — previous error messages disappear |
| Email format validation | Enter "not-an-email", submit — error shown (client or server-side) |
| Password confirmation match | Enter mismatched passwords — error shown before or after submit |
| Form cannot double-submit | Click submit twice quickly — only one request processes |
| File upload works | Select a file, submit — file uploads successfully, confirmation shown |
| File type/size limits | Upload a disallowed file type or oversized file — clear error message |

---

## 3. Authentication

| Check | How to verify |
|---|---|
| Registration creates account | Register with new email — redirect to home/dashboard, user logged in |
| Login with valid credentials | Sign in — redirect, auth cookie set, protected pages accessible |
| Login with invalid credentials | Wrong email/password — error message shown, no redirect |
| Auth persists on refresh | Log in, refresh the page — still logged in |
| Protected routes redirect | Open a protected URL while logged out — redirected to login |
| Logout clears session | Click logout — redirected to login, protected pages no longer accessible |
| Auth cookie is HttpOnly | Inspect cookies in DevTools — auth cookie has HttpOnly flag |
| Session expires correctly | Wait for session timeout (or manually expire) — next request redirects to login |

---

## 4. Responsive Layout

| Check | How to verify |
|---|---|
| Mobile layout (< 640px) | Resize to 375px width or use DevTools mobile emulation |
| Tablet layout (640-1024px) | Resize to ~768px width |
| Desktop layout (> 1024px) | Full-width browser window |
| Navigation menu collapses | On mobile — hamburger menu appears and works |
| Tables scroll horizontally | On mobile — wide tables scroll, no layout overflow |
| Forms are usable on mobile | On mobile — inputs are full-width, buttons are tappable |
| Text is readable | On all sizes — no text overflow, truncation, or tiny fonts |
| Images scale properly | On all sizes — no overflow, no distortion |

---

## 5. Payment Flows

| Check | How to verify |
|---|---|
| Checkout redirects to Stripe | Click pay — redirected to Stripe checkout page |
| Successful payment returns | Complete test payment — redirected back, success state shown |
| Cancelled payment returns | Cancel on Stripe page — redirected back, appropriate message shown |
| Webhook updates status | Complete payment — check dashboard, payment status updates |
| Receipt/confirmation shown | After payment — receipt or confirmation page displays correctly |
| Subscription status updates | Subscribe — user plan/status reflects new subscription |
| Error state for failed payment | Use Stripe test card that declines — error message shown |

**Stripe test cards:**
```
Success:    4242 4242 4242 4242
Decline:    4000 0000 0000 0002
Auth req'd: 4000 0025 0000 3155
```

---

## 6. Error States

| Check | How to verify |
|---|---|
| 404 page renders correctly | Visit a non-existent URL — custom 404 page shown (not raw error) |
| 500 errors don't leak details | Trigger a server error — user-friendly message, no stack traces |
| Network error handling | Disconnect network, click a link — appropriate error shown |
| Empty states render | View a list page with no data — "No items" message (not blank page) |
| Rate limit feedback | Trigger rate limiting (rapid requests) — user-friendly message |

---

## 7. OOB Swaps & Multi-Section Updates

| Check | How to verify |
|---|---|
| OOB updates work | Perform an action that triggers OOB — secondary sections update (badge counts, titles) |
| OOB targets exist on page | Navigate to the page, inspect DOM — all OOB target IDs exist |
| No orphaned OOB elements | After OOB swap — no duplicate elements or stale content |

---

## 8. Data Integrity

| Check | How to verify |
|---|---|
| Created data appears in list | Create an item — it appears in the list without page refresh |
| Edited data persists | Edit an item, navigate away, come back — changes are saved |
| Deleted data disappears | Delete an item — it's removed from the list, not accessible by direct URL |
| Pagination works | If paginated — navigate pages, data is correct and consistent |
| Sort/filter works | If sortable/filterable — results update correctly |

---

## 9. Security Spot-Checks

| Check | How to verify |
|---|---|
| No XSS in user content | Enter `<script>alert('xss')</script>` in a text field — rendered as text, not executed |
| CSRF protection active | Inspect form requests in DevTools — CSRF token or SameSite cookie present |
| No sensitive data in HTML | View page source — no passwords, tokens, or secrets in HTML |
| HTTPS enforced | Access via HTTP — redirected to HTTPS (production only) |
| Security headers present | Check response headers — Helmet sets X-Frame-Options, CSP, etc. |

---

## 10. Performance Spot-Checks

| Check | How to verify |
|---|---|
| Pages load in < 2 seconds | Navigate to main pages — content appears quickly |
| No unnecessary full reloads | HTMX requests swap partial content — no full page loads during navigation |
| Images are optimized | Check image sizes in DevTools Network tab — no 5MB unoptimized images |
| No JavaScript errors | Open DevTools Console — no red errors during normal navigation |
| No excessive network requests | Check Network tab — no request storms or polling without purpose |

---

## Pre-Deploy Final Checks

```
Run before every production deploy:

[ ] npm run test              ← all tests pass
[ ] npm run lint              ← no lint errors
[ ] npm run build             ← builds without errors
[ ] Manual QA checklist       ← sections 1-10 above (focus on changed areas)
[ ] Check environment vars    ← production .env has correct values
[ ] Database migrations       ← pending migrations applied
[ ] Test with production data ← if staging environment available
```

---

## Severity Guide

When you find an issue, classify it:

| Severity | Description | Action |
|---|---|---|
| **Blocker** | App crashes, data loss, auth bypass, payment failure | Fix before deploy |
| **Critical** | Feature doesn't work, wrong data shown, broken layout | Fix before deploy |
| **Major** | UX issue, edge case failure, cosmetic on key pages | Fix or accept with documented risk |
| **Minor** | Cosmetic, typo, minor alignment issue | Log for next cycle |

### DON'T: Ship with blockers or critical issues
```
// WRONG — "We'll fix the login bug in the next release"
// Users can't access the app. This is a blocker.

// CORRECT — Fix blockers and criticals before deploy.
// Majors and minors can be tracked and fixed in the next cycle.
```

### DON'T: Let minor issues pile up indefinitely
```
// WRONG — 47 "minor" issues that never get addressed
// Death by a thousand cuts — the app feels sloppy.

// CORRECT — Dedicate time each cycle to fix a batch of minors.
// A polished product builds trust.
```
