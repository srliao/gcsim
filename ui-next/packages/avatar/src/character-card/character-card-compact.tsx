import { cn } from "@gcsim/primitives";
import type { Sim } from "@gcsim/types";
import { artifactSrc, avatarSrc, weaponSrc } from "../lib/avatars.js";
import { groupSets } from "./character-card.js";

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

export interface CharacterCardCompactProps {
  char: Sim.Character;
  /** Square edge in pixels. Defaults to 84. */
  size?: number;
  className?: string;
}

/**
 * Square compact variant of `CharacterCard`. Used in recent-runs strips,
 * hover summaries, and the Sample viewer player track. Background is the
 * element-tinted starry texture; character art fills the body. A notched
 * pill in the top-right shows `lvl N` over `Cn Rn`. Weapon + 1–2 artifact
 * icons stack in the bottom-left.
 */
export function CharacterCardCompact({ char, size = 84, className }: CharacterCardCompactProps) {
  const element = char.element || undefined;
  const elementColor = resolveElementColor(element);
  const sets = groupSets(char.sets).slice(0, 2);
  const isSplit = sets.length > 1;
  const charSrc = avatarSrc(char.name);
  const wpnSrc = char.weapon?.name ? weaponSrc(char.weapon.name) : null;
  const refine = char.weapon?.refine ?? 1;

  const bgStyle: React.CSSProperties = {
    background: [
      `radial-gradient(100% 80% at 100% 100%,
        color-mix(in oklch, ${elementColor} 80%, transparent) 0%,
        color-mix(in oklch, ${elementColor} 30%, transparent) 50%,
        transparent 90%)`,
      `url("/assets/misc/overlay.jpg") center / cover no-repeat`,
      `color-mix(in oklch, ${elementColor} 22%, var(--bg-2))`,
    ].join(", "),
    backgroundBlendMode: "normal, screen, normal",
  };

  return (
    <div
      data-testid="character-card-compact"
      data-element={element}
      title={char.name}
      className={cn(
        "relative isolate flex-none overflow-hidden rounded-md border border-[var(--line-2)]",
        className,
      )}
      style={{ width: size, height: size }}
    >
      {/* Element-tinted starry background */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-0"
        data-testid="character-card-compact-bg"
        style={bgStyle}
      />
      {/* Subtle top/bottom dimming for legibility */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-[1]"
        style={{
          background:
            "linear-gradient(180deg, oklch(0 0 0 / 0.55) 0%, transparent 35%, transparent 60%, oklch(0 0 0 / 0.5) 100%)",
        }}
      />
      {/* Character art fills */}
      <img
        data-testid="character-card-compact-art"
        src={charSrc}
        alt={char.name}
        loading="lazy"
        className="absolute inset-0 z-[2] h-full w-full object-cover"
        style={{ objectPosition: "50% 12%" }}
      />
      {/* Top-right notched pill: lvl / Cn Rn */}
      <div
        data-testid="character-card-compact-stats"
        className="pointer-events-none absolute top-0 right-0 z-[3] flex flex-col items-end gap-px rounded-bl border-b border-l border-white/10 bg-black/60 px-1.5 pt-1 pb-1 text-right text-[var(--fg-0)]"
      >
        <span
          className="font-mono text-[8px] leading-tight font-semibold whitespace-nowrap text-white/95 tabular-nums"
          style={{ textShadow: "0 1px 1px oklch(0 0 0 / 0.5)" }}
        >
          lvl {char.level}
        </span>
        <span
          className="font-mono text-[8px] leading-tight font-semibold whitespace-nowrap text-white/70 tabular-nums"
          style={{ textShadow: "0 1px 1px oklch(0 0 0 / 0.5)" }}
        >
          C{char.cons ?? 0} R{refine}
        </span>
      </div>
      {/* Bottom-left icons: weapon + 1–2 artifact icons */}
      <div className="absolute bottom-1 left-1 z-[3] flex gap-0.5">
        <IconTile kind="weapon" src={wpnSrc} />
        {sets.map((s) => (
          <IconTile
            key={s.name}
            kind="artifact"
            src={artifactSrc(s.name)}
            title={`${s.name} ${s.count}pc`}
            badge={isSplit ? String(s.count) : undefined}
          />
        ))}
      </div>
    </div>
  );
}

function IconTile({
  kind,
  src,
  title,
  badge,
}: {
  kind: "weapon" | "artifact";
  src: string | null;
  title?: string;
  badge?: string;
}) {
  return (
    <div
      data-testid="character-card-compact-icon"
      data-kind={kind}
      title={title}
      className="relative inline-flex h-[22px] w-[22px] items-center justify-center overflow-hidden rounded-[4px] border border-white/10 bg-black/55"
    >
      {src ? (
        <img src={src} alt="" loading="lazy" className="h-full w-full object-contain" />
      ) : null}
      {badge != null ? (
        <span className="absolute -top-[3px] -right-[3px] rounded-[3px] border border-[var(--line-2)] bg-[var(--bg-0)] px-[3px] py-px font-mono text-[8px] leading-none text-[var(--fg-0)] tabular-nums">
          {badge}
        </span>
      ) : null}
    </div>
  );
}
