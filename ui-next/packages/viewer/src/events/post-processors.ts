import type { FrameGroup, SimEvent, StatusEvent } from "./types.js";

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
      expirations.get(frame)?.push({
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
