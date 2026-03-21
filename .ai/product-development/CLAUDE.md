# Product Development Guidelines

Precedence: [Brand Book](../brand-book/CLAUDE.md) overrides Refactoring UI on concrete choices (fonts, colors, components, spacing, shadows). Deep-dive files in `lean-startup/`, `shape-up/`, `refactoring-ui/`.

## Lean Startup — validate before you build

- **DON'T** build without a hypothesis. Every feature is an experiment: hypothesis → metric → baseline → target → result → decision.
- **DO** validate the problem before the solution. Gate order: (1) do customers have this problem? → (2) would they pay? → (3) would they buy from us? → (4) can we build it? Don't start at 4.
- **DO** run Build-Measure-Learn loops in 1–3 days. If a cycle takes longer, the experiment scope is too large.
- **DO** test value before growth. Growth without retention fills a leaky bucket.
- **DON'T** count "launched" as success. Success = measured outcome against a pre-defined target.
- **DO** match MVP type to your riskiest assumption:

| Riskiest assumption | MVP type | Time to signal |
|---|---|---|
| Nobody wants this | Smoke test (landing page, fake door) | 1–3 days |
| Solution doesn't actually solve it | Concierge (deliver value manually, 3–5 customers) | 1–2 weeks |
| Users won't understand or use it | Wizard of Oz (real UI, human behind the scenes) | 1–2 weeks |
| Core feature doesn't deliver value | Single-feature (one thing, end-to-end, production quality) | 1 week |

- **DON'T** add "just one more feature" before testing the core hypothesis. The second feature waits until the first proves value.
- **DON'T** use MVP as an excuse for low quality. Minimum viable ≠ minimum effort.
- **DO** force a pivot-or-persevere decision after every experiment. Three outcomes: persevere (hit target), pivot (missed but learned — change one assumption), kill (no signal or third consecutive miss).
- **DON'T** let "almost there" delay the decision. Two misses on the same hypothesis with different execution = pivot.

## Shape Up — fixed time, variable scope

- **DO** set the appetite (time budget) before designing the solution. A 1-week appetite produces a different solution than a 2-day appetite. Both can be good.
- **DON'T** estimate first then try to fit the schedule. Fixed scope + variable time = projects that drag.
- **DO** shape work to be rough (room for team creativity), solved (main elements connected), and bounded (what's out of scope is explicit).
- **DON'T** start with wireframes or high-fidelity mockups. Over-specifying leaves no room for trade-offs.
- **DON'T** accept grab-bags as projects. "Redesign the Files section" is not a project. "Sharing multiple files takes too many steps" is.
- **DO** integrate one vertical slice first — real UI + real code — on day one. Pick something core, small, and novel. Don't build disconnected parts hoping they assemble later.
- **DO** cut scope when time is tight, don't extend time. Variable scope is the release valve.
- **DO** push the scariest work uphill first. If you start with the easy work, the hard problems surprise you at the end.
- **DO** compare to baseline ("better than what customers have now"), not to the ideal. Perfection prevents shipping.
- **DON'T** maintain a centralized backlog. Important ideas come back. todo.md tracks committed scope for the current cycle only — see [Project Management](../project-management/CLAUDE.md).
- **DO** treat QA issues as nice-to-haves by default. Elevate to must-haves based on severity and remaining time.
- **DO** ship within the cycle. Done means deployed, not "code complete."

## Small Batches — optimize for learning speed

- **DO** break every bet into deployable slices. A 1-week bet should ship to real users 2–3 times during the week, not once at the end.
- **DON'T** batch up features for a "big launch." If feature A fails, features B–F built on that assumption are wasted.
- **DO** build, deploy, and measure one scope before starting the next. Sequential delivery of small batches beats parallel delivery of large batches.
- **DON'T** wait until "it's ready" to deploy. If the core hypothesis can be tested with what you have now, deploy now.

## Refactoring UI — systematize design choices

- **DO** start with features, not layouts. The shell (nav, sidebar) emerges from the features, not the other way around.
- **DO** define constrained systems (type scale, spacing scale, color palette, shadows) before designing. You do the hard work once; every future decision is fast.
- **DO** design in grayscale first — forces hierarchy through spacing and contrast, not decoration.
- **DO** use color and weight for hierarchy, not just size. Dark for primary, grey for secondary, lighter grey for tertiary. Two font weights (400/500 + 600/700) are enough.
- **DO** de-emphasize competing elements instead of inflating the primary. Soften what's secondary.
- **DON'T** default to "Label: Value" format. Let context speak: "3 bedrooms" not "Bedrooms: 3". When labels are needed, de-emphasize them.
- **DO** design buttons by action hierarchy: primary (solid), secondary (outline), tertiary (link-styled). Don't make destructive actions big and red unless they're the primary action on a confirmation step.
- **DO** design → build → iterate → next feature. Don't design every feature upfront — edge cases are impossible to anticipate in the abstract.
