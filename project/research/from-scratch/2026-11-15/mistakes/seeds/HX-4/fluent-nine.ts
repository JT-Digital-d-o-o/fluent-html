// HX-4 fluent-nine: The status region polls in every state, the finished one included.
import { Div, JobBadge, fragment, ids, projectRoutes, type Job } from "../../arms/fluent-nine/app.ts";
const Status = ({ id, job }: { id: number; job: Job }) =>
  Div(JobBadge({ job })).setId(ids.projectStatus).poll(projectRoutes.status({ id }), "2s"); // ✗
export default () => fragment(projectRoutes.status, () => Status({ id: 7, job: "done" }));
