# Project Management Guidelines

This project uses **markdown files as the project management system**. No external tools — Linear, Jira, and Notion are never used. The web dashboard is a read-only view that derives status, changelog, and progress from the source files and git history.

All PM files live in the `project/pm/` directory. Never place them in the project root.

**Guard:** These rules only apply if `project/pm/` exists in the repo. If it doesn't, ignore all PM instructions.

> **Shape Up alignment:** todo.md tracks current-cycle committed scope, not a backlog. Uncommitted ideas stay in pitches/conversations, never in todo.md. Tasks in todo.md are discovered during the build — the PM system records progress, not prescribes a plan.

> Detailed references:
> - [todo-guidelines.md](todo-guidelines.md) — Task format, execution rules, adding work
> - [qa-guidelines.md](qa-guidelines.md) — Bug format and QA workflow

---

## File Structure

Epic (directory) > feature (directory) > concern (file). Related files live together.

```
/project/pm/
├── INDEX.md                    ← project overview + epic list
├── decisions.md                ← cross-cutting decisions only
│
└── [epic]/
    ├── INDEX.md                ← epic overview + feature list
    │
    └── [feature]/
        ├── prd.md              ← feature requirements
        ├── todo.md             ← tasks grouped by user story
        ├── qa.md               ← bugs for this feature
        └── decisions.md        ← optional, created when needed
```

**Source of truth vs. derived:**

| Source of truth (files) | Derived (git history / dashboard) |
|---|---|
| Requirements (`prd.md`) | Changelog |
| Tasks and status (`todo.md`) | Progress counts and percentages |
| Bugs (`qa.md`) | Overall project status |
| Decisions (`decisions.md`) | Velocity and trends |

Never duplicate derived information into files. The dashboard computes it live.

### DO:

```
/project/pm/
├── INDEX.md
├── decisions.md
│
├── admin/
│   ├── INDEX.md
│   ├── users/
│   │   ├── prd.md
│   │   ├── todo.md
│   │   └── qa.md
│   └── settings/
│       ├── prd.md
│       ├── todo.md
│       └── qa.md
│
├── judge/
│   ├── INDEX.md
│   ├── scoring/
│   │   ├── prd.md
│   │   ├── todo.md
│   │   ├── qa.md
│   │   └── decisions.md
│   └── submissions/
│       ├── prd.md
│       ├── todo.md
│       └── qa.md
│
└── public/
    ├── INDEX.md
    ├── auth/
    │   ├── prd.md
    │   ├── todo.md
    │   ├── qa.md
    │   └── decisions.md
    └── landing/
        ├── prd.md
        ├── todo.md
        └── qa.md
```

### DON'T:

```
// WRONG — status.md, changelog.md — these are derived from git history
/project/pm/
├── status.md
├── changelog.md

// WRONG — flat files instead of epic/feature directories
/project/pm/
├── todo.md           ← one giant file for the whole project
├── qa.md

// WRONG — parallel trees that duplicate structure
/project/pm/
├── prd/
│   └── auth/login.md
├── todo/
│   └── auth/login.md   ← same hierarchy repeated, will drift
├── qa/
│   └── auth/login.md
```

---

## No IDs

Tasks, bugs, and decisions have **no IDs** (no TASK-001, BUG-003, DECISION-002). The file path + text is the unique identifier.

### DO:

```markdown
// Cross-reference between features
- [ ] [P1] Update shared auth middleware
  - Note: also referenced in admin/users/todo.md

// Bug linking to a task
**Linked:** auth/login/todo.md - Implement auth endpoint
```

### DON'T:

```markdown
// WRONG — IDs are a Jira/Linear habit, they collide across files
- [ ] TASK-001 [P1] Update shared auth middleware
**Linked task:** TASK-002
```

---

## Shared Definitions

### Status Values

| Mark | Meaning |
|------|---------|
| `[ ]` | Todo |
| `[>]` | In progress |
| `[r]` | Review |
| `[x]` | Done |
| `[-]` | Cancelled |

### Priority / Severity Levels

| Level | Task meaning | Bug meaning |
|-------|-------------|-------------|
| P0 | Blocker / urgent | App crash, data loss, blocking flow |
| P1 | High | Feature broken, workaround exists |
| P2 | Mid | Visual issue, minor UX problem |
| P3 | Low | Polish, nice to have |

### Counts Rule

Never store counts anywhere. Counts are always calculated on-the-fly by reading `todo.md` and `qa.md` files. INDEX files are link-only.

---

## File Update Rules

### On starting a task
- Mark the task `[>]` in the relevant `project/pm/[epic]/[feature]/todo.md`

### On task completion
- Mark the task `[x]` in the relevant `todo.md` immediately

### On new feature scope
- Update the relevant `project/pm/[epic]/[feature]/prd.md` before writing any code
- If a new epic is added, create the epic directory with its INDEX.md
- If a new feature is added, create the feature directory with `prd.md`, `todo.md`, and `qa.md`, and link it from the epic's INDEX.md

### On bug discovery
- Add a properly formatted entry to the relevant `project/pm/[epic]/[feature]/qa.md` before continuing work

### On architecture decisions
- If scoped to a feature, log to `project/pm/[epic]/[feature]/decisions.md` (create if first decision)
- If cross-cutting, log to `project/pm/decisions.md`

---

## Session Start

1. Read `project/pm/**/qa.md` files and surface any open P0 or P1 bugs related to files we're about to work on
2. Read `project/pm/**/todo.md` files and calculate current task status
3. Flag any tasks that have a linked open bug

---

## Decisions Format

Location: feature-scoped → `project/pm/[epic]/[feature]/decisions.md` (created on first decision). Cross-cutting → `project/pm/decisions.md`. When in doubt, scope to the feature.

```markdown
## Use Resend instead of SendGrid for transactional emails
**Date:** 10. 03. 26
**Context:** Need transactional email for password reset and verification
**Decision:** Resend over SendGrid — simpler API, better DX, sufficient for our volume
**Reasoning:** SendGrid requires more config and has a steeper learning curve for basic use
**Consequences:** Locked into Resend's pricing; migration would require rewriting email templates
```

### DON'T:

```markdown
// WRONG — using IDs
## DECISION-001 | Use SendGrid for emails

// WRONG — editing a past decision instead of adding a new one
## Use SendGrid for emails  ← was Resend, changed to SendGrid

// WRONG — too vague
**Context:** Needed emails
**Decision:** Picked Resend
**Reasoning:** Seemed good

// WRONG — logged after implementation
// Decisions must be recorded BEFORE code is written
```
