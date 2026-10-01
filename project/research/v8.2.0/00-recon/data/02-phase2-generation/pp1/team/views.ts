import {
  A,
  Button,
  Div,
  Form,
  H1,
  H2,
  Input,
  Label,
  Main,
  Option,
  P,
  Section,
  Select,
  Span,
  Strong,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  hx,
} from "fluent-html";
import { ROLES, type Member, type MemberStatus, type Role } from "./store";
import { EMPTY_INVITE, type InviteErrors, type InviteValues } from "./validation";

const IDS = {
  section: "team-members",
  sectionHeading: "team-members-heading",
  list: "member-list",
  search: "member-search",
  form: "invite-form",
  name: "invite-name",
  email: "invite-email",
  role: "invite-role",
} as const;

const ROLE_LABELS: Record<Role, string> = { owner: "Owner", admin: "Admin", member: "Member" };

// Complete class names per status (no `bg-${colour}-50`) so Tailwind can find them.
const STATUS_BADGES: Record<MemberStatus, { label: string; classes: string }> = {
  active: { label: "Active", classes: "bg-emerald-50 text-emerald-700 ring-emerald-600/20" },
  invited: { label: "Invited", classes: "bg-amber-50 text-amber-800 ring-amber-600/20" },
};

const LABEL_CLASSES = "block text-sm font-medium text-slate-700";
const CONTROL_BASE =
  "block w-full rounded-md border bg-white px-3 py-2 text-sm shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-1";
const CONTROL_CLASSES = `${CONTROL_BASE} border-slate-300 focus:border-indigo-500 focus:ring-indigo-500`;
const CONTROL_ERROR_CLASSES = `${CONTROL_BASE} border-red-400 text-red-900 focus:border-red-500 focus:ring-red-500`;
const EMPTY_STATE_CLASSES = "rounded-lg border border-dashed border-slate-300 bg-white px-6 py-12 text-center";

export interface MemberListProps {
  members: readonly Member[];
  query: string;
  teamSize: number;
  /** Row to highlight, e.g. the member that was just invited. */
  highlightId?: string;
}

// ---------------------------------------------------------------------------
// Page

export function teamPage(props: MemberListProps) {
  return Main(
    Div(
      H1("Team").addClass("text-2xl font-semibold tracking-tight"),
      P("See who's on your team and invite new members.").addClass("mt-1 text-sm text-slate-500"),
    ).addClass("mb-8"),
    Div(
      Div(membersSection(props)).addClass("lg:col-span-2"),
      Div(inviteForm()).addClass("rounded-lg border border-slate-200 bg-white p-6 shadow-sm lg:self-start"),
    ).addClass("grid gap-8 lg:grid-cols-3"),
  ).addClass("mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8");
}

// ---------------------------------------------------------------------------
// Members

export function membersSection({ oob = false, ...props }: MemberListProps & { oob?: boolean }) {
  const count = `${props.teamSize} ${props.teamSize === 1 ? "member" : "members"}`;
  const section = Section(
    Div(
      H2("Members").setId(IDS.sectionHeading).addClass("text-lg font-semibold"),
      Span(count).addClass("text-sm text-slate-500"),
    ).addClass("flex items-baseline justify-between"),
    searchBox(props.query),
    memberList(props),
  )
    .setId(IDS.section)
    .addAttribute("aria-labelledby", IDS.sectionHeading)
    .addClass("space-y-4");

  // After a successful invite this rides along with the form response and replaces the section on the page.
  return oob ? section.addAttribute("hx-swap-oob", "true") : section;
}

function searchBox(query: string) {
  return Div(
    Label("Search members").setFor(IDS.search).addClass("sr-only"),
    Input()
      .setType("search")
      .setId(IDS.search)
      .setName("q")
      .setValue(query)
      .setPlaceholder("Search by name or email")
      .addAttribute("autocomplete", "off")
      // Abort an in-flight search when a newer one starts, so stale results never overwrite fresh ones.
      .addAttribute("hx-sync", "this:replace")
      .setHtmx(
        hx("/team/members", {
          method: "get",
          trigger: "input changed delay:250ms, search",
          target: `#${IDS.list}`,
          swap: "outerHTML",
        }),
      )
      .addClass(CONTROL_CLASSES),
  );
}

export function memberList(props: MemberListProps) {
  return Div(memberListContent(props)).setId(IDS.list);
}

function memberListContent({ members, query, teamSize, highlightId }: MemberListProps) {
  if (teamSize === 0) return emptyTeam();
  if (members.length === 0) return noMatches(query);

  return Div(
    Table(
      Thead(Tr(...["Name", "Email", "Role", "Status"].map(columnHeader))).addClass("bg-slate-50"),
      Tbody(...members.map((member) => memberRow(member, member.id === highlightId))).addClass(
        "divide-y divide-slate-100 bg-white",
      ),
    ).addClass("min-w-full divide-y divide-slate-200 text-left text-sm"),
  ).addClass("overflow-x-auto rounded-lg border border-slate-200");
}

