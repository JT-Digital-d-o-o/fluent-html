// Seeded mistakes for `hh check`: each template below has one. Never imported by the app.
import { html, tw } from "../../src/hh.ts";

declare const name: string;
declare const tone: string;
declare const key: string;

export const paletteLiteral = () => html`<p class="bg-gray-100 text-ink">${name}</p>`;

export const classTypo = () => html`<p class="rouned-card p-4">${name}</p>`;

export const builtClass = () => html`<p class="text-sm bg-${tone}/10">${name}</p>`;

export const buttonWithoutType = () => html`
  <div class="p-4">
    <button class="rounded-control px-4 py-2">Save</button>
  </div>`;

export const inlineHandler = () => html`<a href="/x" onclick="track()">${name}</a>`;

export const jsxComponentTag = () => html`<section><Card title="x" /></section>`;

export const unclosed = () => html`
  <ul class="p-4">
    <li>${name}
  </ul>`;

export const attributeNameFromData = () => html`<div data-${key}="1"></div>`;

export const holeInStyleElement = () => html`<iframe srcdoc="${name}"></iframe>`;

export const imgWithoutAlt = () => html`<img src="/logo.svg" class="h-8">`;

export const twWithHole = tw`px-3 ${tone}`;

export const twPalette = tw`px-3 text-red-500`;
