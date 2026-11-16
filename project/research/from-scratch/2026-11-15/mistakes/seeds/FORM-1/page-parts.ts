// FORM-1 page-parts: A form field is named nmae, which the schema does not have.
import { Page, Type, page, redirect, serve } from "../../arms/page-parts/app.ts";
export const seed = page("/seed");
const create = seed.form("create", { schema: Type.Object({ name: Type.String() }), submit: () => redirect(seed) });
create.view((f) => [f.field("nmae", "Name"), f.submit("Create")]); // ✗
seed.view(() => Page({ title: "Seed" }, create.show()));
export default () => serve({ seed }, "/seed");
