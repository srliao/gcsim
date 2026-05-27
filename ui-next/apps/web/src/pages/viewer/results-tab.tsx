import { CharacterCard, CharacterCardEmpty } from "@gcsim/avatar";
import { Badge, Tabs, TabsList, TabsTrigger } from "@gcsim/primitives";
import type { Sim } from "@gcsim/types";
import {
  CharacterActionsChart,
  CharacterDpsPie,
  ChartShell,
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
  FieldTimeBar,
  FrameTrack,
  type FrameTrackEvent,
  formatSummaryStat,
  MetadataChip,
  ReactionsChart,
  SourceDpsChart,
  TargetAuraUptimeChart,
  TargetInfoCard,
  Warnings,
} from "@gcsim/viewer";
import { Component, type ErrorInfo, type ReactNode, useState } from "react";
import { useViewerStore } from "../../stores/viewer-store";

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

type DpsMetric = "dps" | "dmg" | "cnt";

export function ResultsTab({ results }: ResultsTabProps) {
  const stats = results.statistics;
  const characters = results.character_details ?? [];
  const characterNames = characters.map((c) => c.name);
  const characterElements = characters.map((c) => c.element ?? "");
  const characterDps = stats?.character_dps ?? [];
  const totalDps = characterDps.reduce((sum, s) => sum + (s.mean ?? 0), 0);
  const rollups = buildRollups(stats);
  const setActiveTab = useViewerStore((s) => s.setActiveTab);

  // TODO(phase 6 follow-up): metric switch (DPS/Total dmg/Hits) wires to
  // different stat sources. For now this just toggles a UI label.
  const [dpsMetric, setDpsMetric] = useState<DpsMetric>("dps");

  // TODO(phase 6 follow-up): swap-delay + energy + created chips when
  // SimResults exposes them.

  // Build a sample-frame events array for FrameTrack from sample data.
  // TODO(phase 8): wire FrameTrack to real sample data with events.
  const sampleEvents: FrameTrackEvent[] = [];
  const sampleFrames = 0;
  const hasSampleData = sampleEvents.length > 0 && sampleFrames > 0;

  return (
    <div data-testid="results-tab" className="space-y-6 overflow-y-auto">
      {/* Character banner — 4 CharacterCards (or empties to fill 4 slots) */}
      <section
        data-testid="character-banner"
        className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4"
      >
        {characters.slice(0, 4).map((char) => (
          <CharacterCard key={char.name} char={char} />
        ))}
        {Array.from({ length: Math.max(0, 4 - characters.length) }).map((_, i) => {
          const slotNumber = characters.length + i + 1;
          return <CharacterCardEmpty key={`empty-${slotNumber}`} slot={slotNumber} />;
        })}
      </section>

      {/* Metadata strip */}
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

      {/* 6 Rollup tiles — 3x2 grid */}
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

      {/* Target Info + DPS Distribution side-by-side */}
      <div data-testid="info-split" className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <TargetInfoCard enemies={results.target_details} />
        <ChartErrorBoundary>
          {stats?.dps && <DistributionChart stat={stats.dps} label="DPS Distribution" />}
        </ChartErrorBoundary>
      </div>

      {/* Per-character DPS */}
      {characterDps.length > 0 && (
        <section data-testid="per-character-dps">
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <p className="text-[10px] font-medium tracking-wider text-[var(--fg-2)] uppercase">
                Per-character
              </p>
              <h3 className="text-base font-semibold text-[var(--fg-0)]">DPS contribution</h3>
            </div>
            <Tabs value={dpsMetric} onValueChange={(v) => setDpsMetric(v as DpsMetric)}>
              <TabsList size="sm" data-testid="dps-metric-tabs">
                <TabsTrigger value="dps">DPS</TabsTrigger>
                <TabsTrigger value="dmg">Total dmg</TabsTrigger>
                <TabsTrigger value="cnt">Hits</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <div
            data-testid="dps-cards-section"
            className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4"
          >
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
        </section>
      )}

      {/* Main chart grid — 6 column responsive layout */}
      <section data-testid="charts-section" className="grid grid-cols-6 gap-4">
        {/* Field time (half) */}
        <div className="col-span-6 md:col-span-3">
          <ChartErrorBoundary>
            <ChartShell title="Field time" subtitle="On-field share per character" height={140}>
              <FieldTimeBar
                fieldTime={stats?.field_time}
                characterNames={characterNames}
                characterElements={characterElements}
              />
            </ChartShell>
          </ChartErrorBoundary>
        </div>

        {/* Damage share donut (half) */}
        <div className="col-span-6 md:col-span-3">
          <ChartErrorBoundary>
            <CharacterDpsPie characterDps={stats?.character_dps} characterNames={characterNames} />
          </ChartErrorBoundary>
        </div>

        {/* Cumulative damage (full) */}
        <div className="col-span-6">
          <ChartErrorBoundary>
            <CumulativeDamage data={stats?.cumu_damage} characterNames={characterNames} />
          </ChartErrorBoundary>
        </div>

        {/* Damage timeline (full) */}
        <div className="col-span-6">
          <ChartErrorBoundary>
            <DamageTimeline buckets={stats?.damage_buckets} />
          </ChartErrorBoundary>
        </div>

        {/* DPS by element bars (two-thirds) */}
        <div className="col-span-6 md:col-span-4">
          <ChartErrorBoundary>
            <ElementDpsChart data={stats?.dps_by_element} characterNames={characterNames} />
          </ChartErrorBoundary>
        </div>

        {/* Element share donut (one-third) */}
        <div className="col-span-6 md:col-span-2">
          <ChartErrorBoundary>
            <ElementDpsPie elementDps={stats?.element_dps} />
          </ChartErrorBoundary>
        </div>

        {/* Character actions (full) */}
        <div className="col-span-6">
          <ChartErrorBoundary>
            <CharacterActionsChart
              data={stats?.character_actions}
              characterNames={characterNames}
            />
          </ChartErrorBoundary>
        </div>

        {/* Sample frame timeline preview (full) — clicks navigate to Sample tab */}
        <div className="col-span-6">
          <ChartErrorBoundary>
            {/* biome-ignore lint/a11y/useKeyWithClickEvents: the deep-link to the
                Sample tab is a convenience; keyboard users still have the Tabs
                in the sticky header. */}
            {/* biome-ignore lint/a11y/noStaticElementInteractions: same as above. */}
            <div
              data-testid="sample-frame-preview"
              onClick={() => setActiveTab("sample")}
              className="cursor-pointer"
            >
              <ChartShell
                title="Sample frame timeline"
                subtitle="Single iteration — switch to Sample tab for full scrubber"
                badge={
                  results.sample_seed ? (
                    <Badge tone="accent">seed {results.sample_seed}</Badge>
                  ) : undefined
                }
                height={hasSampleData ? 120 : 96}
              >
                {hasSampleData ? (
                  <FrameTrack frames={sampleFrames} cursor={0} events={sampleEvents} />
                ) : null}
              </ChartShell>
            </div>
          </ChartErrorBoundary>
        </div>
      </section>

      {/* Additional charts — preserved from the original layout but not part
          of the redesign mock. Keeps backwards compatibility with the full
          13-chart set while honouring the new 6-col grid for the spec'd 8. */}
      <section data-testid="additional-charts">
        <div className="mb-3">
          <p className="text-[10px] font-medium tracking-wider text-[var(--fg-2)] uppercase">
            Supplementary
          </p>
          <h3 className="text-base font-semibold text-[var(--fg-0)]">Additional charts</h3>
        </div>
        <div className="grid grid-cols-6 gap-4">
          <div className="col-span-6 md:col-span-3">
            <ChartErrorBoundary>
              <ReactionsChart data={stats?.source_reactions} characterNames={characterNames} />
            </ChartErrorBoundary>
          </div>
          <div className="col-span-6 md:col-span-3">
            <ChartErrorBoundary>
              <EnergyChart data={stats?.total_source_energy} characterNames={characterNames} />
            </ChartErrorBoundary>
          </div>
          <div className="col-span-6 md:col-span-3">
            <ChartErrorBoundary>
              <EndingEnergyChart endStats={stats?.end_stats} characterNames={characterNames} />
            </ChartErrorBoundary>
          </div>
          <div className="col-span-6 md:col-span-3">
            <ChartErrorBoundary>
              <SourceDpsChart data={stats?.source_dps} characterNames={characterNames} />
            </ChartErrorBoundary>
          </div>
          <div className="col-span-6">
            <ChartErrorBoundary>
              <TargetAuraUptimeChart data={stats?.target_aura_uptime} />
            </ChartErrorBoundary>
          </div>
        </div>
      </section>
    </div>
  );
}
