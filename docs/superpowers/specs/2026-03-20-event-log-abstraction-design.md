# Event Log Abstraction Layer — Design Spec

**Date:** 2026-03-20
**Phase:** 3.5 (sample viewer), prerequisite step
**Package:** `@gcsim/viewer` (under `src/events/`)

## Problem

The existing event log parsing (`parsev2.ts`, 415 lines) is a monolithic function with:
- 5 `@ts-ignore` / `// TODO: fix this??` annotations
- A giant switch statement with 30+ cases hardcoding display logic per event type
- Fragile string matching on raw message fields (`line.msg.includes("executed")`)
- A hacky two-pass status duration algorithm that searches the entire event array
- Active character tracking by detecting swap actions in the event stream
- No type safety on the `logs` map (`{ [key: string]: unknown }`)
- Display concerns (color, icon) baked into the parsing step

The new UI needs a clean abstraction layer that decouples UI components from raw backend data, so the fragile parsing is isolated and eventually replaceable.

## Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Scope | Frontend-only | Backend continues emitting `LogDetails`. Transformer isolates fragility. Backend can emit cleaner data later, making transformer obsolete. |
| Type system | Discriminated union with per-type payloads | Compile-time safety. Components narrow by `event.type`. Adding a new type is a compile error if you miss a case. |
| Unknown events | `GenericEvent` fallback | UI always shows something. Adding a new typed event is non-breaking. |
| Display config | Separate module | Event types are pure data. Color/icon/label looked up by `event.type`. Theming and customization are independent. |
| Transformer output | Flat `SimEvent[]` | Frame-grouping and active-character tracking are separate utilities. Each concern is independently testable. |
| Status duration tracking | Separate post-processor | Keeps transformer simple (one in, one out). Duration resolution is explicit and optional. |

## Architecture

Three-layer pipeline:

```
LogDetails[] → Transformer → SimEvent[] → Post-processors → Grouped UI data
```

### Layer 1: Event Type System

File: `src/events/types.ts`

A discriminated union of typed events. Each variant extracts relevant fields from the untyped `logs` bag, giving consumers compile-time safety.

```typescript
// Base fields shared by all events
interface BaseEvent {
  type: string;
  frame: number;
  characterIndex: number; // raw value from backend: -1 for global/sim events, 0-3 for characters
  message: string;        // human-readable summary built by transformer
  raw: LogDetails;        // original data for "show raw JSON" feature
}

interface DamageEvent extends BaseEvent {
  type: "damage";
  damage: number;
  crit: boolean;
  amp: string;
  cata: string;
  target: string;
}

interface EnergyEvent extends BaseEvent {
  type: "energy";
  energyType: "particle" | "flat" | "other"; // discriminates message formatting
  source: string;
  amount: number;       // maps to log.logs["rec'd"] for flat energy, or derived for particles
  postRecovery: number; // maps to log.logs["post_recovery"]
  maxEnergy: number;    // maps to log.logs["max_energy"]
}

interface StatusEvent extends BaseEvent {
  type: "status";
  key: string;
  addedFrame?: number;  // optional — not all status events have duration info
  endedFrame?: number;  // optional — resolved by resolveStatusDurations post-processor
}

interface ElementEvent extends BaseEvent {
  type: "element";
  elementSubtype: "application" | "expired" | "refreshed" | "other";
  appliedElement?: string;   // present for "application" subtype
  oldElement?: string;       // present for "expired" subtype
  refreshedElement?: string; // present for "refreshed" subtype
  existing?: string[];       // present for "application" subtype — aura state before
  after?: string[];          // present for "application" subtype — aura state after
  target: string;
}

interface ActionEvent extends BaseEvent {
  type: "action";
  action: string;   // "swap", "attack", "skill", "burst", "dash", etc.
  target: string;   // swap target character name (empty for non-swap actions)
  // Note: transformer strips "executed " prefix from message and appends " to {target}" for swaps
}

interface CalcEvent extends BaseEvent {
  type: "calc";
  target: string;
}

interface SnapshotEvent extends BaseEvent {
  type: "snapshot";
}

interface PreDamageModsEvent extends BaseEvent {
  type: "pre_damage_mods";
}

interface ShieldEvent extends BaseEvent {
  type: "shield";
}

interface HealEvent extends BaseEvent {
  type: "heal";
}

interface HurtEvent extends BaseEvent {
  type: "hurt";
}

interface ConstructEvent extends BaseEvent {
  type: "construct";
}

interface IcdEvent extends BaseEvent {
  type: "icd";
}

interface CooldownEvent extends BaseEvent {
  type: "cooldown";
}

interface HitlagEvent extends BaseEvent {
  type: "hitlag";
}

interface EnemyEvent extends BaseEvent {
  type: "enemy";
}

interface CharacterEvent extends BaseEvent {
  type: "character";
}

interface WeaponEvent extends BaseEvent {
  type: "weapon";
}

interface ArtifactEvent extends BaseEvent {
  type: "artifact";
}

interface UserEvent extends BaseEvent {
  type: "user";
}

interface SimEventType extends BaseEvent {
  type: "sim";
}

interface PlayerEvent extends BaseEvent {
  type: "player";
}

interface WarningEvent extends BaseEvent {
  type: "warning";
}

interface DebugEvent extends BaseEvent {
  type: "debug";
}

// Fallback for unrecognized event types
interface GenericEvent extends BaseEvent {
  type: "generic";
  originalType: string;
  logs: Record<string, unknown>;
}

type SimEvent =
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
  | SimEventType
  | PlayerEvent
  | WarningEvent
  | DebugEvent
  | GenericEvent;
```

