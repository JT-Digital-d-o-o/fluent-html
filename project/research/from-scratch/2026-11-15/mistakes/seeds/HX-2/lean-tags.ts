// HX-2 lean-tags: The status fragment route answers with the list region.
import { ProjectRows, entries, handlers, projects } from "../../arms/lean-tags/app.ts";
const app = handlers(projects, { ...entries, status: async () => ProjectRows({ items: [] }) }); // ✗
export default () => app("status", { input: { id: 1 } });
