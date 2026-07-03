import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { defineRoutes } from "../src/routes.js";
import { defineIds } from "../src/ids.js";

// ─────────────────────────────────────────────────────────────────────────────
// Anti-drift harness (Phase 1). The routing/id rules are encoded twice — once in
// template-literal types, once in runtime regex/`.replace` — with nothing forcing
// them to agree. This file pins BOTH to the same fixtures:
//   - a type-level assertion that the extracted param/id key set is exactly expected;
//   - a runtime assertion that resolution consumes exactly those keys (no leftover
//     `:param` / `*splat`, and camel keys round-trip to their raw id).
// If either encoding drifts from the other, one side fails to compile or asserts.
// ─────────────────────────────────────────────────────────────────────────────

// Type-level equality WITH TEETH: `Expect<false>` is a compile error (TS2344), so a
// wrong assertion fails the build rather than silently passing.
type Equals<A, B> =
  (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;
type Expect<T extends true> = T;

// First-argument (params) object of a route's resolve()/callable.
type ParamKeys<F> = keyof Parameters<F extends (...a: never[]) => unknown ? F : never>[0];

const R = defineRoutes({
  simple:    { method: "get", path: "/users/:id" },
  multi:     { method: "get", path: "/a/:userId/b/:postId" },
  dotSuffix: { method: "get", path: "/export/:id.csv" },
  splat:     { method: "get", path: "/files/*path" },
  anonSplat: { method: "get", path: "/dl/*" },
  mixed:     { method: "get", path: "/u/:id/*rest" },
} as const);

// Prefix-param route (the key can only be extracted from the joined path).
const P = defineRoutes("/users/:userId", {
  posts: { method: "get", path: "/posts", params: { userId: "number" } as const },
} as const);

// TYPE SIDE — the resolve() param keys must be exactly these (exported so the
// assertions aren't flagged unused; each tuple element must be `true`).
export type _RouteParamKeyParity = [
  Expect<Equals<ParamKeys<typeof R.simple.resolve>, "id">>,
  Expect<Equals<ParamKeys<typeof R.multi.resolve>, "userId" | "postId">>,
  Expect<Equals<ParamKeys<typeof R.dotSuffix.resolve>, "id">>,
  Expect<Equals<ParamKeys<typeof R.splat.resolve>, "path">>,
  Expect<Equals<ParamKeys<typeof R.anonSplat.resolve>, "splat">>,
  Expect<Equals<ParamKeys<typeof R.mixed.resolve>, "id" | "rest">>,
  Expect<Equals<ParamKeys<typeof P.posts.resolve>, "userId">>,
];

const ids = defineIds([
  "user-list", "col-2", "step-3-panel", "tab-1", "modal", "notification-area",
] as const);

export type _IdKeyParity = Expect<Equals<
  keyof typeof ids,
  "userList" | "col2" | "step3Panel" | "tab1" | "modal" | "notificationArea"
>>;

describe("routes: type-required param keys ≡ runtime-consumed keys (anti-drift)", () => {
  it("resolves every shape cleanly, with no leftover :param / *splat", () => {
    const cases: ReadonlyArray<readonly [string, string]> = [
      [R.simple.resolve({ id: "5" }), "/users/5"],
      [R.multi.resolve({ userId: "1", postId: "2" }), "/a/1/b/2"],
      [R.dotSuffix.resolve({ id: "x" }), "/export/x.csv"],
      [R.splat.resolve({ path: "a/b" }), "/files/a/b"],
      [R.anonSplat.resolve({ splat: "a/b" }), "/dl/a/b"],
      [R.mixed.resolve({ id: "7", rest: "x/y" }), "/u/7/x/y"],
      [P.posts.resolve({ userId: 42 }), "/users/42/posts"],
    ];
    for (const [got, want] of cases) {
      assert.strictEqual(got, want);
      // A drifted key would leave an unresolved token behind.
      assert.ok(!/:[A-Za-z]/.test(got), `leftover :param in ${got}`);
      assert.ok(!got.includes("*"), `leftover *splat in ${got}`);
    }
  });
});

describe("defineIds: type camelKeys ≡ runtime camelKeys (anti-drift)", () => {
  it("runtime property keys match the type-level KebabToCamel set exactly", () => {
    assert.deepStrictEqual(
      Object.keys(ids).sort(),
      ["col2", "modal", "notificationArea", "step3Panel", "tab1", "userList"].sort(),
    );
  });

  it("each camel key round-trips to its raw kebab id / selector", () => {
    assert.strictEqual(ids.col2.id, "col-2");
    assert.strictEqual(ids.step3Panel.id, "step-3-panel");
    assert.strictEqual(ids.tab1.id, "tab-1");
    assert.strictEqual(ids.userList.selector, "#user-list");
    assert.strictEqual(ids.notificationArea.selector, "#notification-area");
  });
});
