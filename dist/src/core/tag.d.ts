import type { SchemaKey } from "./proto.js";
import type { HTMX } from "../htmx.js";
import type { Id } from "../ids.js";
import type { View } from "./types.js";
import type { BooleanAttribute, PopoverState, PopoverAction, EnterKeyHint, ContentEditable, Autocapitalize, Spellcheck } from "../elements/html-types.js";
import type { AriaRole, AriaAttrs } from "./aria-types.js";
/** @internal Shared empty attributes object — never mutate */
export declare const EMPTY_ATTRS: Record<string, string>;
export interface FluentCustomMethods {
}
export interface Tag extends FluentCustomMethods {
}
/**
 * The core HTML element builder. All element factories (`Div`, `Button`, `Input`, etc.)
 * create `Tag` instances. Provides chainable methods for attributes, classes, styles,
 * HTMX integration, and Tailwind CSS styling.
 *
 * @example
 * Div(H1("Hello"), P("World"))
 *   .setId(ids.main)
 *   .padding("4")
 *   .background("white")
 *   .setHtmx("/api/content")
 */
export declare class Tag {
    el: string;
    child: View;
    id?: string;
    class?: string;
    style?: string;
    attributes: Record<string, string>;
    htmx?: HTMX;
    toggles?: string[];
    /** @internal type discriminant for fast render checks */
    readonly _t: 1;
    /** @internal Schema keys for element-specific attributes */
    readonly _sk?: readonly SchemaKey[];
    /** @internal `Document()` brand — when true, the emitter prefixes `<!DOCTYPE html>`. */
    readonly _doc?: true;
    constructor(element: string, ...children: View[]);
    /**
     * Set the element's `id` attribute. Accepts a string or a type-safe `Id` object.
     *
     * @param id - The ID string or Id object (from `defineIds` / `createId`)
     * @returns `this` for chaining
     *
     * @example
     * Div("Content").setId(ids.mainContent)
     * Div("Content").setId("main-content")
     */
    setId(id?: string | Id): this;
    /**
     * Set the element's `class` attribute, replacing any existing classes.
     *
     * @param c - The class string
     * @returns `this` for chaining
     *
     * @example
     * Div("Content").setClass("container mx-auto")
     */
    setClass(c?: string): this;
    /**
     * Append classes to the element's existing `class` attribute.
     *
     * @param c - Space-separated class names to add
     * @returns `this` for chaining
     *
     * @example
     * Div("Content").setClass("p-4").addClass("bg-white rounded")
     */
    addClass(c: string): this;
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
    setStyle(style?: string): this;
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
    addStyle(declaration: string): this;
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
    addAttribute(key: string, value: string): this;
    /**
     * Set a CSP nonce on this element (typically for inline script/style tags).
     *
     * @example
     * Script("console.log('hi')").setNonce(nonce)
     * Style(".cls { color: red }").setNonce(nonce)
     */
    setNonce(nonce: string): this;
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
    toggle(name: BooleanAttribute, condition?: boolean): this;
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
     *   .when(isPrimary, t => t.background("blue-500").textColor("white"))
     *   .when(user.avatar, (t, avatar) => t.addChild(Img().setSrc(avatar)))
     */
    when<T>(condition: boolean extends T ? never : T | null | undefined, fn: (tag: this, value: NonNullable<T>) => unknown): this;
    when(condition: boolean, fn: (tag: this) => unknown): this;
    /**
     * Two-branch conditional modifier — mirrors `IfThenElse`, NOT truthiness. With a
     * boolean it runs `thenFn`/`elseFn`; with a nullable value it narrows the non-null
     * value into `thenFn`. Falsy-but-present values (`""`, `0`) take the `thenFn` branch.
     *
     * @example
     * Button("Save").whenElse(isLoading, t => t.toggle("disabled"), t => t.background("blue-500"))
     * Span().whenElse(user.name, (t, name) => t.setTitle(name), t => t.setTitle("Anon"))
     */
    whenElse(condition: boolean, thenFn: (tag: this) => unknown, elseFn: (tag: this) => unknown): this;
    whenElse<T>(value: boolean extends T ? never : T | null | undefined, thenFn: (tag: this, value: NonNullable<T>) => unknown, elseFn: (tag: this) => unknown): this;
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
    apply(...fns: ((tag: this) => unknown)[]): this;
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
    addChild(...views: View[]): this;
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
    setClasses(classes: (string | false | null | undefined)[]): this;
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
    setStyles(styles: Record<string, string | number>): this;
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
    setDataAttrs(attrs: Record<string, string>): this;
    /**
     * Set the ARIA `role` attribute (the role goes on `role=`, not `aria-role`).
     *
     * @example
     * Div("Alert").setRole("alert")
     * Ul().setRole("menu")
     */
    setRole(role: AriaRole): this;
    /**
     * Set the `tabindex` attribute (focus order). `0` makes a non-interactive
     * element focusable; `-1` makes it programmatically focusable but not tabbable.
     *
     * @example
     * Div("Focusable").setTabindex(0)
     */
    setTabindex(index: number): this;
    /**
     * Set the `title` **attribute** (the native tooltip) — NOT the `<title>` element.
     *
     * @example
     * Button("?").setTitle("Show help")
     */
    setTitle(title: string): this;
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
    setAria(attrs: AriaAttrs): this;
    /**
     * Mark this element a popover (native Popover API — top-layer, zero JS). A bare
     * call defaults to `"auto"` (light-dismiss: click-outside + Esc, one-open-per-group);
     * `"manual"` requires an explicit invoker to dismiss.
     *
     * @example
     * Div(...).setId(ids.menu).setPopover()          // popover="auto"
     * Div(...).setPopover("manual")                  // popover="manual"
     */
    setPopover(state?: PopoverState): this;
    /**
     * Wire this element (any invoker — `<button>`/`<a>`/…) to a popover by `Id`,
     * rendering `popovertarget="<id>"`. Reuse the popover's own `Id` so the link is
     * provable. The id is `escapeAttr`'d at render like every attribute value.
     *
     * @example
     * Button("Account").setPopovertarget(ids.userMenu)
     */
    setPopovertarget(target: Id): this;
    /**
     * Set the invoker action (`"show"` | `"hide"` | `"toggle"`). Omit the argument to
     * emit no attribute and rely on the native default (`toggle`) — never a `=""`.
     *
     * @example
     * Button("Open").setPopovertarget(ids.menu).setPopovertargetaction("show")
     */
    setPopovertargetaction(action?: PopoverAction): this;
    /** Set `lang` (subtree language) on any element. `HtmlTag` keeps its own document-level setter. */
    setLang(lang?: string): this;
    /** Set `dir` (text direction) on any element. */
    setDir(dir?: 'ltr' | 'rtl' | 'auto'): this;
    /** Set `translate` — whether this element's text is translated when the page is localized. */
    setTranslate(value?: 'yes' | 'no'): this;
    /** Set `enterkeyhint` — the action label on a mobile virtual keyboard's Enter key. */
    setEnterkeyhint(hint: EnterKeyHint): this;
    /** Make the element editable. Bare call defaults to `"true"`; `"plaintext-only"` strips rich formatting. */
    setContenteditable(value?: ContentEditable): this;
    /** Set `spellcheck` (the enumerated `"true"`/`"false"` string, not a boolean attribute). */
    setSpellcheck(value?: Spellcheck): this;
    /** Set `autocapitalize` for on-screen-keyboard input. */
    setAutocapitalize(value: Autocapitalize): this;
    /**
     * `hidden="until-found"` — hidden, but revealable by in-page find (Ctrl-F) and
     * scroll-to-text-fragment (it expands and fires `beforematch`). Plain hiding is `.toggle("hidden")`.
     */
    setHidden(value: "until-found"): this;
    /**
     * Schema.org microdata (`itemtype`/`itemprop`/`itemref`/`itemid`) for structured-data SEO —
     * the value-bearing counterpart to the `itemscope` boolean (`.toggle("itemscope")`). Setting
     * `type` also marks the element an item scope (an `itemtype` without `itemscope` is invalid).
     *
     * @example
     * Article().setMicrodata({ type: "https://schema.org/Article" })  // itemscope itemtype="…"
     * Span(author).setMicrodata({ prop: "author" })
     */
    setMicrodata(attrs: {
        type?: string;
        prop?: string;
        ref?: string;
        id?: string;
    }): this;
    /**
     * Associate a form-associated control (`input`/`button`/`select`/`textarea`/`output`/`fieldset`)
     * with a `<form>` elsewhere in the document by its `id` — e.g. a submit button in a sticky
     * footer outside the `<form>`. Accepts a string or `Id`.
     */
    setForm(form?: string | Id): this;
    /** @internal Variant prefix state — used by tailwind-methods mixin */
    _variantPrefix: string | null;
}
//# sourceMappingURL=tag.d.ts.map