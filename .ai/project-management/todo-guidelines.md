# TODO Guidelines

Rules for managing `project/pm/[epic]/[feature]/todo.md` files.

> **Shape Up alignment:** Tasks in todo.md are discovered during the build, not pre-assigned. The PM system records progress as the team works — it doesn't prescribe a plan. See [team-autonomy.md](../product-development/shape-up/team-autonomy.md).

---

## Structure

Tasks are grouped by user story. Every user story ends with two mandatory tasks: write tests and check for bugs. No IDs — the task text is the identifier.

### DO:

```markdown
### As a user I want to reset my password so that I can regain access to my account

- [ ] [P1] Add "forgot password" link to login page
- [ ] [P1] Create password reset form with token validation
- [ ] [P2] Send confirmation email after successful reset
- [ ] [P1] Write tests for password reset
- [ ] [P1] Check for bugs in password reset
```

### DON'T:

```markdown
// WRONG — IDs create collision risk across files
- [ ] TASK-001 [P1] Add forgot password link

// WRONG — no user story, just a list of tasks
- [ ] [P1] Add forgot password link
- [ ] [P1] Create reset form

// WRONG — missing mandatory test + bug check tasks at the end

// WRONG — epic name as header (the directory IS the epic)
## Authentication
```

---

## Execution Rules

1. **Work top to bottom** — don't jump ahead unless explicitly asked
2. **Keep tasks atomic** — one action, one outcome, one sentence
3. **Update status immediately** — never batch-update
4. **Break down broad tasks** — expand into subtasks before starting
5. **Fix blockers immediately** — if a task reveals a bug, fix it or add a new task

---

## Adding New Work

### DO: Add new user stories at the bottom of the feature's todo.md

```markdown
### As a user I want to verify my email so that my account is confirmed

- [ ] [P2] Send verification email on registration
- [ ] [P2] Create verification landing page
- [ ] [P1] Write tests for email verification
- [ ] [P1] Check for bugs in email verification
```

### DO: Add bug-fix tasks to a completed user story if directly related

```markdown
### As a user I want to log in so that I can access my account

- [x] [P1] Create login form
- [x] [P1] Implement auth endpoint
- [ ] [P1] BUG: Login fails with special chars in password
```

### DON'T: Add new features to a completed user story

```markdown
// WRONG — new feature disguised as addition to completed story
- [x] [P1] Create login form
- [ ] [P2] Add social login with Google  ← belongs in a new user story
```

### DO: Cross-reference when tasks span multiple features

```markdown
- [ ] [P1] Update shared auth middleware
  - Note: also referenced in admin/users/todo.md
```

### DON'T: Duplicate a task across multiple todo.md files

```markdown
// WRONG — same task in two files creates drift
// auth/login/todo.md:
- [ ] [P1] Update shared auth middleware

// admin/users/todo.md:
- [ ] [P1] Update shared auth middleware  ← use a cross-reference instead
```
