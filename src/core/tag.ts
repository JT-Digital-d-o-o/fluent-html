import { setDiscriminant } from "./proto.js";
import { devChecks, assertMutable, countParents } from "./dev-checks.js";
import type { ResolvedSchemaKey } from "./proto.js";
import type { HTMX } from "../htmx.js";
import type { Id, Rooted } from "../ids.js";
import { isId, extractId } from "../ids.js";
import type { View } from "./types.js";
import type { BooleanAttribute, PopoverState, PopoverAction, EnterKeyHint, ContentEditable, Autocapitalize, Spellcheck } from "../elements/html-types.js";
import type { AriaRole, AriaAttrs } from "./aria-types.js";

/** @internal Shared empty attributes object — never mutate */
export const EMPTY_ATTRS: Record<string, string> = Object.freeze(Object.create(null)) as Record<string, string>;

// Attribute key must be a valid HTML attribute name
const VALID_ATTR_KEY = /^[a-zA-Z_][a-zA-Z0-9\-_:.]*$/;

// Event handler attributes — blocked by default to prevent XSS
const EVENT_HANDLER_RE = /^on[a-z]/i;

// Prototype pollution keys
const PROTO_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

// camelCase → kebab-case for style / data-* / aria-* keys.
// Module-level regex + callback so no closure is allocated per call.
const KEBAB_RE = /[A-Z]/g;
const kebabReplacer = (letter: string): string => '-' + letter.toLowerCase();
function kebabCase(key: string): string {
  return key.replace(KEBAB_RE, kebabReplacer);
}

function validateAttributeKey(key: string): void {
  if (PROTO_KEYS.has(key)) {
    throw new Error(`Attribute key "${key}" is blocked (prototype pollution)`);
  }
  if (!VALID_ATTR_KEY.test(key)) {
    throw new Error(`Invalid attribute key: "${key}"`);
  }
  if (EVENT_HANDLER_RE.test(key)) {
    throw new Error(`Event handler attribute "${key}" is blocked — use .behavior() instead of an inline on* handler`);
  }
}

// ── method augmentation seam (C-02 sibling) ─────────────────────────
// EMPTY interface an app augments to type chainable methods it registers on
// `Tag.prototype`. `Tag extends FluentCustomMethods`, so the methods land on
// every Tag (and subclass); `this` returns keep the chain typed:
//   declare module "fluent-html" {
//     interface FluentCustomMethods { nav(route: HTMX): this }
//   }
export interface FluentCustomMethods {}
export interface Tag extends FluentCustomMethods {}

/**
 * The core HTML element builder. All element factories (`Div`, `Button`, `Input`, etc.)
 * create `Tag` instances. Provides chainable methods for attributes, classes, styles,
 * HTMX integration, and Tailwind CSS styling.
 *
 * @example
 * Div(H1("Hello"), P("World"))
 *   .setId(ids.main)
 *   .p("4")
 *   .bg("white")
 *   .setHtmx("/api/content")
 */
export class Tag {
  el: string;
  child: View;

  // Storage is protected and `_`-prefixed so no public field shadows its setter — a
  // blind `.id("x")` guess errors as a missing property, not a "String has no call
  // signatures" cascade. The serializer reads the storage through an internal cast.
  protected _id?: string;
  protected _class?: string;
  protected _style?: string;
  // Public type is Readonly: the bag defaults to a shared frozen object (EMPTY_ATTRS), so a
  // direct `tag.attributes.foo = "x"` would compile then throw at runtime. Go through
  // addAttribute()/setDataAttrs()/setAria() (which swap in a fresh mutable record first).
  declare attributes: Readonly<Record<string, string>>;
  protected _htmx?: HTMX;
  toggles?: string[];

  /** @internal type discriminant for fast render checks */
  declare readonly _t: 1;
  /** @internal Normalized [storage, attr] schema keys for element-specific attributes */
  declare readonly _sk?: readonly ResolvedSchemaKey[];
  /** @internal `Document()` brand — when true, the emitter prefixes `<!DOCTYPE html>`. */
  declare readonly _doc?: true;

