// TW-4 cbc: A class built from data at run time.
import { cls, div, render, tone } from "../../arms/cbc/app.ts";
export default () => render(div(cls(`bg-${tone}/20`), "x")); // ✗
