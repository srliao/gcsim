import type { SimEvent } from "./types.js";

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
