# Claude Code Algorithms

A pattern for breaking complex tasks into phases that Claude Code can execute — with parallel agents where possible.

## Why Use This Pattern

Claude Code is powerful but works best with clear instructions. For any task that involves:
- Multiple files that depend on each other
- Work that can be parallelized
- Specific guidelines or references that must be followed

...writing an **algorithm first** gives you a reviewable plan before any code is written. You can adjust the approach, catch mistakes early, and share the plan with teammates.

## The Structure

```
Phase 0 — Foundation       (sequential, 1 agent)
Phase 1 — Shared pieces    (sequential, 1 agent)
Phase 2 — Independent work (PARALLEL, N agents)
Phase 3 — Integration      (sequential, 1 agent)
```

**Rule of thumb:** if two pieces of work don't read/write the same files, they can run in parallel.

## How to Write an Algorithm

### 1. Start with the goal

```markdown
> Goal: Add dark mode support to the app with a toggle in the header.
```

One sentence. What does "done" look like?

### 2. List references the agents must read

```markdown
## References (agents MUST read before writing code)

- `CLAUDE.md` — project conventions
- `src/shared/theme.ts` — existing theme system
- `docs/design-system.md` — color tokens
```

This is critical. Agents don't have your context. Tell them exactly which files contain the rules they must follow.

### 3. Write phases in pseudo-code

Each phase is one or more agents. Each agent has:
- **What to READ** — files it needs to understand
- **What to DO** — steps in order
- **What to OUTPUT** — how you know it's done

```markdown
## Phase 0 — Theme Tokens (sequential)

AGENT: theme-setup
  READ  src/shared/theme.ts        // existing theme
  READ  docs/design-system.md      // color tokens

  STEP 1 — Define dark palette
    EDIT src/shared/theme.ts
      // Add dark variants for every color token
      // Export: lightTheme, darkTheme

  STEP 2 — Verify
    RUN  npm run lint
    RUN  npm run build

  OUTPUT: dark theme tokens exist, build passes
```

### 4. Mark parallel work explicitly

```markdown
## Phase 1 — Update Components (PARALLEL)

PARALLEL [
  AGENT: dark-mode-header
    READ  src/components/header.ts
    EDIT  src/components/header.ts
      // Add theme toggle button
      // Use darkTheme tokens when active

  AGENT: dark-mode-sidebar
    READ  src/components/sidebar.ts
    EDIT  src/components/sidebar.ts
      // Replace hardcoded colors with theme tokens

  AGENT: dark-mode-cards
    READ  src/components/card.ts
    EDIT  src/components/card.ts
      // Replace hardcoded colors with theme tokens
]
```

### 5. End with integration

```markdown
## Phase 2 — Integration (sequential)

AGENT: integration
  STEP 1 — Verify all components use theme tokens
  STEP 2 — Run lint + build
  STEP 3 — Manual visual check
  STEP 4 — Deploy
```

## Full Example — Add Email Notifications

```markdown
# Email Notifications — Claude Code Algorithm

> Goal: Send email notifications when a project status changes.

## References

- `CLAUDE.md` — project conventions, Fastify patterns
- `src/core/plugins/mailer.ts` — existing mailer plugin
- `src/projects/projects.schema.ts` — project status types

## Phase 0 — Email Templates (sequential)

AGENT: email-templates
  READ  src/core/plugins/mailer.ts      // how emails are sent
  READ  src/projects/projects.schema.ts  // status enum values

  STEP 1 — Create email template builder
    CREATE src/notifications/email-templates.ts
      // statusChanged({ project, oldStatus, newStatus, recipient })
      // Returns: { subject: string, html: string }
      // Use existing brand colors, keep it simple

  STEP 2 — Verify
    RUN  npm run lint
    RUN  npm run build

  OUTPUT: email template function exists, build passes

## Phase 1 — Notification Logic + Preferences (PARALLEL)

PARALLEL [
  AGENT: notification-service
    READ  src/core/plugins/mailer.ts
    READ  src/notifications/email-templates.ts  // from Phase 0

    CREATE src/notifications/notification.service.ts
      // notifyStatusChange(project, oldStatus, newStatus)
      // Looks up project members
      // Filters by preferences (Phase 1 agent 2)
      // Sends email via mailer plugin

  AGENT: notification-preferences
    READ  prisma/schema.prisma

    STEP 1 — Add preferences to schema
      EDIT prisma/schema.prisma
        // NotificationPreference model
        // userId, channel ("email"), event ("status_change"), enabled

    STEP 2 — Generate migration
      RUN  npx prisma migrate dev --name add-notification-preferences

    CREATE src/notifications/notification.preferences.ts
      // getPreferences(userId): { statusChange: boolean, ... }
      // updatePreferences(userId, prefs): void
]

## Phase 2 — Wire Into Status Updates (sequential)

AGENT: integration
  READ  src/projects/projects.controller.ts  // where status changes happen

  STEP 1 — Call notification service on status change
    EDIT src/projects/projects.controller.ts
      // After status update succeeds:
      // await notifyStatusChange(project, oldStatus, newStatus)

  STEP 2 — Lint, build, test
    RUN  npm run lint
    RUN  npm run build

  OUTPUT: status changes trigger email notifications
```

## Tips

**Keep phases small.** If a phase has more than 5 steps, split it. Agents work better with focused tasks.

**Be explicit about file conflicts.** If two parallel agents might edit the same file, either:
- Give them separate namespaces (e.g. different key prefixes in a translation file)
- Make one sequential instead
- Have Phase N+1 merge the results

**Always end agents with verify steps.** `npm run lint` and `npm run build` catch problems before they cascade.

**Tell agents what to read, not just what to write.** An agent that reads the guidelines produces better code than one that guesses.

**The algorithm is a conversation starter.** Write it, review it with Claude, adjust it, then execute. It's cheaper to fix a plan than to fix code.

## How to Execute

Once the algorithm is ready, tell Claude Code:

```
run Phase 0 of todo/my-algorithm.md
```

When it completes:

```
run Phase 1 (parallel agents)
```

Claude Code will launch the agents and report back when done. Review the output, then continue to the next phase.
