// ------------------------------------
// Type-Safe ID System for Fluent HTML
// ------------------------------------
//
// This module provides compile-time safety for HTMX targets and element IDs.
// It ensures that hx-target selectors always reference valid element IDs.
/**
 * Create a single Id object from a string.
 *
 * @param name - The ID string (e.g., "user-list")
 * @returns An Id object with .id and .selector properties
 *
 * @example
 * const userId = createId("user-profile");
 * Div().setId(userId)  // id="user-profile"
 * hx("/api", { target: userId.selector })  // hx-target="#user-profile"
 */
// Runtime brand for Id objects. Globally registered (Symbol.for) so it is shared across
// module instances (dual-package safe). createId stamps it; isId checks it — so a structural
// `{ id, selector }` object (e.g. a DB row flowing into resolveSelector) can no longer
// launder itself into an Id, making the interface's "no structural spoofing" claim true.
const ID_BRAND = Symbol.for("fluent-html.Id");
export function createId(name) {
    return Object.freeze({
        id: name,
        selector: `#${name}`,
        [ID_BRAND]: true,
        toString() { return this.selector; }
    }); // cast is safe — the compile-time brand is erased; ID_BRAND is the runtime marker
}
``; // do not remove: for syntax highlighting in vscode
/**
 * Define a registry of type-safe IDs.
 *
 * This function creates a typed object where each ID is accessible
 * via a camelCase property name (kebab-case IDs are converted).
 *
 * @param names - Array of ID strings (use `as const` for type inference)
 * @returns A frozen object with Id entries for each name
 *
 * @example
 * // Define IDs for your application
 * export const ids = defineIds([
 *   "user-list",
 *   "user-count",
 *   "notification-area",
 *   "modal-container",
 * ] as const);
 *
 * // TypeScript knows all valid properties:
 * ids.userList       // ✓ Valid
 * ids.userCount      // ✓ Valid
 * ids.notificationArea // ✓ Valid
 * ids.modalContainer // ✓ Valid
 * ids.invalidId      // ✗ TypeScript error!
 *
 * // Use in page layout
 * Div().setId(ids.userList)
 *
 * // Use in HTMX (same typed reference)
 * Button("Load").setHtmx(hx("/api/users", {
 *   target: ids.userList.selector
 * }))
 *
 * // Use in partial multi-swap responses
 * Partial(ids.userCount, Span("42 users"))
 */
// Runtime mirror of the type-level `KebabToCamel`: split on '-', capitalize the first
// character of every segment after the first, drop the hyphens. The old `/-([a-z])/`
// regex only matched a lowercase letter after '-', so `col-2`/`user-List`/`a-` diverged
// from their compile-time keys (`col2`/`userList`/`a`), leaving typed properties undefined.
// Capitalizing a digit or empty segment is a no-op, matching `Capitalize<…>`.
function kebabToCamel(name) {
    const parts = name.split("-");
    let out = parts[0];
    for (let i = 1; i < parts.length; i++) {
        const p = parts[i];
        out += p.charAt(0).toUpperCase() + p.slice(1);
    }
    return out;
}
export function defineIds(names) {
    const registry = {};
    for (const name of names) {
        const camelKey = kebabToCamel(name);
        // Two distinct names collapsing to one property key (e.g. "user-list" + "userList")
        // would silently last-write-win, retargeting every existing reference — throw instead.
        if (Object.prototype.hasOwnProperty.call(registry, camelKey)) {
            throw new Error(`defineIds: duplicate key "${camelKey}" (from "${name}") — two ids map to the same camelCase property.`);
        }
        registry[camelKey] = createId(name);
    }
    return Object.freeze(registry);
}
/**
 * Type guard to check if a value is an `Id` object.
 *
 * @param value - The value to test
 * @returns `true` if the value is an `Id` object
 *
 * @example
 * isId(ids.userList)   // true
 * isId("#user-list")   // false
 */
export function isId(value) {
    return (typeof value === 'object' &&
        value !== null &&
        value[ID_BRAND] === true);
}
/**
 * Extract the raw ID string from either a string or `Id` object.
 *
 * @param value - A string or `Id` object
 * @returns The raw ID string (without `#`)
 *
 * @example
 * extractId(ids.userList)  // "user-list"
 * extractId("user-list")  // "user-list"
 */
export function extractId(value) {
    return isId(value) ? value.id : value;
}
/**
 * Extract the CSS selector string from either a string or `Id` object.
 * If given a plain string without `#`, assumes it's an ID and prepends `#`.
 *
 * @param value - A string or `Id` object
 * @returns The CSS selector string (e.g. `"#user-list"`)
 *
 * @example
 * extractSelector(ids.userList)   // "#user-list"
 * extractSelector("user-list")   // "#user-list"
 * extractSelector("#user-list")  // "#user-list"
 */
export function extractSelector(value) {
    if (isId(value)) {
        return value.selector;
    }
    // If already a selector (starts with # or other CSS selector chars), return as-is
    if (value.startsWith('#') || value.startsWith('.') || value.includes(' ')) {
        return value;
    }
    // Assume it's an ID, add #
    return `#${value}`;
}
//# sourceMappingURL=ids.js.map