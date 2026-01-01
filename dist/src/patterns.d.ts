import { View, Tag } from "./builder.js";
import { HxTarget } from "./htmx.js";
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
export declare function VStack(children: View, options?: {
    spacing?: string;
    align?: "stretch" | "flex-start" | "flex-end" | "center" | "baseline";
    justify?: "flex-start" | "flex-end" | "center" | "space-between" | "space-around" | "space-evenly";
    className?: string;
}): Tag;
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
export declare function HStack(children: View, options?: {
    spacing?: string;
    align?: "stretch" | "flex-start" | "flex-end" | "center" | "baseline";
    justify?: "flex-start" | "flex-end" | "center" | "space-between" | "space-around" | "space-evenly";
    className?: string;
}): Tag;
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
export declare function Grid(children: View, options?: {
    columns?: number | string;
    rows?: string;
    gap?: string;
    columnGap?: string;
    rowGap?: string;
    className?: string;
}): Tag;
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
export declare function SearchInput(options: {
    endpoint: string;
    target: HxTarget;
    name?: string;
    delay?: number;
    placeholder?: string;
    className?: string;
}): Tag;
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
export declare function InfiniteScroll(options: {
    endpoint: string;
    loadingText?: string;
    threshold?: string;
    className?: string;
}): Tag;
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
export declare function FormField(options: {
    label: string;
    name: string;
    type?: string;
    placeholder?: string;
    error?: string;
    required?: boolean;
    className?: string;
}): View;
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
export declare function Toggle(options: {
    label: string;
    content: View;
    defaultOpen?: boolean;
    className?: string;
}): View;
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
export declare function Tabs(tabs: {
    label: string;
    content: View;
}[], options?: {
    defaultTab?: number;
    className?: string;
}): View;
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
export declare function Accordion(sections: {
    title: string;
    content: View;
}[], options?: {
    allowMultiple?: boolean;
    defaultOpen?: number[];
    className?: string;
}): View;
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
export declare function KeyedList<T>(items: T[], getKey: (item: T) => string, renderItem: (item: T, index: number) => View, options?: {
    className?: string;
}): Tag;
//# sourceMappingURL=patterns.d.ts.map