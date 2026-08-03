# Betting and Prioritization: Choosing What to Build Next

Backlogs are a big weight you don't need to carry. Instead of grooming a growing pile of old ideas, hold a focused betting table before each cycle with just a few well-shaped options. If a pitch doesn't get picked, let it go — truly important ideas will come back.

---

## No Backlogs

### DON'T: Maintain a centralized backlog

Dozens and eventually hundreds of tasks pile up that you'll never have time for. The growing pile gives a feeling of always being behind. Time spent reviewing, grooming, and organizing old ideas prevents moving forward on what matters right now.

> **Scoping note:** `project/pm/` todo.md files are *not* backlogs — they track committed scope for the current cycle only. Uncommitted ideas stay in pitches and conversations, never in todo.md.

### DO: Use decentralized lists

Each department tracks what matters to them, in their own way:
- Support keeps a list of common requests and issues
- Product tracks ideas they hope to shape in a future cycle
- Programmers maintain a list of bugs they'd like to fix

None of these are direct inputs to the betting process. Regular one-on-ones between departments cross-pollinate ideas.

### DO: Trust that important ideas come back

Ideas are cheap. They come up all the time. Really important ones resurface — you won't forget a truly great, inspiring idea. If you hear about a problem once and never again, maybe it wasn't really a problem. If it keeps coming up, you'll be motivated to shape a solution.

---

## The Betting Table

### Meeting structure

| Aspect | Detail |
|---|---|
| **When** | During the two-day cool-down between cycles |
| **Who** | CEO, CTO, senior programmer, product strategist — keep headcount low |
| **Duration** | Rarely longer than 1-2 hours |
| **Input** | A few well-shaped pitches from the last week (or purposefully revived ones) |
| **Output** | Cycle plan — which projects, which teams |
| **Authority** | Highest people present, no "step two" to validate, nobody can interfere afterward |

### DO: Study pitches in advance

Everyone reads the pitches on their own time before the meeting. Ad-hoc one-on-one conversations in the weeks before establish context. The meeting is for making decisions, not for reading.

### DON'T: Do design work at the betting table

If you catch yourselves spending too much time in the weeds, remind yourselves: "We're not doing design here." Move back up to the high level.

---

## The Meaning of a Bet

Three properties distinguish a bet from a plan:

1. **Bets have a payout**: Something meaningful finished at the end — not incremental progress or a partially filled time box.
2. **Bets are commitments**: The team gets the full week with no interruptions. Don't optimize every hour — look at the bigger movement of progress.
3. **Smart bets have a cap on the downside**: The most you can lose is one week. No open-ended commitments.

---

## Questions to Ask at the Betting Table

### Does the problem matter?

Always separate problem and solution. The solution doesn't matter if the problem isn't worth solving. Weigh problems against each other — is *this* problem more important than *that* problem right now?

### Is the appetite right?

If a stakeholder isn't interested in spending a full week, probe further:
- Maybe the problem wasn't articulated well enough
- Maybe the objection is really about the solution or technical approach ("How would you feel if we could do it in two days?" can uncover this)
- The shaper might go back and shape a smaller version or do more research
- Or simply let it go if interest is too low

### Is the solution attractive?

Interface elements have invisible costs — giving up real estate. A button on the home page might solve the problem, but that space is valuable for the future. Are you selling it too cheaply?

### Is this the right time?

Consider the rhythm and balance of recent work:
- Too long since a news-worthy new feature?
- Too many new features, need to fix long-standing customer requests?
- Teams doing same kind of work for multiple cycles — morale dip?

### Are the right people available?

Match expertise to project needs. Consider what kind of work each person has been doing (someone on a long string of small batch might prefer big batch). Account for vacations and availability.

---

## Keep the Slate Clean

### DO: Only bet one cycle at a time

Never carry scraps of old work into the next cycle without reshaping. Each week you learn what's working and what isn't. Keeping options open has massive upside.

### DO: Shape specific one-week targets even for multi-cycle features

Reduce risk by ensuring something fully built and working exists at the end of each week. If that goes well, bet the next week. If not, change course.

### DON'T: Make commitments beyond the current cycle

Even with a road map in your head, keep it informal. No downside to keeping options open, massive upside from being able to act on the unexpected.

---

## New Product Phases

When building a new product from scratch, the expectations change across three phases:

### R&D Mode (earliest stages)
- Shaping is fuzzy — learn by building
- Senior people on the team (CEO, CTO, senior designer) — can't delegate when you don't know what you want
- Spike, don't ship — aim for UI and code that serves as foundation
- Commit one cycle at a time — might learn the idea isn't ready

### Production Mode (architecture settled)
- Standard Shape Up process with clear shaping, betting, building
- Can bring in other teams to contribute
- Ship means merge to main, expect not to touch it again
- Option to remove features from final cut before launch

### Cleanup Mode (final phase before launch)
- No shaping, no team boundaries — free-for-all
- Must-haves only — check yourself against cold feet
- Ship continuously in small bites
- Max two cycles — discipline matters
- Make "final cut" decisions: smaller V1 = fewer questions, less to support
