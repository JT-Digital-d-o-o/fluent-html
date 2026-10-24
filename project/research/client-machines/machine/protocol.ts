// The shared browser model: each resource a state holds brings the events it can produce.
// Cancel carries no coordinates (Chromium sends 0, 0).
export type Events = {
  down: { kind: "down"; x: number };
  move: { kind: "move"; x: number };
  up: { kind: "up"; x: number };
  cancel: { kind: "cancel" };
  lostcapture: { kind: "lostcapture" };
  contextmenu: { kind: "contextmenu" };
  escape: { kind: "escape" };
  frame: { kind: "frame"; now: number };
  hidden: { kind: "hidden" };
  swap: { kind: "swap" };
};

export type Resource = "none" | "capture" | "clock";

// RULES is the knob of the experiment: a rule learned once is added here, for every machine.
export type Alphabet<R extends Resource> =
  R extends "capture" ? "move" | "up" | "cancel" | RULES :
  R extends "clock" ? "frame" | "hidden" :
  "down";

type RULES = "lostcapture" | "contextmenu" | "escape";

export type Machine<S extends { tag: string; holds: Resource }, Eff> = {
  [K in S["tag"]]: {
    [E in Alphabet<Extract<S, { tag: K }>["holds"]> | "swap"]:
      (s: Extract<S, { tag: K }>, e: Events[E]) => readonly [S, readonly Eff[]];
  };
};
