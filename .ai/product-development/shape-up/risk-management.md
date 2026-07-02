# Risk Management: De-Risking, Rabbit Holes, and Circuit Breakers

At every step of the process we target one specific risk: the risk of not shipping on time. One unanticipated problem that takes two days to solve burns nearly half the budget. We reduce risk in shaping by solving open questions, in planning by capping bets to one week, and in building by integrating early.

---

## Risk Profiles

Well-shaped work has a **thin-tailed** probability distribution: slight chance it takes an extra day, but no reason it should drag on longer. The elements are defined and familiar enough.

Poorly shaped work has a **heavy right tail**: technical unknowns, unsolved design problems, or misunderstood interdependencies can make the project take multiples of the original appetite.

### DO: Aim for independent, well-understood parts that assemble in known ways

This is what a thin tail looks like — each piece is clear, the connections are known, and there are no hidden dependencies.

### DON'T: Hand off a project with tangled interdependencies

It's not responsible to give the team a tangled knot of problems and ask them to untangle it under deadline.

---

## Finding Rabbit Holes

After roughing out the elements, slow down and look critically at the concept.

### DO: Walk through use cases in slow motion

Given the solution you sketched, how exactly would a user get from start to end? Slowing down reveals gaps and missing pieces.

### Questions to ask about each part of the solution

- Does this require **new technical work** we've never done before?
- Are we making **assumptions** about how parts fit together?
- Are we assuming a **design solution exists** that we couldn't come up with ourselves?
- Is there a **hard decision** we should settle in advance so it doesn't trip up the team?

---

## Patching Holes

When you find a rabbit hole, patch it during shaping — don't push deep design problems down to the team.

### DO: Dictate solutions for risky areas

If a particular area has complicated implications (UX, navigation, performance), decide on a specific approach during shaping. Trade-offs are difficult to make under cycle pressure. Designers could reasonably chase a dead end for days. As shapers, think less about the ultimate design and more about basic quality and risk.

### DO: Declare out of bounds

Explicitly mark cases you're not supporting. Even though everyone wants to cover every use case, it keeps the project well within the appetite. Call out specific functionality or platforms that are excluded.

### DO: Cut back

Flag things you got excited about during sketching that aren't really necessary. Mention them as nice-to-haves, but start from the assumption the feature is valuable without them.

---

## Consulting Technical Experts

### DO: Present before writing the pitch

Walk technical experts through the idea on a whiteboard. Redraw the elements from the beginning to build up the concept fresh.

### DO: Frame it correctly

- "Here's something I'm thinking about… but I'm not ready to show anybody yet… what do you think?"
- Ask "Is X possible **in 1 week**?" not "Is X possible?" — in software, everything is possible but nothing is free
- Emphasize you're hunting for time bombs that could blow up the project
- Keep the clay wet — invite revisions after covering your concept

### DON'T: Create a slideshow or formal document for this stage

Stay informal. You want a conversation that might reshape the concept, not a presentation that locks it in.

---

## The Circuit Breaker

Teams must ship within the amount of time that was bet. If they don't finish, the project doesn't get an extension by default.

### Why the circuit breaker works

1. **Eliminates runaway projects** — if a project was only worth 1 week, it's foolish to spend 2x, 3x, or 10x that
2. **Forces better shaping** — if a project doesn't finish, something was wrong in the shaping; reframe the problem instead of investing more in a bad approach
3. **Motivates ownership** — teams regularly question how their decisions affect scope because there's a real consequence of not shipping

### DO: Honor the bet — no interruptions

Don't pull the team away for "just a few hours." Momentum is second-order — you can't describe it with one point. Losing the wrong hour can kill a day. Losing a day can kill a week.

### DO: Wait for the next cycle for new requests

The maximum wait is one week. If the new thing is still the most important thing, bet on it next cycle. Only bet one cycle ahead to keep options open.

### DON'T: Let true crises be an excuse for constant interruption

True crises are very rare. Data loss, app grinding to a halt, or a huge swath of customers seeing the wrong thing — that's a crisis. Most other things can wait.

---

## When to Extend (Rare)

→ See [shipping-and-moving-on.md](shipping-and-moving-on.md#when-to-extend-a-project) for the full extension criteria. In short: both conditions must be true — outstanding tasks are true must-haves, and all remaining work is downhill.

The two-day cool-down usually provides enough slack for a team with a few too many must-haves. But this shouldn't become a habit — it points back to a shaping or performance problem.
