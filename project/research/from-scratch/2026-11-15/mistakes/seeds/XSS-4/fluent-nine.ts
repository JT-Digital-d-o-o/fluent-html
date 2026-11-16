// XSS-4 fluent-nine: An hx-on handler's code comes from data.
import { Button, html, hostile } from "../../arms/fluent-nine/app.ts";
export default () => html(Button("Go").setType("button").addAttribute("hx-on:click", hostile.js)); // ✗
