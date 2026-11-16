// The bench page as fluent-html 9 writes it: .tw("…"), Button() is type="button", typed img setters.
process.env.FH9_IDIOMATIC = "1";
const m = await import("./fh9-same.mjs?idiomatic");
export const name = m.name;
export const build = m.build;
export const render = m.render;
