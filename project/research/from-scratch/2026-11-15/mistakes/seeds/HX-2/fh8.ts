// HX-2 fh8: The status fragment route answers with the list region.
import { ProjectList, fragment, projectRoutes } from "../../arms/fh8/app.ts";
export default () => fragment(projectRoutes.status, () => ProjectList(["Apollo"])); // ✗
