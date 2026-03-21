# Event Taxonomy

Standard event naming conventions and categories for consistent tracking across projects.

---

## Naming Convention

```
Format: [entity].[action]

entity = what is being acted on (page, user, payment, subscription, feature)
action = what happened (view, signup, login, completed, failed, used)
```

All event names are **lowercase**, **dot-separated**, and use **past tense or present tense** for the action.

---

## Standard Events

These events form the baseline for every project. Track all of them before adding custom events.

### Page events
| Event | Category | Trigger | Properties |
|---|---|---|---|
| `page.view` | page | Every page request (auto-tracked) | `{ path, referrer }` |

### User lifecycle events
| Event | Category | Trigger | Properties |
|---|---|---|---|
| `user.signup` | user | After account creation | `{ method }` (`"email"`, `"google"`, etc.) |
| `user.login` | user | After successful authentication | `{}` |
| `user.return_visit` | user | First `page.view` in a new session for an existing user (>24h gap) | `{}` |
| `user.referral` | user | When a referred user signs up | `{ referredUserId }` |

### Payment events
| Event | Category | Trigger | Properties |
|---|---|---|---|
| `payment.completed` | payment | After successful charge | `{ amount, currency, plan }` |
| `payment.failed` | payment | After failed charge | `{ reason }` |
| `subscription.created` | payment | New subscription starts | `{ plan }` |
| `subscription.cancelled` | payment | Subscription cancelled | `{ plan, reason }` |

### Feature events
| Event | Category | Trigger | Properties |
|---|---|---|---|
| `feature.used` | feature | User engages a key feature | `{ feature }` |

---

## When to Add Custom Events

Add a custom event when you have a **specific question** it will answer.

### DO: Tie events to business questions
```
Question: "Do users who complete onboarding retain better?"
Event:    feature.used { feature: "onboarding_complete" }

Question: "Which project types are most popular?"
Event:    feature.used { feature: "project_create", projectType: "blog" }

Question: "Are users finding the export feature?"
Event:    feature.used { feature: "data_export" }
```

### DON'T: Track generic UI interactions without a question
```
// WRONG — no question, no action
button.clicked { button: "submit" }
modal.opened { modal: "settings" }
input.focused { field: "email" }

// These create noise. If you need click-level detail,
// use a dedicated session replay tool instead.
```

---

## Event Properties

Keep properties minimal and structured.

### DO: Use consistent property names across events
```
Good:
- amount    → always in cents (integer)
- currency  → always ISO 4217 ("usd", "eur")
- plan      → slug matching your pricing tiers ("free", "pro", "enterprise")
- method    → authentication method ("email", "google", "github")
- feature   → feature slug ("project_create", "data_export")
```

### DON'T: Put variable data in event names
```
// WRONG — creates thousands of unique event names
server.track({ event: `page.view./users/${userId}` })
server.track({ event: `feature.used.${featureName}` })

// CORRECT — parameterize via properties
server.track({ event: "page.view", properties: { path: `/users/${userId}` } })
server.track({ event: "feature.used", properties: { feature: featureName } })
```

---

## AARRR Funnel Mapping

Map standard events to funnel stages. This mapping drives dashboard visualizations.

```
Acquisition  →  page.view (first visit)
Activation   →  user.signup + first feature.used
Retention    →  user.return_visit
Revenue      →  payment.completed
Referral     →  user.referral
```

Each app should customize the **Activation** definition. Signup alone isn't activation — the user must experience the core value. Examples:

| App type | Activation = signup + ... |
|---|---|
| Project management | Created first project |
| E-commerce | Added first item to cart |
| Collaboration tool | Invited first team member |
| Content platform | Published first piece |

---

## Category Reference

Categories group events for filtering and reporting.

| Category | Description | Events |
|---|---|---|
| `page` | Automatic page tracking | `page.view` |
| `user` | User lifecycle | `user.signup`, `user.login`, `user.return_visit`, `user.referral` |
| `payment` | Monetization | `payment.completed`, `payment.failed`, `subscription.*` |
| `feature` | Product usage | `feature.used` |

Apps may add custom categories (e.g., `admin`, `integration`) but should keep the list small. If you have more than 6-8 categories, some are probably redundant.
