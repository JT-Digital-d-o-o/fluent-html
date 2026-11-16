// ATTR-1 fluent-nine: An input's type is a value HTML does not have.
import { Input, html } from "../../arms/fluent-nine/app.ts";
export default () => html(Input().setType("txt").setAria({ label: "Name" })); // ✗
