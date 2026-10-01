import { Match, Span } from "fluent-html";
type State = { status: "loading" } | { status: "error"; message: string } | { status: "success"; count: number };
export const v = (s: State) => Match(s, "status", {
  loading: () => Span("Loading"),
  error: (e) => Span(e.message),
});
