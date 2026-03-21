import type { Sim } from "@gcsim/types";
import {
  CharacterActionsChart,
  CharacterDpsPie,
  Commit,
  CumulativeDamage,
  DamageTimeline,
  DistributionChart,
  DPSCard,
  ElementDpsChart,
  ElementDpsPie,
  EndingEnergyChart,
  EnergyChart,
  FieldTimeChart,
  Iterations,
  Mode,
  ReactionsChart,
  RollupCard,
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

export function ResultsTab({ results }: ResultsTabProps) {
  const stats = results.statistics;
  const characters = results.character_details ?? [];
  const characterNames = characters.map((c) => c.name);
  const maxDps = stats?.character_dps?.reduce((max, s) => Math.max(max, s.mean ?? 0), 0) ?? 0;

  return (
    <div data-testid="results-tab" className="space-y-6 overflow-y-auto">
      {/* Metadata */}
      <div data-testid="metadata-section" className="flex flex-wrap items-center gap-3">
        <Iterations iterations={stats?.iterations} />
        <Mode mode={results.mode} />
        <Commit simVersion={results.sim_version} buildDate={results.build_date} />
      </div>

      {/* Warnings */}
      <Warnings warnings={stats?.warnings} />

      {/* Team header */}
      <TeamHeader characters={characters} />

      {/* Rollup stats */}
      <div
        data-testid="rollup-section"
        className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4"
      >
        <RollupCard label="DPS" stat={stats?.dps} />
        <RollupCard label="Duration" stat={stats?.duration} />
        <RollupCard label="RPS" stat={stats?.rps} />
        <RollupCard label="EPS" stat={stats?.eps} />
        <RollupCard label="HPS" stat={stats?.hps} />
        <RollupCard label="SHP" stat={stats?.shp} />
      </div>

      {/* Character DPS cards */}
      {stats?.character_dps && stats.character_dps.length > 0 && (
        <div data-testid="dps-cards-section" className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {characters.map((char, i) => (
            <DPSCard
              key={char.name}
              characterName={char.name}
              stat={stats.character_dps?.[i]}
              maxDPS={maxDps}
            />
          ))}
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
