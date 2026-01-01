"use strict";
// ------------------------------------
// Common UI Patterns for Lambda.html
// ------------------------------------
//
// This module provides reusable component patterns and layout helpers
// built on top of the core lambda.html API.
Object.defineProperty(exports, "__esModule", { value: true });
exports.VStack = VStack;
exports.HStack = HStack;
exports.Grid = Grid;
exports.SearchInput = SearchInput;
exports.InfiniteScroll = InfiniteScroll;
exports.FormField = FormField;
exports.Toggle = Toggle;
exports.Tabs = Tabs;
exports.Accordion = Accordion;
exports.KeyedList = KeyedList;
const builder_js_1 = require("./builder.js");
const htmx_js_1 = require("./htmx.js");
const builder_js_2 = require("./builder.js");
// ------------------------------------
// Layout Helpers
// ------------------------------------
/**
 * Create a vertical stack layout (flex column).
 *
 * @param children - Child elements to stack vertically
 * @param options - Layout options
 * @returns Div with flex column layout
 *
 * @example
 * VStack([
 *   H1("Title"),
 *   P("Content"),
 *   Button("Action")
 * ], { spacing: "1rem", align: "center" })
 */
function VStack(children, options = {}) {
    return (0, builder_js_1.Div)(children)
        .setStyles({
        display: "flex",
        flexDirection: "column",
        gap: options.spacing ?? "0",
        alignItems: options.align ?? "stretch",
        justifyContent: options.justify ?? "flex-start",
    })
        .addClass(options.className ?? "");
}
/**
 * Create a horizontal stack layout (flex row).
 *
 * @param children - Child elements to stack horizontally
 * @param options - Layout options
 * @returns Div with flex row layout
 *
 * @example
 * HStack([
 *   Button("Cancel"),
 *   Button("Save")
 * ], { spacing: "0.5rem", justify: "flex-end" })
 */
function HStack(children, options = {}) {
    return (0, builder_js_1.Div)(children)
        .setStyles({
        display: "flex",
        flexDirection: "row",
        gap: options.spacing ?? "0",
        alignItems: options.align ?? "center",
        justifyContent: options.justify ?? "flex-start",
    })
        .addClass(options.className ?? "");
}
/**
 * Create a CSS grid layout.
 *
 * @param children - Child elements to arrange in grid
 * @param options - Grid options
 * @returns Div with grid layout
 *
 * @example
 * Grid([Item1, Item2, Item3, Item4], {
 *   columns: 2,
 *   gap: "1rem"
 * })
 *
 * // Or with custom template:
 * Grid([...], {
 *   columns: "1fr 2fr 1fr",
 *   rows: "auto 1fr auto"
 * })
 */
function Grid(children, options = {}) {
    const gridTemplateColumns = typeof options.columns === "number"
        ? `repeat(${options.columns}, 1fr)`
        : options.columns ?? "1fr";
    const styles = {
        display: "grid",
        gridTemplateColumns,
    };
    if (options.rows)
        styles.gridTemplateRows = options.rows;
    if (options.gap)
        styles.gap = options.gap;
    if (options.columnGap)
        styles.columnGap = options.columnGap;
    if (options.rowGap)
        styles.rowGap = options.rowGap;
    return (0, builder_js_1.Div)(children)
        .setStyles(styles)
        .addClass(options.className ?? "");
}
// ------------------------------------
// HTMX Pattern Helpers
// ------------------------------------
/**
 * Create a debounced search input with HTMX.
 *
 * @param options - Search input configuration
 * @returns Input element with HTMX search behavior
 *
 * @example
 * SearchInput({
 *   endpoint: "/api/search",
 *   target: "#results",
 *   delay: 300,
 *   placeholder: "Search products..."
 * })
 */
function SearchInput(options) {
    return (0, builder_js_1.Input)()
        .setType("search")
        .setName(options.name ?? "q")
        .setPlaceholder(options.placeholder ?? "Search...")
        .addClass(options.className ?? "")
        .setHtmx((0, htmx_js_1.hx)(options.endpoint, {
        trigger: `keyup changed delay:${options.delay ?? 300}ms`,
        target: options.target,
        swap: "innerHTML",
    }));
}
/**
 * Create an infinite scroll trigger element.
 *
 * @param options - Infinite scroll configuration
 * @returns Div that loads more content when revealed
 *
 * @example
 * InfiniteScroll({
 *   endpoint: "/api/items?page=2",
 *   loadingText: "Loading more items...",
 *   threshold: "100px"
 * })
 */
function InfiniteScroll(options) {
    const trigger = options.threshold
        ? `revealed threshold:${options.threshold}`
        : "revealed";
    return (0, builder_js_1.Div)(options.loadingText ?? "Loading...")
        .addClass(options.className ?? "")
        .setHtmx((0, htmx_js_1.hx)(options.endpoint, {
        trigger,
        swap: "outerHTML",
    }));
}
// ------------------------------------
// Form Patterns
// ------------------------------------
/**
 * Create a form field with label, input, and optional error message.
 *
 * @param options - Form field configuration
 * @returns Div containing label, input, and error display
 *
 * @example
 * FormField({
 *   label: "Email",
 *   name: "email",
 *   type: "email",
 *   required: true,
 *   error: "Please enter a valid email"
 * })
 */
