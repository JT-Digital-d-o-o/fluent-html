# Metrics Reference

Formulas, benchmarks, and query patterns for common Lean Analytics metrics.

---

## Core Metrics

### Engagement Rate
```
Formula:  Weekly Active Users / Total Registered Users
Type:     Ratio (0-100%)
Good:     >25% (B2B SaaS), >15% (consumer)
Period:   Weekly

Tells you: What fraction of your user base is actually using the product.
A declining engagement rate with growing total users means you're
acquiring users who don't stick.
```

### Retention Rate (by cohort)
```
Formula:  Users active in period N / Users in cohort
Type:     Ratio (0-100%)
Good:     >40% at week 4 (B2B), >20% at week 4 (consumer)
Period:   Weekly or monthly cohorts

Tells you: Whether users stick around over time.
The most important metric in stickiness stage.
```

### Churn Rate
```
Formula:  Users lost this period / Users at start of period
Type:     Ratio (0-100%)
Good:     <5% monthly (B2B SaaS), <8% monthly (consumer)
Period:   Monthly

Tells you: How fast you're losing users.
Revenue churn matters more than logo churn once you have paying users.
```

### Revenue Churn (Net)
```
Formula:  (Lost MRR - Expansion MRR) / MRR at start of period
Type:     Ratio (can be negative — that's good!)
Good:     <2% net monthly churn; negative net churn is exceptional
Period:   Monthly

Tells you: Whether your existing customer base is growing or shrinking
in value. Negative churn = expansion revenue exceeds lost revenue.
```

---

## Acquisition Metrics

### Conversion Rate (visit → signup)
```
Formula:  Signups / Unique visitors
Type:     Ratio (0-100%)
Good:     >2% (organic traffic), >5% (targeted campaigns)
Period:   Weekly

Tells you: How effective your landing/marketing pages are.
```

### Customer Acquisition Cost (CAC)
```
Formula:  Total acquisition spend / New customers acquired
Type:     Currency
Good:     Depends on LTV — aim for LTV/CAC > 3×
Period:   Monthly

Tells you: How much it costs to get one paying customer.
Include all costs: ads, content, sales, tools.
```

### Payback Period
```
Formula:  CAC / Monthly revenue per customer
Type:     Months
Good:     <12 months (B2B SaaS)
Period:   Calculated per cohort

Tells you: How long until a customer "pays back" their acquisition cost.
Shorter = better cash flow.
```

---

## Revenue Metrics

### Monthly Recurring Revenue (MRR)
```
Formula:  Sum of all active subscription amounts
Type:     Currency
Good:     Growing month-over-month
Period:   Monthly snapshot

Break down into:
- New MRR      (new customers)
- Expansion MRR (upgrades, add-ons)
- Contraction MRR (downgrades)
- Churn MRR    (cancellations)
```

### Average Revenue Per User (ARPU)
```
Formula:  Total revenue / Active users (or paying users)
Type:     Currency
Good:     Growing or stable; declining ARPU signals pricing problems
Period:   Monthly

Tells you: How much each user is worth.
Track separately for paying vs. all users.
```

### Lifetime Value (LTV)
```
Formula:  ARPU × Average customer lifetime (in months)
         or  ARPU / Monthly churn rate
Type:     Currency
Good:     LTV > 3× CAC
Period:   Calculated from historical data

Tells you: The total revenue you expect from one customer
over their entire relationship.
```

### Trial-to-Paid Conversion
```
Formula:  Users who pay / Users who started trial
Type:     Ratio (0-100%)
Good:     >5% (freemium), >15% (free trial with time limit)
Period:   Per cohort (track by signup week)

Tells you: Whether your free experience convinces people to pay.
```

---

## Growth Metrics

### Week-over-Week Growth
```
Formula:  (This week's value - Last week's value) / Last week's value
Type:     Percentage
Good:     >5% WoW sustained (early stage)
Period:   Weekly

Tells you: Momentum. Apply to any metric (users, revenue, engagement).
```

### Viral Coefficient (K-factor)
```
Formula:  Average invites per user × Invite acceptance rate
Type:     Number
Good:     K ≥ 0.5; K ≥ 1.0 means exponential growth
Period:   Per cohort

Example:
  Average invites per user: 3
  Acceptance rate: 20%
  K = 3 × 0.20 = 0.6 ✓
```

### Net Promoter Score (NPS)
```
Formula:  % Promoters (9-10) - % Detractors (0-6)
Type:     Score (-100 to +100)
Good:     >30 (B2B SaaS), >50 is excellent
Period:   Quarterly survey

Tells you: Would users recommend you? Leading indicator of organic growth.
```

---

## Benchmarks Quick Reference

These are starting points, not absolute rules. Context matters — a niche B2B tool with 80% retention at 3× ARPU may outperform a viral consumer app with 15% retention.

| Metric | B2B SaaS | Consumer | Source |
|---|---|---|---|
| Week-4 retention | >40% | >20% | Lean Analytics |
| Monthly churn | <5% | <8% | industry avg |
| Free-to-paid | >5% | >2% | Lean Analytics |
| LTV/CAC ratio | >3× | >3× | general rule |
| Payback period | <12 mo | <6 mo | general rule |
| NPS | >30 | >50 | Bain & Company |
| Viral coefficient | >0.5 | >0.7 | general rule |

---

## Applying Metrics: Weekly Review Template

```
Date: ___________
Stage: ___________

OMTM: ___________ = ___________ (target: ___________)
Trend: ___________ vs. last week

Funnel snapshot:
  Acquisition:  _____
  Activation:   _____ (___% conversion)
  Retention:    _____ (___% of activated)
  Revenue:      _____ (___% of retained)
  Referral:     _____ (___% of active)

Biggest bottleneck: ___________
Action this week:   ___________
Hypothesis:         ___________
```
