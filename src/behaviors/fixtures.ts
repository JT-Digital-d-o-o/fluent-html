/**
 * Mandatory fixtures for the 10 built-ins (ADR-12) — server-only so they never
 * cost runtime-asset bytes. Each fixture is a valid options bag for its verb;
 * the acceptance harness's `matrix()` renders every (verb × fixture) pair and
 * asserts the verb's postcondition under initial load, plain outerHTML swap,
 * and outerMorph.
 *
 * The ids are well-known: the harness scaffolds a target element for each.
 *
 * @module
 */
import { createId } from "../ids.js";

export const fixtureIds = {
  panel: createId("fx-panel"),
  second: createId("fx-second"),
  banner: createId("fx-banner"),
  drawerPanel: createId("fx-drawer"),
  drawerBackdrop: createId("fx-drawer-backdrop"),
  cancel: createId("fx-cancel"),
  search: createId("fx-search"),
} as const;

export const BUILTIN_FIXTURES: Record<string, readonly Record<string, unknown>[]> = {
  toggle: [
    { target: fixtureIds.panel },
    { target: [fixtureIds.panel, fixtureIds.second], display: "flex" },
  ],
  toggleClass: [{ target: fixtureIds.panel, class: "is-active" }],
  remove: [
    { target: fixtureIds.banner },
    { target: { closest: "[role=alert]" } },
  ],
  clipboard: [
    // durationMs is generous: the harness must observe the feedback BEFORE it
    // reverts, and a CI stall on a short window makes those assertions flaky.
    { value: "fixture-value", feedback: { mode: "text", text: "Copied!", durationMs: 800 } },
    { path: "/invite/fixture", feedback: { mode: "class", class: "copied", durationMs: 800 } },
  ],
  drawer: [
    {
      target: fixtureIds.drawerPanel,
      class: "is-open",
      backdrop: fixtureIds.drawerBackdrop,
      bodyClass: "overflow-hidden",
      closeOn: ["escape", "backdrop", "nav"],
      trapFocus: true,
      focusFirst: true,
    },
  ],
  onEscape: [{ action: "click", target: fixtureIds.cancel, scope: "self" }],
  onClickOutside: [{ action: "hide" }],
  resetOnSuccess: [{}],
  back: [{}],
  focus: [{ target: fixtureIds.search }],
};
