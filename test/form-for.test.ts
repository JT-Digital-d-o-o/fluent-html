import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { render, Form, Button } from "../src/index.js";

type CreateUserReq = { email: string; name: string; bio: string; role: "admin" | "viewer" };

describe("Form<T> binding", () => {
  it("typed input with name (no state)", () => {
    assert.strictEqual(
      render(Form<CreateUserReq>((f) => f.input("email", "email"))),
      `<form><input type="email" name="email"></form>`,
    );
  });

  it("input without an explicit type", () => {
    assert.strictEqual(
      render(Form<CreateUserReq>((f) => f.input("name"))),
      `<form><input name="name"></form>`,
    );
  });

  it("auto-wires values from state", () => {
    const html = render(Form<CreateUserReq>({ values: { email: "a@b.com" } }, (f) => f.input("email", "email")));
    assert.strictEqual(html, `<form><input type="email" name="email" value="a@b.com"></form>`);
  });

  it("textarea value is wired as text content", () => {
    const html = render(Form<CreateUserReq>({ values: { bio: "hi" } }, (f) => f.textarea("bio")));
    assert.strictEqual(html, `<form><textarea name="bio">hi</textarea></form>`);
  });

  it("select builds options and marks the wired value selected", () => {
    const html = render(Form<CreateUserReq>({ values: { role: "viewer" } }, (f) =>
      f.select("role", [
        { value: "admin", label: "Admin" },
        { value: "viewer", label: "Viewer" },
      ]),
    ));
    assert.strictEqual(
      html,
      `<form><select name="role"><option value="admin">Admin</option>\n<option value="viewer" selected>Viewer</option></select></form>`,
    );
  });

  it("error() renders the field's message, or nothing", () => {
    assert.strictEqual(
      render(Form<CreateUserReq>({ errors: { email: "Required" } }, (f) => f.error("email"))),
      `<form><span>Required</span></form>`,
    );
    assert.strictEqual(
      render(Form<CreateUserReq>({ errors: {} }, (f) => f.error("email"))),
      `<form></form>`,
    );
  });

  it("escapes wired values and error text", () => {
    const html = render(Form<CreateUserReq>(
      { values: { name: `"><script>` }, errors: { name: `<b>x</b>` } },
      (f) => [f.input("name"), f.error("name")],
    ));
    assert.ok(html.includes(`value="&quot;&gt;&lt;script&gt;"`));
    assert.ok(html.includes(`<span>&lt;b&gt;x&lt;/b&gt;</span>`));
  });

  it("hidden input with name and value", () => {
    assert.strictEqual(
      render(Form<CreateUserReq>((f) => f.hidden("role", "admin"))),
      `<form><input type="hidden" name="role" value="admin"></form>`,
    );
  });

  it("builder returns an array of controls", () => {
    const html = render(Form<CreateUserReq>((f) => [f.input("email", "email"), Button("Save").setType("submit")]));
    assert.strictEqual(html, `<form><input type="email" name="email">\n<button type="submit">Save</button></form>`);
  });

  it(".multipart() sets the enctype", () => {
    assert.strictEqual(
      render(Form<CreateUserReq>((f) => f.input("name")).multipart().setAction("/u")),
      `<form action="/u" enctype="multipart/form-data"><input name="name"></form>`,
    );
  });

  it("plain element-factory form still works", () => {
    assert.strictEqual(render(Form(Button("Go").setType("submit"))), `<form><button type="submit">Go</button></form>`);
  });

  it("setCapture renders the capture attribute", () => {
    assert.strictEqual(render(Form<CreateUserReq>((f) => f.input("name", "file").setCapture("user"))), `<form><input type="file" name="name" capture="user"></form>`);
  });

  it("rejects a typo'd field name (keyof T)", () => {
    render(Form<CreateUserReq>((f) =>
      // @ts-expect-error — "emial" is not a key of CreateUserReq
      f.input("emial", "email"),
    ));
  });
});
