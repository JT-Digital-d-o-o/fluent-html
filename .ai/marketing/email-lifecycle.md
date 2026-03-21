# Email Lifecycle

Patterns for transactional, onboarding, retention, and re-engagement emails. Every email has one job — drive one action.

---

## Email Types

### Transactional (triggered by user action)
```
Trigger                    → Email
Account created            → Welcome + first step
Password reset requested   → Reset link
Payment succeeded          → Receipt
Payment failed             → Update payment method
Subscription changed       → Confirmation of change

// Transactional emails have the highest open rates (60-80%).
// Use them to reinforce value, not just confirm actions.
```

### Lifecycle (triggered by behavior or time)
```
Trigger                    → Email
Signed up, didn't activate → "Complete your setup" (day 1)
Activated, didn't return   → "Here's what you can do next" (day 3)
Inactive for 7 days        → "Your project is waiting" (day 7)
Trial ending in 3 days     → "Here's what you'll lose" (day -3)
Trial expired              → "Come back — here's 20% off" (day +3)
Active for 30 days         → "How's it going?" (feedback ask)
```

### Broadcasts (sent to segments, not individuals)
```
// Use sparingly — max 1-2 per month.
// Only send when genuinely useful to the recipient.

Good broadcasts:
- Major feature launch (relevant to their usage)
- Pricing change (with advance notice)
- Scheduled maintenance (affects their service)

Bad broadcasts:
- Monthly newsletter with no actionable content
- "We raised funding!" (they don't care)
- Feature they'll never use (segment your list)
```

---

## Onboarding Sequence

### DO: Design a behavior-triggered onboarding sequence
```
Goal: Get new users to their "aha moment" as fast as possible.

The aha moment = the action after which retention dramatically improves.
Find it by comparing: "What did retained users do that churned users didn't?"

Example sequence:
┌─────────────────────────────────────────────────────────────┐
│ Day 0: Welcome                                               │
│ Trigger: user.signup                                         │
│ Goal: Complete first core action                             │
│ CTA: "Create your first project →"                          │
├─────────────────────────────────────────────────────────────┤
│ Day 1: Nudge (only if no core action yet)                   │
│ Trigger: user.signup + NOT feature.used(project_create)      │
│ Goal: Overcome first friction                                │
│ CTA: "Need help? Here's a 2-minute walkthrough →"          │
├─────────────────────────────────────────────────────────────┤
│ Day 3: Value reinforcement (if activated)                    │
│ Trigger: feature.used(project_create)                        │
│ Goal: Show next value — deepen engagement                    │
│ CTA: "Try inviting a teammate →"                            │
├─────────────────────────────────────────────────────────────┤
│ Day 3: Re-engagement (if NOT activated)                      │
│ Trigger: user.signup + NOT feature.used(project_create)      │
│ Goal: Understand why they didn't activate                    │
│ CTA: "What's holding you back? Reply to this email."        │
└─────────────────────────────────────────────────────────────┘

// Branch on behavior, not just time.
// Activated users get different emails than non-activated ones.
```

### DON'T: Send the same sequence to everyone regardless of behavior
```
// WRONG — time-based drip ignoring what the user actually did
Day 0: "Welcome!"
Day 2: "Here's feature A"
Day 4: "Here's feature B"
Day 6: "Here's feature C"

// The user already discovered feature A on their own.
// Now they're getting irrelevant emails and will unsubscribe.

// CORRECT — check what they've done before sending.
```

---

## Email Copy Patterns

### DO: Write subject lines that create curiosity or urgency
```
Good subject lines:
- "Your project is waiting" (re-engagement)
- "You're 1 step away from [benefit]" (activation)
- "Your trial ends in 3 days" (urgency)
- "[Name], quick question" (personal, curiosity)

Bad subject lines:
- "Monthly Newsletter — February 2026" (boring)
- "Exciting news from ProductName!" (vague hype)
- "Don't miss out!!!" (spam trigger)
```

