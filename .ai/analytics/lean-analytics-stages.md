# Lean Analytics Stages

Detailed reference for each stage. Move sequentially — don't skip ahead.

---

## Stage 1: Empathy

**Question:** Do people have the problem you think they have?

**You're in this stage if:** You haven't validated that the problem exists with real people.

### What to measure
| Signal | Method | Target |
|---|---|---|
| Problem resonance | User interviews | 8/10 interviewees describe the problem unprompted |
| Landing page interest | Signup/waitlist rate | >5% of visitors sign up for waitlist |
| Willingness to pay | Interview + smoke test | 3/10 interviewees would pay for a solution |

### How to move on
You can describe the problem in the user's own words, and you have evidence that at least 10 real people actively seek a solution. You don't need a product yet — you need conviction that the problem is real and frequent.

### Common mistakes
- Building before validating ("I know this is a problem because I have it")
- Asking leading questions in interviews ("Would you use a tool that does X?")
- Treating a landing page signup as full validation (it's interest, not commitment)

---

## Stage 2: Stickiness

**Question:** Do users come back after their first experience?

**You're in this stage if:** You have a product and users, but you're not sure if they stick around.

### What to measure
| Metric | Formula | Benchmark |
|---|---|---|
| Day-1 retention | Users active on day 2 / users who signed up on day 1 | >30% |
| Week-1 retention | Users active in week 2 / users who signed up in week 1 | >20% |
| Core action rate | Users who complete core action / total signups | >50% within first session |
| Time to value | Median time from signup to first core action | <5 minutes |

### Retention curve shape
```
Good:  ██████████████████████
       ██████████████████
       █████████████████        ← flattens (users who stay, stay)
       █████████████████
       █████████████████

Bad:   ██████████████████████
       ██████████
       █████
       ██                       ← keeps declining (no natural floor)
       █
```

### How to move on
Your retention curve flattens — users who survive past a certain point (usually week 2-3) tend to stay. The flat part should represent at least 20% of the original cohort for B2B, or 10% for consumer.

### Levers to pull
1. **Onboarding** — reduce time-to-value
2. **Aha moment** — identify what retained users do that churned users don't
3. **Triggers** — email/notification that brings users back
4. **Simplify** — remove friction from the core loop

---

## Stage 3: Virality

**Question:** Do users tell others?

**You're in this stage if:** Users retain well, and you want organic growth.

### What to measure
| Metric | Formula | Benchmark |
|---|---|---|
| Viral coefficient (K) | Invites sent per user × acceptance rate | K ≥ 0.5 |
| Organic signup % | Signups with no paid channel / total signups | >50% |
| Referral rate | Users who refer / total active users | >5% |
| Time to share | Median time from signup to first invite/share | Sooner = better |

### Types of virality
- **Inherent** — product requires others (collaboration tools, messaging)
- **Word of mouth** — users tell friends because it's good
- **Incentivized** — referral rewards (discounts, credits)
- **Artificial** — forced sharing ("share to unlock") — avoid this

### How to move on
K-factor ≥ 0.5 (each user brings in half a new user on average). Or organic signups consistently represent >50% of total signups.

### Common mistakes
- Adding referral features before retention is solved (accelerating churn)
- Measuring invites sent instead of invites accepted
- Gaming K-factor with forced sharing (hurts brand, doesn't create real growth)

---

## Stage 4: Revenue

**Question:** Can you make money?

**You're in this stage if:** Users stick around and some organic growth is happening.

### What to measure
| Metric | Formula | Benchmark |
|---|---|---|
| Conversion rate | Paid users / total users | >5% (freemium B2B) |
| ARPU | Revenue / active users | Growing month-over-month |
| LTV | ARPU × average customer lifetime | LTV > 3× CAC |
| Churn rate (revenue) | MRR lost / total MRR | <5% monthly (B2B SaaS) |
| Expansion revenue | Upsell + cross-sell revenue / total revenue | Growing |

### Unit economics check
```
Healthy:
  CAC (cost to acquire)   = $50
  LTV (lifetime value)    = $200
  LTV/CAC ratio           = 4× ✓
  Payback period           = 3 months ✓

Unhealthy:
  CAC = $150
  LTV = $200
  LTV/CAC = 1.3× ✗ (too thin — one bad month wipes out margin)
  Payback = 9 months ✗ (cash-flow problem)
```

### How to move on
Unit economics are positive: LTV > 3× CAC, and you have a clear, repeatable path from free user to paying customer.

### Levers to pull
1. **Pricing** — test price points, tiers, annual vs monthly
2. **Upgrade triggers** — identify what drives users to pay
3. **Churn reduction** — exit surveys, rescue offers, engagement nudges
4. **Expansion** — usage-based pricing, add-ons, team seats

---

## Stage 5: Scale

**Question:** Can you grow efficiently?

**You're in this stage if:** Unit economics are positive and you want to pour fuel on the fire.

### What to measure
| Metric | Formula | Benchmark |
|---|---|---|
| CAC by channel | Spend per channel / signups per channel | Declining or stable |
| Payback period | CAC / monthly revenue per customer | <12 months |
| Growth rate | (This month users - last month users) / last month users | >10% MoM |
| Net revenue retention | (MRR at start + expansion - contraction - churn) / MRR at start | >100% |
| Marginal CAC | Cost of the *next* customer (rises as you exhaust cheap channels) | Monitor for ceiling |

### How to know it's working
Revenue grows faster than costs. Adding more customers doesn't proportionally increase support burden. You have 2+ acquisition channels that work.

### Common mistakes
- Scaling with negative unit economics ("we'll make it up in volume")
- Over-investing in one channel (platform risk)
- Hiring ahead of revenue
- Losing focus on retention while chasing growth
