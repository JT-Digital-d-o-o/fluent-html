// HX-4 cbc: The status region polls in every state, the finished one included.
import { projects, render, span, type Project } from "../../arms/cbc/app.ts";
const Badge = ({ id, job }: Pick<Project, "id" | "job">) => span(projects.status({ id }).poll("2s"), job); // ✗
export default () => render(Badge({ id: 1, job: "done" }));
