// Safety parity, Fluent Nine side: the same mistakes as fh8.ts, written in Fluent Nine's surface.
import { Div, Input, Button, A, hx, Raw } from "fluent-html";
import "./theme.ts";
import { ids, projectRoutes } from "./routes.fh9.ts";
declare const userBio: string;

Div().tw("justify-centre");                                      // P1 unknown class
Div().tw("bg-gray-100");                                         // P2 palette literal
Div().tw("hovr:bg-primary");                                     // P3 bad variant
Div().fragment(ids.projectList, projectRoutes.status({ id: 1 })); // P4 fragment id mismatch
A("Rows").nav(projectRoutes.rows());                             // P5 wrong route stance
Button("Go").setHtmx(hx("/projects/rows"));                      // P6 raw hx-* URL
Div(Raw(userBio));                                               // P7 unescaped HTML from data
Input().setType("txt");                                          // P8 bad attribute value
Button("Go").setType("sumbit");                                  // P8b bad attribute value
Div().bg("primary");                                             // P9 a fluent-html 8 styling method
Div().setStyle(`color: ${userBio}`);                             // P10 runtime CSS into a style attribute
Div().cssClass("p-4 bg-gray-100");                               // P11 Tailwind text in a raw class sink
