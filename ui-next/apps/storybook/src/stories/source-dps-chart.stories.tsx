import { SourceDpsChart } from "@gcsim/viewer";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Viewer/Charts/SourceDpsChart",
  component: SourceDpsChart,
  tags: ["autodocs"],
} satisfies Meta<typeof SourceDpsChart>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockSourceDps = [
  {
    sources: {
      "Normal Attack": { mean: 18000 },
      "Elemental Skill": { mean: 12000 },
      "Elemental Burst": { mean: 5100 },
    },
  },
  {
    sources: {
      "Normal Attack": { mean: 4000 },
      "Elemental Skill": { mean: 9000 },
      "Elemental Burst": { mean: 2150 },
    },
  },
];

export const Default: Story = {
  args: {
    data: mockSourceDps,
    characterNames: ["Hu Tao", "Xingqiu"],
  },
};

export const NoData: Story = {
  args: {
    data: undefined,
    characterNames: ["Hu Tao", "Xingqiu"],
  },
};
