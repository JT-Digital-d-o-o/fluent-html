// Writes the bench page of this prototype and of fluent-html 8 to out/ (fragment, and the same
// document wrapper round 1 used) and compares the two. Run: node bench/write-output.ts
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { build, render } from "./arm.ts";

const fh8: { build(): unknown; render(v: unknown): string } = await import(new URL("../../fixtures/bench/arms/fluent-html-8.mjs", import.meta.url).href);
const out = render(build());
const expected = readFileSync(new URL("../../fixtures/bench/expected.fh8.html", import.meta.url), "utf8");
const fh8Out = fh8.render(fh8.build());
const squash = (s: string) => s.replace(/>\s+</g, "><").trim();
const norm = (s: string) => squash(s).replaceAll(' type="button"', "");
console.log("bytes", Buffer.byteLength(out), "fluent-html 8", Buffer.byteLength(fh8Out), "fluent-html 8 equals expected.fh8.html:", fh8Out === expected);
console.log('same as fluent-html 8 ignoring whitespace and the default type="button":', norm(out) === norm(expected));
const wrap = (body: string) => '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>Bench</title></head><body>' + body + "</body></html>";
mkdirSync(new URL("../out/bench/", import.meta.url), { recursive: true });
writeFileSync(new URL("../out/bench/fh9.fragment.html", import.meta.url), out);
writeFileSync(new URL("../out/bench/fh9.document.html", import.meta.url), wrap(out));
writeFileSync(new URL("../out/bench/fh8.fragment.html", import.meta.url), fh8Out);
writeFileSync(new URL("../out/bench/fh8.document.html", import.meta.url), wrap(fh8Out));
