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
