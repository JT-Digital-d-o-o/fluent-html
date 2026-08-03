# Project Roadmap

The checklist every JT Digital project works through, from raw idea to shipped product. It
operationalizes the [pipeline](./pipeline.md): each phase has a **purpose**, the **algorithm
or framework** that does the work, a **"done when"** gate, and the sharpest **nudges**. The
[algorithms](./algorithms/) are the runnable procedures; the full nudge set is in
[CLAUDE.md](./CLAUDE.md) and the [resources](./resources/).

## How to use this

- Work top to bottom. Each phase's gate unlocks the next. **Don't start at the phase you find
  most fun** (usually building); the point of the order is to kill cheap ideas before they
  get expensive.
- **Scale the effort to the stakes** (see the [algorithms README](./algorithms/README.md)). A
  one-week feature bet runs a phase in an afternoon; a new product runs it in earnest.
- Not every phase applies to every project. Applicability is marked per phase.
- Phases 5 to 7 **loop per bet** (Small Batches). Phases 0 to 4 are usually once per product.
- This roadmap is the **method**. A project tracks *where it is* in the phases in its PM session
  brain at `project/pm/roadmap.md`, which points back here (see the
  [Project Management guidelines](../project-management/CLAUDE.md)).

## At a glance

| # | Phase | Applies to | Run | Gate to next phase |
|---|-------|-----------|-----|--------------------|
| 0 | **Protect the bet** | New / unproven bets | Loonshots (decide the track) | The bet has a home (nursery or franchise) |
| 1 | **Anchor on the Job** | Every project | [Algorithm 01](./algorithms/01-jtbd-intake.md) | A `vision.md` a stranger can restate |
| 2 | **Map the landscape** | Medium+ stakes | [Algorithm 02](./algorithms/02-research-crawl.md) | Top-3 bets named, each tied to the Job |
| 3 | **Validate the bet** | Every project | Lean Startup loops | Value hypothesis proven vs. a pre-set target |
| 4 | **Name & brand** | New customer-facing products | [Algorithm 03](./algorithms/03-naming-seo-design.md) | A defensible name + a brand book |
| 5 | **Shape the work** | Every build | Shape Up | A pitch: problem, appetite, solution, no-gos |
| 6 | **Build the design** | Every build | Refactoring UI + Brand Book | A vertical slice shipped, on the design system |
| 7 | **Ship & learn** | Every build | Small Batches | Deployed to real users, measured, next batch queued |

---

## Phase 0 · Protect the bet · Loonshots

*Applies to: new or unproven bets. Meta layer, not a gate you pass once.*

**Purpose:** decide whether this is a **nursery** bet (explore, no appetite constraint, false-fail
protected) or **franchise** work (execute a known thing, time-boxed). Applying execution
pressure to a fragile idea kills it; letting a known deliverable wander wastes the cycle.

**Checklist**
- [ ] Bet classified: nursery (explore) or franchise (execute)
- [ ] If nursery: it is protected from appetite/schedule pressure until it is ready to shape
- [ ] A two-way transfer is set: field learnings flow back to the idea

