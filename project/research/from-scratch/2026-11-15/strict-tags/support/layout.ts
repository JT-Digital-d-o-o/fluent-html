// The app shell, shared by every screen. App code, written once; not counted.
import { cls, doc, type FlowKid } from "#st";

export const Layout = (o: { title: string }, ...children: FlowKid[]) =>
  doc({ title: o.title, description: `${o.title} in the project tracker.` }, cls("mx-auto max-w-3xl px-4 py-8"), ...children);
