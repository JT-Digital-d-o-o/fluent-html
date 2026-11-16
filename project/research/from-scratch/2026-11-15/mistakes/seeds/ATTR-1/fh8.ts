// ATTR-1 fh8: An input's type is a value HTML does not have.
import { Input, html } from "../../arms/fh8/app.ts";
export default () => html(Input().setType("txt").setAria({ label: "Name" })); // ✗
