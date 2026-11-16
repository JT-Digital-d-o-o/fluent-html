// A probe, not a design: the house rule as a type over fluent-html 8's route defs. A route that answers a fragment
// must be a GET and name its reason; a mutation (post, put, patch, delete) cannot declare a fragment, so it answers the page.
import { defineRoutes, type Id, type RouteDefinitions } from "../../../arms/fh8/app.ts";
type Mutation = "post" | "put" | "patch" | "delete";
export type Reason = "poll" | "defer" | "search";
type HouseRule<T> = {
  readonly [K in keyof T]: T[K] extends { readonly render: Id<string> }
    ? T[K] extends { readonly method: Mutation }
      ? { readonly render: "✗ a mutation answers the page: drop render, and the full layout re-renders every region" }
      : T[K] extends { readonly reason: Reason } ? unknown : { readonly reason: Reason }
    : unknown;
};
type Def = RouteDefinitions[string] & { readonly reason?: Reason };
export const houseRoutes = <const P extends `/${string}`, const T extends Record<string, Def>>(prefix: P, defs: T & HouseRule<T>) =>
  defineRoutes<P, T>(prefix, defs as never);
