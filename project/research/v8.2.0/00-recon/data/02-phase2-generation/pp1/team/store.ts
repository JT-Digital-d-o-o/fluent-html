import { randomUUID } from "node:crypto";

export const ROLES = ["owner", "admin", "member"] as const;
export type Role = (typeof ROLES)[number];
export type MemberStatus = "active" | "invited";

export interface Member {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly role: Role;
  readonly status: MemberStatus;
}

export type NewMember = Pick<Member, "name" | "email" | "role">;

export interface TeamStore {
  list(): Member[];
  search(query: string): Member[];
  size(): number;
  hasEmail(email: string): boolean;
  invite(member: NewMember): Member;
}

const normalizeEmail = (email: string) => email.trim().toLowerCase();

export function createTeamStore(seed: readonly Omit<Member, "id">[] = []): TeamStore {
  const members: Member[] = seed.map((member) => ({
    ...member,
    id: randomUUID(),
    email: normalizeEmail(member.email),
  }));

  const hasEmail = (email: string) => {
    const normalized = normalizeEmail(email);
    return members.some((member) => member.email === normalized);
  };

  return {
    list: () => [...members],
    size: () => members.length,
    search(query) {
      const needle = query.trim().toLowerCase();
      if (!needle) return [...members];
      return members.filter(
        (member) => member.name.toLowerCase().includes(needle) || member.email.includes(needle),
      );
    },
    hasEmail,
    invite({ name, email, role }) {
      // Validation checks this too; enforcing it here keeps the store consistent if it's called directly.
      if (hasEmail(email)) throw new Error(`${email} is already on the team`);
      const member: Member = {
        id: randomUUID(),
        name: name.trim(),
        email: normalizeEmail(email),
        role,
        status: "invited",
      };
      members.push(member);
      return member;
    },
  };
}

/** The feature's in-memory team. Resets whenever the server restarts. */
export const teamStore = createTeamStore([
  { name: "Ana Novak", email: "ana.novak@example.com", role: "owner", status: "active" },
  { name: "Luka Horvat", email: "luka.horvat@example.com", role: "admin", status: "active" },
  { name: "Maja Kos", email: "maja.kos@example.com", role: "member", status: "invited" },
]);