function FormField(options) {
    return (0, builder_js_1.Div)([
        (0, builder_js_1.Label)(options.label).setFor(options.name).addClass("form-label"),
        (0, builder_js_1.Input)()
            .setType(options.type ?? "text")
            .setName(options.name)
            .setId(options.name)
            .setPlaceholder(options.placeholder ?? "")
            .setToggles(options.required ? ["required"] : [])
            .addClass("form-input"),
        (0, builder_js_2.IfThen)(!!options.error, () => (0, builder_js_1.Span)(options.error).addClass("form-error")),
    ]).addClass(options.className ?? "form-field");
}
// ------------------------------------
// Interactive Components
// ------------------------------------
/**
 * Create a toggle/disclosure component with reactive state.
 *
 * @param options - Toggle configuration
 * @returns Div with toggle button and collapsible content
 *
 * @example
 * Toggle({
 *   label: "Show Details",
 *   content: Div([P("Hidden content"), P("More details...")]),
 *   defaultOpen: false
 * })
 */
function Toggle(options) {
    return (0, builder_js_1.Div)([
        (0, builder_js_1.Button)(options.label)
            .onClick("isOpen = !isOpen")
            .bindClass("open", "isOpen")
            .setAria({ expanded: "isOpen" })
            .addClass("toggle-button"),
        (0, builder_js_1.Div)(options.content)
            .bindShow("isOpen")
            .addClass("toggle-content"),
    ])
        .bindState({ isOpen: options.defaultOpen ?? false })
        .addClass(options.className ?? "toggle");
}
/**
 * Create a tabs component with reactive state.
 *
 * @param tabs - Array of tab definitions
 * @param options - Tabs configuration
 * @returns Div with tab buttons and content panels
 *
 * @example
 * Tabs([
 *   { label: "Profile", content: Div("Profile content") },
 *   { label: "Settings", content: Div("Settings content") },
 *   { label: "History", content: Div("History content") }
 * ])
 */
function Tabs(tabs, options = {}) {
    return (0, builder_js_1.Div)([
        (0, builder_js_1.Div)((0, builder_js_2.ForEach1)(tabs, (tab, i) => (0, builder_js_1.Button)(tab.label)
            .onClick(`activeTab = ${i}`)
            .bindClass("active", `activeTab === ${i}`)
            .setAria({
            selected: `activeTab === ${i}`,
            controls: `tab-panel-${i}`,
        })
            .setDataAttrs({ index: String(i) })
            .addClass("tab-button"))).addClass("tab-buttons"),
        (0, builder_js_2.ForEach1)(tabs, (tab, i) => (0, builder_js_1.Div)(tab.content)
            .bindShow(`activeTab === ${i}`)
            .setId(`tab-panel-${i}`)
            .setAria({ hidden: `activeTab !== ${i}` })
            .addClass("tab-panel")),
    ])
        .bindState({ activeTab: options.defaultTab ?? 0 })
        .addClass(options.className ?? "tabs");
}
/**
 * Create an accordion component with multiple collapsible sections.
 *
 * @param sections - Array of accordion sections
 * @param options - Accordion configuration
 * @returns Div with accordion sections
 *
 * @example
 * Accordion([
 *   { title: "Section 1", content: Div("Content 1") },
 *   { title: "Section 2", content: Div("Content 2") }
 * ], { allowMultiple: false })
 */
function Accordion(sections, options = {}) {
    const initialState = {};
    sections.forEach((_, i) => {
        initialState[`open_${i}`] = options.defaultOpen?.includes(i) ?? false;
    });
    return (0, builder_js_1.Div)((0, builder_js_2.ForEach1)(sections, (section, i) => {
        const toggleStatement = options.allowMultiple
            ? `open_${i} = !open_${i}`
            : sections.map((_, j) => `open_${j} = ${i === j ? `!open_${i}` : 'false'}`).join('; ');
        return (0, builder_js_1.Div)([
            (0, builder_js_1.Button)(section.title)
                .onClick(toggleStatement)
                .bindClass("open", `open_${i}`)
                .setAria({ expanded: `open_${i}` })
                .addClass("accordion-header"),
            (0, builder_js_1.Div)(section.content)
                .bindShow(`open_${i}`)
                .addClass("accordion-content"),
        ]).addClass("accordion-section");
    }))
        .bindState(initialState)
        .addClass(options.className ?? "accordion");
}
// ------------------------------------
// List Patterns
// ------------------------------------
/**
 * Create a list with unique keys for each item.
 *
 * @param items - Array of items to render
 * @param getKey - Function to extract unique key from item
 * @param renderItem - Function to render each item
 * @param options - List configuration
 * @returns Ul with keyed list items
 *
 * @example
 * KeyedList(
 *   users,
 *   user => user.id,
 *   user => Div([H3(user.name), P(user.email)])
 * )
 */
function KeyedList(items, getKey, renderItem, options = {}) {
    return (0, builder_js_1.Ul)((0, builder_js_2.ForEach1)(items, (item, index) => (0, builder_js_1.Li)(renderItem(item, index))
        .setDataAttrs({ key: getKey(item) })
        .addClass("list-item"))).addClass(options.className ?? "keyed-list");
}
//# sourceMappingURL=patterns.js.map