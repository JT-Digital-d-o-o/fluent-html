// Parity hatch probe, Fluent Nine: the same hatches.
import { Button, externalUrl, html, hx, ids, projectRoutes } from "../mistakes/arms/fluent-nine/app.ts";
export const hx7 = () => html(Button("Load").setType("button").setHtmx(hx(externalUrl("/projects/rowz"))));
export const hx1 = () => html(Button("Refresh").setType("button").setHtmx(projectRoutes.status({ id: 7 }, { target: ids.projectList })));
export const hx1b = () => html(Button("Refresh").setType("button").setHtmx(hx(externalUrl("/projects/7/status"), { target: "#project-list" })));
export default () => [hx7(), hx1(), hx1b()];
