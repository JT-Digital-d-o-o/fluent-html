import {
  A,
  Body,
  Button,
  Div,
  Form,
  H1,
  H2,
  Head,
  Header,
  Html,
  Input,
  Label,
  Main,
  Meta,
  Option,
  P,
  Script,
  Section,
  Select,
  Span,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Title,
  Tr,
  hx,
  render,
} from "fluent-html";
import { ROLES, type Member, type MemberRole, type MemberStatus } from "./store";
import type { InviteErrors, InviteValues } from "./validation";

export interface MemberListProps {
  members: Member[];
  query: string;
  teamSize: number;
}

export interface InviteFormState {
  values: InviteValues;
  errors: InviteErrors;
  notice?: string;
}

const ROLE_LABELS: Record<MemberRole, string> = { owner: "Owner", admin: "Admin", member: "Member" };

const STATUS_BADGES: Record<MemberStatus, { label: string; className: string }> = {
  active: { label: "Active", className: "bg-emerald-50 text-emerald-700 ring-emerald-600/20" },
  invited: { label: "Invited", className: "bg-amber-50 text-amber-800 ring-amber-600/20" },
};

// htmx doesn't swap 4xx responses by default; let a 422 carrying validation errors replace the form.
const SWAP_VALIDATION_ERRORS =
  "if (event.detail.xhr.status === 422) { event.detail.shouldSwap = true; event.detail.isError = false; }";

const LABEL_CLASS = "block text-sm font-medium text-slate-700";
const CELL_CLASS = "whitespace-nowrap px-4 py-3";
const CONTROL_CLASS =
  "block w-full rounded-md border-0 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm ring-1 ring-inset placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-inset";

function controlClass(error?: string): string {
  return error
    ? `${CONTROL_CLASS} ring-red-400 focus:ring-red-600`
    : `${CONTROL_CLASS} ring-slate-300 focus:ring-indigo-600`;
}

export function teamPage(list: MemberListProps, invite: InviteFormState): string {
  return (
    "<!DOCTYPE html>" +
    render(
      Html(
        Head(
          Meta().addAttribute("charset", "utf-8"),
          Meta()
            .addAttribute("name", "viewport")
            .addAttribute("content", "width=device-width, initial-scale=1"),
          Title("Team"),
          Script().addAttribute("src", "https://unpkg.com/htmx.org@2.0.4"),
          Script().addAttribute("src", "https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"),
        ),
        Body(
          Main(
            Header(
              H1("Team").addClass("text-2xl font-semibold tracking-tight"),
              P("See who has access and invite new people.").addClass("mt-1 text-sm text-slate-600"),
            ),
            Div(
              Section(
                H2("Members").setId("members-heading").addClass("text-base font-semibold"),
                searchForm(list.query),
                memberList(list),
              )
                .addAttribute("aria-labelledby", "members-heading")
                .addClass("space-y-4 lg:col-span-2"),
              Section(
                H2("Invite member").setId("invite-heading").addClass("text-base font-semibold"),
                inviteForm(invite),
              )
                .setId("invite")
                .addAttribute("aria-labelledby", "invite-heading")
                .addClass("self-start rounded-lg border border-slate-200 bg-white p-6 shadow-sm"),
            ).addClass("mt-8 grid gap-8 lg:grid-cols-3"),
          ).addClass("mx-auto max-w-6xl px-4 py-10 sm:px-6"),
        ).addClass("min-h-screen bg-slate-50 text-slate-900 antialiased"),
      ).addAttribute("lang", "en"),
    )
  );
}

/** Filters the list as the user types; still works as a plain GET form without JavaScript. */
export function searchForm(query: string) {
  return Form(
    Input()
      .setType("search")
      .setName("q")
      .setValue(query)
      .setPlaceholder("Search by name or email")
      .addAttribute("aria-label", "Search members by name or email")
      .addAttribute("autocomplete", "off")
      .addClass(controlClass()),
  )
    .setId("member-search")
    .addAttribute("role", "search")
    .addAttribute("action", "/team")
    .addAttribute("method", "get")
    .setHtmx(
      hx("/team/members", {
        method: "get",
        trigger: "input delay:250ms, submit",
        target: "#member-list",
        swap: "outerHTML",
      }),
    );
}

export function memberList(list: MemberListProps) {
  return Div(memberListContent(list)).setId("member-list");
}

function memberListContent({ members, query, teamSize }: MemberListProps) {
  if (teamSize === 0) return emptyTeam();
  if (members.length === 0) return noMatches(query);
  return memberTable(members, resultSummary(members.length, teamSize, query));
}

function resultSummary(shown: number, teamSize: number, query: string): string {
  const noun = teamSize === 1 ? "member" : "members";
  return query ? `Showing ${shown} of ${teamSize} ${noun} matching “${query}”` : `${teamSize} ${noun}`;
}

