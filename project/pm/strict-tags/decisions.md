# Decisions: strict-tags

## Go to Gate 1
**Date:** 16. 11. 26
**Context:** The from-scratch gate chose Strict Tags; the PRD (draft 3) proposes three bets, each ending at a gate that can close the scope.
**Decision:** Go to Gate 1: five days, 1a four days at $0, 1b one day at up to $10 of sessions. Nothing past Gate 1 is committed.
**Reasoning:** 24 of 34 mistake kinds rejected before run against fluent-html 8's 13, and 31% fewer turns, with the costs still unearned named in the PRD.
**Consequences:** On a miss the scope is archived `Outcome: killed` and harvest row 20 takes its place.

## A package of its own, in a repository of its own
**Date:** 16. 11. 26
**Context:** 29 apps and the template follow fluent-html's default branch, so a breaking change there reaches them unasked.
**Decision:** Strict Tags is its own package in its own repository, working name `strict-tags`; apps pin it to tags. fluent-html 8 stays as it is.
**Reasoning:** Nothing breaks for an app whose owner did not ask.
**Consequences:** Gate 1a starts in a local repository at `~/jt-digital/strict-tags`; the remote and its CI runner (needed for S5) are created with Tony's go-ahead.

## The cost caps: +20% tokens, +15% cost, twice the check time
**Date:** 16. 11. 26
**Context:** The verdict accepted that a rewrite costs more per session than the harvest; the PRD asked how much more.
**Decision:** Output tokens at most 20% and cost at most 15% above the neutral floor's means; check time at most twice fluent-html 8's at 2,000 elements and at everyframe-composer's size; route tables at most 1.25 times fluent-html 8's 2,000-element check.
**Reasoning:** Today's 17.9% and 12.3% sit inside the caps, with room for the work Gate 1 adds.
**Consequences:** S5 is read on a CI runner, twice, the larger ratio counting.

## everyframe-composer stays on fluent-html 8; its Cut editor is the trial
**Date:** 16. 11. 26
**Context:** 272 of its mutations answer a fragment, 21 of them in Cut.
**Decision:** The app stays on fluent-html 8. Cut's full-layout answer is timed on fluent-html 8 first (press to settled DOM within 100 ms at the 95th percentile); on a pass Cut moves and the rest follows, on a miss the house rule is not claimed for editors.
**Reasoning:** The full-layout rule is the house default; an editor is where it is least proven.
**Consequences:** The timing runs after fl-um is priced, against the line set here.

## The checks guard against mistakes, not crafted inputs
**Date:** 16. 11. 26
**Context:** Gate 1a's class surface (c2) stopped after five fix rounds. Its reviewers were blocking on inputs nobody writes by accident: `attr()` smuggled into a gradient's arbitrary value, `-webkit-link` inside a hand-written `-webkit-box-shadow`, a colour hidden between CSS comments. One blocker was real: the grammar accepted any dash prefix, so `items-[center]` compiled to no CSS.
**Decision:** The rule the stack-dsl lanes adopted the same day applies here. A finding blocks only when the program that slips through is one an agent or a developer would plausibly write without trying to get around the check. Crafted inputs are follow-ups, collected in the package's out-of-scope table. c2 gets five fresh rounds under the rule; chunk 1's results stand.
**Reasoning:** The kill reads mistake kinds rejected before run. An adversarial reading of CSS's arbitrary-value grammar has no end and held c2 for five rounds.
**Consequences:** Strict Tags claims "mistakes", never "cannot be bypassed". The out-of-scope table ships with the package.