**Nudges** ([full set](./CLAUDE.md#loonshots--protect-crazy-ideas-long-enough-to-prove-them))
- **DON'T** apply Shape Up appetite constraints to nursery exploration.
- **DON'T** kill an idea after one failed experiment; investigate the false fail first.
- **DO** distinguish S-type (strategy/pricing/distribution) from P-type (product) bets; both die easily.

---

## Phase 1 · Anchor on the Job · Competing Against Luck

*Applies to: every project.*

**Purpose:** write the Job the customer is hiring the product to do, in plain language. This is
the anchor every later phase reads.

**Run:** [Algorithm 01: JTBD intake](./algorithms/01-jtbd-intake.md).

**Checklist**
- [ ] `vision.md` filled (sections 1 to 14)
- [ ] 1 to 3 switch-moment interviews done, vision rewritten against them
- [ ] Job fits one job story; all Four Forces named; anti-job written
- [ ] A second person can restate the Job from the doc alone

**Nudges** ([full set](./CLAUDE.md#competing-against-luck--know-the-job-before-you-build))
- **DO** segment by circumstance, not demographics.
- **DO** capture functional + social + emotional dimensions, not just functional.
- **DON'T** accept a job story that describes a solution.

**Gate:** a `vision.md` a stranger can restate in one sentence.

---

## Phase 2 · Map the landscape · Research + crawl

*Applies to: medium and high stakes (a new product line or company). Low-stakes feature bets
can do a lightweight one-agent pass or skip to Phase 3.*

**Purpose:** know what you can build, what the world requires (regulation, platforms, limits),
who you displace (including non-consumption), and which bets to test first.

**Run:** [Algorithm 02: multi-wave research + crawl](./algorithms/02-research-crawl.md).

**Checklist**
- [ ] Grounding, context crawl, and competitor crawl done (Waves 1 to 3)
- [ ] Requirement → capability → gap map, with a build backlog (Wave 4)
- [ ] Market & buyer sizing, pricing, GTM (Wave 5)
- [ ] Synthesis: product definition v1 + **top-3 bets with kill criteria** (Wave 6)

**Nudges** ([conventions](./algorithms/README.md#shared-run-conventions))
- **DO** run the three crawl waves in parallel; they are independent.
- **DON'T** end without a prioritized "test this next." Research without a decision is a report.
- **DON'T** silently truncate coverage; say what you bounded.

**Gate:** the top-3 bets are named, each tied to the Job.

---

## Phase 3 · Validate the bet · Lean Startup

*Applies to: every project.*

**Purpose:** prove the problem is real and someone will pay, before writing production code.

**Run:** Build → Measure → Learn loops (1 to 3 days each), MVP type matched to the riskiest
assumption.

| Riskiest assumption | MVP type |
|---|---|
| Nobody wants this | Smoke test (landing page, fake door) |
| Solution doesn't solve it | Concierge (deliver value manually, 3 to 5 customers) |
| Users won't use it | Wizard of Oz (real UI, human behind it) |
| Core feature doesn't deliver | Single-feature, end-to-end, production quality |

**Checklist**
- [ ] Gates answered in order: problem real? → would they pay? → buy from us? → can we build it?
- [ ] Each experiment has hypothesis → metric → baseline → target → result → decision
- [ ] A pivot-or-persevere decision forced after every experiment

**Nudges** ([full set](./CLAUDE.md#lean-startup--validate-before-you-build))
- **DON'T** count "launched" as success. Success is a measured outcome vs. a pre-set target.
- **DO** ground every hypothesis in the Job (Phase 1), not in "users will click more."
- **DON'T** add "one more feature" before the core hypothesis proves value.

**Gate:** the value hypothesis is proven against a pre-set target (persevere). Otherwise pivot
or kill; do not proceed to build.

---

## Phase 4 · Name & brand · Naming → SEO → design

*Applies to: new customer-facing products. Skip for internal tools and feature bets on an
existing brand.*

**Purpose:** a defensible name and a brand book, decided once the bet is validated.

**Run:** [Algorithm 03: naming → SEO sweep → design book](./algorithms/03-naming-seo-design.md).

**Checklist**
- [ ] Naming brief written (feeling, banned motifs, languages, domain needs)
- [ ] Coinage explored wide, shortlisted against the brief
- [ ] Live findability sweep per name; scored comparison table
- [ ] Brand book + logo set for the top 1 to 3; ranked recommendation

**Nudges**
- **DO** kill on findability before designing.
- **DON'T** let a beautiful name survive a same-space collision.
- **DON'T** pick on defensibility alone; weigh emotional-Job fit and word-of-mouth too.

**Gate:** a recommended name with no same-space collision, a reachable domain, and a brand book.
Its concrete choices override Refactoring UI defaults in Phase 6.

---

## Phase 5 · Shape the work · Shape Up

*Applies to: every build.*

**Purpose:** scope a validated bet so it ships within a fixed time.

**Checklist**
- [ ] Appetite (time budget) set **before** designing the solution
- [ ] Work shaped rough (room to explore), solved (elements connected), bounded (no-gos explicit)
- [ ] A pitch written: problem, appetite, solution, rabbit holes, no-gos

**Nudges** ([full set](./CLAUDE.md#shape-up--fixed-time-variable-scope))
- **DO** set appetite first; a 2-day appetite is a different solution than a 1-week one.
- **DON'T** accept grab-bags as projects. "Redesign the Files section" is not a project.
- **DO** cut scope when time is tight; don't extend time.

**Gate:** a bounded pitch, ready to build.

---

## Phase 6 · Build the design · Refactoring UI + Brand Book

*Applies to: every build.*

**Purpose:** implement with a systematic, high-quality design.

**Checklist**
- [ ] Constrained systems defined first: type scale, spacing scale, color palette, shadows
      (Brand Book choices win where they exist)
- [ ] Designed in grayscale first; hierarchy via color + weight, not just size
- [ ] One vertical slice (real UI + real code) integrated on day one
- [ ] Design → build → iterate → next feature (not all screens upfront)

**Nudges** ([full set](./CLAUDE.md#refactoring-ui--systematize-design-choices))
- **DO** start with features, not layouts. The shell emerges from the features.
- **DO** de-emphasize competing elements instead of inflating the primary.
- **DON'T** design every feature upfront; edge cases are invisible in the abstract.

**Gate:** a vertical slice shipped, on the design system.

---

## Phase 7 · Ship & learn · Small Batches

*Applies to: every build. Loops with Phases 5 and 6.*

**Purpose:** ship in deployable slices and let each one produce signal.

**Checklist**
- [ ] Bet broken into deployable slices; ships to real users 2 to 3 times per week
- [ ] Build → deploy → measure one scope before starting the next
- [ ] Outcome measured vs. the Phase 3 target; next batch queued

**Nudges** ([full set](./CLAUDE.md#small-batches--optimize-for-learning-speed))
- **DON'T** batch features for a "big launch." If A fails, B to F built on it are wasted.
- **DO** deploy now if the core hypothesis can be tested with what you have.
- **DON'T** wait until "it's ready." Done means deployed, not code-complete.

**Gate:** measured in production. Learnings flow back to the nursery (Phase 0) and the next bet.
