// HX-7 lean-tags: An htmx request is given a hand-written URL string, with a mistyped path.
import { button, render, wire } from "../../arms/lean-tags/app.ts";
export default () => render(button(wire({ get: "/projects/rowz" }), "Load")); // ✗
