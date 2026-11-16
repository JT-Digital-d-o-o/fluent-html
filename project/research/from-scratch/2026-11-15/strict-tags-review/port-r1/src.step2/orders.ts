import {
  a, button, cls, div, focusVisible, form, h1, h2, hover, input, label, li, nav, option, p, page, part, routes, section, select, span,
  table, tbody, td, th, thead, time, tr, ul, type Cls, type PhrasingKid,
} from "strict-tags";
import { Layout, card, control, secondaryButton } from "./layout.js";


export const ORDER_STATUSES = ["pending", "paid", "shipped", "refunded"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export interface Order {
  id: number;
  number: string;
  customer: string;
  /** ISO date, YYYY-MM-DD. */
  placedOn: string;
  /** Minor units (cents). */
  totalCents: number;
  status: OrderStatus;
}

export const SORT_KEYS = ["number", "customer", "placedOn", "totalCents", "status"] as const;
export type SortKey = (typeof SORT_KEYS)[number];
export type SortDir = "asc" | "desc";
export type StatusFilter = OrderStatus | "all";

export interface OrdersQuery {
  sort: SortKey;
  dir: SortDir;
  status: StatusFilter;
  page: number;
}

export const DEFAULT_QUERY: OrdersQuery = { sort: "placedOn", dir: "desc", status: "all", page: 1 };
export const PAGE_SIZE = 5;

/** The table region's props: one page of rows plus the query that produced it. */
export interface OrdersTableProps {
  rows: readonly Order[];
  query: OrdersQuery;
  /** Orders matching the filter, across all pages. */
  matching: number;
  pageCount: number;
  pageSize: number;
}

// ───────────── routes ─────────────

const QueryShape = { sort: "string?", dir: "string?", status: "string?", page: "number?" } as const;

export const orders = routes("/orders", {
  list: page("/", QueryShape),
  table: part("orders-table", "/table", QueryShape),
});

type RawQuery = { sort?: string; dir?: string; status?: string; page?: number };

/** Untrusted query strings to a typed query; anything unknown falls back to the default. */
export function parseQuery(raw: RawQuery): OrdersQuery {
  const sort = SORT_KEYS.find((k) => k === raw.sort) ?? DEFAULT_QUERY.sort;
  const dir: SortDir = raw.dir === "asc" || raw.dir === "desc" ? raw.dir : DEFAULT_QUERY.dir;
  const status = ORDER_STATUSES.find((s) => s === raw.status) ?? "all";
  const pageNo = Number.isInteger(raw.page) && raw.page! > 0 ? raw.page! : 1;
  return { sort, dir, status, page: pageNo };
}

/** Filter, sort and paginate. Pure: the server and render.ts both use it. */
export function queryOrders(all: readonly Order[], query: OrdersQuery, pageSize = PAGE_SIZE): OrdersTableProps {
  const filtered = query.status === "all" ? [...all] : all.filter((o) => o.status === query.status);
  const sign = query.dir === "asc" ? 1 : -1;
  filtered.sort((x, y) => {
    const a = x[query.sort];
    const b = y[query.sort];
    const c = typeof a === "number" && typeof b === "number" ? a - b : String(a).localeCompare(String(b));
    return c === 0 ? x.id - y.id : c * sign;
  });
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageNo = Math.min(query.page, pageCount);
  return {
    rows: filtered.slice((pageNo - 1) * pageSize, pageNo * pageSize),
    query: { ...query, page: pageNo },
    matching: filtered.length,
    pageCount,
    pageSize,
  };
}

// ───────────── views ─────────────

const COLUMNS: Record<SortKey, string> = {
  number: "Order",
  customer: "Customer",
  placedOn: "Placed",
  totalCents: "Total",
  status: "Status",
};

const STATUS_LABEL: Record<OrderStatus, string> = { pending: "Pending", paid: "Paid", shipped: "Shipped", refunded: "Refunded" };
const STATUS_TONE: Record<OrderStatus, Cls> = {
  pending: cls("border-warning text-warning"),
  paid: cls("border-primary text-primary"),
  shipped: cls("border-success text-success"),
  refunded: cls("border-line text-text-dim"),
};

const money = new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR" });
const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

/** The URL parameters of a query, defaults left out so links stay short. */
const params = (q: OrdersQuery) => ({
  sort: q.sort === DEFAULT_QUERY.sort ? undefined : q.sort,
  dir: q.dir === DEFAULT_QUERY.dir ? undefined : q.dir,
  status: q.status === "all" ? undefined : q.status,
  page: q.page === 1 ? undefined : q.page,
});

/** A real link to the page that swaps only the table region. */
const regionLink = (q: OrdersQuery, look: Cls, kids: PhrasingKid<"text">, attrs: { "aria-label"?: string } = {}) =>
  a(orders.list(params(q)), orders.table(params(q)).load(), look, attrs, kids);

const SortHeader = (key: SortKey, q: OrdersQuery) => {
  const active = q.sort === key;
  const next: OrdersQuery = { ...q, sort: key, dir: active && q.dir === "asc" ? "desc" : "asc", page: 1 };
  const arrow = active ? (q.dir === "asc" ? "▲" : "▼") : "↕";
  return th(
    cls("px-4 py-3 text-left font-semibold"),
    { scope: "col", "aria-sort": active ? (q.dir === "asc" ? "ascending" : "descending") : "none" },
    regionLink(
      next,
      cls("inline-flex items-center gap-1 rounded-control", hover("text-primary"), focusVisible("outline-2 outline-primary")),
      [
        COLUMNS[key],
        span(cls("text-xs text-text-dim"), { "aria-hidden": "true" }, arrow),
        span(cls("sr-only"), `, sort ${next.dir === "asc" ? "ascending" : "descending"}`),
      ],
    ),
  );
};

const StatusBadge = (s: OrderStatus) =>
  span(cls("inline-flex rounded-full border px-2 py-0.5 text-xs font-medium"), STATUS_TONE[s], STATUS_LABEL[s]);

const OrderRow = (o: Order) =>
  tr(
    cls("border-t border-line", hover("bg-surface-2")),
    th(cls("px-4 py-3 text-left font-mono font-medium"), { scope: "row" }, o.number),
    td(cls("px-4 py-3"), o.customer),
    td(cls("px-4 py-3"), time({ datetime: o.placedOn }, dateFmt.format(new Date(o.placedOn)))),
    td(cls("px-4 py-3 text-right tabular-nums"), money.format(o.totalCents / 100)),
    td(cls("px-4 py-3"), StatusBadge(o.status)),
  );

const Filter = (q: OrdersQuery) =>
  form(
    orders.list(),
    cls("flex flex-wrap items-end gap-3"),
    { role: "search", "aria-label": "Filter orders" },
    q.sort !== DEFAULT_QUERY.sort && input({ type: "hidden", name: "sort", value: q.sort }),
    q.dir !== DEFAULT_QUERY.dir && input({ type: "hidden", name: "dir", value: q.dir }),
    label(
      cls("grid gap-1 text-sm font-medium"),
      "Status",
      select(
        control,
        cls("w-48"),
        orders.table().change("status"),
        option({ value: "all", selected: q.status === "all" }, "All statuses"),
        ORDER_STATUSES.map((s) => option({ value: s, selected: q.status === s }, STATUS_LABEL[s])),
      ),
    ),
    button(secondaryButton, { type: "submit" }, "Apply"),
  );

const Pagination = (props: OrdersTableProps) => {
  const { query: q, pageCount } = props;
  const pages = Array.from({ length: pageCount }, (_, i) => i + 1);
  const step = cls("rounded-control border border-line px-3 py-1.5 text-sm", hover("bg-surface-2"));
  const disabled = cls("rounded-control border border-line px-3 py-1.5 text-sm text-text-dim");
  return nav(
    cls("flex items-center justify-between gap-4"),
    { "aria-label": "Orders pagination" },
    p(cls("text-sm text-text-dim"), `Page ${q.page} of ${pageCount}`),
    ul(
      cls("flex items-center gap-1"),
      li(q.page > 1 ? regionLink({ ...q, page: q.page - 1 }, step, "Previous") : span(disabled, { "aria-disabled": "true" }, "Previous")),
      pages.map((n) =>
        li(
          n === q.page
            ? span(cls("rounded-control bg-primary px-3 py-1.5 text-sm font-semibold text-on-accent"), { "aria-current": "page" }, String(n))
            : regionLink({ ...q, page: n }, step, String(n), { "aria-label": `Page ${n}` }),
        ),
      ),
      li(q.page < pageCount ? regionLink({ ...q, page: q.page + 1 }, step, "Next") : span(disabled, { "aria-disabled": "true" }, "Next")),
    ),
  );
};

const EmptyState = (q: OrdersQuery) =>
  div(
    cls("grid justify-items-center gap-2 rounded-card border border-dashed border-line p-10 text-center"),
    { role: "status" },
    h2(cls("text-lg font-semibold"), "No orders match"),
    p(
      cls("text-sm text-text-dim"),
      q.status === "all" ? "There are no orders yet." : `No order has the status “${STATUS_LABEL[q.status]}”.`,
    ),
    q.status !== "all" && regionLink({ ...q, status: "all", page: 1 }, secondaryButton, "Show all orders"),
  );

/** S2's swappable region: filter, table (or empty state) and pagination. Carries the part's root id. */
export const OrdersTable = (props: OrdersTableProps) => {
  const q = props.query;
  const first = (q.page - 1) * props.pageSize + 1;
  const last = first + props.rows.length - 1;
  return section(
    orders.table().root,
    card,
    cls("grid gap-4"),
    { "aria-labelledby": "orders-table-title" },
    div(
      cls("flex flex-wrap items-end justify-between gap-4"),
      h2(cls("text-lg font-semibold"), { id: "orders-table-title" }, "Order list"),
      Filter(q),
    ),
    p(
      cls("text-sm text-text-dim"),
      { id: "orders-summary", "aria-live": "polite" },
      props.matching === 0 ? "0 orders" : `Showing ${first}–${last} of ${props.matching} orders`,
    ),
    props.rows.length === 0
      ? EmptyState(q)
      : [
          div(
            cls("overflow-x-auto"),
            table(
              cls("w-full text-sm"),
              { "aria-labelledby": "orders-table-title", "aria-describedby": "orders-summary" },
              thead(cls("bg-surface-2"), tr(SORT_KEYS.map((k) => SortHeader(k, q)))),
              tbody(props.rows.map(OrderRow)),
            ),
          ),
          Pagination(props),
        ],
  );
};

export const OrdersPage = (props: OrdersTableProps) =>
  Layout({ title: "Orders" }, h1(cls("text-2xl font-bold"), "Orders"), OrdersTable(props));
