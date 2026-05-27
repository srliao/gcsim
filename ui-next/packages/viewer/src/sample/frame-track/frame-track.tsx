import { type MouseEvent, useMemo } from "react";
import { elementColor } from "../../charts/util/colors.js";

export interface FrameTrackEvent {
  /** Start frame (inclusive). */
  start: number;
  /** Length in frames. */
  length: number;
  /** Character slot (0-3). */
  row: 0 | 1 | 2 | 3;
  /** Element identifier (used for color via `elementColor`). */
  element: string;
  /** Short hover/title text. */
  label: string;
}

export interface FrameTrackProps {
  /** Total frame count for the run. */
  frames: number;
  /** Current cursor frame (clamped to `[0, frames]`). */
  cursor: number;
  /** Notified with a frame index when the user clicks the surface. */
  onCursorChange?: (frame: number) => void;
  /** Event ribbon entries — placed in their `row` lane. */
  events: FrameTrackEvent[];
  /** Total height in pixels (default 120). */
  height?: number;
}

const LANES = [0, 1, 2, 3] as const;
const LANE_PAD = 2;

function clamp(n: number, lo: number, hi: number): number {
  if (n < lo) return lo;
  if (n > hi) return hi;
  return n;
}

/**
 * SVG timeline scrubber for sample-frame data. Renders four character lanes
 * stacked vertically; each event is a rectangle at `start/frames` × `length/frames`.
 * A vertical cursor line marks the current frame.
 */
export function FrameTrack({
  frames,
  cursor,
  onCursorChange,
  events,
  height = 120,
}: FrameTrackProps) {
  const safeFrames = Math.max(frames, 1);
  const clampedCursor = clamp(cursor, 0, safeFrames);
  const cursorPct = (clampedCursor / safeFrames) * 100;

  const eventsByRow = useMemo(() => {
    const grouped: Record<number, FrameTrackEvent[]> = { 0: [], 1: [], 2: [], 3: [] };
    for (const ev of events) {
      const row = clamp(ev.row, 0, 3) as 0 | 1 | 2 | 3;
      grouped[row].push(ev);
    }
    return grouped;
  }, [events]);

  const laneHeight = (height - LANE_PAD * (LANES.length - 1)) / LANES.length;

  const handleClick = (e: MouseEvent<SVGRectElement>) => {
    if (!onCursorChange) return;
    const rect = e.currentTarget.getBoundingClientRect();
    if (rect.width <= 0) return;
    const ratio = (e.clientX - rect.left) / rect.width;
    const clampedRatio = clamp(ratio, 0, 1);
    onCursorChange(Math.round(clampedRatio * safeFrames));
  };

  return (
    <div data-testid="frame-track" className="w-full">
      <svg
        data-testid="frame-track-svg"
        width="100%"
        height={height}
        role="img"
        aria-label={`Frame track from 0 to ${safeFrames}`}
        className="block w-full select-none"
        style={{ background: "var(--bg-2)" }}
      >
        <title>{`Frame track from 0 to ${safeFrames}`}</title>
        {/* Lane backgrounds */}
        {LANES.map((row) => {
          const y = row * (laneHeight + LANE_PAD);
          return (
            <g key={row} data-testid={`frame-track-lane-${row}`} data-row={row}>
              <rect
                x={0}
                y={y}
                width="100%"
                height={laneHeight}
                fill="var(--bg-1, transparent)"
                stroke="var(--line-1)"
                strokeWidth={1}
              />
              {eventsByRow[row].map((ev, i) => {
                const x = (ev.start / safeFrames) * 100;
                const w = (ev.length / safeFrames) * 100;
                return (
                  <rect
                    // biome-ignore lint/suspicious/noArrayIndexKey: stable per-render order
                    key={`${row}-${i}`}
                    data-testid="frame-track-event"
                    data-row={row}
                    data-element={ev.element}
                    x={`${x}%`}
                    y={y + 2}
                    width={`${w}%`}
                    height={laneHeight - 4}
                    fill={elementColor(ev.element)}
                    fillOpacity={0.85}
                    rx={2}
                  >
                    <title>{ev.label}</title>
                  </rect>
                );
              })}
            </g>
          );
        })}

        {/* Click surface – placed above lanes so the click target is the full svg */}
        {/* TODO(Phase 8): add keyboard scrubbing (arrow keys / home / end) to FrameTrack. */}
        {/* biome-ignore lint/a11y/noStaticElementInteractions: SVG <rect> hit target; keyboard scrubbing tracked in a follow-up (Phase 8) */}
        <rect
          data-testid="frame-track-surface"
          x={0}
          y={0}
          width="100%"
          height={height}
          fill="transparent"
          onClick={handleClick}
          style={{ cursor: onCursorChange ? "pointer" : "default" }}
        />

        {/* Cursor line on top */}
        <line
          data-testid="frame-track-cursor"
          x1={`${cursorPct}%`}
          x2={`${cursorPct}%`}
          y1={0}
          y2={height}
          stroke="var(--accent)"
          strokeWidth={2}
          pointerEvents="none"
        />
      </svg>
    </div>
  );
}
