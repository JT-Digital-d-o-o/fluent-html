// A11Y-3 fluent-nine: An icon button has no text and no accessible name.
import { Button, html } from "../../arms/fluent-nine/app.ts";
export default () => html(Button().setType("button").tw("p-2 rounded-control")); // ✗
