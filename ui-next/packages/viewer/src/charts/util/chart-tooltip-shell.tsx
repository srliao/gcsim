import type { ReactNode } from "react";

export interface ChartTooltipShellProps {
  /** Tooltip heading, typically the X-axis label or row name. */
  title?: ReactNode;
  /** Tooltip body — typically a list of key/value rows. */
  children?: ReactNode;
}

/**
 * Shared visual wrapper for Recharts custom tooltips. Renders with the
 * `--bg-2` raised surface, a `--line-2` hairline border, and uses the
 * `--fg-1`/`--fg-2` text tokens for content. Mono-tabular values are the
 * caller's responsibility.
 */
export function ChartTooltipShell({ title, children }: ChartTooltipShellProps) {
  return (
    <div
      data-testid="chart-tooltip"
      className="rounded-md border border-[var(--line-2)] bg-[var(--bg-2)] p-2 text-xs text-[var(--fg-1)] shadow-md"
    >
      {title != null ? <div className="mb-1 font-medium text-[var(--fg-1)]">{title}</div> : null}
      {children}
    </div>
  );
}
