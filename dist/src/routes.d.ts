import type { HTMX, HxHttpMethod, HxTarget } from "./htmx.js";
import { type Id } from "./ids.js";
/**
 * Extract parameter names from a route path string literal.
 *
 * @example
 * ExtractParams<"/users/:id">                    // "id"
 * ExtractParams<"/users/:userId/posts/:postId">  // "userId" | "postId"
 * ExtractParams<"/users">                        // never
 */
type ExtractParams<Path extends string> = Path extends `${string}:${infer Param}/${infer Rest}` ? Param | ExtractParams<`/${Rest}`> : Path extends `${string}:${infer Param}` ? Param : never;
/** Whether a path contains `:param` segments. */
type HasParams<Path extends string> = ExtractParams<Path> extends never ? false : true;
/** A single route definition: HTTP method + path. */
export type RouteDef = {
    readonly method: HxHttpMethod;
    readonly path: string;
};
/** Input object for defineRoutes(). */
type RouteDefinitions = {
    readonly [name: string]: RouteDef;
};
/**
 * HTMX options that can be passed when calling a route.
 * Excludes `endpoint` (derived from path) and `method` (locked by definition).
 */
export type RouteHxOptions = Partial<Omit<HTMX, 'endpoint' | 'method' | 'target'>> & {
    target?: HxTarget | Id;
};
/** Base properties available on every route callable. */
type RouteProperties<Def extends RouteDef> = {
    readonly method: Def['method'];
    readonly path: Def['path'];
};
/**
 * A type-safe route callable.
 *
 * - Routes with `:param` segments require a params object as the first argument.
 * - Routes without params accept options directly.
 * - Both forms return an `HTMX` object for use with `setHtmx()`.
 */
type RouteCallable<Def extends RouteDef> = HasParams<Def['path']> extends true ? ((params: {
    [K in ExtractParams<Def['path']>]: string;
}, options?: RouteHxOptions) => HTMX) & RouteProperties<Def> : ((options?: RouteHxOptions) => HTMX) & RouteProperties<Def>;
/** The full registry object returned by defineRoutes(). */
type RouteRegistry<T extends RouteDefinitions> = {
    readonly [K in keyof T]: RouteCallable<T[K]>;
};
/**
 * Define a type-safe route registry for a feature/controller.
 *
 * Each route becomes a callable function that returns an `HTMX` object,
 * ready to pass to `setHtmx()`. Path parameters (`:id`) are extracted
 * from the path string and required at call time.
 *
 * Routes also expose `.method` and `.path` for server-side registration.
 *
 * @param definitions - Object mapping route names to `{ method, path }` definitions
 * @returns A frozen registry where each key is a callable route
 *
 * @example
 * // Define per-feature routes
 * export const userRoutes = defineRoutes({
 *   list:   { method: "get",    path: "/users" },
 *   create: { method: "post",   path: "/users" },
 *   detail: { method: "get",    path: "/users/:id" },
 *   delete: { method: "delete", path: "/users/:id" },
 * } as const);
 *
 * // In views — type-safe HTMX
 * Button("Load").setHtmx(userRoutes.list())
 * Button("Delete").setHtmx(userRoutes.delete({ id: user.id }))
 * Button("Delete").setHtmx(userRoutes.delete({ id: user.id }, { target: ids.userList }))
 *
 * // In controllers — single-sourced paths
 * server.get(userRoutes.list.path, handler)
 * server.delete(userRoutes.delete.path, handler)
 */
export declare function defineRoutes<const T extends RouteDefinitions>(definitions: T): RouteRegistry<T>;
export {};
//# sourceMappingURL=routes.d.ts.map