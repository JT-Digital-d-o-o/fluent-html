// HX-8 fh8 under the house rule, flash: the delete answers the page, with the flash it sets.
import { Button, Layout, P, ProjectList, defineIds, defineRoutes, html, page } from "../../../arms/fh8/app.ts";
const local = defineIds(["flash"] as const);
const routes = defineRoutes("/projects", {
  remove: { method: "post", path: "/:id/delete", params: { id: "number" } as const },
} as const);
const Screen = (flash: string, names: string[]) => Layout("Projects", P(flash).setId(local.flash), ProjectList(names),
  Button("Delete Apollo").setType("button").submit(routes.remove({ id: 7 })));
export default () => [html(Screen("Project created.", ["Apollo", "Borealis"])), page(routes.remove, () => Screen("Apollo deleted.", ["Borealis"]))];
