import type { FrameGroup, SimEvent } from "./types.js";

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
    const group = frameMap.get(frame);
    if (!group) continue;
    if (activeCharMap.has(frame)) {
      const activeChar = activeCharMap.get(frame);
      if (activeChar !== undefined) {
        lastActive = activeChar;
      }
    }
    group.activeCharacter = lastActive;
  }

  return frameOrder.map((f) => {
    const group = frameMap.get(f);
    return group || { frame: f, activeCharacter: -1, slots: [] };
  });
}
