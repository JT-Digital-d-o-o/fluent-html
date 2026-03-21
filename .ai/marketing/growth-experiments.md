# Growth Experiments

A systematic framework for testing acquisition channels, optimizing conversion, and building growth loops. Run experiments to learn, not to confirm what you already believe.

---

## Experiment Framework

Use the experiment template defined in [lean-startup-manifesto.md](../product-development/lean-startup/lean-startup-manifesto.md) (see "Experiment Design"). Every growth experiment follows that same hypothesis → metric → target → result → decision structure.

### DO: Log every experiment — wins and failures
```
// Maintain a simple experiment log:
| # | Date    | Hypothesis                          | Metric         | Result    | Decision    |
|---|---------|-------------------------------------|----------------|-----------|-------------|
| 1 | 2026-01 | Email-only signup lifts conversion   | Signup rate     | 3.1→4.8%  | Ship ✓      |
| 2 | 2026-01 | Customer logos add trust              | Signup rate     | 4.8→4.9%  | No effect ✗ |
| 3 | 2026-02 | Onboarding checklist improves activ. | Activation rate | 42→58%    | Ship ✓      |
| 4 | 2026-02 | 7-day re-engagement email            | Week-2 return   | 18→24%    | Ship ✓      |

// Failed experiments are valuable — they prevent wasting time
// on ideas that don't work. Log them with equal rigor.
```

---

## ICE Prioritization

### DO: Score experiments before running them
```
ICE = Impact × Confidence × Ease (each scored 1-10)

Impact:     How much will this move the target metric?
Confidence: How sure are you this will work? (data > opinion)
Ease:       How fast/cheap is it to implement and measure?

Example backlog:
| Experiment                        | I  | C  | E  | ICE |
|-----------------------------------|----|----|----|-----|
| Reduce signup to email-only       | 8  | 7  | 9  | 504 |
| Add "Start free" CTA copy         | 7  | 8  | 9  | 504 |
| Onboarding checklist              | 9  | 6  | 6  | 324 |
| Customer logo wall                | 5  | 5  | 8  | 200 |
| Referral program with credits     | 9  | 4  | 3  | 108 |
| Video demo on homepage            | 6  | 4  | 4  |  96 |

// Run highest ICE first. Cheap, confident wins before
// expensive, uncertain bets.
```

### DON'T: Always chase high-impact experiments
```
// A high-impact experiment with low confidence and low ease
// (like building a referral program) can take weeks and fail.

// A medium-impact experiment with high confidence and high ease
// (like changing CTA copy) takes an hour and compounds.

// At early stage, velocity of learning > size of individual wins.
```

---

## Channel Testing

### DO: Test one channel at a time — minimum 2 weeks and 200+ visitors before judging
```
Channel testing process:
1. Pick one channel
2. Set a budget (time + money): e.g., "$200 and 2–4 weeks"
3. Define success: e.g., "≥20 signups at <$10 CAC"
4. Run until you have ≥200 visitors or 2 weeks pass — whichever comes last
5. Measure and decide: scale, optimize, or kill

Common channels to test (roughly in order of ease for early stage):
1. Communities    → where your users already hang out
2. Content/SEO   → blog posts targeting specific keywords
3. Email outreach → direct outreach to potential users
4. Social media   → organic posts on 1-2 platforms
5. Paid search    → Google Ads for high-intent keywords
6. Paid social    → Facebook/LinkedIn ads for awareness
7. Partnerships   → co-marketing with complementary tools
```

### DO: Validate channel-market fit before scaling spend
```
// Good sign:
"We spent $100 on Google Ads targeting 'freelance project management'
 and got 15 signups. CAC = $6.67. 3 of them activated."
→ This channel works. Increase budget cautiously.

// Bad sign:
"We spent $500 on LinkedIn Ads and got 2 signups. CAC = $250.
 Neither activated."
→ Kill it or drastically change the targeting/creative.

// The goal of a channel test is a yes/no answer,
// not to drive maximum volume.
```

### DON'T: Run multiple channels simultaneously at early stage
```
// WRONG — spreading $500/mo across 4 channels
// $125 per channel isn't enough to learn anything

// CORRECT — put $500 into one channel for 4 weeks
// You'll get a clear signal on whether it works

// Add channels one at a time. Master each before diversifying.
// At scale stage (not before), you can run 3-4 channels.
```