The types listed above for simpler events (heal, hurt, shield, etc.) start with just `BaseEvent` fields. As we discover they need specific typed fields, we add them — no speculative fields.

**Deprecated event types:** The old UI handled `queue`, `hook`, `snapshot_mods`, `procs`, `task`, and `reaction` event strings. These are legacy/deprecated in the backend. They intentionally fall through to `GenericEvent` — no typed variants are needed. If any still appear in real simulation data, they will render with the generic fallback display (gray, circle icon). This is acceptable; if a deprecated type proves common enough to warrant formatting, a typed variant can be added later.

**Note on `characterIndex`:** The value is the raw `char_index` from the backend (-1 for global/sim events, 0 through N-1 for characters). The `groupByFrame` post-processor handles the +1 offset to map into slots (slot 0 = global, slots 1..N = characters). Consumers should not apply their own offset.

### Layer 2: Transformer

File: `src/events/transformer.ts`

A registry of per-type transform functions. This is the **only code that touches the raw `logs` bag**.

```typescript
type EventTransformerFn<T extends SimEvent> = (log: LogDetails) => T;

const transformers: Record<string, EventTransformerFn<SimEvent>> = {
  damage: transformDamage,
  energy: transformEnergy,
  status: transformStatus,
  element: transformElement,
  action: transformAction,
  calc: transformCalc,
  // ... one per typed event
};

export function transformEvents(logs: LogDetails[]): SimEvent[] {
  return logs.map((log) => {
    const fn = transformers[log.event];
    return fn ? fn(log) : transformGeneric(log);
  });
}
```

Each per-type function:
- Extracts typed fields from `log.logs` (the untyped bag)
- Sorts `log.logs` entries by `log.ordering` if present (preserves field order for raw JSON display)
- Builds a clean `message` string (the formatted display text)
- Returns the fully typed event

Example — `transformDamage`:
```typescript
function transformDamage(log: LogDetails): DamageEvent {
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

  return {
    type: "damage",
    frame: log.frame,
    characterIndex: log.char_index,
    message,
    raw: log,
    damage,
    crit,
    amp,
    cata,
    target,
  };
}
```

The `transformGeneric` fallback:
```typescript
function transformGeneric(log: LogDetails): GenericEvent {
  return {
    type: "generic",
    frame: log.frame,
    characterIndex: log.char_index,
    message: `${log.event}: ${log.msg}`,
    raw: log,
    originalType: log.event,
    logs: { ...log.logs },
  };
}
```

### Layer 3: Post-processors

File: `src/events/post-processors.ts`

Composable utility functions operating on `SimEvent[]`:

#### `resolveStatusDurations(events: SimEvent[]): SimEvent[]`

Matches status "added" and "expired" pairs:
1. First pass: collect all status events with `endedFrame > frame` that include "added" in message
2. For refresh/extend events, search backwards for the original "added" event to resolve true start frame
3. Synthesize expiration events at the `endedFrame`
4. Returns a new array with resolved durations and synthetic expiration events inserted

This isolates the fragile matching logic from the old `parsev2.ts` lines 56-94 and 338-352.

#### `trackActiveCharacter(events: SimEvent[]): Map<number, number>`

