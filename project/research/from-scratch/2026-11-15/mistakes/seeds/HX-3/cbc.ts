// HX-3 cbc: A form's 422 answer is not the region the form swaps into.
import { NewProjectPage, entries, handlers, projects } from "../../arms/cbc/app.ts";
const app = handlers(projects, { ...entries, create: { form: (s) => NewProjectPage(s), ok: entries.create.ok } }); // ✗
export default async () => [await app("new"), await app("create", { body: { name: "" } })];
