// ------------------------------------
// Lambda.html Reactive System
// ------------------------------------
//
// A minimal, compile-time-checked reactive system for client-side rendering.
//
// QUICK START:
// ```typescript
// const view = Div([
//   Button("Increment").onClick("data.count++"),
//   Span().bindText("'Count: ' + data.count"),
//   Div("Details").bindShow("data.count > 5")
// ]).bindState({ count: 0 });
//
// const error = compile(view);
// if (error) throw new Error(error.message);
// console.log(render(view));
// ```
//
// API PATTERN:
// - bind*  → Reactive binding (data flows to DOM)
// - on*    → Event handler (DOM events mutate data)
//
// EXPRESSIONS:
// - All expressions reference state via `data.propertyName`
// - Example: "data.count + 1" or "data.visible && data.ready"
//
// STATEMENTS (for event handlers):
// - Mutate state via `data.propertyName = value`
// - Example: "data.count++" or "data.name = 'Alice'"
// - Multiple statements: call onClick() multiple times
//
// ------------------------------------

import { render, Tag, View } from "./builder.js";

// ------------------------------------
// Types
// ------------------------------------

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
export function createReactiveProps(): ReactiveProps {
  return {
    id: "",
    clickHandlers: [],
    inputHandlers: [],
    changeHandlers: [],
    submitHandlers: [],
    keydownHandlers: [],
    focusHandlers: [],
    blurHandlers: [],
  };
}

// ------------------------------------
// Compile Error
// ------------------------------------

/**
 * Represents a compilation error in reactive bindings.
 */
export class CompileError {
  constructor(public message: string) { }

  toString(): string {
    return `CompileError: ${this.message}`;
  }
}

// ------------------------------------
// Compiler
// ------------------------------------

/**
 * Environment for tracking bound state variables during compilation.
 */
class CompileEnv {
  private stack: string[][] = [];

  push(variables: string[]): void {
    this.stack.push(variables);
  }

  pop(): void {
    this.stack.pop();
  }

  /**
   * Check if a variable is bound in any ancestor scope.
   */
  contains(variable: string): boolean {
    return this.stack.some((frame) => frame.includes(variable));
  }

  /**
   * Get all currently bound variables.
   */
  allVariables(): string[] {
    return this.stack.flat();
  }
}

/**
 * Extract all `data.xxx` variable references from an expression.
 *
 * @example
 * findDataVariables("data.count + data.total")
 * // Returns: ["count", "total"]
 */
function findDataVariables(expression: string): string[] {
  const pattern = /data\.([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
  const results: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(expression)) !== null) {
    if (!results.includes(match[1])) {
      results.push(match[1]);
    }
  }
  return results;
}

/**
 * Validate that all expressions in a reactive tag reference bound variables.
 */