---

## Growth Loops

### DO: Identify and strengthen your natural growth loop
```
Common growth loops:

1. Content loop (SEO-driven)
   Create content → Ranks in Google → Visitors → Some sign up
   → Use product → Share insights → More content ideas → Repeat

2. Viral loop (user-driven)
   User signs up → Uses product → Invites teammate
   → Teammate signs up → Invites their team → Repeat

3. Paid loop (revenue-driven)
   Spend on ads → Acquire user → User pays
   → Revenue funds more ads → Repeat
   (Only works if LTV > CAC)

4. UGC loop (community-driven)
   User creates content on your platform → Content indexed by Google
   → Visitor finds content → Signs up to engage → Creates more content

// Most startups have one natural loop. Find it and pour fuel on it.
// Don't try to build all four.
```

### DO: Measure the loop metrics
```
For each loop, measure:
- Input:        What goes in (spend, content, invites)
- Output:       What comes out (signups, revenue, shares)
- Cycle time:   How long one loop takes (days, weeks)
- Efficiency:   Output / Input ratio

Example (content loop):
  Input:       1 blog post per week
  Output:      ~50 organic visitors per post per month (after 3 months)
  Cycle time:  3 months to start ranking
  Efficiency:  50 visitors / 4 hours of writing = 12.5 visitors/hour

// Track efficiency over time. If it declines, the channel
// is saturating. If it improves, double down.
```

---

## Conversion Optimization

### DO: Fix the biggest leak in the funnel first
```
Funnel analysis:
  Visitors:     1,000
  Signups:        50  (5% conversion)      ← decent
  Activated:      15  (30% of signups)     ← PROBLEM
  Returned:        9  (60% of activated)   ← ok for activated users
  Paid:            3  (33% of returned)    ← decent

// 70% of signups never activate. That's the biggest leak.
// Fix activation before optimizing signup rate or pricing.

// Improving activation from 30% to 50% = 2.5× more revenue
// (with the same traffic). That's better than any ad campaign.
```

### DO: Use qualitative data to diagnose conversion problems
```
When a funnel step underperforms:
1. Watch session recordings (Hotjar, PostHog) of users who dropped off
2. Email 5-10 users who dropped off and ask what happened
3. Add a one-question exit survey ("What stopped you from [action]?")

// Numbers tell you WHERE the problem is.
// Conversations tell you WHY.
```

### DON'T: Optimize conversion on tiny numbers
```
// WRONG — "Our signup rate is 3.2%, let's A/B test to 3.8%"
// With 100 visitors/week, the difference is 0.6 signups/week.
// That's noise, not signal.

// CORRECT — with small numbers, make big changes:
// - Completely rewrite the headline
// - Remove half the signup form fields
// - Add or remove entire page sections

// Statistical significance requires volume.
// At low volume, make bold bets and measure weekly cohorts.
```

---

## Common Anti-Patterns

### DON'T: Optimize acquisition when activation is broken
```
More traffic × bad activation = more wasted traffic

Fix the funnel bottom-up:
1. Retention (do users come back?)
2. Activation (do signups experience value?)
3. Acquisition (can you get more visitors?)

// This is counterintuitive — acquisition feels more urgent
// because it's more visible. But a 2× improvement in activation
// is worth more than 2× more traffic.
```

### DON'T: Copy what big companies do
```
// WRONG — "Dropbox did a referral program, so we should too"
// Dropbox had millions of users and a viral product.
// You have 50 users and unproven retention.

// CORRECT — "What worked for companies at OUR stage and size?"
// Look at indie hackers, bootstrapped startups, and YC companies
// in their first year. Their playbooks are more relevant.
```

### DON'T: Automate before you validate manually
```
// WRONG — building an automated email nurture sequence
// before you've manually emailed 20 users

// CORRECT sequence:
// 1. Manually email 20 churned users. See what resonates.
// 2. Find the message that gets replies.
// 3. THEN automate that message as a triggered email.

// Manual first → learn → automate what works.
```

### DON'T: Treat growth as someone else's job
```
// At early stage, everyone is responsible for growth.
// The founder who talks to users will out-market
// any hired marketer who doesn't.

// Don't hire a marketer before you can describe:
// - Who your customer is (specifically)
// - What channel works (tested)
// - What message resonates (validated)
// - What the conversion funnel looks like (measured)
```
