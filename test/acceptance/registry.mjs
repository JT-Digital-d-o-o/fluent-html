// Shared between the acceptance app and the specs: registers the framework-pack
// extension verb (jt:listboxNav — acceptance rows 8/25) and re-exports the
// registry enumeration that feeds matrix().
import { registerBehavior, allBehaviors } from "../../dist/src/behaviors/index.js";
import { createId } from "../../dist/src/ids.js";

export const listboxId = createId("fx-listbox");

export function registerAcceptanceExtensions() {
  registerBehavior("jt:listboxNav", {
    options: { list: "id", itemSelector: "string" },
    events: ["keydown"],
    fixtures: [{ list: listboxId, itemSelector: "[role=option]" }],
  });
}

export { allBehaviors };
