import { CharacterDpsPie } from "@gcsim/viewer";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Viewer/Charts/CharacterDpsPie",
  component: CharacterDpsPie,
  tags: ["autodocs"],
} satisfies Meta<typeof CharacterDpsPie>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockCharDps = [
  { min: 20000, max: 45000, mean: 35100, sd: 3200 },
  { min: 10000, max: 25000, mean: 15150, sd: 2100 },
];

export const Default: Story = {
  args: {
    characterDps: mockCharDps,
    characterNames: ["Hu Tao", "Xingqiu"],
  },
};

export const NoData: Story = {
  args: {
    characterDps: undefined,
    characterNames: ["Hu Tao", "Xingqiu"],
  },
};
