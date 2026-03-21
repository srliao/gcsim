import type { SimEventType } from "./types.js";

export interface EventDisplayConfig {
  color: string;
  icon: string;
  label: string;
}

export const eventDisplayMap: Record<SimEventType, EventDisplayConfig> = {
  damage: { color: "#2563EB", icon: "local_fire_department", label: "Damage" },
  energy: { color: "#036345", icon: "local_cafe", label: "Energy" },
  status: { color: "#902D89", icon: "iso", label: "Status" },
  element: { color: "#3F60A6", icon: "bolt", label: "Element" },
  action: { color: "#AB5F45", icon: "play_arrow", label: "Action" },
  calc: { color: "#9D174D", icon: "calculate", label: "Calc" },
  snapshot: { color: "#6366F1", icon: "photo_camera", label: "Snapshot" },
  pre_damage_mods: { color: "#818CF8", icon: "dynamic_form", label: "Pre-Damage Mods" },
  cooldown: { color: "#0D9488", icon: "timer", label: "Cooldown" },
  hitlag: { color: "#A27B5C", icon: "sports_martial_arts", label: "Hitlag" },
  enemy: { color: "#632626", icon: "mood_bad", label: "Enemy" },
  user: { color: "#5F7161", icon: "comment", label: "User" },
  shield: { color: "#6B7280", icon: "shield", label: "Shield" },
  heal: { color: "#6B7280", icon: "healing", label: "Heal" },
  hurt: { color: "#6B7280", icon: "coronavirus", label: "Hurt" },
  construct: { color: "#6B7280", icon: "apartment", label: "Construct" },
  icd: { color: "#6B7280", icon: "timer", label: "ICD" },
  character: { color: "#6B7280", icon: "person", label: "Character" },
  weapon: { color: "#6B7280", icon: "swords", label: "Weapon" },
  artifact: { color: "#6B7280", icon: "diamond", label: "Artifact" },
  sim: { color: "#6B7280", icon: "settings", label: "Sim" },
  player: { color: "#6B7280", icon: "person", label: "Player" },
  warning: { color: "#EAB308", icon: "warning", label: "Warning" },
  debug: { color: "#6B7280", icon: "bug_report", label: "Debug" },
  generic: { color: "#6B7280", icon: "circle", label: "Event" },
};

export function getEventDisplay(type: SimEventType): EventDisplayConfig {
  return eventDisplayMap[type] ?? eventDisplayMap.generic;
}
