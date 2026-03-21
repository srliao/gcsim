import type { Sim } from "@gcsim/types";
import { ElementDpsChart } from "@gcsim/viewer";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Viewer/Charts/ElementDpsChart",
  component: ElementDpsChart,
  tags: ["autodocs"],
} satisfies Meta<typeof ElementDpsChart>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockElementData: Sim.ElementStats[] = [
  { elements: { pyro: { mean: 30000 }, physical: { mean: 5100 } } },
  { elements: { hydro: { mean: 14000 }, physical: { mean: 1150 } } },
];

export const Default: Story = {
  args: {
    data: mockElementData,
    characterNames: ["Hu Tao", "Xingqiu"],
  },
};

export const NoData: Story = {
  args: {
    data: undefined,
    characterNames: ["Hu Tao", "Xingqiu"],
  },
};
