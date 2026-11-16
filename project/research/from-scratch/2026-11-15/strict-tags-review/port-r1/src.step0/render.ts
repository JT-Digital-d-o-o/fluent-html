import { mkdirSync, writeFileSync } from "node:fs";
import { cls, h1, h2, p, render, section, type FlowKid } from "strict-tags";
import { orderFixtures, settingsInitial, settingsInvalidBody, settingsValidBody } from "./fixtures.js";
import { orderHandlers, settingsHandlers } from "./handlers.js";
import { Layout } from "./layout.js";
import { DEFAULT_QUERY, OrdersTable, queryOrders } from "./orders.js";
import { SettingsForm, SettingsInput, SettingsScreen, type SettingsFormState } from "./settings.js";

/** One labelled section per state, so a single document shows them side by side. */
const State = (id: string, title: string, note: string, view: FlowKid) =>
  section(
    cls("grid gap-3 border-t border-line pt-6"),
    { "aria-labelledby": id },
    h2(cls("text-xl font-semibold"), { id }, title),
    p(cls("text-sm text-text-dim"), note),
    view,
  );

function check(cond: boolean, what: string) {
  if (!cond) throw new Error(`render: ${what}`);
}

const parsed = SettingsInput.safeParse(settingsInvalidBody);
check(!parsed.success, "the invalid fixture must fail validation");
const errors: NonNullable<SettingsFormState["errors"]> = {};
for (const issue of parsed.error!.issues) {
  const key = String(issue.path[0]) as keyof typeof errors;
  errors[key] ??= issue.message;
}
const invalidState: SettingsFormState = { values: settingsInvalidBody, errors };

const bad = await settingsHandlers("save", { body: settingsInvalidBody });
check(bad.status === 422, `invalid submit answered ${bad.status}, expected 422`);
check(bad.body === render(SettingsForm(invalidState)), "422 body differs from the rendered invalid form");

const saved = SettingsInput.parse(settingsValidBody);
const good = await settingsHandlers("save", { body: settingsValidBody });
check(good.status === 303, `valid submit answered ${good.status}, expected 303`);

const s1 = Layout(
  { title: "Account settings: states" },
  h1(cls("text-2xl font-bold"), "Account settings"),
  State("s1-initial", "Initial", "GET /settings: the saved values.", SettingsScreen(settingsInitial)),
  State(
    "s1-invalid",
    "Invalid submit (422)",
    "POST /settings answered 422; htmx swaps this form region in place with field errors.",
    SettingsScreen({ state: invalidState }),
  ),
  State(
    "s1-success",
    "Valid submit",
    "POST /settings redirected to the page, now carrying a success message.",
    SettingsScreen({ state: { values: saved }, saved: { displayName: saved.displayName } }),
  ),
);

const withRows = queryOrders(orderFixtures, DEFAULT_QUERY);
const empty = queryOrders(orderFixtures, { ...DEFAULT_QUERY, status: "refunded" });
check(withRows.rows.length > 0 && empty.rows.length === 0, "S2 fixtures must give rows and an empty state");

const part = await orderHandlers("table", { input: { status: "refunded" } });
check(part.status === 200 && part.body === render(OrdersTable(empty)), "table part answer differs from the empty state");

const s2 = Layout(
  { title: "Orders: states" },
  h1(cls("text-2xl font-bold"), "Orders"),
  State("s2-rows", "With rows", "GET /orders: newest first, page 1 of the fixtures.", OrdersTable(withRows)),
  State("s2-empty", "Empty state", "GET /orders/table?status=refunded: no order matches the filter.", OrdersTable(empty)),
);

mkdirSync("out", { recursive: true });
writeFileSync("out/s1.html", render(s1));
writeFileSync("out/s2.html", render(s2));
console.log("wrote out/s1.html and out/s2.html");