  constructor(element: string, ...children: View[]) {
    this.el = element;
    this.child = children.length === 0 ? "" : children.length === 1 ? children[0]! : children;
    if (devChecks) countParents(children);
  }

  /**
   * Set the element's `id` attribute. Accepts a string or a type-safe `Id` object.
   *
   * Passing a typed `Id` brands the result `Rooted<N>`, so "this element carries id N"
   * becomes a fact the type system knows. A consumer can then require a view rooted at a
   * particular id — `renderFragment(ids.userCount, view)` — and a mismatch is a compile
   * error naming both ids, rather than markup that silently morphs the target away.
   *
   * The brand rides on the polymorphic `this` type, so it survives the rest of a fluent
   * chain (`.setId(ids.x).p("4").bg("surface")`) and any control-flow helper that
   * preserves its branch types. A dynamic `setId(someString)` is deliberately unbranded:
   * a runtime-computed id is not a compile-time guarantee.
   *
   * @param id - The ID string or Id object (from `defineIds` / `createId`)
   * @returns `this` for chaining, branded when the id is a typed `Id`
   *
   * @example
   * Div("Content").setId(ids.mainContent)   // Tag & Rooted<"main-content">
   * Div("Content").setId("main-content")    // Tag — a bare string proves nothing
   */
  setId<const N extends string>(id: Id<N>): this & Rooted<N>;
  setId(id?: string): this;
  setId(id?: string | Id): this {
    if (devChecks) assertMutable(this, "setId");
    this._id = id ? (isId(id) ? id.id : id) : undefined;
    return this;
  }

  /**
   * Set the element's `class` attribute, replacing any existing classes.
   *
   * @param c - The class string
   * @returns `this` for chaining
   *
   * @example
   * Div("Content").setClass("container mx-auto")
   */
  setClass(c?: string): this {
    if (devChecks) assertMutable(this, "setClass");
    this._class = c;
    return this;
  }

  /**
   * Read the accumulated `class` attribute value (or `undefined` when unstyled).
   * The storage field is protected so it cannot shadow `setClass`; framework code
   * that inspects a built tag's classes reads through this accessor.
   *
   * @example
   * const isInteractive = /(?:^|\s)cursor-/.test(tag.getClass() ?? "")
   */
  getClass(): string | undefined {
    return this._class;
  }

  /**
   * Append classes to the element's existing `class` attribute.
   *
   * @internal The raw emitter primitive every fluent styling method calls — not
   * a styling API. Author styles through the typed methods; for arbitrary CSS
   * use `.cssProp()`, for non-Tailwind classes (JS/CSS hooks, third-party)
   * use `.cssClass()`, for runtime-computed styles use `.setStyle()`.
   *
   * @param c - Space-separated class names to add
   * @returns `this` for chaining
   */
  addClass(c: string): this {
    if (devChecks) assertMutable(this, "addClass");
    const classes = this._variantPrefix
      ? (c.indexOf(' ') === -1
          ? this._variantPrefix + ':' + c
          : c.split(" ").map(cls => `${this._variantPrefix}:${cls}`).join(" "))
      : c;
    if (this._class) {
      this._class += ' ' + classes;
    } else {
      this._class = classes;
    }
    return this;
  }

  /**
   * Set the element's inline `style` attribute, **replacing** any existing style.
   *
   * Per the library convention, `set*` methods override and `add*` methods
   * accumulate — so `setStyle(...).setStyles(...)` keeps only the last call.
   * (Class names are the opposite: `setClass` replaces, `addClass` appends.)
   *
   * @param style - CSS style string
   * @returns `this` for chaining
   *
   * @example
   * Div("Content").setStyle("color: red; font-size: 16px")
   */
  setStyle(style?: string): this {
    if (devChecks) assertMutable(this, "setStyle");
    this._style = style;
    return this;
  }

