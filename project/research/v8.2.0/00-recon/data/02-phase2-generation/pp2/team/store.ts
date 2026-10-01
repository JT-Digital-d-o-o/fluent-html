export const ROLES = ["owner", "admin", "member"] as const;

export type MemberRole = (typeof ROLES)[number];
export type MemberStatus = "active" | "invited";

export interface Member {
  name: string;
  email: string;
  role: MemberRole;
  status: MemberStatus;
}

export type NewMember = Pick<Member, "name" | "email" | "role">;

// In-memory only: resets on restart and is shared by every signed-in user.
const members: Member[] = [
  { name: "Ana Kovač", email: "ana.kovac@example.com", role: "owner", status: "active" },
  { name: "Luka Novak", email: "luka.novak@example.com", role: "admin", status: "active" },
  { name: "Maja Horvat", email: "maja.horvat@example.com", role: "member", status: "invited" },
];

export function countMembers(): number {
  return members.length;
}

/** Members whose name or email contains `query`, case-insensitively. An empty query matches everyone. */
export function searchMembers(query: string): Member[] {
  const needle = query.trim().toLowerCase();
  return members.filter(
    (member) =>
      member.name.toLowerCase().includes(needle) || member.email.toLowerCase().includes(needle),
  );
}

export function findMemberByEmail(email: string): Member | undefined {
  const needle = email.trim().toLowerCase();
  return members.find((member) => member.email.toLowerCase() === needle);
}

export function addInvitedMember(invite: NewMember): Member {
  const member: Member = { ...invite, status: "invited" };
  members.push(member);
  return member;
}
