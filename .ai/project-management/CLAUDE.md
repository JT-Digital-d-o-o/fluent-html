# Project Management Guidelines

Markdown files as the PM system. No external tools. The web dashboard derives status, changelog, and progress from source files and git history.

All PM files live in `project/pm/`. **Guard:** These rules only apply if `project/pm/` exists in the repo.

> **Shape Up:** todo.md tracks current-cycle committed scope, not a backlog. Tasks are discovered during the build — the PM system records progress, not prescribes a plan.

---

## File Structure

Epic (directory) > feature (directory) > concern (file).

```
/project/pm/
├── INDEX.md                    ← project overview + epic list
├── decisions.md                ← cross-cutting decisions only
├── cooldown.md                 ← optional: tech debt, cleanup, exploration ideas
│
└── [epic]/
    ├── INDEX.md                ← epic overview + feature list
    └── [feature]/
        ├── prd.md              ← feature requirements
        ├── todo.md             ← tasks grouped by user story (with hill phases)
        ├── qa.md               ← bugs for this feature
        └── decisions.md        ← optional, created when needed
```

Source of truth: `prd.md`, `todo.md`, `qa.md`, `decisions.md`, `cooldown.md`. Never duplicate derived data (counts, percentages, changelog, velocity) into files — the dashboard computes these live. INDEX files are link-only, never store counts.

Anti-patterns: flat files without epic/feature directories; parallel trees (`prd/auth/`, `todo/auth/`); `status.md` or `changelog.md` files.

---

## Shared Definitions

**No IDs.** Tasks, bugs, and decisions have no IDs (no TASK-001, BUG-003). File path + text is the unique identifier. Use cross-references, not duplicated tasks:

```markdown
- [ ] [P1] Update shared auth middleware
  - Note: also referenced in admin/users/todo.md
```

**Status marks** (used in both todo.md and qa.md headings):

| `[ ]` todo | `[>]` in progress | `[r]` review | `[x]` done | `[-]` cancelled |

**Priority / severity:**

| Level | Task | Bug |
|-------|------|-----|
| P0 | Blocker | App crash, data loss, blocking flow |
| P1 | High | Feature broken, workaround exists |
| P2 | Mid | Visual issue, minor UX problem |
| P3 | Low | Polish, nice to have |

---

## Hill Phases

Every user story has a hill phase that tracks **decision completeness**, not code completeness. Since Claude Code handles execution, the bottleneck is unclear requirements and unresolved decisions, not writing code. Most time should be spent **getting scopes over the hill**.

| Phase | Marker | Meaning |
|-------|--------|---------|
| Uphill | `<!-- hill: uphill -->` | Still figuring out the approach. Unknowns, open questions. |
| Downhill | `<!-- hill: downhill -->` | All decisions made, tasks are concrete, Claude executes. |

Place the marker on the line immediately before the user story heading:

```markdown
<!-- hill: uphill -->
### As a user I want to reset my password so that I can regain access

- [x] [P1] Spike: can we reuse magic-link infra for resets?
- [ ] [P1] ...tasks TBD, approach still unclear
```

```markdown
<!-- hill: downhill -->
### As a user I want to reset my password so that I can regain access

- [ ] [P1] Add "forgot password" link to login page
- [ ] [P1] Create reset form with token validation (1hr expiry)
- [ ] [P1] Handle 2FA-enabled accounts: require code after link click
- [ ] [P2] Send confirmation email via Resend after successful reset
- [ ] [P1] Write tests for password reset
- [ ] [P1] Check for bugs in password reset
```

The downhill version has more tasks but is closer to done — uphill, the task list is short because the real work hasn't been discovered yet.

**Transition to downhill when:** PRD has no open questions, technical approach is validated, all edge cases accounted for, Claude can execute without clarifying questions.

**Stuck scopes** (uphill 3+ days with no movement): make the pending decisions, split the story into smaller ones, or spike it with a throwaway prototype. If a "downhill" story keeps needing clarification, move it back to uphill.

---

## Shape Up → PM Mapping

The PM system implements Shape Up's build track. Two flows exist: **product** (SaaS — you decide what to build) and **client** (agency — scope comes from a brief). Both use the same PM files; the difference is how scope enters and how it ends.

### Shared concepts (both flows)

| Shape Up concept | PM equivalent |
|---|---|
| Scope (integrated slice) | User story heading in `todo.md` |
| Hill chart dot | `<!-- hill: uphill/downhill -->` marker per story |
| Task discovery | New tasks added to stories as work reveals them |
| Scope hammering | Mark cuttable tasks with `~` prefix (see below) |
| Scariest work first | Uphill stories before routine downhill ones |

**Nice-to-haves** — prefix with `~` to mark tasks that can be cut if time runs out:

```markdown
<!-- hill: downhill -->
### As a user I want to reset my password so that I can regain access

- [x] [P1] Add "forgot password" link to login page
- [x] [P1] Create reset form with token validation (1hr expiry)
- [ ] [P2] ~Show "link expired" page instead of generic error
- [ ] [P1] Write tests for password reset
- [ ] [P1] Check for bugs in password reset
```

When time is tight, `~` tasks get cut first. Non-`~` tasks define the must-have scope.

---

### Product flow (SaaS)

Continuous 1-week cycles. You choose what to build.

**DO: Enter scope through the betting table only**
```
Betting table picks pitches → create epic/feature dirs → write prd.md from
the pitch (problem, appetite, solution, rabbit holes, no-gos) → create
todo.md with uphill stories.

Only committed bets get PM files. Uncommitted ideas stay in pitches and
conversations — todo.md is never a backlog.
```

