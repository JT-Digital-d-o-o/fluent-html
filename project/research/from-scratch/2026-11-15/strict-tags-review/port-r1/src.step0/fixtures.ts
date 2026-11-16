import type { Order } from "./orders.js";
import type { SettingsProps } from "./settings.js";

// ───────────── S1: account settings ─────────────

export const settingsInitial: SettingsProps = {
  state: { values: { displayName: "Ana Novak", timezone: "Europe/Ljubljana", emailNotifications: true } },
};

/** The raw body of an invalid submit: too-short name, unknown timezone, checkbox unticked. */
export const settingsInvalidBody = { displayName: " A ", timezone: "Mars/Olympus_Mons" };

/** The raw body of a valid submit (checkbox posts "on"). */
export const settingsValidBody = { displayName: "Ana N.", timezone: "Europe/London", emailNotifications: "on" };

// ───────────── S2: orders ─────────────

export const orderFixtures: readonly Order[] = [
  { id: 1, number: "SD-1001", customer: "Maja Kovač", placedOn: "2026-10-02", totalCents: 4990, status: "shipped" },
  { id: 2, number: "SD-1002", customer: "Luka Horvat", placedOn: "2026-10-04", totalCents: 12850, status: "paid" },
  { id: 3, number: "SD-1003", customer: "Eva Zupan", placedOn: "2026-10-07", totalCents: 2300, status: "pending" },
  { id: 4, number: "SD-1004", customer: "Nik Krajnc", placedOn: "2026-10-11", totalCents: 8999, status: "shipped" },
  { id: 5, number: "SD-1005", customer: "Sara Potočnik", placedOn: "2026-10-15", totalCents: 15400, status: "paid" },
  { id: 6, number: "SD-1006", customer: "Jan Mlakar", placedOn: "2026-10-19", totalCents: 3150, status: "pending" },
  { id: 7, number: "SD-1007", customer: "Tina Vidmar", placedOn: "2026-10-23", totalCents: 7420, status: "shipped" },
  { id: 8, number: "SD-1008", customer: "Žan Kos", placedOn: "2026-10-28", totalCents: 19990, status: "paid" },
  { id: 9, number: "SD-1009", customer: "Nina Golob", placedOn: "2026-11-02", totalCents: 5600, status: "pending" },
  { id: 10, number: "SD-1010", customer: "Rok Turk", placedOn: "2026-11-06", totalCents: 990, status: "shipped" },
  { id: 11, number: "SD-1011", customer: "Ana Božič", placedOn: "2026-11-09", totalCents: 24500, status: "paid" },
  { id: 12, number: "SD-1012", customer: "Matej Kralj", placedOn: "2026-11-12", totalCents: 6375, status: "pending" },
];
// No fixture order is "refunded": filtering by it shows the empty state.
