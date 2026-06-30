import type { HTMX, HxHttpMethod, HxTarget, QueryParams } from "./htmx.js";
import type { Id } from "./ids.js";
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
/** Supported scalar param type names. Determines the TypeScript type required at call sites. */
export type ParamTypeName = "string" | "number" | "uuid";
/**
 * A param's declared type: a scalar kind, **or** a readonly literal tuple whose member
 * union constrains the segment to an enum (`["active", "archived"] as const`), so the
 * call site requires one of the tokens and a typo is a compile error.
 */
export type ParamType = ParamTypeName | readonly [string, ...string[]];
/** Maps scalar param type names to the TypeScript types accepted at call sites. */
type ParamTypeMap = {
    string: string;
    number: number;
    uuid: string;
};
/** Resolve one declared param type to the TS type accepted at call sites (tuple → its member union). */
type ResolveParam<P> = P extends ParamTypeName ? ParamTypeMap[P] : P extends readonly string[] ? P[number] : string;
/**
 * Resolve the TypeScript type for each extracted path param.
 * When a `params` map is provided, each param uses its declared type (scalar or enum tuple).
 * Params not listed in the map (or routes without `params`) default to `string`.
 */
type ResolveParamTypes<Path extends string, Params extends Readonly<Record<string, ParamType>> | undefined> = {
    [K in ExtractParams<Path>]: Params extends Readonly<Record<string, ParamType>> ? K extends keyof Params ? ResolveParam<Params[K]> : string : string;
};
/** A single route definition: HTTP method + path. Path must start with `/`. Use `as const` on your definition object to preserve literal types. */
export type RouteDef = {
    readonly method: HxHttpMethod;
    readonly path: `/${string}`;
    readonly params?: Readonly<Record<string, ParamType>>;
};
/** Input object for defineRoutes(). */
type RouteDefinitions = {
    readonly [name: string]: RouteDef;
};
/**
 * Path-key validation (F-D-141). For each route, forces a `params` key that is NOT a
 * `:param` in that route's `path` to type `never`, so a typo'd/stale entry is a compile
 * error instead of a silently-ignored no-op. Intersected with the inferred definitions in
 * `defineRoutes` — the `never` survives the intersection, rejecting the bad value.
 */
type CheckRouteParams<T extends RouteDefinitions> = {
    readonly [K in keyof T]: {
        readonly params?: {
            readonly [P in keyof T[K]['params']]: P extends ExtractParams<T[K]['path']> ? ParamType : never;
        };
    };
};
/** Join a prefix and a sub-path, collapsing a bare "/" into the prefix. */
type JoinPath<Prefix extends `/${string}`, Path extends `/${string}`> = Path extends "/" ? Prefix : `${Prefix}${Path}`;
/** Map each route definition's path to include the prefix. */
type PrefixedRouteDefs<P extends `/${string}`, T extends RouteDefinitions> = {
    readonly [K in keyof T]: {
        readonly method: T[K]['method'];
        readonly path: JoinPath<P, T[K]['path']> & `/${string}`;
        readonly params: T[K]['params'];
    };
};
/**
 * HTMX options that can be passed when calling a route.
 * Excludes `endpoint` (derived from path) and `method` (locked by definition).
 */
export type RouteHxOptions = Partial<Omit<HTMX, 'endpoint' | 'method' | 'target' | 'select' | 'indicator' | 'disable' | 'include'>> & {
    target?: HxTarget | Id;
    select?: string | Id;
    indicator?: string | Id;
    disable?: string | Id;
    include?: string | Id;
    query?: QueryParams;
};
/** Base properties available on every route callable. */
type RouteProperties<Def extends RouteDef> = {
    readonly method: Def['method'];
    readonly path: Def['path'];
    readonly resolve: HasParams<Def['path']> extends true ? (params: ResolveParamTypes<Def['path'], Def['params']>, query?: QueryParams) => string : (query?: QueryParams) => string;
};
/**
 * A type-safe route callable.
 *
 * - Routes with `:param` segments require a params object as the first argument.
 * - Routes without params accept options directly.
 * - Both forms return an `HTMX` object for use with `setHtmx()`.
 * - `.resolve(params?, query?)` returns the resolved URL string (for redirects, links, etc.).
 */
type RouteCallable<Def extends RouteDef> = HasParams<Def['path']> extends true ? ((params: ResolveParamTypes<Def['path'], Def['params']>, options?: RouteHxOptions) => HTMX) & RouteProperties<Def> : ((options?: RouteHxOptions) => HTMX) & RouteProperties<Def>;
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
 * // With a shared prefix (like Fastify's register prefix)
 * export const userRoutes = defineRoutes("/users", {
 *   list:   { method: "get",    path: "/" },
 *   create: { method: "post",   path: "/" },
 *   detail: { method: "get",    path: "/:id" },
 *   delete: { method: "delete", path: "/:id" },
 * } as const);
 *
 * // In views — type-safe HTMX
 * Button("Load").setHtmx(userRoutes.list())
 * Button("Delete").setHtmx(userRoutes.delete({ id: user.id }))
 * Button("Delete").setHtmx(userRoutes.delete({ id: user.id }, { target: ids.userList }))
 *
 * // In controllers — single-sourced paths
 * server.get(userRoutes.list.path, handler)       // "/users"
 * server.delete(userRoutes.delete.path, handler)   // "/users/:id"
 */
export declare function defineRoutes<const T extends RouteDefinitions>(definitions: T & CheckRouteParams<T>): RouteRegistry<T>;
export declare function defineRoutes<const P extends `/${string}`, const T extends RouteDefinitions>(prefix: P, definitions: T & CheckRouteParams<T>): RouteRegistry<PrefixedRouteDefs<P, T>>;
export {};
//# sourceMappingURL=routes.d.ts.map