### DO: Structure every email as context → value → CTA
```
Context: Why you're emailing (tied to their behavior)
Value:   What's in it for them
CTA:     One clear next action

Example:
  "Hey [name],

   You created your first project yesterday — nice!

   Most users find that [specific feature] saves them
   2-3 hours per week on [specific task].

   [Try [feature] now →]"
```

### DO: Keep emails short — aim for <150 words
```
// Mobile readers scan. Long emails get abandoned.

Good email structure:
- 1-2 sentence opener (context)
- 1-2 sentence value prop
- 1 CTA button
- Optional: 1 sentence P.S.

// If you need more than 150 words, the email is trying
// to do more than one thing. Split it.
```

### DON'T: Use "no-reply" sender addresses
```
// WRONG — "no-reply@product.com"
// Signals: "We don't want to hear from you"
// Replies are valuable user feedback

// CORRECT — "support@product.com" or "jane@product.com"
// Replies go to a monitored inbox
// Some of your best insights come from email replies
```

---

## Trial-to-Paid Emails

### DO: Frame the upgrade around value, not features
```
// WRONG
"Upgrade to Pro to get:
 - Unlimited projects
 - Priority support
 - API access
 - Custom domains"

// CORRECT
"You've created 4 projects this week — you're clearly building
 something great. On the free plan, you're limited to 5.

 Upgrade to Pro and never hit a ceiling.
 [Upgrade to Pro →]"

// Connect the upgrade to THEIR usage, not your feature list.
```

### DO: Use the trial expiry sequence
```
Day -7:  "Your trial ends next week — here's what you've built so far"
         (show usage stats, reinforce value)

Day -3:  "3 days left — here's what you'll lose access to"
         (loss aversion, specific to their usage)

Day -1:  "Last day — upgrade now to keep everything"
         (urgency + simple CTA)

Day +1:  "Your trial expired — but your data is safe for 30 days"
         (reduce anxiety, offer path back)

Day +7:  "We miss you — here's 20% off your first month"
         (win-back with incentive)
```

### DON'T: Gate the win-back offer too early
```
// WRONG — offering a discount on day 1 of trial
// Trains users to wait for discounts

// CORRECT — only offer discounts after trial expires
// and the user has had time to miss the product
```

---

## Deliverability

### DO: Follow email hygiene basics
```
Technical:
- Set up SPF, DKIM, and DMARC records
- Use a dedicated sending domain (mail.product.com)
- Warm up new sending domains gradually (start with 50/day)

Content:
- Avoid spam trigger words (free!!!, act now, limited time)
- Keep image-to-text ratio reasonable (don't send image-only emails)
- Include a plain-text version
- Always include an unsubscribe link (it's the law)

List hygiene:
- Remove hard bounces immediately
- Suppress users who haven't opened in 90 days
- Never buy or rent email lists
```

### DO: Monitor delivery metrics
```
Healthy benchmarks:
- Delivery rate:     >98%
- Open rate:         >25% (transactional: >60%)
- Click rate:        >3%
- Unsubscribe rate:  <0.3% per email
- Spam complaint:    <0.1%

// If spam complaints exceed 0.1%, stop sending and investigate.
// Your sender reputation is hard to rebuild.
```

---

## Segmentation

### DO: Segment by behavior, not just demographics
```
Good segments:
- Activated vs. not activated
- Free vs. paid
- Active (last 7 days) vs. inactive
- Power users (>10 sessions/week) vs. casual
- Trial ending soon

// Behavior-based segments get 2-3× higher engagement
// than demographic-based segments.
```

### DON'T: Blast your entire list with every email
```
// WRONG — "We launched a new feature! Email everyone!"

// CORRECT — "We launched project templates.
// Email users who have created >3 projects manually —
// they'll see the most value."

// Relevance > reach. A 500-person targeted email
// outperforms a 5,000-person blast.
```