Returns a `frame → characterIndex` map:
1. Scans for `ActionEvent` where `action === "swap"`
2. Records the character index at each swap frame
3. UI interpolates between swap frames for any given frame

#### `groupByFrame(events: SimEvent[], activeCharMap: Map<number, number>, teamSize: number): FrameGroup[]`

Groups events into per-frame rows with per-character slots:

```typescript
interface FrameGroup {
  frame: number;
  activeCharacter: number;
  slots: SimEvent[][]; // index 0 = sim/global, 1..N = characters
}
```

### Layer 4: Display Config

File: `src/events/display-config.ts`

Lookup table mapping event type to display properties:

```typescript
interface EventDisplayConfig {
  color: string;
  icon: string;
  label: string;
}

const eventDisplayMap: Record<SimEvent["type"], EventDisplayConfig> = {
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

export function getEventDisplay(type: SimEvent["type"]): EventDisplayConfig {
  return eventDisplayMap[type] ?? eventDisplayMap.generic;
}
```

### Filter Presets

File: `src/events/filter-presets.ts`

Replaces `SampleOptions.ts` from the old UI:

```typescript
type SimEventType = SimEvent["type"];

const presets: Record<string, SimEventType[]> = {
  simple:   ["action", "damage", "energy", "warning", "user"],
  advanced: ["action", "damage", "energy", "warning", "user",
             "status", "cooldown", "element", "shield", "construct"],
  verbose:  ["action", "damage", "energy", "warning", "user",
             "status", "cooldown", "element", "shield", "construct",
             "heal", "hurt", "pre_damage_mods", "icd", "calc",
             "snapshot", "character", "weapon", "enemy", "artifact",
             "hitlag", "player"],
  debug:    ["action", "damage", "energy", "warning", "user",
             "status", "cooldown", "element", "shield", "construct",
             "heal", "hurt", "pre_damage_mods", "icd", "calc",
             "snapshot", "character", "weapon", "enemy", "artifact",
             "hitlag", "player", "debug", "sim"],
};
```

**Note:** The old UI's `VerbosePreset` had a typo: `"pre_damage_mod"` (singular) instead of `"pre_damage_mods"` (plural). The correct type string from the backend is `"pre_damage_mods"`. This is fixed here.

### File Structure

```
packages/viewer/src/events/
  types.ts              # SimEvent union, all typed event interfaces
  transformer.ts        # transformEvents() + per-type transform functions
  post-processors.ts    # resolveStatusDurations, trackActiveCharacter, groupByFrame
  display-config.ts     # eventDisplayMap, getEventDisplay()
  filter-presets.ts     # preset filter configurations
  index.ts              # barrel export
```

### Composition in UI Components

```typescript
import {
  transformEvents, resolveStatusDurations, trackActiveCharacter,
  groupByFrame, getEventDisplay
} from "./events";

// Pipeline
const events = transformEvents(sample.logs);
const withDurations = resolveStatusDurations(events);
const activeMap = trackActiveCharacter(withDurations);
const grouped = groupByFrame(withDurations, activeMap, team.length);

// In render
grouped.map((group) =>
  group.slots.map((slot) =>
    slot.map((event) => {
      const display = getEventDisplay(event.type);
      return <EventItem event={event} color={display.color} icon={display.icon} />;
    })
  )
);
```

### Testing Strategy

Each layer is independently testable:

| Module | Test approach |
|--------|--------------|
| `types.ts` | Compile-time only — if it compiles, it's correct |
| `transformer.ts` | Unit tests per transform function: given a `LogDetails`, assert the output `SimEvent` has correct typed fields and message string |
| `post-processors.ts` | Unit tests: `resolveStatusDurations` with known status pairs, `trackActiveCharacter` with swap sequences, `groupByFrame` with multi-frame multi-character event lists |
| `display-config.ts` | Unit test: every `SimEvent["type"]` has an entry in the map |
| `filter-presets.ts` | Unit test: presets contain valid event types, preset hierarchy is inclusive |

### Migration Path

1. **Phase 3.5 implementation:** Build the abstraction layer in `src/events/`. UI components (event-log, sample-viewer) consume only `SimEvent` types.
2. **Eventually:** If the Go backend is updated to emit structured events, the transformer functions are updated or removed — UI components are unaffected.
3. The old `parsev2.ts` is never ported. Its logic is reimplemented cleanly in the per-type transform functions.
