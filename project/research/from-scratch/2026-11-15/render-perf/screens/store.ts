import type { Job, Project } from "./projects.views.ts";

const rows: Project[] = [
  { id: 1, name: "Atlas <migration>", owner: "ana@example.com", status: "active" },
  { id: 2, name: "Billing & invoices", owner: "bor@example.com", status: "paused" },
];
let tick = 0;

export const search = (q?: string | null): Project[] => (q ? rows.filter((r) => r.name.toLowerCase().includes(q.toLowerCase())) : rows);
export const get = (id: number): Project => rows.find((r) => r.id === id)!;
export const nameTaken = (name: string): boolean => rows.some((r) => r.name === name);
export const create = (p: { name: string; ownerEmail: string; status: "active" | "paused" }): Project => {
  const row = { id: rows.length + 1, name: p.name, owner: p.ownerEmail, status: p.status };
  rows.push(row);
  return row;
};
export const remove = (id: number): void => void rows.splice(rows.findIndex((r) => r.id === id), 1);
export const job = (_id: number): Job => (tick++ < 1 ? { state: "running", progress: 40 } : { state: "done", progress: 100 });
