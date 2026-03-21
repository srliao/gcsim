import type { Sim } from "@gcsim/types";
import { ReactionsChart } from "@gcsim/viewer";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Viewer/Charts/ReactionsChart",
  component: ReactionsChart,
  tags: ["autodocs"],
} satisfies Meta<typeof ReactionsChart>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockReactions: Sim.SourceStats[] = [
  {
    sources: {
      Vaporize: { mean: 50 },
      Overloaded: { mean: 10 },
    },
  },
  {
    sources: {
      Vaporize: { mean: 20 },
    },
  },
];

export const Default: Story = {
  args: {
    data: mockReactions,
    characterNames: ["Hu Tao", "Xingqiu"],
  },
};

export const NoData: Story = {
  args: {
    data: undefined,
    characterNames: ["Hu Tao", "Xingqiu"],
  },
};