  /**
   * Append a CSS declaration to the inline `style` attribute, **accumulating** onto
   * any existing style (the `add*` counterpart to `setStyle`, which replaces). Pass a
   * single `prop: value` string; declarations are joined with `; `. Use for one-off
   * inline declarations that aren't Tailwind utilities — e.g. CSS anchor idents, whose
   * dynamic values a static class extractor can't resolve.
   *
   * @param declaration - A CSS declaration, e.g. `"anchor-name: --menu"`
   * @returns `this` for chaining
   *
   * @example
   * Div().setStyle("color: red").addStyle("anchor-name: --menu")
   * // → style="color: red; anchor-name: --menu"
   */
  addStyle(declaration: string): this {
    if (devChecks) assertMutable(this, "addStyle");
    const existing = this._style?.trim().replace(/;+$/, "");
    this._style = existing ? `${existing}; ${declaration}` : declaration;
    return this;
  }

  /**
   * Add a custom HTML attribute. Validates the key against XSS and prototype pollution.
   * Prefer typed setter methods (e.g. `.setType()`, `.setPlaceholder()`) over this.
   *
   * @param key - The attribute name
   * @param value - The attribute value
   * @returns `this` for chaining
   *
   * @example
   * Div("Content").addAttribute("data-testid", "my-div")
   */
  addAttribute(key: string, value: string): this {
    if (devChecks) assertMutable(this, "addAttribute");
    validateAttributeKey(key);
    if (this.attributes === EMPTY_ATTRS) {
      this.attributes = Object.create(null) as Record<string, string>;
    }
    (this.attributes as Record<string, string>)[key] = value;
    return this;
  }

  /**
   * Set a CSP nonce on this element (typically for inline script/style tags).
   *
   * @example
   * Script("console.log('hi')").setNonce(nonce)
   * Style(".cls { color: red }").setNonce(nonce)
   */
  setNonce(nonce: string): this {
    if (devChecks) assertMutable(this, "setNonce");
    if (this.attributes === EMPTY_ATTRS) {
      this.attributes = Object.create(null) as Record<string, string>;
    }
    (this.attributes as Record<string, string>)['nonce'] = nonce;
    return this;
  }

  /**
   * Set a boolean HTML attribute on/off. With no condition, adds it. With a condition,
   * `false` **removes** any previously-added instance — so a later call wins, matching
   * the `set*` last-call-wins convention (a `.apply()` preset or `.when()` branch that
   * toggled `disabled` can be re-enabled downstream).
   *
   * @example
   * Input().toggle("required")                     // required
   * Input().toggle("required", isRequired)         // conditional
   * Input().toggle("disabled").toggle("disabled", false)  // removed — renders nothing
   */
  toggle(name: BooleanAttribute, condition: boolean = true): this {
    if (devChecks) assertMutable(this, "toggle");
    if (condition) {
      if (this.toggles) {
        if (!this.toggles.includes(name)) this.toggles.push(name);
      } else {
        this.toggles = [name];
      }
    } else if (this.toggles) {
      this.toggles = this.toggles.filter((n) => n !== name);
    }
    return this;
  }

