import { Type, type Static } from "@sinclair/typebox";

export const CreateProjectBody = Type.Object({
  name: Type.String({ minLength: 3, maxLength: 80 }),
  ownerEmail: Type.String({ format: "email" }),
  status: Type.Union([Type.Literal("active"), Type.Literal("paused")]),
  notes: Type.Optional(Type.String({ maxLength: 500 })),
});
export type CreateProjectReq = Static<typeof CreateProjectBody>;

const ListQuerystring = Type.Object({ q: Type.Optional(Type.String()) });
export const listQuerySchema = { querystring: ListQuerystring };

const IdParams = Type.Object({ id: Type.Number() });
export const idParamsSchema = { params: IdParams };