function columnHeader(label: string) {
  return Th(label)
    .addAttribute("scope", "col")
    .addClass("px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500");
}

function memberRow(member: Member, highlighted: boolean) {
  const row = Tr(
    Td(member.name).addClass("whitespace-nowrap px-4 py-3 font-medium text-slate-900"),
    Td(member.email).addClass("whitespace-nowrap px-4 py-3 text-slate-600"),
    Td(ROLE_LABELS[member.role]).addClass("px-4 py-3 text-slate-600"),
    Td(statusBadge(member.status)).addClass("px-4 py-3"),
  );
  return highlighted ? row.addClass("bg-indigo-50") : row;
}

function statusBadge(status: MemberStatus) {
  const { label, classes } = STATUS_BADGES[status];
  return Span(label).addClass(
    `inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${classes}`,
  );
}

function emptyTeam() {
  return Div(
    P("Your team has no members yet").addClass("text-sm font-semibold text-slate-900"),
    P("Invite someone to start working together.").addClass("mt-1 text-sm text-slate-500"),
    A("Invite a member")
      .setHref(`#${IDS.name}`)
      .addClass(
        "mt-4 inline-flex rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500",
      ),
  ).addClass(EMPTY_STATE_CLASSES);
}

function noMatches(query: string) {
  return Div(
    P("No members match ", Strong(`“${query}”`), ".").addClass("text-sm text-slate-700"),
    P("Try a different name or email.").addClass("mt-1 text-sm text-slate-500"),
  )
    .addAttribute("role", "status")
    .addClass(EMPTY_STATE_CLASSES);
}

// ---------------------------------------------------------------------------
// Invite form

export interface InviteFormProps {
  values?: InviteValues;
  errors?: InviteErrors;
  /** Confirmation shown above a freshly reset form. */
  notice?: string;
}

export function inviteForm({ values = EMPTY_INVITE, errors = {}, notice }: InviteFormProps = {}) {
  // Focus where the user acts next: the first invalid field, or the name field after a successful invite.
  const focus = (["name", "email", "role"] as const).find((field) => errors[field]) ?? (notice ? "name" : undefined);

  return Form(
    Div(
      H2("Invite member").addClass("text-lg font-semibold"),
      P("They'll show as invited until they accept.").addClass("mt-1 text-sm text-slate-500"),
    ),
    ...(notice
      ? [
          P(notice)
            .addAttribute("role", "status")
            .addClass("rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800"),
        ]
      : []),
    formField(
      IDS.name,
      "Name",
      Input()
        .setType("text")
        .setName("name")
        .setValue(values.name)
        .addAttribute("required", "")
        .addAttribute("autocomplete", "off"),
      errors.name,
      focus === "name",
    ),
    formField(
      IDS.email,
      "Email",
      Input()
        .setType("email")
        .setName("email")
        .setValue(values.email)
        .setPlaceholder("name@example.com")
        .addAttribute("required", "")
        .addAttribute("autocomplete", "off"),
      errors.email,
      focus === "email",
    ),
    formField(IDS.role, "Role", roleSelect(values.role), errors.role, focus === "role"),
    Button("Send invite")
      .setType("submit")
      .addClass(
        "inline-flex w-full justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-60",
      ),
  )
    .setId(IDS.form)
    // Let the server's messages appear next to the fields instead of the browser's validation tooltips.
    .addAttribute("novalidate", "")
    .addAttribute("hx-disabled-elt", "find button")
    .setHtmx(hx("/team/members", { method: "post", target: "this", swap: "outerHTML" }))
    .addClass("space-y-4");
}

function roleSelect(selected: string) {
  return Select(
    ...ROLES.map((role) => {
      const option = Option(ROLE_LABELS[role]).setValue(role);
      return role === selected ? option.addAttribute("selected", "") : option;
    }),
  ).setName("role");
}

type FormControl = ReturnType<typeof Input> | ReturnType<typeof Select>;

function formField(id: string, label: string, control: FormControl, error: string | undefined, autofocus: boolean) {
  const errorId = `${id}-error`;
  let field = control
    .setId(id)
    .addClass(error ? CONTROL_ERROR_CLASSES : CONTROL_CLASSES)
    .addAttribute("aria-invalid", error ? "true" : "false");
  if (error) field = field.addAttribute("aria-describedby", errorId);
  if (autofocus) field = field.addAttribute("autofocus", "");

  return Div(
    Label(label).setFor(id).addClass(LABEL_CLASSES),
    field,
    ...(error ? [P(error).setId(errorId).addClass("text-sm text-red-600")] : []),
  ).addClass("space-y-1");
}
