import { Span, type TailwindColor } from "fluent-html";
type Status = "active" | "invited";
const BG: Record<Status, TailwindColor> = { active: "success", invited: "warning" };
export const v = (status: Status) => Span(status).bg(BG[status]);
