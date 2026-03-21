import type { Sim } from "@gcsim/types";
import { describe, expect, it } from "vitest";
import { trackActiveCharacter } from "./post-processors.js";
import type { ActionEvent, SimEvent } from "./types.js";

const dummyRaw: Sim.LogDetails = {
  char_index: 0,
  ended: 0,
  event: "",
  frame: 0,
  msg: "",
  logs: {},
};

function makeAction(frame: number, action: string, charIndex: number, target = ""): ActionEvent {
  return {
    type: "action",
    frame,
    characterIndex: charIndex,
    message: "",
    raw: dummyRaw,
    action,
    target,
  };
}

function makeDamage(frame: number, charIndex: number): SimEvent {
  return {
    type: "damage",
    frame,
    characterIndex: charIndex,
    message: "",
    raw: dummyRaw,
    damage: 100,
    crit: false,
    amp: "",
    cata: "",
    target: "",
  };
}

describe("trackActiveCharacter", () => {
  it("returns empty map for empty events", () => {
    expect(trackActiveCharacter([])).toEqual(new Map());
  });

  it("tracks swap events", () => {
    const events: SimEvent[] = [
      makeAction(10, "swap", 1, "xingqiu"),
      makeDamage(20, 1),
      makeAction(50, "swap", 0, "hutao"),
    ];
    const map = trackActiveCharacter(events);
    expect(map.get(10)).toBe(1);
    expect(map.get(50)).toBe(0);
    expect(map.size).toBe(2);
  });

  it("ignores non-swap actions", () => {
    const events: SimEvent[] = [makeAction(10, "attack", 0), makeAction(20, "skill", 0)];
    const map = trackActiveCharacter(events);
    expect(map.size).toBe(0);
  });
});
