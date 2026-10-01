import type { FastifyReply, FastifyRequest } from "fastify";
import { render } from "fluent-html";
import { renderDocument } from "./layout";
import type { TeamStore } from "./store";
import { readInviteValues, validateInvite } from "./validation";
import { inviteForm, memberList, membersSection, teamPage } from "./views";

export type SearchRoute = { Querystring: { q?: string | string[] } };
type SearchRequest = FastifyRequest<SearchRoute>;

const MAX_QUERY_LENGTH = 100;

function readQuery(request: SearchRequest): string {
  const { q } = request.query;
  return typeof q === "string" ? q.trim().slice(0, MAX_QUERY_LENGTH) : "";
}

function sendHtml(reply: FastifyReply, html: string) {
  return reply.type("text/html; charset=utf-8").send(html);
}

export function createTeamHandlers(store: TeamStore) {
  const listProps = (query: string) => ({ members: store.search(query), query, teamSize: store.size() });

  return {
    /** GET /team — the full page. */
    async showTeamPage(request: SearchRequest, reply: FastifyReply) {
      return sendHtml(reply, renderDocument("Team", teamPage(listProps(readQuery(request)))));
    },

    /** GET /team/members?q= — the member list fragment for live search. */
    async searchMembers(request: SearchRequest, reply: FastifyReply) {
      return sendHtml(reply, render(memberList(listProps(readQuery(request)))));
    },

    /** POST /team/members — responds with the form, plus the refreshed member section out-of-band on success. */
    async inviteMember(request: FastifyRequest, reply: FastifyReply) {
      const values = readInviteValues(request.body);
      const result = validateInvite(values, store);
      if (!result.ok) {
        return sendHtml(reply, render(inviteForm({ values, errors: result.errors })));
      }

      const member = store.invite(result.invite);
      // Clear the search so the new member is guaranteed to show up in the refreshed list.
      const section = membersSection({ ...listProps(""), highlightId: member.id, oob: true });
      const form = inviteForm({ notice: `Invitation sent to ${member.name}.` });
      return sendHtml(reply, render(form) + render(section));
    },
  };
}
