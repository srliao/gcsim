import { FieldTimeChart } from "@gcsim/viewer";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Viewer/Charts/FieldTimeChart",
  component: FieldTimeChart,
  tags: ["autodocs"],
} satisfies Meta<typeof FieldTimeChart>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockFieldTime = [
  { min: 50, max: 80, mean: 65.3, sd: 5.1 },
  { min: 15, max: 45, mean: 29.9, sd: 4.8 },
];

export const Default: Story = {
  args: {
    fieldTime: mockFieldTime,
    characterNames: ["Hu Tao", "Xingqiu"],
  },
};

export const NoData: Story = {
  args: {
    fieldTime: undefined,
    characterNames: ["Hu Tao", "Xingqiu"],
  },
};
