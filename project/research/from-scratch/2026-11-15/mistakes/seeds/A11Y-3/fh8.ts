// A11Y-3 fh8: An icon button has no text and no accessible name.
import { Button, html } from "../../arms/fh8/app.ts";
export default () => html(Button().setType("button").p("2").rounded("control")); // ✗
