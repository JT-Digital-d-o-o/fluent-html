/**
 * Probe suite for the storage-field privatization: the most common blind
 * guess — an unprefixed setter (`.src()`, `.value()`, `.id()`) — must fail as
 * a MISSING property (TS2339, or TS2551 with the `set*` suggestion where the
 * checker's spelling-distance window allows one), never as the
 * "Type 'String' has no call signatures" cascade (TS2349) that a public
 * storage field beside the setter used to produce. Runs the real checker over
 * `test/types/setter-probe/probe.ts` (excluded from the build tsconfig) and
 * pins codes + message text per line.
 */
import { describe, it, before } from "node:test";
import assert from "node:assert/strict";
import { resolve } from "node:path";
import ts from "typescript";
const NO_CALL_SIGNATURES = 2349;
const PROPERTY_DOES_NOT_EXIST = 2339;
const PROPERTY_DOES_NOT_EXIST_DID_YOU_MEAN = 2551;
const PRIVATE_OR_PROTECTED = new Set([2341, 2445]);
let probes = [];
before(() => {
    const fixture = resolve(process.cwd(), "test/types/setter-probe/probe.ts");
    const program = ts.createProgram([fixture], {
        target: ts.ScriptTarget.ES2020,
        module: ts.ModuleKind.ES2020,
        moduleResolution: ts.ModuleResolutionKind.Bundler,
        strict: true,
        noEmit: true,
        skipLibCheck: true,
    });
    const source = program.getSourceFile(fixture);
    assert.ok(source, "probe fixture must be part of the program");
    probes = ts.getPreEmitDiagnostics(program, source).map((d) => ({
        code: d.code,
        message: ts.flattenDiagnosticMessageText(d.messageText, " "),
        line: d.file && d.start !== undefined ? d.file.getLineAndCharacterOfPosition(d.start).line + 1 : -1,
    }));
});
function probeFor(fragment) {
    const hit = probes.find((p) => p.message.includes(fragment));
    assert.ok(hit, `expected a diagnostic mentioning ${JSON.stringify(fragment)}; got:\n${probes.map((p) => `TS${p.code}: ${p.message}`).join("\n")}`);
    return hit;
}
describe("privatized storage fields — blind setter guesses fail as missing properties", () => {
    it("every probe line produces exactly one diagnostic", () => {
        assert.equal(probes.length, 12, probes.map((p) => `TS${p.code}: ${p.message}`).join("\n"));
    });
    it("no probe produces the call-signature cascade or a private-access error", () => {
        for (const p of probes) {
            assert.notEqual(p.code, NO_CALL_SIGNATURES, `TS2349 cascade resurfaced: ${p.message}`);
            assert.ok(!PRIVATE_OR_PROTECTED.has(p.code), `storage leaked into the error: TS${p.code}: ${p.message}`);
            assert.ok([PROPERTY_DOES_NOT_EXIST, PROPERTY_DOES_NOT_EXIST_DID_YOU_MEAN].includes(p.code), `unexpected TS${p.code}: ${p.message}`);
            assert.ok(!p.message.includes("'_"), `a _-prefixed storage name must never be suggested: ${p.message}`);
        }
    });
    it(".src() on Img — property does not exist on ImgTag", () => {
        const p = probeFor("'src' does not exist on type 'ImgTag'");
        assert.equal(p.code, PROPERTY_DOES_NOT_EXIST);
    });
    it(".value() on Input — property does not exist on InputTag", () => {
        probeFor("'value' does not exist on type 'InputTag'");
    });
    it(".id() on Div — property does not exist on Tag", () => {
        probeFor("'id' does not exist on type 'Tag'");
    });
    // The checker's spelling-suggestion window (`getSpellingSuggestion`) only
    // admits a candidate whose length differs by ≤ max(2, ⌊len·0.34⌋), so the
    // `set` prefix puts `setSrc`/`setValue` out of range for short names — those
    // land as plain TS2339. Names ≥ ~9 chars get the full TS2551 self-heal.
    it(".placeholder() on Input — TS2551 with the setPlaceholder suggestion", () => {
        const p = probeFor("'placeholder' does not exist on type 'InputTag'");
        assert.equal(p.code, PROPERTY_DOES_NOT_EXIST_DID_YOU_MEAN);
        assert.ok(p.message.includes("Did you mean 'setPlaceholder'?"), p.message);
    });
    it(".autocomplete() on Input — TS2551 with the setAutocomplete suggestion", () => {
        const p = probeFor("'autocomplete' does not exist on type 'InputTag'");
        assert.equal(p.code, PROPERTY_DOES_NOT_EXIST_DID_YOU_MEAN);
        assert.ok(p.message.includes("Did you mean 'setAutocomplete'?"), p.message);
    });
    it(".viewBox() on Svg — plain TS2339 (setViewBox is outside the suggestion window)", () => {
        const p = probeFor("'viewBox' does not exist on type 'SvgTag'");
        assert.equal(p.code, PROPERTY_DOES_NOT_EXIST);
    });
    it("field reads (.enctype, .action) are gone from the public surface", () => {
        probeFor("'enctype' does not exist on type 'FormTag'");
        probeFor("'action' does not exist on type 'FormTag'");
    });
});
//# sourceMappingURL=setter-errors.test.js.map