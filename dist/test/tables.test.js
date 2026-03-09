import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { render, Table, Thead, Tbody, Tfoot, Tr, Th, Td, Caption, Colgroup, Col, } from "../src/index.js";
// ------------------------------------
// Tables
// ------------------------------------
describe("Tables", () => {
    it("Simple table", () => {
        assert.strictEqual(render(Table([
            Thead(Tr([Th("Name"), Th("Age")])),
            Tbody([
                Tr([Td("Alice"), Td("30")]),
                Tr([Td("Bob"), Td("25")]),
            ])
        ])), `<table><thead><tr><th>Name</th>\n<th>Age</th></tr></thead>\n<tbody><tr><td>Alice</td>\n<td>30</td></tr>\n<tr><td>Bob</td>\n<td>25</td></tr></tbody></table>`);
    });
    it("Table with Tfoot", () => {
        assert.strictEqual(render(Table([
            Thead(Tr([Th("Item"), Th("Price")])),
            Tbody(Tr([Td("Widget"), Td("$10")])),
            Tfoot(Tr([Td("Total"), Td("$10")])),
        ])), `<table><thead><tr><th>Item</th>\n<th>Price</th></tr></thead>\n<tbody><tr><td>Widget</td>\n<td>$10</td></tr></tbody>\n<tfoot><tr><td>Total</td>\n<td>$10</td></tr></tfoot></table>`);
    });
    it("Table with Caption", () => {
        assert.strictEqual(render(Table([
            Caption("Sales Data"),
            Tr([Th("Q1"), Th("Q2")]),
        ])), `<table><caption>Sales Data</caption>\n<tr><th>Q1</th>\n<th>Q2</th></tr></table>`);
    });
    it("Th with colspan", () => { assert.strictEqual(render(Th("Header").setColspan(2)), `<th colspan="2">Header</th>`); });
    it("Td with rowspan", () => { assert.strictEqual(render(Td("Cell").setRowspan(3)), `<td rowspan="3">Cell</td>`); });
    it("Th with scope", () => { assert.strictEqual(render(Th("Column").setScope("col")), `<th scope="col">Column</th>`); });
    it("Colgroup and Col", () => {
        assert.strictEqual(render(Table([
            Colgroup([
                Col().setSpan(2).setClass("highlight"),
                Col(),
            ]),
            Tr([Td("A"), Td("B"), Td("C")]),
        ])), `<table><colgroup><col class="highlight" span="2">\n<col></colgroup>\n<tr><td>A</td>\n<td>B</td>\n<td>C</td></tr></table>`);
    });
});
//# sourceMappingURL=tables.test.js.map