import { cn } from "@gcsim/primitives";
import type { Sim } from "@gcsim/types";
import { artifactSrc, avatarSrc, weaponSrc } from "../lib/avatars.js";

/**
 * Element name (lowercase) → CSS var carrying the element's primary color.
 * Used to tint the starry texture background. Unknown / blank elements fall
 * back to a neutral graphite tone via `var(--bg-3)`.
 */
const ELEMENT_TOKENS: Record<string, string> = {
  anemo: "var(--el-anemo)",
  geo: "var(--el-geo)",
  electro: "var(--el-electro)",
  hydro: "var(--el-hydro)",
  pyro: "var(--el-pyro)",
  cryo: "var(--el-cryo)",
  dendro: "var(--el-dendro)",
  physical: "var(--el-physical)",
};

function resolveElementColor(element?: string | null): string {
  if (!element) return "var(--bg-3)";
  return ELEMENT_TOKENS[element.toLowerCase()] ?? "var(--bg-3)";
}

interface GroupedSet {
  name: string;
  count: number;
}

/**
 * Convert the `Sim.Set` map (`{ [setKey: string]: pieceCount }`) into an ordered
 * array of `{ name, count }` entries. We emit entries with `count >= 2` only
 * (single-piece set bonuses are rarely meaningful), sorted by count descending
 * then name. Exported for unit testing.
 */
export function groupSets(sets: Sim.Set | undefined | null): GroupedSet[] {
  if (!sets) return [];
  const entries: GroupedSet[] = [];
  for (const [name, count] of Object.entries(sets)) {
    if (typeof count === "number" && count >= 2) {
      entries.push({ name, count });
    }
  }
  entries.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  return entries;
}

export interface CharacterCardProps {
  char: Sim.Character;
  className?: string;
}

/**
 * Big read-only character card. Top half is a 4:3 portrait area with the
 * character art bleeding to the bottom-right over an element-tinted starry
 * texture. Top-left overlay shows Cn / name / Lvl / Tal. Below the portrait
 * sit a sets row (single 4-pc → full-width; 2+2 split → two halves) and
 * a single weapon row.
 *
 * For empty slots in a team, render `<CharacterCardEmpty slot={i} />` instead.
 */
export function CharacterCard({ char, className }: CharacterCardProps) {
  const element = char.element || undefined;
  const elementColor = resolveElementColor(element);
  const sets = groupSets(char.sets);
  const isSplit = sets.length === 2;
  const charSrc = avatarSrc(char.name);
  const weaponName = char.weapon?.name || null;
  const wpnSrc = weaponName ? weaponSrc(weaponName) : null;

  const portraitBgStyle: React.CSSProperties = {
    background: [
      `radial-gradient(120% 110% at 90% 110%,
        color-mix(in oklch, ${elementColor} 80%, transparent) 0%,
        color-mix(in oklch, ${elementColor} 40%, transparent) 35%,
        transparent 80%)`,
      `url("/assets/misc/overlay.jpg") center / cover no-repeat`,
      `color-mix(in oklch, ${elementColor} 18%, var(--bg-2))`,
    ].join(", "),
    backgroundBlendMode: "normal, screen, normal",
  };

  return (
    <article
      data-testid="character-card"
      data-element={element}
      className={cn("relative flex flex-col gap-1", className)}
    >
      {/* Portrait area — 4:3 */}
      <div className="relative isolate aspect-[4/3] overflow-hidden rounded-lg border border-[var(--line-2)] bg-[var(--bg-1)]">
        {/* Element-tinted starry background */}
        <div
          aria-hidden="true"
          className="absolute inset-0 z-0"
          data-testid="character-card-bg"
          style={portraitBgStyle}
        />
        {/* Top-left vignette for legibility */}
        <div
          aria-hidden="true"
          className="absolute inset-0 z-[1]"
          style={{
            background:
              "radial-gradient(120% 80% at 0% 0%, oklch(0 0 0 / 0.55), transparent 60%), linear-gradient(180deg, oklch(0 0 0 / 0.18) 0%, transparent 30%)",
          }}
        />
        {/* Character art bleeds bottom-right */}
        <img
          data-testid="character-card-art"
          src={charSrc}
          alt={char.name}
          loading="lazy"
          className="pointer-events-none absolute right-[-10%] bottom-[-8%] z-[2] h-auto w-[90%]"
          style={{ filter: "drop-shadow(0 6px 20px oklch(0 0 0 / 0.5))" }}
        />
        {/* Overlay: cons + name + stats */}
        <div className="absolute top-0 left-0 z-[3] flex flex-col gap-1 px-3.5 py-3">
          <span
            data-testid="character-card-cons"
            className="inline-flex self-start rounded border border-white/10 bg-black/55 px-1.5 py-px font-mono text-[10px] leading-tight font-semibold tracking-normal text-[var(--fg-0)] tabular-nums"
            style={{ textShadow: "0 1px 1px oklch(0 0 0 / 0.4)" }}
          >
            C{char.cons ?? 0}
          </span>
          <h3
            data-testid="character-card-name"
            className="mt-0.5 text-[18px] leading-tight font-semibold tracking-tight text-[var(--fg-0)] capitalize"
            style={{ textShadow: "0 1px 3px oklch(0 0 0 / 0.6)" }}
          >
            {char.name}
          </h3>
          <div
            className="mt-1.5 flex flex-col gap-0.5 font-mono text-[11px] tabular-nums text-white/85"
            style={{ textShadow: "0 1px 2px oklch(0 0 0 / 0.5)" }}
          >
            <span data-testid="character-card-level">
              <span className="text-white/55">Lvl</span> {char.level}/{char.max_level}
            </span>
            <span data-testid="character-card-talents">
              <span className="text-white/55">Tal</span> {char.talents?.attack ?? 0}/
              {char.talents?.skill ?? 0}/{char.talents?.burst ?? 0}
            </span>
          </div>
        </div>
      </div>

      {/* Sets row(s) */}
      <div
        data-testid="character-card-sets"
        data-split={isSplit ? "true" : "false"}
        className={cn("flex gap-1", isSplit ? "flex-row" : "flex-col")}
      >
        {sets.length === 0 ? (
          <SetRow name="No set" count={0} src={null} placeholder empty />
        ) : (
          sets.map((s) => (
            <SetRow
              key={s.name}
              name={s.name}
              count={s.count}
              src={artifactSrc(s.name)}
              flex1={isSplit}
            />
          ))
        )}
      </div>

      {/* Weapon row */}
      <WeaponRow
        name={weaponName}
        refine={char.weapon?.refine ?? null}
        level={char.weapon?.level}
        maxLevel={char.weapon?.max_level}
        src={wpnSrc}
      />
    </article>
  );
}

