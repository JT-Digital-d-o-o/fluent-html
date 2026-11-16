// The reference screens served for a browser: node server.ts (PORT, default 3000). CSS: npm run css.
import { app } from "./kit/index.ts";
import { listen } from "./kit/node.ts";
import "./screens/styles.ts";
import * as projects from "./screens/projects.ts";

listen(app(projects), { port: Number(process.env.PORT ?? 3000), publicDir: "out" });
