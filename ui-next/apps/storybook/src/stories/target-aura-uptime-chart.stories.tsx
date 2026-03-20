import { TargetAuraUptimeChart } from "@gcsim/viewer";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Viewer/Charts/TargetAuraUptimeChart",
  component: TargetAuraUptimeChart,
  tags: ["autodocs"],
} satisfies Meta<typeof TargetAuraUptimeChart>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockAuraUptime = [
  {
    sources: {
      Pyro: { mean: 0.45 },
      Hydro: { mean: 0.35 },
      Electro: { mean: 0.1 },
    },
  },
];

export const Default: Story = {
  args: {
    data: mockAuraUptime,
  },
};

export const NoData: Story = {
  args: {
    data: undefined,
  },
};
