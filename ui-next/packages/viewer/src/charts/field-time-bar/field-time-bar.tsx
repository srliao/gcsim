import type { Sim } from "@gcsim/types";
import { ChartShell } from "../../chart-shell/chart-shell.js";
import { elementColor } from "../util/colors.js";

export interface FieldTimeBarProps {
  /** Per-character field-time stats (mean values used for proportion). */
  fieldTime?: Sim.FloatStat[];
  /** Display names for each character, indexed identically to `fieldTime`. */
  characterNames?: string[];
  /**
   * Element identifier for each character (e.g. "pyro"). Used to color the
   * segment. Unknown / missing entries fall back to `physical`.
   */
  characterElements?: string[];
}

export interface FieldTimeBarSegment {
  name: string;
  element: string;
  value: number;
  /** Integer percentage 0-100 (sum of all segments == 100). */
  pct: number;
}

/**
 * Transforms raw field-time stats into one segment per character. Percentages
 * are rounded so they sum to exactly 100; the first segment absorbs rounding
 * drift.
 */
export function transformFieldTimeBar(
  fieldTime: Sim.FloatStat[] | undefined,
  characterNames: string[] = [],
  characterElements: string[] = [],
): FieldTimeBarSegment[] {
  if (!fieldTime?.length) return [];

  const totalMean = fieldTime.reduce((sum, stat) => sum + (stat.mean ?? 0), 0);
  if (totalMean <= 0) return [];

  // Round percentages first, then adjust the largest segment to make them sum to 100.
  const raw = fieldTime.map((stat) => ((stat.mean ?? 0) / totalMean) * 100);
  const rounded = raw.map((v) => Math.round(v));
  const drift = 100 - rounded.reduce((s, v) => s + v, 0);
  if (drift !== 0) {
    let largest = 0;
    for (let i = 1; i < raw.length; i++) {
      if (raw[i] > raw[largest]) largest = i;
    }
    rounded[largest] += drift;
  }

  return fieldTime.map((stat, i) => ({
    name: characterNames[i] ?? `Character ${i + 1}`,
    element: (characterElements[i] ?? "physical").toLowerCase(),
    value: stat.mean ?? 0,
    pct: rounded[i],
  }));
}

/**
 * Horizontal stacked-flex bar showing per-character field time. Each segment
 * width is proportional to that character's share of the total field time and
 * is filled with the character's element color.
 *
 * Supplements (does not replace) `FieldTimeChart`, which renders the same data
 * as a donut/pie.
 */
export function FieldTimeBar({ fieldTime, characterNames, characterElements }: FieldTimeBarProps) {
  const segments = transformFieldTimeBar(fieldTime, characterNames, characterElements);
  const hasData = segments.length > 0;

  return (
    <div data-testid="field-time-bar">
      <ChartShell title="Field Time" height={64}>
        {hasData ? (
          <div
            className="flex h-full w-full overflow-hidden rounded-md border border-[var(--line-1)]"
            role="img"
            aria-label="Field time distribution"
          >
            {segments.map((seg) => (
              <div
                key={seg.name}
                data-testid="field-time-bar-segment"
                data-element={seg.element}
                title={`${seg.name} ${seg.pct}%`}
                className="flex min-w-0 items-center justify-center px-2 text-[11px]"
                style={{
                  flexBasis: `${seg.pct}%`,
                  background: elementColor(seg.element),
                  color: "var(--bg-1, #000)",
                }}
              >
                <span className="truncate font-mono tabular-nums">
                  {seg.name} {seg.pct}%
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div
            data-testid="field-time-bar-empty"
            className="flex h-full items-center justify-center text-xs text-[var(--fg-2)]"
          >
            No field-time data
          </div>
        )}
      </ChartShell>
    </div>
  );
}
