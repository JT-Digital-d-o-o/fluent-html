import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  render,
  Div, Span, Nav, Section,
  IfThen,
  createContext,
  createRequiredContext,
} from "../src/index.js";

// ----------------------------------------
// Context — scoped implicit values
// ----------------------------------------

const ThemeCtx = createContext<"light" | "dark">("light");
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
    using _ = ThemeCtx.scope("dark");
    assert.strictEqual(ThemeCtx.current, "dark");
  });

  it("value reverts after scope exits", () => {
    {
      using _ = ThemeCtx.scope("dark");
      assert.strictEqual(ThemeCtx.current, "dark");
    }
    assert.strictEqual(ThemeCtx.current, "light");
  });

  it("nested scopes override and revert correctly", () => {
    using _outer = ThemeCtx.scope("dark");
    assert.strictEqual(ThemeCtx.current, "dark");

    {
      using _inner = ThemeCtx.scope("light");
      assert.strictEqual(ThemeCtx.current, "light");
    }

    assert.strictEqual(ThemeCtx.current, "dark");
  });

  it("multiple contexts are independent", () => {
    using _t = ThemeCtx.scope("dark");
    using _l = LocaleCtx.scope("de");

    assert.strictEqual(ThemeCtx.current, "dark");
    assert.strictEqual(LocaleCtx.current, "de");
  });

  it("components read scoped values during render", () => {
    using _ = ThemeCtx.scope("dark");
    const html = render(ThemedBox());
    assert.strictEqual(html, `<div class="bg-gray-900">content</div>`);
  });

  it("components read default when no scope is active", () => {
    const html = render(ThemedBox());
    assert.strictEqual(html, `<div class="bg-white">content</div>`);
  });

  it("nested scope override affects only the inner subtree", () => {
    function Page() {
      using _ = ThemeCtx.scope("light");
      return Div(
        Nav(ThemedBox()),
        DarkSection(),
        ThemedBox(),  // should be light again
      );
    }

    function DarkSection() {
      using _ = ThemeCtx.scope("dark");
      return Section(ThemedBox());
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
      using _ = ThemeCtx.scope("dark");
      return IfThen(true, () => ThemedBox());
    }

    const html = render(AdminBar());
    assert.strictEqual(html, `<div class="bg-gray-900">content</div>`);
  });

  it("scope is safe across sequential renders", () => {
    {
      using _ = ThemeCtx.scope("dark");
      render(ThemedBox());
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
      using _ = LocaleCtx.scope("de");
      return Div(Greeting());
    }

    const html = render(Page());
    assert.strictEqual(html, `<div><span>Hallo</span></div>`);
  });
});

// ----------------------------------------
// Context — createRequiredContext
// ----------------------------------------

describe("Context — createRequiredContext", () => {
  const AuthCtx = createRequiredContext<{ name: string }>("AuthCtx");

  it("throws when accessed outside scope", () => {
    assert.throws(
      () => AuthCtx.current,
      { message: 'Context "AuthCtx" accessed outside of a scope. Wrap the call in AuthCtx.scope(value).' }
    );
  });

  it("returns value inside scope", () => {
    using _ = AuthCtx.scope({ name: "Alice" });
    assert.deepStrictEqual(AuthCtx.current, { name: "Alice" });
  });

  it("reverts to throwing after scope exits", () => {
    {
      using _ = AuthCtx.scope({ name: "Bob" });
      assert.strictEqual(AuthCtx.current.name, "Bob");
    }
    assert.throws(() => AuthCtx.current, /AuthCtx/);
  });

  it("nested scopes work correctly", () => {
    using _outer = AuthCtx.scope({ name: "Outer" });
    assert.strictEqual(AuthCtx.current.name, "Outer");

    {
      using _inner = AuthCtx.scope({ name: "Inner" });
      assert.strictEqual(AuthCtx.current.name, "Inner");
    }

    assert.strictEqual(AuthCtx.current.name, "Outer");
  });

  it("works during render", () => {
    function UserBadge() {
      return Span(AuthCtx.current.name);
    }

    using _ = AuthCtx.scope({ name: "Alice" });
    const html = render(UserBadge());
    assert.strictEqual(html, `<span>Alice</span>`);
  });
});
