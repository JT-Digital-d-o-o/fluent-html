// Type-only stand-in for projects.schema.ts (TypeBox is not installed here); the views import only these.
export type ProjectReq = { name: string; description?: string; status: string };
export type ProjectErrors = Partial<Record<keyof ProjectReq, string>>;
