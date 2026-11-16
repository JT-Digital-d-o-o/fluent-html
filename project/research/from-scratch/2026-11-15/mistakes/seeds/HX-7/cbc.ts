// HX-7 cbc: An htmx request is given a hand-written URL string, with a mistyped path.
import { button, local, render, wire } from "../../arms/cbc/app.ts";
export default () => render(button(wire({ get: local("/projects/rowz") }), "Load")); // ✗
