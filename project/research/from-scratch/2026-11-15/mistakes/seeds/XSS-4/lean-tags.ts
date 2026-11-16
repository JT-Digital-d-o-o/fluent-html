// XSS-4 lean-tags: An hx-on handler's code comes from data.
import { button, hostile, render } from "../../arms/lean-tags/app.ts";
export default () => render(button({ "hx-on:click": hostile.js }, "Go")); // ✗
