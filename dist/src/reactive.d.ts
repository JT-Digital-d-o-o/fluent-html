import { View } from "./builder.js";
/**
 * Reactive properties attached to a Tag.
 * Created lazily when first reactive method is called.
 */
export interface ReactiveProps {
    /** Auto-generated unique ID for DOM element lookup */
    id: string;
    /** Reactive state object. Only valid on root reactive element. */
    state?: Record<string, any>;
    /** Expression for textContent binding. Example: "data.count" */
    textExpr?: string;
    /** Expression for visibility (display: block/none). Example: "data.visible" */
    showExpr?: string;
    /** Expression for visibility (display: none/block). Example: "data.hidden" */
    hideExpr?: string;
    /** Class name → expression mapping. Example: { "active": "data.isActive" } */
    classExprs?: Record<string, string>;
    /** Attribute → expression mapping. Example: { "disabled": "data.isLoading" } */
    attrExprs?: Record<string, string>;
    /** Style property → expression mapping. Example: { "color": "data.textColor" } */
    styleExprs?: Record<string, string>;
    /** Expression for input value (two-way binding). Example: "data.username" */
    valueExpr?: string;
    /** Expression for innerHTML binding (⚠️ XSS risk). Example: "data.htmlContent" */
    htmlExpr?: string;
    /** Click handler statements. Example: ["data.count++"] */
    clickHandlers: string[];
    /** Input handler statements. Example: ["data.query = this.value"] */
    inputHandlers: string[];
    /** Change handler statements. Example: ["data.selected = this.value"] */
    changeHandlers: string[];
    /** Submit handler statements. Example: ["data.submitted = true"] */
    submitHandlers: string[];
    /** Keydown handler statements. Example: ["if (event.key === 'Enter') data.submit()"] */
    keydownHandlers: string[];
    /** Focus handler statements */
    focusHandlers: string[];
    /** Blur handler statements */
    blurHandlers: string[];
}
/**
 * Creates a new ReactiveProps with default values.
 */
export declare function createReactiveProps(): ReactiveProps;
/**
 * Represents a compilation error in reactive bindings.
 */
export declare class CompileError {
    message: string;
    constructor(message: string);
    toString(): string;
}
/**
 * Reset the global ID counter. Call before compile() in tests.
 */
export declare function resetIdCounter(): void;
/**
 * Compile a reactive view tree.
 *
 * Validates that:
 * - All `data.xxx` references in expressions are bound by an ancestor's bindState()
 * - No variable shadowing between nested bindState() calls
 *
 * If successful, assigns unique IDs to reactive elements.
 *
 * @param view - The view tree to compile
 * @returns null if successful, CompileError if validation fails
 *
 * @example
 * const view = Div([...]).bindState({ count: 0 });
 * const error = compile(view);
 * if (error) {
 *   console.error(error.message);
 *   return;
 * }
 * console.log(render(view));
 */
export declare function compile(view: View): CompileError | null;
/**
 * Generate all reactive scripts for a view tree.
 *
 * @param view - The compiled view tree
 * @returns JavaScript code to be included in a <script> tag
 *
 * @example
 * const view = Div([...]).bindState({ count: 0 });
 * compile(view);
 * const html = render(view);
 * const script = generateScript(view);
 * // Output: html + <script>script</script>
 */
export declare function generateScript(view: View): string;
/**
 * Render a view with its reactive script included.
 *
 * Convenience function that combines render() and generateScript().
 *
 * @param view - The compiled view tree
 * @param render - The render function from builder.ts
 * @returns HTML string with embedded <script> tag
 *
 * @example
 * const view = Div([...]).bindState({ count: 0 });
 * compile(view);
 * console.log(renderWithScript(view, render));
 */
export declare function renderWithScript(view: View, renderFn?: (view: View) => string): string;
//# sourceMappingURL=reactive.d.ts.map