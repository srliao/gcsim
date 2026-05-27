import { cn } from "@gcsim/primitives";
import type { Sim } from "@gcsim/types";
import { avatarSrc, normalizeKey } from "../lib/avatars.js";
import { resolveElementColor } from "../lib/element-style.js";

function resolveChar(char: string | Sim.Character): {
  name: string;
  key: string;
  element?: string;
} {
  if (typeof char === "string") {
    return { name: char, key: normalizeKey(char) };
  }
  return {
    name: char.name,
    key: normalizeKey(char.name),
    element: char.element || undefined,
  };
}

export interface PortraitProps {
  /** Character key (e.g. `'hutao'`) or a parsed `Sim.Character`. */
  char: string | Sim.Character;
  /** Square edge length in pixels. Defaults to 48. */
  size?: number;
  /** Optional constellation count rendered as a small chip in the top-left. */
  cons?: number | null;
  /** When true (default), draws a hairline border around the portrait. */
  frame?: boolean;
  className?: string;
}

/**
 * Atomic character marker — a square avatar over an element-tinted starry
 * texture. The element is communicated by background tint only; there is
 * deliberately no element badge (see design-system.md principle 08).
 */
export function Portrait({ char, size = 48, cons, frame = true, className }: PortraitProps) {
  const resolved = resolveChar(char);
  const element = resolved.element;
  const elementColor = resolveElementColor(element);
  const src = avatarSrc(resolved.name);

  // Compose the tinted-starry-texture background inline so the component
  // ships without a global CSS dependency. Mirrors the recipe in
  // ui-next/docs/design-system.md § 06.
  const backgroundStyle: React.CSSProperties = {
    width: size,
    height: size,
    background: [
      // Element wash (radial)
      `radial-gradient(100% 90% at 60% 110%,
        color-mix(in oklch, ${elementColor} 70%, transparent) 0%,
        color-mix(in oklch, ${elementColor} 25%, transparent) 55%,
        transparent 90%)`,
      // Starry overlay (screen-blended)
      `url("/assets/misc/overlay.jpg") center / cover no-repeat`,
      // Base tinted graphite
      `color-mix(in oklch, ${elementColor} 22%, var(--bg-2))`,
    ].join(", "),
    backgroundBlendMode: "normal, screen, normal",
  };

  return (
    <div
      data-testid="portrait"
      data-element={element ?? undefined}
      title={resolved.name}
      className={cn(
        "relative isolate inline-flex shrink-0 overflow-hidden rounded-md",
        frame && "border border-[var(--line-2)]",
        className,
      )}
      style={backgroundStyle}
    >
      <img
        data-testid="portrait-img"
        src={src}
        alt={resolved.name}
        loading="lazy"
        className="relative z-[1] block h-full w-full object-cover [object-position:50%_14%]"
      />
      {cons != null ? (
        <span
          data-testid="portrait-cons"
          className="absolute top-0.5 left-0.5 z-[2] inline-flex items-center rounded-[3px] border border-white/10 bg-black/60 px-1 py-px font-mono text-[8px] leading-tight font-semibold text-[var(--fg-0)] tabular-nums"
        >
          C{cons}
        </span>
      ) : null}
    </div>
  );
}
