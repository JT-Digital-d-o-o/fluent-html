// Framework-pack client entry (acceptance rows 8/25): a REAL module compiled by
// buildBehaviorRuntime — never fn.toString(). Conditional consumption: acts (and
// consumes) only while the list is open. Active-descendant-style highlighting —
// focus stays in the input (the carrier), so every keydown keeps dispatching
// through it.
import { defineBehavior } from "../../../dist/src/behaviors/client/define.js";

defineBehavior("jt:listboxNav", (el, o, fx) => {
  const e = fx.event;
  const list = fx.resolve(o.list, el)[0];
  if (!list || list.classList.contains("hidden")) return false;
  if (e.key === "Escape") {
    list.classList.add("hidden");
    return true;
  }
  if (e.key === "ArrowDown" || e.key === "ArrowUp") {
    const items = [...list.querySelectorAll(o.itemSelector)];
    if (items.length === 0) return true;
    const current = items.findIndex((item) => item.classList.contains("active"));
    const next =
      current === -1
        ? e.key === "ArrowDown"
          ? 0
          : items.length - 1
        : (current + (e.key === "ArrowDown" ? 1 : items.length - 1)) % items.length;
    items[current]?.classList.remove("active");
    items[next].classList.add("active");
    return true;
  }
  return false;
});
