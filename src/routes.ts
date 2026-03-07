// ------------------------------------
// Type-Safe Route System for Fluent HTML
// ------------------------------------
//
// This module provides compile-time safety for HTMX endpoints and HTTP methods.
// It ensures that hx-get/post/etc. always reference valid routes with correct methods.
//
// Complementary to defineIds() which protects target selectors,
// defineRoutes() protects endpoint URLs and HTTP methods.

import type { HTMX, HxHttpMethod, HxSwap, HxTarget } from "./htmx.js";
import { type Id, isId } from "./ids.js";

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
// Route Definition Types
// ------------------------------------

/** A single route definition: HTTP method + path. */
export type RouteDef = {
  readonly method: HxHttpMethod;
  readonly path: string;
};

/** Input object for defineRoutes(). */
type RouteDefinitions = {
  readonly [name: string]: RouteDef;
};

// ------------------------------------
// Prefix Support (type-level)
// ------------------------------------

/** Join a prefix and a sub-path, collapsing a bare "/" into the prefix. */
type JoinPath<Prefix extends string, Path extends string> =
  Path extends "/" ? Prefix : `${Prefix}${Path}`;

/** Map each route definition's path to include the prefix. */
type PrefixedRouteDefs<P extends string, T extends RouteDefinitions> = {
  readonly [K in keyof T]: {
    readonly method: T[K]['method'];
    readonly path: JoinPath<P, T[K]['path']>;
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
};

// ------------------------------------
// Route Callable Types
// ------------------------------------

/** Base properties available on every route callable. */
type RouteProperties<Def extends RouteDef> = {
  readonly method: Def['method'];
  readonly path: Def['path'];
  readonly resolve: HasParams<Def['path']> extends true
    ? (params: { [K in ExtractParams<Def['path']>]: string }) => string
    : () => string;
};

/**
 * A type-safe route callable.
 *
 * - Routes with `:param` segments require a params object as the first argument.
 * - Routes without params accept options directly.
 * - Both forms return an `HTMX` object for use with `setHtmx()`.
 * - `.resolve(params?)` returns the resolved URL string (for redirects, links, etc.).
 */
type RouteCallable<Def extends RouteDef> =
  HasParams<Def['path']> extends true
    ? ((params: { [K in ExtractParams<Def['path']>]: string }, options?: RouteHxOptions) => HTMX)
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

/** Internal: build an HTMX object from a resolved path + method + options. */
function buildHtmxFromRoute(
  endpoint: string,
  method: HxHttpMethod,
  options?: RouteHxOptions
): HTMX {
  if (!options) {
    return { endpoint, method };
  }
  const { target, select, indicator, disable, include, ...rest } = options;
  return {
    endpoint,
    method,
    target: target ? (isId(target) ? target.selector : target) : undefined,
    select: select ? (isId(select) ? select.selector : select) : undefined,
    indicator: indicator ? (isId(indicator) ? indicator.selector : indicator) : undefined,
    disable: disable ? (isId(disable) ? disable.selector : disable) : undefined,
    include: include ? (isId(include) ? include.selector : include) : undefined,
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
  definitions: T
): RouteRegistry<T>;
export function defineRoutes<const P extends string, const T extends RouteDefinitions>(
  prefix: P,
  definitions: T
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
      ? function (params: Record<string, string>, options?: RouteHxOptions): HTMX {
          let resolvedPath = fullPath;
          for (const [key, value] of Object.entries(params)) {
            resolvedPath = resolvedPath.replace(`:${key}`, encodeURIComponent(value));
          }
          return buildHtmxFromRoute(resolvedPath, method, options);
        }
      : function (options?: RouteHxOptions): HTMX {
          return buildHtmxFromRoute(fullPath, method, options);
        };

    const resolve = hasParams
      ? function (params: Record<string, string>): string {
          let resolved = fullPath;
          for (const [key, value] of Object.entries(params)) {
            resolved = resolved.replace(`:${key}`, encodeURIComponent(value));
          }
          return resolved;
        }
      : function (): string {
          return fullPath;
        };

    Object.defineProperty(routeFn, "method", { value: method, writable: false, enumerable: true });
    Object.defineProperty(routeFn, "path", { value: fullPath, writable: false, enumerable: true });
    Object.defineProperty(routeFn, "resolve", { value: resolve, writable: false, enumerable: true });

    registry[name] = routeFn;
  }

  return Object.freeze(registry) as RouteRegistry<RouteDefinitions>;
}
