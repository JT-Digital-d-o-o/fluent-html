// PURE-1 fh8: A view reads a file while it renders.
import { readFileSync } from "node:fs";
import { P, html } from "../../arms/fh8/app.ts";
const Notes = () => P(readFileSync(new URL("../../kinds.mjs", import.meta.url), "utf8").slice(0, 40)); // ✗
export default () => html(Notes());
