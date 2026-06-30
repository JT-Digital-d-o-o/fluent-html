// ------------------------------------
// Type-Safe Route System for Fluent HTML
// ------------------------------------
//
// This module provides compile-time safety for HTMX endpoints and HTTP methods.
// It ensures that hx-get/post/etc. always reference valid routes with correct methods.
//
// Complementary to defineIds() which protects target selectors,
// defineRoutes() protects endpoint URLs and HTTP methods.

import type { HTMX, HxHttpMethod, HxTarget, QueryParams } from "./htmx.js";
import { resolveSelector, buildQueryString } from "./htmx.js";
import type { Id } from "./ids.js";

// ------------------------------------
// Path Parameter Extraction (type-level)
// ------------------------------------

/**
 * Extract parameter names from a route path string literal.
 *
 * @example
 * ExtractParams<"/users/:id">                    // "id"
 * ExtractParams<"/users/:userId/posts/:postId">  // "userId" | "postId"
 * ExtractParams<"/users">                        // never
 */
type ExtractParams<Path extends string> =
  Path extends `${string}:${infer Param}/${infer Rest}`
    ? Param | ExtractParams<`/${Rest}`>
    : Path extends `${string}:${infer Param}`
      ? Param
      : never;

/** Whether a path contains `:param` segments. */
type HasParams<Path extends string> =
  ExtractParams<Path> extends never ? false : true;

// ------------------------------------
// Param Type Metadata
// ------------------------------------

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
type ResolveParam<P> =
  P extends ParamTypeName ? ParamTypeMap[P]
  : P extends readonly string[] ? P[number]
  : string;

/**
 * Resolve the TypeScript type for each extracted path param.
 * When a `params` map is provided, each param uses its declared type (scalar or enum tuple).
 * Params not listed in the map (or routes without `params`) default to `string`.
 */
type ResolveParamTypes<
  Path extends string,
  Params extends Readonly<Record<string, ParamType>> | undefined,
> = {
  [K in ExtractParams<Path>]: Params extends Readonly<Record<string, ParamType>>
    ? K extends keyof Params
      ? ResolveParam<Params[K]>
      : string
    : string;
};

// ------------------------------------
// Route Definition Types
// ------------------------------------

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

// ------------------------------------
// Prefix Support (type-level)
// ------------------------------------

/** Join a prefix and a sub-path, collapsing a bare "/" into the prefix. */
type JoinPath<Prefix extends `/${string}`, Path extends `/${string}`> =
  Path extends "/" ? Prefix : `${Prefix}${Path}`;

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

// ------------------------------------
// Route Callable Types
// ------------------------------------

/** Base properties available on every route callable. */
type RouteProperties<Def extends RouteDef> = {
  readonly method: Def['method'];
  readonly path: Def['path'];
  readonly resolve: HasParams<Def['path']> extends true
    ? (params: ResolveParamTypes<Def['path'], Def['params']>, query?: QueryParams) => string
    : (query?: QueryParams) => string;
};

/**
 * A type-safe route callable.
 *
 * - Routes with `:param` segments require a params object as the first argument.
 * - Routes without params accept options directly.
 * - Both forms return an `HTMX` object for use with `setHtmx()`.
 * - `.resolve(params?, query?)` returns the resolved URL string (for redirects, links, etc.).
 */
type RouteCallable<Def extends RouteDef> =
  HasParams<Def['path']> extends true
    ? ((params: ResolveParamTypes<Def['path'], Def['params']>, options?: RouteHxOptions) => HTMX)
      & RouteProperties<Def>
    : ((options?: RouteHxOptions) => HTMX)
      & RouteProperties<Def>;

/** The full registry object returned by defineRoutes(). */
type RouteRegistry<T extends RouteDefinitions> = {
  readonly [K in keyof T]: RouteCallable<T[K]>;
};

// ------------------------------------
// Runtime Implementation
// ------------------------------------

