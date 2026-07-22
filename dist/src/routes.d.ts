import type { HTMX, HxHttpMethod, HxTarget, QueryParams } from "./htmx.js";
import type { Id } from "./ids.js";
/**
 * Trim a captured `:param` token at the first non-identifier character, mirroring the
 * runtime substitution boundary (`(?![A-Za-z0-9_])`). So `/export/:id.csv` yields the
 * param key `"id"` (and `resolve({ id })` produces `/export/x.csv`), not `"id.csv"`.
 */
type ParamName<S extends string> = S extends `${infer Head}.${string}` ? ParamName<Head> : S extends `${infer Head}-${string}` ? ParamName<Head> : S;
/**
 * Extract parameter names from a route path string literal.
 *
 * @example
 * ExtractParams<"/users/:id">                    // "id"
 * ExtractParams<"/users/:userId/posts/:postId">  // "userId" | "postId"
 * ExtractParams<"/export/:id.csv">               // "id"  (dot-suffix trimmed)
 * ExtractParams<"/users">                        // never
 */
type ExtractParams<Path extends string> = Path extends `${string}:${infer Param}/${infer Rest}` ? ParamName<Param> | ExtractParams<`/${Rest}`> : Path extends `${string}:${infer Param}` ? ParamName<Param> : never;
/**
 * Extract a trailing catch-all (splat) param key from a path.
 * `/scope/*` → "splat"; `/files/*path` → "path". Only a trailing `/*` is a splat — the
 * `` Rest extends `${string}/${string}` `` guard rejects mid-path wildcards (unsupported).
 */
type ExtractSplat<Path extends string> = Path extends `${string}/*${infer Rest}` ? Rest extends "" ? "splat" : Rest extends `${string}/${string}` ? never : Rest : never;
/** All param keys a path declares — `:param` segments plus a trailing splat. */
type AnyParamKey<Path extends string> = ExtractParams<Path> | ExtractSplat<Path>;
/**
 * Whether a path contains any `:param` segments or a trailing splat.
 * `[T] extends [never]` tuple-wraps to stop `never` distributing to `false`.
 */
type HasAnyParams<Path extends string> = [
    AnyParamKey<Path>
] extends [never] ? false : true;
/** Supported scalar param type names. Determines the TypeScript type required at call sites. */
export type ParamTypeName = "string" | "number";
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
/**
 * Resolve every param key's TS type: the `:param` types from `ResolveParamTypes`, plus a
 * trailing splat (always `string`). When `ExtractSplat` is `never` the splat half is `{}`, so
 * non-wildcard routes resolve EXACTLY as before — additive, zero behavior change.
 */
