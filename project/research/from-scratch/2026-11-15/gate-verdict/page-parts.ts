// Parity hatch probe, Page Parts: the mistake as a plain string, without local().
import { Button, hx } from "../mistakes/arms/page-parts/app.ts";
export const hx7 = () => Button({ wire: hx({ get: "/projects/rowz", target: "#projects-rows" }) }, "Load");
