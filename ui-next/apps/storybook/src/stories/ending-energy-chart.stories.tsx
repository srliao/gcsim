import { EndingEnergyChart } from "@gcsim/viewer";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Viewer/Charts/EndingEnergyChart",
  component: EndingEnergyChart,
  tags: ["autodocs"],
} satisfies Meta<typeof EndingEnergyChart>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockEndStats = [
  { ending_energy: { min: 38, max: 43, mean: 40.5, sd: 1.2 } },
  { ending_energy: { min: 60, max: 70, mean: 65.2, sd: 2.1 } },
];

export const Default: Story = {
  args: {
    endStats: mockEndStats,
    characterNames: ["Hu Tao", "Xingqiu"],
  },
};

export const NoData: Story = {
  args: {
    endStats: undefined,
    characterNames: ["Hu Tao", "Xingqiu"],
  },
};
