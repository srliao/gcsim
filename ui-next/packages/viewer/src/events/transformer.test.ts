import type { Sim } from "@gcsim/types";
import { describe, expect, it } from "vitest";
import { transformEvents } from "./transformer.js";
import type { DamageEvent, GenericEvent } from "./types.js";

function makeLog(overrides: Partial<Sim.LogDetails>): Sim.LogDetails {
  return {
    char_index: 0,
    ended: 0,
    event: "damage",
    frame: 60,
    msg: "test",
    logs: {},
    ...overrides,
  };
}

describe("transformEvents", () => {
  it("returns empty array for empty input", () => {
    expect(transformEvents([])).toEqual([]);
  });

  it("transforms each log entry", () => {
    const logs = [
      makeLog({ event: "damage", logs: { damage: 100 } }),
      makeLog({ event: "action", msg: "executed attack", logs: { action: "attack" } }),
    ];
    const result = transformEvents(logs);
    expect(result).toHaveLength(2);
    expect(result[0].type).toBe("damage");
    expect(result[1].type).toBe("action");
  });
});

describe("transformDamage", () => {
  it("extracts damage fields", () => {
    const log = makeLog({
      event: "damage",
      frame: 120,
      char_index: 1,
      msg: "normal attack hit",
      logs: { damage: 1234.56, crit: true, amp: "1.5x", cata: "", target: "enemy0" },
    });
    const result = transformEvents([log])[0] as DamageEvent;
    expect(result.type).toBe("damage");
    expect(result.damage).toBeCloseTo(1234.56);
    expect(result.crit).toBe(true);
    expect(result.amp).toBe("1.5x");
    expect(result.cata).toBe("");
    expect(result.target).toBe("enemy0");
    expect(result.frame).toBe(120);
    expect(result.characterIndex).toBe(1);
  });

  it("formats message with damage amount and extras", () => {
    const log = makeLog({
      event: "damage",
      msg: "normal attack hit",
      logs: { damage: 1234.56, crit: true, amp: "1.5x", cata: "", target: "enemy0" },
    });
    const result = transformEvents([log])[0] as DamageEvent;
    expect(result.message).toContain("1,235");
    expect(result.message).toContain("1.5x");
    expect(result.message).toContain("crit");
  });

  it("formats message without extras when none present", () => {
    const log = makeLog({
      event: "damage",
      msg: "hit",
      logs: { damage: 500, crit: false, target: "enemy0" },
    });
    const result = transformEvents([log])[0] as DamageEvent;
    expect(result.message).toContain("500");
    expect(result.message).not.toContain("crit");
  });
});

describe("sortLogsByOrdering", () => {
  it("preserves log field order when ordering is present", () => {
    const log = makeLog({
      event: "damage",
      logs: { target: "enemy0", damage: 100, crit: true },
      ordering: { damage: 0, crit: 1, target: 2 },
    });
    const result = transformEvents([log])[0];
    const rawKeys = Object.keys(result.raw.logs);
    expect(rawKeys.indexOf("damage")).toBeLessThan(rawKeys.indexOf("target"));
  });

  it("passes through unchanged when no ordering", () => {
    const log = makeLog({
      event: "damage",
      logs: { damage: 100, crit: false },
    });
    const result = transformEvents([log])[0];
    expect(result.type).toBe("damage");
  });
});

describe("transformGeneric (unknown event types)", () => {
  it("falls back to GenericEvent for unknown types", () => {
    const log = makeLog({
      event: "hook",
      msg: "hook added",
      logs: { key: "some-hook" },
    });
    const result = transformEvents([log])[0] as GenericEvent;
    expect(result.type).toBe("generic");
    expect(result.originalType).toBe("hook");
    expect(result.logs).toEqual({ key: "some-hook" });
    expect(result.message).toContain("hook");
  });
});

