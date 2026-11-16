// ID-1 cbc: Two elements on one page are given the same id.
import { Layout, render, span } from "../../arms/cbc/app.ts";
export default () => render(Layout({ title: "Projects" },
  span({ id: "project-count" }, "3 projects"),
  span({ id: "project-count" }, "3 projects"), // ✗
));
