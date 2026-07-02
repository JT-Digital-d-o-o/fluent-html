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
declare const __idBrand: unique symbol;
export interface Id {
    /** @internal Prevents structural spoofing — only `createId`/`defineIds` produce valid Ids */
    readonly [__idBrand]: true;
    /** The raw ID string (e.g., "user-list") */
    readonly id: string;
    /** The CSS selector (e.g., "#user-list") */
    readonly selector: string;
    /** Returns the selector when used as a string */
    toString(): string;
}
export declare function createId(name: string): Id;
type KebabToCamel<S extends string> = S extends `${infer Head}-${infer Tail}` ? `${Head}${Capitalize<KebabToCamel<Tail>>}` : S;
type IdRegistry<T extends readonly string[]> = {
    readonly [K in T[number] as KebabToCamel<K>]: Id;
};
export declare function defineIds<const T extends readonly string[]>(names: T): IdRegistry<T>;
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
export declare function isId(value: unknown): value is Id;
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
export declare function extractId(value: string | Id): string;
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
export declare function extractSelector(value: string | Id): string;
export {};
//# sourceMappingURL=ids.d.ts.map