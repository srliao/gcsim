import { Card, CardContent, CardHeader, cn } from "@gcsim/primitives";
import type { ReactNode } from "react";

export interface ChartShellProps {
  /** Chart title. Rendered in the header. */
  title: string;
  /** Optional subtitle line below the title. Renders in `--fg-2`. */
  subtitle?: string;
  /** Right header slot 1, typically a `<Badge>` for chart metadata. */
  badge?: ReactNode;
  /** Right header slot 2, typically a `<Button>` or selector. */
  action?: ReactNode;
  /** Optional bordered footer slot used for legends or extra metadata. */
  footer?: ReactNode;
  /** Chart content. Pass `null`/`false` to render the empty state. */
  children: ReactNode;
  /** Body height in pixels. Defaults to 300. */
  height?: number;
  className?: string;
}

/**
 * Wraps every viewer chart with a consistent header (title + subtitle +
 * badge + action) and an optional bordered footer (legends).
 *
 * Successor to the legacy `ChartCard` — existing charts will be migrated
 * in Phase 3b-ii (Recharts skinning).
 */
export function ChartShell({
  title,
  subtitle,
  badge,
  action,
  footer,
  children,
  height = 300,
  className,
}: ChartShellProps) {
  const hasChildren = children != null && children !== false;

  return (
    <Card className={cn("w-full", className)} data-testid="chart-shell">
      <CardHeader className="flex flex-row items-start justify-between gap-3 pb-2">
        <div className="flex min-w-0 flex-col gap-0.5">
          <h3
            data-testid="chart-shell-title"
            className="text-sm leading-tight font-medium text-[var(--fg-0)]"
          >
            {title}
          </h3>
          {subtitle ? (
            <p
              data-testid="chart-shell-subtitle"
              className="font-mono text-[11px] leading-tight text-[var(--fg-2)]"
            >
              {subtitle}
            </p>
          ) : null}
        </div>
        {(badge || action) && (
          <div data-testid="chart-shell-actions" className="flex shrink-0 items-center gap-2">
            {badge}
            {action}
          </div>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        {hasChildren ? (
          <div data-testid="chart-shell-body" style={{ width: "100%", height }}>
            {children}
          </div>
        ) : (
          <div
            data-testid="chart-shell-empty"
            className="flex items-center justify-center text-sm text-[var(--fg-2)]"
            style={{ height }}
          >
            No data available
          </div>
        )}
        {footer ? (
          <div
            data-testid="chart-shell-footer"
            className="mt-3 border-t border-[var(--line-1)] pt-3 text-xs text-[var(--fg-2)]"
          >
            {footer}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
