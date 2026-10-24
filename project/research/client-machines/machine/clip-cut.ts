// clip-cut's track scrub as written today, transcribed: it handles down, move and up, and
// treats a cancel like a release at the cancel's point.
import type { Machine } from "./protocol.js";

type S =
  | { tag: "idle"; holds: "none"; at: number }
  | { tag: "scrubbing"; holds: "capture"; at: number };
type Eff = { do: "seek"; at: number } | { do: "capture" };

const SECONDS_PER_PX = 10 / 300;

export const scrub: Machine<S, Eff> = {
  idle: {
    down: (s, e) => [{ tag: "scrubbing", holds: "capture", at: e.x * SECONDS_PER_PX }, [{ do: "capture" }, { do: "seek", at: e.x * SECONDS_PER_PX }]],
    swap: (s) => [s, []],
  },
  scrubbing: {
    move: (s, e) => [{ ...s, at: e.x * SECONDS_PER_PX }, [{ do: "seek", at: e.x * SECONDS_PER_PX }]],
    up: (s) => [{ tag: "idle", holds: "none", at: s.at }, []],
    cancel: (s, e) => [{ tag: "idle", holds: "none", at: e.x * SECONDS_PER_PX }, [{ do: "seek", at: e.x * SECONDS_PER_PX }]],
    swap: (s) => [s, []],
  },
};
