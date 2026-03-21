# Team Autonomy: How Teams Self-Organize During Build

Give full responsibility to a small integrated team of designers and programmers. They define their own tasks, make adjustments to scope, and work together to build vertical slices one at a time. This is the opposite of managers chopping up work and programmers acting as ticket-takers.

---

## Assign Projects, Not Tasks

### DO: Trust the team with the whole project

Hand the team the shaped concept and let them define their own tasks and approach. They have full autonomy to execute the pitch as best they can using their judgement.

### DON'T: Split the project into tasks for others to execute

Splitting the project into tasks up front is like putting the pitch through a paper shredder. Everybody gets disconnected pieces and nobody sees the bigger picture.

> **Scoping note:** `project/pm/` todo.md records tasks *discovered during the build*, not pre-assigned work. The PM system records progress as the team works — it doesn't prescribe a plan.

### DON'T: Play "taskmaster" or "architect"

Nobody should be the one who breaks work into pieces for others. The team is in the best position to see trade-offs, spot missing pieces, and make adjustments as they discover the real work.

When teams are assigned individual tasks, each person executes their piece without feeling responsible for how all the pieces fit together. Planning up front makes you blind to the reality along the way.

---

## The Virtuous Circle

When teams are more autonomous, senior people spend less time managing them. With less management time, senior people shape better projects. When projects are better shaped, teams have clearer boundaries and work more autonomously.

---

## Getting Oriented

### DO: Respect the first few hours of "radio silence"

Work doesn't look like "work" at first. No tasks checked off, nothing deployed, no deliverables. Each person has their head down figuring out how the existing system works and which starting point is best.

### DON'T: Interfere or ask for status too early

Asking for visible progress pushes exploration underground. It's better to let the team say "I'm still figuring out how to start" than to force them to hide this legitimate work.

### DO: Step in after half a day of silence

If the silence doesn't break after half a day, that's a reasonable time to check what's going on.

---

## Imagined vs. Discovered Tasks

Teams naturally start with **imagined tasks** — what they assume they'll need to do by thinking about the problem. Then, as they get their hands dirty, they discover **discovered tasks** — the unexpected details that make up the true bulk of the project.

### DO: Expect the real task list to emerge from doing real work

A designer adds a button on desktop, then notices there's no obvious place for it on mobile. A programmer looks at a model and spots a method that needs updating for a different part of the project. These discovered tasks are where the hardest challenges lie.

### DON'T: Expect the initial task list to be complete

The way to figure out what needs to be done is to start doing real work — picking something meaningful, central, and small enough to be done end-to-end in a few hours.

---

## Done Means Deployed

### DO: Ship within the cycle

The project needs to be done and deployed before the cycle ends. Testing and QA happen within the cycle. The team accommodates this by scoping off essential aspects first, finishing them early, and coordinating with QA.

### DO: Handle announcements and docs during cool-down

Help documentation, marketing updates, and announcements don't need to happen within the cycle. They're thin-tailed from a risk perspective (they never take 5x as long as expected).

---

## Team Composition

Standard teams for a one-week cycle:

| Team type | Composition | Work style |
|---|---|---|
| **Big Batch** | 1 designer + 1-2 programmers | One project for the full cycle |
| **Small Batch** | 1 designer + 1-2 programmers | Multiple 1-2 day projects in one cycle |

A QA person joins toward the end of the cycle for integration testing. Small batch teams self-organize how to juggle their projects — all must ship before cycle ends.

---

## Kick-Off

1. Create a project space and add the team
2. Post the shaped concept (original pitch or distilled version)
3. Arrange a kick-off call to walk through the shaped work
4. Team asks important questions, then gets started with a rough understanding

The kick-off isn't a planning session for tasks. It's just enough to orient the team so they can begin exploring and discovering the real work.
