// HX-4 fh8: The status region polls in every state, the finished one included.
import { Div, JobBadge, fragment, ids, projectRoutes, type Job } from "../../arms/fh8/app.ts";
const Status = ({ id, job }: { id: number; job: Job }) =>
  Div(JobBadge({ job })).setId(ids.projectStatus).poll(projectRoutes.status({ id }), "2s"); // ✗
export default () => fragment(projectRoutes.status, () => Status({ id: 7, job: "done" }));
