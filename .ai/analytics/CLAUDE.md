# Analytics Guidelines

This project follows **Lean Analytics** principles (Croll & Yoskovitz). Data exists to build a better product faster — not to fill dashboards.

> Detailed references (read when implementing tracking or reviewing metrics):
> - [lean-analytics-stages.md](lean-analytics-stages.md) — Stage definitions, thresholds, progression criteria, levers to pull
> - [event-taxonomy.md](event-taxonomy.md) — Standard event naming, categories, properties, AARRR funnel mapping
> - [metrics-reference.md](metrics-reference.md) — Metric formulas, benchmarks, query patterns, weekly review template

---

## One Metric That Matters (OMTM)

At any given stage, pick **one metric** that reflects your current challenge. Everything else is context — the OMTM drives decisions.

### DO: Pick a metric with a threshold, not just a number
```
OMTM: weekly active projects = 23 (target: 50 by end of month)
→ Action: improve onboarding to first project creation
```

### DON'T: Use vanity metrics as your OMTM
```
// WRONG — these only go up, they don't tell you if things are working
- Total registered users, total page views, cumulative revenue

// CORRECT — rates and ratios that can go up OR down
- Engagement rate, growth rate, ARPU, churn rate
```

---

## Lean Analytics Stages

Move through stages sequentially. **Don't skip ahead.** See [lean-analytics-stages.md](lean-analytics-stages.md) for full benchmarks and levers.

```
Empathy    → Do people have the problem?
Stickiness → Do users come back?
Virality   → Do users tell others?
Revenue    → Can you monetize?
Scale      → Can you grow efficiently?
```

### DON'T: Optimize out of order
```
// WRONG — users aren't coming back, but you're A/B testing pricing
// WRONG — adding "invite a friend" when users churn after day 3

// CORRECT — fix retention before monetization, fix stickiness before virality
```

---

## Event Tracking

See [event-taxonomy.md](event-taxonomy.md) for the full standard event list and property conventions.

### DO: Use `[entity].[action]` naming — every event answers a business question
```
user.signup       → "Are we acquiring users?"
user.return_visit → "Are they coming back?"
payment.completed → "Are they paying?"
feature.used      → "Are they finding value in X?"
```

### DON'T: Track clicks without a hypothesis or build a full analytics stack too early
```
// WRONG — tracking for tracking's sake
button.clicked { button: "save" }

// WRONG for early-stage:
Setting up Segment + Amplitude + Mixpanel + Google Analytics

// CORRECT:
Postgres queries against your Prisma models + weekly OMTM review
```

---

## Key Anti-Patterns

- **Don't add features when retention is flat** — the core value isn't landing; fix onboarding or talk to users
- **Don't optimize what you can't measure** — "improve UX" → "reduce time-to-first-value from 10 min to 3 min"
- **Don't confuse correlation with causation** — test whether prompting an action changes outcomes, don't just force it
- **Don't ignore segmentation** — "churn is 8%" hides that solo users churn 15% while teams churn 4%
- **Don't report numbers without context** — always compare to baseline or previous period