  /**
   * Conditionally modify this tag. With a boolean, the modifier runs when it is
   * `true`. With a nullable value, the modifier runs when the value is **non-null**
   * (`!= null`) — mirroring `whenElse`/`IfThen` — and the callback receives the
   * narrowed non-null value. Falsy-but-present values (`0`, `""`) take the run branch.
   * The modifier's return value is ignored, so a base-`Tag` style-fn composes onto any
   * subclass.
   *
   * @example
   * Button("Save")
   *   .when(isLoading, t => t.toggle("disabled").opacity("50"))
   *   .when(isPrimary, t => t.bg("blue-500").text("white"))
   *   .when(user.avatar, (t, avatar) => t.addChild(Img().setSrc(avatar)))
   */
  // A boolean-containing T is rejected on the value overload: the runtime `typeof
  // === "boolean"` branch treats it as a condition and calls fn without the value, so
  // a `boolean | null` would pass `undefined` as a typed-boolean value. Plain `boolean`
  // still resolves to the boolean overload below; nullable values must be non-boolean.
  when<T>(condition: boolean extends T ? never : T | null | undefined, fn: (tag: this, value: NonNullable<T>) => unknown): this;
  when(condition: boolean, fn: (tag: this) => unknown): this;
  when<T>(condition: T | null | undefined | boolean, fn: (tag: this, value: NonNullable<T>) => unknown): this {
    if (typeof condition === "boolean") {
      if (condition) (fn as (tag: this) => unknown)(this);
    } else if (condition != null) {
      fn(this, condition as NonNullable<T>);
    }
    return this;
  }

  /**
   * Two-branch conditional modifier — mirrors `IfThenElse`, NOT truthiness. With a
   * boolean it runs `thenFn`/`elseFn`; with a nullable value it narrows the non-null
   * value into `thenFn`. Falsy-but-present values (`""`, `0`) take the `thenFn` branch.
   *
   * @example
   * Button("Save").whenElse(isLoading, t => t.toggle("disabled"), t => t.bg("blue-500"))
   * Span().whenElse(user.name, (t, name) => t.setTitle(name), t => t.setTitle("Anon"))
   */
  whenElse(condition: boolean, thenFn: (tag: this) => unknown, elseFn: (tag: this) => unknown): this;
  // See `when`: a boolean-containing T is rejected on the value overload (runtime treats
  // it as a condition). Plain `boolean` uses the boolean overload above.
  whenElse<T>(value: boolean extends T ? never : T | null | undefined, thenFn: (tag: this, value: NonNullable<T>) => unknown, elseFn: (tag: this) => unknown): this;
  whenElse<T>(condition: T | null | undefined | boolean, thenFn: (tag: this, value: NonNullable<T>) => unknown, elseFn: (tag: this) => unknown): this {
    if (typeof condition === "boolean") {
      if (condition) (thenFn as (tag: this) => unknown)(this); else elseFn(this);
    } else if (condition != null) {
      thenFn(this, condition as NonNullable<T>);
    } else {
      elseFn(this);
    }
    return this;
  }

  /**
   * Match-on-discriminant conditional modifier — the chain-level mirror of `Match`,
   * completing the family (`IfThen → when`, `IfThenElse → whenElse`, `Match → whenMatch`).
   * Runs the case modifier for the discriminant's current value. Exhaustive in the
   * two-argument form (every member of `T` must have a case — a missing key is a
   * compile error); supply a `defaultFn` to match a subset. Prefer this over chained
   * `.when(x === "a", …).when(x === "b", …)` on one discriminant, which is
   * non-exhaustive and re-tests the value per branch.
   *
   * Keep each branch's fluent calls literal (`t.maxW("lg")`, not `t.maxW(key)`) so
   * the Tailwind extractor can see the classes statically.
   *
   * @example
   * Span(status).whenMatch(status, {   // status: "active" | "closed"
   *   active: t => t.bg("green-100").text("green-700"),
   *   closed: t => t.bg("gray-100").text("gray-600"),
   * })
   * Button(label).whenMatch(tone, { danger: t => t.bg("red-500") }, t => t.bg("gray-200"))
   */
  // See `MatchValue`: a widened `string`/`number` collapses `{ [K in T]: … }` to an index
  // signature, so any subset satisfies the "exhaustive" form while a real miss silently
  // no-ops. Reject the widened value here so it must use the partial-with-default form.
  whenMatch<T extends string | number>(value: string extends T ? never : number extends T ? never : T, cases: { [K in T]: (tag: this) => unknown }): this;
  whenMatch<T extends string | number>(value: T, cases: Partial<{ [K in T]: (tag: this) => unknown }>, defaultFn: (tag: this) => unknown): this;
  whenMatch(value: string | number, cases: Record<string | number, (tag: this) => unknown>, defaultFn?: (tag: this) => unknown): this {
    const fn = Object.prototype.hasOwnProperty.call(cases, value) ? cases[value] : defaultFn;
    if (fn) fn(this);
    return this;
  }

