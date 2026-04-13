var __addDisposableResource = (this && this.__addDisposableResource) || function (env, value, async) {
    if (value !== null && value !== void 0) {
        if (typeof value !== "object" && typeof value !== "function") throw new TypeError("Object expected.");
        var dispose, inner;
        if (async) {
            if (!Symbol.asyncDispose) throw new TypeError("Symbol.asyncDispose is not defined.");
            dispose = value[Symbol.asyncDispose];
        }
        if (dispose === void 0) {
            if (!Symbol.dispose) throw new TypeError("Symbol.dispose is not defined.");
            dispose = value[Symbol.dispose];
            if (async) inner = dispose;
        }
        if (typeof dispose !== "function") throw new TypeError("Object not disposable.");
        if (inner) dispose = function() { try { inner.call(this); } catch (e) { return Promise.reject(e); } };
        env.stack.push({ value: value, dispose: dispose, async: async });
    }
    else if (async) {
        env.stack.push({ async: true });
    }
    return value;
};
var __disposeResources = (this && this.__disposeResources) || (function (SuppressedError) {
    return function (env) {
        function fail(e) {
            env.error = env.hasError ? new SuppressedError(e, env.error, "An error was suppressed during disposal.") : e;
            env.hasError = true;
        }
        var r, s = 0;
        function next() {
            while (r = env.stack.pop()) {
                try {
                    if (!r.async && s === 1) return s = 0, env.stack.push(r), Promise.resolve().then(next);
                    if (r.dispose) {
                        var result = r.dispose.call(r.value);
                        if (r.async) return s |= 2, Promise.resolve(result).then(next, function(e) { fail(e); return next(); });
                    }
                    else s |= 1;
                }
                catch (e) {
                    fail(e);
                }
            }
            if (s === 1) return env.hasError ? Promise.reject(env.error) : Promise.resolve();
            if (env.hasError) throw env.error;
        }
        return next();
    };
})(typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
});
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { render, Div, Span, Nav, Section, IfThen, createContext, createRequiredContext, } from "../src/index.js";
// ----------------------------------------
// Context — scoped implicit values
// ----------------------------------------
const ThemeCtx = createContext("light");
const LocaleCtx = createContext("en-US");
// Simple components that read context
function ThemedBox() {
    const bg = ThemeCtx.current === "dark" ? "gray-900" : "white";
    return Div("content").background(bg);
}
function Greeting() {
    return Span(LocaleCtx.current === "de" ? "Hallo" : "Hello");
}
describe("Context — createContext", () => {
    it("returns default value when no scope is active", () => {
        assert.strictEqual(ThemeCtx.current, "light");
        assert.strictEqual(LocaleCtx.current, "en-US");
    });
    it("scope overrides current value", () => {
        const env_1 = { stack: [], error: void 0, hasError: false };
        try {
            const _ = __addDisposableResource(env_1, ThemeCtx.scope("dark"), false);
            assert.strictEqual(ThemeCtx.current, "dark");
        }
        catch (e_1) {
            env_1.error = e_1;
            env_1.hasError = true;
        }
        finally {
            __disposeResources(env_1);
        }
    });
    it("value reverts after scope exits", () => {
        {
            const env_2 = { stack: [], error: void 0, hasError: false };
            try {
                const _ = __addDisposableResource(env_2, ThemeCtx.scope("dark"), false);
                assert.strictEqual(ThemeCtx.current, "dark");
            }
            catch (e_2) {
                env_2.error = e_2;
                env_2.hasError = true;
            }
            finally {
                __disposeResources(env_2);
            }
        }
        assert.strictEqual(ThemeCtx.current, "light");
    });
    it("nested scopes override and revert correctly", () => {
        const env_3 = { stack: [], error: void 0, hasError: false };
        try {
            const _outer = __addDisposableResource(env_3, ThemeCtx.scope("dark"), false);
            assert.strictEqual(ThemeCtx.current, "dark");
            {
                const env_4 = { stack: [], error: void 0, hasError: false };
                try {
                    const _inner = __addDisposableResource(env_4, ThemeCtx.scope("light"), false);
                    assert.strictEqual(ThemeCtx.current, "light");
                }
                catch (e_3) {
                    env_4.error = e_3;
                    env_4.hasError = true;
                }
                finally {
                    __disposeResources(env_4);
                }
            }
            assert.strictEqual(ThemeCtx.current, "dark");
        }
        catch (e_4) {
            env_3.error = e_4;
            env_3.hasError = true;
        }
        finally {
            __disposeResources(env_3);
        }
    });
    it("multiple contexts are independent", () => {
        const env_5 = { stack: [], error: void 0, hasError: false };
        try {
            const _t = __addDisposableResource(env_5, ThemeCtx.scope("dark"), false);
            const _l = __addDisposableResource(env_5, LocaleCtx.scope("de"), false);
            assert.strictEqual(ThemeCtx.current, "dark");
            assert.strictEqual(LocaleCtx.current, "de");
        }
        catch (e_5) {
            env_5.error = e_5;
            env_5.hasError = true;
        }
        finally {
            __disposeResources(env_5);
        }
    });
    it("components read scoped values during render", () => {
        const env_6 = { stack: [], error: void 0, hasError: false };
        try {
            const _ = __addDisposableResource(env_6, ThemeCtx.scope("dark"), false);
            const html = render(ThemedBox());
            assert.strictEqual(html, `<div class="bg-gray-900">content</div>`);
        }
        catch (e_6) {
            env_6.error = e_6;
            env_6.hasError = true;
        }
        finally {
            __disposeResources(env_6);
        }
    });
    it("components read default when no scope is active", () => {
        const html = render(ThemedBox());
        assert.strictEqual(html, `<div class="bg-white">content</div>`);
    });
    it("nested scope override affects only the inner subtree", () => {
        function Page() {
            const env_7 = { stack: [], error: void 0, hasError: false };
            try {
                const _ = __addDisposableResource(env_7, ThemeCtx.scope("light"), false);
                return Div(Nav(ThemedBox()), DarkSection(), ThemedBox());
            }
            catch (e_7) {
                env_7.error = e_7;
                env_7.hasError = true;
            }
            finally {
                __disposeResources(env_7);
            }
        }
        function DarkSection() {
            const env_8 = { stack: [], error: void 0, hasError: false };
            try {
                const _ = __addDisposableResource(env_8, ThemeCtx.scope("dark"), false);
                return Section(ThemedBox());
            }
            catch (e_8) {
                env_8.error = e_8;
                env_8.hasError = true;
            }
            finally {
                __disposeResources(env_8);
            }
        }
        const html = render(Page());
        // Nav's box: light → bg-white
        // DarkSection's box: dark → bg-gray-900
        // Final box: light → bg-white
        assert.ok(html.includes(`<nav><div class="bg-white">content</div></nav>`));
        assert.ok(html.includes(`<section><div class="bg-gray-900">content</div></section>`));
        // Last child is bg-white
        assert.ok(html.endsWith(`<div class="bg-white">content</div></div>`));
    });
    it("works with IfThen control flow", () => {
        function AdminBar() {
            const env_9 = { stack: [], error: void 0, hasError: false };
            try {
                const _ = __addDisposableResource(env_9, ThemeCtx.scope("dark"), false);
                return IfThen(true, () => ThemedBox());
            }
            catch (e_9) {
                env_9.error = e_9;
                env_9.hasError = true;
            }
            finally {
                __disposeResources(env_9);
            }
        }
        const html = render(AdminBar());
        assert.strictEqual(html, `<div class="bg-gray-900">content</div>`);
    });
    it("scope is safe across sequential renders", () => {
        {
            const env_10 = { stack: [], error: void 0, hasError: false };
            try {
                const _ = __addDisposableResource(env_10, ThemeCtx.scope("dark"), false);
                render(ThemedBox());
            }
            catch (e_10) {
                env_10.error = e_10;
                env_10.hasError = true;
            }
            finally {
                __disposeResources(env_10);
            }
        }
        // After scope exits, next render sees default
        const html = render(ThemedBox());
        assert.strictEqual(html, `<div class="bg-white">content</div>`);
    });
    it("manual dispose works without using keyword", () => {
        const scope = ThemeCtx.scope("dark");
        assert.strictEqual(ThemeCtx.current, "dark");
        scope[Symbol.dispose]();
        assert.strictEqual(ThemeCtx.current, "light");
    });
    it("real-world: locale context for i18n", () => {
        function Page() {
            const env_11 = { stack: [], error: void 0, hasError: false };
            try {
                const _ = __addDisposableResource(env_11, LocaleCtx.scope("de"), false);
                return Div(Greeting());
            }
            catch (e_11) {
                env_11.error = e_11;
                env_11.hasError = true;
            }
            finally {
                __disposeResources(env_11);
            }
        }
        const html = render(Page());
        assert.strictEqual(html, `<div><span>Hallo</span></div>`);
    });
});
// ----------------------------------------
// Context — createRequiredContext
// ----------------------------------------
describe("Context — createRequiredContext", () => {
    const AuthCtx = createRequiredContext("AuthCtx");
    it("throws when accessed outside scope", () => {
        assert.throws(() => AuthCtx.current, { message: 'Context "AuthCtx" accessed outside of a scope. Wrap the call in AuthCtx.scope(value).' });
    });
    it("returns value inside scope", () => {
        const env_12 = { stack: [], error: void 0, hasError: false };
        try {
            const _ = __addDisposableResource(env_12, AuthCtx.scope({ name: "Alice" }), false);
            assert.deepStrictEqual(AuthCtx.current, { name: "Alice" });
        }
        catch (e_12) {
            env_12.error = e_12;
            env_12.hasError = true;
        }
        finally {
            __disposeResources(env_12);
        }
    });
    it("reverts to throwing after scope exits", () => {
        {
            const env_13 = { stack: [], error: void 0, hasError: false };
            try {
                const _ = __addDisposableResource(env_13, AuthCtx.scope({ name: "Bob" }), false);
                assert.strictEqual(AuthCtx.current.name, "Bob");
            }
            catch (e_13) {
                env_13.error = e_13;
                env_13.hasError = true;
            }
            finally {
                __disposeResources(env_13);
            }
        }
        assert.throws(() => AuthCtx.current, /AuthCtx/);
    });
    it("nested scopes work correctly", () => {
        const env_14 = { stack: [], error: void 0, hasError: false };
        try {
            const _outer = __addDisposableResource(env_14, AuthCtx.scope({ name: "Outer" }), false);
            assert.strictEqual(AuthCtx.current.name, "Outer");
            {
                const env_15 = { stack: [], error: void 0, hasError: false };
                try {
                    const _inner = __addDisposableResource(env_15, AuthCtx.scope({ name: "Inner" }), false);
                    assert.strictEqual(AuthCtx.current.name, "Inner");
                }
                catch (e_14) {
                    env_15.error = e_14;
                    env_15.hasError = true;
                }
                finally {
                    __disposeResources(env_15);
                }
            }
            assert.strictEqual(AuthCtx.current.name, "Outer");
        }
        catch (e_15) {
            env_14.error = e_15;
            env_14.hasError = true;
        }
        finally {
            __disposeResources(env_14);
        }
    });
    it("works during render", () => {
        const env_16 = { stack: [], error: void 0, hasError: false };
        try {
            function UserBadge() {
                return Span(AuthCtx.current.name);
            }
            const _ = __addDisposableResource(env_16, AuthCtx.scope({ name: "Alice" }), false);
            const html = render(UserBadge());
            assert.strictEqual(html, `<span>Alice</span>`);
        }
        catch (e_16) {
            env_16.error = e_16;
            env_16.hasError = true;
        }
        finally {
            __disposeResources(env_16);
        }
    });
});
//# sourceMappingURL=context.test.js.map