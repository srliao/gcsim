import { DistributionChart } from "@gcsim/viewer";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Viewer/Charts/DistributionChart",
  component: DistributionChart,
  tags: ["autodocs"],
} satisfies Meta<typeof DistributionChart>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockDpsStat = {
  min: 35000,
  max: 65000,
  mean: 50250,
  sd: 4200,
  q1: 47500,
  q2: 50000,
  q3: 53000,
  histogram: [5, 15, 50, 150, 300, 250, 130, 60, 30, 10],
};

export const DpsDistribution: Story = {
  args: {
    stat: mockDpsStat,
    label: "DPS Distribution",
  },
};

const mockRpsStat = {
  min: 5,
  max: 25,
  mean: 14.8,
  sd: 3.1,
  q1: 12,
  q2: 15,
  q3: 17,
  histogram: [8, 20, 65, 180, 350, 280, 120, 45, 18, 6],
};

export const RpsDistribution: Story = {
  args: {
    stat: mockRpsStat,
    label: "RPS Distribution",
    accentColor: "#10B981",
  },
};

export const NoData: Story = {
  args: {
    stat: { min: 0, max: 0, mean: 0, sd: 0, histogram: [] },
    label: "DPS Distribution",
  },
};
