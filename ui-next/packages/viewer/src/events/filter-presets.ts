import type { SimEventType } from "./types.js";
import { eventDisplayMap } from "./display-config.js";

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
export const allEventTypes = Object.keys(eventDisplayMap) as SimEventType[];