/** Internal: throw if any `:param` placeholders remain after substitution. */
function assertNoUnresolvedParams(resolved: string, template: string): void {
  const match = resolved.match(/:([a-zA-Z_]\w*)/);
  if (match) {
    throw new Error(`Unresolved route param ":${match[1]}" in "${template}"`);
  }
}

/** Internal: escape RegExp metacharacters in a literal param name (names are normally identifiers). */
function escapeRegExp(literal: string): string {
  return literal.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Internal: substitute every `:name` placeholder with its encoded value. Boundary-aware
 * (`:id` never matches inside `:idCard`) and replaces all occurrences; the trailing
 * lookahead mirrors the identifier grammar used by `assertNoUnresolvedParams`.
 */
function substituteParams(template: string, params: Record<string, string | number>): string {
  let out = template;
  for (const [key, value] of Object.entries(params)) {
    const pattern = new RegExp(`:${escapeRegExp(key)}(?![A-Za-z0-9_])`, "g");
    out = out.replace(pattern, encodeURIComponent(String(value)));
  }
  return out;
}

/** Internal: build an HTMX object from a resolved path + method + options. */
function buildHtmxFromRoute(
  endpoint: string,
  method: HxHttpMethod,
  options?: RouteHxOptions
): HTMX {
  if (!options) {
    return { endpoint, method };
  }
  const { target, select, indicator, disable, include, query, ...rest } = options;
  const resolvedEndpoint = query ? buildQueryString(endpoint, query) : endpoint;
  return {
    endpoint: resolvedEndpoint,
    method,
    target: resolveSelector(target),
    select: resolveSelector(select),
    indicator: resolveSelector(indicator),
    disable: resolveSelector(disable),
    include: resolveSelector(include),
    ...rest,
  };
}

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
export function defineRoutes<const T extends RouteDefinitions>(
  definitions: T & CheckRouteParams<T>
): RouteRegistry<T>;
export function defineRoutes<const P extends `/${string}`, const T extends RouteDefinitions>(
  prefix: P,
  definitions: T & CheckRouteParams<T>
): RouteRegistry<PrefixedRouteDefs<P, T>>;
export function defineRoutes(
  prefixOrDefinitions: string | RouteDefinitions,
  maybeDefinitions?: RouteDefinitions
): RouteRegistry<RouteDefinitions> {
  const prefix = typeof prefixOrDefinitions === "string" ? prefixOrDefinitions : "";
  const definitions = typeof prefixOrDefinitions === "string" ? maybeDefinitions! : prefixOrDefinitions;

  const registry: Record<string, unknown> = {};

  for (const [name, def] of Object.entries(definitions)) {
    const { method } = def;
    const fullPath = prefix && def.path === "/" ? prefix : prefix + def.path;
    const hasParams = fullPath.includes(":");

    const routeFn = hasParams
      ? function (params: Record<string, string | number>, options?: RouteHxOptions): HTMX {
          const resolvedPath = substituteParams(fullPath, params);
          assertNoUnresolvedParams(resolvedPath, fullPath);
          return buildHtmxFromRoute(resolvedPath, method, options);
        }
      : function (options?: RouteHxOptions): HTMX {
          return buildHtmxFromRoute(fullPath, method, options);
        };

    const resolve = hasParams
      ? function (params: Record<string, string | number>, query?: QueryParams): string {
          const resolved = substituteParams(fullPath, params);
          assertNoUnresolvedParams(resolved, fullPath);
          return query ? buildQueryString(resolved, query) : resolved;
        }
      : function (query?: QueryParams): string {
          return query ? buildQueryString(fullPath, query) : fullPath;
        };

    Object.defineProperty(routeFn, "method", { value: method, writable: false, enumerable: true });
    Object.defineProperty(routeFn, "path", { value: fullPath, writable: false, enumerable: true });
    Object.defineProperty(routeFn, "resolve", { value: resolve, writable: false, enumerable: true });

    registry[name] = routeFn;
  }

  return Object.freeze(registry) as RouteRegistry<RouteDefinitions>;
}
