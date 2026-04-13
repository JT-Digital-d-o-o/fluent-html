# Fastify Guidelines

Fastify v5 + TypeScript, SSR via fluent-html, HTMX for interactivity, Prisma ORM.

## Project Structure

```
src/
  core/
    server.ts          # Fastify instance, plugin registration
    index.ts           # Route registration, error handler, startup
    config.ts          # Environment variable validation
    types.ts           # Shared types + module augmentation
    plugins/           # Core plugins (prisma, logger)
  [feature]/
    [feature].routes.ts       # Route definitions (defineRoutes + ids)
    [feature].controller.ts   # Request handlers
    [feature].schema.ts       # JSON Schema + TS interfaces
    [feature].utils.ts        # Helpers
    views/                    # One file per page/endpoint response
  shared/
    components/        # Reusable view components
    helpers.ts         # Shared utilities
```

## Route Controllers

Export a default async function receiving `FastifyInstance`. Use the `handle` helper to bind routes — it connects directly to `defineRoutes` route refs.

**Naming convention:** `httpVerb` + `SemanticName` in camelCase. This makes VS Code `@` symbol search work by both method and meaning:

```typescript
export default async function routes(server: FastifyInstance) {
  const getFeatureList = handle(server, featureRoutes.list, async (_request, reply) => {
    reply.renderView(FeatureListView());
  });

  const postFeature = handle(server, featureRoutes.create,
    { schema: createSchema },
    async (request: FastifyRequest<{ Body: CreateReq }>, reply) => {
      const { name, email } = request.body;
      // ...
      reply.redirect(featureRoutes.list.resolve());
    },
  );
}
```

Register in `src/core/index.ts`:
```typescript
server.register(require("../feature/feature.controller"), { prefix: "/feature" });
```

## Module Augmentation

Extend Fastify types in `src/core/types.ts` (uses `interface`, not `type`):

```typescript
declare module "fastify" {
  interface FastifyInstance { prisma: PrismaClient; }
  interface FastifyRequest { user: AuthUser | null; }
  interface FastifyReply { renderView(view?: View): void; }
}
```

## Validation Schemas

```typescript
interface CreateUserReq {
  email: string;
  name: string;
}

export const createUserSchema = {
  body: {
    type: "object" as const,  // always `as const`!
    required: ["email", "name"],
    properties: {
      email: { type: "string" as const },
      name: { type: "string" as const, minLength: 1 },
    },
  },
};
```

Combine schemas with spread: `{ ...paramsSchema, body: { ... } }`

**Type-safe form fields** — use `formFor<T>()` to bind field names to the schema interface:

```typescript
const f = formFor<CreateUserReq>();

// f.input("nmae", "text")  // ✗ compile error — typo caught
f.input("name", "text")     // ✓ matches schema key
f.input("email", "email")   // ✓
```

## Auth Guards

```typescript
const getDashboard = handle(server, dashboardRoutes.index,
  { preHandler: [requireAuth] },
  async (request, reply) => {
    const user = request.user!; // safe after requireAuth
  },
);

const getAdmin = handle(server, adminRoutes.index,
  { preHandler: [requireRole("ADMIN")] },
  handler,
);
```

`request.user` is populated by a global preHandler from signed cookies. `null` for unauthenticated.

## Plugins

```typescript
import fp from "fastify-plugin";

export default fp(async (fastify: FastifyInstance) => {
  const client = new SomeClient();
  fastify.decorate("clientName", client);
  fastify.addHook("onClose", async () => await client.disconnect());
}, { name: "myPlugin" });
```

Register in `src/core/server.ts` before routes.

## Error Handling

SSR app — re-render views with errors, never send JSON:

```typescript
const existing = await server.prisma.user.findUnique({ where: { email } });
if (existing) {
  return reply.code(422).renderView(RegisterView({ error: "Email already in use" }));
}
```

Global error handler in `src/core/index.ts` is the safety net.

## Testing

```typescript
import { describe, it, expect } from "vitest";

it("should create a resource", async () => {
  const response = await server.inject({
    method: "POST",
    url: "/feature/create",
    payload: { name: "Test" },
  });
  expect(response.statusCode).toBe(302);
});
```
