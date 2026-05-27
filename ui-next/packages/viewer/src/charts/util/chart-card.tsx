import { Card, CardContent, CardHeader, CardTitle, cn } from "@gcsim/primitives";

/**
 * @deprecated Use `ChartShell` from `@gcsim/viewer` (`src/chart-shell/`) instead.
 * All 13 in-tree chart components were migrated to `ChartShell` in Phase 3b-ii;
 * `ChartCard` remains exported only so external/downstream callers don't break.
 * Delete once all consumers have migrated.
 */
export interface ChartCardProps {
  title: string;
  children: React.ReactNode;
  height?: number;
  selector?: React.ReactNode;
  className?: string;
}

export function ChartCard({ title, children, height = 300, selector, className }: ChartCardProps) {
  const hasChildren = children != null && children !== false;

  return (
    <Card className={cn("w-full", className)} data-testid="chart-card">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-medium" data-testid="chart-title">
          {title}
        </CardTitle>
        {selector}
      </CardHeader>
      <CardContent>
        {hasChildren ? (
          <div style={{ width: "100%", height }} data-testid="chart-container">
            {children}
          </div>
        ) : (
          <div
            className="text-muted-foreground flex items-center justify-center"
            style={{ height }}
            data-testid="chart-empty"
          >
            No data available
          </div>
        )}
      </CardContent>
    </Card>
  );
}
