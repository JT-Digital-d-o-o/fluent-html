/**
 * Composition example — .apply(), .when(), reusable components
 *
 * Run: npx tsx examples/composition.ts
 */
import type { Tag} from '../src/index.js';
import {
  Div, H2, P, Span, Button, Ul, Li,
  ForEach, IfThen,
  render,
} from '../src/index.js';

// --- Reusable modifiers via .apply() ---

const card = (t: Tag) =>
  t.p("6").bg("white").rounded("lg").shadow("md");

const badge = (color: string) => (t: Tag) =>
  t.p("x", "2")
    .p("y", "1")
    .text("xs")
    .font("semibold")
    .rounded("full")
    .bg(`${color}-100`)
    .text(`${color}-800`);

// --- Reusable component functions ---

type User = {
  name: string;
  email: string;
  role: "admin" | "editor" | "viewer";
  isOnline: boolean;
};

const roleBadgeColor = { admin: "red", editor: "blue", viewer: "gray" } as const;

function UserCard(props: { user: User }) {
  const { user } = props;

  return Div(
    Div(
      H2(user.name).text("lg").font("bold"),
      Span(user.role).apply(badge(roleBadgeColor[user.role])),
    ).flex().items("center").gap("2"),

    P(user.email).text("gray-500").text("sm").m("top", "1"),

    IfThen(user.isOnline, () =>
      Span("Online").text("green-600").text("sm").font("medium"),
    ),
  )
    .apply(card)
    .when(!user.isOnline, t => t.opacity("75"));
}

function UserList(props: { users: User[]; title: string }) {
  return Div(
    H2(props.title).text("xl").font("bold").m("bottom", "4"),

    Ul(
      ForEach(props.users, (user) =>
        Li(UserCard({ user })).m("bottom", "3"),
      ),
    ),

    Button(`${props.users.length} users total`)
      .p("x", "4")
      .p("y", "2")
      .bg("gray-100")
      .rounded("lg")
      .m("top", "4")
      .when(props.users.length === 0, t =>
        t.toggle("disabled").opacity("50"),
      ),
  );
}

// --- Usage ---

const users: User[] = [
  { name: "Alice", email: "alice@example.com", role: "admin", isOnline: true },
  { name: "Bob", email: "bob@example.com", role: "editor", isOnline: false },
  { name: "Carol", email: "carol@example.com", role: "viewer", isOnline: true },
];

console.log(render(
  UserList({ users, title: "Team Members" }),
));
