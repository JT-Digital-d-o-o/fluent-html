import { handlers } from "strict-tags";
import { orderFixtures } from "./fixtures.js";
import { OrdersPage, OrdersTable, orders, parseQuery, queryOrders } from "./orders.js";
import { SettingsForm, SettingsPage, settings, type Settings } from "./settings.js";

/** In-memory store standing in for a database. */
let current: Settings = { displayName: "Ana Novak", timezone: "Europe/Ljubljana", emailNotifications: true };

export const settingsHandlers = handlers(settings, {
  show: ({ input }) => SettingsPage({ state: { values: current }, saved: input.saved ? { displayName: current.displayName } : undefined }),
  save: {
    form: SettingsForm,
    ok: ({ body, invalid, redirect }) => {
      if (body.displayName.toLowerCase() === "admin") return invalid({ displayName: "That display name is reserved." });
      current = { ...body, emailNotifications: body.emailNotifications ?? false };
      return redirect(settings.show({ saved: true }));
    },
  },
});

export const orderHandlers = handlers(orders, {
  list: ({ input }) => OrdersPage(queryOrders(orderFixtures, parseQuery(input))),
  table: ({ input }) => OrdersTable(queryOrders(orderFixtures, parseQuery(input))),
});
