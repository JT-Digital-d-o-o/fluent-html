// PURE-1 cbc: A view reads a file while it renders.
import { readFileSync } from "node:fs";
import { p, render } from "../../arms/cbc/app.ts";
const Notes = () => p(readFileSync(new URL("../../kinds.mjs", import.meta.url), "utf8").slice(0, 40)); // ✗
export default () => render(Notes());
