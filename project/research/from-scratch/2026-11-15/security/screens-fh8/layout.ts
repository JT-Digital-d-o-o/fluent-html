import "@tpl/core/htmx/swap-verbs.js";
import "@tpl/app/theme.js";
import { Body, Head, HTML, Link, Main, Meta, Script, Title, type View } from "fluent-html";
import { layoutIds } from "@tpl/core/layout/layout.routes.js";

export function Layout({ title, children }: { title: string; children: View }) {
  return HTML(
    Head(
      Meta().setCharset("utf-8"),
      Meta().setName("viewport").setContent("width=device-width, initial-scale=1"),
      Title(title),
      Link().setRel("stylesheet").setHref("/css/app.css"),
      Script().setSrc("/js/htmx.js").toggle("defer"),
    ),
    Body(Main(children).setId(layoutIds.mainContent).mx("auto").maxW("3xl").p("6")).bg("bg").text("text"),
  ).setLang("en");
}
