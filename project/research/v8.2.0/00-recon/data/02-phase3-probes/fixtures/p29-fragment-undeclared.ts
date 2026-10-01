import { Input } from "fluent-html";
import "../../core/layout/layout.view.js";
import { probeIds, teamRoutes } from "./probe.routes.js";
export const v = () => Input().fragment(probeIds.teamList, teamRoutes.index());
