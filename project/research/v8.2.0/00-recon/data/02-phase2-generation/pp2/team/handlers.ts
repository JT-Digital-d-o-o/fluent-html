import type { FastifyReply, FastifyRequest } from "fastify";
import { render } from "fluent-html";
import { addInvitedMember, countMembers, searchMembers } from "./store";
import { readInvite, validateInvite } from "./validation";
import {
  inviteForm,
  memberList,
  searchForm,
  teamPage,
  type InviteFormState,
  type MemberListProps,
} from "./views";

export interface SearchQuerystring {
  q?: string | string[];
}

type SearchRequest = FastifyRequest<{ Querystring: SearchQuerystring }>;

const HTML = "text/html; charset=utf-8";

function blankInvite(notice?: string): InviteFormState {
  return { values: { name: "", email: "", role: "member" }, errors: {}, notice };
}

function listFor(query: string): MemberListProps {
  return { members: searchMembers(query), query, teamSize: countMembers() };
}

function queryFrom(request: SearchRequest): string {
  const { q } = request.query;
  return typeof q === "string" ? q.trim() : "";
}

export async function showTeam(request: SearchRequest, reply: FastifyReply) {
  return reply.type(HTML).send(teamPage(listFor(queryFrom(request)), blankInvite()));
}

export async function filterMembers(request: SearchRequest, reply: FastifyReply) {
  return reply.type(HTML).send(render(memberList(listFor(queryFrom(request)))));
}

export async function createInvite(request: FastifyRequest, reply: FastifyReply) {
  const values = readInvite(request.body);
  const result = validateInvite(values);
  const fromHtmx = request.headers["hx-request"] === "true";

  if (!result.ok) {
    const invite = { values, errors: result.errors };
    return reply
      .code(422)
      .type(HTML)
      .send(fromHtmx ? render(inviteForm(invite)) : teamPage(listFor(""), invite));
  }

  const member = addInvitedMember(result.invite);

  if (!fromHtmx) {
    // Post/redirect/get so a refresh doesn't resubmit the invite.
    return reply.code(303).header("location", "/team").send();
  }

  // Reset the form, and clear any search so the refreshed list shows the new member.
  return reply
    .type(HTML)
    .send(
      render(inviteForm(blankInvite(`Invited ${member.name}.`))) +
        render(searchForm("").addAttribute("hx-swap-oob", "true")) +
        render(memberList(listFor("")).addAttribute("hx-swap-oob", "true")),
    );
}
