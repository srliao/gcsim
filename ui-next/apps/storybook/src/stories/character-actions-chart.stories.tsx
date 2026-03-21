import type { Sim } from "@gcsim/types";
import { CharacterActionsChart } from "@gcsim/viewer";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Viewer/Charts/CharacterActionsChart",
  component: CharacterActionsChart,
  tags: ["autodocs"],
} satisfies Meta<typeof CharacterActionsChart>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockActions: Sim.SourceStats[] = [
  {
    sources: {
      normal: { mean: 150 },
      skill: { mean: 30 },
      burst: { mean: 10 },
      dash: { mean: 10 },
    },
  },
  {
    sources: {
      normal: { mean: 45 },
      skill: { mean: 22 },
      burst: { mean: 10 },
    },
  },
];

export const Default: Story = {
  args: {
    data: mockActions,
    characterNames: ["Hu Tao", "Xingqiu"],
  },
};

export const NoData: Story = {
  args: {
    data: undefined,
    characterNames: ["Hu Tao", "Xingqiu"],
  },
};
