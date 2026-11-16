// Safety parity, fluent-html 8 side: each P line is a mistake fluent-html 8 rejects with tsc
// (verbs from the template's swap-verbs.ts, as keep-fh9 copied it).
import { Div, Input, Button, A, hx, Raw } from "fluent-html";
import "../../../keep-fh9/proto/verbs.js";
import "./theme.ts";
import { ids, projectRoutes } from "./routes.fh8.ts";
declare const userBio: string;

Div().justify("centre");                                         // P1 unknown class
Div().bg("gray-100");                                            // P2 palette literal
Div().variant("hovr", { bg: "primary" });                        // P3 bad variant
Div().fragment(ids.projectList, projectRoutes.status({ id: 1 })); // P4 fragment id mismatch
A("Rows").nav(projectRoutes.rows());                             // P5 wrong route stance
Button("Go").setHtmx(hx("/projects/rows"));                      // P6 raw hx-* URL
Input().setType("txt");                                          // P8 bad attribute value
Button("Go").setType("sumbit");                                  // P8b bad attribute value
Div(Raw(userBio));                                               // P7 unescaped HTML from data
Div().setStyle(`color: ${userBio}`);                             // P10 runtime CSS into a style attribute
Div().cssClass("p-4 bg-gray-100");                               // P11 Tailwind text in a raw class sink
