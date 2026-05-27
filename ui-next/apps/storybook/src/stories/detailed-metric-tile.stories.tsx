import { DetailedMetricTile, formatSummaryStat } from "@gcsim/viewer";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Viewer/DetailedMetricTile",
  component: DetailedMetricTile,
  tags: ["autodocs"],
} satisfies Meta<typeof DetailedMetricTile>;

export default meta;
type Story = StoryObj<typeof meta>;

const dpsStats = {
  min: "35,000",
  max: "65,000",
  std: "4,200",
  p25: "47,000",
  p50: "50,000",
  p75: "53,000",
};

export const Pyro: Story = {
  args: {
    label: "Damage Per Second (DPS)",
    tone: "pyro",
    value: "50,251",
    stats: dpsStats,
  },
};

export const Hydro: Story = {
  args: {
    label: "Healing Per Second (HPS)",
    tone: "hydro",
    value: "1,234",
    stats: dpsStats,
  },
};

export const Electro: Story = {
  args: {
    label: "Energy Per Second (RPS)",
    tone: "electro",
    value: "1.83",
    stats: {
      min: "1.2",
      max: "2.4",
      std: "0.21",
      p25: "1.5",
      p50: "1.8",
      p75: "2.1",
    },
  },
};

export const Cryo: Story = {
  args: {
    label: "Reactions Per Second",
    tone: "cryo",
    value: "0.84",
    stats: {
      min: "0.5",
      max: "1.1",
      std: "0.12",
      p25: "0.7",
      p50: "0.8",
      p75: "0.95",
    },
  },
};

export const Anemo: Story = {
  args: {
    label: "Shielding Per Second",
    tone: "anemo",
    value: "950",
    stats: dpsStats,
  },
};

export const Geo: Story = {
  args: {
    label: "Shielding HP",
    tone: "geo",
    value: "12,400",
    stats: dpsStats,
  },
};

export const Dendro: Story = {
  args: {
    label: "Duration",
    tone: "dendro",
    value: "95.2",
    unit: "s",
    stats: {
      min: "85.0",
      max: "105.4",
      std: "3.1",
      p25: "93.1",
      p50: "95.0",
      p75: "97.3",
    },
  },
};

export const Accent: Story = {
  args: {
    label: "Iterations",
    tone: "accent",
    value: "1,000",
    stats: dpsStats,
  },
};

export const FromSummaryStat: Story = {
  args: {
    label: "DPS",
    tone: "pyro",
    value: "",
    stats: dpsStats,
  },
  render: () => {
    const formatted = formatSummaryStat({
      min: 35000,
      max: 65000,
      mean: 50250.5,
      sd: 4200.3,
      q1: 47000,
      q2: 50000,
      q3: 53000,
    });
    return (
      <DetailedMetricTile
        label="Damage Per Second (DPS)"
        tone="pyro"
        value={formatted.value}
        stats={formatted.stats}
      />
    );
  },
};

export const Grid: Story = {
  args: { label: "X", tone: "pyro", value: "0", stats: dpsStats },
  render: () => (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
      <DetailedMetricTile label="DPS" tone="pyro" value="50,251" stats={dpsStats} />
      <DetailedMetricTile label="EPS" tone="cryo" value="0.84" stats={dpsStats} />
      <DetailedMetricTile label="RPS" tone="electro" value="1.83" stats={dpsStats} />
      <DetailedMetricTile label="HPS" tone="anemo" value="950" stats={dpsStats} />
      <DetailedMetricTile label="SHP" tone="geo" value="12,400" stats={dpsStats} />
      <DetailedMetricTile label="Duration" tone="dendro" value="95.2" unit="s" stats={dpsStats} />
    </div>
  ),
};
