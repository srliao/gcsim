import { TeamDisplay } from "@gcsim/avatar";
import { Badge, Card, CardContent, cn } from "@gcsim/primitives";
import type { Sim } from "@gcsim/types";
import { useEffect } from "react";

export interface PreviewCardProps {
  data: Sim.SimResults;
  onImageLoaded?: () => void;
  className?: string;
}

function formatDPS(value: number | undefined): string {
  if (value == null) return "—";
  return value.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

function formatMode(mode: number | undefined): string {
  switch (mode) {
    case 0:
      return "Duration";
    case 1:
      return "TTK";
    default:
      return "Unknown";
  }
}

export function PreviewCard({ data, onImageLoaded, className }: PreviewCardProps) {
  const characters = data.character_details ?? [];
  const stats = data.statistics;
  const dps = stats?.dps;
  const iterations = stats?.iterations ?? data.simulator_settings?.iterations;
  const hasWarnings = stats?.warnings ? Object.values(stats.warnings).some(Boolean) : false;

  // Signal image readiness for headless capture (no actual images to load currently)
  useEffect(() => {
    onImageLoaded?.();
  }, [onImageLoaded]);

  return (
    <Card className={cn("w-full max-w-[600px]", className)} data-testid="preview-card">
      <CardContent className="flex flex-col gap-3 p-4">
        {/* Team portraits */}
        <div data-testid="preview-team">
          <TeamDisplay characters={characters} />
        </div>

        {/* Metadata badges */}
        <div className="flex flex-wrap gap-1.5" data-testid="preview-metadata">
          {data.modified && (
            <Badge variant="destructive" data-testid="preview-modified">
              Modified
            </Badge>
          )}

          <Badge variant="secondary" data-testid="preview-dps">
            DPS: {formatDPS(dps?.mean)}
          </Badge>

          {iterations != null && (
            <Badge variant="outline" data-testid="preview-iterations">
              {iterations.toLocaleString()} iterations
            </Badge>
          )}

          <Badge variant="outline" data-testid="preview-mode">
            {formatMode(data.mode)}
          </Badge>

          {hasWarnings && (
            <Badge variant="destructive" data-testid="preview-warnings">
              Warnings
            </Badge>
          )}
        </div>

        {/* DPS breakdown per character */}
        {stats?.character_dps && stats.character_dps.length > 0 && (
          <div className="flex flex-col gap-1" data-testid="preview-char-dps">
            {stats.character_dps.map((charDps, idx) => {
              const name = characters[idx]?.name ?? `Character ${idx + 1}`;
              const maxDps = Math.max(...(stats.character_dps ?? []).map((d) => d.mean ?? 0));
              const barWidth =
                charDps.mean != null && maxDps > 0 ? (charDps.mean / maxDps) * 100 : 0;

              return (
                <div key={name} className="flex items-center gap-2 text-xs">
                  <span className="w-20 truncate capitalize">{name}</span>
                  <div className="bg-muted h-2 flex-1 overflow-hidden rounded-full">
                    <div
                      className="bg-primary h-full rounded-full"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                  <span className="w-16 text-right tabular-nums">{formatDPS(charDps.mean)}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Images loaded signal for headless capture */}
        <span id="images_loaded" className="hidden" />
      </CardContent>
    </Card>
  );
}
