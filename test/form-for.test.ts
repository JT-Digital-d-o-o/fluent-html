import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { render, formFor, Option } from "../src/index.js";

type CreateUserReq = { email: string; name: string; role: "admin" | "viewer" };

describe("formFor", () => {
  const f = formFor<CreateUserReq>();

  it("input — renders typed input with name", () => {
    assert.strictEqual(
      render(f.input("email", "email")),
      `<input type="email" name="email">`,
    );
  });

  it("input — renders without explicit type", () => {
    assert.strictEqual(
      render(f.input("name")),
      `<input name="name">`,
    );
  });

  it("textarea — renders typed textarea with name", () => {
    assert.strictEqual(
      render(f.textarea("name")),
      `<textarea name="name"></textarea>`,
    );
  });

  it("select — renders typed select with name and children", () => {
    assert.strictEqual(
      render(f.select("role",
        Option("Admin").setValue("admin"),
        Option("Viewer").setValue("viewer"),
      )),
      `<select name="role"><option value="admin">Admin</option>\n<option value="viewer">Viewer</option></select>`,
    );
  });

  it("hidden — renders hidden input with name and value", () => {
    assert.strictEqual(
      render(f.hidden("role", "admin")),
      `<input type="hidden" name="role" value="admin">`,
    );
  });

  it("input — supports chaining after setName", () => {
    assert.strictEqual(
      render(f.input("email", "email").setPlaceholder("you@example.com").toggle("required")),
      `<input type="email" name="email" placeholder="you@example.com" required>`,
    );
  });
});
