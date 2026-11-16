// NEST-4 page-parts: A link is placed inside a button.
import { Page, page, serve, Button, Link, feature } from "../../arms/page-parts/app.ts";
export const seed = page("/seed");
seed.view(() => Page({ title: "Seed" }, Button(Link({ to: feature.projectList }, "Open")))); // ✗
export default () => serve({ seed }, "/seed");
