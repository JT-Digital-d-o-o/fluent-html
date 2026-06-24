/** WAI-ARIA role values (open union — custom roles still allowed). */
export type AriaRole = "button" | "checkbox" | "gridcell" | "link" | "menuitem" | "menuitemcheckbox" | "menuitemradio" | "option" | "progressbar" | "radio" | "scrollbar" | "searchbox" | "separator" | "slider" | "spinbutton" | "switch" | "tab" | "tabpanel" | "textbox" | "treeitem" | "combobox" | "grid" | "listbox" | "menu" | "menubar" | "radiogroup" | "tablist" | "tree" | "treegrid" | "application" | "article" | "cell" | "columnheader" | "definition" | "directory" | "document" | "feed" | "figure" | "group" | "heading" | "img" | "list" | "listitem" | "math" | "none" | "note" | "presentation" | "row" | "rowgroup" | "rowheader" | "table" | "term" | "toolbar" | "tooltip" | "banner" | "complementary" | "contentinfo" | "form" | "main" | "navigation" | "region" | "search" | "alert" | "log" | "marquee" | "status" | "timer" | "alertdialog" | "dialog" | (string & {});
/**
 * WAI-ARIA state and property names, **without** the `aria-` prefix. CLOSED union —
 * each is a lowercase single token (`haspopup`, `labelledby`, `describedby`), so a
 * typo is a compile error and the derived attribute is always the real ARIA name
 * (`aria-haspopup`, never the kebab-mangled `aria-has-popup`).
 */
export type AriaAttributeName = "activedescendant" | "atomic" | "autocomplete" | "busy" | "checked" | "colcount" | "colindex" | "colspan" | "controls" | "current" | "describedby" | "description" | "details" | "disabled" | "errormessage" | "expanded" | "flowto" | "haspopup" | "hidden" | "invalid" | "keyshortcuts" | "label" | "labelledby" | "level" | "live" | "modal" | "multiline" | "multiselectable" | "orientation" | "owns" | "placeholder" | "posinset" | "pressed" | "readonly" | "relevant" | "required" | "roledescription" | "rowcount" | "rowindex" | "rowspan" | "selected" | "setsize" | "sort" | "valuemax" | "valuemin" | "valuenow" | "valuetext";
/**
 * A single aria value. `boolean` and the tristate `"mixed"` (a `string`) cover state
 * attributes (`aria-checked`, `aria-pressed`, …) so you write `expanded: true` instead
 * of `expanded: on ? "true" : "false"`; `number` covers `aria-level`/`aria-posinset`/….
 */
export type AriaValue = string | number | boolean;
/**
 * Typed argument for `setAria`. Standard keys are bare (`label`, `haspopup`) and get
 * the `aria-` prefix added on render; the `aria-${string}` escape arm passes a full,
 * non-standard attribute name through verbatim.
 */
export type AriaAttrs = Partial<Record<AriaAttributeName, AriaValue>> & Record<`aria-${string}`, string>;
//# sourceMappingURL=aria-types.d.ts.map