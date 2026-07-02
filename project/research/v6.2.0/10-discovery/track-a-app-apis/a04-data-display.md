# Track A — App APIs · Data Display (a04)

Lens scope: tables, lists, cards, pagination, sorting headers, empty/loading/error states, badges/pills — repeated structures across `planet-positive-sport` (v5) and `pm-gui` (v6 template).

---

## 1. `stylers` / variant-map — token→style dispatch that the extractor can see

### Problem / evidence
The single most-repeated *structural* pattern in both apps is "map a runtime enum (status / role / scope / tone / align) to a set of fluent styles." Because `.background(variable)` / `.textColor(variable)` defeat the Tailwind extractor, every consumer reinvents a workaround:

- **pm-gui ships its own helper**: `/Users/tony/jt-digital/pm-gui/src/shared/stylers.ts` — a 27-line `stylers<K>(map)` factory whose entire docstring is "Prefer this over `.addClass(record[var])`: the fluent methods are typed AND statically visible to the Tailwind extractor." It's consumed in `/Users/tony/jt-digital/pm-gui/src/shared/ui/data.ts` (`ALIGN_FNS`, `alignText`) and the StatCard trend `Match(direction, {...})`.
- **planet-positive-sport (v5) takes the *broken* path**: `/Users/tony/jt-digital/planet-positive-sport/src/admin/emission-factors/views/emission-factors.components.ts:48` builds chips via `.background(props.palette.bg).textColor(props.palette.text)` where `palette.bg` is a runtime string like `"blue-100"` — extractor-invisible, requiring a safelist. The `CALC_PALETTE`/`SCOPE_PALETTE`/`KIND_PALETTE` records (lines 12-39) are exactly the `stylers` use-case, done the way that breaks tooling.
- The same `Record<status, {bg,text}>` → `Span(...).background(bg).textColor(text)` shape recurs in `organizations.view.ts:76` (`ApprovalBadge`), `:97` (`RoleBadge`), `:156` (`StatusBadge`), `organizations.detail.view.ts:69/91`, and `category-report.view.ts:342/352`.

This is library-shaped: it's a generic pattern, it interacts with the extractor (a library concern), and pm-gui's homegrown `stylers` is verbatim reusable.

### Proposed API
Promote `stylers` into the core barrel:
```ts
type Styler = <T extends Tag>(t: T) => T;
export function stylers<K extends string | number>(
  map: Record<K, (t: Tag) => Tag>,
): Record<K, Styler>;
```
Emits nothing itself; each value is a normal fluent chain, so the extractor sees every literal class. Pairs with the existing `.apply()`. (Optional sugar: `Tag.prototype.variant(key, map)` = `this.apply(stylers(map)[key])`.)

### Before / After
Before (pps, extractor-blind):
```ts
const SCOPE_PALETTE = { 1:{bg:"blue-100",text:"blue-700"}, ... };
Span(label).background(palette.bg).textColor(palette.text)   // needs safelist
```
After:
```ts
const scopeTone = stylers<1|2|3>({
  1: t => t.background("blue-100").textColor("blue-700"),
  2: t => t.background("pink-100").textColor("pink-700"),
  3: t => t.background("emerald-100").textColor("emerald-700"),
});
Span(label).apply(scopeTone[scope]);   // every class statically visible
```

### Already in lib?
No. No `stylers`/variant helper in `core/tag.ts` or the barrel. `.apply()` and `Match` exist but neither solves the typed-exhaustive-extractor-visible map.