  /**
   * Apply one or more modifier functions to this tag. Enables reusable,
   * composable styling and behavior.
   *
   * @example
   * const card = (t: Tag) => t.setClass("rounded shadow p-4 bg-white");
   * const danger = (t: Tag) => t.addClass("border-red-500 text-red-700");
   *
   * Div("Warning").apply(card, danger)
   */
  apply(...fns: ((tag: this) => unknown)[]): this {
    for (const fn of fns) fn(this);
    return this;
  }

  /**
   * Append one or more children, normalizing the scalar/array `child` union. The
   * structural counterpart to `apply`/`when` (which mutate classes/attrs, not children) —
   * lets you build a tag and then conditionally add children during fluent composition.
   * Appended children are escaped by default, exactly like constructor children.
   *
   * @example
   * Button("Save").when(isLoading, t => t.addChild(Spinner()))
   * Ul().apply(list).addChild(...users.map(u => Li(u.name)))
   */
  addChild(...views: View[]): this {
    if (views.length === 0) return this;
    if (devChecks) { assertMutable(this, "addChild"); countParents(views); }
    const current = this.child;
    if (current === "" || current === undefined || current === null) {
      this.child = views.length === 1 ? views[0]! : views;
    } else if (Array.isArray(current)) {
      current.push(...views);
    } else {
      this.child = [current, ...views];
    }
    return this;
  }

  /**
   * Set multiple CSS classes, filtering out falsy values.
   *
   * @param classes - Array of class names (falsy values are filtered out)
   * @returns this (for chaining)
   *
   * @example
   * Button("Save").setClasses([
   *   "btn",
   *   props.disabled && "btn-disabled",
   *   props.variant === "primary" ? "btn-primary" : "btn-secondary"
   * ])
   */
  setClasses(classes: (string | false | null | undefined)[]): this {
    if (devChecks) assertMutable(this, "setClasses");
    this._class = classes.filter(Boolean).join(" ");
    return this;
  }

  /**
   * Set multiple inline styles from an object, **replacing** any existing style
   * (`set*` overrides; it does not merge). Build the full style in one call.
   *
   * @param styles - Object mapping CSS property names to values
   * @returns this (for chaining)
   *
   * @example
   * Div().setStyles({
   *   width: "100px",
   *   height: "50px",
   *   backgroundColor: "blue"
   * })
   */
  setStyles(styles: Record<string, string | number>): this {
    if (devChecks) assertMutable(this, "setStyles");
    const styleString = Object.entries(styles)
      .map(([key, value]) => `${kebabCase(key)}: ${value}`)
      .join("; ");
    this._style = styleString;
    return this;
  }

  /**
   * Set multiple data-* attributes at once. Each computed `data-*` key is validated:
   * a markup-breaking key (quotes, spaces, `=`) throws, like `setAria`/`addAttribute`.
   * (The `data-` prefix makes `__proto__`/`on*` keys valid-but-inert, so those don't throw.)
   *
   * @param attrs - Object mapping data attribute names (without 'data-' prefix) to values
   * @returns this (for chaining)
   *
   * @example
   * Button("Click").setDataAttrs({
   *   testid: "submit-btn",
   *   action: "save",
   *   userId: "123"
   * })
   * // Renders: <button data-testid="submit-btn" data-action="save" data-user-id="123">
   */
  setDataAttrs(attrs: Record<string, string>): this {
    if (devChecks) assertMutable(this, "setDataAttrs");
    if (this.attributes === EMPTY_ATTRS) this.attributes = Object.create(null) as Record<string, string>;
    for (const [key, value] of Object.entries(attrs)) {
      const attrKey = `data-${kebabCase(key)}`;
      validateAttributeKey(attrKey);
      (this.attributes as Record<string, string>)[attrKey] = value;
    }
    return this;
  }

