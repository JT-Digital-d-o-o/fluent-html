export { Html, Id, Route, Url, defineIds, defineRoutes, localUrl, url, json, js, css, unsafeHtml, match, mainContent } from "./core.js";
export type { Schema, RouteDef, Method } from "./core.js";
export { form } from "./form.js";
export type { Form, FormState } from "./form.js";
export type { Child, ClassValue, JSX } from "./jsx.js";
import { Html } from "./core.js";
export const render = (view: Html): string => view.html;
