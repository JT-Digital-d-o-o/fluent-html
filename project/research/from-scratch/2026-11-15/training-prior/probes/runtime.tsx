import { render, defineRoutes, defineIds } from "rtsx";
const ids = defineIds(["list"]);
const r = defineRoutes("/p", { results: { path: "/r", render: ids.list }, save: { method: "post", path: "/" } });
const any = (v: unknown) => v as any;
const cases: [string, () => unknown][] = [
  ["hx-get={false} is left out", () => <span hx-get={false}>x</span>],
  ["plain button", () => <button>Save</button>],
  ["hx button", () => <button hx-post={r.save()}>Save</button>],
  ["explicit target wins", () => <div hx-get={r.results()} hx-target="this" />],
  ["unknown hx attribute", () => <div {...any({ "hx-gte": r.results() })} />],
  ["onclick through a spread", () => <div {...any({ onclick: "alert(1)" })} />],
  ["hx-on through a spread", () => <div {...any({ "hx-on:click": "alert(1)" })} />],
  ["string in script", () => <script>{any("alert(1)")}</script>],
  ["string in hx-get", () => <div hx-get={any("js:alert(1)")} />],
  ["get route in hx-post", () => <div hx-post={any(r.results())} />],
  ["object child", () => <div>{any({ a: 1 })}</div>],
  ["className through any", () => <div {...any({ className: "x" })} />],
  ["trigger filter", () => <div hx-get={r.results()} hx-trigger="click[ctrlKey]" />],
  ["style string", () => <div style={any("color:red")} />],
];
for (const [name, f] of cases) {
  try { console.log(`${name}  =>  ${render(f() as any)}`); } catch (e) { console.log(`${name}  =>  THROWS ${(e as Error).message}`); }
}
