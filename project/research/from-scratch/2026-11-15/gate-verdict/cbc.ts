// Parity hatch probe, Correct by construction: the two mistakes as plain strings, without local().
import { button, render, wire } from "../mistakes/arms/cbc/app.ts";
export const hx7 = () => render(button(wire({ get: "/projects/rowz" }), "Load"));
export const hx1 = () => render(button(wire({ get: "/projects/1/status", target: "#project-rows" }), "Refresh"));