function validateExpressions(tag: Tag, env: CompileEnv): CompileError | null {
  const reactive = tag.reactive;
  if (!reactive) return null;

  // Collect all expressions to validate
  const expressions: { expr: string; context: string }[] = [];

  if (reactive.textExpr) {
    expressions.push({ expr: reactive.textExpr, context: "bindText" });
  }
  if (reactive.showExpr) {
    expressions.push({ expr: reactive.showExpr, context: "bindShow" });
  }
  if (reactive.hideExpr) {
    expressions.push({ expr: reactive.hideExpr, context: "bindHide" });
  }
  if (reactive.htmlExpr) {
    expressions.push({ expr: reactive.htmlExpr, context: "bindHtml" });
  }
  if (reactive.valueExpr) {
    expressions.push({ expr: reactive.valueExpr, context: "bindValue" });
  }

  for (const [className, expr] of Object.entries(reactive.classExprs ?? {})) {
    expressions.push({ expr, context: `bindClass("${className}")` });
  }
  for (const [attr, expr] of Object.entries(reactive.attrExprs ?? {})) {
    expressions.push({ expr, context: `bindAttr("${attr}")` });
  }
  for (const [prop, expr] of Object.entries(reactive.styleExprs ?? {})) {
    expressions.push({ expr, context: `bindStyle("${prop}")` });
  }

  // Event handlers
  for (const stmt of reactive.clickHandlers) {
    expressions.push({ expr: stmt, context: "onClick" });
  }
  for (const stmt of reactive.inputHandlers) {
    expressions.push({ expr: stmt, context: "onInput" });
  }
  for (const stmt of reactive.changeHandlers) {
    expressions.push({ expr: stmt, context: "onChange" });
  }
  for (const stmt of reactive.submitHandlers) {
    expressions.push({ expr: stmt, context: "onSubmit" });
  }
  for (const stmt of reactive.keydownHandlers) {
    expressions.push({ expr: stmt, context: "onKeydown" });
  }
  for (const stmt of reactive.focusHandlers) {
    expressions.push({ expr: stmt, context: "onFocus" });
  }
  for (const stmt of reactive.blurHandlers) {
    expressions.push({ expr: stmt, context: "onBlur" });
  }

  // Validate each expression
  for (const { expr, context } of expressions) {
    const variables = findDataVariables(expr);
    for (const variable of variables) {
      if (!env.contains(variable)) {
        return new CompileError(
          `Variable "data.${variable}" in ${context}("${expr}") is not bound. ` +
          `Add it to bindState({ ${variable}: ... }) on this element or an ancestor.`
        );
      }
    }
  }

  return null;
}

/**
 * Compile a Tag, validating expressions and checking for variable shadowing.
 */
function compileTag(tag: Tag, env: CompileEnv): CompileError | null {
  const reactive = tag.reactive;

  // Validate expressions use bound variables (check BEFORE pushing new state)
  const exprError = validateExpressions(tag, env);
  if (exprError) return exprError;

  // If this tag defines state, validate and push for children
  if (reactive?.state) {
    const newVariables = Object.keys(reactive.state);

    // Check for variable shadowing
    for (const variable of newVariables) {
      if (env.contains(variable)) {
        return new CompileError(
          `Variable "data.${variable}" in bindState() shadows a variable from an ancestor. ` +
          `Rename one of them to avoid conflicts.`
        );
      }
    }

    env.push(newVariables);
    const childError = compileView(tag.child, env);
    env.pop();
    return childError;
  }

  return compileView(tag.child, env);
}

/**
 * Compile a View recursively.
 */
function compileView(view: View, env: CompileEnv): CompileError | null {
  if (typeof view === "string") {
    return null;
  }

  if (Array.isArray(view)) {
    for (const subview of view) {
      const error = compileView(subview, env);
      if (error) return error;
    }
    return null;
  }

  if (view instanceof Tag) {
    return compileTag(view, env);
  }

  return null;
}

/**
 * Assign unique IDs to all reactive elements.
 */
let globalIdCounter = 0;

function assignReactiveIds(view: View): void {
  if (view instanceof Tag) {
    if (view.reactive) {
      view.reactive.id = `r${globalIdCounter++}`;
    }
    assignReactiveIds(view.child);
  } else if (Array.isArray(view)) {
    for (const subview of view) {
      assignReactiveIds(subview);
    }
  }
}

/**
 * Reset the global ID counter. Call before compile() in tests.
 */
export function resetIdCounter(): void {
  globalIdCounter = 0;
}

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
export function compile(view: View): CompileError | null {
  const env = new CompileEnv();
  const error = compileView(view, env);
  if (error) return error;

  assignReactiveIds(view);
  return null;
}

// ------------------------------------
// Script Generation
// ------------------------------------

/**
 * Collected information about a reactive root for script generation.
 */
interface ReactiveRoot {
  /** The tag with bindState() */
  tag: Tag;
  /** All descendant tags with reactive bindings */
  bindings: Tag[];
}

/**
 * Find all reactive roots and their bindings in a view tree.
 */