**DO: Set appetite internally — fixed time, variable scope**
```
1-2 day small batch or 1-week big batch.
If it doesn't fit the appetite, scope-hammer it down or reshape.
```

**DO: Apply circuit breaker at cycle end**
```
Time's up and must-haves remain → mark unfinished tasks [-].
Don't carry scraps into the next cycle.
Reshape and re-bet, or move to cooldown.md.
```

**DO: Use cool-down between cycles**
```
Tech debt, cleanup, exploration from cooldown.md.
Prune stale items before the next betting table.
```

**DON'T: Roll unfinished stories into the next cycle**
```
Each cycle starts with a clean betting table.
If an idea matters, it will come back as a new pitch — reshaped with
what you learned from the failed attempt.
```

---

### Client flow (agency projects)

Scope comes from a contract or project brief. Delivery is the commitment.

**DO: Enter scope from the project brief**
```
Client brief/SOW → create epic/feature dirs → write prd.md from the brief
(requirements, constraints, deliverables, out-of-scope) → create todo.md
with uphill stories.

All agreed scope enters todo.md at project start.
```

**DO: Treat the budget as the appetite**
```
The client's budget and deadline replace internal appetite-setting.
Scope-hammer within that constraint — same questions apply:
"Must-have for delivery?" vs "Nice-to-have if time allows?"
```

**DO: Negotiate `~` nice-to-haves with the client**
```
// Product: you cut ~tasks unilaterally when time is tight
// Client: cutting scope requires client agreement

Mark ~tasks early. Flag them in client check-ins:
"These are stretch goals — we'll deliver them if time allows,
 but the core delivery works without them."
```

**DO: Deliver what was agreed — no circuit breaker**
```
// Product: kill at cycle end if must-haves remain
// Client: you committed to delivering, so you deliver

If the project is running over, the options are:
1. Scope-hammer: cut ~tasks with client agreement
2. Renegotiate: adjust timeline or budget
3. Simplify: propose a simpler implementation that still solves the problem

Never silently drop agreed scope.
```

**DO: Use cool-down between projects**
```
Between client projects: internal cleanup, tooling improvements,
process retros. Same cooldown.md, different rhythm.
```

**DON'T: Let client change requests bypass the PM system**
```
New request mid-project → add to prd.md as a change request →
create new stories in todo.md → flag the scope/timeline impact.
Never just "squeeze it in" without recording it.
```

---

## Todo Format

Tasks grouped by user story in `project/pm/[epic]/[feature]/todo.md`. Every story ends with two mandatory tasks: write tests and check for bugs. Task format: `- [status] [priority] Title`.

New user stories go at the bottom. Bug-fix tasks can be added to a completed story if directly related (prefixed with `BUG:`). New features always get their own story.

**Execution rules:**
1. **Scariest work first** — risky/unknown stories before routine ones
2. **Top to bottom within a story** — don't jump ahead unless asked
3. **Atomic tasks** — one action, one outcome, one sentence
4. **Update status immediately** — never batch-update
5. **Break down broad tasks** before starting
6. **Fix blockers immediately** — if a task reveals a bug, fix it or add a new task

---

## QA Format

Each bug is a section in `project/pm/[epic]/[feature]/qa.md` with status and severity in the heading. The heading IS the summary — no separate summary lists.

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
```

Resolution is only filled when status is `[x]`. File bugs in the correct feature's qa.md.

**Workflow:** Bug found → add as `[ ]` → fix in progress → mark `[>]` → verified fixed → mark `[x]`, fill Resolution.

---

## Cooldown

`project/pm/cooldown.md` — optional parking lot for tech debt, cleanup, exploration that isn't committed scope. Categories as `## ` headings, items as `- [ ]` / `- [x]` checkboxes. No priorities, no user stories. When picked up, remove from cooldown and create proper feature files. Review between cycles to prune stale items.

---

## Decisions Format

Feature-scoped → `project/pm/[epic]/[feature]/decisions.md` (created on first decision). Cross-cutting → `project/pm/decisions.md`. When in doubt, scope to the feature. Record **before** writing code, never after.

```markdown
## Use Resend instead of SendGrid for transactional emails
**Date:** 10. 03. 26
**Context:** Need transactional email for password reset and verification
**Decision:** Resend over SendGrid — simpler API, better DX, sufficient for our volume
**Reasoning:** SendGrid requires more config and has a steeper learning curve for basic use
**Consequences:** Locked into Resend's pricing; migration would require rewriting email templates
```

Never edit a past decision — add a new one that supersedes it.

---

## File Update Rules

| Event | Action |
|-------|--------|
| Starting a task | Mark `[>]` in the relevant todo.md |
| Task completion | Mark `[x]` immediately |
| Hill phase change | Update `<!-- hill: uphill -->` ↔ `<!-- hill: downhill -->` |
| New feature scope | Update prd.md before writing code; create epic/feature dirs + files as needed |
| Bug discovery | Add formatted entry to the relevant qa.md before continuing |
| Architecture decision | Log to feature or cross-cutting decisions.md |

## Session Start

1. Read `project/pm/**/qa.md` — surface open P0/P1 bugs related to files we're about to work on
2. Read `project/pm/**/todo.md` — calculate current task status
3. Flag tasks with linked open bugs
4. Flag user stories still `<!-- hill: uphill -->` — these need decisions, not execution
