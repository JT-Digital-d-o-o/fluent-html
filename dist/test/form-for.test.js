import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { render, Form, Button } from "../src/index.js";
describe("Form<T> binding", () => {
    it("typed input with name (no state)", () => {
        assert.strictEqual(render(Form((f) => f.input("email", "email"))), `<form><input id="email" type="email" name="email"></form>`);
    });
    it("input without an explicit type", () => {
        assert.strictEqual(render(Form((f) => f.input("name"))), `<form><input id="name" name="name"></form>`);
    });
    it("auto-wires values from state", () => {
        const html = render(Form({ values: { email: "a@b.com" } }, (f) => f.input("email", "email")));
        assert.strictEqual(html, `<form><input id="email" type="email" name="email" value="a@b.com"></form>`);
    });
    it("textarea value is wired as text content", () => {
        const html = render(Form({ values: { bio: "hi" } }, (f) => f.textarea("bio")));
        assert.strictEqual(html, `<form><textarea id="bio" name="bio">hi</textarea></form>`);
    });
    it("select builds options and marks the wired value selected", () => {
        const html = render(Form({ values: { role: "viewer" } }, (f) => f.select("role", [
            { value: "admin", label: "Admin" },
            { value: "viewer", label: "Viewer" },
        ])));
        assert.strictEqual(html, `<form><select id="role" name="role"><option value="admin">Admin</option>\n<option value="viewer" selected>Viewer</option></select></form>`);
    });
    it("error() renders the field's message, or nothing", () => {
        assert.strictEqual(render(Form({ errors: { email: "Required" } }, (f) => f.error("email"))), `<form><span id="email-error">Required</span></form>`);
        assert.strictEqual(render(Form({ errors: {} }, (f) => f.error("email"))), `<form></form>`);
    });
    it("label() binds `for` to the control's default id — no id/name/for repetition", () => {
        const html = render(Form((f) => [f.label("email", "Email"), f.input("email", "email")]));
        assert.strictEqual(html, `<form><label for="email">Email</label>\n<input id="email" type="email" name="email"></form>`);
    });
    it("idPrefix namespaces control id, label for, and error aria-describedby", () => {
        const html = render(Form({ idPrefix: "signup", errors: { email: "Required" } }, (f) => [
            f.label("email", "Email"),
            f.input("email", "email"),
            f.error("email"),
        ]));
        assert.strictEqual(html, `<form><label for="signup-email">Email</label>\n<input id="signup-email" type="email" name="email" aria-invalid="true" aria-describedby="signup-email-error">\n<span id="signup-email-error">Required</span></form>`);
    });
    it("escapes wired values and error text", () => {
        const html = render(Form({ values: { name: `"><script>` }, errors: { name: `<b>x</b>` } }, (f) => [f.input("name"), f.error("name")]));
        assert.ok(html.includes(`value="&quot;&gt;&lt;script&gt;"`));
        assert.ok(html.includes(`<span id="name-error">&lt;b&gt;x&lt;/b&gt;</span>`));
    });
    it("hidden input with name and value (no id — takes no label)", () => {
        assert.strictEqual(render(Form((f) => f.hidden("role", "admin"))), `<form><input type="hidden" name="role" value="admin"></form>`);
    });
    it("builder returns an array of controls", () => {
        const html = render(Form((f) => [f.input("email", "email"), Button("Save").setType("submit")]));
        assert.strictEqual(html, `<form><input id="email" type="email" name="email">\n<button type="submit">Save</button></form>`);
    });
    it(".multipart() sets the enctype", () => {
        assert.strictEqual(render(Form((f) => f.input("name")).multipart().setAction("/u")), `<form action="/u" enctype="multipart/form-data"><input id="name" name="name"></form>`);
    });
    it("plain element-factory form still works", () => {
        assert.strictEqual(render(Form(Button("Go").setType("submit"))), `<form><button type="submit">Go</button></form>`);
    });
    it("setCapture renders the capture attribute", () => {
        assert.strictEqual(render(Form((f) => f.input("name", "file").setCapture("user"))), `<form><input id="name" type="file" name="name" capture="user"></form>`);
    });
    it("rejects a typo'd field name (keyof T)", () => {
        render(Form((f) => 
        // @ts-expect-error — "emial" is not a key of CreateUserReq
        f.input("emial", "email")));
    });
});
describe("Form<T> checkbox / radio binding (F-C-140)", () => {
    it("checkbox reflects a true boolean field as `checked` (not value=\"true\")", () => {
        const html = render(Form({ values: { terms: true } }, (f) => f.checkbox("terms")));
        assert.strictEqual(html, `<form><input id="terms" type="checkbox" name="terms" checked></form>`);
    });
    it("checkbox with a false field is unchecked", () => {
        const html = render(Form({ values: { terms: false } }, (f) => f.checkbox("terms")));
        assert.strictEqual(html, `<form><input id="terms" type="checkbox" name="terms"></form>`);
    });
    it("checkbox without state is unchecked", () => {
        assert.strictEqual(render(Form((f) => f.checkbox("notify"))), `<form><input id="notify" type="checkbox" name="notify"></form>`);
    });
    it("checkbox accepts an explicit submitted value", () => {
        const html = render(Form({ values: { terms: true } }, (f) => f.checkbox("terms", "yes")));
        assert.strictEqual(html, `<form><input id="terms" type="checkbox" name="terms" value="yes" checked></form>`);
    });
    it("radio is checked when the field matches its value; each option gets a unique id", () => {
        const html = render(Form({ values: { role: "admin" } }, (f) => [
            f.radio("role", "admin"),
            f.radio("role", "viewer"),
        ]));
        assert.strictEqual(html, `<form><input id="role-admin" type="radio" name="role" value="admin" checked>\n<input id="role-viewer" type="radio" name="role" value="viewer"></form>`);
    });
    it("rejects a typo'd checkbox field name (keyof T)", () => {
        render(Form((f) => 
        // @ts-expect-error — "term" is not a key of SettingsReq
        f.checkbox("term")));
    });
});
describe("Form<T> aria-invalid wiring (F-C-143)", () => {
    it("an errored input gets aria-invalid + aria-describedby, and error() id-links it", () => {
        const html = render(Form({ errors: { email: "Required" } }, (f) => [
            f.input("email", "email"),
            f.error("email"),
        ]));
        assert.strictEqual(html, `<form><input id="email" type="email" name="email" aria-invalid="true" aria-describedby="email-error">\n<span id="email-error">Required</span></form>`);
    });
    it("a field without a bound error gets no aria-invalid", () => {
        const html = render(Form({ errors: { email: "Required" } }, (f) => f.input("name")));
        assert.strictEqual(html, `<form><input id="name" name="name"></form>`);
    });
    it("errored select/textarea/checkbox also mark invalid", () => {
        const html = render(Form({ errors: { terms: "Must accept" } }, (f) => f.checkbox("terms")));
        assert.strictEqual(html, `<form><input id="terms" type="checkbox" name="terms" aria-invalid="true" aria-describedby="terms-error"></form>`);
    });
});
//# sourceMappingURL=form-for.test.js.map