/**
 * Control flow example — IfThen, ForEach, Match
 *
 * Run: npx tsx examples/control-flow.ts
 */
import {
  Div, Ul, Li, Span, H2, P, Img,
  IfThen, IfThenElse, ForEach, Match, Repeat,
  render,
} from '../src/index.js';

// --- IfThen / IfThenElse ---

const isAdmin = true;
const userName: string | null = "Alice";
const avatarUrl: string | null = null;

const header = Div(
  // Boolean condition
  IfThen(isAdmin, () => Span("Admin").setClass("badge")),

  // Nullable value narrowing — `name` is narrowed to `string`
  IfThenElse(
    userName,
    (name) => Span(`Welcome, ${name}`),
    () => Span("Guest"),
  ),

  // Nullable narrowing with complex type
  IfThen(avatarUrl, (src) => Img().setSrc(src).setAlt("Avatar")),
);

console.log("--- IfThen / IfThenElse ---");
console.log(render(header));

// --- ForEach ---

type User = { name: string; role: string };
const users: User[] = [
  { name: "Alice", role: "admin" },
  { name: "Bob", role: "editor" },
  { name: "Carol", role: "viewer" },
];

const userList = Ul(
  ForEach(users, (user, i) =>
    Li(`${i + 1}. ${user.name} (${user.role})`),
  ),
);

console.log("\n--- ForEach (items) ---");
console.log(render(userList));

// Repeat n times
const stars = Div(Repeat(5, () => Span("★")));

console.log("\n--- Repeat ---");
console.log(render(stars));

// Range iteration
const pages = Div(ForEach(1, 6, (i) => Span(`Page ${i} `)));

console.log("\n--- ForEach (range) ---");
console.log(render(pages));

// --- Match ---

type Status = "loading" | "error" | "success";
const status = "success" as Status;

const statusView = Match(status, {
  loading: () => P("Loading..."),
  error:   () => P("Something went wrong."),
  success: () => Div(
    H2("Dashboard"),
    P("Everything is running smoothly."),
  ),
});

console.log("\n--- Match ---");
console.log(render(statusView));
