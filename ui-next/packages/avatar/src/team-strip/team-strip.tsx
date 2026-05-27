import { cn } from "@gcsim/primitives";
import type { Sim } from "@gcsim/types";
import { CharacterCardCompact } from "../character-card/character-card-compact.js";

export interface TeamStripProps {
  /** 0–4 characters. Missing slots render as empty placeholder squares. */
  team: Sim.Character[];
  /** Square edge length (px) for each card. Defaults to 84. */
  size?: number;
  className?: string;
}

/**
 * Horizontal strip of (up to) 4 `CharacterCardCompact`s. Read-only — used in
 * viewer hero banners, recent-runs strips, and the Sample viewer player
 * track. Missing slots (length < 4) are rendered as 84px dashed-border
 * placeholders so the strip keeps its full team-sized footprint.
 */
export function TeamStrip({ team, size = 84, className }: TeamStripProps) {
  const slots: (Sim.Character | null)[] = Array.from({ length: 4 }, (_, i) => team[i] ?? null);
  return (
    <div data-testid="team-strip" className={cn("flex items-center gap-2", className)}>
      {slots.map((c, i) => {
        const slotKey = c ? `${c.name}-${i}` : `empty-${i}`;
        if (c) {
          return <CharacterCardCompact key={slotKey} char={c} size={size} />;
        }
        return (
          <div
            key={slotKey}
            data-testid="team-strip-empty-slot"
            title={`Empty slot ${i + 1}`}
            className="flex flex-none items-center justify-center rounded-md border border-dashed border-[var(--line-2)] text-base text-[var(--fg-3)]"
            style={{ width: size, height: size, background: "oklch(1 0 0 / 0.02)" }}
          >
            —
          </div>
        );
      })}
    </div>
  );
}
