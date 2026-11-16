// ID-1 lean-tags: Two elements on one page are given the same id.
import { Layout, render, span } from "../../arms/lean-tags/app.ts";
export default () => render(Layout({ title: "Projects" },
  span({ id: "project-count" }, "3 projects"),
  span({ id: "project-count" }, "3 projects"), // ✗
));
