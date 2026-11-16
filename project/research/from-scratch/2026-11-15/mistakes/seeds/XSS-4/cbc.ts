// XSS-4 cbc: An hx-on handler's code comes from data.
import { button, hostile, render } from "../../arms/cbc/app.ts";
export default () => render(button({ "hx-on:click": hostile.js }, "Go")); // ✗
