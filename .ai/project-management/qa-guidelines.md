# QA Guidelines

Rules for managing `project/pm/[epic]/[feature]/qa.md` files.

---

## Structure

Each bug is a single section with status and severity in the heading. No summary list — the heading IS the summary. No IDs — the bug text is the identifier.

### DO:

```markdown
## [ ] [P1] Login fails with special characters in password
**Date:** 10. 03. 26
**Linked:** auth/login/todo.md - Implement auth endpoint
**Repro:**
1. Go to login page
2. Enter password containing `&` or `<`
3. Click submit
**Expected:** Login succeeds
**Actual:** 500 server error
**Resolution:**

## [x] [P2] Submit button misaligned on mobile
**Date:** 08. 03. 26
**Linked:** auth/login/todo.md - Create login form
**Repro:**
1. Open login page on mobile viewport (<768px)
2. Observe submit button position
**Expected:** Button aligned with form inputs
**Actual:** Button overflows right edge by 20px
**Resolution:** Fixed with max-width constraint on form container
```

### DON'T:

```markdown
// WRONG — separate summary list + detail sections (duplication, will drift)
- [ ] BUG-001 [P1] Login fails with special characters
---
## BUG-001
**Severity:** P1
...

// WRONG — IDs
## BUG-001

// WRONG — no repro steps
## [ ] [P1] Login fails with special characters
Something is broken with login

// WRONG — resolution filled in before bug is verified fixed
**Resolution:** Fixed it  ← only fill when status is [x]

// WRONG — bug filed in the wrong feature's qa.md
// A login bug belongs in auth/login/qa.md, not admin/users/qa.md
```

---

## Workflow

1. **Bug found** → add to relevant `project/pm/[epic]/[feature]/qa.md` as `[ ]`
2. **Session start** → read `project/pm/**/qa.md`, surface P0/P1 bugs related to current work
3. **Fix in progress** → mark `[>]` in the heading
4. **Verified fixed** → mark `[x]` in the heading, fill in **Resolution**
