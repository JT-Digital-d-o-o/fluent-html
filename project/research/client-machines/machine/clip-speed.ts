// clip-speed's ruler drag, transcribed: down snaps, move snaps, up ends. Nothing else.
import type { Machine } from "./protocol.js";

type S =
  | { tag: "idle"; holds: "none"; speed: number }
  | { tag: "dragging"; holds: "capture"; speed: number; from: number };
type Eff = { do: "pick"; speed: number };

const snap = (x: number) => [0.5, 1, 1.5, 2][Math.round((x / 300) * 3)] ?? 1;

export const ruler: Machine<S, Eff> = {
  idle: {
    down: (s, e) => [{ tag: "dragging", holds: "capture", speed: snap(e.x), from: s.speed }, [{ do: "pick", speed: snap(e.x) }]],
    swap: (s) => [s, []],
  },
  dragging: {
    move: (s, e) => [{ ...s, speed: snap(e.x) }, [{ do: "pick", speed: snap(e.x) }]],
    up: (s) => [{ tag: "idle", holds: "none", speed: s.speed }, []],
    swap: (s) => [s, []],
  },
};
