#!/bin/sh
# Writes the neutral references: every S1 (settings form) and S2 (orders table: status filter, sort, pager) trace
# replaced by an unrelated noun, the API shown unchanged.   sh neutralize.sh <scratchpad>
set -eu
G=$(cd "$(dirname "$0")" && pwd); B=$(cd "$G/.." && pwd); S="$1"
mkdir -p "$G/neutral/strict-tags" "$G/neutral/control"
sed -e 's|select({ "aria-label": "Status" }, orders.table().change("status"), option(…))|select({ "aria-label": "Team" }, people.grid().change("team"), option(…))|' \
    -e 's#`a(orders.list({ sort }), orders.table({ sort }).load(), "Date")` | a real link that swaps only the part (sort links, pagers) |#`a(people.list({ team }), people.grid({ team }).load(), "Design")` | a real link that swaps only the part |#' \
    "$B/proto-correct-by-construction/REFERENCE.md" > "$G/neutral/strict-tags/REFERENCE.md"
sed -e 's|f.checkbox("notify")              // ✓ checked = Boolean(state.values.notify)|f.checkbox("terms")               // ✓ checked = Boolean(state.values.terms)|' \
    -e 's|f.input("notify", "checkbox")     // ✗|f.input("terms", "checkbox")      // ✗|' \
    "$S/fs-trial/control-r1/docs/fluent-html.md" > "$G/neutral/control/fluent-html.md"
sed -e 's|export const orderRoutes = defineRoutes("/orders", {|export const ticketRoutes = defineRoutes("/tickets", {|' \
    -e 's|byStatus: { method: "get", path: "/:status", params: { status: \["open", "paid", "void"\] as const } },|byState: { method: "get", path: "/:state", params: { state: ["new", "assigned", "closed"] as const } },|' \
    -e 's|orderRoutes.byStatus.resolve({ status: "open" })     // ✓ one of "open" \| "paid" \| "void"|ticketRoutes.byState.resolve({ state: "new" })        // ✓ one of "new" \| "assigned" \| "closed"|' \
    -e 's|orderRoutes.byStatus.resolve({ status: "shipped" })  // ✗|ticketRoutes.byState.resolve({ state: "archived" })   // ✗|' \
    -e 's|userRoutes.list.resolve({ page: "2", sort: "name" }))           // "/users?page=2\&sort=name"|userRoutes.list.resolve({ q: "ada", role: "admin" }))         // "/users?q=ada\&role=admin"|' \
    -e 's|Button("Page 2").setHtmx(userRoutes.list({ query: { page: "2" } }))|Button("Admins").setHtmx(userRoutes.list({ query: { role: "admin" } }))|' \
    -e 's|const url = route.resolve() + `?page=${page}`;                                                    // ✗ use resolve({ page })|const url = route.resolve() + `?role=${role}`;                                                    // ✗ use resolve({ role })|' \
    -e 's|A("Settings").nav(settingsRoutes.index())|A("Help").nav(helpRoutes.index())|' \
    -e 's|A("Page 2").nav(userRoutes.list({ vals: { page: "2" } }))|A("Admins").nav(userRoutes.list({ vals: { role: "admin" } }))|' \
    -e 's|f.select("status", STATUS_OPTIONS).onChange(paymentRoutes.admin())|f.select("method", METHOD_OPTIONS).onChange(paymentRoutes.admin())|' \
    "$S/fs-trial/control-r1/docs/htmx.md" > "$G/neutral/control/htmx.md"
