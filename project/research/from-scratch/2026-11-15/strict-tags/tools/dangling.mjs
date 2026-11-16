// Development-time audit of a whole document: a wire whose part is not on the page, and a dialog
// whose title was never placed, both stop the render with the fix.
//   node tools/dangling.mjs
import { dialog, doc, h2, input, modal, p } from "../lib/index.ts";
import { projects } from "../screens/projects.routes.ts";
const attempt = (name, fn) => { try { fn(); console.log(`${name}: rendered (unexpected)`); } catch (e) { console.log(`${name}: ${e.message}`); } };
attempt("search box without its list", () => doc({ title: "x" }, input({ type: "search", "aria-label": "Search" }, projects.rows().search("q"))));
attempt("dialog without its title", () => doc({ title: "x" }, dialog(modal("confirm").root, p("Sure?"))));
attempt("dialog with its title", () => { doc({ title: "x" }, dialog(modal("confirm").root, h2(modal("confirm").title, "Sure?"))); throw new Error("rendered, as it should"); });
