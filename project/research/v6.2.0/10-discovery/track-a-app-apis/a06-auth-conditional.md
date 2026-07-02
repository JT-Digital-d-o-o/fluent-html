# Track A — App APIs · Lens: Auth / Session / Conditional Rendering

Scope: guard patterns, role-gated UI, IfThen/Match around permissions, and the chains apps write to flip UI between an editable and a read-only state. Evidence mined from `planet-positive-sport` (v5) and `pm-gui` (v6). Note up front: `pm-gui` is a local PM tool with **no auth layer**, so all consumer evidence here is from PPS. The current-user/context plumbing PPS uses (`createContext` in `src/auth/current-user.context.ts`) is **deliberately out of v6 core** (CHANGELOG 6.0.0 "No context/DI in core") — that whole class of "thread the user into the view" problem is owned by the future `@fluent-html/fastify` layer, not core, so I do **not** re-propose it. What remains are genuinely render-level ergonomics that core can and should own.

---

## 1. `.whenElse(cond, ifFn, elseFn)` — opposite-branch tag modifier

### Problem / evidence
The single most repeated conditional-rendering shape in PPS is a tag that styles/behaves one way when a permission flag is set and the **opposite** way when it isn't — expressed today as two separate `.when()` calls reading the same flag and its negation. `grep '.when(!'` finds **17** call sites, every one paired with a positive `.when()` on the same predicate. The flag is almost always a permission/lock (`isLocked`, `canWrite`):

`src/loc/assessment/questionnaire.view.ts:206-230`
```typescript
.toggle("disabled", isLocked)
.when(isLocked,  (tag) => tag.opacity("70"))
.when(!isLocked, (tag) => tag.setHtmx(routes.assessment.answerQuestion(...)))
```
`src/loc/assessment/category.objectives.view.ts:615-623`
```typescript
.toggle("disabled", isLocked)
.when(isLocked,  (h) => h.opacity("70").cursor("not-allowed"))
.when(!isLocked, (h) => h.setHtmx(routes.assessment.saveAchieved(...)))
```
The negation is re-typed by hand each time (`!isLocked`, `!canWrite`), the predicate is duplicated, and the two branches drift apart in the source even though they are one decision. This is the role-gated-UI idiom: "interactive when permitted, inert-and-dimmed when not."

### Proposed API
```typescript
// on Tag
whenElse(cond: boolean, ifFn: (t: this) => unknown, elseFn: (t: this) => unknown): this;
whenElse<T>(value: T | null | undefined,
            ifFn: (t: this, value: NonNullable<T>) => unknown,
            elseFn: (t: this) => unknown): this;
```
Pure structural sugar — no new HTML, evaluates exactly one branch. Mirrors the existing `IfThenElse` value-or-boolean overload pair so the nullable form narrows.

### Before / After
```typescript
// before
.toggle("disabled", isLocked)
.when(isLocked,  (h) => h.opacity("70").cursor("not-allowed"))
.when(!isLocked, (h) => h.setHtmx(routes.assessment.saveAchieved(...)))

// after
.toggle("disabled", isLocked)
.whenElse(isLocked,
  (h) => h.opacity("70").cursor("not-allowed"),
  (h) => h.setHtmx(routes.assessment.saveAchieved(...)))
```
Predicate stated once; the two outcomes sit adjacent and cannot drift.

### Already in lib?
No. `.when()` (single branch) exists (`src/core/tag.ts:245`); there is no else-form. `IfThenElse` exists but produces a *child View*, not a tag-mutation, so it can't carry the `.toggle()/.setHtmx()` chain.

### Value: high  ·  Effort: small

---

## 2. `setEditable(boolean)` — one call for the readonly/disabled gate on form controls

### Problem / evidence
Permission gating on form fields is expressed as bare `.toggle("readonly", flag)` / `.toggle("disabled", flag)` scattered across inputs, textareas and selects — **20** such call sites in PPS view code. The author has to remember *which* attribute the element honours (`<input>`/`<textarea>` use `readonly`; `<select>`/`<button>` have no `readonly` and need `disabled`), and the flag is always the negation of an "editable/permitted" concept, so half the sites pass `isLocked` and reason in double-negatives:

`src/loc/assessment/category.objectives.view.ts:1233` `f.input(...).toggle("readonly", isLocked)`
`src/loc/assessment/category.objectives.view.ts:1246` `f.select(...).toggle("disabled", isLocked)`
`src/loc/assessment/category.objectives.view.ts:1259` `Textarea(...).toggle("readonly", isLocked)`
`src/loc/assessment/questionnaire.view.ts:206`        `....toggle("disabled", isLocked)`

The select-must-use-disabled-not-readonly footgun is real: a field gated with `.toggle("readonly", ...)` on a `<select>` silently stays editable.

### Proposed API
On the form-control tags (`InputTag`, `TextareaTag`, `SelectTag`):
```typescript
// InputTag / TextareaTag  → readonly attribute
setEditable(editable: boolean): this;   // editable=false ⇒ readonly
// SelectTag               → disabled attribute (no readonly on <select>)
setEditable(editable: boolean): this;   // editable=false ⇒ disabled
```
Each element picks the attribute that actually makes it non-editable while staying form-submittable where possible. Positive polarity (`editable`) removes the double-negative.

### Before / After
```typescript
// before — author must know which attr each control honours
f.input("title", "text").toggle("readonly", isLocked)
f.select("status", opts).toggle("disabled", isLocked)
Textarea(action.details).toggle("readonly", isLocked)

// after — one verb, polarity flipped to the permission concept
const canEdit = !isLocked;
f.input("title", "text").setEditable(canEdit)
f.select("status", opts).setEditable(canEdit)
Textarea(action.details).setEditable(canEdit)
```

### Already in lib?
No. `.toggle("readonly"/"disabled", cond)` is the only path today. 6.1.x added `setEditable`-adjacent setters (`setContenteditable`) but nothing that maps an editable-permission to the correct gating attribute per control.

### Value: medium  ·  Effort: small

---

## 3. `MatchOr` default-branch ergonomics for role switches — (assessed, NOT proposed)

### Problem / evidence
Role-dispatched UI uses `Match(user.role, { LOC: …, COLLABORATOR: … }, () => DefaultNavActions())` (`src/loc/assessment/questionnaire.view.ts:478`). Only **one** such call site exists in PPS view code, and `Match` already supports the trailing default thunk plus the discriminated-union narrowing form. There is no recurring pain and no missing capability here.

### Already in lib?
Yes — `Match` with default branch and discriminant narrowing shipped (`src/control/conditionals.ts:118-148`).

### Value: low (no gap)  ·  not a finding.

---

## 4. Current-user / guard plumbing — out of core by design (NOT proposed)

PPS threads the user via `createContext` (`src/auth/current-user.context.ts`) and via per-view `user: AuthUser` props, and its guards (`requireAuth`, `requireRole`, `requireEventAccess`, the `?returnTo=` login redirect) live in `src/auth/auth.guards.ts`. All of this is request-lifecycle / DI / framework territory that v6 **explicitly excluded from core** (CHANGELOG "No context/DI in core"; MEMORY: no-framework-glue). Re-proposing a context or guard helper in core would contradict a settled decision. Flagged here only to show the lens was covered and the omission is intentional — these belong in the `@fluent-html/fastify` layer.

---

## Top picks
- **`.whenElse(cond, ifFn, elseFn)`** (high / small) — collapses the 17 paired `.when(x)/.when(!x)` permission-gate chains into one statement; states the predicate once and keeps both outcomes adjacent. Best ROI in this lens.
- **`setEditable(boolean)`** on input/textarea/select (medium / small) — single positive-polarity verb for the 20 readonly/disabled permission gates; closes the `<select>`-needs-`disabled`-not-`readonly` footgun.
- Explicitly **not** proposing: current-user context, guards, role-Match defaults — already shipped or deliberately deferred to the framework layer.
