// HX-2 fluent-nine: The status fragment route answers with the list region.
import { ProjectList, fragment, projectRoutes } from "../../arms/fluent-nine/app.ts";
export default () => fragment(projectRoutes.status, () => ProjectList(["Apollo"])); // ✗
