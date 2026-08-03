# Jobs to Be Done

Customers don't buy products — they hire them to make progress in a specific circumstance. When you understand the job, you understand what to build, what to say, and who your real competition is. When you don't, you're competing against luck.

---

## The Hiring Metaphor

### DO: Ask "what job is the customer hiring this product to do?"

When someone buys a milkshake at 8am, they're not buying a beverage — they're hiring something to keep them occupied and full during a long commute. That job is competed against bananas, bagels, and podcasts — not other milkshakes. Knowing the job reveals both the real competition and what "better" actually means.

For every feature you build, ask: in what circumstance does someone reach for this? What are they trying to accomplish? What does progress look like for them?

### DON'T: Define the product as the unit of analysis

The product is not the job. The same product can be hired for completely different jobs by different customers — which means those customers need completely different things from it, even if they look identical in a demographic segment.

---

## Three Dimensions of Every Job

### DO: Capture all three dimensions when defining a job

| Dimension | What it covers | Example |
|---|---|---|
| **Functional** | The practical task to be done | "Get me to my meeting on time" |
| **Social** | How others will perceive the customer | "Look organized and competent" |
| **Emotional** | How the customer wants to feel | "Feel in control, not scrambling" |

Most product teams only address functional dimensions. The jobs that create deep loyalty — and high switching costs — are those that nail all three.

### DON'T: Write requirements that only address functional needs

A feature that solves the functional job but creates social awkwardness or leaves people feeling anxious will underperform. Design for the full experience, including how using the product makes someone feel and how others perceive them.

---

## Circumstances Over Demographics

### DO: Segment by circumstance, not by customer type

The question is never "who is our customer?" — it's "in what situation does someone need this?" A 45-year-old executive and a 22-year-old student both hire the same tool when they share the same circumstance: needing to quickly prepare for a meeting they didn't expect.

Circumstance-based segmentation reveals which jobs are large, underserved, and worth owning.

### DON'T: Build personas based on demographics

Persona-based design ("Sarah, 34, marketing manager, two kids") leads to building for an imagined average user. Circumstance-based thinking ("someone who just got asked to present in 30 minutes and doesn't have their data ready") leads to building for actual moments of need.

---

## Finding the Job

### DO: Interview customers about their switching moments

The richest source of job insight is the moment a customer switches from their old solution to yours — or when they nearly switched but didn't. Ask:

1. What were you doing when you first realized you needed something like this?
2. What did you try before? Why wasn't that good enough?
3. Walk me through the moment you decided to try us.
4. What were you worried would happen if this didn't work?

The purchase moment and the first-use moment contain the job. Demographic surveys do not.

### DON'T: Ask customers what features they want

Customers describe solutions, not jobs. "I want a faster export button" tells you nothing about the job. "I need to get this to my client before they call at 3pm" tells you everything. Go upstream from the feature request to the circumstance that created it.

---

## Job Stories

### DO: Write job stories instead of user stories

User story format puts the wrong emphasis on who the user is:
> "As a [persona], I want [feature] so that [benefit]."

Job story format puts the emphasis on circumstance and motivation:
> "When [situation], I want to [motivation], so I can [expected outcome]."

**Example:**
> When I'm preparing for a client presentation and realize my data is outdated, I want to quickly pull the latest numbers without leaving the tool, so I can feel confident walking into the meeting.

This format keeps the team focused on the job, not on building features for an imaginary persona.

### DON'T: Accept job stories that describe solutions

"When I'm on the dashboard, I want to click Export, so I can download a CSV" is a solution masquerading as a job story. Push back upstream until you reach the circumstance and emotional stakes.

---

## The Four Forces of Progress

### DO: Map all four forces before designing a solution

Customers switch to a new solution only when the push-and-pull forces overpower the anxiety-and-habit forces:

| Force | Direction | What it is |
|---|---|---|
| **Push** | Toward switching | Frustration with the current solution |
| **Pull** | Toward switching | Attraction to the new solution's promise |
| **Anxiety** | Against switching | Fear that the new solution won't work |
| **Habit** | Against switching | Comfort with existing behavior ("good enough") |

A product with strong pull but weak push (no real pain) will struggle with adoption. Anxiety and habit are underestimated — many technically superior products lose because they don't address the "what if this doesn't work?" fear.

### DON'T: Build only for pull

Adding features increases pull. But if you don't reduce anxiety (with proof, guarantees, or a low-risk onboarding path) and acknowledge habit (make the familiar patterns work), adoption will stall even when people want what you're offering.

---

## Non-Consumption as the Real Competition

### DO: Identify non-consumption as your primary competitor

For most products, the main competition is not a rival product — it's the customer doing nothing, using a workaround, or living with the problem. Non-consumption is the largest untapped market. Build against "people currently cobbling this together in spreadsheets," not against the incumbent SaaS tool.

### DON'T: Define competition only against direct substitutes

Competitive analysis that only compares your product against named competitors misses the majority of the opportunity. Ask: "What are people doing today when they don't have our product?" That answer is your real competitive landscape.

---

## Integration with Lean Startup and Shape Up

### DO: Use the job to write better hypotheses

Lean Startup experiments are only as good as the hypothesis they test. A job-grounded hypothesis is far more precise:

| Weak hypothesis | Job-grounded hypothesis |
|---|---|
| "Users will complete onboarding faster with fewer steps" | "Users hired this to feel ready before their first client call — if onboarding ends with a completed example output, anxiety will drop and activation will increase" |

The job tells you what metric actually matters (not just clicks, but confidence at a specific moment).

### DON'T: Run experiments without knowing the job

If you don't know the job, you don't know what success looks like. A 40% improvement in click-through rate means nothing if you're optimizing for the wrong moment in the customer's progress.

### DO: Frame Shape Up problem statements as jobs

A good Shape Up problem statement describes a circumstance and a struggle — which is exactly a job. "Sharing multiple files takes too many steps" = When I need to hand off work to a client [circumstance], I struggle to package it cleanly [functional], and feel disorganized [emotional]. That's the job. Shape the solution against it.
