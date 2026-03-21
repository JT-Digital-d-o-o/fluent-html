# Analytics Guidelines

This project follows **Lean Analytics** principles (Croll & Yoskovitz). Data exists to build a better product faster — not to fill dashboards.

> Detailed references:
> - [lean-analytics-stages.md](lean-analytics-stages.md) — Stage definitions, thresholds, progression criteria
> - [event-taxonomy.md](event-taxonomy.md) — Standard event naming, categories, properties
> - [metrics-reference.md](metrics-reference.md) — Metric formulas, benchmarks, query patterns

---

## One Metric That Matters (OMTM)

At any given stage, pick **one metric** that reflects your current challenge. Everything else is context — the OMTM drives decisions.

### DO: Pick a metric that reflects the current stage
```
Stage: Stickiness
OMTM: Weekly returning users (users who visit 2+ times in 7 days)
Threshold: 40% of signups return within 14 days

Stage: Revenue
OMTM: Trial-to-paid conversion rate
Threshold: >5% of free users convert within 30 days
```

### DO: Draw a line in the sand — define what "good enough" looks like
```
"If 40% of trial orgs don't create a second project within 14 days,
 I have a stickiness problem."

"If weekly active users grow <5% week-over-week,
 virality isn't working yet."
```

### DON'T: Track everything and decide later
```
// WRONG — no focus, no action threshold
Dashboard with: total users, page views, bounce rate, session duration,
  signups, logins, button clicks, scroll depth, API calls...

// CORRECT — one number, one threshold, one action
OMTM: weekly active projects = 23 (target: 50 by end of month)
→ Action: improve onboarding to first project creation
```

### DON'T: Use vanity metrics as your OMTM
```
// WRONG — these only go up, they don't tell you if things are working
- Total registered users
- Total page views (all time)
- Total revenue (cumulative)

// CORRECT — rates and ratios that can go up OR down
- Weekly active users / total users (engagement rate)
- New signups this week vs. last week (growth rate)
- Revenue per user per month (ARPU)
```

---

## Lean Analytics Stages

Move through stages sequentially. **Don't skip ahead** — each stage has a problem to solve before the next one matters.

### DO: Know which stage you're in and act accordingly

**Empathy** — Do people have the problem?
```
Signals:  Interview insights, landing page conversion, waitlist signups
Methods:  User interviews, smoke tests, landing page A/B tests
Move on:  You can describe the problem in the user's words and have
          evidence that ≥10 people actively seek a solution
```

**Stickiness** — Do users come back?
```
Signals:  Retention rate, engagement frequency, core action completion
Methods:  Cohort analysis, session frequency tracking
Move on:  Retention curve flattens (users who stay past week 2 tend to stay)
```

**Virality** — Do users tell others?
```
Signals:  Referral rate, organic signup growth, viral coefficient (K-factor)
Methods:  Referral tracking, invite flow analytics
Move on:  K-factor ≥ 0.5 (each user brings in half a new user on average)
```

**Revenue** — Can you monetize?
```
Signals:  Conversion rate, ARPU, churn rate, LTV
Methods:  Pricing experiments, funnel analysis, churn surveys
Move on:  Unit economics are positive (LTV > 3× CAC)
```

**Scale** — Can you grow efficiently?
```
Signals:  CAC payback period, channel efficiency, growth rate
Methods:  Channel attribution, CAC/LTV by cohort, marginal cost analysis
Move on:  You never really "finish" this stage
```

### DON'T: Optimize revenue before you have stickiness
```
// WRONG — users aren't coming back, but you're A/B testing pricing pages
Stage: Stickiness (retention is 15% at week 2)
Work: Testing $9/mo vs $19/mo pricing

// CORRECT — fix the core loop first
Stage: Stickiness (retention is 15% at week 2)
Work: Improve onboarding → measure if retention improves
```

### DON'T: Chase virality before the product retains users
```
// WRONG — adding "invite a friend" when users churn after day 3
// You're just accelerating the leak

// CORRECT — first make the bucket hold water, then pour more in
```