type ResolveAllParamTypes<Path extends string, Params extends Readonly<Record<string, ParamType>> | undefined> = ResolveParamTypes<Path, Params> & {
    [K in ExtractSplat<Path>]: string;
};
/** A single route definition: HTTP method + path (plus optional typed `query` params). `method` defaults to `"get"` when omitted. Path must start with `/`. Use `as const` on your definition object to preserve literal types. */
export type RouteDef = {
    readonly method?: HxHttpMethod;
    readonly path: `/${string}`;
    readonly params?: Readonly<Record<string, ParamType>>;
    readonly query?: Readonly<Record<string, ParamType>>;
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
/**
 * Prefix-aware `CheckRouteParams`: validates each route's `params` map against the
 * **joined** (prefix + sub-path) param set, so a param declared in the prefix
 * (`defineRoutes("/users/:userId", { posts: { path: "/posts", params: { userId: "number" } } })`)
 * type-checks instead of being rejected as a stale key.
 */
type CheckRouteParamsPrefixed<P extends `/${string}`, T extends RouteDefinitions> = {
    readonly [K in keyof T]: {
        readonly params?: {
            readonly [Q in keyof T[K]['params']]: Q extends ExtractParams<JoinPath<P, T[K]['path']>> ? ParamType : never;
        };
    };
};
/** Map each route definition's path to include the prefix. */
type PrefixedRouteDefs<P extends `/${string}`, T extends RouteDefinitions> = {
    readonly [K in keyof T]: {
        readonly method: MethodOf<T[K]>;
        readonly path: JoinPath<P, T[K]['path']> & `/${string}`;
        readonly params: T[K]['params'];
        readonly query: T[K]['query'];
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
/**
 * Resolve a route's declared `query` map to the object its callable/`.resolve` accepts.
 * Each declared key is optional (query strings are rarely all-present) and typed by its
 * `ParamType` (scalar or enum tuple). A route with no `query` map keeps the loose
 * `QueryParams`, so undeclared routes are byte-for-byte unchanged.
 */
type ResolveQuery<Q extends Readonly<Record<string, ParamType>> | undefined> = Q extends Readonly<Record<string, ParamType>> ? {
    readonly [K in keyof Q]?: ResolveParam<Q[K]>;
} : QueryParams;
/** Per-route HTMX options — `RouteHxOptions` with the route's typed `query` in place of the loose bag. */
type RouteHxOptionsFor<Def extends RouteDef> = Omit<RouteHxOptions, 'query'> & {
    query?: ResolveQuery<Def['query']>;
};
/** Resolve a route definition's HTTP method, defaulting to `"get"` when `method` is omitted. */
type MethodOf<Def extends RouteDef> = Def extends {
    readonly method: infer M extends HxHttpMethod;
} ? M : "get";
/** Base properties available on every route callable. */
type RouteProperties<Def extends RouteDef> = {
    readonly method: MethodOf<Def>;
    readonly path: Def['path'];
    readonly resolve: HasAnyParams<Def['path']> extends true ? (params: ResolveAllParamTypes<Def['path'], Def['params']>, query?: ResolveQuery<Def['query']>) => string : (query?: ResolveQuery<Def['query']>) => string;
};
/**
 * A type-safe route callable.
 *
 * - Routes with `:param` segments require a params object as the first argument.
 * - Routes without params accept options directly.
 * - Both forms return an `HTMX` object for use with `setHtmx()`.
 * - `.resolve(params?, query?)` returns the resolved URL string (for redirects, links, etc.).
 */
type RouteCallable<Def extends RouteDef> = HasAnyParams<Def['path']> extends true ? ((params: ResolveAllParamTypes<Def['path'], Def['params']>, options?: RouteHxOptionsFor<Def>) => HTMX) & RouteProperties<Def> : ((options?: RouteHxOptionsFor<Def>) => HTMX) & RouteProperties<Def>;
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
 * @param definitions - Object mapping route names to `{ method?, path }` definitions (`method` defaults to `"get"`)
 * @returns A frozen registry where each key is a callable route
 *
 * @example
 * // Define per-feature routes — `method` defaults to "get", so spell it out only when it isn't
 * export const userRoutes = defineRoutes({
 *   list:   { path: "/users" },
 *   create: { method: "post",   path: "/users" },
 *   detail: { path: "/users/:id" },
 *   delete: { method: "delete", path: "/users/:id" },
 * } as const);
 *
 * // With a shared prefix (like Fastify's register prefix)
 * export const userRoutes = defineRoutes("/users", {
 *   list:   { path: "/" },
 *   create: { method: "post",   path: "/" },
 *   detail: { path: "/:id" },
 *   delete: { method: "delete", path: "/:id" },
 * } as const);
 *
 * // Typed query params — declare a `query` map (same ParamType vocabulary as path params);
 * // each key is optional and typed at the call site and in `.resolve`.
 * export const searchRoutes = defineRoutes({
 *   list: { path: "/users", query: { page: "number", sort: ["asc", "desc"] } as const },
 * } as const);
 * searchRoutes.list({ query: { page: 2, sort: "asc" } })   // ok
 * searchRoutes.list.resolve({ page: 2, sort: "aasc" })     // compile error — "aasc" not in the enum
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
export declare function defineRoutes<const P extends `/${string}`, const T extends RouteDefinitions>(prefix: P, definitions: T & CheckRouteParamsPrefixed<P, T>): RouteRegistry<PrefixedRouteDefs<P, T>>;
export {};
//# sourceMappingURL=routes.d.ts.map