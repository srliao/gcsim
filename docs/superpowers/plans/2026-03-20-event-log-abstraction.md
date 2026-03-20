# Event Log Abstraction Layer — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a typed event abstraction layer in `@gcsim/viewer` that decouples UI components from raw `LogDetails` parsing, enabling clean event log rendering for Phase 3.5.

**Architecture:** A pipeline of independent modules: types (discriminated union) → transformer (per-type functions) → post-processors (status durations, active character, frame grouping) → display config + filter presets. Each module is independently testable. The transformer is the only code that touches the raw `logs` bag.

**Tech Stack:** TypeScript, Vitest, `@gcsim/types` (for `LogDetails`)

**Spec:** `docs/superpowers/specs/2026-03-20-event-log-abstraction-design.md`

---

## File Structure

```
packages/viewer/src/events/
  types.ts                  # BaseEvent, all typed event interfaces, SimEvent union, FrameGroup
  transformer.ts            # transformEvents() + per-type transform functions + sortLogsByOrdering helper
  transformer.test.ts       # unit tests for each transform function
  post-processors.ts        # resolveStatusDurations, trackActiveCharacter, groupByFrame
  post-processors.test.ts   # unit tests for each post-processor
  display-config.ts         # EventDisplayConfig interface, eventDisplayMap, getEventDisplay()
  display-config.test.ts    # coverage test for display map
  filter-presets.ts         # filterPresets, allEventTypes, SimEventType
  filter-presets.test.ts    # preset validity and hierarchy tests
  index.ts                  # barrel re-export of all public API
```

Note: Test files are colocated next to source files, matching the existing viewer package convention.

Existing files to modify:
- `packages/viewer/src/index.ts` — add `export * from "./events/index.js";`

---

## Task 1: Event Type Definitions

**Files:**
- Create: `packages/viewer/src/events/types.ts`

This is a types-only file. No runtime code, so no tests needed — TypeScript compilation is the test.

- [ ] **Step 1: Create `types.ts` with all interfaces and the `SimEvent` union**

```typescript
import type { Sim } from "@gcsim/types";

// Base fields shared by all events
export interface BaseEvent {
  type: string;
  frame: number;
  /** Raw value from backend: -1 for global/sim events, 0 through N-1 for characters */
  characterIndex: number;
  /** Human-readable summary built by the transformer */
  message: string;
  /** Original LogDetails for "show raw JSON" feature */
  raw: Sim.LogDetails;
}

export interface DamageEvent extends BaseEvent {
  type: "damage";
  damage: number;
  crit: boolean;
  amp: string;
  cata: string;
  target: string;
}

export interface EnergyEvent extends BaseEvent {
  type: "energy";
  energyType: "particle" | "flat" | "other";
  source: string;
  /** log.logs["amt"] for particles, log.logs["rec'd"] for flat energy */
  amount: number;
  postRecovery: number;
  maxEnergy: number;
}

export interface StatusEvent extends BaseEvent {
  type: "status";
  key: string;
  /** Set by transformer when log.ended > log.frame; refined by resolveStatusDurations */
  addedFrame?: number;
  /** Set by transformer from log.ended; refined by resolveStatusDurations for refresh/extend */
  endedFrame?: number;
}

export interface ElementEvent extends BaseEvent {
  type: "element";
  elementSubtype: "application" | "expired" | "refreshed" | "other";
  appliedElement?: string;
  oldElement?: string;
  refreshedElement?: string;
  existing?: string[];
  after?: string[];
  target: string;
}

export interface ActionEvent extends BaseEvent {
  type: "action";
  action: string;
  target: string;
}

export interface CalcEvent extends BaseEvent {
  type: "calc";
  target: string;
}

export interface SnapshotEvent extends BaseEvent {
  type: "snapshot";
}

export interface PreDamageModsEvent extends BaseEvent {
  type: "pre_damage_mods";
}

export interface ShieldEvent extends BaseEvent {
  type: "shield";
}

export interface HealEvent extends BaseEvent {
  type: "heal";
}

export interface HurtEvent extends BaseEvent {
  type: "hurt";
}

export interface ConstructEvent extends BaseEvent {
  type: "construct";
}

export interface IcdEvent extends BaseEvent {
  type: "icd";
}

export interface CooldownEvent extends BaseEvent {
  type: "cooldown";
}

export interface HitlagEvent extends BaseEvent {
  type: "hitlag";
}

export interface EnemyEvent extends BaseEvent {
  type: "enemy";
}

export interface CharacterEvent extends BaseEvent {
  type: "character";
}

export interface WeaponEvent extends BaseEvent {
  type: "weapon";
}

export interface ArtifactEvent extends BaseEvent {
  type: "artifact";
}

export interface UserEvent extends BaseEvent {
  type: "user";
}

export interface SimLogEvent extends BaseEvent {
  type: "sim";
}

export interface PlayerEvent extends BaseEvent {
  type: "player";
}

export interface WarningEvent extends BaseEvent {
  type: "warning";
}

export interface DebugEvent extends BaseEvent {
  type: "debug";
}

export interface GenericEvent extends BaseEvent {
  type: "generic";
  originalType: string;
  logs: Record<string, unknown>;
}

export type SimEvent =
  | DamageEvent
  | EnergyEvent
  | StatusEvent
  | ElementEvent
  | ActionEvent
  | CalcEvent
  | SnapshotEvent
  | PreDamageModsEvent
  | ShieldEvent
  | HealEvent
  | HurtEvent
  | ConstructEvent
  | IcdEvent
  | CooldownEvent
  | HitlagEvent
  | EnemyEvent
  | CharacterEvent
  | WeaponEvent
  | ArtifactEvent
  | UserEvent
  | SimLogEvent
  | PlayerEvent
  | WarningEvent
  | DebugEvent
  | GenericEvent;

/** All possible values of SimEvent["type"] */
export type SimEventType = SimEvent["type"];

export interface FrameGroup {
  frame: number;
  activeCharacter: number;
  /** index 0 = sim/global (-1 characterIndex), 1..N = characters (0..N-1 characterIndex) */
  slots: SimEvent[][];
}
```