function findReactiveRoots(view: View): ReactiveRoot[] {
  const roots: ReactiveRoot[] = [];

  function walk(v: View, currentRoot: ReactiveRoot | null): void {
    if (typeof v === "string") return;

    if (Array.isArray(v)) {
      for (const subview of v) {
        walk(subview, currentRoot);
      }
      return;
    }

    if (v instanceof Tag) {
      const reactive = v.reactive;

      // New root?
      if (reactive?.state) {
        const newRoot: ReactiveRoot = { tag: v, bindings: [] };
        roots.push(newRoot);

        // This tag might also have bindings
        if (hasBindings(reactive)) {
          newRoot.bindings.push(v);
        }

        walk(v.child, newRoot);
        return;
      }

      // Existing root, has bindings?
      if (currentRoot && reactive && hasBindings(reactive)) {
        currentRoot.bindings.push(v);
      }

      walk(v.child, currentRoot);
    }
  }

  walk(view, null);
  return roots;
}

/**
 * Check if ReactiveProps has any bindings (excluding state).
 */
function hasBindings(r: ReactiveProps): boolean {
  return !!(
    r.textExpr ||
    r.showExpr ||
    r.hideExpr ||
    r.htmlExpr ||
    r.valueExpr ||
    (r.classExprs && Object.keys(r.classExprs).length > 0) ||
    (r.attrExprs && Object.keys(r.attrExprs).length > 0) ||
    (r.styleExprs && Object.keys(r.styleExprs).length > 0) ||
    r.clickHandlers.length > 0 ||
    r.inputHandlers.length > 0 ||
    r.changeHandlers.length > 0 ||
    r.submitHandlers.length > 0 ||
    r.keydownHandlers.length > 0 ||
    r.focusHandlers.length > 0 ||
    r.blurHandlers.length > 0
  );
}

/**
 * Generate JavaScript code for a reactive root.
 */
