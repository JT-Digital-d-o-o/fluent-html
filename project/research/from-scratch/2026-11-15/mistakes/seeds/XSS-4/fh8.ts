// XSS-4 fh8: An hx-on handler's code comes from data.
import { Button, html, hostile } from "../../arms/fh8/app.ts";
export default () => html(Button("Go").setType("button").addAttribute("hx-on:click", hostile.js)); // ✗
