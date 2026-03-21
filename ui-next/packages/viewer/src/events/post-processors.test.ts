import type { Sim } from "@gcsim/types";
import { describe, expect, it } from "vitest";
import { groupByFrame, trackActiveCharacter } from "./post-processors.js";
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

describe("groupByFrame", () => {
  it("returns empty array for empty events", () => {
    expect(groupByFrame([], new Map(), 2)).toEqual([]);
  });

  it("groups events by frame with correct slot assignment", () => {
    const events: SimEvent[] = [
      makeDamage(10, 0), // char 0 → slot 1
      makeDamage(10, 1), // char 1 → slot 2
      makeDamage(20, 0), // char 0 → slot 1
    ];
    const activeMap = new Map<number, number>();
    const groups = groupByFrame(events, activeMap, 2);
    expect(groups).toHaveLength(2);
    expect(groups[0].frame).toBe(10);
    expect(groups[0].slots[1]).toHaveLength(1); // char 0 in slot 1
    expect(groups[0].slots[2]).toHaveLength(1); // char 1 in slot 2
    expect(groups[1].frame).toBe(20);
    expect(groups[1].slots[1]).toHaveLength(1);
  });

  it("places global events (characterIndex -1) in slot 0", () => {
    const events: SimEvent[] = [
      { type: "sim", frame: 5, characterIndex: -1, message: "", raw: dummyRaw },
    ];
    const groups = groupByFrame(events, new Map(), 2);
    expect(groups[0].slots[0]).toHaveLength(1);
  });

  it("resolves active character from swap map", () => {
    const activeMap = new Map([
      [10, 1],
      [30, 0],
    ]);
    const events: SimEvent[] = [makeDamage(10, 1), makeDamage(20, 1), makeDamage(30, 0)];
    const groups = groupByFrame(events, activeMap, 2);
    expect(groups[0].activeCharacter).toBe(1); // frame 10: swap to char 1
    expect(groups[1].activeCharacter).toBe(1); // frame 20: still char 1
    expect(groups[2].activeCharacter).toBe(0); // frame 30: swap to char 0
  });
});
