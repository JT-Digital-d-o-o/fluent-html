# Lens: elements-symmetry — Element API consistency across `src/elements/*`

The element layer is broadly disciplined — typed setters, `defineSchemaKeys`, closed unions in `html-types.ts`, and a single `.toggle()` path for boolean attributes. The asymmetries that remain cluster in four places: (1) attribute families typed on one sibling but missing on another that shares them per spec (`formaction` on `ButtonTag` but not `InputTag`; `usemap` missing from the otherwise-complete image-map trio); (2) the same HTML attribute typed with different signatures across classes (`width`/`height` has five different signatures in seven classes); (3) space-separated token-list attributes handled three different ways (`setSandbox` variadic, `setHeaders`/`addHeaders` set+add pair, `setRel` single-token); and (4) `.toggle()` being add-only, so the one "accumulating" primitive violates last-call-wins in a way no `set*` does. All findings below were verified against source and, where behavioral, against `dist/`.

---

## elements-symmetry-1: InputTag lacks the submit/image attribute family that ButtonTag has

**Kind:** issue · **Severity:** high

**Evidence:** `src/elements/forms.ts:15-31` (InputTag fields) vs `src/elements/forms.ts:237-240, 280-299` (ButtonTag).

```typescript
// ButtonTag (forms.ts:237-240) — typed:
formaction?: string;
formmethod?: FormMethod;
formtarget?: BrowsingContext;
formenctype?: FormEnctype;
```

InputTag's field list (`forms.ts:16-31`) has none of these, yet per the HTML spec `formaction`/`formmethod`/`formenctype`/`formtarget` apply equally to `<input type="submit">` and `<input type="image">`. (`formnovalidate` is covered by `.toggle()` — `html-types.ts:224`.) Worse, `<input type="image">` requires `src` and `alt` — **`alt` is a11y-critical** and unreachable without `addAttribute`:

```
$ node → render(Input('submit').addAttribute('formaction','/alt'))
<input type="submit" formaction="/alt">   // works, but untyped escape hatch
```

The library's own CLAUDE.md brands `Button().addAttribute("type", ...)` as the anti-pattern, but for `Input("submit").setFormaction(...)` the escape hatch is the *only* path.

**Fix:** add `setFormaction`/`setFormmethod`/`setFormtarget`/`setFormenctype` (+ `setSrc`/`setAlt` for `type="image"`) to `InputTag`, mirroring ButtonTag's signatures. Optionally narrow via the existing overload machinery (`Input("submit"): SubmitInputTag`) the way `NumericInputTag`/`DateTimeInputTag` already narrow `setMin`/`setMax` (`forms.ts:122-138`).

---

## elements-symmetry-2: `setWidth`/`setHeight` has five different signatures across seven sibling classes

**Kind:** issue · **Severity:** high

**Evidence:** the same spec attribute (non-negative integer pixels on `img`, `video`, `canvas`, `iframe`, `embed`, `object`, `source`):

```typescript
// ImgTag       media.ts:36     setWidth(width?: string): this
// SourceTag    media.ts:128    setWidth(width: string | number): this   // String() coerced
// VideoTag     media.ts:153    setWidth(width: number): this            // required
// CanvasTag    media.ts:254    setWidth(width: number): this
// IframeTag    embedded.ts:29  setWidth(width?: string): this
// ObjectTag    embedded.ts:102 setWidth(width?: string): this
// EmbedTag     embedded.ts:140 setWidth(width?: string): this
// SvgTag       media.ts:280    setWidth(width: string | number): this
```

`Img().setWidth(800)` is a compile error while `Video().setWidth("800")` is a compile error in the opposite direction — for the identical attribute. Clearability also flips arbitrarily: `Img().setWidth(undefined)` clears, `Video()`/`Canvas()`/`Source()` cannot be cleared at all. Setting explicit `width`/`height` on `<img>` is the standard CLS (Core Web Vitals) fix, so `ImgTag` rejecting the natural `number` argument is the worst instance.

