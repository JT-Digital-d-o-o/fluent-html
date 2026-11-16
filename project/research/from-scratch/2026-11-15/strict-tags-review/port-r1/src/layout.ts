import { a, cls, doc, focus, focusVisible, footer, header, hover, ariaInvalid, nav, small, span, type FlowKid } from "strict-tags";
import { orders } from "./orders.js";
import { settings } from "./settings.js";

/** Shared presets: one place for the look of controls and surfaces. */
export const card = cls("rounded-card border border-line bg-surface p-6 shadow-sm");
export const control = cls("w-full rounded-control border border-line bg-surface px-3 py-2 text-sm", ariaInvalid("border-danger"), focus("outline-2 outline-primary"));
export const primaryButton = cls(
  "inline-flex items-center rounded-control bg-primary px-4 py-2 text-sm font-semibold text-on-accent",
  hover("bg-primary-700"),
  focusVisible("outline-2 outline-offset-2 outline-primary"),
);
export const secondaryButton = cls("inline-flex items-center rounded-control border border-line bg-surface px-3 py-2 text-sm", hover("bg-surface-2"));
export const fieldError = cls("text-sm text-danger");
export const navLink = cls("rounded-control px-3 py-1.5 text-sm", hover("bg-surface-2"));

/** The document shell for every screen: banner, primary navigation, the boosted main landmark and a footer. */
export const Layout = (o: { title: string }, ...children: FlowKid[]) =>
  doc(
    {
      title: o.title,
      description: "Account settings and order management.",
      header: header(
        cls("border-b border-line bg-surface"),
        nav(
          cls("mx-auto flex max-w-5xl items-center gap-2 px-4 py-3"),
          { "aria-label": "Primary" },
          span(cls("mr-auto font-semibold"), "Shopdesk"),
          a(navLink, orders.list(), "Orders"),
          a(navLink, settings.show(), "Settings"),
        ),
      ),
      footer: footer(cls("mx-auto max-w-5xl px-4 py-6 text-text-dim"), small("© 2026 Shopdesk")),
    },
    cls("mx-auto grid max-w-5xl gap-6 px-4 py-8"),
    ...children,
  );
