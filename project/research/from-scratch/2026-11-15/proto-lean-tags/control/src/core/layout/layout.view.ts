// The same document shell as Lean Tags' support/layout.ts, in fluent-html 8. App code, not counted.
import { Body, Document, Head, Main, Meta, Title, type View } from "fluent-html";
import "../htmx/swap-verbs.js";

export function Layout({ title, children }: { title: string; children: View }) {
  return Document(
    Head(
      Meta().setCharset("utf-8"),
      Meta().setName("viewport").setContent("width=device-width, initial-scale=1"),
      Title(title),
      Meta().setName("description").setContent(`${title} in the project tracker.`),
    ),
    Body(Main(children).setId("main-content").mx("auto").maxW("3xl").px("4").py("8")),
  ).setLang("en");
}