describe("transformEnergy", () => {
  it("handles particle events", () => {
    const log = makeLog({
      event: "energy",
      msg: "particle landed",
      logs: { source: "skill", amt: 3, post_recovery: 45, max_energy: 70 },
    });
    const result = transformEvents([log])[0];
    expect(result.type).toBe("energy");
    if (result.type === "energy") {
      expect(result.energyType).toBe("particle");
      expect(result.amount).toBe(3);
      expect(result.source).toBe("skill");
      expect(result.message).toContain("particle");
      expect(result.message).toContain("skill");
      expect(result.message).toContain("45");
    }
  });

  it("handles flat energy events", () => {
    const log = makeLog({
      event: "energy",
      msg: "adding energy",
      logs: { source: "burst", "rec'd": 12.5, post_recovery: 62.5, max_energy: 70 },
    });
    const result = transformEvents([log])[0];
    expect(result.type).toBe("energy");
    if (result.type === "energy") {
      expect(result.energyType).toBe("flat");
      expect(result.amount).toBeCloseTo(12.5);
      expect(result.message).toContain("12.50");
    }
  });

  it("appends (max) when at max energy", () => {
    const log = makeLog({
      event: "energy",
      msg: "adding energy",
      logs: { source: "burst", "rec'd": 10, post_recovery: 70, max_energy: 70 },
    });
    const result = transformEvents([log])[0];
    if (result.type === "energy") {
      expect(result.message).toContain("(max)");
    }
  });
});

describe("transformStatus", () => {
  it("extracts key and duration", () => {
    const log = makeLog({
      event: "status",
      frame: 100,
      ended: 400,
      msg: "added",
      logs: { key: "pyro-res-shred" },
    });
    const result = transformEvents([log])[0];
    expect(result.type).toBe("status");
    if (result.type === "status") {
      expect(result.key).toBe("pyro-res-shred");
      expect(result.addedFrame).toBe(100);
      expect(result.endedFrame).toBe(400);
      expect(result.message).toContain("pyro-res-shred");
      expect(result.message).toContain("400");
    }
  });

  it("leaves addedFrame/endedFrame undefined when no duration", () => {
    const log = makeLog({
      event: "status",
      frame: 100,
      ended: 0,
      msg: "checked",
      logs: { key: "some-status" },
    });
    const result = transformEvents([log])[0];
    if (result.type === "status") {
      expect(result.addedFrame).toBeUndefined();
      expect(result.endedFrame).toBeUndefined();
    }
  });
});

describe("transformElement", () => {
  it("handles application with aura state", () => {
    const log = makeLog({
      event: "element",
      msg: "application",
      logs: {
        applied_ele: "pyro",
        existing: ["hydro: 40.0"],
        after: ["pyro: 20.0"],
        target: "enemy0",
      },
    });
    const result = transformEvents([log])[0];
    expect(result.type).toBe("element");
    if (result.type === "element") {
      expect(result.elementSubtype).toBe("application");
      expect(result.appliedElement).toBe("pyro");
      expect(result.message).toContain("pyro applied");
      expect(result.message).toContain("hydro (40.0)");
    }
  });

  it("handles expired", () => {
    const log = makeLog({
      event: "element",
      msg: "expired",
      logs: { old_ele: "cryo", target: "enemy0" },
    });
    const result = transformEvents([log])[0];
    if (result.type === "element") {
      expect(result.elementSubtype).toBe("expired");
      expect(result.oldElement).toBe("cryo");
      expect(result.message).toContain("cryo expired");
    }
  });

  it("handles refreshed", () => {
    const log = makeLog({
      event: "element",
      msg: "refreshed",
      logs: { ele: "electro", target: "enemy0" },
    });
    const result = transformEvents([log])[0];
    if (result.type === "element") {
      expect(result.elementSubtype).toBe("refreshed");
      expect(result.refreshedElement).toBe("electro");
    }
  });

  it("falls back to other for unknown element messages", () => {
    const log = makeLog({
      event: "element",
      msg: "some new thing",
      logs: { target: "enemy0" },
    });
    const result = transformEvents([log])[0];
    if (result.type === "element") {
      expect(result.elementSubtype).toBe("other");
    }
  });
});

describe("transformAction", () => {
  it("formats swap actions with target", () => {
    const log = makeLog({
      event: "action",
      msg: "executed swap",
      logs: { action: "swap", target: "xingqiu" },
    });
    const result = transformEvents([log])[0];
    if (result.type === "action") {
      expect(result.action).toBe("swap");
      expect(result.target).toBe("xingqiu");
      expect(result.message).toContain("xingqiu");
      expect(result.message).not.toContain("executed");
    }
  });

  it("strips executed prefix for non-swap actions", () => {
    const log = makeLog({
      event: "action",
      msg: "executed attack",
      logs: { action: "attack" },
    });
    const result = transformEvents([log])[0];
    if (result.type === "action") {
      expect(result.message).toBe("attack");
    }
  });
});