- [ ] **Step 2: Verify it compiles**

Run: `cd /Users/srliao/code/gcsim/ui-next && turbo run typecheck --filter=@gcsim/viewer`
Expected: PASS (types-only file, no runtime errors possible)

- [ ] **Step 3: Commit**

```bash
git add packages/viewer/src/events/types.ts
git commit -m "add SimEvent type system for event log abstraction"
```

---

## Task 2: Display Config

**Files:**
- Create: `packages/viewer/src/events/display-config.ts`
- Create: `packages/viewer/src/events/display-config.test.ts`

- [ ] **Step 1: Write failing test**

```typescript
// packages/viewer/src/events/display-config.test.ts
import { describe, it, expect } from "vitest";
import { getEventDisplay, eventDisplayMap } from "./display-config.js";
import type { SimEventType } from "./types.js";

const allTypes: SimEventType[] = [
  "damage", "energy", "status", "element", "action", "calc", "snapshot",
  "pre_damage_mods", "shield", "heal", "hurt", "construct", "icd",
  "cooldown", "hitlag", "enemy", "character", "weapon", "artifact",
  "user", "sim", "player", "warning", "debug", "generic",
];

describe("eventDisplayMap", () => {
  it("has an entry for every SimEventType", () => {
    for (const type of allTypes) {
      expect(eventDisplayMap[type]).toBeDefined();
      expect(eventDisplayMap[type].color).toBeTruthy();
      expect(eventDisplayMap[type].icon).toBeTruthy();
      expect(eventDisplayMap[type].label).toBeTruthy();
    }
  });
});

describe("getEventDisplay", () => {
  it("returns config for known types", () => {
    const damage = getEventDisplay("damage");
    expect(damage.color).toBe("#2563EB");
    expect(damage.icon).toBe("local_fire_department");
    expect(damage.label).toBe("Damage");
  });

  it("returns generic config for unknown type", () => {
    const unknown = getEventDisplay("not_a_real_type" as SimEventType);
    expect(unknown.color).toBe("#6B7280");
    expect(unknown.icon).toBe("circle");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/srliao/code/gcsim/ui-next && turbo run test --filter=@gcsim/viewer -- src/events/display-config.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Write implementation**

```typescript
// packages/viewer/src/events/display-config.ts
import type { SimEventType } from "./types.js";

export interface EventDisplayConfig {
  color: string;
  icon: string;
  label: string;
}

export const eventDisplayMap: Record<SimEventType, EventDisplayConfig> = {
  damage:          { color: "#2563EB", icon: "local_fire_department", label: "Damage" },
  energy:          { color: "#036345", icon: "local_cafe", label: "Energy" },
  status:          { color: "#902D89", icon: "iso", label: "Status" },
  element:         { color: "#3F60A6", icon: "bolt", label: "Element" },
  action:          { color: "#AB5F45", icon: "play_arrow", label: "Action" },
  calc:            { color: "#9D174D", icon: "calculate", label: "Calc" },
  snapshot:        { color: "#6366F1", icon: "photo_camera", label: "Snapshot" },
  pre_damage_mods: { color: "#818CF8", icon: "dynamic_form", label: "Pre-Damage Mods" },
  cooldown:        { color: "#0D9488", icon: "timer", label: "Cooldown" },
  hitlag:          { color: "#A27B5C", icon: "sports_martial_arts", label: "Hitlag" },
  enemy:           { color: "#632626", icon: "mood_bad", label: "Enemy" },
  user:            { color: "#5F7161", icon: "comment", label: "User" },
  shield:          { color: "#6B7280", icon: "shield", label: "Shield" },
  heal:            { color: "#6B7280", icon: "healing", label: "Heal" },
  hurt:            { color: "#6B7280", icon: "coronavirus", label: "Hurt" },
  construct:       { color: "#6B7280", icon: "apartment", label: "Construct" },
  icd:             { color: "#6B7280", icon: "timer", label: "ICD" },
  character:       { color: "#6B7280", icon: "person", label: "Character" },
  weapon:          { color: "#6B7280", icon: "swords", label: "Weapon" },
  artifact:        { color: "#6B7280", icon: "diamond", label: "Artifact" },
  sim:             { color: "#6B7280", icon: "settings", label: "Sim" },
  player:          { color: "#6B7280", icon: "person", label: "Player" },
  warning:         { color: "#EAB308", icon: "warning", label: "Warning" },
  debug:           { color: "#6B7280", icon: "bug_report", label: "Debug" },
  generic:         { color: "#6B7280", icon: "circle", label: "Event" },
};