---

## AARRR Funnel (Pirate Metrics)

Track the full journey: **Acquisition → Activation → Retention → Revenue → Referral**. Identify where the biggest drop-off is — that's your bottleneck.

### DO: Define each funnel stage with concrete events
```
Acquisition:    page.view (first visit)
Activation:     user.signup + first core action (e.g., creates a project)
Retention:      user.return_visit (comes back in a new session, >24h later)
Revenue:        payment.completed
Referral:       user.referral (referred user signs up)
```

### DO: Focus on the biggest drop-off in the funnel
```
Acquisition:  1,000 visitors
Activation:     120 signups (12% conversion)    ← OK
Retention:       18 return   (15% retention)    ← PROBLEM — fix this
Revenue:          5 paid     (28% of retained)  ← decent, but sample is tiny
Referral:         1 referral                    ← irrelevant until above is fixed

→ Action: 85% of signups never come back. Fix retention before anything else.
```

### DON'T: Optimize the top of the funnel when the bottom leaks
```
// WRONG — spending on ads when only 15% of signups retain
// You're paying to fill a leaky bucket

// CORRECT — fix retention first, then increase acquisition
```

---

## Metric Selection

### DO: Use rates, ratios, and time-bounded counts
```
Good metrics (actionable, comparable, ratio-based):
- Weekly active users / total users    → engagement rate
- Signups this week / last week        → growth rate
- Revenue / active users               → ARPU
- Churned users / total users          → churn rate
- Completed purchases / cart starts    → conversion rate
```

### DON'T: Use cumulative totals as primary metrics
```
Bad metrics (vanity — they only go up):
- "We have 10,000 users"         → how many are active?
- "50,000 page views"            → over what period? By how many users?
- "Revenue hit $100K"            → is it growing or flattening?
```

### DO: Compare metrics to a baseline or previous period
```
This week: 142 active users
Last week: 128 active users
→ +10.9% week-over-week — healthy growth

This week: 142 active users
Goal:      200 active users
→ 71% of target — need to accelerate
```

### DON'T: Report a number without context
```
// WRONG — "We had 350 signups" (is that good? bad? normal?)
// CORRECT — "350 signups this week, up from 280 last week (+25%)"
```

---

## Cohort Analysis

Group users by when they joined. Compare behavior across cohorts to see if product changes actually improve outcomes.

### DO: Track retention by signup cohort
```
Cohort      | Size | Week 1 | Week 2 | Week 3 | Week 4
2026-W05    |  42  |  100%  |   68%  |   45%  |   38%
2026-W06    |  38  |  100%  |   72%  |   51%  |   42%
2026-W07    |  55  |  100%  |   75%  |   54%  |    —
2026-W08    |  61  |  100%  |   78%  |    —   |    —

→ Retention is improving! Whatever changed in W06-W07 is working.
```

### DO: Use cohorts to validate product changes
```
Shipped new onboarding flow in W07.
W07 cohort: 75% week-2 retention (was 68% in W05)
→ Onboarding improvement is working — keep iterating.

Shipped pricing change in W08.
W08 cohort: trial-to-paid 8% (was 5% in W06)
→ New pricing resonates better.
```

### DON'T: Look at aggregate retention without cohort breakdown
```
// WRONG — "Overall retention is 45%"
// This hides whether retention is improving or declining over time.
// A flood of new (low-retention) users can drag down the average
// even while your product gets better for engaged users.
```

---

## Event Tracking

### DO: Track events that drive decisions
```
Good events (tied to business questions):
- user.signup          → "Are we acquiring users?"
- user.return_visit    → "Are they coming back?"
- payment.completed    → "Are they paying?"
- feature.used         → "Are they finding value in X?"

Each event should have a question it answers.
```

### DO: Use a consistent event naming convention
```
Format: [entity].[action]

page.view
user.signup
user.login
user.return_visit
payment.completed
payment.failed
subscription.created
subscription.cancelled
feature.used
```

