# Product Development Guidelines

Actionable rules for deciding what to build, how to scope and ship it, and how to design it. Each guideline follows a consistent DO/DON'T format with concrete thresholds and embedded templates.

## How to Use These Guidelines

When making product decisions, consult in this order:

1. **lean-startup/** — Should we build it? (validate the problem and hypothesis first)
2. **shape-up/** — How do we scope and ship it? (time-box, shape, bet, build, ship)
3. **refactoring-ui/** — How do we design it? (visual hierarchy, systems, polish)

To find all files relevant to a specific concept, use the cross-cutting index at the bottom of this document.

---

## Lean Startup

Philosophy foundation — every product decision is an experiment.

1. [Lean Startup Manifesto](lean-startup/lean-startup-manifesto.md) — Build-Measure-Learn loop, value vs. waste, validated learning, experiment design
2. [MVP Types](lean-startup/mvp-types.md) — Smoke test, concierge, wizard of oz, single-feature: pick the MVP that tests your riskiest assumption
3. [Pivot or Persevere](lean-startup/pivot-or-persevere.md) — Pivot taxonomy, decision triggers, the pivot meeting
4. [Small Batches](lean-startup/small-batches.md) — Optimize for learning speed, deployable slices, the envelope-stuffing principle

---

## Shape Up

Process — how we scope, bet on, build, and ship work in 1-week cycles.

1. [Shaping Process](shape-up/shaping-process.md) — How to define work before building: rough, solved, bounded
2. [Appetite and Boundaries](shape-up/appetite-and-boundaries.md) — Fixed time, variable scope: set the budget before designing the solution
3. [Betting and Prioritization](shape-up/betting-and-prioritization.md) — No backlogs, focused betting table, cycle commitments
4. [Team Autonomy](shape-up/team-autonomy.md) — Assign projects not tasks, let teams self-organize
5. [Scope Management](shape-up/scope-management.md) — Integrate one slice first, map scopes, scope hammering
6. [Risk Management](shape-up/risk-management.md) — De-risking, rabbit holes, circuit breakers
7. [Progress Tracking](shape-up/progress-tracking.md) — Hill charts, uphill/downhill, solving in the right sequence
8. [Shipping and Moving On](shape-up/shipping-and-moving-on.md) — Compare to baseline, QA at the edges, stay debt-free

---

## Refactoring UI

Design system — how interfaces should look and feel.

1. [Design Process](refactoring-ui/design-process.md) — Start with features not layouts, systematize everything, work in cycles
2. [Visual Hierarchy](refactoring-ui/visual-hierarchy.md) — Color and weight over size, de-emphasize to emphasize, action hierarchy
3. [Typography](refactoring-ui/typography.md) — Hand-crafted type scale, font selection, line height, letter-spacing
4. [Color System](refactoring-ui/color-system.md) — HSL palette, shade definition, accessibility, warm/cool greys
5. [Spacing and Layout](refactoring-ui/spacing-and-layout.md) — Start with too much space, spacing scale, avoid ambiguous spacing
6. [Depth and Shadows](refactoring-ui/depth-and-shadows.md) — Light source, elevation system, two-part shadows
7. [Images and Content](refactoring-ui/images-and-content.md) — Text over images, respect sizes, handle user content
8. [Polish and Details](refactoring-ui/polish-and-details.md) — Supercharge defaults, accent borders, fewer borders, empty states

---

## Cross-Cutting Concept Index

Concepts that span multiple files — look up the relevant file for the aspect you need.

| Concept | Definition | Usage / Application |
|---|---|---|
| **Appetite** | [appetite-and-boundaries.md](shape-up/appetite-and-boundaries.md) | [shaping-process.md](shape-up/shaping-process.md) (Step 1), [betting-and-prioritization.md](shape-up/betting-and-prioritization.md) (evaluation) |
| **Circuit breaker** | [risk-management.md](shape-up/risk-management.md) | [shipping-and-moving-on.md](shape-up/shipping-and-moving-on.md) (trade-offs), [betting-and-prioritization.md](shape-up/betting-and-prioritization.md) (downside cap) |
| **Scopes** | [scope-management.md](shape-up/scope-management.md) | [progress-tracking.md](shape-up/progress-tracking.md) (hill charts), [team-autonomy.md](shape-up/team-autonomy.md) (team organization) |
| **Cycle cadence** | [shipping-and-moving-on.md](shape-up/shipping-and-moving-on.md) | [betting-and-prioritization.md](shape-up/betting-and-prioritization.md) (cool-down timing), [team-autonomy.md](shape-up/team-autonomy.md) (deployment) |
| **When to extend** | [shipping-and-moving-on.md](shape-up/shipping-and-moving-on.md) | [risk-management.md](shape-up/risk-management.md) (cross-reference) |
| **Systematize / constraints** | [design-process.md](refactoring-ui/design-process.md) | [spacing-and-layout.md](refactoring-ui/spacing-and-layout.md) (spacing scale), [typography.md](refactoring-ui/typography.md) (type scale), [color-system.md](refactoring-ui/color-system.md) (palette) |
| **Experimentation** | [lean-startup-manifesto.md](lean-startup/lean-startup-manifesto.md) | [design-process.md](refactoring-ui/design-process.md) (work in cycles, iterate), [mvp-types.md](lean-startup/mvp-types.md) (experiment vehicles) |
| **Vertical integration** | [scope-management.md](shape-up/scope-management.md) (integrate one slice) | [team-autonomy.md](shape-up/team-autonomy.md) (vertical slices), [small-batches.md](lean-startup/small-batches.md) (deployable slices) |
| **Compare to baseline** | [shipping-and-moving-on.md](shape-up/shipping-and-moving-on.md) | [lean-startup-manifesto.md](lean-startup/lean-startup-manifesto.md) (experiment exit criteria), [pivot-or-persevere.md](lean-startup/pivot-or-persevere.md) (decision criteria) |
| **MVP** | [mvp-types.md](lean-startup/mvp-types.md) | [lean-startup-manifesto.md](lean-startup/lean-startup-manifesto.md) (experiment design), [shaping-process.md](shape-up/shaping-process.md) (thin-tail solution) |
| **Pivot** | [pivot-or-persevere.md](lean-startup/pivot-or-persevere.md) | [lean-startup-manifesto.md](lean-startup/lean-startup-manifesto.md) (validated learning), [betting-and-prioritization.md](shape-up/betting-and-prioritization.md) (re-evaluate bets) |
| **Batch size** | [small-batches.md](lean-startup/small-batches.md) | [scope-management.md](shape-up/scope-management.md) (scope hammering), [appetite-and-boundaries.md](shape-up/appetite-and-boundaries.md) (appetite as cap) |