**Fix:** unify on the `SourceTag` shape everywhere: `setWidth(width?: string | number): this` with `this.width = width === undefined ? undefined : String(width)`. Same for `setHeight`.

---

## elements-symmetry-3: `.toggle()` is add-only — `toggle(name, false)` cannot remove, breaking last-call-wins

**Kind:** issue · **Severity:** medium

**Evidence:** `src/core/tag.ts:220-229`:

```typescript
toggle(name: BooleanAttribute, condition: boolean = true): this {
    if (condition) {
      if (this.toggles) {
        this.toggles.push(name);
      } else {
        this.toggles = [name];
      }
    }
    return this;
  }
```

`condition === false` is a silent no-op; nothing ever removes from `toggles` (the renderer only dedupes — `src/render/serialize.ts:297-306`). Verified against dist:

```
render(Input().toggle('required').toggle('required', false))  →  <input required>
```

Every value-bearing setter honors last-call-wins (`setType("a").setType(undefined)` clears; JSDoc at `tag.ts:139-144` states the convention: "set* methods override"). The boolean path is the sole primitive where a later call cannot override an earlier one, which breaks the library's own composition idiom: a preset applied via `.apply(disabledCard)` or a `.when()` branch that toggles `disabled` can never be re-enabled downstream. Under the house set/add convention this method behaves like an `add*` but is named like a switch.

**Fix:** make `condition: false` remove the name (`this.toggles = this.toggles?.filter(n => n !== name)`), giving `toggle` true toggle semantics and restoring last-call-wins. Cost: one array filter on an already-rare path; no render change needed.

---

## elements-symmetry-4: `setRel` is single-token while `rel` is a token list — inconsistent with the library's own token-list APIs

**Kind:** issue · **Severity:** medium

**Evidence:** `src/elements/links.ts:37-40`:

```typescript
setRel(rel?: LinkRel): this {
    this.rel = rel;
    return this;
  }
```

with `LinkRel` a union of *single* tokens + open tail (`html-types.ts:71-74`). The spec grammar for `rel` is a space-separated token set, and the single most common real-world value is the security pair `rel="noopener noreferrer"` on `target="_blank"` links. Today that only compiles by falling into the `(string & {})` escape hatch — zero autocomplete, and a typo like `"noopener norefferer"` type-checks. Meanwhile the library already has two better patterns for exactly this attribute shape: variadic closed tokens (`IframeTag.setSandbox(...tokens: SandboxToken[])`, `embedded.ts:57-60`) and a set/add pair (`ThTag.setHeaders`/`addHeaders`, `tables.ts:58-69`). Three token-list attributes, three different APIs.

**Fix:** `setRel(...rels: LinkRel[]): this { this.rel = rels.length ? rels.join(' ') : undefined; }` on `AnchorTag`, `AreaTag` (`links.ts:115-118`), and `LinkTag` (`document.ts:141-144`). Backward compatible — existing single-token calls are unchanged; each token gets autocomplete.

---

## elements-symmetry-5: `<ol start>`, `<ol type>`, `<li value>` unreachable — while the companion boolean `reversed` is typed

**Kind:** issue · **Severity:** medium

**Evidence:** `src/elements/lists.ts:9-15` — `Ol` and `Li` return plain `Tag` with no specialized class:

```typescript
export function Ol(...children: View[]): Tag {
  return El("ol", ...children);
}
```

Yet `BooleanAttribute` (`html-types.ts:225-227`) deliberately includes `'reversed'`, whose only host element is `<ol>`. So the boolean half of ordered-list numbering is a first-class typed API (`Ol().toggle("reversed")`), while its value-bearing companions `start` (resume numbering — pagination, the classic SSR use case), `type` (`'1'|'a'|'A'|'i'|'I'`), and `<li value>` all require `addAttribute("start", "11")`. Sibling comparison: tables got full numeric setters (`ThTag.setColspan`, `tables.ts:43`), and even niche elements like `ColTag.setSpan` are typed.

