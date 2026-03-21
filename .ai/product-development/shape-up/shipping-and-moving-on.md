# Shipping and Moving On: When to Stop, QA, and Staying Debt-Free

Shipping on time means shipping something imperfect. The question isn't "Is it perfect?" but "Is it better than what customers have now?" Compare down to the baseline, not up to the ideal. Then move on cleanly — don't let the launch pull you into unplanned follow-up work.

---

## Compare to Baseline

### DO: Shift the point of comparison downward

Instead of comparing against an ideal perfect design, compare against the current reality for customers. How do they solve this problem today? What's the frustrating workaround this feature eliminates?

This is the difference between "never good enough" and "better than what they have now." You can say: "This isn't perfect, but it works and customers will feel it's a big improvement."

### DON'T: Aim for the ideal

If you aim for perfection, you'll never ship. Designers and programmers want to do their best work on every detail, regardless of importance. Direct that pride at the right target: meaningful improvement over the baseline, not theoretical perfection.

---

## Limits Motivate Trade-Offs

The one-week bet with a circuit breaker forces trade-offs. When somebody says "wouldn't it be better if…" or finds another edge case, the first question is: **Is there time for this?** Without a deadline, you could delay the project for changes that don't deserve the extra time.

### DO: Expect teams to actively question scope

Teams should question any new work that comes up before accepting it as necessary. We create our own work — we should be critical of it.

### DON'T: Cram and push to finish everything

The answer to time pressure is cutting scope, not working longer. Variable scope is the release valve.

---

## QA is for the Edges

### DO: Have designers and programmers own basic quality

Programmers write their own tests. The team ensures the project does what it should according to the shaped concept. QA is a level-up, not a gate.

### DO: Bring QA in toward the end of the cycle

QA limits attention to edge cases outside the core functionality. They hunt for things the team might have missed — not re-verifying the core.

### DO: Treat QA issues as nice-to-haves by default

The team triages QA-discovered issues and elevates some to must-haves based on severity and available time. Collect QA issues on a separate to-do list, then drag must-haves into relevant scopes.

### Code review: same approach

No formal checkpoint that blocks shipping. If there's time and it makes sense, someone senior looks at the code. It's a teaching opportunity, not a process gate.

---

## When to Extend a Project

Extensions are very rare. Both conditions must be met:

1. **Outstanding tasks are true must-haves** — they withstood every attempt at scope hammering
2. **All outstanding work is downhill** — no unsolved problems, no open questions

Any uphill work at the end points to a shaping oversight or a hole in the concept. Unknowns are too risky to bet more time on — put the project back in shaping.

The two-day cool-down usually provides enough slack. But running into cool-down regularly is a signal of a shaping or performance problem.

---

## Move On

### DO: Let the storm pass after shipping

Feature releases beget feature requests. Bugs pop up. Suggestions pour in. A small minority may overreact to changes. Stay cool, give it a few days, allow it to die down. Remember why you made the change and who it's helping.

### DO: Stay debt-free

Don't commit to making changes in response to post-ship feedback. "No" doesn't prevent you from contemplating and shaping those ideas later. "Yes" takes away future freedom — it's like taking on debt.

The thing you just shipped was a one-week bet. If this part of the product needs more time, it requires a new bet. Let the requests compete at the next betting table.

### DO: Shape feedback before acting on it

Raw ideas from customer feedback aren't actionable yet. They need shaping — they're the raw inputs for Step 1 (Set Boundaries). Shape on the next cycle's shaping track while the team builds something else. Then pitch the shaped version at the betting table.

---

## The Cycle Cadence

| Period | Duration | Purpose |
|---|---|---|
| **Build cycle** | 1 week | Uninterrupted work on shaped projects |
| **Cool-down** | 2 days | No scheduled work. Fix bugs, explore ideas, hold betting table, plan next cycle |

During cool-down, programmers and designers work on whatever they want. After a week of focused building, this time under their own control is essential for morale, bug fixing, and exploration.

---

## Three Bug Strategies

1. **Use cool-down** — two days every week adds up to a lot of bug-fixing time
2. **Bring it to the betting table** — shape the fix as a pitch, make a deliberate decision about spending time on it
3. **Schedule a bug smash** — once a year (usually around holidays), dedicate a whole cycle to bugs

### DON'T: Treat bugs as automatically more important than everything else

There is nothing special about bugs that gives them priority. The vast majority can wait a week or longer. If it's a true crisis (data loss, app down, huge customer impact), drop everything. But true crises are very rare. "You can't ship anything new if you have to fix the whole world first."
