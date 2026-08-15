// ------------------------------------
// Type-Safe ID System for Fluent HTML
// ------------------------------------
//
// This module provides compile-time safety for HTMX targets and element IDs.
// It ensures that hx-target selectors always reference valid element IDs.

// Type-only, and deliberately so: core/types.ts → core/tag.ts → ids.ts is a cycle at the
// module-graph level, but `import type` is erased, so no runtime cycle exists.
import type { View } from "./core/types.js";

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
export type Rooted<N extends string> = { readonly [__rootIdBrand]: N };

/**
 * The type to annotate a component that answers "a view rooted at #N" with.
 *
 * A bare `: View` return annotation is the one way to lose the brand by accident — the
 * annotation is a widening, so `Div().setId(ids.userCount)` goes in as
 * `Tag & Rooted<"user-count">` and comes out as plain `View`. The call site then fails
 * with an error that never mentions the id:
 *
 *     Argument of type 'View' is not assignable to parameter of type 'Rooted<"user-count"> & View'.
 *       Type 'string' is not assignable to type 'Rooted<"user-count"> & View'.
 *
 * (the `string` is `View`'s own `string` member — TypeScript explains a failed union
 * check by naming its first failing constituent, so the elaboration points nowhere near
 * the real mistake.) `RootedView<N>` is what that annotation should have been: it keeps
 * the brand, so the component's contract is stated rather than erased, and a body that
 * forgets `setId` — or calls it with the wrong id — fails inside the component instead
 * of at every call site.
 *
 * @example
 * function UserCount(n: number): RootedView<"user-count"> {
 *   return Span(`${n} users`).setId(ids.userCount);
 * }
 * reply.renderFragment(ids.userCount, UserCount(3));   // ✓
 *
 * function UserCount(n: number): View {                // ✗ brand erased by the annotation
 *   return Span(`${n} users`).setId(ids.userCount);
 * }
 */
export type RootedView<N extends string> = Rooted<N> & View;

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

export function createId<const N extends string>(name: N): Id<N> {
  // "@self" is a reserved BehaviorTarget sentinel (behavior wire grammar) — an Id
  // carrying it would be indistinguishable from the sentinel on the wire.
  if (name === "@self") {
    throw new Error(`createId: "@self" is reserved by the behavior target grammar and cannot be an element id.`);
  }
  return Object.freeze({
    id: name,
    selector: `#${name}`,
    [ID_BRAND]: true,
    toString() { return this.selector; }
  }) as unknown as Id<N>; // cast is safe — the compile-time brand is erased; ID_BRAND is the runtime marker
}

// Type helper: Convert kebab-case to camelCase
// "user-list" -> "userList"
// "notification-area" -> "notificationArea"
type KebabToCamel<S extends string> = S extends `${infer Head}-${infer Tail}`
    ? `${Head}${Capitalize<KebabToCamel<Tail>>}`
    : S;

``; // do not remove: for syntax highlighting in vscode

// Type for the registry object
type IdRegistry<T extends readonly string[]> = {
  readonly [K in T[number] as KebabToCamel<K>]: Id<K>;
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
 * // Use in partial multi-swap responses
 * Partial(ids.userCount, Span("42 users"))
 */
// Runtime mirror of the type-level `KebabToCamel`: split on '-', capitalize the first
// character of every segment after the first, drop the hyphens. The old `/-([a-z])/`
// regex only matched a lowercase letter after '-', so `col-2`/`user-List`/`a-` diverged
// from their compile-time keys (`col2`/`userList`/`a`), leaving typed properties undefined.
// Capitalizing a digit or empty segment is a no-op, matching `Capitalize<…>`.
function kebabToCamel(name: string): string {
  const parts = name.split("-");
  let out = parts[0]!;
  for (let i = 1; i < parts.length; i++) {
    const p = parts[i]!;
    out += p.charAt(0).toUpperCase() + p.slice(1);
  }
  return out;
}

export function defineIds<const T extends readonly string[]>(
  names: T
): IdRegistry<T> {
  const registry: Record<string, Id> = {};

  for (const name of names) {
    const camelKey = kebabToCamel(name);
    // Two distinct names collapsing to one property key (e.g. "user-list" + "userList")
    // would silently last-write-win, retargeting every existing reference — throw instead.
    if (Object.prototype.hasOwnProperty.call(registry, camelKey)) {
      throw new Error(`defineIds: duplicate key "${camelKey}" (from "${name}") — two ids map to the same camelCase property.`);
    }
    registry[camelKey] = createId(name);
  }

  return Object.freeze(registry) as IdRegistry<T>;
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
export function isId(value: unknown): value is Id {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as Record<symbol, unknown>)[ID_BRAND] === true
  );
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
export function extractId(value: string | Id): string {
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
export function extractSelector(value: string | Id): string {
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
