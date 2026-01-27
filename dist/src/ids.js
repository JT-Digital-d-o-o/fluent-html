"use strict";
// ------------------------------------
// Type-Safe ID System for Lambda.html
// ------------------------------------
//
// This module provides compile-time safety for HTMX targets and element IDs.
// It ensures that hx-target selectors always reference valid element IDs.
Object.defineProperty(exports, "__esModule", { value: true });
exports.createId = createId;
exports.defineIds = defineIds;
exports.isId = isId;
exports.extractId = extractId;
exports.extractSelector = extractSelector;
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
function createId(name) {
    const idObj = {
        id: name,
        selector: `#${name}`,
        toString() { return this.selector; }
    };
    return Object.freeze(idObj);
}
``; // for syntax highlighting in vscode
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
 * // Use in OOB swaps
 * OOB(ids.userCount, Span("42 users"))
 */
function defineIds(names) {
    const registry = {};
    for (const name of names) {
        // Convert kebab-case to camelCase for the property key
        const camelKey = name.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
        registry[camelKey] = createId(name);
    }
    return Object.freeze(registry);
}
/**
 * Type guard to check if a value is an Id object.
 */
function isId(value) {
    return (typeof value === 'object' &&
        value !== null &&
        'id' in value &&
        'selector' in value &&
        typeof value.id === 'string' &&
        typeof value.selector === 'string');
}
/**
 * Extract the ID string from either a string or Id object.
 * Useful for APIs that accept both.
 */
function extractId(value) {
    return isId(value) ? value.id : value;
}
/**
 * Extract the selector string from either a string or Id object.
 * If given a plain string without #, assumes it's an ID and adds #.
 */
function extractSelector(value) {
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