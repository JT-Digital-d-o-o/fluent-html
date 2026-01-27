/**
 * Represents a type-safe element ID that can be used for both
 * setting element IDs and referencing them in HTMX targets.
 *
 * @example
 * const ids = defineIds(["user-list", "user-count"] as const);
 *
 * // Use .id for setId()
 * Div().setId(ids.userList)  // or ids.userList.id
 *
 * // Use .selector for hx-target
 * hx("/api", { target: ids.userList.selector })  // "#user-list"
 */
export interface Id {
    /** The raw ID string (e.g., "user-list") */
    readonly id: string;
    /** The CSS selector (e.g., "#user-list") */
    readonly selector: string;
    /** Returns the selector when used as a string */
    toString(): string;
}
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
export declare function createId(name: string): Id;
type KebabToCamel<S extends string> = S extends `${infer Head}-${infer Tail}` ? `${Head}${Capitalize<KebabToCamel<Tail>>}` : S;
type IdRegistry<T extends readonly string[]> = {
    readonly [K in T[number] as KebabToCamel<K>]: Id;
};
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
export declare function defineIds<const T extends readonly string[]>(names: T): IdRegistry<T>;
/**
 * Type guard to check if a value is an Id object.
 */
export declare function isId(value: unknown): value is Id;
/**
 * Extract the ID string from either a string or Id object.
 * Useful for APIs that accept both.
 */
export declare function extractId(value: string | Id): string;
/**
 * Extract the selector string from either a string or Id object.
 * If given a plain string without #, assumes it's an ID and adds #.
 */
export declare function extractSelector(value: string | Id): string;
export {};
//# sourceMappingURL=ids.d.ts.map