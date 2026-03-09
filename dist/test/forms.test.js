import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { render, Form, Input, Textarea, Button, Label, Select, Option, Optgroup, Datalist, Fieldset, Legend, Output, } from "../src/index.js";
// ------------------------------------
// Forms - Input
// ------------------------------------
describe("Forms - Input", () => {
    it("Text input", () => { assert.strictEqual(render(Input().setType("text").setName("username").setPlaceholder("Enter username")), `<input type="text" name="username" placeholder="Enter username">`); });
    it("Email input with validation", () => {
        assert.strictEqual(render(Input()
            .setAutocomplete("email")
            .setType("email")
            .setName("email")
            .toggle("required")), `<input type="email" name="email" autocomplete="email" required>`);
    });
    it("Number input with min/max/step", () => {
        assert.strictEqual(render(Input()
            .setType("number")
            .setName("quantity")
            .setMin(1)
            .setMax(100)
            .setStep(5)), `<input type="number" name="quantity" min="1" max="100" step="5">`);
    });
    it("Password input", () => {
        assert.strictEqual(render(Input()
            .setType("password")
            .setName("password")
            .setMinlength(8)
            .setMaxlength(64)), `<input type="password" name="password" minlength="8" maxlength="64">`);
    });
    it("Input with pattern", () => {
        assert.strictEqual(render(Input()
            .setType("text")
            .setName("zipcode")
            .setPattern("[0-9]{5}")), `<input type="text" name="zipcode" pattern="[0-9]{5}">`);
    });
    it("Checkbox input", () => {
        assert.strictEqual(render(Input()
            .setType("checkbox")
            .setName("agree")
            .setValue("yes")
            .setChecked()), `<input type="checkbox" name="agree" value="yes" checked="true">`);
    });
    it("Radio input", () => {
        assert.strictEqual(render(Input()
            .setType("radio")
            .setName("color")
            .setValue("red")), `<input type="radio" name="color" value="red">`);
    });
    it("File input", () => {
        assert.strictEqual(render(Input()
            .setType("file")
            .setName("document")
            .setAccept(".pdf,.doc")
            .setMultiple()), `<input type="file" name="document" accept=".pdf,.doc" multiple="true">`);
    });
    it("Disabled input", () => {
        assert.strictEqual(render(Input()
            .setType("text")
            .setName("locked")
            .setValue("Cannot edit")
            .setDisabled()), `<input type="text" name="locked" value="Cannot edit" disabled="true">`);
    });
    it("Readonly input", () => {
        assert.strictEqual(render(Input()
            .setType("text")
            .setName("readonly")
            .setValue("Read only")
            .setReadonly()), `<input type="text" name="readonly" value="Read only" readonly="true">`);
    });
    it("Input with datalist", () => {
        assert.strictEqual(render([
            Input().setType("text").setName("browser").setList("browsers"),
            Datalist([
                Option("Chrome").setValue("chrome"),
                Option("Firefox").setValue("firefox"),
            ]).setId("browsers"),
        ]), `<input type="text" name="browser" list="browsers">\n<datalist id="browsers"><option value="chrome">Chrome</option>\n<option value="firefox">Firefox</option></datalist>`);
    });
});
// ------------------------------------
// Forms - Textarea
// ------------------------------------
describe("Forms - Textarea", () => {
    it("Basic textarea", () => { assert.strictEqual(render(Textarea().setName("message").setPlaceholder("Enter message")), `<textarea name="message" placeholder="Enter message"></textarea>`); });
    it("Textarea with rows/cols", () => {
        assert.strictEqual(render(Textarea()
            .setName("bio")
            .setRows(5)
            .setCols(40)), `<textarea name="bio" rows="5" cols="40"></textarea>`);
    });
    it("Textarea with content", () => { assert.strictEqual(render(Textarea("Default text").setName("notes")), `<textarea name="notes">Default text</textarea>`); });
    it("Textarea with validation", () => {
        assert.strictEqual(render(Textarea()
            .setName("essay")
            .setMinlength(100)
            .setMaxlength(5000)
            .setWrap("soft")), `<textarea name="essay" minlength="100" maxlength="5000" wrap="soft"></textarea>`);
    });
});
// ------------------------------------
// Forms - Button
// ------------------------------------
describe("Forms - Button", () => {
    it("Submit button", () => { assert.strictEqual(render(Button("Submit").setType("submit")), `<button type="submit">Submit</button>`); });
    it("Reset button", () => { assert.strictEqual(render(Button("Reset").setType("reset")), `<button type="reset">Reset</button>`); });
    it("Button with name/value", () => {
        assert.strictEqual(render(Button("Save")
            .setType("submit")
            .setName("action")
            .setValue("save")), `<button type="submit" name="action" value="save">Save</button>`);
    });
    it("Disabled button", () => { assert.strictEqual(render(Button("Disabled").setDisabled()), `<button disabled="true">Disabled</button>`); });
    it("Button with formaction", () => {
        assert.strictEqual(render(Button("Delete")
            .setType("submit")
            .setFormaction("/delete")
            .setFormmethod("post")), `<button type="submit" formaction="/delete" formmethod="post">Delete</button>`);
    });
});
// ------------------------------------
// Forms - Select
// ------------------------------------
describe("Forms - Select", () => {
    it("Basic select", () => {
        assert.strictEqual(render(Select([
            Option("Choose...").setValue(""),
            Option("Option 1").setValue("1"),
            Option("Option 2").setValue("2"),
        ]).setName("choice")), `<select name="choice"><option value="">Choose...</option>\n<option value="1">Option 1</option>\n<option value="2">Option 2</option></select>`);
    });
    it("Select with selected option", () => {
        assert.strictEqual(render(Select([
            Option("A").setValue("a"),
            Option("B").setValue("b").setSelected(),
            Option("C").setValue("c"),
        ]).setName("letter")), `<select name="letter"><option value="a">A</option>\n<option value="b" selected="true">B</option>\n<option value="c">C</option></select>`);
    });
    it("Select with optgroup", () => {
        assert.strictEqual(render(Select([
            Optgroup([
                Option("Volvo").setValue("volvo"),
                Option("Saab").setValue("saab"),
            ]).setLabel("Swedish Cars"),
            Optgroup([
                Option("Mercedes").setValue("mercedes"),
                Option("Audi").setValue("audi"),
            ]).setLabel("German Cars"),
        ]).setName("car")), `<select name="car"><optgroup label="Swedish Cars"><option value="volvo">Volvo</option>\n<option value="saab">Saab</option></optgroup>\n<optgroup label="German Cars"><option value="mercedes">Mercedes</option>\n<option value="audi">Audi</option></optgroup></select>`);
    });
    it("Multiple select", () => {
        assert.strictEqual(render(Select([
            Option("Red").setValue("red"),
            Option("Green").setValue("green"),
            Option("Blue").setValue("blue"),
        ]).setName("colors").setMultiple().setSize(3)), `<select name="colors" multiple="true" size="3"><option value="red">Red</option>\n<option value="green">Green</option>\n<option value="blue">Blue</option></select>`);
    });
});
// ------------------------------------
// Forms - Label, Fieldset, Form
// ------------------------------------
describe("Forms - Label, Fieldset, Form", () => {
    it("Label with for", () => { assert.strictEqual(render(Label("Username").setFor("username")), `<label for="username">Username</label>`); });
    it("Fieldset with Legend", () => {
        assert.strictEqual(render(Fieldset([
            Legend("Personal Info"),
            Label("Name").setFor("name"),
            Input().setType("text").setName("name").setId("name"),
        ]).setName("personal")), `<fieldset name="personal"><legend>Personal Info</legend>\n<label for="name">Name</label>\n<input id="name" type="text" name="name"></fieldset>`);
    });
    it("Disabled fieldset", () => {
        assert.strictEqual(render(Fieldset([
            Legend("Disabled Section"),
            Input().setType("text"),
        ]).setDisabled()), `<fieldset disabled="true"><legend>Disabled Section</legend>\n<input type="text"></fieldset>`);
    });
    it("Form with method and action", () => {
        assert.strictEqual(render(Form([
            Input().setType("text").setName("q"),
            Button("Search").setType("submit"),
        ]).setAction("/search").setMethod("get")), `<form action="/search" method="get"><input type="text" name="q">\n<button type="submit">Search</button></form>`);
    });
    it("Form with enctype", () => {
        assert.strictEqual(render(Form([
            Input().setType("file").setName("upload"),
        ]).setAction("/upload").setMethod("post").setEnctype("multipart/form-data")), `<form action="/upload" method="post" enctype="multipart/form-data"><input type="file" name="upload"></form>`);
    });
    it("Form with novalidate", () => {
        assert.strictEqual(render(Form([
            Input().setType("email").setName("email"),
        ]).setNovalidate()), `<form novalidate="true"><input type="email" name="email"></form>`);
    });
    it("Output element", () => { assert.strictEqual(render(Output("100").setFor("a b").setName("result")), `<output for="a b" name="result">100</output>`); });
});
//# sourceMappingURL=forms.test.js.map