**Value: high** — fixes a real extractor-correctness footgun (pps safelists today) and removes a file the v6 template had to author itself. **Effort: small** (lift pm-gui's 27 lines + tests + extractor doc).

---

## 2. `Badge` / `Pill` primitive (with tone variants)

### Problem / evidence
At least **13 files** across the two apps hand-roll a status badge: `Span(label).textSize("xs"|"[10px]").fontWeight("medium"|"semibold").padding("x", …).padding("y","0.5").rounded("full"|"md").background(bg).textColor(text)`. Examples:
- pps: `organizations.view.ts:87-95` (ApprovalBadge), `:109-117` (RoleBadge), `:156-175` (StatusBadge), `emission-factors.components.ts:48-56` (`Chip`), `contributors-card.view.ts:461` & `per-contributor.view.ts:193` (two *identical* private `Pill(label,bg,text)` functions — literal copy-paste across files).
- The shapes are uniform: pill = `rounded("full")`, chip = `rounded("md")`, sizes `xs`/`[10px]`, weight `medium`/`semibold`, padding `x-1.5/2/2.5` `y-0.5`.

Per the "instruction set, not components" memo, fluent-html ships primitives not a design system — but a `Badge`/`Pill` is exactly a *primitive* (the moral equivalent of `Button`), and `contributors-card`+`per-contributor` literally duplicating `Pill` is the convergence signal.

### Proposed API
```ts
type BadgeProps = { tone?: (t: Tag) => Tag; shape?: "pill" | "chip" };
export function Badge(label: View, props?: BadgeProps): Tag;   // Span, rounded-full default
```
Emits `<span class="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full …">`; `tone` is a `stylers`-style modifier (composes with finding #1). Returns a `Tag` so callers still chain.

### Before / After
```ts
// before — copy-pasted in 2 files
function Pill(label,bg,text){ return Span(label).textSize("[10px]")
  .fontWeight("semibold").padding("x","2").padding("y","0.5")
  .rounded("full").background(bg).textColor(text); }
// after
Badge(label, { tone: roleTone[role] })   // roleTone via stylers
```

### Already in lib?
No `Badge`/`Pill`/`Chip` export. The 6.1.x `.overlay()` example uses a `Badge("3")` in docs but it is **not** a shipped primitive — it's illustrative.

**Value: medium-high** — eliminates the single most-duplicated component in both apps; risk is the "no opinionated components" stance, so keep it unstyled-minimal + tone-driven. **Effort: small.**

---

## 3. Table-cell helpers `ThCell` / `TdCell` + `alignText` are independently reinvented in both apps

### Problem / evidence
The *same* `ThCell`/`TdCell` helpers exist, near-verbatim, in two unrelated codebases:
- pm-gui: `/Users/tony/jt-digital/pm-gui/src/shared/ui/data.ts:100-120` plus `alignText`/`ALIGN_FNS` (lines 86-98).
- pps: `/Users/tony/jt-digital/planet-positive-sport/src/shared/components/display/containers.ts:7-25` — same `ThCell({text,align})` / `TdCell({content,align})` signature, same padding/text-size/color.
- A third copy of the `<th>` styling is inlined as `thStyle()` in `emission-factors.list.view.ts:291-296`.

The `alignText` indirection only exists because `.textAlign(align)` with a runtime `align` breaks the extractor — i.e. it's a symptom of finding #1. If `stylers` ships, the cell helpers collapse to a few lines, but the recurrence still argues for a tiny `Table` ergonomics layer.

### Proposed API
Two options; recommend the smaller one:
- **(a) Ship `alignText(align)` only** as a built-in `stylers` instance for the closed `"left"|"right"|"center"` union (covers the extractor pain, leaves cell styling to apps). Pairs with finding #1.
- (b) A fuller `Th`/`Td` overload accepting `{ align }` — more surface, less clearly "primitive."

```ts
export function alignText(align: "left" | "right" | "center"): Styler;
```
Emits `text-left|text-right|text-center` as a literal class.

### Before / After
```ts
// before (both apps inline this)
const ALIGN_FNS = stylers<CellAlign>({ left:t=>t.textAlign("left"), … });
export function alignText(a){ return ALIGN_FNS[a]; }
// after
import { alignText } from "fluent-html";
Th(text).apply(alignText(align))
```

### Already in lib?
No. `.textAlign(align)` exists but with a runtime arg it's extractor-blind; no closed-union helper.

**Value: medium** — small, but it's the exact thing two teams wrote identically. Mostly subsumed by #1; ship `alignText` as the canonical demonstration. **Effort: small.**

---

## 4. `EmptyState` primitive

### Problem / evidence
`EmptyState` is hand-rolled at least **5 times**:
- pm-gui shared: `/Users/tony/jt-digital/pm-gui/src/shared/ui/data.ts:70-82` (`EmptyState({message, actionView})`).
- pm-gui per-page duplicates that ignore the shared one: `inbox.view.ts:58`, `archive.view.ts:49-55`, `decisions.view.ts:40` — each a `Div(icon, P(title), P(subtitle)).flex().flexDirection("col").alignItems("center")…padding("y", …)`.
- pps: `total-card.view.ts:206`, `per-contributor.view.ts:607`, `questionnaire.view.ts:527` (`FilterEmptyState`).

The shape is invariant: centered column, optional emoji/icon, muted title + sub-text, optional action. That the v6 template *already wrote one in `shared/ui`* and then *still re-inlined it three times* shows the per-page variants want a slightly richer signature (icon + sub-message).

### Proposed API
```ts
type EmptyStateProps = {
  icon?: View; title: string; message?: string; action?: View;
};
export function EmptyState(props: EmptyStateProps): Tag;
```
Emits the centered `flex-col items-center gap-2 py-16 text-center` column with muted text. Returns a `Tag` for further chaining.

### Before / After
```ts
// before (archive.view.ts:49)
Div(Span("📦").textSize("2xl"),
    P("No archived scopes yet.").textColor("gray-500").textSize("sm"),
    P("Move a closed scope…").textColor("gray-400").textSize("xs"))
  .flex().flexDirection("col").alignItems("center").gap("2").padding("y","16")
// after
EmptyState({ icon: Span("📦").textSize("2xl"),
  title: "No archived scopes yet.",
  message: "Move a closed scope under an archive/ directory to retire it." })
```

### Already in lib?
No core export. pm-gui's own `EmptyState` is app-land and lacks `icon`/`message`, which is why pages bypass it.

**Value: medium** — borderline "opinionated component," but empty-state is as generic as it gets and is provably re-written 5×. Keep styling minimal/overridable. **Effort: small.**

---

## 5. `Pagination` primitive

### Problem / evidence
pm-gui hand-rolls pagination in `/Users/tony/jt-digital/pm-gui/src/shared/ui/data.ts:130-145`: prev/next links + "Page X of Y", guarded by `IfThen(totalPages > 1)` and `IfThen(page>1)/(page<totalPages)`. pps has `page=`/`pageSize` plumbing in `analytics/views/event-log.view.ts` and the admin dashboard recent/attention views. The prev/next/page-count + edge-guard logic is identical boilerplate everywhere paging appears.

### Proposed API
```ts
type PaginationProps = {
  page: number; totalPages: number;
  renderLink: (page: number, label: View) => View;   // app supplies the htmx/href
  labels?: { prev?: string; next?: string; status?: (p:number,t:number)=>string };
};
export function Pagination(props: PaginationProps): Tag | null;
```
The library owns the guard/layout logic; the app owns the link (so it stays htmx-agnostic — no framework glue, per the "no framework glue" memo). Renders nothing when `totalPages <= 1`.

### Before / After
Replaces the 16-line `Pagination` in `data.ts` with an import; callers pass only `renderLink`.

### Already in lib?
No. Nothing pagination-related in the barrel or `patterns.ts`.

**Value: medium** — the guard/edge logic is the bug-prone part and is pure; the htmx-free `renderLink` seam keeps it core-appropriate. **Effort: small-medium.**

---

## 6. (Lower) Dynamic-percent sizing for progress bars — `w("%", expr)` / inline-style escape

### Problem / evidence
Progress bars drop to raw inline style because the unit overloads take literals, not runtime values: `/Users/tony/jt-digital/pm-gui/src/app/archive/archive.view.ts:39` and `overview.view.ts:196` both do `Div().h("full").rounded("full").background(...).setStyle(\`width:${pct}%\`)`. The surrounding track-bar shape (`w-32 h-1.5 bg-gray-100 rounded-full overflow-hidden`) is also duplicated.

### Proposed API
Minimal: document/confirm `.addStyle({ width: \`${pct}%\` })` (6.1.x `addStyle` already exists) as the blessed path, OR a tiny `.sizePct("w", n)` emitter for runtime percents. Not a `ProgressBar` component (too opinionated), just remove the raw-string `setStyle`.

### Already in lib?
Partly — `addStyle` shipped in 6.1.x and is the right tool; the gap is only that apps still reach for stringly `setStyle`. Mostly a docs/guidance fix.

**Value: low.** **Effort: small.**

---

## Top picks
- **`stylers` / variant-map in core (#1)** — highest leverage: pm-gui already wrote it, pps does the extractor-breaking thing for lack of it, and it unlocks #2/#3 cleanly.
- **`Badge`/`Pill` primitive (#2)** — most-duplicated component (13 files; two byte-identical `Pill` copies).
- **`EmptyState` (#4)** and **`Pagination` (#5)** — pure, generic, re-written 5×/everywhere-paged; the v6 template itself authored both in `shared/ui/data.ts`.
- `alignText` (#3) ships as the canonical `stylers` instance; #6 is a docs nudge toward `addStyle`.
