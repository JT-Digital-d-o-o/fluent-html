// The app shell, shared by every screen. App code, written once; not counted.
import { doc, main, tw, type Child } from "lean-tags";

export const Layout = (o: { title: string }, ...children: Child[]) =>
  doc({ title: o.title, description: `${o.title} in the project tracker.` }, main(tw`mx-auto max-w-3xl px-4 py-8`, { id: "main" }, children));
