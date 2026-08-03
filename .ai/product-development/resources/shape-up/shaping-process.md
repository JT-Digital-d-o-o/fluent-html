# Shaping: How to Define Work Before Building

Shaping is the up-front design work that defines boundaries and reduces risk on a project before committing it to a team. Shaped work is rough enough to leave room for the team's creativity, solved enough to show clear direction, and bounded enough to tell the team where to stop.

---

## The Right Level of Abstraction

Shaped work lives between two extremes: too concrete and too abstract. Getting this level right is the single most important factor in whether a project succeeds.

### DON'T: Start with wireframes or high-fidelity mockups

Over-specifying design leaves designers no room for creativity. Worse, it leads to estimation errors — the more specific the work, the harder it is to estimate because hidden complexities lurk in implementation details. When scope isn't variable, the team can't reconsider decisions that cost more than they're worth.

### DON'T: Define projects in a few words

"Build a calendar view" or "add group notifications" sound sensible but nobody knows what they entail. Team members can't make trade-offs. Under-specified projects naturally grow out of control because there's no boundary defining what's out of scope.

### DO: Shape at the level of elements and connections

The output of shaping is a set of concrete elements — key components, interactions, and how they connect — without visual design decisions. Specific enough that the team knows what to do, abstract enough that they work out the interesting details themselves.

---

## Three Properties of Shaped Work

### 1. It's Rough

Everyone can tell it's unfinished. Open spaces where the team's contributions will go. Work that's too fine too early commits everyone to the wrong details.

### 2. It's Solved

All main elements of the solution are there at the macro level and connect together. Open questions and rabbit holes have been removed. While surprises might still happen, there is clear direction.

### 3. It's Bounded

Shaped work indicates what *not* to do. There's a specific appetite — the amount of time the team is allowed to spend. Completing the project within that time requires limiting scope and leaving specific things out.

---

## Who Shapes

Shaping requires combining interface ideas with technical possibilities with business priorities. You need to either embody these skills as a generalist or collaborate with one or two others.

- **Primarily design work** — interaction design from the user's perspective
- **Technically literate** — able to judge what's possible, easy, and hard (not necessarily a programmer)
- **Strategic** — setting appetite, being critical about the problem, judging trade-offs
- **Closed-door process** — work alone or with a trusted partner, rough diagrams nobody outside the room would understand

---

## Four Steps to Shaping

### Step 1: Set Boundaries

Define the appetite (time budget) and narrow the problem. See [appetite-and-boundaries.md](appetite-and-boundaries.md).

### Step 2: Rough Out the Elements

Sketch solutions at a high level of abstraction using breadboarding or fat marker sketches. Move fast, explore broadly.

### Step 3: Address Risks and Rabbit Holes

Stress-test the concept. Walk through use cases in slow motion. Declare out-of-bounds cases. Cut unnecessary parts. Present to technical experts. See [risk-management.md](risk-management.md).

### Step 4: Write the Pitch

Package the concept for the betting table. See below.

---

## Breadboarding

Borrowed from electrical engineering — all components and wiring, no industrial design. Three elements:

1. **Places** — screens, dialogs, menus (things you navigate to)
2. **Affordances** — buttons, fields, interface copy (things you act on)
3. **Connection lines** — how affordances take users from place to place

Use words for everything instead of pictures. The lightweight notation lets you quickly jump between possibilities and entertain different approaches. Writing out flows confronts you with questions you didn't originally think of.

### DO: Use breadboarding for interaction flows

Draw places as underlined words, affordances below the line, arrows connecting them. Debate the pros and cons of each approach.

### DON'T: Draw wireframes or specific layouts at this stage

You'll get stuck on unnecessary details and won't explore broadly enough.

---

## Fat Marker Sketches

For visual ideas where 2D arrangement of elements is the fundamental problem. Sketch with such broad strokes that adding detail is difficult or impossible.

### DO: Use a thick Sharpie on paper or a large pen size on iPad

The constraint forces you to stay at the right level of abstraction. You can only draw the broad outlines, which is exactly what you want at this stage.

### DON'T: Get attached to layout decisions in fat marker sketches

A sidebar in a sketch is not a commitment to a sidebar in the final product. Keep an eye on which elements are core versus incidental.

---

## The Pitch: Five Ingredients

Once shaped, package the concept for the betting table:

| Ingredient | Purpose |
|---|---|
| **1. Problem** | A specific story showing why the status quo doesn't work. Establishes fitness test for the solution. |
| **2. Appetite** | Time budget (1-2 days or 1 week). Prevents unproductive debates about better solutions. |
| **3. Solution** | Core elements presented clearly. Problem without solution = unshaped work. |
| **4. Rabbit holes** | Specific patches for potential problems. Spell out decisions to prevent team getting stuck. |
| **5. No-gos** | What you're explicitly NOT doing. Use cases or functionality intentionally excluded. |

### DO: Present problem and solution together

Without a problem, there's no test of fitness. Without a solution, it's unshaped work that pushes research to the wrong level.

### DO: Post pitches asynchronously first

Give stakeholders time to read on their own. Escalate to real-time only when necessary. This keeps the betting table short and productive.

### DON'T: Use wireframes or high-fidelity mocks in pitches

Use embedded sketches or annotated fat marker sketches. Selectively add visual detail only for "linchpin" parts that everyone needs to see concretely. Add disclaimers reminding designers of their latitude.

---

## Two Parallel Tracks

Shaping and building happen on separate tracks simultaneously. During any one-week cycle:

- **Build track**: teams build previously shaped work
- **Shape track**: shapers privately work on what teams might build in a future cycle

Shaping work stays private until the betting table. This gives shapers the option to shelve or drop work that isn't coming together.

### DON'T: Treat shaping as a conveyor belt

You can walk away from a shaped concept at any point. No commitments or promises are made during shaping. The only thing that happened is the raw idea became more actionable.
