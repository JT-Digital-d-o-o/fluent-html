// ------------------------------------
// Common UI Patterns for Lambda.html
// ------------------------------------
//
// This module provides reusable component patterns and layout helpers
// built on top of the core lambda.html API.

import { View, Tag, Div, Button, Input, Span, Label, Ul, Li } from "./builder.js";
import { hx, HxTarget } from "./htmx.js";
import { IfThen, ForEach1 } from "./builder.js";

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
export function VStack(
  children: View,
  options: {
    spacing?: string;
    align?: "stretch" | "flex-start" | "flex-end" | "center" | "baseline";
    justify?: "flex-start" | "flex-end" | "center" | "space-between" | "space-around" | "space-evenly";
    className?: string;
  } = {}
): Tag {
  return Div(children)
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
export function HStack(
  children: View,
  options: {
    spacing?: string;
    align?: "stretch" | "flex-start" | "flex-end" | "center" | "baseline";
    justify?: "flex-start" | "flex-end" | "center" | "space-between" | "space-around" | "space-evenly";
    className?: string;
  } = {}
): Tag {
  return Div(children)
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
export function Grid(
  children: View,
  options: {
    columns?: number | string;
    rows?: string;
    gap?: string;
    columnGap?: string;
    rowGap?: string;
    className?: string;
  } = {}
): Tag {
  const gridTemplateColumns =
    typeof options.columns === "number"
      ? `repeat(${options.columns}, 1fr)`
      : options.columns ?? "1fr";

  const styles: Record<string, string> = {
    display: "grid",
    gridTemplateColumns,
  };

  if (options.rows) styles.gridTemplateRows = options.rows;
  if (options.gap) styles.gap = options.gap;
  if (options.columnGap) styles.columnGap = options.columnGap;
  if (options.rowGap) styles.rowGap = options.rowGap;

  return Div(children)
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
export function SearchInput(options: {
  endpoint: string;
  target: HxTarget;
  name?: string;
  delay?: number;
  placeholder?: string;
  className?: string;
}): Tag {
  return Input()
    .setType("search")
    .setName(options.name ?? "q")
    .setPlaceholder(options.placeholder ?? "Search...")
    .addClass(options.className ?? "")
    .setHtmx(
      hx(options.endpoint, {
        trigger: `keyup changed delay:${options.delay ?? 300}ms`,
        target: options.target,
        swap: "innerHTML",
      })
    );
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
export function InfiniteScroll(options: {
  endpoint: string;
  loadingText?: string;
  threshold?: string;
  className?: string;
}): Tag {
  const trigger = options.threshold
    ? `revealed threshold:${options.threshold}`
    : "revealed";

  return Div(options.loadingText ?? "Loading...")
    .addClass(options.className ?? "")
    .setHtmx(
      hx(options.endpoint, {
        trigger,
        swap: "outerHTML",
      })
    );
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
export function FormField(options: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  error?: string;
  required?: boolean;
  className?: string;
}): View {
  return Div([
    Label(options.label).setFor(options.name).addClass("form-label"),
    Input()
      .setType(options.type ?? "text")
      .setName(options.name)
      .setId(options.name)
      .setPlaceholder(options.placeholder ?? "")
      .setToggles(options.required ? ["required"] : [])
      .addClass("form-input"),
    IfThen(
      !!options.error,
      () => Span(options.error!).addClass("form-error")
    ),
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
export function Toggle(options: {
  label: string;
  content: View;
  defaultOpen?: boolean;
  className?: string;
}): View {
  return Div([
    Button(options.label)
      .onClick("isOpen = !isOpen")
      .bindClass("open", "isOpen")
      .setAria({ expanded: "isOpen" })
      .addClass("toggle-button"),
    Div(options.content)
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
export function Tabs(
  tabs: { label: string; content: View }[],
  options: {
    defaultTab?: number;
    className?: string;
  } = {}
): View {
  return Div([
    Div(
      ForEach1(tabs, (tab, i) =>
        Button(tab.label)
          .onClick(`activeTab = ${i}`)
          .bindClass("active", `activeTab === ${i}`)
          .setAria({
            selected: `activeTab === ${i}`,
            controls: `tab-panel-${i}`,
          })
          .setDataAttrs({ index: String(i) })
          .addClass("tab-button")
      )
    ).addClass("tab-buttons"),
    ForEach1(tabs, (tab, i) =>
      Div(tab.content)
        .bindShow(`activeTab === ${i}`)
        .setId(`tab-panel-${i}`)
        .setAria({ hidden: `activeTab !== ${i}` })
        .addClass("tab-panel")
    ),
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
export function Accordion(
  sections: { title: string; content: View }[],
  options: {
    allowMultiple?: boolean;
    defaultOpen?: number[];
    className?: string;
  } = {}
): View {
  const initialState: Record<string, boolean> = {};
  sections.forEach((_, i) => {
    initialState[`open_${i}`] = options.defaultOpen?.includes(i) ?? false;
  });

  return Div(
    ForEach1(sections, (section, i) => {
      const toggleStatement = options.allowMultiple
        ? `open_${i} = !open_${i}`
        : sections.map((_, j) => `open_${j} = ${i === j ? `!open_${i}` : 'false'}`).join('; ');

      return Div([
        Button(section.title)
          .onClick(toggleStatement)
          .bindClass("open", `open_${i}`)
          .setAria({ expanded: `open_${i}` })
          .addClass("accordion-header"),
        Div(section.content)
          .bindShow(`open_${i}`)
          .addClass("accordion-content"),
      ]).addClass("accordion-section");
    })
  )
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
export function KeyedList<T>(
  items: T[],
  getKey: (item: T) => string,
  renderItem: (item: T, index: number) => View,
  options: {
    className?: string;
  } = {}
): Tag {
  return Ul(
    ForEach1(items, (item, index) =>
      Li(renderItem(item, index))
        .setDataAttrs({ key: getKey(item) })
        .addClass("list-item")
    )
  ).addClass(options.className ?? "keyed-list");
}
