// WAI-ARIA roles and state/property names for the typed `setRole` / `setAria`
// setters. Roles keep a `(string & {})` escape hatch (there are many, and custom
// roles exist). The aria attribute-NAME union is CLOSED so a typo like
// `setAria({ labeledby: … })` is a compile error — with an `aria-${string}` escape
// arm on the object for genuinely non-standard attributes.

/** WAI-ARIA role values (open union — custom roles still allowed). */
export type AriaRole =
  // Widget
  | "button" | "checkbox" | "gridcell" | "link" | "menuitem" | "menuitemcheckbox"
  | "menuitemradio" | "option" | "progressbar" | "radio" | "scrollbar" | "searchbox"
  | "separator" | "slider" | "spinbutton" | "switch" | "tab" | "tabpanel" | "textbox"
  | "treeitem"
  // Composite
  | "combobox" | "grid" | "listbox" | "menu" | "menubar" | "radiogroup" | "tablist"
  | "tree" | "treegrid"
  // Document structure
  | "application" | "article" | "cell" | "columnheader" | "definition" | "directory"
  | "document" | "feed" | "figure" | "group" | "heading" | "img" | "list" | "listitem"
  | "math" | "none" | "note" | "presentation" | "row" | "rowgroup" | "rowheader"
  | "table" | "term" | "toolbar" | "tooltip"
  // Landmark
  | "banner" | "complementary" | "contentinfo" | "form" | "main" | "navigation"
  | "region" | "search"
  // Live region
  | "alert" | "log" | "marquee" | "status" | "timer"
  // Window
  | "alertdialog" | "dialog"
  // WAI-ARIA 1.2 / 1.3 additions (F-B-143)
  | "mark" | "comment" | "suggestion" | "meter" | "code" | "emphasis" | "strong"
  | "deletion" | "insertion" | "paragraph" | "generic" | "blockquote" | "caption"
  | "subscript" | "superscript" | "time" | "associationlist"
  | (string & {});

/**
 * WAI-ARIA state and property names, **without** the `aria-` prefix. CLOSED union —
 * each is a lowercase single token (`haspopup`, `labelledby`, `describedby`), so a
 * typo is a compile error and the derived attribute is always the real ARIA name
 * (`aria-haspopup`, never the kebab-mangled `aria-has-popup`).
 */
export type AriaAttributeName =
  | "activedescendant" | "atomic" | "autocomplete" | "busy" | "checked" | "colcount"
  | "colindex" | "colspan" | "controls" | "current" | "describedby" | "description"
  | "details" | "disabled" | "errormessage" | "expanded" | "flowto" | "haspopup"
  | "hidden" | "invalid" | "keyshortcuts" | "label" | "labelledby" | "level" | "live"
  | "modal" | "multiline" | "multiselectable" | "orientation" | "owns" | "placeholder"
  | "posinset" | "pressed" | "readonly" | "relevant" | "required" | "roledescription"
  | "rowcount" | "rowindex" | "rowspan" | "selected" | "setsize" | "sort" | "valuemax"
  | "valuemin" | "valuenow" | "valuetext";

/**
 * A single aria value (kept for back-compat / general use). `boolean` and the tristate
 * `"mixed"` cover state attributes; `number` covers `aria-level`/`aria-posinset`/….
 * Per-attribute types now live on `AriaAttrs` (F-D-103) — enumerable states carry their
 * token unions there, so this broad alias is only the fallback shape.
 */
export type AriaValue = string | number | boolean;

/**
 * Typed argument for `setAria`. Standard keys are bare (`label`, `haspopup`) and get the
 * `aria-` prefix added on render. **Per-key types (F-D-103):** the enumerable states
 * (`current`/`haspopup`/`live`/`sort`/`autocomplete`/`orientation`/`invalid`) carry their
 * literal token unions, tristate states accept `boolean | "mixed"`, numeric states accept
 * `number`, and the rest are `string` (idrefs / labels). The `aria-${string}` escape arm
 * passes a full, non-standard attribute name through verbatim.
 */
export type AriaAttrs =
  & {
    // Enumerated token states
    current?: 'page' | 'step' | 'location' | 'date' | 'time' | boolean;
    haspopup?: 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog' | boolean;
    live?: 'off' | 'polite' | 'assertive';
    sort?: 'ascending' | 'descending' | 'other' | 'none';
    autocomplete?: 'inline' | 'list' | 'both' | 'none';
    orientation?: 'horizontal' | 'vertical';
    invalid?: 'grammar' | 'spelling' | boolean;
    // Tristate / boolean states
    checked?: boolean | 'mixed';
    pressed?: boolean | 'mixed';
    expanded?: boolean;
    selected?: boolean;
    disabled?: boolean;
    hidden?: boolean;
    modal?: boolean;
    multiline?: boolean;
    multiselectable?: boolean;
    readonly?: boolean;
    required?: boolean;
    atomic?: boolean;
    busy?: boolean;
    // Numeric states
    level?: number;
    colcount?: number; colindex?: number; colspan?: number;
    rowcount?: number; rowindex?: number; rowspan?: number;
    posinset?: number; setsize?: number;
    valuemax?: number; valuemin?: number; valuenow?: number;
    // ID-reference / text / token-list (strings)
    activedescendant?: string; controls?: string; describedby?: string;
    description?: string; details?: string; errormessage?: string;
    flowto?: string; keyshortcuts?: string; label?: string; labelledby?: string;
    owns?: string; placeholder?: string; relevant?: string;
    roledescription?: string; valuetext?: string;
  }
  & Record<`aria-${string}`, string>;
