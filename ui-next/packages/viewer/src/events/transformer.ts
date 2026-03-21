import type { Sim } from "@gcsim/types";
import type {
  ActionEvent,
  CalcEvent,
  DamageEvent,
  ElementEvent,
  EnergyEvent,
  GenericEvent,
  SimEvent,
  StatusEvent,
} from "./types.js";

type TransformFn = (log: Sim.LogDetails) => SimEvent;

/**
 * Sort log.logs entries by log.ordering if present, then rebuild the logs object
 * so JSON.stringify preserves insertion order for the raw JSON display.
 */
function sortLogsByOrdering(log: Sim.LogDetails): Sim.LogDetails {
  if (!log.ordering) return log;
  const entries = Object.entries(log.logs);
  const ordering = log.ordering;
  entries.sort((a, b) => (ordering[a[0]] ?? 0) - (ordering[b[0]] ?? 0));
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
        existing = log.logs.existing.map((x: unknown) => String(x).replace(/: (.+)/, " ($1)"));
        message += ` to [${existing.join(" ")}]`;
      } else {
        message += " [no aura]";
      }
      if (Array.isArray(log.logs.after)) {
        after = log.logs.after.map((x: unknown) => String(x).replace(/: (.+)/, " ($1)"));
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
    elementSubtype,
    appliedElement,
    oldElement,
    refreshedElement,
    existing,
    after,
    target,
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

function transformCalc(log: Sim.LogDetails): CalcEvent {
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