  /**
   * Set the ARIA `role` attribute (the role goes on `role=`, not `aria-role`).
   *
   * @example
   * Div("Alert").setRole("alert")
   * Ul().setRole("menu")
   */
  setRole(role: AriaRole): this {
    return this.addAttribute("role", role);
  }

  /**
   * Set the `tabindex` attribute (focus order). `0` makes a non-interactive
   * element focusable; `-1` makes it programmatically focusable but not tabbable.
   *
   * @example
   * Div("Focusable").setTabindex(0)
   */
  setTabindex(index: number): this {
    return this.addAttribute("tabindex", String(index));
  }

  /**
   * Set the `title` **attribute** (the native tooltip) — NOT the `<title>` element.
   *
   * @example
   * Button("?").setTitle("Show help")
   */
  setTitle(title: string): this {
    return this.addAttribute("title", title);
  }

  /**
   * Set ARIA state/property attributes for accessibility. Keys are the bare ARIA
   * names (`label`, `haspopup`, `labelledby`) and are prefixed with `aria-` — they
   * are NOT kebab-cased, so single-token names stay correct (`aria-haspopup`, not
   * `aria-has-popup`). State values accept a real `boolean` or the tristate
   * `"mixed"`. A full `aria-*` key may be passed verbatim for non-standard attributes.
   *
   * @example
   * Button("Menu").setAria({
   *   label: "Open menu",
   *   expanded: false,
   *   haspopup: true,
   *   controls: "menu-panel"
   * })
   */
  setAria(attrs: AriaAttrs): this {
    if (devChecks) assertMutable(this, "setAria");
    if (this.attributes === EMPTY_ATTRS) this.attributes = Object.create(null) as Record<string, string>;
    for (const [key, value] of Object.entries(attrs)) {
      if (value === undefined) continue;
      const attrKey = key.startsWith("aria-") ? key : `aria-${key}`;
      validateAttributeKey(attrKey);
      (this.attributes as Record<string, string>)[attrKey] = String(value);
    }
    return this;
  }

  /**
   * Mark this element a popover (native Popover API — top-layer, zero JS). A bare
   * call defaults to `"auto"` (light-dismiss: click-outside + Esc, one-open-per-group);
   * `"manual"` requires an explicit invoker to dismiss.
   *
   * @example
   * Div(...).setId(ids.menu).setPopover()          // popover="auto"
   * Div(...).setPopover("manual")                  // popover="manual"
   */
  setPopover(state: PopoverState = "auto"): this {
    return this.addAttribute("popover", state);
  }

  /**
   * Wire this element (any invoker — `<button>`/`<a>`/…) to a popover by `Id`,
   * rendering `popovertarget="<id>"`. Reuse the popover's own `Id` so the link is
   * provable. The id is `escapeAttr`'d at render like every attribute value.
   *
   * @example
   * Button("Account").setPopovertarget(ids.userMenu)
   */
  setPopovertarget(target: Id): this {
    return this.addAttribute("popovertarget", extractId(target));
  }

  /**
   * Set the invoker action (`"show"` | `"hide"` | `"toggle"`). Omit the argument to
   * emit no attribute and rely on the native default (`toggle`) — never a `=""`.
   *
   * @example
   * Button("Open").setPopovertarget(ids.menu).setPopovertargetaction("show")
   */
  setPopovertargetaction(action?: PopoverAction): this {
    return action === undefined ? this : this.addAttribute("popovertargetaction", action);
  }

  /** Set `lang` (subtree language) on any element. `HtmlTag` keeps its own document-level setter. */
  setLang(lang?: string): this {
    return lang === undefined ? this : this.addAttribute("lang", lang);
  }