### DON'T: Track clicks and impressions without a hypothesis
```
// WRONG — tracking for tracking's sake
server.track({ event: "button.clicked", properties: { button: "save" } })
server.track({ event: "modal.opened", properties: { modal: "settings" } })

// CORRECT — tracking tied to a question
// Question: "Do users who complete profile setup retain better?"
server.track({ event: "feature.used", properties: { feature: "profile_setup" } })
```

### DON'T: Build a full analytics stack too early
```
// WRONG for early-stage or solo/small team:
- Setting up Segment + Amplitude + Mixpanel + Google Analytics
- Building real-time dashboards before you have 100 users
- Spending a week on analytics infrastructure

// CORRECT:
- Postgres queries against your Prisma models
- A weekly manual review of your OMTM
- Lightweight tool (Plausible/PostHog) if you need more
```

---

## Qualitative Data

At small scale, qualitative data is often more actionable than metrics.

### DO: Combine numbers with conversations
```
Metric:  15% week-2 retention (bad)
Action:  Talk to 5 users who churned — ask why they stopped

Findings: 3 of 5 said "I couldn't figure out how to import my data"
→ That's your next fix. No dashboard would have told you this.
```

### DO: Use the "5 conversations" rule
```
Before building a feature: talk to 5 potential users
After a metric drops:      talk to 5 affected users
When stuck on what to do:  talk to 5 users

Five conversations won't give you statistical significance,
but they'll give you direction.
```

### DON'T: Rely only on quantitative data at small scale
```
// WRONG — "We need 1,000 data points before we can decide"
// At 50 users, you'll wait months. Just talk to people.

// CORRECT — "Retention is low. Let me email 10 churned users
// and ask what happened."
```

---

## Weekly Analytics Cadence

### DO: Set a fixed weekly review rhythm
```
Every Monday (30 minutes):
1. Check OMTM — is it moving toward the goal?
2. Review funnel — where is the biggest drop-off?
3. Compare this week's cohort to last week's
4. Decide: double down, pivot the approach, or move to next stage
5. Set one specific action for the week based on the data
```

### DO: Write down your interpretation, not just the number
```
Weekly note:
- OMTM (weekly active users): 142 (+10.9% WoW) — on track
- Funnel bottleneck: activation (12% visit-to-signup) — unchanged
- Action: test new landing page copy this week
- Hypothesis: clearer value prop will lift signup rate to 15%+
```

### DON'T: Check metrics daily without acting on them
```
// WRONG — looking at the dashboard every morning "just to see"
// Daily noise makes you reactive. Trends only emerge weekly.

// CORRECT — check once a week, make one decision, execute all week
```

---

## Common Anti-Patterns

### DON'T: Add features when retention is flat
```
// WRONG mental model:
"Users aren't coming back → we need more features"

// CORRECT mental model:
"Users aren't coming back → the core value isn't landing"
→ Fix onboarding, simplify the first experience, or talk to users
```

### DON'T: Optimize what you can't measure
```
// WRONG — "Let's improve the user experience" (unmeasurable)
// CORRECT — "Let's reduce time-to-first-value from 10 min to 3 min"
//           (measurable: track feature.used within N minutes of signup)
```

### DON'T: Confuse correlation with causation
```
// WRONG — "Users who set a profile photo have 2× retention,
//          so let's force everyone to upload a photo"
// CORRECT — "Users who set a profile photo may be more engaged
//            in general. Let's test whether prompting photo upload
//            actually changes retention, or just correlates with it."
```

### DON'T: Ignore segmentation
```
// WRONG — "Churn rate is 8%" (overall)
// CORRECT — break it down:
//   - Solo users: 15% churn
//   - Teams (3-10): 4% churn
//   - Enterprise (10+): 2% churn
// → Solo users are a different customer segment entirely.
//   Either fix their experience or focus on teams.
```
