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
  t.padding("6").background("white").rounded("lg").shadow("md");

const badge = (color: string) => (t: Tag) =>
  t.padding("x", "2")
    .padding("y", "1")
    .textSize("xs")
    .fontWeight("semibold")
    .rounded("full")
    .background(`${color}-100`)
    .textColor(`${color}-800`);

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
      H2(user.name).textSize("lg").fontWeight("bold"),
      Span(user.role).apply(badge(roleBadgeColor[user.role])),
    ).flex().alignItems("center").gap("2"),

    P(user.email).textColor("gray-500").textSize("sm").margin("top", "1"),

    IfThen(user.isOnline, () =>
      Span("Online").textColor("green-600").textSize("sm").fontWeight("medium"),
    ),
  )
    .apply(card)
    .when(!user.isOnline, t => t.opacity("75"));
}

function UserList(props: { users: User[]; title: string }) {
  return Div(
    H2(props.title).textSize("xl").fontWeight("bold").margin("bottom", "4"),

    Ul(
      ForEach(props.users, (user) =>
        Li(UserCard({ user })).margin("bottom", "3"),
      ),
    ),

    Button(`${props.users.length} users total`)
      .padding("x", "4")
      .padding("y", "2")
      .background("gray-100")
      .rounded("lg")
      .margin("top", "4")
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
