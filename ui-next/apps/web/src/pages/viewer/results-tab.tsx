import type { Sim } from "@gcsim/types";
import {
  CharacterActionsChart,
  CharacterDpsPie,
  CumulativeDamage,
  DamageTimeline,
  DetailedMetricTile,
  type DetailedMetricTileTone,
  DistributionChart,
  DPSCard,
  ElementDpsChart,
  ElementDpsPie,
  EndingEnergyChart,
  EnergyChart,
  FieldTimeChart,
  formatSummaryStat,
  MetadataChip,
  ReactionsChart,
  SourceDpsChart,
  TargetAuraUptimeChart,
  TargetInfoCard,
  TeamHeader,
  Warnings,
} from "@gcsim/viewer";
import { Component, type ErrorInfo, type ReactNode } from "react";

interface ResultsTabProps {
  results: Sim.SimResults;
}

interface ChartErrorBoundaryProps {
  children: ReactNode;
}

interface ChartErrorBoundaryState {
  hasError: boolean;
}

class ChartErrorBoundary extends Component<ChartErrorBoundaryProps, ChartErrorBoundaryState> {
  constructor(props: ChartErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ChartErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Chart render error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-muted-foreground flex h-48 items-center justify-center rounded border border-dashed p-4 text-sm">
          Failed to render chart
        </div>
      );
    }
    return this.props.children;
  }
}

interface RollupConfig {
  label: string;
  tone: DetailedMetricTileTone;
  stat?: Sim.SummaryStat;
  unit?: string;
  fractionDigits?: number;
}

function buildRollups(stats: Sim.Statistics | undefined): RollupConfig[] {
  return [
    { label: "Damage Per Second (DPS)", tone: "pyro", stat: stats?.dps },
    { label: "Energy Per Second (EPS)", tone: "cryo", stat: stats?.eps, fractionDigits: 2 },
    { label: "Reactions Per Second (RPS)", tone: "electro", stat: stats?.rps, fractionDigits: 2 },
    { label: "Healing Per Second (HPS)", tone: "anemo", stat: stats?.hps },
    { label: "Shield HP (SHP)", tone: "geo", stat: stats?.shp },
    {
      label: "Duration",
      tone: "dendro",
      stat: stats?.duration,
      unit: "s",
      fractionDigits: 1,
    },
  ];
}

export function ResultsTab({ results }: ResultsTabProps) {
  const stats = results.statistics;
  const characters = results.character_details ?? [];
  const characterNames = characters.map((c) => c.name);
  const characterDps = stats?.character_dps ?? [];
  const totalDps = characterDps.reduce((sum, s) => sum + (s.mean ?? 0), 0);
  const rollups = buildRollups(stats);

  return (
    <div data-testid="results-tab" className="space-y-6 overflow-y-auto">
      {/* Metadata */}
      <div data-testid="metadata-section" className="flex flex-wrap items-center gap-2">
        {stats?.iterations != null && (
          <MetadataChip label="iter" value={stats.iterations.toLocaleString()} mono />
        )}
        {results.mode != null && (
          <MetadataChip label="mode" value={results.mode === 0 ? "SL" : "TTK"} tone="accent" />
        )}
        {results.sim_version && (
          <MetadataChip label="ver" value={results.sim_version} mono tone="info" />
        )}
        {results.build_date && <MetadataChip label="build" value={results.build_date} mono />}
      </div>

      {/* Warnings */}
      <Warnings warnings={stats?.warnings} />

      {/* Team header */}
      <TeamHeader characters={characters} />

      {/* Rollup stats */}
      <div
        data-testid="rollup-section"
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
      >
        {rollups.map(({ label, tone, stat, unit, fractionDigits }) => {
          const formatted = formatSummaryStat(stat, { fractionDigits });
          return (
            <DetailedMetricTile
              key={label}
              label={label}
              tone={tone}
              value={formatted.value}
              unit={unit}
              stats={formatted.stats}
            />
          );
        })}
      </div>

      {/* Character DPS cards */}
      {characterDps.length > 0 && (
        <div data-testid="dps-cards-section" className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {characters.map((char, i) => {
            const stat = characterDps[i];
            const mean = stat?.mean ?? 0;
            const share = totalDps > 0 ? mean / totalDps : 0;
            return (
              <DPSCard
                key={char.name}
                char={char}
                dps={mean}
                share={share}
                mean={mean}
                std={stat?.sd ?? 0}
              />
            );
          })}
        </div>
      )}

      {/* Target info */}
      <TargetInfoCard enemies={results.target_details} />

      {/* Charts */}
      <div data-testid="charts-section" className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartErrorBoundary>
          {stats?.dps && <DistributionChart stat={stats.dps} label="DPS Distribution" />}
        </ChartErrorBoundary>
        <ChartErrorBoundary>
          <DamageTimeline buckets={stats?.damage_buckets} />
        </ChartErrorBoundary>
        <ChartErrorBoundary>
          <CumulativeDamage data={stats?.cumu_damage} characterNames={characterNames} />
        </ChartErrorBoundary>
        <ChartErrorBoundary>
          <CharacterDpsPie characterDps={stats?.character_dps} characterNames={characterNames} />
        </ChartErrorBoundary>
        <ChartErrorBoundary>
          <ElementDpsPie elementDps={stats?.element_dps} />
        </ChartErrorBoundary>
        <ChartErrorBoundary>
          <ElementDpsChart data={stats?.dps_by_element} characterNames={characterNames} />
        </ChartErrorBoundary>
        <ChartErrorBoundary>
          <SourceDpsChart data={stats?.source_dps} characterNames={characterNames} />
        </ChartErrorBoundary>
        <ChartErrorBoundary>
          <CharacterActionsChart data={stats?.character_actions} characterNames={characterNames} />
        </ChartErrorBoundary>
        <ChartErrorBoundary>
          <FieldTimeChart fieldTime={stats?.field_time} characterNames={characterNames} />
        </ChartErrorBoundary>
        <ChartErrorBoundary>
          <EnergyChart data={stats?.total_source_energy} characterNames={characterNames} />
        </ChartErrorBoundary>
        <ChartErrorBoundary>
          <EndingEnergyChart endStats={stats?.end_stats} characterNames={characterNames} />
        </ChartErrorBoundary>
        <ChartErrorBoundary>
          <ReactionsChart data={stats?.source_reactions} characterNames={characterNames} />
        </ChartErrorBoundary>
        <ChartErrorBoundary>
          <TargetAuraUptimeChart data={stats?.target_aura_uptime} />
        </ChartErrorBoundary>
      </div>
    </div>
  );
}