  /** Set `dir` (text direction) on any element. */
  setDir(dir?: 'ltr' | 'rtl' | 'auto'): this {
    return dir === undefined ? this : this.addAttribute("dir", dir);
  }

  /** Set `translate` — whether this element's text is translated when the page is localized. */
  setTranslate(value?: 'yes' | 'no'): this {
    return value === undefined ? this : this.addAttribute("translate", value);
  }

  /** Set `enterkeyhint` — the action label on a mobile virtual keyboard's Enter key. */
  setEnterkeyhint(hint: EnterKeyHint): this {
    return this.addAttribute("enterkeyhint", hint);
  }

  /** Make the element editable. Bare call defaults to `"true"`; `"plaintext-only"` strips rich formatting. */
  setContenteditable(value: ContentEditable = "true"): this {
    return this.addAttribute("contenteditable", value);
  }

  /** Set `spellcheck` (the enumerated `"true"`/`"false"` string, not a boolean attribute). */
  setSpellcheck(value: Spellcheck = "true"): this {
    return this.addAttribute("spellcheck", value);
  }

  /** Set `autocapitalize` for on-screen-keyboard input. */
  setAutocapitalize(value: Autocapitalize): this {
    return this.addAttribute("autocapitalize", value);
  }

  /**
   * `hidden="until-found"` — hidden, but revealable by in-page find (Ctrl-F) and
   * scroll-to-text-fragment (it expands and fires `beforematch`). Plain hiding is `.toggle("hidden")`.
   */
  setHidden(value: "until-found"): this {
    return this.addAttribute("hidden", value);
  }

  /**
   * Schema.org microdata (`itemtype`/`itemprop`/`itemref`/`itemid`) for structured-data SEO —
   * the value-bearing counterpart to the `itemscope` boolean (`.toggle("itemscope")`). Setting
   * `type` also marks the element an item scope (an `itemtype` without `itemscope` is invalid).
   *
   * @example
   * Article().setMicrodata({ type: "https://schema.org/Article" })  // itemscope itemtype="…"
   * Span(author).setMicrodata({ prop: "author" })
   */
  setMicrodata(attrs: { type?: string; prop?: string; ref?: string; id?: string }): this {
    if (attrs.type !== undefined) { this.toggle("itemscope"); this.addAttribute("itemtype", attrs.type); }
    if (attrs.prop !== undefined) this.addAttribute("itemprop", attrs.prop);
    if (attrs.ref !== undefined) this.addAttribute("itemref", attrs.ref);
    if (attrs.id !== undefined) this.addAttribute("itemid", attrs.id);
    return this;
  }

  /**
   * Associate a form-associated control (`input`/`button`/`select`/`textarea`/`output`/`fieldset`)
   * with a `<form>` elsewhere in the document by its `id` — e.g. a submit button in a sticky
   * footer outside the `<form>`. Accepts a string or `Id`.
   */
  setForm(form?: string | Id): this {
    return form === undefined ? this : this.addAttribute("form", extractId(form));
  }

  /**
   * @internal The gated write path for the `_htmx` storage — called by the
   * prototype-registered htmx mixin methods (`setHtmx`, `hxGet`, …), which sit
   * outside the class body and so cannot write the private field directly.
   */
  _setHx(htmx: HTMX | undefined, method: string): this {
    if (devChecks) assertMutable(this, method);
    this._htmx = htmx;
    return this;
  }

  /** @internal Variant prefix state — used by tailwind-methods mixin */
  _variantPrefix: string | null = null;

  /**
   * @internal Render epoch this tag was last serialized in (0 = never). Written
   * by the emitter, read by the dev-mode mutation gate. Declared as a field so
   * every instance shares one hidden class.
   */
  _e: number = 0;

  /** @internal How many parents have taken this tag as a child (dev-mode aliasing gate). */
  _p: number = 0;
}

setDiscriminant(Tag, 1);
Tag.prototype.attributes = EMPTY_ATTRS;