**Fix:** add `OlTag` (`setStart(start?: number)`, `setType(type?: '1'|'a'|'A'|'i'|'I')`) and `LiTag` (`setValue(value?: number)`) with `defineSchemaKeys`, matching the `ColTag` pattern.

---

## elements-symmetry-6: `AreaTag.setDownload` drops the `boolean` overload that `AnchorTag` has

**Kind:** issue · **Severity:** low

**Evidence:** `src/elements/links.ts:42-45` vs `links.ts:120-123`, in the same file:

```typescript
// AnchorTag (links.ts:42)
setDownload(download?: string | boolean): this {

// AreaTag (links.ts:120)
setDownload(download?: string): this {
```

Per WHATWG, `download` on `<area>` has the identical grammar to `<a>`: a valueless boolean form ("download with the resource's own name") or a filename string. `Area().setDownload(true)` is a compile error while the equivalent anchor call is fine — the field declarations diverge too (`download?: string | boolean` at `links.ts:17` vs `download?: string` at `links.ts:87`).

**Fix:** align `AreaTag` to `setDownload(download?: string | boolean)` — one-line signature + field change, render path already handles the boolean via the shared schema-key serializer.

---

## elements-symmetry-7: image-map trio incomplete — `MapTag`/`AreaTag` fully typed, but `ImgTag` has no `usemap`

**Kind:** issue · **Severity:** low

**Evidence:** `src/elements/links.ts:65-78` types `MapTag.setName`, `links.ts:80-135` types all eight `AreaTag` attributes, and `'ismap'` is in `BooleanAttribute` (`html-types.ts:225`) — but `ImgTag` (`media.ts:13-83`) has no `usemap` field or setter, so the attribute that actually *connects* an image to its map is unreachable without `addAttribute("usemap", "#name")` (including the easy-to-forget `#` prefix). The feature was evidently built as a set — three of its four legs are typed.

**Fix:** `ImgTag.setUsemap(name?: string): this` that normalizes the `#` prefix (`this.usemap = name === undefined ? undefined : (name.startsWith('#') ? name : '#' + name)`). Optionally the same on `ObjectTag` (`embedded.ts:85-116`), the only other `usemap` host.

---

## elements-symmetry-8: clear-by-`undefined` is arbitrary per class — `Video().setSrc` required, `Audio().setSrc` optional

**Kind:** pattern · **Severity:** low

**Evidence:** most element setters follow the "optional param, `undefined` clears" convention (e.g. `AudioTag.setSrc(src?: string)`, `media.ts:195`), but a scattered minority require the argument for no discernible reason, right next to optional siblings:

```typescript
// media.ts:163 — VideoTag (required)      vs  media.ts:195 — AudioTag (optional)
setSrc(src: string): this                     setSrc(src?: string): this
```

Also required-only: `VideoTag.setWidth/Height` (`media.ts:153-160`), `CanvasTag.setWidth/Height` (`media.ts:254-261`), `SourceTag.setWidth/Height` (`media.ts:128-135`), `ThTag.setColspan/setRowspan/setScope/setAbbr` (`tables.ts:43-56, 71-74`), `TdTag.setColspan/setRowspan` (`tables.ts:88-96`), `ColTag/ColgroupTag.setSpan` (`tables.ts:125, 140`), `SvgTag.setViewBox/setFill/setStroke` (`media.ts:290-308`). The inconsistency matters for conditional composition: `tag.setColspan(props.span)` fails to compile when `props.span` is `number | undefined`, forcing a `.when()` wrap that identical-shaped optional setters don't need.

**Fix:** adopt `arg?: T` (undefined clears) as the invariant for every value-bearing element setter; it is strictly widening, so this is a non-breaking sweep. Add an ESLint rule (the repo ships `fluent-html-eslint-plugin`) or a type-level test asserting every `set*` on element classes accepts `undefined`.
