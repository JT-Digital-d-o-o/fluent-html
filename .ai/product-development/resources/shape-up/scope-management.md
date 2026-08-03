# Scope Management: Scoping, Cutting, and Scope Hammering

Scope grows like grass — it's natural, not the fault of bad people. Every project is full of scope we don't need. The answer isn't preventing scope growth, but giving teams the tools, authority, and responsibility to constantly cut it down.

---

## Integrate One Slice First

### DO: Make something tangible and demoable on the first day

Aim for a working piece of the project — with real UI and real code — early on. This builds momentum and proves the approach works.

### DON'T: Build lots of disconnected parts hoping they fit together

A team can complete many tasks but feel insecure because they don't have anything real to show. Lots of things are "done" but nothing is really done.

### DO: Integrate vertically, not horizontally

Don't do all the design, then all the back-end. Pick one slice of the project and wire up front-end and back-end together. Then you have something to click through and judge.

### Three criteria for choosing what to build first

1. **Core** — central to the concept, without which other work wouldn't mean anything
2. **Small** — can be finished in a few hours to build momentum
3. **Novel** — something you've never done before, to eliminate uncertainty early

---

## Affordances Before Pixel-Perfect Screens

### DO: Start with basic, functional UI

Input elements, buttons, places where data appears — these are the core of a design. Font, color, spacing can all be resolved after the affordances are wired up and working.

First make it work, then make it beautiful.

### DO: Program just enough for the next step

Back-end work can be strategically patchy. A controller but no model. Mock data but no create/update support. Stubbed screens connected with routes. Use the simplest thing (even hard-coded HTTPAuth) to unblock real testing.

### DO: Create a back-and-forth between design and programming

Take turns layering in affordances, code, and visual styling on the same piece. Step by step, click through the real working feature to judge what's next.

---

## Map the Scopes

Scopes are integrated slices of the project that can be finished independently — a few hours or less each. They become the language of the project.

### DO: Organize by structure, not by person

Don't create a "Designer" list and a "Programmer" list. Create lists based on the things that can be worked on and finished independently: "Bucket Access," "Visibility Toggle," "Invite Clients."

### DON'T: Try to map scopes at the start

You need to walk the territory before drawing the map. Scopes arise from interdependencies discovered by doing real work. Expect accurate scopes by end of day 1 or start of day 2. Some shuffling and instability at first is normal.

### In practice: scopes as to-do lists

Each scope becomes a named to-do list. Tasks for that scope go in that list. The scope names become the language you use to talk about the project.

---

## Signs the Scopes Are Right

1. You can see the whole project — nothing important hidden in the details
2. Conversations about the project flow naturally using scope names
3. New tasks have an obvious home — scopes act like buckets

## Signs the Scopes Need Redrawing

1. Hard to say how "done" a scope is — tasks inside are unrelated
2. Name isn't unique to the project (e.g., "front-end," "bugs") — this is a grab-bag
3. Too big to finish soon — break into pieces with victories along the way

---

## Special Scope Patterns

### Layer Cakes
UI design with a thin, evenly distributed layer of back-end work. Integrate design and programmer tasks in the same scope. Good default for most information-system apps.

### Icebergs
Significantly more back-end than UI (or vice versa). Factor out the UI or back-end as separate scopes. Split complex back-end into separate concerns.

### DO: Question icebergs before accepting them

Is the complexity really necessary and irreducible? Do we need that fancy UI? Is there a different approach with fewer interdependencies?

### Chowder
A catch-all for loose tasks that don't fit anywhere. Keep a skeptical eye — if it grows beyond 3-5 items, there's probably a scope to be drawn.

---

## Scope Hammering

Scope hammering is the forceful, repeated process of banging scope down to fit in the time box. It's stronger than "cutting" — it reflects the power and force required.

### Questions to ask before accepting new scope

- Is this a **must-have** for the new feature?
- Could we **ship without** this?
- What happens if we **don't do this**?
- Is this a **new problem** or a pre-existing one customers already live with?
- How **likely** is this case or condition to occur?
- When it occurs, which customers see it — is it **core or edge case**?
- What's the **actual impact** if it does happen?
- How aligned is this use case with our **intended audience**?

### DO: Mark nice-to-haves with ~ (tilde)

Must-haves are tasks on the scope — the scope isn't done until they're finished. Nice-to-haves are marked with a ~ prefix. They're things to do if there's extra time and things to cut if there isn't. The act of marking them is the scope hammering.

### DON'T: Treat cutting scope as lowering quality

Making choices makes the product better. Differentiating core from peripheral moves you in competitive space. Variable scope is about being picky about what actually matters, what moves the needle, and what makes a difference for the core use cases.
