import { FieldTimeBar } from "@gcsim/viewer";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Viewer/Charts/FieldTimeBar",
  component: FieldTimeBar,
  tags: ["autodocs"],
} satisfies Meta<typeof FieldTimeBar>;

export default meta;
type Story = StoryObj<typeof meta>;

const fourPyroVape = {
  fieldTime: [{ mean: 25 }, { mean: 50 }, { mean: 15 }, { mean: 10 }],
  characterNames: ["Hu Tao", "Xingqiu", "Bennett", "Zhongli"],
  characterElements: ["pyro", "hydro", "pyro", "geo"],
};

export const Default: Story = {
  args: fourPyroVape,
};

export const TwoCharacters: Story = {
  args: {
    fieldTime: [{ mean: 70 }, { mean: 30 }],
    characterNames: ["Raiden", "Sara"],
    characterElements: ["electro", "electro"],
  },
};

export const EvenSplit: Story = {
  args: {
    fieldTime: [{ mean: 25 }, { mean: 25 }, { mean: 25 }, { mean: 25 }],
    characterNames: ["Anemo", "Cryo", "Hydro", "Dendro"],
    characterElements: ["anemo", "cryo", "hydro", "dendro"],
  },
};

export const MissingElements: Story = {
  args: {
    fieldTime: [{ mean: 60 }, { mean: 40 }],
    characterNames: ["First", "Second"],
  },
};

export const NoData: Story = {
  args: {
    fieldTime: undefined,
    characterNames: [],
    characterElements: [],
  },
};
