import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { defineRoutes } from "../src/routes.js";
import { defineIds } from "../src/ids.js";
const R = defineRoutes({
    simple: { method: "get", path: "/users/:id" },
    multi: { method: "get", path: "/a/:userId/b/:postId" },
    dotSuffix: { method: "get", path: "/export/:id.csv" },
    splat: { method: "get", path: "/files/*path" },
    anonSplat: { method: "get", path: "/dl/*" },
    mixed: { method: "get", path: "/u/:id/*rest" },
});
// Prefix-param route (the key can only be extracted from the joined path).
const P = defineRoutes("/users/:userId", {
    posts: { method: "get", path: "/posts", params: { userId: "number" } },
});
const ids = defineIds([
    "user-list", "col-2", "step-3-panel", "tab-1", "modal", "notification-area",
]);
describe("routes: type-required param keys ≡ runtime-consumed keys (anti-drift)", () => {
    it("resolves every shape cleanly, with no leftover :param / *splat", () => {
        const cases = [
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
        assert.deepStrictEqual(Object.keys(ids).sort(), ["col2", "modal", "notificationArea", "step3Panel", "tab1", "userList"].sort());
    });
    it("each camel key round-trips to its raw kebab id / selector", () => {
        assert.strictEqual(ids.col2.id, "col-2");
        assert.strictEqual(ids.step3Panel.id, "step-3-panel");
        assert.strictEqual(ids.tab1.id, "tab-1");
        assert.strictEqual(ids.userList.selector, "#user-list");
        assert.strictEqual(ids.notificationArea.selector, "#notification-area");
    });
});
//# sourceMappingURL=routes-ids-parity.test.js.map