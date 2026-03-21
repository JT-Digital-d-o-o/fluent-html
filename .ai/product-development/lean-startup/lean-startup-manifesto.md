# Lean Startup Manifesto

Every product decision is an experiment. If you're not testing a hypothesis, you're guessing — and guessing at scale is how startups die.

---

## Build-Measure-Learn Loop

The core feedback loop that drives all product work. Speed through this loop determines competitive advantage.

### DO: Run the loop in under 3 days

1. **Build** — smallest possible prototype that tests one hypothesis
2. **Measure** — collect data against pre-defined success criteria
3. **Learn** — decide pivot or persevere based on evidence

Each cycle should take 1–3 days maximum. With AI-assisted development, building is no longer the bottleneck — learning is. If a cycle takes longer, your experiment scope is too large.

### DON'T: Ship features without a hypothesis

Building without a hypothesis is just guessing with extra steps.
You'll ship something nobody asked for, declare it "launched," and never know why it didn't move the needle.

---

## Value vs Waste

Which efforts are value-creating and which are waste?

### DO: Define value as customer benefit

Lean thinking defines value as something that provides benefit to the customer — everything else is waste. Before starting any work, answer: "What customer problem does this solve?"

### DON'T: Confuse activity with progress

Refactoring that doesn't unblock a customer outcome, dashboards nobody checks, features built on assumptions — all waste until proven otherwise.

---

## Validated Learning

You must learn what customers really want — not what they say they want or what you think they want. If you cannot fail, you cannot learn.

### DO: Design experiments that can fail

```
Hypothesis: Users will complete onboarding if we cut it from 5 steps to 2.
Metric:     Onboarding completion rate
Baseline:   34%
Target:     >50% within 2 weeks
Result:     [measured value] → pivot or persevere
```

### DON'T: Count "launched" as success

Success is not delivering a feature. Success is learning how to solve a customer's problem. A shipped feature with no measured outcome is an untested hypothesis.

---

## Two Core Hypotheses

Break down the grand vision into its component parts. Every product rests on two assumptions — test them before anything else.

### DO: Test value before growth

| Hypothesis | Question | How to test |
|---|---|---|
| **Value Hypothesis** | Does the product deliver real value once people use it? | Retention rate, engagement depth, willingness to pay |
| **Growth Hypothesis** | How will new customers discover this product? | Referral rate, organic acquisition, channel experiments |

Validate value first. Growth without value fills a leaky bucket.

### DON'T: Scale acquisition before retention

Fix retention before acquisition — see [Analytics Guidelines](../../analytics/CLAUDE.md) for thresholds and funnel diagnosis.

---

## Pre-Build Checklist

Before writing a single line of code, answer these four questions in order. Do not skip to question 4.

### DO: Validate the problem before building

1. Do customers recognize they have this problem?
2. If a solution existed, would they pay for it?
3. Would they buy it from us?
4. Can we build a solution?

Each question is a gate. Only proceed to the next when you have evidence (interviews, signup intent, letter of intent, prototype feedback) — not assumptions.

### DON'T: Start with "Can we build it?"

Engineers default to question 4. Building a solution for a problem nobody has is the most expensive way to learn nothing.

---

## Experiment Design

A true experiment begins with a clear hypothesis that makes predictions about what is supposed to happen, then tests those predictions empirically.

### DO: Use this experiment template

```
Problem:    [observed customer pain]
Hypothesis: [if we do X, then Y will happen]
Metric:     [one measurable outcome]
Baseline:   [current value]
Target:     [minimum success threshold]
Timeline:   [1-3 days max]
Result:     [measured outcome]
Decision:   [pivot / persevere / kill]
```

### DON'T: Run experiments without exit criteria

An experiment with no target is just a feature launch with extra paperwork. Define what "good enough" looks like before you start — otherwise you'll rationalize any result as success.
