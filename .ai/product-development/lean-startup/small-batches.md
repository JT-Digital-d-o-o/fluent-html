# Small Batches

Large batches feel efficient but hide problems. Small batches expose problems immediately, enable faster course correction, and reduce the cost of being wrong. In product development, batch size is the amount of work that moves through the Build-Measure-Learn loop before you stop and evaluate.

---

## Why Small Batches Win

### DO: Optimize for learning speed, not production efficiency

| Batch size | Build time | Feedback delay | Cost of being wrong |
|---|---|---|---|
| 6-week feature set | 6 weeks | 6+ weeks | 6 weeks of work scrapped |
| 1-week shaped bet | 1 week | Days | 1 week of work scrapped |
| 1-day experiment | 1 day | Hours | 1 day of work scrapped |

The goal is not to build more — it is to learn faster. Every day between "built" and "measured" is a day you might be building on a wrong assumption.

### DON'T: Batch up features for a "big launch"

Big launches feel important but delay learning. If feature A fails, features B through F — built on the assumption that A works — are wasted. Ship A, measure, then decide whether B still makes sense.

---

## Applying Small Batches to Product Work

### DO: Break every bet into deployable slices

A 1-week bet should ship to real users at least 2–3 times during the week, not once at the end.

1. **Day 1**: Core interaction works end-to-end, deployed, measured
2. **Day 2–3**: Iterate based on signal, ship each iteration
3. **Day 4–5**: Polish what works, cut what doesn't, ship final version

Each deployment is a measurement opportunity. If Day 1 data shows the core interaction doesn't work, you saved 4 days.

### DON'T: Wait until "it's ready" to deploy

"Not ready yet" usually means "not perfect yet." If the core hypothesis can be tested with what you have now, deploy now. Perfection is a batch-size problem — you're holding back learning to polish things that might get cut.

---

## Small Batches and Scope

Small batches connect directly to Shape Up's scope hammering — both are about reducing the size of work to fit the constraint.

### DO: Use appetite as a batch-size cap

| Appetite | Maximum batch | Deploy frequency |
|---|---|---|
| Small batch (1–2 days) | 1 scope, 1 feature | Once, at completion |
| 1-week bet | 2–3 scopes | 2–3 times during the week |

If a scope can't ship independently, it's too big. Break it down until each piece delivers a testable increment.

### DON'T: Confuse "small batch" with "incomplete"

A small batch is not a half-built feature. It is a fully working slice that tests one thing. The difference:

- **Half-built**: Login screen without authentication → tests nothing
- **Small batch**: Authentication with plain text UI → tests whether users complete the flow

---

## The Envelope-Stuffing Principle

### DO: Do one piece at a time, end to end

The Lean Startup's envelope-stuffing example: folding, inserting, sealing, and stamping one envelope at a time beats doing all folds, then all inserts, then all seals. Why:

- Errors are caught immediately (the letter doesn't fit the envelope — you find out on envelope #1, not envelope #1000)
- Each completed envelope is deliverable value
- You can stop at any point with a stack of finished work

In product terms: build, deploy, and measure one scope before starting the next. Don't build three scopes in parallel and deploy them all at once.

### DON'T: Optimize for developer convenience over learning speed

Working on multiple features in parallel feels productive because context switches are reduced. But it maximizes work-in-progress and delays feedback on all of them. Sequential delivery of small batches beats parallel delivery of large batches — every time.