function emptyTeam() {
  return Div(
    P("Your team has no members yet").addClass("text-sm font-semibold text-slate-900"),
    P("Invite someone and they'll show up here.").addClass("mt-1 text-sm text-slate-600"),
    A("Invite a member")
      .setHref("#invite")
      .addClass(
        "mt-4 inline-flex rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500",
      ),
  ).addClass("rounded-lg border-2 border-dashed border-slate-300 bg-white px-6 py-12 text-center");
}

function noMatches(query: string) {
  return Div(
    P(`No members match “${query}”.`).addClass("text-sm font-semibold text-slate-900"),
    P("Check the spelling or search by email instead.").addClass("mt-1 text-sm text-slate-600"),
  ).addClass("rounded-lg border border-slate-200 bg-white px-6 py-10 text-center");
}

function memberTable(members: Member[], summary: string) {
  return Div(
    P(summary).addClass("border-b border-slate-200 px-4 py-2.5 text-sm text-slate-600"),
    Div(
      Table(
        Thead(
          Tr(columnHeader("Name"), columnHeader("Email"), columnHeader("Role"), columnHeader("Status")),
        ).addClass("bg-slate-50"),
        Tbody(...members.map(memberRow)).addClass("divide-y divide-slate-100"),
      ).addClass("min-w-full text-left text-sm"),
    ).addClass("overflow-x-auto"),
  ).addClass("overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm");
}

function columnHeader(label: string) {
  return Th(label)
    .addAttribute("scope", "col")
    .addClass("px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500");
}

function memberRow(member: Member) {
  return Tr(
    Td(member.name).addClass(`${CELL_CLASS} font-medium text-slate-900`),
    Td(member.email).addClass(`${CELL_CLASS} text-slate-600`),
    Td(ROLE_LABELS[member.role]).addClass(`${CELL_CLASS} text-slate-600`),
    Td(statusBadge(member.status)).addClass(CELL_CLASS),
  );
}

function statusBadge(status: MemberStatus) {
  const badge = STATUS_BADGES[status];
  return Span(badge.label).addClass(
    `inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${badge.className}`,
  );
}

/** Posts via htmx and swaps itself; falls back to a normal POST without JavaScript. */
export function inviteForm({ values, errors, notice }: InviteFormState) {
  return Form(
    ...successNotice(notice),
    textField("Name", "name", "text", values.name, errors.name),
    textField("Email", "email", "email", values.email, errors.email),
    roleField(values.role, errors.role),
    Button("Invite member")
      .setType("submit")
      .addClass(
        "inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600",
      ),
  )
    .setId("invite-form")
    .addAttribute("action", "/team/members")
    .addAttribute("method", "post")
    // Server-side messages are the source of truth; skip the browser's own validation bubbles.
    .addAttribute("novalidate", "")
    .addAttribute("hx-on:htmx:before-swap", SWAP_VALIDATION_ERRORS)
    .setHtmx(hx("/team/members", { method: "post", target: "this", swap: "outerHTML" }))
    .addClass("mt-4 space-y-4");
}

function textField(label: string, name: "name" | "email", type: "text" | "email", value: string, error?: string) {
  const id = `invite-${name}`;
  return Div(
    Label(label).addAttribute("for", id).addClass(LABEL_CLASS),
    Input()
      .setId(id)
      .setType(type)
      .setName(name)
      .setValue(value)
      .addAttribute("required", "")
      // The browser would otherwise suggest the signed-in user's own details.
      .addAttribute("autocomplete", "off")
      .addAttribute("aria-invalid", String(error !== undefined))
      .addAttribute("aria-describedby", `${id}-error`)
      .addClass(controlClass(error)),
    ...fieldError(`${id}-error`, error),
  ).addClass("space-y-1");
}

function roleField(value: string, error?: string) {
  return Div(
    Label("Role").addAttribute("for", "invite-role").addClass(LABEL_CLASS),
    Select(...ROLES.map((role) => roleOption(role, value)))
      .setId("invite-role")
      .setName("role")
      .addAttribute("aria-invalid", String(error !== undefined))
      .addAttribute("aria-describedby", "invite-role-error")
      .addClass(controlClass(error)),
    ...fieldError("invite-role-error", error),
  ).addClass("space-y-1");
}

function roleOption(role: MemberRole, selectedRole: string) {
  const option = Option(ROLE_LABELS[role]).setValue(role);
  return role === selectedRole ? option.addAttribute("selected", "") : option;
}

function fieldError(id: string, message?: string) {
  return message ? [P(message).setId(id).addClass("text-sm text-red-600")] : [];
}

function successNotice(message?: string) {
  return message
    ? [
        P(message)
          .addAttribute("role", "status")
          .addClass("rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800"),
      ]
    : [];
}
