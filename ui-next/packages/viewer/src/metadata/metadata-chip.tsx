import { cn } from "@gcsim/primitives";

export type MetadataChipTone = "neutral" | "accent" | "info";

export interface MetadataChipProps {
  /** Short label, rendered mono uppercase. */
  label: string;
  /** Value text. */
  value: string;
  /** When true, the value renders in monospace with tabular numerics. */
  mono?: boolean;
  /** Visual tone. Defaults to `'neutral'`. */
  tone?: MetadataChipTone;
  className?: string;
}

const toneStyles: Record<MetadataChipTone, string> = {
  neutral: "bg-[var(--bg-2)] border-[var(--line-2)] text-[var(--fg-1)]",
  accent: "bg-[var(--accent-soft)] border-[var(--accent-line)] text-[var(--accent)]",
  info: "bg-[var(--info-soft)] border-[var(--info)]/40 text-[var(--info)]",
};

const labelToneStyles: Record<MetadataChipTone, string> = {
  neutral: "text-[var(--fg-2)]",
  accent: "text-[var(--accent)]/70",
  info: "text-[var(--info)]/80",
};

/**
 * Inline label/value pill used in the viewer metadata strip.
 *
 * Renders as a small bordered chip with a mono uppercase label followed by a
 * value. Pass `mono` to render the value in tabular monospace (good for
 * version strings, counts, dates).
 */
export function MetadataChip({
  label,
  value,
  mono = false,
  tone = "neutral",
  className,
}: MetadataChipProps) {
  return (
    <span
      data-testid="metadata-chip"
      data-tone={tone}
      className={cn(
        "inline-flex h-6 items-center gap-1.5 rounded-md border px-2 text-xs",
        toneStyles[tone],
        className,
      )}
    >
      <span
        data-testid="metadata-chip-label"
        className={cn(
          "font-mono text-[10px] leading-none font-medium tracking-wider uppercase",
          labelToneStyles[tone],
        )}
      >
        {label}
      </span>
      <span
        data-testid="metadata-chip-value"
        className={cn(
          "leading-none",
          mono && "font-mono text-[11px] tabular-nums",
          !mono && "text-xs",
        )}
      >
        {value}
      </span>
    </span>
  );
}