export function getEventDisplay(type: SimEventType): EventDisplayConfig {
  return eventDisplayMap[type] ?? eventDisplayMap.generic;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /Users/srliao/code/gcsim/ui-next && turbo run test --filter=@gcsim/viewer -- src/events/display-config.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/viewer/src/events/display-config.ts packages/viewer/src/events/display-config.test.ts
git commit -m "add event display config with color/icon/label map"
```

---

## Task 3: Filter Presets

**Files:**
- Create: `packages/viewer/src/events/filter-presets.ts`
- Create: `packages/viewer/src/events/filter-presets.test.ts`

- [ ] **Step 1: Write failing test**

```typescript
// packages/viewer/src/events/filter-presets.test.ts
import { describe, it, expect } from "vitest";
import { filterPresets, allEventTypes } from "./filter-presets.js";

describe("filterPresets", () => {
  it("simple is a subset of advanced", () => {
    for (const type of filterPresets.simple) {
      expect(filterPresets.advanced).toContain(type);
    }
  });

  it("advanced is a subset of verbose", () => {
    for (const type of filterPresets.advanced) {
      expect(filterPresets.verbose).toContain(type);
    }
  });

  it("verbose is a subset of debug", () => {
    for (const type of filterPresets.verbose) {
      expect(filterPresets.debug).toContain(type);
    }
  });

  it("debug contains debug and sim", () => {
    expect(filterPresets.debug).toContain("debug");
    expect(filterPresets.debug).toContain("sim");
  });

  it("simple contains the 5 basic types", () => {
    expect(filterPresets.simple).toEqual(
      expect.arrayContaining(["action", "damage", "energy", "warning", "user"])
    );
    expect(filterPresets.simple).toHaveLength(5);
  });

  it("uses pre_damage_mods not pre_damage_mod", () => {
    expect(filterPresets.verbose).toContain("pre_damage_mods");
    expect(filterPresets.verbose).not.toContain("pre_damage_mod");
  });
});

describe("allEventTypes", () => {
  it("contains all types from debug preset plus generic", () => {
    for (const type of filterPresets.debug) {
      expect(allEventTypes).toContain(type);
    }
    expect(allEventTypes).toContain("generic");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/srliao/code/gcsim/ui-next && turbo run test --filter=@gcsim/viewer -- src/events/filter-presets.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Write implementation**

```typescript
// packages/viewer/src/events/filter-presets.ts
import type { SimEventType } from "./types.js";

export const filterPresets: Record<string, SimEventType[]> = {
  simple: ["action", "damage", "energy", "warning", "user"],
  advanced: [
    "action", "damage", "energy", "warning", "user",
    "status", "cooldown", "element", "shield", "construct",
  ],
  verbose: [
    "action", "damage", "energy", "warning", "user",
    "status", "cooldown", "element", "shield", "construct",
    "heal", "hurt", "pre_damage_mods", "icd", "calc",
    "snapshot", "character", "weapon", "enemy", "artifact",
    "hitlag", "player",
  ],
  debug: [
    "action", "damage", "energy", "warning", "user",
    "status", "cooldown", "element", "shield", "construct",
    "heal", "hurt", "pre_damage_mods", "icd", "calc",
    "snapshot", "character", "weapon", "enemy", "artifact",
    "hitlag", "player", "debug", "sim",
  ],
};

/** All event types including generic fallback. Derived from eventDisplayMap to prevent drift. */
import { eventDisplayMap } from "./display-config.js";
export const allEventTypes = Object.keys(eventDisplayMap) as SimEventType[];
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /Users/srliao/code/gcsim/ui-next && turbo run test --filter=@gcsim/viewer -- src/events/filter-presets.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/viewer/src/events/filter-presets.ts packages/viewer/src/events/filter-presets.test.ts
git commit -m "add event filter presets (simple/advanced/verbose/debug)"
```

---

## Task 4: Transformer — Core + Damage + Generic

**Files:**
- Create: `packages/viewer/src/events/transformer.ts`
- Create: `packages/viewer/src/events/transformer.test.ts`

Start with the registry, `transformEvents`, `transformDamage`, and `transformGeneric`. Add remaining transforms in subsequent tasks.

### Helper: `LogDetails` test factory

All transformer tests need `LogDetails` input. Define a factory at the top of the test file:

```typescript
import type { Sim } from "@gcsim/types";

function makeLog(overrides: Partial<Sim.LogDetails> & { event: string }): Sim.LogDetails {
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
```

- [ ] **Step 1: Write failing tests for `transformEvents`, damage, and generic**

```typescript
// packages/viewer/src/events/transformer.test.ts
import { describe, it, expect } from "vitest";
import { transformEvents } from "./transformer.js";
import type { Sim } from "@gcsim/types";
import type { DamageEvent, GenericEvent } from "./types.js";

function makeLog(overrides: Partial<Sim.LogDetails> & { event: string }): Sim.LogDetails {
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
    // message should contain formatted damage and crit/amp info
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
    // raw should have logs sorted by ordering
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/srliao/code/gcsim/ui-next && turbo run test --filter=@gcsim/viewer -- src/events/transformer.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Write implementation**

```typescript
// packages/viewer/src/events/transformer.ts
import type { Sim } from "@gcsim/types";
import type {
  SimEvent, DamageEvent, EnergyEvent, StatusEvent, ElementEvent,
  ActionEvent, CalcEvent, GenericEvent,
} from "./types.js";

type TransformFn = (log: Sim.LogDetails) => SimEvent;

/**
 * Sort log.logs entries by log.ordering if present, then rebuild the logs object
 * so JSON.stringify preserves insertion order for the raw JSON display.
 */
function sortLogsByOrdering(log: Sim.LogDetails): Sim.LogDetails {
  if (!log.ordering) return log;
  const entries = Object.entries(log.logs);
  entries.sort((a, b) => (log.ordering![a[0]] ?? 0) - (log.ordering![b[0]] ?? 0));
  const sorted: Record<string, unknown> = {};
  for (const [k, v] of entries) {
    sorted[k] = v;
  }
  return { ...log, logs: sorted };
}

function base(log: Sim.LogDetails, type: string, message: string) {
  return { type, frame: log.frame, characterIndex: log.char_index, message, raw: log };
}

// --- Per-type transform functions ---

function transformDamage(log: Sim.LogDetails): DamageEvent {
  const damage = typeof log.logs.damage === "number" ? log.logs.damage : 0;
  const crit = !!log.logs.crit;
  const amp = String(log.logs.amp ?? "");
  const cata = String(log.logs.cata ?? "");
  const target = String(log.logs.target ?? "");

  const dmgStr = Math.round(damage).toLocaleString();
  let message = `${log.msg} [${dmgStr}]`;
  const extras: string[] = [];
  if (amp) extras.push(amp);
  if (cata) extras.push(cata);
  if (crit) extras.push("crit");
  if (extras.length > 0) message += ` (${extras.join(" ")})`;

  return { ...base(log, "damage", message), damage, crit, amp, cata, target };
}

function transformEnergy(log: Sim.LogDetails): EnergyEvent {
  const source = String(log.logs.source ?? "");
  const postRecovery = typeof log.logs.post_recovery === "number" ? log.logs.post_recovery : 0;
  const maxEnergy = typeof log.logs.max_energy === "number" ? log.logs.max_energy : 0;

  let energyType: EnergyEvent["energyType"] = "other";
  let amount = 0;
  let message = log.msg;

  if (log.msg.includes("particle")) {
    energyType = "particle";
    amount = typeof log.logs.amt === "number" ? log.logs.amt : 0;
    message = `${log.msg} from ${source}, next: ${Math.floor(postRecovery)}`;
  } else if (log.msg.includes("adding energy")) {
    energyType = "flat";
    const recd = log.logs["rec'd"];
    amount = typeof recd === "number" ? recd : 0;
    const amtStr = typeof recd === "number" ? recd.toFixed(2) : String(recd ?? "0");
    message = `adding ${amtStr} energy from ${source}, next: ${Math.floor(postRecovery)}`;
  }

  if (postRecovery === maxEnergy && maxEnergy > 0) {
    message += " (max)";
  }

  return { ...base(log, "energy", message), energyType, source, amount, postRecovery, maxEnergy };
}

function transformStatus(log: Sim.LogDetails): StatusEvent {
  const key = String(log.logs.key ?? "");
  let message = `${key} ${log.msg}`;

  const addedFrame = log.ended > log.frame ? log.frame : undefined;
  const endedFrame = log.ended > log.frame ? log.ended : undefined;

  if (endedFrame != null) {
    const sec = (endedFrame / 60).toFixed(2);
    message += ` [${endedFrame} | ${sec}s]`;
  }

  return { ...base(log, "status", message), key, addedFrame, endedFrame };
}

function transformElement(log: Sim.LogDetails): ElementEvent {
  const target = String(log.logs.target ?? "");
  let elementSubtype: ElementEvent["elementSubtype"] = "other";
  let message = log.msg;
  let appliedElement: string | undefined;
  let oldElement: string | undefined;
  let refreshedElement: string | undefined;
  let existing: string[] | undefined;
  let after: string[] | undefined;

  switch (log.msg) {
    case "expired":
      elementSubtype = "expired";
      oldElement = String(log.logs.old_ele ?? "");
      message = `${oldElement} expired`;
      break;
    case "application": {
      elementSubtype = "application";
      appliedElement = String(log.logs.applied_ele ?? "");
      message = `${appliedElement} applied`;
      if (Array.isArray(log.logs.existing)) {
        existing = log.logs.existing.map((x: unknown) =>
          String(x).replace(/: (.+)/, " ($1)")
        );
        message += ` to [${existing.join(" ")}]`;
      } else {
        message += " [no aura]";
      }
      if (Array.isArray(log.logs.after)) {
        after = log.logs.after.map((x: unknown) =>
          String(x).replace(/: (.+)/, " ($1)")
        );
        message += ` \u27A8 [${after.join(" ")}]`;
      } else {
        message += " \u27A8 [no aura]";
      }
      break;
    }
    case "refreshed":
      elementSubtype = "refreshed";
      refreshedElement = String(log.logs.ele ?? "");
      message = `${refreshedElement} refreshed`;
      break;
    default:
      message = log.msg;
  }

  return {
    ...base(log, "element", message),
    elementSubtype, appliedElement, oldElement, refreshedElement, existing, after, target,
  };
}

function transformAction(log: Sim.LogDetails): ActionEvent {
  const action = String(log.logs.action ?? "");
  const target = String(log.logs.target ?? "");
  let message = log.msg;

  if (log.msg.includes("executed") && action === "swap") {
    message += ` to ${target}`;
  }
  message = message.replace("executed ", "");

  return { ...base(log, "action", message), action, target };
}

function transformCalc(log: Sim.LogDetails): SimEvent {
  const target = String(log.logs.target ?? "");
  return { ...base(log, "calc", log.msg), target };
}

function transformSimple(type: string) {
  return (log: Sim.LogDetails): SimEvent => base(log, type, log.msg) as SimEvent;
}

function transformGeneric(log: Sim.LogDetails): GenericEvent {
  return {
    ...base(log, "generic", `${log.event}: ${log.msg}`),
    originalType: log.event,
    logs: { ...log.logs },
  };
}

// --- Registry ---

const transformers: Record<string, TransformFn> = {
  damage: transformDamage,
  energy: transformEnergy,
  status: transformStatus,
  element: transformElement,
  action: transformAction,
  calc: transformCalc,
  snapshot: transformSimple("snapshot"),
  pre_damage_mods: transformSimple("pre_damage_mods"),
  shield: transformSimple("shield"),
  heal: transformSimple("heal"),
  hurt: transformSimple("hurt"),
  construct: transformSimple("construct"),
  icd: transformSimple("icd"),
  cooldown: transformSimple("cooldown"),
  hitlag: transformSimple("hitlag"),
  enemy: transformSimple("enemy"),
  character: transformSimple("character"),
  weapon: transformSimple("weapon"),
  artifact: transformSimple("artifact"),
  user: transformSimple("user"),
  sim: transformSimple("sim"),
  player: transformSimple("player"),
  warning: transformSimple("warning"),
  debug: transformSimple("debug"),
};

export function transformEvents(logs: Sim.LogDetails[]): SimEvent[] {
  return logs.map((rawLog) => {
    const log = sortLogsByOrdering(rawLog);
    const fn = transformers[log.event];
    return fn ? fn(log) : transformGeneric(log);
  });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /Users/srliao/code/gcsim/ui-next && turbo run test --filter=@gcsim/viewer -- src/events/transformer.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/viewer/src/events/transformer.ts packages/viewer/src/events/transformer.test.ts
git commit -m "add event transformer with damage, generic, and all simple types"
```

---

## Task 5: Transformer — Energy, Status, Element, Action tests

Add tests for the remaining complex transform functions (implementation already exists from Task 4).

**Files:**
- Modify: `packages/viewer/src/events/transformer.test.ts`

- [ ] **Step 1: Add tests for energy, status, element, and action transforms**

Append these `describe` blocks to the existing test file:

```typescript
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
```

- [ ] **Step 2: Run all transformer tests**

Run: `cd /Users/srliao/code/gcsim/ui-next && turbo run test --filter=@gcsim/viewer -- src/events/transformer.test.ts`
Expected: PASS — implementation already handles these cases

- [ ] **Step 3: Commit**

```bash
git add packages/viewer/src/events/transformer.test.ts
git commit -m "add tests for energy, status, element, and action transforms"
```

---

## Task 6: Post-processors — `trackActiveCharacter`

**Files:**
- Create: `packages/viewer/src/events/post-processors.ts`
- Create: `packages/viewer/src/events/post-processors.test.ts`

Start with the simplest post-processor.

- [ ] **Step 1: Write failing test**

```typescript
// packages/viewer/src/events/post-processors.test.ts
import { describe, it, expect } from "vitest";
import { trackActiveCharacter } from "./post-processors.js";
import type { SimEvent, ActionEvent } from "./types.js";
import type { Sim } from "@gcsim/types";

const dummyRaw: Sim.LogDetails = {
  char_index: 0, ended: 0, event: "", frame: 0, msg: "", logs: {},
};

function makeAction(frame: number, action: string, charIndex: number, target = ""): ActionEvent {
  return {
    type: "action", frame, characterIndex: charIndex,
    message: "", raw: dummyRaw, action, target,
  };
}

function makeDamage(frame: number, charIndex: number): SimEvent {
  return {
    type: "damage", frame, characterIndex: charIndex,
    message: "", raw: dummyRaw, damage: 100, crit: false, amp: "", cata: "", target: "",
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
    const events: SimEvent[] = [
      makeAction(10, "attack", 0),
      makeAction(20, "skill", 0),
    ];
    const map = trackActiveCharacter(events);
    expect(map.size).toBe(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/srliao/code/gcsim/ui-next && turbo run test --filter=@gcsim/viewer -- src/events/post-processors.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Write implementation**

```typescript
// packages/viewer/src/events/post-processors.ts
import type { SimEvent, StatusEvent, FrameGroup } from "./types.js";

/**
 * Note on char_index for swap events: In the backend, char_index on a swap event
 * is the character being swapped TO (the one becoming active). This was verified
 * against the old parsev2.ts which uses the same field for active tracking.
 * If this assumption is wrong, the fix is isolated to this function.
 */
export function trackActiveCharacter(events: SimEvent[]): Map<number, number> {
  const map = new Map<number, number>();
  for (const event of events) {
    if (event.type === "action" && event.action === "swap") {
      map.set(event.frame, event.characterIndex);
    }
  }
  return map;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /Users/srliao/code/gcsim/ui-next && turbo run test --filter=@gcsim/viewer -- src/events/post-processors.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/viewer/src/events/post-processors.ts packages/viewer/src/events/post-processors.test.ts
git commit -m "add trackActiveCharacter post-processor"
```

---

## Task 7: Post-processors — `groupByFrame`

**Files:**
- Modify: `packages/viewer/src/events/post-processors.ts`
- Modify: `packages/viewer/src/events/post-processors.test.ts`

- [ ] **Step 1: Write failing tests**

Append to post-processors test file:

```typescript
import { trackActiveCharacter, groupByFrame } from "./post-processors.js";
import type { FrameGroup } from "./types.js";

// (update import at top to include groupByFrame)

describe("groupByFrame", () => {
  it("returns empty array for empty events", () => {
    expect(groupByFrame([], new Map(), 2)).toEqual([]);
  });

  it("groups events by frame with correct slot assignment", () => {
    const events: SimEvent[] = [
      makeDamage(10, 0),  // char 0 → slot 1
      makeDamage(10, 1),  // char 1 → slot 2
      makeDamage(20, 0),  // char 0 → slot 1
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
    const activeMap = new Map([[10, 1], [30, 0]]);
    const events: SimEvent[] = [
      makeDamage(10, 1),
      makeDamage(20, 1),
      makeDamage(30, 0),
    ];
    const groups = groupByFrame(events, activeMap, 2);
    expect(groups[0].activeCharacter).toBe(1); // frame 10: swap to char 1
    expect(groups[1].activeCharacter).toBe(1); // frame 20: still char 1
    expect(groups[2].activeCharacter).toBe(0); // frame 30: swap to char 0
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/srliao/code/gcsim/ui-next && turbo run test --filter=@gcsim/viewer -- src/events/post-processors.test.ts`
Expected: FAIL — `groupByFrame` not exported

- [ ] **Step 3: Write implementation**

Add to `post-processors.ts`:

```typescript
export function groupByFrame(
  events: SimEvent[],
  activeCharMap: Map<number, number>,
  teamSize: number,
): FrameGroup[] {
  if (events.length === 0) return [];

  const slotCount = teamSize + 1; // slot 0 = global, 1..N = characters
  const frameMap = new Map<number, FrameGroup>();
  const frameOrder: number[] = [];

  for (const event of events) {
    let group = frameMap.get(event.frame);
    if (!group) {
      const slots: SimEvent[][] = [];
      for (let i = 0; i < slotCount; i++) slots.push([]);
      group = { frame: event.frame, activeCharacter: -1, slots };
      frameMap.set(event.frame, group);
      frameOrder.push(event.frame);
    }
    // characterIndex -1 → slot 0, characterIndex 0 → slot 1, etc.
    const slotIndex = event.characterIndex + 1;
    if (slotIndex >= 0 && slotIndex < slotCount) {
      group.slots[slotIndex].push(event);
    } else {
      group.slots[0].push(event); // fallback to global slot
    }
  }

  // Resolve active character per frame
  let lastActive = -1;
  for (const frame of frameOrder) {
    if (activeCharMap.has(frame)) {
      lastActive = activeCharMap.get(frame)!;
    }
    frameMap.get(frame)!.activeCharacter = lastActive;
  }

  return frameOrder.map((f) => frameMap.get(f)!);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /Users/srliao/code/gcsim/ui-next && turbo run test --filter=@gcsim/viewer -- src/events/post-processors.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/viewer/src/events/post-processors.ts packages/viewer/src/events/post-processors.test.ts
git commit -m "add groupByFrame post-processor"
```

---

## Task 8: Post-processors — `resolveStatusDurations`

**Files:**
- Modify: `packages/viewer/src/events/post-processors.ts`
- Modify: `packages/viewer/src/events/post-processors.test.ts`

This is the most complex post-processor. It isolates the fragile matching logic from the old `parsev2.ts`.

- [ ] **Step 1: Write failing tests**

Append to post-processors test file:

```typescript
import { trackActiveCharacter, groupByFrame, resolveStatusDurations } from "./post-processors.js";
import type { StatusEvent } from "./types.js";

// (update import at top to include resolveStatusDurations and StatusEvent)

function makeStatus(
  frame: number,
  charIndex: number,
  key: string,
  msg: string,
  addedFrame?: number,
  endedFrame?: number,
): StatusEvent {
  return {
    type: "status", frame, characterIndex: charIndex,
    message: `${key} ${msg}`, raw: dummyRaw, key, addedFrame, endedFrame,
  };
}

describe("resolveStatusDurations", () => {
  it("returns events unchanged when no status events", () => {
    const events: SimEvent[] = [makeDamage(10, 0)];
    const result = resolveStatusDurations(events);
    expect(result).toEqual(events);
  });

  it("synthesizes expiration events for status with duration", () => {
    const events: SimEvent[] = [
      makeStatus(100, 0, "pyro-buff", "added", 100, 400),
    ];
    const result = resolveStatusDurations(events);
    // Original event + synthetic expiration
    const statusEvents = result.filter((e) => e.type === "status") as StatusEvent[];
    expect(statusEvents.length).toBeGreaterThanOrEqual(2);
    const expiration = statusEvents.find((e) => e.message.includes("expired"));
    expect(expiration).toBeDefined();
    expect(expiration!.frame).toBe(400);
  });

  it("resolves refresh events to original duration", () => {
    const events: SimEvent[] = [
      makeStatus(100, 0, "buff-a", "added", 100, 400),
      // Refresh at frame 200: endedFrame === frame means it needs resolution
      makeStatus(200, 0, "buff-a", "refreshed", undefined, undefined),
    ];
    const result = resolveStatusDurations(events);
    const refreshed = result.find(
      (e) => e.type === "status" && e.frame === 200 && (e as StatusEvent).key === "buff-a"
    ) as StatusEvent;
    expect(refreshed).toBeDefined();
    expect(refreshed.addedFrame).toBe(100);
    expect(refreshed.endedFrame).toBe(400);
  });

  it("matches by characterIndex and key", () => {
    const events: SimEvent[] = [
      makeStatus(100, 0, "buff-a", "added", 100, 400),
      makeStatus(100, 1, "buff-a", "added", 100, 500), // different char
      makeStatus(200, 1, "buff-a", "refreshed", undefined, undefined),
    ];
    const result = resolveStatusDurations(events);
    const refreshed = result.find(
      (e) => e.type === "status" && e.frame === 200
    ) as StatusEvent;
    // Should match char 1's buff (ended 500), not char 0's (ended 400)
    expect(refreshed.endedFrame).toBe(500);
  });

  it("preserves non-status events in output", () => {
    const events: SimEvent[] = [
      makeDamage(10, 0),
      makeStatus(100, 0, "buff", "added", 100, 400),
      makeDamage(200, 0),
    ];
    const result = resolveStatusDurations(events);
    const damageEvents = result.filter((e) => e.type === "damage");
    expect(damageEvents).toHaveLength(2);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/srliao/code/gcsim/ui-next && turbo run test --filter=@gcsim/viewer -- src/events/post-processors.test.ts`
Expected: FAIL — `resolveStatusDurations` not exported

- [ ] **Step 3: Write implementation**

Add to `post-processors.ts`:

```typescript
export function resolveStatusDurations(events: SimEvent[]): SimEvent[] {
  // Collect status events with duration that are "added"
  const expirations: Map<number, StatusEvent[]> = new Map(); // endedFrame → synthetic events

  for (const event of events) {
    if (event.type !== "status") continue;
    const status = event as StatusEvent;
    if (
      status.addedFrame != null &&
      status.endedFrame != null &&
      status.endedFrame > status.frame &&
      status.message.includes("added")
    ) {
      const frame = status.endedFrame;
      if (!expirations.has(frame)) expirations.set(frame, []);
      expirations.get(frame)!.push({
        ...status,
        frame: status.endedFrame,
        message: `${status.key} expired [${status.endedFrame} | ${(status.endedFrame / 60).toFixed(2)}s]`,
        addedFrame: status.addedFrame,
        endedFrame: status.endedFrame,
      });
    }
  }

  // Resolve refresh/extend events: find original "added" event by char + key
  const result = events.map((event) => {
    if (event.type !== "status") return event;
    const status = event as StatusEvent;
    if (status.addedFrame != null || status.endedFrame != null) return event;
    if (!status.message.includes("refreshed") && !status.message.includes("extended")) {
      return event;
    }

    // Search for original "added" event matching char + key
    const original = events.find((e) => {
      if (e.type !== "status") return false;
      const s = e as StatusEvent;
      return (
        s.key === status.key &&
        s.characterIndex === status.characterIndex &&
        s.addedFrame != null &&
        s.endedFrame != null &&
        status.frame >= s.addedFrame &&
        status.frame < s.endedFrame
      );
    }) as StatusEvent | undefined;

    if (original) {
      return { ...status, addedFrame: original.addedFrame, endedFrame: original.endedFrame };
    }
    return event;
  });

  // Merge synthetic expiration events into correct positions by frame
  // Collect all synthetics into a flat sorted array, then merge with result
  const allSynthetics: SimEvent[] = [];
  for (const synthetics of expirations.values()) {
    allSynthetics.push(...synthetics);
  }
  allSynthetics.sort((a, b) => a.frame - b.frame);

  if (allSynthetics.length === 0) return result;

  // Merge two sorted-by-frame arrays
  const merged: SimEvent[] = [];
  let ri = 0;
  let si = 0;
  while (ri < result.length && si < allSynthetics.length) {
    if (result[ri].frame <= allSynthetics[si].frame) {
      merged.push(result[ri++]);
    } else {
      merged.push(allSynthetics[si++]);
    }
  }
  while (ri < result.length) merged.push(result[ri++]);
  while (si < allSynthetics.length) merged.push(allSynthetics[si++]);

  return merged;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /Users/srliao/code/gcsim/ui-next && turbo run test --filter=@gcsim/viewer -- src/events/post-processors.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/viewer/src/events/post-processors.ts packages/viewer/src/events/post-processors.test.ts
git commit -m "add resolveStatusDurations post-processor"
```

---

## Task 9: Barrel Export + Package Integration

**Files:**
- Create: `packages/viewer/src/events/index.ts`
- Modify: `packages/viewer/src/index.ts`

- [ ] **Step 1: Create events barrel export**

```typescript
// packages/viewer/src/events/index.ts
export type {
  BaseEvent,
  SimEvent,
  SimEventType,
  DamageEvent,
  EnergyEvent,
  StatusEvent,
  ElementEvent,
  ActionEvent,
  CalcEvent,
  SnapshotEvent,
  PreDamageModsEvent,
  ShieldEvent,
  HealEvent,
  HurtEvent,
  ConstructEvent,
  IcdEvent,
  CooldownEvent,
  HitlagEvent,
  EnemyEvent,
  CharacterEvent,
  WeaponEvent,
  ArtifactEvent,
  UserEvent,
  SimLogEvent,
  PlayerEvent,
  WarningEvent,
  DebugEvent,
  GenericEvent,
  FrameGroup,
} from "./types.js";
export { transformEvents } from "./transformer.js";
export {
  resolveStatusDurations,
  trackActiveCharacter,
  groupByFrame,
} from "./post-processors.js";
export { getEventDisplay, eventDisplayMap } from "./display-config.js";
export type { EventDisplayConfig } from "./display-config.js";
export { filterPresets, allEventTypes } from "./filter-presets.js";
```

- [ ] **Step 2: Add events export to viewer package barrel**

Add this line to `packages/viewer/src/index.ts`:

```typescript
// Events (event log abstraction layer)
export * from "./events/index.js";
```

- [ ] **Step 3: Run typecheck on the full viewer package**

Run: `cd /Users/srliao/code/gcsim/ui-next && turbo run typecheck --filter=@gcsim/viewer`
Expected: PASS

- [ ] **Step 4: Run all viewer tests**

Run: `cd /Users/srliao/code/gcsim/ui-next && turbo run test --filter=@gcsim/viewer`
Expected: PASS — all existing tests + new event tests pass

- [ ] **Step 5: Run lint**

Run: `cd /Users/srliao/code/gcsim/ui-next && npx biome check --write packages/viewer/src/events/`
Expected: Auto-fixes applied (if any)

- [ ] **Step 6: Commit**

```bash
git add packages/viewer/src/events/index.ts packages/viewer/src/index.ts
git commit -m "add events barrel export and wire into viewer package"
```

---

## Task 10: Update CLAUDE.md + Final Verification

**Files:**
- Modify: `packages/viewer/CLAUDE.md`

- [ ] **Step 1: Update CLAUDE.md public API section**

Add under the existing Public API section:

```markdown
### Events (event log abstraction layer)

- `transformEvents(logs: LogDetails[]): SimEvent[]` — transforms raw logs to typed events
- `resolveStatusDurations(events): SimEvent[]` — resolves status added/expired pairs
- `trackActiveCharacter(events): Map<number, number>` — frame→characterIndex swap map
- `groupByFrame(events, activeMap, teamSize): FrameGroup[]` — groups events for grid display
- `getEventDisplay(type): EventDisplayConfig` — color/icon/label lookup
- `filterPresets` — simple/advanced/verbose/debug filter preset arrays
- `SimEvent`, `FrameGroup`, and all typed event interfaces — discriminated union types
```

- [ ] **Step 2: Run full check**

Run: `cd /Users/srliao/code/gcsim/ui-next && turbo run typecheck --filter=@gcsim/viewer && turbo run test --filter=@gcsim/viewer && turbo run build --filter=@gcsim/viewer`
Expected: All PASS

- [ ] **Step 3: Commit**

```bash
git add packages/viewer/CLAUDE.md
git commit -m "update viewer CLAUDE.md with events public API"
```