function generateRootScript(root: ReactiveRoot): string {
  const state = root.tag.reactive!.state!;
  const lines: string[] = [];

  // Opening IIFE (https://developer.mozilla.org/en-US/docs/Glossary/IIFE)
  lines.push("(function() {");
  lines.push(`  const data = ${JSON.stringify(state)};`);
  lines.push("");

  // Cache DOM elements
  const elementsWithBindings = root.bindings.filter(
    (t) =>
      t.reactive!.textExpr ||
      t.reactive!.showExpr ||
      t.reactive!.hideExpr ||
      t.reactive!.htmlExpr ||
      t.reactive!.valueExpr ||
      (t.reactive!.classExprs && Object.keys(t.reactive!.classExprs).length > 0) ||
      (t.reactive!.attrExprs && Object.keys(t.reactive!.attrExprs).length > 0) ||
      (t.reactive!.styleExprs && Object.keys(t.reactive!.styleExprs).length > 0)
  );

  for (const tag of elementsWithBindings) {
    const id = tag.reactive!.id;
    lines.push(`  const ${id} = document.getElementById("${id}");`);
  }

  if (elementsWithBindings.length > 0) {
    lines.push("");
  }

  // Update function
  lines.push("  function update() {");

  for (const tag of root.bindings) {
    const r = tag.reactive!;
    const id = r.id;

    if (r.textExpr) {
      lines.push(`    ${id}.textContent = ${r.textExpr};`);
    }
    if (r.htmlExpr) {
      lines.push(`    ${id}.innerHTML = ${r.htmlExpr};`);
    }
    if (r.showExpr) {
      lines.push(`    ${id}.style.display = (${r.showExpr}) ? "" : "none";`);
    }
    if (r.hideExpr) {
      lines.push(`    ${id}.style.display = (${r.hideExpr}) ? "none" : "";`);
    }
    if (r.valueExpr) {
      lines.push(`    ${id}.value = ${r.valueExpr};`);
    }
    for (const [className, expr] of Object.entries(r.classExprs ?? {})) {
      lines.push(`    ${id}.classList.toggle("${className}", !!(${expr}));`);
    }
    for (const [attr, expr] of Object.entries(r.attrExprs ?? {})) {
      lines.push(`    const ${id}_${attr} = ${expr};`);
      lines.push(
        `    if (${id}_${attr} != null) ${id}.setAttribute("${attr}", ${id}_${attr}); else ${id}.removeAttribute("${attr}");`
      );
    }
    for (const [prop, expr] of Object.entries(r.styleExprs ?? {})) {
      lines.push(`    ${id}.style["${prop}"] = ${expr};`);
    }
  }

  lines.push("  }");
  lines.push("");

  // Event handlers
  for (const tag of root.bindings) {
    const r = tag.reactive!;
    const id = r.id;

    // Need to get element reference for event handlers
    const needsRef =
      r.clickHandlers.length > 0 ||
      r.inputHandlers.length > 0 ||
      r.changeHandlers.length > 0 ||
      r.submitHandlers.length > 0 ||
      r.keydownHandlers.length > 0 ||
      r.focusHandlers.length > 0 ||
      r.blurHandlers.length > 0;

    if (needsRef && !elementsWithBindings.includes(tag)) {
      lines.push(`  const ${id} = document.getElementById("${id}");`);
    }

    if (r.clickHandlers.length > 0) {
      lines.push(`  ${id}.addEventListener("click", function(event) {`);
      for (const stmt of r.clickHandlers) {
        lines.push(`    ${stmt};`);
      }
      lines.push("    update();");
      lines.push("  });");
    }

    if (r.inputHandlers.length > 0) {
      lines.push(`  ${id}.addEventListener("input", function(event) {`);
      for (const stmt of r.inputHandlers) {
        lines.push(`    ${stmt};`);
      }
      lines.push("    update();");
      lines.push("  });");
    }

    if (r.changeHandlers.length > 0) {
      lines.push(`  ${id}.addEventListener("change", function(event) {`);
      for (const stmt of r.changeHandlers) {
        lines.push(`    ${stmt};`);
      }
      lines.push("    update();");
      lines.push("  });");
    }

    if (r.submitHandlers.length > 0) {
      lines.push(`  ${id}.addEventListener("submit", function(event) {`);
      lines.push("    event.preventDefault();");
      for (const stmt of r.submitHandlers) {
        lines.push(`    ${stmt};`);
      }
      lines.push("    update();");
      lines.push("  });");
    }

    if (r.keydownHandlers.length > 0) {
      lines.push(`  ${id}.addEventListener("keydown", function(event) {`);
      for (const stmt of r.keydownHandlers) {
        lines.push(`    ${stmt};`);
      }
      lines.push("    update();");
      lines.push("  });");
    }

    if (r.focusHandlers.length > 0) {
      lines.push(`  ${id}.addEventListener("focus", function(event) {`);
      for (const stmt of r.focusHandlers) {
        lines.push(`    ${stmt};`);
      }
      lines.push("    update();");
      lines.push("  });");
    }

    if (r.blurHandlers.length > 0) {
      lines.push(`  ${id}.addEventListener("blur", function(event) {`);
      for (const stmt of r.blurHandlers) {
        lines.push(`    ${stmt};`);
      }
      lines.push("    update();");
      lines.push("  });");
    }
  }

  // Initial update
  lines.push("");
  lines.push("  update();");
  lines.push("})();");

  return lines.join("\n");
}

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
export function generateScript(view: View): string {
  const roots = findReactiveRoots(view);
  if (roots.length === 0) return "";

  return roots.map(generateRootScript).join("\n\n");
}

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
export function renderWithScript(
  view: View,
  renderFn: (view: View) => string = render
): string {
  const html = renderFn(view);
  const script = generateScript(view);

  if (!script) return html;

  return `${html}\n<script>\n${script}\n</script>`;
}