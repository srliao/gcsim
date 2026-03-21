import type { Sim } from "@gcsim/types";
import { EnergyChart } from "@gcsim/viewer";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Viewer/Charts/EnergyChart",
  component: EnergyChart,
  tags: ["autodocs"],
} satisfies Meta<typeof EnergyChart>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockEnergy: Sim.SourceStats[] = [
  {
    sources: {
      "Elemental Skill": { mean: 150 },
      "Elemental Burst": { mean: 45 },
    },
  },
  {
    sources: {
      "Elemental Skill": { mean: 120 },
    },
  },
];

export const Default: Story = {
  args: {
    data: mockEnergy,
    characterNames: ["Hu Tao", "Xingqiu"],
  },
};

export const NoData: Story = {
  args: {
    data: undefined,
    characterNames: ["Hu Tao", "Xingqiu"],
  },
};
