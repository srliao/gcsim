import { resolveElementColor, TeamStrip } from "@gcsim/avatar";
import { Card, CardContent, cn } from "@gcsim/primitives";
import type { Sim } from "@gcsim/types";
import { MetadataChip } from "@gcsim/viewer";
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
        {/* Team portraits (compact CharacterCards via TeamStrip) */}
        <div data-testid="preview-team">
          <TeamStrip team={characters} />
        </div>

        {/* Metadata chips */}
        <div className="flex flex-wrap gap-1.5" data-testid="preview-metadata">
          {data.modified && (
            <span data-testid="preview-modified">
              <MetadataChip label="Mod" value="Modified" tone="accent" />
            </span>
          )}

          <span data-testid="preview-dps">
            <MetadataChip label="DPS" value={formatDPS(dps?.mean)} mono tone="accent" />
          </span>

          {iterations != null && (
            <span data-testid="preview-iterations">
              <MetadataChip label="Iter" value={iterations.toLocaleString()} mono />
            </span>
          )}

          <span data-testid="preview-mode">
            <MetadataChip label="Mode" value={formatMode(data.mode)} />
          </span>

          {hasWarnings && (
            <span data-testid="preview-warnings">
              <MetadataChip label="Warn" value="Warnings" tone="info" />
            </span>
          )}
        </div>

        {/* DPS breakdown per character (element-colored bars) */}
        {stats?.character_dps && stats.character_dps.length > 0 && (
          <div className="flex flex-col gap-1" data-testid="preview-char-dps">
            {stats.character_dps.map((charDps, idx) => {
              const char = characters[idx];
              const name = char?.name ?? `Character ${idx + 1}`;
              const element = char?.element;
              const maxDps = Math.max(...(stats.character_dps ?? []).map((d) => d.mean ?? 0));
              const barWidth =
                charDps.mean != null && maxDps > 0 ? (charDps.mean / maxDps) * 100 : 0;
              const barColor = resolveElementColor(element);

              return (
                <div
                  key={name}
                  className="flex items-center gap-2 text-xs"
                  data-element={element ?? undefined}
                >
                  <span className="w-20 truncate text-[var(--fg-1)] capitalize">{name}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--bg-2)]">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${barWidth}%`, background: barColor }}
                    />
                  </div>
                  <span className="w-16 text-right font-mono tabular-nums text-[var(--fg-1)]">
                    {formatDPS(charDps.mean)}
                  </span>
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