function SetRow({
  name,
  count,
  src,
  placeholder = false,
  empty = false,
  flex1 = false,
}: {
  name: string;
  count: number;
  src: string | null;
  placeholder?: boolean;
  empty?: boolean;
  flex1?: boolean;
}) {
  return (
    <div
      data-testid="character-card-set-row"
      className={cn(
        "grid grid-cols-[36px_1fr] items-center gap-2.5 rounded-md border border-[var(--line-2)] bg-[var(--bg-1)] px-2.5 py-2",
        flex1 && "min-w-0 flex-1",
      )}
    >
      <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-sm border border-[var(--line-1)] bg-black/25">
        {src && !placeholder ? (
          <img src={src} alt="" loading="lazy" className="block h-full w-full object-contain" />
        ) : (
          <div
            aria-hidden="true"
            className="h-[60%] w-[60%] rounded-[4px]"
            style={{
              background:
                "radial-gradient(circle at 30% 30%, oklch(1 0 0 / 0.18), transparent 60%), var(--bg-3)",
            }}
          />
        )}
      </div>
      <div className="flex min-w-0 flex-col gap-px">
        <div
          className={cn(
            "overflow-hidden text-ellipsis whitespace-nowrap text-xs font-medium capitalize",
            empty ? "text-[var(--fg-3)]" : "text-[var(--fg-0)]",
          )}
        >
          {name}
        </div>
        {!empty ? (
          <div className="font-mono text-[10px] text-[var(--fg-2)] tabular-nums">{count}-pc</div>
        ) : null}
      </div>
    </div>
  );
}

function WeaponRow({
  name,
  refine,
  level,
  maxLevel,
  src,
}: {
  name: string | null;
  refine: number | null;
  level?: number;
  maxLevel?: number;
  src: string | null;
}) {
  const hasWeapon = Boolean(name);
  return (
    <div
      data-testid="character-card-weapon-row"
      className="grid grid-cols-[36px_1fr] items-center gap-2.5 rounded-md border border-[var(--line-2)] bg-[var(--bg-1)] px-2.5 py-2"
    >
      <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-sm border border-[var(--line-1)] bg-black/25">
        {src ? (
          <img src={src} alt="" loading="lazy" className="block h-full w-full object-contain" />
        ) : (
          <div
            aria-hidden="true"
            className="h-[60%] w-[60%] rounded-[4px]"
            style={{
              background:
                "linear-gradient(135deg, oklch(1 0 0 / 0.15), transparent 60%), var(--bg-3)",
            }}
          />
        )}
      </div>
      <div className="flex min-w-0 flex-col gap-px">
        <div
          className={cn(
            "overflow-hidden text-ellipsis whitespace-nowrap text-xs font-medium capitalize",
            hasWeapon ? "text-[var(--fg-0)]" : "text-[var(--fg-3)]",
          )}
        >
          {name ?? "—"}
        </div>
        {hasWeapon ? (
          <div className="font-mono text-[10px] text-[var(--fg-2)] tabular-nums">
            R{refine ?? 1}
            {level != null && maxLevel != null ? ` · Lvl ${level}/${maxLevel}` : ""}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export interface CharacterCardEmptyProps {
  /** Slot index (1-based) shown in the empty-state copy. */
  slot?: number;
  className?: string;
}

/**
 * Empty-slot placeholder, sized to roughly match a full CharacterCard
 * portrait area. Use for team slots the parser hasn't filled.
 */
export function CharacterCardEmpty({ slot, className }: CharacterCardEmptyProps) {
  return (
    <div
      data-testid="character-card-empty"
      className={cn(
        "flex min-h-[350px] flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-[var(--line-2)] text-center text-xs text-[var(--fg-3)]",
        className,
      )}
      style={{ background: "oklch(1 0 0 / 0.01)" }}
    >
      <span>slot {slot ?? "—"} · not defined in code</span>
    </div>
  );
}
