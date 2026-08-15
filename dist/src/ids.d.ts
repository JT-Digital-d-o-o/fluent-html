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
declare const __rootIdBrand: unique symbol;
/**
 * A view whose outermost element carries `id="N"`, as witnessed by `setId(ids.…)`.
 *
 * The root id of a response is what an outer swap replaces, so it is the one property a
 * consumer of a view actually needs to know — and it was previously unknowable, because
 * `setId` returned a bare `this`. `Rooted<N>` makes it a type, so "answer me a view rooted
 * at #user-count" is expressible and a mismatch is a compile error.
 *
 * Phantom only: nothing reads this at runtime, and only `setId` with a typed `Id` produces it.
 */
export type Rooted<N extends string> = {
    readonly [__rootIdBrand]: N;
};
export interface Id<N extends string = string> {
    /** @internal Prevents structural spoofing — only `createId`/`defineIds` produce valid Ids */
    readonly [__idBrand]: true;
    /** The raw ID string (e.g., "user-list") */
    readonly id: N;
    /** The CSS selector (e.g., "#user-list") */
    readonly selector: `#${N}`;
    /** Returns the selector when used as a string */
    toString(): string;
}
export declare function createId<const N extends string>(name: N): Id<N>;
type KebabToCamel<S extends string> = S extends `${infer Head}-${infer Tail}` ? `${Head}${Capitalize<KebabToCamel<Tail>>}` : S;
type IdRegistry<T extends readonly string[]> = {
    readonly [K in T[number] as KebabToCamel<K>]: Id<K>;
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